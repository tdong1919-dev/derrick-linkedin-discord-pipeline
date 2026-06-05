import express, { Request, Response, NextFunction } from "express";
import { env } from "../../config/env";
import { logger } from "../../utils";
import {
  ReplyReceivedPayload,
  CreatorReplyPayload,
  CallBookedPayload,
  SignupConfirmedPayload,
  FollowUpDuePayload,
} from "../../schemas/webhooks/inbound";
import {
  handleReplyReceived,
  handleCreatorReply,
  handleCallBooked,
  handleSignupConfirmed,
  handleFollowUpDue,
  handleRunLeads,
  handleRunOutreach,
  handleRunConnections,
  handleRunNotify,
  handleRunProcessReplies,
  handleRunFollowUps,
  handleRunSendQueue,
} from "./handlers";

const app = express();
app.use(express.json());

function validateSecret(req: Request, res: Response, next: NextFunction): void {
  if (!env.WEBHOOK_SECRET) {
    next();
    return;
  }
  const incoming = req.headers["x-webhook-secret"];
  if (incoming !== env.WEBHOOK_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/webhook/reply-received", validateSecret, async (req: Request, res: Response) => {
  const result = ReplyReceivedPayload.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid payload", details: result.error.issues });
    return;
  }
  await handleReplyReceived(result.data);
  res.status(200).json({ received: true });
});

app.post("/webhook/creator-reply", validateSecret, async (req: Request, res: Response) => {
  const result = CreatorReplyPayload.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid payload", details: result.error.issues });
    return;
  }
  await handleCreatorReply(result.data);
  res.status(200).json({ received: true });
});

app.post("/webhook/call-booked", validateSecret, async (req: Request, res: Response) => {
  const result = CallBookedPayload.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid payload", details: result.error.issues });
    return;
  }
  await handleCallBooked(result.data);
  res.status(200).json({ received: true });
});

app.post("/webhook/signup-confirmed", validateSecret, async (req: Request, res: Response) => {
  const result = SignupConfirmedPayload.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid payload", details: result.error.issues });
    return;
  }
  await handleSignupConfirmed(result.data);
  res.status(200).json({ received: true });
});

app.post("/webhook/follow-up-due", validateSecret, async (req: Request, res: Response) => {
  const result = FollowUpDuePayload.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid payload", details: result.error.issues });
    return;
  }
  await handleFollowUpDue(result.data);
  res.status(200).json({ received: true });
});

// ── Pipeline trigger routes (called by n8n cloud schedules) ──────────────────
// n8n cloud can't run Execute Command, so it POSTs here instead.
// Runs are async — respond 202 immediately so n8n doesn't time out.

app.post("/pipeline/leads", validateSecret, (_req: Request, res: Response) => {
  res.status(202).json({ started: true, workflow: "leads" });
  handleRunLeads().catch((err) => logger.error("pipeline:leads", String(err)));
});

app.post("/pipeline/outreach", validateSecret, (_req: Request, res: Response) => {
  res.status(202).json({ started: true, workflow: "outreach" });
  handleRunOutreach().catch((err) => logger.error("pipeline:outreach", String(err)));
});

app.post("/pipeline/connections", validateSecret, (_req: Request, res: Response) => {
  res.status(202).json({ started: true, workflow: "connections" });
  handleRunConnections().catch((err) => logger.error("pipeline:connections", String(err)));
});

app.post("/pipeline/notify", validateSecret, (_req: Request, res: Response) => {
  res.status(202).json({ started: true, workflow: "notify" });
  handleRunNotify().catch((err) => logger.error("pipeline:notify", String(err)));
});

app.post("/pipeline/process-replies", validateSecret, (_req: Request, res: Response) => {
  res.status(202).json({ started: true, workflow: "process-replies" });
  handleRunProcessReplies().catch((err) => logger.error("pipeline:process-replies", String(err)));
});

app.post("/pipeline/followups", validateSecret, (_req: Request, res: Response) => {
  res.status(202).json({ started: true, workflow: "followups" });
  handleRunFollowUps().catch((err) => logger.error("pipeline:followups", String(err)));
});

app.post("/pipeline/send-queue", validateSecret, (_req: Request, res: Response) => {
  res.status(202).json({ started: true, workflow: "send-queue" });
  handleRunSendQueue().catch((err) => logger.error("pipeline:send-queue", String(err)));
});

const port = parseInt(env.WEBHOOK_PORT, 10);
app.listen(port, () => {
  logger.info("webhook-server", `Listening on port ${port}`);
});

export { app };
