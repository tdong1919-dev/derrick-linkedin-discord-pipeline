import { runCreatorResearcher } from "../agents/partnerships/creator-researcher";
import { logger } from "../utils";

const TASK = `Run creator partnership research for Autom8.
1. Search for micro and mid-tier Instagram creators in these niches:
   - Social media marketing and strategy
   - Ecommerce and Shopify education
   - Creator economy and content monetisation
   - Business growth and online entrepreneurship
   - Marketing tools and SaaS reviews
2. Filter for creators whose audience includes ecommerce founders, marketers, or online business builders.
3. Target: follower range 10k-500k, engagement rate > 2%.
4. Only log creators with audience_fit_score >= 6 to the Creators tab.
5. Target: 10-15 qualified creators per research session.`;

export async function run(): Promise<void> {
  logger.info("workflow:creator-research", "Starting creator research run");
  await runCreatorResearcher(TASK);
  logger.info("workflow:creator-research", "Completed");
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
