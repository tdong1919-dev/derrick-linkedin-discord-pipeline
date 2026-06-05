import { runLeadResearcher } from "../agents/outbound/lead-researcher";
import { logger } from "../utils";

// Set this to whichever Derrick import tab you want to score.
// Format: import_YYYY_MM_DD (e.g. import_2026_05_31).
const IMPORT_TAB = process.env.IMPORT_TAB ?? "import_2026_05_31";

const TASK = `Run today's lead research session for Autom8.
1. Read leads from the Derrick import tab: ${IMPORT_TAB}.
2. Only process rows where "import leads status" = "new".
3. Score each lead (fit, intent, timing) using name + headline + location + linkedinUrl.
4. Write scored leads with fit_score >= 6 to the Leads tab with status Queued.
5. Flip the source row's "import leads status" to "scored" after processing.
6. Stop after processing the batch (or 25 rows, whichever comes first).`;

export async function run(): Promise<void> {
  logger.info("workflow:daily-lead-research", "Starting daily lead research run");
  await runLeadResearcher(TASK);
  logger.info("workflow:daily-lead-research", "Completed");
}

// Run directly: ts-node workflows/daily-lead-research.ts
if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
