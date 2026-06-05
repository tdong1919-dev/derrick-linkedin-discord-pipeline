/**
 * process-replies.ts
 *
 * Reads new rows from the Inbound_Replies tab in Google Sheets and runs the
 * reply handler agent on each one.
 *
 * How to use:
 * 1. When a lead replies on LinkedIn/Instagram/email, paste the reply into
 *    the Inbound_Replies tab with status = "new".
 * 2. Run: npm run workflow:process-replies
 *    (or let n8n trigger it on a schedule)
 * 3. The agent classifies, updates the lead, logs to Conversations, and
 *    pings Discord for high-intent replies.
 *
 * Inbound_Replies columns:
 *   reply_id | lead_id | platform | reply_text | received_at | status | notes
 */

import { runReplyHandler } from "../agents/outbound/reply-handler";
import { readRows, writeRow } from "../services/google-sheets";
import { logger } from "../utils";

export async function run(): Promise<void> {
  logger.info("workflow:process-replies", "Checking Inbound_Replies for new rows...");

  const { rows, count } = await readRows("Inbound_Replies", "status", "new");

  if (count === 0) {
    logger.info("workflow:process-replies", "No new replies to process");
    return;
  }

  logger.info("workflow:process-replies", `Found ${count} new reply(s) to process`);

  for (const row of rows) {
    const reply_id   = String(row["reply_id"]   ?? "").trim();
    const lead_id    = String(row["lead_id"]     ?? "").trim();
    const platform   = String(row["platform"]    ?? "linkedin_dm").trim();
    const reply_text = String(row["reply_text"]  ?? "").trim();
    const received_at = String(row["received_at"] ?? new Date().toISOString()).trim();

    if (!lead_id || !reply_text) {
      logger.info("workflow:process-replies", `Skipping row ${reply_id} — missing lead_id or reply_text`);
      continue;
    }

    // Mark as "processing" immediately so a re-run doesn't double-process
    await writeRow(
      "Inbound_Replies",
      { ...row, status: "processing" },
      reply_id || lead_id
    );

    try {
      const task = `A lead replied on ${platform}.
Lead ID: ${lead_id}
Reply text: "${reply_text}"
Received at: ${received_at}

Steps:
1. Classify the reply using classifyReply.
2. Update lead temperature and status in the Leads tab.
3. Log the full conversation entry to the Conversations tab with the reply text, classification, and a draft response.
4. If high-intent (Wants Call, Wants Demo, Wants Pricing, Wants Signup): notify the founder via Discord immediately.
5. Draft a response appropriate to the classification — status must be pending_review, never send automatically.`;

      await runReplyHandler(task);

      // Mark as processed
      await writeRow(
        "Inbound_Replies",
        { ...row, status: "processed" },
        reply_id || lead_id
      );

      logger.info("workflow:process-replies", `✅ Processed reply for ${lead_id}`);
    } catch (err) {
      // Mark as failed so it can be retried or inspected
      await writeRow(
        "Inbound_Replies",
        { ...row, status: "failed", notes: err instanceof Error ? err.message : String(err) },
        reply_id || lead_id
      );
      logger.error("workflow:process-replies", `Failed to process reply for ${lead_id}: ${err}`);
    }
  }

  logger.info("workflow:process-replies", "Done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
