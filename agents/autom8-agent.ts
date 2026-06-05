import Anthropic from "@anthropic-ai/sdk";
import {
  searchInstagramCreators,
  searchLinkedInLeads,
  createConnectionRequestDraft,
  generateOutreachMessage,
  updateGoogleSheet,
  classifyReply,
  updateLeadTemperature,
  scheduleFollowUp,
  sendNotification,
  createCallRequest,
  sendAutom8Link,
} from "../tools";
import { logger } from "../utils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Autom8 outbound sales agent. Your job is to find qualified leads, personalise outreach, manage follow-ups, classify replies, and alert the founder on high-intent signals.

Rules:
- Always log activity to Google Sheets after any meaningful action.
- Never mark a message as sent — drafts go to pending_review so the founder approves first.
- Prioritise booking strategy calls and driving signups to autom8ig.io.
- Keep messages short, honest, and human. No hype or pressure.
- If a lead shows high intent (wants call, wants pricing, wants signup), immediately notify the founder via sendNotification.
- All tool outputs are strict JSON — always parse the returned data before acting on it.`;

export async function runAutom8Agent(task: string): Promise<void> {
  logger.info("autom8-agent", `Starting task: ${task}`);

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    tools: [
      searchInstagramCreators,
      searchLinkedInLeads,
      createConnectionRequestDraft,
      generateOutreachMessage,
      updateGoogleSheet,
      classifyReply,
      updateLeadTemperature,
      scheduleFollowUp,
      sendNotification,
      createCallRequest,
      sendAutom8Link,
    ],
    messages: [{ role: "user", content: task }],
  });

  for (const block of finalMessage.content) {
    if (block.type === "text") {
      logger.info("autom8-agent", `Response:\n${block.text}`);
    }
  }

  logger.info("autom8-agent", `Usage: ${JSON.stringify(finalMessage.usage)}`);
}

// ─── Example tasks ────────────────────────────────────────────────────────────

// runAutom8Agent("Find 5 Instagram fitness coaches with 10k-100k followers and draft personalised outreach messages for each.");

// runAutom8Agent("Search LinkedIn for founders of social media agencies in the UK, create connection request drafts, and log them in the Leads sheet.");

// runAutom8Agent(`A lead just replied: "This looks interesting, how much does it cost?" — their lead ID is LEAD-042. Classify the reply, update their temperature, and notify me.`);

// runAutom8Agent("Schedule follow-ups for all leads that were sent an outreach message 3 days ago and haven't replied yet.");
