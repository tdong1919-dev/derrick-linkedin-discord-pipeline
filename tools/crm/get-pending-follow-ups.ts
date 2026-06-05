import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { GetPendingFollowUpsOutput } from "../../schemas/tool-outputs";
import { strictRespond, logger } from "../../utils";
import { getPendingFollowUps } from "../../services/google-sheets";

type AllowedPlatform = "instagram_dm" | "linkedin_dm" | "email";
const ALLOWED_PLATFORMS = new Set<AllowedPlatform>(["instagram_dm", "linkedin_dm", "email"]);

function normalizePlatform(p: string): AllowedPlatform {
  if (ALLOWED_PLATFORMS.has(p as AllowedPlatform)) return p as AllowedPlatform;
  return "linkedin_dm"; // safe fallback
}

export const getPendingFollowUpsTool = betaZodTool({
  name: "getPendingFollowUps",
  description:
    "Fetch leads that are due for a follow-up. Optionally filter by days overdue and platform. Returns a list of follow-ups with lead ID, due date, follow-up number, and optional draft message.",
  inputSchema: z.object({
    days_overdue: z
      .number()
      .int()
      .nonnegative()
      .default(0)
      .describe("Include follow-ups overdue by this many days or more (0 = due today or earlier)"),
    platform: z
      .enum(["instagram_dm", "linkedin_dm", "email"])
      .optional()
      .describe("Filter by platform"),
    limit: z.number().int().positive().optional().describe("Max results to return"),
  }),
  run: async (input) => {
    logger.tool("getPendingFollowUps", input);
    const result = await getPendingFollowUps(input.days_overdue, input.platform);
    const raw = input.limit ? result.follow_ups.slice(0, input.limit) : result.follow_ups;
    const rows = raw.map((r) => ({ ...r, platform: normalizePlatform(r.platform) }));
    return strictRespond(GetPendingFollowUpsOutput, {
      follow_ups: rows,
      count: rows.length,
    });
  },
});
