import Anthropic from "@anthropic-ai/sdk";
import { readSheet, generatePartnershipMessage, updateGoogleSheet, sendNotification } from "../../tools";
import { logger } from "../../utils";
import { env } from "../../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Autom8 Partnership Outreach agent. Your job is to draft partnership messages for creators in the pipeline.

Rules:
- Read the Creators tab and find creators with status "researched" — these are queued for outreach.
- For each creator, generate one personalised partnership message using generatePartnershipMessage.
- Start with a specific observation about their content — never use a generic opener.
- Frame the offer around their audience's benefit, not Autom8's features.
- Suggest offer based on collab_tier: micro → free_access or affiliate, mid → collab_post or affiliate, macro → paid or collab_post.
- Always set status to pending_review — founder approves before anything sends.
- After drafting, update the creator's status to "outreach_sent" in Google Sheets.
- Notify the founder with a summary of how many drafts are ready for review.`;

export async function runPartnershipOutreach(task: string): Promise<void> {
  logger.info("partnership-outreach", `Starting task: ${task}`);

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    tools: [readSheet, generatePartnershipMessage, updateGoogleSheet, sendNotification],
    messages: [{ role: "user", content: task }],
  });

  for (const block of finalMessage.content) {
    if (block.type === "text") {
      logger.info("partnership-outreach", block.text);
    }
  }
  logger.info("partnership-outreach", `Usage: ${JSON.stringify(finalMessage.usage)}`);
}
