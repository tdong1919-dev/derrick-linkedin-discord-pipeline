import { z } from "zod";

// ─── Shared enums ────────────────────────────────────────────────────────────

export const Platform = z.enum(["instagram_dm", "linkedin_dm", "email"]);

export const LeadTemperature = z.enum(["cold", "warm", "hot", "closed_won", "closed_lost"]);

export const PipelineStage = z.enum([
  "outreach_sent",
  "follow_up_active",
  "call_requested",
  "demo_requested",
  "pricing_asked",
  "signup_ready",
  "closed",
]);

export const ReplyClassification = z.enum([
  "Positive Interest",
  "Wants Demo",
  "Wants Call",
  "Wants Pricing",
  "Wants Signup",
  "Not Interested",
  "Objection",
  "Unsubscribe",
  "Needs More Info",
  "Out of Office",
]);

export const DraftStatus = z.enum(["pending_review", "approved", "rejected", "sent", "paused", "expired"]);

// ─── Tool output schemas ─────────────────────────────────────────────────────

export const InstagramCreatorProfile = z.object({
  handle: z.string(),
  follower_count: z.number().int().nonnegative(),
  bio: z.string(),
  estimated_engagement_rate: z.number().min(0).max(100),
  profile_url: z.string().url(),
  niche: z.string(),
});

export const SearchInstagramCreatorsOutput = z.object({
  results: z.array(InstagramCreatorProfile),
  total_found: z.number().int().nonnegative(),
  query_summary: z.string(),
});

export const LinkedInLeadProfile = z.object({
  name: z.string(),
  title: z.string(),
  company: z.string(),
  linkedin_url: z.string().url(),
  location: z.string().optional(),
  headline: z.string().optional(),
});

export const SearchLinkedInLeadsOutput = z.object({
  results: z.array(LinkedInLeadProfile),
  total_found: z.number().int().nonnegative(),
  query_summary: z.string(),
});

export const CreateConnectionRequestDraftOutput = z.object({
  draft: z.string().max(300),
  character_count: z.number().int().nonnegative(),
  angle_used: z.string(),
});

export const GenerateOutreachMessageOutput = z.object({
  lead_id: z.string(),
  platform: Platform,
  draft: z.string(),
  status: DraftStatus,
  angle_used: z.string(),
  cta_used: z.string(),
});

export const UpdateGoogleSheetOutput = z.object({
  success: z.boolean(),
  tab: z.string(),
  row_id: z.string().optional(),
  action: z.enum(["created", "updated"]),
  message: z.string(),
});

export const ClassifyReplyOutput = z.object({
  lead_id: z.string(),
  platform: Platform,
  classification: ReplyClassification,
  confidence: z.enum(["high", "medium", "low"]),
  suggested_next_action: z.string(),
  notify_founder: z.boolean(),
  note: z.string().optional(),
});

export const UpdateLeadTemperatureOutput = z.object({
  success: z.boolean(),
  lead_id: z.string(),
  temperature: LeadTemperature,
  pipeline_stage: PipelineStage.optional(),
  note: z.string().optional(),
});

export const ScheduleFollowUpOutput = z.object({
  scheduled: z.boolean(),
  lead_id: z.string(),
  follow_up_date: z.string(),
  follow_up_number: z.number().int().positive(),
  platform: Platform,
  draft_message: z.string().optional(),
});

export const SendNotificationOutput = z.object({
  sent: z.boolean(),
  channel: z.enum(["discord", "email", "sms"]),
  priority: z.enum(["high", "normal"]),
  lead_id: z.string().optional(),
});

export const CreateCallRequestOutput = z.object({
  lead_id: z.string(),
  message_draft: z.string(),
  calendly_url: z.string().url(),
  status: DraftStatus,
  logged: z.boolean(),
});

export const SendAutom8LinkOutput = z.object({
  lead_id: z.string(),
  platform: Platform,
  message_draft: z.string(),
  autom8_url: z.string().url(),
  status: DraftStatus,
});

// ─── Creator partnership tool output schemas ──────────────────────────────────

export const CreatorPlatform = z.enum(["instagram", "tiktok", "youtube", "linkedin"]);

