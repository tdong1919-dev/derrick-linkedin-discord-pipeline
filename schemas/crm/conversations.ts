import { z } from "zod";

export const ConversationSchema = z.object({
  conversation_id: z.string().regex(/^CONV-\d+$/),
  lead_id: z.string(),
  name: z.string(),
  company: z.string().optional(),
  platform: z.enum(["LinkedIn", "Email", "Instagram DM"]),
  reply_received_date: z.string(),
  reply_text: z.string(),
  reply_classification: z.enum([
    "Positive Interest", "Wants Demo", "Wants Pricing", "Wants Strategy Call",
    "Wants Signup Link", "Not Interested", "Objection", "Needs More Info",
    "Bad Fit", "Unclear",
  ]),
  lead_temperature_before: z.enum(["Cold", "Warm", "Hot", "Qualified"]),
  lead_temperature_after: z.enum(["Cold", "Warm", "Hot", "Qualified", "Closed"]),
  recommended_next_action: z.string().optional(),
  draft_reply: z.string().optional(),
  notify_founder: z.boolean(),
  notification_reason: z.string().optional(),
  status_update: z.string().optional(),
  human_approved: z.boolean().default(false),
  sent_date: z.string().optional(),
  notes: z.string().optional(),
});

export const CallRequestSchema = z.object({
  call_request_id: z.string().regex(/^CR-\d+$/),
  date: z.string(),
  lead_id: z.string(),
  name: z.string(),
  company: z.string().optional(),
  email: z.string().optional(),
  linkedin_url: z.string().optional(),
  instagram_url: z.string().optional(),
  platform: z.enum(["LinkedIn", "Email", "Instagram DM"]),
  reply_summary: z.string().optional(),
  recommended_next_action: z.string().optional(),
  booking_link_sent: z.enum(["Yes", "No"]).default("No"),
  booking_link_sent_date: z.string().optional(),
  call_booked: z.enum(["Yes", "No", "Pending"]).default("No"),
  call_date: z.string().optional(),
  call_outcome: z
    .enum([
      "", "Signed Up", "Interested - Follow Up", "Not a Fit",
      "No Show", "Rescheduled", "Demo Scheduled", "Closed Won", "Closed Lost",
    ])
    .optional(),
  notes: z.string().optional(),
});

export type ConversationInput = z.infer<typeof ConversationSchema>;
export type CallRequestInput = z.infer<typeof CallRequestSchema>;
