import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { GenerateOutreachMessageOutput } from "../schemas/tool-outputs";
import { strictRespond, logger } from "../utils";
import { env } from "../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM = `You are the Outreach Strategist for Autom8, an AI-powered customer acquisition platform that automates Instagram comment replies, DM workflows, and engagement-to-lead conversion.

Write ONE short, direct, trust-building outreach message for the lead described in the user turn. The message should sound like a real founder reaching out — not a sales sequence, not a pitch deck.

Hard rules:
- 2-3 sentences MAX (hard limit).
- No hype, no urgency language, no big claims, no pressure.
- No fake personalization or hollow compliments.
- The CTA must match the lead temperature signal in the input.
- For connection requests: never pitch. Curiosity only. <=300 chars.

CTA by temperature:
- cold      → "Would it be worth showing you?" (or similar soft ask)
- warm      → "Want me to send the demo?"
- hot       → "Open to a quick strategy call?"
- qualified → "I can send the booking link." / "Happy to show you what we built."

Output format: respond with ONLY the message body. No JSON, no markdown, no preamble. Just the raw text that would be sent.`;

type OutreachInput = {
  lead_name: string;
  lead_company?: string;
  platform: "instagram_dm" | "linkedin_dm" | "email";
  temperature: "cold" | "warm" | "hot" | "qualified";
  trust_builder: string;
  likely_pain_point: string;
};

const CTA_BY_TEMP = {
  cold: "Would it be worth showing you?",
  warm: "Want me to send the demo?",
  hot: "Open to a quick strategy call?",
  qualified: "I can send the booking link.",
} as const;

function buildTemplateDraft(input: OutreachInput): string {
  const company = input.lead_company ? ` at ${input.lead_company}` : "";
  const cta = CTA_BY_TEMP[input.temperature];
  return (
    `[TEMPLATE — regenerate when API is available] ` +
    `Hey ${input.lead_name}, noticed ${input.trust_builder}. ` +
    `Building Autom8 to help operators${company} close the gap between social engagement and actual customer conversations — ${input.likely_pain_point}. ` +
    cta
  );
}

export const generateOutreachMessage = betaZodTool({
  name: "generateOutreachMessage",
  description:
    "Generate a personalised outreach message for a lead on a given platform. " +
    "Calls Claude with the Autom8 outreach prompt and returns a short, direct draft. " +
    "Status is always pending_review — nothing is ever sent from this tool.",
  inputSchema: z.object({
    lead_id: z.string().describe("Lead ID from the Leads sheet (e.g. LEAD-001)"),
    lead_name: z.string(),
    lead_company: z.string().optional(),
    lead_headline: z.string().optional().describe("Their LinkedIn headline / title"),
    platform: z.enum(["instagram_dm", "linkedin_dm", "email"]),
    temperature: z.enum(["cold", "warm", "hot", "qualified"]).default("cold"),
    trust_builder: z
      .string()
      .describe("Specific, honest detail that establishes credibility (e.g. 'their recent post on X')"),
    likely_pain_point: z.string().describe("The problem they probably have"),
    best_angle: z.enum([
      "time_saving",
      "revenue_growth",
      "stress_reduction",
      "social_proof",
      "curiosity",
    ]),
    call_to_action: z
      .enum(["book_call", "check_link", "soft_question"])
      .default("soft_question"),
  }),
  run: async (input) => {
    logger.tool("generateOutreachMessage", input);

    const userPrompt = `Lead details:
- Name: ${input.lead_name}
- Company: ${input.lead_company ?? "unknown"}
- Headline/Title: ${input.lead_headline ?? "unknown"}
- Platform: ${input.platform}
- Temperature: ${input.temperature}
- Likely pain point: ${input.likely_pain_point}
- Best angle: ${input.best_angle}
- Trust builder (use this — don't invent): ${input.trust_builder}
- CTA type: ${input.call_to_action}

Write the ${input.platform} message now. 2-3 sentences max. Just the raw message body — no JSON, no preamble.`;

    let draft: string;
    try {
      const response = await client.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 400,
        system: SYSTEM,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      draft =
        textBlock && textBlock.type === "text"
          ? textBlock.text.trim()
          : `Hey ${input.lead_name}, [draft generation returned no text — check API response]`;
    } catch (err) {
      // Fallback so the pipeline still completes end-to-end when the API is
      // unavailable (credit balance, rate limit, network). The draft is
      // clearly marked TEMPLATE so the founder knows to re-run later.
      const reason = err instanceof Error ? err.message : String(err);
      logger.info("generateOutreachMessage", `API call failed, using template fallback: ${reason}`);
      draft = buildTemplateDraft(input);
    }

    return strictRespond(GenerateOutreachMessageOutput, {
      lead_id: input.lead_id,
      platform: input.platform,
      draft,
      status: "pending_review",
      angle_used: input.best_angle,
      cta_used: input.call_to_action,
    });
  },
});
