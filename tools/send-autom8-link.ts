import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { SendAutom8LinkOutput } from "../schemas/tool-outputs";
import { strictRespond, logger } from "../utils";

export const sendAutom8Link = betaZodTool({
  name: "sendAutom8Link",
  description:
    "Send the Autom8 platform link (autom8ig.io) to a lead who is ready to learn more. Includes a short personalised line and the signup URL.",
  inputSchema: z.object({
    lead_id: z.string(),
    lead_name: z.string(),
    platform: z.enum(["instagram_dm", "linkedin_dm", "email"]),
    personalized_line: z
      .string()
      .describe("One honest sentence about why Autom8 fits them specifically"),
    autom8_url: z.string().default("https://autom8ig.io").describe("Platform URL"),
  }),
  run: async (input) => {
    logger.tool("sendAutom8Link", input);
    return strictRespond(SendAutom8LinkOutput, {
      lead_id: input.lead_id,
      platform: input.platform,
      message_draft: `${input.personalized_line} You can check it out here: ${input.autom8_url}`,
      autom8_url: input.autom8_url,
      status: "pending_review",
    });
  },
});
