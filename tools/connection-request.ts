import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { CreateConnectionRequestDraftOutput } from "../schemas/tool-outputs";
import { strictRespond, logger } from "../utils";
import { env } from "../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM = `You write personalised LinkedIn connection request notes for Autom8, an AI customer acquisition platform.

Hard rules:
- Maximum 280 characters (LinkedIn limit is 300 — leave buffer).
- NEVER pitch in a connection request. Curiosity only.
- Reference the honest personalization signal provided. Do not invent details.
- 1-2 sentences. Peer-to-peer tone.
- No hollow compliments ("love your content", "amazing work", etc.).
- Output format: ONLY the note text. No JSON, no markdown, no preamble.`;

export const createConnectionRequestDraft = betaZodTool({
  name: "createConnectionRequestDraft",
  description:
    "Draft a personalised LinkedIn connection request for a specific lead. Calls Claude with the connection-request prompt. Keeps it under 300 characters. Returns the draft text.",
  inputSchema: z.object({
    lead_name: z.string(),
    lead_title: z.string(),
    lead_company: z.string(),
    personalization_signal: z
      .string()
      .describe("One honest detail about them — recent post, shared interest, mutual connection, etc."),
    angle: z
      .enum(["curiosity", "compliment", "shared_pain", "mutual_connection"])
      .optional()
      .default("curiosity"),
  }),
  run: async (input) => {
    logger.tool("createConnectionRequestDraft", input);

    const userPrompt = `Write a LinkedIn connection request note.

Lead: ${input.lead_name}, ${input.lead_title} at ${input.lead_company}
Personalization signal (use this, don't invent): ${input.personalization_signal}
Angle: ${input.angle}

Write the note now. Max 280 characters. No pitch. Just the note text.`;

    let draft: string;
    try {
      const response = await client.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 200,
        system: SYSTEM,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      draft =
        textBlock && textBlock.type === "text"
          ? textBlock.text.trim()
          : `Hi ${input.lead_name}, came across your work at ${input.lead_company} — ${input.personalization_signal}. Would love to connect.`;
    } catch (err) {
      // Fallback so the pipeline keeps moving when the API is unavailable.
      const reason = err instanceof Error ? err.message : String(err);
      logger.info("createConnectionRequestDraft", `API call failed, using template: ${reason}`);
      draft =
        `[TEMPLATE — regenerate when API is available] ` +
        `Hi ${input.lead_name}, came across your work at ${input.lead_company} — ${input.personalization_signal}. Would love to connect.`;
    }

    // Hard-clip if the model overran the limit.
    if (draft.length > 300) {
      draft = draft.slice(0, 297) + "...";
    }

    return strictRespond(CreateConnectionRequestDraftOutput, {
      draft,
      character_count: draft.length,
      angle_used: input.angle,
    });
  },
});
