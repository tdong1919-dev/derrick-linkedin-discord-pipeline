import { z } from "zod";

export const AnalyticsReportSchema = z.object({
  report_id: z.string().regex(/^REPORT-\d+$/),
  report_date: z.string(),
  week_start: z.string(),
  week_end: z.string(),
  leads_added: z.number().int().nonnegative(),
  messages_sent: z.number().int().nonnegative(),
  replies_received: z.number().int().nonnegative(),
  reply_rate_pct: z.string(),
  positive_replies: z.number().int().nonnegative(),
  positive_reply_rate_pct: z.string(),
  calls_booked: z.number().int().nonnegative(),
  call_booking_rate_pct: z.string(),
  signups: z.number().int().nonnegative(),
  signup_rate_pct: z.string(),
  top_lead_type: z.string().optional(),
  top_channel: z.string().optional(),
  top_angle: z.string().optional(),
  top_objection_1: z.string().optional(),
  top_objection_2: z.string().optional(),
  top_objection_3: z.string().optional(),
  recommendation_1: z.string().optional(),
  recommendation_2: z.string().optional(),
  recommendation_3: z.string().optional(),
  pipeline_outreach_sent: z.number().int().nonnegative().optional(),
  pipeline_follow_up_active: z.number().int().nonnegative().optional(),
  pipeline_call_requested: z.number().int().nonnegative().optional(),
  pipeline_demo_requested: z.number().int().nonnegative().optional(),
  pipeline_pricing_asked: z.number().int().nonnegative().optional(),
  pipeline_signup_ready: z.number().int().nonnegative().optional(),
  pipeline_closed: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});

export const SignupSchema = z.object({
  signup_id: z.string().regex(/^SIGNUP-\d+$/),
  date: z.string(),
  lead_id: z.string(),
  name: z.string(),
  company: z.string().optional(),
  email: z.string().optional(),
  linkedin_url: z.string().optional(),
  instagram_url: z.string().optional(),
  plan_selected: z.string().optional(),
  acquisition_channel: z
    .enum(["LinkedIn", "Email", "Instagram DM", "Inbound", "Referral", "Other"])
    .optional(),
  first_outreach_date: z.string().optional(),
  days_to_signup: z.number().int().nonnegative().optional(),
  touch_count_at_signup: z.number().int().nonnegative().optional(),
  conversion_path: z.string().optional(),
  notes: z.string().optional(),
});

export type AnalyticsReportInput = z.infer<typeof AnalyticsReportSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