export const CollabTier = z.enum(["micro", "mid", "macro"]);

export const CreatorProfile = z.object({
  handle: z.string(),
  full_name: z.string(),
  follower_count: z.number().int().nonnegative(),
  engagement_rate: z.number().min(0).max(100),
  niche: z.string(),
  audience_description: z.string(),
  platform: CreatorPlatform,
  audience_fit_score: z.number().int().min(1).max(10),
  collab_tier: CollabTier,
});

export const SearchCreatorsOutput = z.object({
  results: z.array(CreatorProfile),
  total_found: z.number().int().nonnegative(),
  query_summary: z.string(),
});

export const GeneratePartnershipMessageOutput = z.object({
  creator_id: z.string(),
  platform: CreatorPlatform,
  draft: z.string(),
  status: z.literal("pending_review"),
  offer_included: z.string(),
  personalization_note: z.string(),
});

export const CreatorReplyClassification = z.enum([
  "Interested",
  "Wants Details",
  "Wants Paid Only",
  "Not Interested",
  "Already Has Tool",
  "Objection",
  "Out of Office",
  "Unclear",
]);

export const ClassifyCreatorReplyOutput = z.object({
  creator_id: z.string(),
  classification: CreatorReplyClassification,
  confidence: z.enum(["high", "medium", "low"]),
  suggested_next_action: z.string(),
  notify_founder: z.boolean(),
});

export const ReadSheetOutput = z.object({
  tab: z.string(),
  rows: z.array(z.record(z.string(), z.unknown())),
  count: z.number().int().nonnegative(),
});

export const ReadRawLeadsOutput = z.object({
  tab: z.string(),
  rows: z.array(z.record(z.string(), z.unknown())),
  count: z.number().int().nonnegative(),
  note: z.string(),
});

export const PendingFollowUp = z.object({
  lead_id: z.string(),
  follow_up_date: z.string(),
  follow_up_number: z.number().int().positive(),
  platform: Platform,
  draft_message: z.string().optional(),
});

export const GetPendingFollowUpsOutput = z.object({
  follow_ups: z.array(PendingFollowUp),
  count: z.number().int().nonnegative(),
});

// ─── Type exports ─────────────────────────────────────────────────────────────

export type TSearchInstagramCreatorsOutput = z.infer<typeof SearchInstagramCreatorsOutput>;
export type TSearchLinkedInLeadsOutput = z.infer<typeof SearchLinkedInLeadsOutput>;
export type TCreateConnectionRequestDraftOutput = z.infer<typeof CreateConnectionRequestDraftOutput>;
export type TGenerateOutreachMessageOutput = z.infer<typeof GenerateOutreachMessageOutput>;
export type TUpdateGoogleSheetOutput = z.infer<typeof UpdateGoogleSheetOutput>;
export type TClassifyReplyOutput = z.infer<typeof ClassifyReplyOutput>;
export type TUpdateLeadTemperatureOutput = z.infer<typeof UpdateLeadTemperatureOutput>;
export type TScheduleFollowUpOutput = z.infer<typeof ScheduleFollowUpOutput>;
export type TSendNotificationOutput = z.infer<typeof SendNotificationOutput>;
export type TCreateCallRequestOutput = z.infer<typeof CreateCallRequestOutput>;
export type TSendAutom8LinkOutput = z.infer<typeof SendAutom8LinkOutput>;
export type TSearchCreatorsOutput = z.infer<typeof SearchCreatorsOutput>;
export type TCreatorProfile = z.infer<typeof CreatorProfile>;
export type TGeneratePartnershipMessageOutput = z.infer<typeof GeneratePartnershipMessageOutput>;
export type TClassifyCreatorReplyOutput = z.infer<typeof ClassifyCreatorReplyOutput>;
export type TReadSheetOutput = z.infer<typeof ReadSheetOutput>;
export type TPendingFollowUp = z.infer<typeof PendingFollowUp>;
export type TGetPendingFollowUpsOutput = z.infer<typeof GetPendingFollowUpsOutput>;
export type TReadRawLeadsOutput = z.infer<typeof ReadRawLeadsOutput>;
