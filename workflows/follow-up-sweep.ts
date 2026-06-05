import { runFollowUpManager } from "../agents/outbound/follow-up-manager";
import { logger } from "../utils";

const TASK = `Run the follow-up sweep for Autom8.

1. Read the Leads tab and find all leads with status "Outreach Sent" or "Connection Request Sent".
2. For each lead, check Connection_Follow_Queue to see their current touch count and last touch date.
3. Determine which leads are due for a follow-up today based on cadence rules:
   - Touch 1: due 1 day after outreach sent
   - Touch 2+: due every 3 days after the last touch
4. For each due lead, draft a follow-up using generateOutreachMessage with a NEW angle (never repeat).
5. Schedule each draft via scheduleFollowUp — writes to Connection_Follow_Queue as pending_review.
6. Respect max touch limits: cold = 3, warm = 5, hot = 7.
7. Send closeout message as the final touch, then mark should_continue = false.
8. For hot leads overdue 48+ hours: notify founder via sendNotification before drafting.
9. Process up to 15 leads per run.`;

export async function run(): Promise<void> {
  logger.info("workflow:follow-up-sweep", "Starting follow-up sweep");
  await runFollowUpManager(TASK);
  logger.info("workflow:follow-up-sweep", "Completed");
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
