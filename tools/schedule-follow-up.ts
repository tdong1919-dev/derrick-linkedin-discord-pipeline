import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { ScheduleFollowUpOutput } from "../schemas/tool-outputs";
import { strictRespond, logger } from "../utils";
import { writeRow } from "../services/google-sheets";

export const scheduleFollowUp = betaZodTool({
  name: "scheduleFollowUp",
  description:
    "Schedule a follow-up message for a lead. Writes the follow-up to the Connection_Follow_Queue tab so it gets picked up when due. Draft is always pending_review — nothing sends automatically.",
  inputSchema: z.object({
    lead_id: z.string(),
    name: z.string().optional().describe("Lead's full name"),
    company: z.string().optional().describe("Lead's company"),
    follow_up_date: z.string().describe("ISO 8601 date, e.g. '2026-06-07'"),
    platform: z.enum(["instagram_dm", "linkedin_dm", "email"]),
    follow_up_number: z.number().int().positive().describe("1 = first follow-up, 2 = second, etc."),
    draft_message: z.string().optional().describe("Pre-written follow-up text. Leave blank to generate at send time."),
    angle: z.string().optional().describe("The follow-up angle used (e.g. time_saving, missed_leads)"),
  }),
  run: async (input) => {
    logger.tool("scheduleFollowUp", input);

    const queue_id = `FU-${input.lead_id}-${input.follow_up_number}-${Date.now()}`;

    await writeRow("Connection_Follow_Queue", {
      queue_id,
      lead_id: input.lead_id,
      name: input.name ?? "",
      company: input.company ?? "",
      platform: input.platform,
      action_type: "follow_up",
      draft_content: input.draft_message ?? "",
      touch_count: input.follow_up_number,
      status: "pending_review",
      date_queued: new Date().toISOString().split("T")[0],
      date_approved: "",
      date_sent: "",
      notes: input.angle ? `Angle: ${input.angle}` : "",
      // used by getPendingFollowUps to determine when to surface this
      next_touch_date: input.follow_up_date,
      should_continue: "true",
    });

    return strictRespond(ScheduleFollowUpOutput, {
      scheduled: true,
      lead_id: input.lead_id,
      follow_up_date: input.follow_up_date,
      follow_up_number: input.follow_up_number,
      platform: input.platform,
      draft_message: input.draft_message,
    });
  },
});
