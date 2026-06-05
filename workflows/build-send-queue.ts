/**
 * build-send-queue.ts
 *
 * Reads all approved drafts from Message_Drafts and Connection_Follow_Queue,
 * builds a clean formatted send queue, and:
 *   1. Logs it to Discord so you can see it without opening the sheet
 *   2. Writes a Send_Queue tab in Google Sheets — one row per message, sorted
 *      by lead temperature (hot first)
 *   3. Marks source rows as "queued_for_send" so they don't appear again
 *
 * Run manually:  npm run workflow:send-queue
 * n8n trigger:   POST https://bbsleadgen.ngrok.app/pipeline/send-queue
 *
 * After sending a message manually on LinkedIn/email, flip the Send_Queue
 * row status to "sent" — the agent will update the Leads tab accordingly.
 */

import { readRows, writeRow } from "../services/google-sheets";
import { sendDiscordNotification } from "../services/discord";
import { logger } from "../utils";
import { env } from "../config/env";

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${env.GOOGLE_SHEETS_ID}/edit`;

type Row = Record<string, unknown>;

function col(row: Row, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}

const TEMP_ORDER: Record<string, number> = {
  hot: 0, qualified: 1, warm: 2, cold: 3, "": 4,
};

function sortByTemp(a: Row, b: Row): number {
  const ta = TEMP_ORDER[col(a, "lead_temperature", "temperature").toLowerCase()] ?? 4;
  const tb = TEMP_ORDER[col(b, "lead_temperature", "temperature").toLowerCase()] ?? 4;
  return ta - tb;
}

export async function run(): Promise<void> {
  logger.info("workflow:build-send-queue", "Reading approved drafts...");

  const [{ rows: msgRows }, { rows: connRows }] = await Promise.all([
    readRows("Message_Drafts",          "status", "approved"),
    readRows("Connection_Follow_Queue", "status", "approved"),
  ]);

  const totalApproved = msgRows.length + connRows.length;

  if (totalApproved === 0) {
    logger.info("workflow:build-send-queue", "No approved drafts — nothing to queue");
    await sendDiscordNotification({
      subject: "Send queue is empty",
      body: "No approved drafts in Message_Drafts or Connection_Follow_Queue.\nFlip a draft status to `approved` in the sheet to add it to the queue.",
      priority: "normal",
    });
    return;
  }

  // Sort hot leads first
  const allDrafts: Array<Row & { _source: string }> = [
    ...msgRows.map(r  => ({ ...r, _source: "Message_Drafts" })),
    ...connRows.map(r => ({ ...r, _source: "Connection_Follow_Queue" })),
  ].sort(sortByTemp);

  logger.info("workflow:build-send-queue", `Building send queue — ${totalApproved} draft(s)`);

  const sendQueueRows: Row[] = [];
  const now = new Date().toISOString().split("T")[0];

  for (const draft of allDrafts) {
    const name       = col(draft, "name", "lead_name");
    const company    = col(draft, "company");
    const platform   = col(draft, "platform");
    const temp       = col(draft, "lead_temperature", "temperature");
    const message    = col(draft, "initial_message", "draft_content", "draft");
    const leadId     = col(draft, "lead_id");
    const actionType = col(draft, "action_type") || "outreach_dm";
    const sourceId   = col(draft, "draft_id", "queue_id", leadId);

    sendQueueRows.push({
      send_id:      `SQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date_queued:  now,
      lead_id:      leadId,
      name,
      company,
      platform,
      lead_temperature: temp,
      action_type:  actionType,
      message,
      status:       "ready",
      sent_at:      "",
      source_tab:   draft._source,
      source_id:    sourceId,
      linkedin_url: col(draft, "linkedin_url"),
      notes:        col(draft, "notes"),
    });

    // Mark source row as queued_for_send so it doesn't reappear
    await writeRow(
      draft._source as "Message_Drafts" | "Connection_Follow_Queue",
      { ...draft, status: "queued_for_send" },
      sourceId
    );
  }

  // Write all rows to Send_Queue tab
  for (const row of sendQueueRows) {
    await writeRow("Send_Queue", row);
  }

  // Build Discord summary
  const lines: string[] = [
    `**📤 ${totalApproved} message${totalApproved > 1 ? "s" : ""} ready to send**`,
    "",
  ];

  for (let i = 0; i < sendQueueRows.length; i++) {
    const r = sendQueueRows[i];
    const tempBadge = r.lead_temperature ? ` · ${r.lead_temperature}` : "";
    const company_ = r.company ? ` — ${r.company}` : "";
    const preview = String(r.message ?? "").slice(0, 120);
    lines.push(`**${i + 1}. ${r.name}${company_}${tempBadge}** (${r.platform})`);
    lines.push(`> ${preview}${String(r.message ?? "").length > 120 ? "..." : ""}`);
  }

  lines.push("");
  lines.push(`[Open Send Queue](${SHEET_URL}#gid=SEND_QUEUE_GID)`);
  lines.push("_Flip row status to_ \`sent\` _after sending each message_");

  const hotCount = sendQueueRows.filter(r => r.lead_temperature === "hot").length;

  await sendDiscordNotification({
    subject: `${totalApproved} message${totalApproved > 1 ? "s" : ""} ready to send`,
    body: lines.join("\n"),
    priority: hotCount > 0 ? "high" : "normal",
  });

  logger.info("workflow:build-send-queue", `✅ Send queue built — ${totalApproved} rows written to Send_Queue tab`);
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
