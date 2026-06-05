import { z } from "zod";

export const CreatorSchema = z.object({
  creator_id: z.string().regex(/^CREATOR-\d+$/, "Format: CREATOR-001"),
  handle: z.string().describe("Instagram handle without @"),
  full_name: z.string(),
  niche: z.string(),
  follower_count: z.number().int().nonnegative(),
  engagement_rate: z.number().min(0).max(100),
  audience_fit_score: z.number().int().min(1).max(10),
  platform: z.enum(["instagram", "tiktok", "youtube", "linkedin"]),
  collab_tier: z.enum(["micro", "mid", "macro"]),
  offer_sent: z.enum(["free_access", "testimonial", "collab_post", "affiliate", "paid", "none"]),
  status: z.enum([
    "researched",
    "outreach_sent",
    "replied_positive",
    "replied_negative",
    "negotiating",
    "content_delivered",
    "affiliate_active",
    "closed",
  ]),
  affiliate_code: z.string().optional(),
  affiliate_link: z.string().optional(),
  content_due_date: z.string().optional(),
  content_delivered_date: z.string().optional(),
  notes: z.string().optional(),
  date_added: z.string(),
  date_last_updated: z.string(),
});

export type CreatorInput = z.infer<typeof CreatorSchema>;
