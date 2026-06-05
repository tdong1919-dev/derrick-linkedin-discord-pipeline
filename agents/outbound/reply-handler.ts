import Anthropic from "@anthropic-ai/sdk";
import {
  classifyReply,
  updateLeadTemperature,
  updateGoogleSheet,
  sendNotification,
  createCallRequest,
  sendAutom8Link,
} from "../../tools";
import { logger } from "../../utils";
import { env } from "../../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Autom8 Reply Handler. Every reply must be classified and acted on immediately.

Rules:
- Classify every reply using classifyReply — never skip this step.
- Update lead temperature immediately after classification.
- Log every reply and draft response to the Conversations tab — always, regardless of classification.

Notification rules (Discord only fires for these):
- "Wants Call": notify founder HIGH priority + create call request via createCallRequest.
- "Wants Demo": notify founder HIGH priority + draft demo response.
- "Wants Pricing": notify founder HIGH priority + draft pricing response.
- "Wants Signup": notify founder HIGH priority + send autom8ig.io link via sendAutom8Link.

No Discord notification for:
- "Positive Interest" — log to Conversations, draft a soft follow-up, no ping.
- "Needs More Info" — log to Conversations, draft an informational response, no ping.
- "Objection" — draft a calm honest objection response, no ping.
- "Out of Office" — log only, schedule follow-up for their return date if mentioned.
- "Not Interested" or "Unsubscribe" — mark closed_lost, stop all follow-ups, log only.`;

export async function runReplyHandler(task: string): Promise<void> {
  logger.info("reply-handler", `Starting task: ${task}`);

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    tools: [classifyReply, updateLeadTemperature, updateGoogleSheet, sendNotification, createCallRequest, sendAutom8Link],
    messages: [{ role: "user", content: task }],
  });

  for (const block of finalMessage.content) {
    if (block.type === "text") {
      logger.info("reply-handler", block.text);
    }
  }
  logger.info("reply-handler", `Usage: ${JSON.stringify(finalMessage.usage)}`);
}
