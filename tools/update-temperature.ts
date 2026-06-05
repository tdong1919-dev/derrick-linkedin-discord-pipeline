import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { UpdateLeadTemperatureOutput } from "../schemas/tool-outputs";
import { strictRespond, logger } from "../utils";

export const updateLeadTemperature = betaZodTool({
  name: "updateLeadTemperature",
  description:
    "Update the temperature / pipeline stage of a lead in the CRM based on their latest interaction.",
  inputSchema: z.object({
    lead_id: z.string(),
    temperature: z.enum(["cold", "warm", "hot", "closed_won", "closed_lost"]),
    pipeline_stage: z
      .enum([
        "outreach_sent",
        "follow_up_active",
        "call_requested",
        "demo_requested",
        "pricing_asked",
        "signup_ready",
        "closed",
      ])
      .optional(),
    note: z.string().optional().describe("Short reason for the change"),
  }),
  run: async (input) => {
    logger.tool("updateLeadTemperature", input);
    // Delegates to updateGoogleSheet in production
    return strictRespond(UpdateLeadTemperatureOutput, {
      success: true,
      lead_id: input.lead_id,
      temperature: input.temperature,
      pipeline_stage: input.pipeline_stage,
      note: input.note,
    });
  },
});
