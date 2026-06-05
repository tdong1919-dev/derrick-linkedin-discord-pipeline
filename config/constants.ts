export const PIPELINE_STAGES = {
  OUTREACH_SENT: "outreach_sent",
  FOLLOW_UP_ACTIVE: "follow_up_active",
  CALL_REQUESTED: "call_requested",
  DEMO_REQUESTED: "demo_requested",
  PRICING_ASKED: "pricing_asked",
  SIGNUP_READY: "signup_ready",
  CLOSED: "closed",
} as const;

export const LEAD_TEMPERATURES = {
  COLD: "cold",
  WARM: "warm",
  HOT: "hot",
  CLOSED_WON: "closed_won",
  CLOSED_LOST: "closed_lost",
} as const;

export const REPLY_CLASSIFICATIONS = {
  POSITIVE_INTEREST: "Positive Interest",
  WANTS_DEMO: "Wants Demo",
  WANTS_CALL: "Wants Call",
  WANTS_PRICING: "Wants Pricing",
  WANTS_SIGNUP: "Wants Signup",
  NOT_INTERESTED: "Not Interested",
  OBJECTION: "Objection",
  UNSUBSCRIBE: "Unsubscribe",
  NEEDS_MORE_INFO: "Needs More Info",
  OUT_OF_OFFICE: "Out of Office",
} as const;

export const CREATOR_COLLAB_TIERS = {
  MICRO: "micro",
  MID: "mid",
  MACRO: "macro",
} as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[keyof typeof PIPELINE_STAGES];
export type LeadTemperature = (typeof LEAD_TEMPERATURES)[keyof typeof LEAD_TEMPERATURES];
export type ReplyClassification = (typeof REPLY_CLASSIFICATIONS)[keyof typeof REPLY_CLASSIFICATIONS];
export type CreatorCollabTier = (typeof CREATOR_COLLAB_TIERS)[keyof typeof CREATOR_COLLAB_TIERS];
