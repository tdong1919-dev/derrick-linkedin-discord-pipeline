import { runOutreachStrategist } from "../agents/outbound/outreach-strategist";
import { logger } from "../utils";

const TASK = `Process the outreach draft queue for Autom8.
1. Read the Leads sheet and find all leads with status "Queued" or "Connected" that do not yet have a draft in Message_Drafts.
2. For each qualifying lead, generate a personalised outreach message.
3. Set all drafts to pending_review status — nothing sends without founder approval.
4. Log each draft to the Message_Drafts tab.
5. Process up to 20 leads per run to avoid overloading the review queue.`;

const CONNECTION_REQUEST_TASK = `Queue LinkedIn connection request drafts for hot leads.
1. Read the Leads sheet and find all leads with lead_temperature = "hot" and platform = "linkedin_dm".
2. For each, check the Connection_Follow_Queue tab — skip any lead that already has a pending or approved connection request queued.
3. For each qualifying hot lead, call createConnectionRequestDraft using:
   - lead_name, lead_title (from role/headline), lead_company fields
   - personalization_signal: derive one honest signal from their headline, company, or autom8_angle field
   - angle: "curiosity"
4. Log each draft to the Connection_Follow_Queue tab (NOT Message_Drafts) with these exact columns:
   - lead_id: from the Leads row
   - name: lead's full name
   - company: lead's company
   - platform: "linkedin_dm"
   - action_type: "connection_request"
   - draft_content: the connection request note
   - touch_count: 0
   - status: "pending_review"
   - date_queued: today's date (ISO format)
5. Nothing sends without founder approval. Process up to 10 leads per run.
6. If a lead row has no lead_id, generate one as LEAD-XXX using the row number.`;

export async function run(): Promise<void> {
  logger.info("workflow:outreach-draft-queue", "Starting outreach draft queue run");
  await runOutreachStrategist(TASK);
  logger.info("workflow:outreach-draft-queue", "Completed");
}

export async function runConnectionRequests(): Promise<void> {
  logger.info("workflow:connection-requests", "Queuing connection request drafts for hot leads");
  await runOutreachStrategist(CONNECTION_REQUEST_TASK);
  logger.info("workflow:connection-requests", "Completed");
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
