import { z } from "zod";

export const DraftReadyEvent = z.object({
  event: z.literal("draft_ready"),
  draft_id: z.string(),
  lead_id: z.string(),
  platform: z.enum(["instagram_dm", "linkedin_dm", "email"]),
  message_text: z.string(),
  status: z.literal("pending_review"),
});

export const NotificationEvent = z.object({
  event: z.literal("notify_founder"),
  priority: z.enum(["high", "normal"]),
  subject: z.string(),
  body: z.string(),
  lead_id: z.string().optional(),
  action_url: z.string().optional(),
});

export const FollowUpScheduledEvent = z.object({
  event: z.literal("follow_up_scheduled"),
  lead_id: z.string(),
  follow_up_date: z.string(),
  platform: z.enum(["instagram_dm", "linkedin_dm", "email"]),
  follow_up_number: z.number().int().positive(),
});

export const TemperatureChangedEvent = z.object({
  event: z.literal("temperature_changed"),
  lead_id: z.string(),
  from_temperature: z.string(),
  to_temperature: z.string(),
  pipeline_stage: z.string().optional(),
});

export type TDraftReadyEvent = z.infer<typeof DraftReadyEvent>;
export type TNotificationEvent = z.infer<typeof NotificationEvent>;
export type TFollowUpScheduledEvent = z.infer<typeof FollowUpScheduledEvent>;
export type TTemperatureChangedEvent = z.infer<typeof TemperatureChangedEvent>;
