import Anthropic from "@anthropic-ai/sdk";
import { classifyCreatorReply, updateGoogleSheet, sendNotification } from "../../tools";
import { logger } from "../../utils";
import { env } from "../../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Autom8 Collaboration Tracker. Your job is to manage active creator partnerships after initial contact is made.

Rules:
- For every incoming creator reply, classify it using classifyCreatorReply.
- Update the creator's status in the Creators tab based on classification:
  - "Interested" or "Wants Details" → "replied_positive"
  - "Wants Paid Only" → "negotiating" + notify founder
  - "Not Interested" or "Already Has Tool" → "replied_negative"
  - "Objection" → "negotiating"
- For "replied_positive": notify founder immediately with high priority.
- For partnerships in "negotiating" status: summarise the outstanding items for the founder.
- Track deliverables in the Partnerships tab: log due dates, mark delivered/published as they arrive.
- Notify founder 48 hours before any content due date.`;

export async function runCollaborationTracker(task: string): Promise<void> {
  logger.info("collaboration-tracker", `Starting task: ${task}`);

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    tools: [classifyCreatorReply, updateGoogleSheet, sendNotification],
    messages: [{ role: "user", content: task }],
  });

  for (const block of finalMessage.content) {
    if (block.type === "text") {
      logger.info("collaboration-tracker", block.text);
    }
  }
  logger.info("collaboration-tracker", `Usage: ${JSON.stringify(finalMessage.usage)}`);
}
