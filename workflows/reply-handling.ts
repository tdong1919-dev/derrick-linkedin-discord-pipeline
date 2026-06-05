import { runReplyHandler } from "../agents/outbound/reply-handler";
import { logger } from "../utils";
import type { TReplyReceivedPayload } from "../schemas/webhooks/inbound";

export async function run(payload: TReplyReceivedPayload): Promise<void> {
  logger.info("workflow:reply-handling", `Processing reply for lead ${payload.lead_id}`);

  const task = `A lead just replied on ${payload.platform}.
Lead ID: ${payload.lead_id}
Reply text: "${payload.reply_text}"
Received at: ${payload.received_at}

Classify the reply, update the lead's temperature and pipeline stage in the CRM, log the conversation entry, and notify the founder if this is a high-intent signal (Wants Call, Wants Pricing, Wants Signup).`;

  await runReplyHandler(task);
  logger.info("workflow:reply-handling", "Completed");
}

if (require.main === module) {
  const examplePayload: TReplyReceivedPayload = {
    lead_id: "LEAD-001",
    platform: "linkedin_dm",
    reply_text: "Hey, yeah this looks interesting — what does it cost?",
    received_at: new Date().toISOString(),
  };
  run(examplePayload).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
