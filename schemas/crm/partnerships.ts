import { z } from "zod";

export const PartnershipSchema = z.object({
  partnership_id: z.string().regex(/^PART-\d+$/, "Format: PART-001"),
  creator_id: z.string().regex(/^CREATOR-\d+$/),
  deliverable_type: z.enum(["testimonial_video", "collab_post", "affiliate_signup", "paid_post"]),
  status: z.enum(["pending", "in_progress", "delivered", "approved", "published"]),
  due_date: z.string().optional(),
  delivered_date: z.string().optional(),
  published_date: z.string().optional(),
  content_url: z.string().optional(),
  notes: z.string().optional(),
});

export type PartnershipInput = z.infer<typeof PartnershipSchema>;
