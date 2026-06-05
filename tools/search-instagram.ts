import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { SearchInstagramCreatorsOutput } from "../schemas/tool-outputs";
import { strictRespond } from "../utils";
import { logger } from "../utils";

export const searchInstagramCreators = betaZodTool({
  name: "searchInstagramCreators",
  description:
    "Search Instagram for creators or influencers that match a niche, follower range, or engagement profile. Returns a list of matching profiles with handle, follower count, bio, and estimated engagement rate.",
  inputSchema: z.object({
    niche: z.string().describe("e.g. 'fitness coach', 'business tips', 'social media agency'"),
    min_followers: z.number().optional().describe("Minimum follower count"),
    max_followers: z.number().optional().describe("Maximum follower count"),
    location: z.string().optional().describe("City or country to filter by"),
    keywords: z.array(z.string()).optional().describe("Keywords to match in bio or captions"),
    limit: z.number().default(10).describe("Max results to return"),
  }),
  run: async (input) => {
    logger.tool("searchInstagramCreators", input);
    // TODO: integrate with Instagram Graph API / Apify / Phantombuster
    return strictRespond(SearchInstagramCreatorsOutput, {
      results: [],
      total_found: 0,
      query_summary: `Searched Instagram for "${input.niche}" creators — integration not yet wired up.`,
    });
  },
});
