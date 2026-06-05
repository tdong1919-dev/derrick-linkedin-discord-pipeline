import { runLeadResearcher } from "../agents/outbound/lead-researcher";
import { logger } from "../utils";

// Set this to whichever Derrick import tab you want to score.
// Format: import_YYYY_MM_DD (e.g. import_2026_05_31).
const IMPORT_TAB = process.env.IMPORT_TAB ?? "CRYSTAL_Business_Owners_2026_6_5";

const TASK = `Run today's lead research session for Autom8 — Business Owners campaign.

Context on this campaign:
- These are business owners sourced from LinkedIn ("owner" search).
- Goal: build genuine relationships, offer process automation consulting as a first step.
- NOT a SaaS pitch. Lead with operational efficiency and manual process pain, not AI.
- Many of these owners know they need automation/AI but are scared or don't know where to start.
- The angle: "Let's automate one existing manual process first. No AI required unless you want it."

1. Read leads from the Derrick import tab: ${IMPORT_TAB}.
2. Only process rows where "import leads status" = "new".
3. Score each lead using name + headline + location + linkedinUrl:
   - fit_score: Do they likely have manual/repetitive business processes? (owner, operator signals)
   - intent_score: Any signals of operational pain, growth, hiring, or scaling challenges?
   - timing_score: Are they actively posting, hiring, or in a growth phase?
4. Set autom8_angle to one of: "process_automation", "time_savings", "scaling_ops", "reducing_manual_work"
5. Write scored leads with fit_score >= 5 to the Leads tab with status Queued.
6. Flip the source row's "import leads status" to "scored" after processing.
7. Stop after processing the batch (or 25 rows, whichever comes first).`;

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
