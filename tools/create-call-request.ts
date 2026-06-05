import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { CreateCallRequestOutput } from "../schemas/tool-outputs";
import { strictRespond, logger } from "../utils";

export const createCallRequest = betaZodTool({
  name: "createCallRequest",
  description:
    "Create a call request for a lead who has expressed interest in a strategy call. Sends a Calendly link or proposed times and logs the request in the CRM.",
  inputSchema: z.object({
    lead_id: z.string(),
    lead_name: z.string(),
    lead_email: z.string().optional(),
    platform: z.enum(["instagram_dm", "linkedin_dm", "email"]),
    calendly_url: z
      .string()
      .default("https://calendly.com/autom8/strategy")
      .describe("Booking link to include"),
    personalized_note: z.string().optional().describe("Short line to add before the link"),
  }),
  run: async (input) => {
    logger.tool("createCallRequest", input);
    const note = input.personalized_note ?? "Would love to find a time to chat!";
    return strictRespond(CreateCallRequestOutput, {
      lead_id: input.lead_id,
      message_draft: `${note} Here's my calendar: ${input.calendly_url}`,
      calendly_url: input.calendly_url,
      status: "pending_review",
      logged: true,
    });
  },
});
