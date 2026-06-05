import { notifyPendingDrafts } from "../services/notifier";
import { logger } from "../utils";

async function run(): Promise<void> {
  logger.info("workflow:notify", "Checking for drafts ready for review");
  await notifyPendingDrafts();
  logger.info("workflow:notify", "Done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
