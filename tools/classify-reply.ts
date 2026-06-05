import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { ClassifyReplyOutput, ReplyClassification } from "../schemas/tool-outputs";
import { strictRespond, logger } from "../utils";
import { env } from "../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const HIGH_INTENT: Array<z.infer<typeof ReplyClassification>> = [
  "Wants Call",
  "Wants Demo",
  "Wants Pricing",
  "Wants Signup",
];

const SYSTEM = `You classify LinkedIn/Instagram/email replies for the Autom8 outbound sales system.

Given the reply text and platform, return ONLY a JSON object with these exact fields:
{
  "classification": one of: "Positive Interest" | "Wants Demo" | "Wants Call" | "Wants Pricing" | "Wants Signup" | "Not Interested" | "Objection" | "Unsubscribe" | "Needs More Info" | "Out of Office",
  "confidence": "high" | "medium" | "low",
  "suggested_next_action": short string describing what to do next,
  "note": optional short reasoning note
}

Classification guide:
- Positive Interest: curious, open, friendly — no specific request yet
- Wants Demo: asks to see the product or how it works
- Wants Call: asks for a call, meeting, or strategy session
- Wants Pricing: asks about cost, plans, or pricing
- Wants Signup: ready to start, asks for a link or next steps
- Not Interested: declines, not relevant, wrong timing
- Objection: pushback on a specific concern (price, timing, relevance)
- Unsubscribe: asks to stop messaging / remove them
- Needs More Info: wants to understand more before deciding
- Out of Office: auto-reply or temporary absence

Return only valid JSON. No markdown, no explanation.`;

export const classifyReply = betaZodTool({
  name: "classifyReply",
  description:
    "Classify an inbound reply from a lead into one of the standard Autom8 conversation stages. Uses Claude to interpret the reply text and returns classification, confidence, and suggested next action.",
  inputSchema: z.object({
    lead_id: z.string(),
    reply_text: z.string().describe("The exact text of the reply received"),
    platform: z.enum(["instagram_dm", "linkedin_dm", "email"]),
  }),
  run: async (input) => {
    logger.tool("classifyReply", input);

    let classification: z.infer<typeof ReplyClassification> = "Positive Interest";
    let confidence: "high" | "medium" | "low" = "medium";
    let suggested_next_action = "Review reply and draft a response";
    let note: string | undefined;

    try {
      const response = await client.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 300,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: `Platform: ${input.platform}\nReply text: "${input.reply_text}"`,
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        const parsed = JSON.parse(textBlock.text.trim());
        classification = parsed.classification ?? classification;
        confidence = parsed.confidence ?? confidence;
        suggested_next_action = parsed.suggested_next_action ?? suggested_next_action;
        note = parsed.note;
      }
    } catch (err) {
      logger.info("classifyReply", `Claude call failed, using fallback: ${err instanceof Error ? err.message : String(err)}`);
      note = "Classification used fallback — API unavailable";
    }

    const notify_founder = HIGH_INTENT.includes(classification);

    return strictRespond(ClassifyReplyOutput, {
      lead_id: input.lead_id,
      platform: input.platform,
      classification,
      confidence,
      suggested_next_action,
      notify_founder,
      note,
    });
  },
});
