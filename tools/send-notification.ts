import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { SendNotificationOutput } from "../schemas/tool-outputs";
import { strictRespond, logger } from "../utils";
import { sendDiscordNotification } from "../services/discord";

export const sendNotification = betaZodTool({
  name: "sendNotification",
  description:
    "Send an urgent or important notification to the Autom8 founder via Discord or email. Use for high-intent signals: wants call, wants demo, hot lead, or error alerts.",
  inputSchema: z.object({
    channel: z.enum(["discord", "email", "sms"]),
    priority: z.enum(["high", "normal"]).default("normal"),
    subject: z.string().describe("Short notification header"),
    body: z.string().describe("Full notification body"),
    lead_id: z.string().optional().describe("Related lead ID if applicable"),
    action_url: z.string().optional().describe("Deep-link to Google Sheet row or CRM record"),
  }),
  run: async (input) => {
    logger.tool("sendNotification", input);

    if (input.channel === "discord") {
      await sendDiscordNotification({
        subject: input.subject,
        body: input.body,
        priority: input.priority,
        leadId: input.lead_id,
        actionUrl: input.action_url,
      });
    }
    // TODO: add email (SendGrid) and SMS (Twilio) branches

    return strictRespond(SendNotificationOutput, {
      sent: true,
      channel: input.channel,
      priority: input.priority,
      lead_id: input.lead_id,
    });
  },
});
