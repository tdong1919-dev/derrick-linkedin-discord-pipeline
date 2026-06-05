import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { SearchCreatorsOutput } from "../../schemas/tool-outputs";
import { strictRespond, logger } from "../../utils";

export const searchCreators = betaZodTool({
  name: "searchCreators",
  description:
    "Search Instagram for creators whose audiences are creators, ecommerce founders, marketers, or online business builders. Returns profiles with follower count, engagement rate, niche, and audience fit score for Autom8 partnership outreach.",
  inputSchema: z.object({
    niche: z.string().describe("e.g. 'social media marketing', 'ecommerce tips', 'creator economy'"),
    audience_type: z
      .string()
      .describe("Target audience: 'creators', 'ecommerce founders', 'marketers', 'online business builders'"),
    min_followers: z.number().int().nonnegative().describe("Minimum follower count"),
    max_followers: z.number().int().nonnegative().describe("Maximum follower count"),
    min_engagement_rate: z.number().min(0).max(100).describe("Minimum engagement rate percentage"),
    location: z.string().optional().describe("City or country to filter by"),
    limit: z.number().int().positive().default(10).describe("Max results to return"),
  }),
  run: async (input) => {
    logger.tool("searchCreators", input);
    // TODO: integrate with Instagram Graph API, Apify, or Modash
    // 1. Build search query from niche + audience_type + location.
    // 2. Call creator search API with follower range and engagement filters.
    // 3. Score each result for audience_fit (1-10) based on how well their audience
    //    overlaps with Autom8's ICP: ecommerce founders, creators, marketers.
    // 4. Assign collab_tier: micro (<50k), mid (50k-500k), macro (>500k).
    return strictRespond(SearchCreatorsOutput, {
      results: [],
      total_found: 0,
      query_summary: `Searched for "${input.niche}" creators targeting "${input.audience_type}" — integration not yet wired up.`,
    });
  },
});
