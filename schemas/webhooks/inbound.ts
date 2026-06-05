import { z } from "zod";

export const ReplyReceivedPayload = z.object({
  lead_id: z.string(),
  platform: z.enum(["instagram_dm", "linkedin_dm", "email"]),
  reply_text: z.string(),
  received_at: z.string(),
});

export const CreatorReplyPayload = z.object({
  creator_id: z.string(),
  platform: z.enum(["instagram", "tiktok", "youtube", "linkedin"]),
  reply_text: z.string(),
  received_at: z.string(),
});

export const CallBookedPayload = z.object({
  lead_id: z.string(),
  calendly_event_id: z.string(),
  scheduled_at: z.string(),
  attendee_email: z.string().email(),
});

export const SignupConfirmedPayload = z.object({
  lead_id: z.string(),
  email: z.string().email(),
  plan: z.string(),
  signed_up_at: z.string(),
});

export const FollowUpDuePayload = z.object({
  lead_id: z.string(),
  follow_up_number: z.number().int().positive(),
  platform: z.enum(["instagram_dm", "linkedin_dm", "email"]),
  draft_message: z.string().optional(),
});

export type TReplyReceivedPayload = z.infer<typeof ReplyReceivedPayload>;
export type TCreatorReplyPayload = z.infer<typeof CreatorReplyPayload>;
export type TCallBookedPayload = z.infer<typeof CallBookedPayload>;
export type TSignupConfirmedPayload = z.infer<typeof SignupConfirmedPayload>;
export type TFollowUpDuePayload = z.infer<typeof FollowUpDuePayload>;
