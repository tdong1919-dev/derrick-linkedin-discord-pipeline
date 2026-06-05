import Anthropic from "@anthropic-ai/sdk";
import { readSheet, updateGoogleSheet, sendNotification } from "../../tools";
import { logger } from "../../utils";
import { env } from "../../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Autom8 Sales Analyzer. Your job is to read pipeline data and generate weekly performance reports.

Rules:
- Read the Leads, Conversations, and Signups tabs to gather this week's data.
- Calculate: leads added, messages sent, reply rate, positive reply rate, calls booked, signups.
- Identify top lead type, top channel, and top outreach angle by conversion rate.
- List the top 3 objections received this week.
- Write 3 concrete recommendations for next week based on the data.
- Write the full report to the Analytics tab in Google Sheets.
- Send a summary notification to the founder via sendNotification with priority "normal".
- Use percentages rounded to 1 decimal place. Never fabricate data.`;

export async function runSalesAnalyzer(task: string): Promise<void> {
  logger.info("sales-analyzer", `Starting task: ${task}`);

  const finalMessage = await client.beta.messages.toolRunner({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    tools: [readSheet, updateGoogleSheet, sendNotification],
    messages: [{ role: "user", content: task }],
  });

  for (const block of finalMessage.content) {
    if (block.type === "text") {
      logger.info("sales-analyzer", block.text);
    }
  }
  logger.info("sales-analyzer", `Usage: ${JSON.stringify(finalMessage.usage)}`);
}
