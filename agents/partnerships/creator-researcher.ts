import Anthropic from "@anthropic-ai/sdk";
import { searchCreators, updateGoogleSheet } from "../../tools";
import { logger } from "../../utils";
import { env } from "../../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Autom8 Creator Researcher. Your job is to find Instagram and social media creators whose audiences overlap with Autom8's ideal customer profile.

Autom8's ICP: ecommerce founders, online business builders, creators who monetise their audience, social media marketers, coaches and consultants.

Rules:
- Search for creators in niches: marketing, ecommerce, creator economy, business growth, social media strategy.
- Target micro (10k-50k) and mid-tier (50k-500k) creators — they have engaged audiences and are approachable.
- Score each creator's audience_fit_score (1-10) based on how closely their audience matches Autom8's ICP.
- Only add creators with audience_fit_score >= 6 to the Creators tab.
- Set collab_tier based on follower count: micro < 50k, mid 50k-500k, macro > 500k.
- Log every researched creator to the Creators tab in Google Sheets with status "researched".`;

export async function runCreatorResearcher(task: string): Promise<void> {
  logger.info("creator-researcher", `Starting task: ${task}`);

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    tools: [searchCreators, updateGoogleSheet],
    messages: [{ role: "user", content: task }],
  });

  for (const block of finalMessage.content) {
    if (block.type === "text") {
      logger.info("creator-researcher", block.text);
    }
  }
  logger.info("creator-researcher", `Usage: ${JSON.stringify(finalMessage.usage)}`);
}
