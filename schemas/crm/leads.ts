import { z } from "zod";

export const LeadSchema = z.object({
  lead_id: z.string().regex(/^LEAD-\d+$/, "Format: LEAD-001"),
  date_added: z.string(),
  name: z.string(),
  company: z.string().optional(),
  role: z.string().optional(),
  lead_type: z.enum([
    "Ecommerce Brand Owner",
    "Shopify Store Owner",
    "Ecommerce Founder",
    "App Builder",
    "SaaS Founder",
    "CEO / Digital Business",
    "Marketing Agency",
    "Social Media Agency",
    "Growth Marketer",
    "Creator-Led Business",
    "Coach / Consultant / Educator",
    "Other",
  ]),
  linkedin_url: z.string().optional(),
  website: z.string().optional(),
  instagram_url: z.string().optional(),
  email: z.string().optional(),
  source: z.string().optional(),
  one_sentence_brief: z.string().optional(),
  content_style: z.string().optional(),
  audience_type: z.string().optional(),
  growth_stage_guess: z.enum(["Early", "Growing", "Scaling", "Established", "Unknown"]).optional(),
  fit_score: z.number().int().min(1).max(10).optional(),
  intent_score: z.number().int().min(1).max(10).optional(),
  timing_score: z.number().int().min(1).max(10).optional(),
  lead_temperature: z.enum(["Cold", "Warm", "Hot", "Qualified"]),
  lead_temperature_reasoning: z.string().optional(),
  autom8_angle: z.string().optional(),
  suggested_channel_priority: z
    .enum(["LinkedIn", "Email", "Instagram DM", "LinkedIn + Instagram", "Mixed"])
    .optional(),
  recommended_action: z
    .enum(["Add to Queue", "Research More", "Skip", "Already Contacted"])
    .optional(),
  status: z
    .enum([
      "New", "Queued", "Connection Request Sent", "Connected", "Outreach Sent",
      "No Reply", "Follow Up Active", "Replied Positive", "Replied Unclear",
      "Replied Objection", "Not Interested", "Call Requested", "Demo Requested",
      "Pricing Asked", "Signup Ready", "Closed Out", "Deal Closed", "Bad Fit",
    ])
    .default("New"),
  notes: z.string().optional(),
  date_contacted: z.string().optional(),
  date_last_updated: z.string().optional(),
  assigned_to: z.string().optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;
