import { logger } from "../../utils";
import { writeRow } from "../google-sheets";
import { sendDiscordNotification } from "../discord";
import { runReplyHandler } from "../../agents/outbound/reply-handler";
import { runCollaborationTracker } from "../../agents/partnerships/collaboration-tracker";
import { runFollowUpManager } from "../../agents/outbound/follow-up-manager";
import type {
  TReplyReceivedPayload,
  TCreatorReplyPayload,
  TCallBookedPayload,
  TSignupConfirmedPayload,
  TFollowUpDuePayload,
} from "../../schemas/webhooks/inbound";

export async function handleReplyReceived(payload: TReplyReceivedPayload): Promise<void> {
  logger.info("webhook:handleReplyReceived", payload);
  await runReplyHandler(
    `A lead replied on ${payload.platform}. Lead ID: ${payload.lead_id}. Reply: "${payload.reply_text}". Received at ${payload.received_at}. Classify the reply, update the CRM, and notify the founder if high-intent.`
  );
}

export async function handleCreatorReply(payload: TCreatorReplyPayload): Promise<void> {
  logger.info("webhook:handleCreatorReply", payload);
  await runCollaborationTracker(
    `Creator ${payload.creator_id} replied on ${payload.platform}: "${payload.reply_text}". Classify this reply, update their collaboration status in the Creators sheet, and notify the founder if they are interested or want details.`
  );
}

export async function handleCallBooked(payload: TCallBookedPayload): Promise<void> {
  logger.info("webhook:handleCallBooked", payload);

  await writeRow("Call_Requests", {
    lead_id: payload.lead_id,
    date: new Date().toISOString().split("T")[0],
    booking_link_sent: "Yes",
    call_booked: "Yes",
    call_date: payload.scheduled_at.split("T")[0],
    email: payload.attendee_email,
    notes: `Calendly event: ${payload.calendly_event_id}`,
  });

  await writeRow("Leads", {
    lead_id: payload.lead_id,
    status: "Call Requested",
    lead_temperature: "hot",
    date_last_updated: new Date().toISOString().split("T")[0],
  }, payload.lead_id);

  await sendDiscordNotification({
    subject: `Strategy call booked — ${payload.lead_id}`,
    body: `*${payload.lead_id}* booked a call for *${payload.scheduled_at}*\nEmail: ${payload.attendee_email}`,
    priority: "high",
    leadId: payload.lead_id,
  });
}

export async function handleSignupConfirmed(payload: TSignupConfirmedPayload): Promise<void> {
  logger.info("webhook:handleSignupConfirmed", payload);

  await writeRow("Signups", {
    signup_id: `SIGNUP-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    lead_id: payload.lead_id,
    email: payload.email,
    plan_selected: payload.plan,
    acquisition_channel: "LinkedIn",
  });

  await writeRow("Leads", {
    lead_id: payload.lead_id,
    status: "Deal Closed",
    lead_temperature: "closed_won",
    date_last_updated: new Date().toISOString().split("T")[0],
  }, payload.lead_id);

  await sendDiscordNotification({
    subject: `New signup — ${payload.lead_id} on ${payload.plan}`,
    body: `*${payload.email}* just signed up for *${payload.plan}*.\nLead ID: ${payload.lead_id}`,
    priority: "high",
    leadId: payload.lead_id,
  });
}

// ── Pipeline trigger handlers (called by /pipeline/* routes) ─────────────────

export async function handleRunLeads(): Promise<void> {
  logger.info("pipeline:leads", "Starting lead research run via webhook");
  const { run } = await import("../../workflows/daily-lead-research");
  await run();
}

export async function handleRunOutreach(): Promise<void> {
  logger.info("pipeline:outreach", "Starting outreach drafts run via webhook");
  const { run } = await import("../../workflows/outreach-draft-queue");
  await run();
}

export async function handleRunConnections(): Promise<void> {
  logger.info("pipeline:connections", "Starting connection requests run via webhook");
  const { runConnectionRequests } = await import("../../workflows/outreach-draft-queue");
  await runConnectionRequests();
}

export async function handleRunNotify(): Promise<void> {
  logger.info("pipeline:notify", "Starting notify run via webhook");
  const { notifyPendingDrafts } = await import("../notifier");
  await notifyPendingDrafts();
}

export async function handleRunProcessReplies(): Promise<void> {
  logger.info("pipeline:process-replies", "Processing inbound replies via webhook");
  const { run } = await import("../../workflows/process-replies");
  await run();
}

export async function handleRunFollowUps(): Promise<void> {
  logger.info("pipeline:followups", "Starting follow-up sweep via webhook");
  const { run } = await import("../../workflows/follow-up-sweep");
  await run();
}

export async function handleRunSendQueue(): Promise<void> {
  logger.info("pipeline:send-queue", "Building send queue via webhook");
  const { run } = await import("../../workflows/build-send-queue");
  await run();
}

// ─────────────────────────────────────────────────────────────────────────────

export async function handleFollowUpDue(payload: TFollowUpDuePayload): Promise<void> {
  logger.info("webhook:handleFollowUpDue", payload);
  await runFollowUpManager(
    `Follow-up #${payload.follow_up_number} is due for lead ${payload.lead_id} on ${payload.platform}.${payload.draft_message ? ` Pre-written draft: "${payload.draft_message}".` : ""} Draft the follow-up message and schedule the next touch.`
  );
}
