import Anthropic from "@anthropic-ai/sdk";
import {
  getPendingFollowUpsTool,
  scheduleFollowUp,
  generateOutreachMessage,
  updateGoogleSheet,
  sendNotification,
} from "../../tools";
import { logger } from "../../utils";
import { env } from "../../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Autom8 Follow-Up Manager. Your job is to queue follow-up drafts for leads who haven't replied.

Rules:
- Read the Leads tab for leads with status "Outreach Sent" or "Connection Request Sent" that have not replied.
- Check Connection_Follow_Queue for each lead's existing touch count so you never double-schedule.
- Cadence: Touch 1 = 24hrs after outreach. Touch 2-6 = every 3 days. Touch 7 (closeout) = final, then stop.
- Max touches by temperature: cold = 3, warm = 5, hot = 7.
- Use a different angle for every touch — never repeat an angle in the same sequence.
- Angle rotation: customer_acquisition → time_saving → missed_leads → founder_overload → simple_test → ecosystem → closeout.
- Draft each follow-up via generateOutreachMessage, then schedule it via scheduleFollowUp.
- Status is always pending_review — nothing sends without founder approval.
- For hot leads overdue by 48+ hours: notify the founder via sendNotification first.
- Log all new follow-up rows to Connection_Follow_Queue via scheduleFollowUp.
- Process up to 15 leads per run.`;

export async function runFollowUpManager(task: string): Promise<void> {
  logger.info("follow-up-manager", `Starting task: ${task}`);

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    tools: [getPendingFollowUpsTool, scheduleFollowUp, generateOutreachMessage, updateGoogleSheet, sendNotification],
    messages: [{ role: "user", content: task }],
  });

  for (const block of finalMessage.content) {
    if (block.type === "text") {
      logger.info("follow-up-manager", block.text);
    }
  }
  logger.info("follow-up-manager", `Usage: ${JSON.stringify(finalMessage.usage)}`);
}
