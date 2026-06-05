import { runConnectionRequests } from "./outreach-draft-queue";
import { logger } from "../utils";

async function run(): Promise<void> {
  logger.info("workflow:connection-requests", "Queuing connection request drafts for hot leads");
  await runConnectionRequests();
  logger.info("workflow:connection-requests", "Completed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
