import Anthropic from "@anthropic-ai/sdk";
import {
  readSheet,
  generateOutreachMessage,
  createConnectionRequestDraft,
  updateGoogleSheet,
  sendAutom8Link,
} from "../../tools";
import { logger } from "../../utils";
import { env } from "../../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Autom8 Outreach Strategist. Your job is to write personalised, human-sounding outreach messages for queued leads.

Rules:
- Read the Leads sheet to find leads with status "Queued" or "Connected".
- Personalise every message using the lead's niche, content style, and the autom8_angle field.
- Keep messages short: 3-5 sentences for DMs, 2-3 sentences for connection requests.
- Always set status to pending_review — never mark anything as sent.
- Log every draft to the Message_Drafts tab in Google Sheets.
- For hot leads, include the autom8ig.io link via sendAutom8Link.
- Never use hype, pressure, or false urgency.`;

export async function runOutreachStrategist(task: string): Promise<void> {
  logger.info("outreach-strategist", `Starting task: ${task}`);

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    tools: [readSheet, generateOutreachMessage, createConnectionRequestDraft, updateGoogleSheet, sendAutom8Link],
    messages: [{ role: "user", content: task }],
  });

  for (const block of finalMessage.content) {
    if (block.type === "text") {
      logger.info("outreach-strategist", block.text);
    }
  }
  logger.info("outreach-strategist", `Usage: ${JSON.stringify(finalMessage.usage)}`);
}
