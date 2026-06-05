import { runPartnershipOutreach } from "../agents/partnerships/partnership-outreach";
import { logger } from "../utils";

const TASK = `Process the partnership outreach queue for Autom8.
1. Read the Creators tab and find all creators with status "researched".
2. For each creator, generate a personalised partnership outreach message.
3. Choose the right offer based on their collab_tier:
   - micro (< 50k): free_access or affiliate
   - mid (50k-500k): collab_post or affiliate
   - macro (> 500k): paid or collab_post
4. Personalise each opener with a specific observation from their recent content or profile.
5. All drafts must be set to pending_review — nothing sends without founder approval.
6. Update each creator's status to "outreach_sent" after drafting.
7. Notify the founder with a count of how many drafts are ready for review.`;

export async function run(): Promise<void> {
  logger.info("workflow:partnership-outreach", "Starting partnership outreach run");
  await runPartnershipOutreach(TASK);
  logger.info("workflow:partnership-outreach", "Completed");
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
