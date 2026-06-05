import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { ClassifyCreatorReplyOutput } from "../../schemas/tool-outputs";
import { strictRespond, logger } from "../../utils";

export const classifyCreatorReply = betaZodTool({
  name: "classifyCreatorReply",
  description:
    "Classify a reply from a creator in the partnerships pipeline. Determines intent, suggests the next action, and flags whether the founder should be notified.",
  inputSchema: z.object({
    creator_id: z.string().describe("Creator ID, e.g. CREATOR-001"),
    reply_text: z.string().describe("The full text of the reply from the creator"),
    platform: z.enum(["instagram", "tiktok", "youtube", "linkedin"]),
  }),
  run: async (input) => {
    logger.tool("classifyCreatorReply", input);
    // TODO: Use keyword signals and semantic analysis to classify:
    // - "Interested" → mentions wanting to try, asking how it works
    // - "Wants Details" → asks about features, specifics, pricing breakdown
    // - "Wants Paid Only" → requests a fee for any post or partnership
    // - "Not Interested" → declines or says not a fit
    // - "Already Has Tool" → mentions using a competitor
    // - "Objection" → raises a specific concern (authenticity, audience trust, etc.)
    // - "Out of Office" → auto-reply or mentions being away
    // - "Unclear" → ambiguous message that needs human review
    return strictRespond(ClassifyCreatorReplyOutput, {
      creator_id: input.creator_id,
      classification: "Unclear",
      confidence: "low",
      suggested_next_action: "Review reply manually — classification not yet wired up.",
      notify_founder: false,
    });
  },
});
