import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { GeneratePartnershipMessageOutput } from "../../schemas/tool-outputs";
import { strictRespond, logger } from "../../utils";

export const generatePartnershipMessage = betaZodTool({
  name: "generatePartnershipMessage",
  description:
    "Generate personalised partnership outreach for an Instagram creator. The message is always set to pending_review — nothing sends without founder approval.",
  inputSchema: z.object({
    creator_id: z.string().describe("Creator ID, e.g. CREATOR-001"),
    creator_handle: z.string().describe("Instagram handle without @"),
    platform: z.enum(["instagram", "tiktok", "youtube", "linkedin"]),
    follower_count: z.number().int().nonnegative(),
    niche: z.string(),
    audience_description: z.string().describe("Who their audience is"),
    offer: z
      .array(z.enum(["free_access", "testimonial", "collab_post", "affiliate", "paid"]))
      .describe("One or more offer types to include"),
    personalization_signal: z
      .string()
      .describe("A specific signal from their profile or content to personalise the opener"),
  }),
  run: async (input) => {
    logger.tool("generatePartnershipMessage", input);
    // TODO: Use the input to construct a prompt and call the Claude API directly,
    // or let the orchestrating agent handle the generation via its system prompt.
    // The draft should be 3-5 sentences: personalised opener, Autom8 value prop
    // framed for their audience, and a soft CTA tied to the offer.
    const primaryOffer = input.offer[0] ?? "free_access";
    return strictRespond(GeneratePartnershipMessageOutput, {
      creator_id: input.creator_id,
      platform: input.platform,
      draft: `[Draft not yet generated — wire up generation logic for @${input.creator_handle}]`,
      status: "pending_review",
      offer_included: primaryOffer,
      personalization_note: input.personalization_signal,
    });
  },
});
