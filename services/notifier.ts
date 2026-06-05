/**
 * notifier.ts
 *
 * Reads pending_review rows from Message_Drafts and Connection_Follow_Queue
 * and fires a compact Discord summary. Marks notified rows so re-runs don't
 * double-ping.
 *
 * No LLM involved — pure sheet reads + Discord webhook.
 */

import { readRows, writeRow } from "./google-sheets";
import { sendDiscordNotification } from "./discord";
import { logger } from "../utils";
import { env } from "../config/env";

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${env.GOOGLE_SHEETS_ID}/edit`;
const MESSAGE_DRAFTS_URL = `${SHEET_URL}#gid=453796889`;
const CONNECTION_QUEUE_URL = `${SHEET_URL}#gid=1899908264`;

type DraftRow = Record<string, unknown>;

function col(row: DraftRow, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}

async function getPendingRows(
  tab: "Message_Drafts" | "Connection_Follow_Queue"
): Promise<DraftRow[]> {
  const { rows } = await readRows(tab, "status", "pending_review");
  return rows.filter((r) => !col(r, "notified_at"));
}

async function markNotified(
  tab: "Message_Drafts" | "Connection_Follow_Queue",
  rows: DraftRow[]
): Promise<void> {
  const now = new Date().toISOString();
  for (const row of rows) {
    const rowId = col(row, "draft_id", "queue_id", "lead_id");
    if (!rowId) continue;
    try {
      await writeRow(tab, { ...row, notified_at: now }, rowId);
    } catch {
      // Non-fatal — worst case we re-notify next run
    }
  }
}

function buildLeadLine(row: DraftRow): string {
  const name    = col(row, "name", "lead_name");
  const company = col(row, "company");
  const temp    = col(row, "lead_temperature");
  const tempTag = temp ? ` · ${temp}` : "";
  const company_ = company ? ` — ${company}` : "";
  return `• ${name}${company_}${tempTag}`;
}

export async function notifyPendingDrafts(): Promise<void> {
  logger.info("notifier", "Checking for pending_review drafts...");

  const [messageDrafts, connectionDrafts] = await Promise.all([
    getPendingRows("Message_Drafts"),
    getPendingRows("Connection_Follow_Queue"),
  ]);

  const totalPending = messageDrafts.length + connectionDrafts.length;

  if (totalPending === 0) {
    logger.info("notifier", "No new pending drafts — skipping Discord ping");
    return;
  }

  const lines: string[] = [];

  if (messageDrafts.length > 0) {
    lines.push(`📝 **${messageDrafts.length} message draft${messageDrafts.length > 1 ? "s" : ""}** ready`);
    messageDrafts.forEach((r) => lines.push(buildLeadLine(r)));
    lines.push(`[Open Message_Drafts](${MESSAGE_DRAFTS_URL})`);
  }

  if (connectionDrafts.length > 0) {
    if (lines.length) lines.push("");
    lines.push(`🔗 **${connectionDrafts.length} connection request${connectionDrafts.length > 1 ? "s" : ""}** ready`);
    connectionDrafts.forEach((r) => lines.push(buildLeadLine(r)));
    lines.push(`[Open Connection_Follow_Queue](${CONNECTION_QUEUE_URL})`);
  }

  const body = lines.join("\n");
  const priority = totalPending >= 5 ? "high" : "normal";

  const sent = await sendDiscordNotification({
    subject: `${totalPending} draft${totalPending > 1 ? "s" : ""} ready for your review`,
    body,
    priority,
  });

  if (sent) {
    await Promise.all([
      markNotified("Message_Drafts", messageDrafts),
      markNotified("Connection_Follow_Queue", connectionDrafts),
    ]);
    logger.info("notifier", `Discord ping sent — ${totalPending} draft(s) notified`);
  } else {
    logger.info("notifier", "Discord send failed — rows not marked (will retry next run)");
  }
}
