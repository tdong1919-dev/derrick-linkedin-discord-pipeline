import Anthropic from "@anthropic-ai/sdk";
import { readRawLeads, updateGoogleSheet } from "../../tools";
import { logger } from "../../utils";
import { env } from "../../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Autom8 Lead Researcher. Your job is to score qualified outbound leads and log them to the Leads tab in Google Sheets.

Rules:
- Read freshly enriched leads from a Derrick import tab named import_YYYY_MM_DD (e.g. import_2026_05_31). The user will tell you which tab to use. Columns: name, headline, location, linkedinUrl, "import leads status".
- Only process rows where "import leads status" = "new". Score each one, write scored leads to the Leads tab with status Queued, and flip the source row's "import leads status" to "scored" so we don't re-process.
- Target founders, ecommerce owners, SaaS builders, marketers, and creators who manage growing audiences.
- Infer fit from name + headline + location + linkedinUrl. Score each lead: fit_score (ICP match), intent_score (visible urgency from headline), timing_score (readiness signals).
- Set lead_temperature based on scores: cold (<5 avg), warm (5-7), hot (7+).
- Always log leads to Google Sheets before finishing — never just return results in text.
- If no leads match the criteria, log a brief note and stop. Do not fabricate leads.`;

export async function runLeadResearcher(task: string): Promise<void> {
  logger.info("lead-researcher", `Starting task: ${task}`);

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    tools: [readRawLeads, updateGoogleSheet],
    messages: [{ role: "user", content: task }],
  });

  for (const block of finalMessage.content) {
    if (block.type === "text") {
      logger.info("lead-researcher", block.text);
    }
  }
  logger.info("lead-researcher", `Usage: ${JSON.stringify(finalMessage.usage)}`);
}
