import { logger } from "../../utils";
import { runLeadResearcher } from "../outbound/lead-researcher";
import { runOutreachStrategist } from "../outbound/outreach-strategist";
import { runFollowUpManager } from "../outbound/follow-up-manager";
import { runReplyHandler } from "../outbound/reply-handler";
import { runSalesAnalyzer } from "../outbound/sales-analyzer";
import { runCreatorResearcher } from "../partnerships/creator-researcher";
import { runPartnershipOutreach } from "../partnerships/partnership-outreach";
import { runCollaborationTracker } from "../partnerships/collaboration-tracker";

export type OrchestratorEventType =
  | "lead_research"
  | "outreach_draft"
  | "follow_up_sweep"
  | "reply_received"
  | "weekly_analysis"
  | "creator_research"
  | "partnership_outreach"
  | "creator_reply";

export interface OrchestratorEvent {
  type: OrchestratorEventType;
  payload: unknown;
}

export async function runOrchestrator(event: OrchestratorEvent): Promise<void> {
  logger.info("orchestrator", `Event received: ${event.type}`);
  const start = Date.now();

  const task = typeof event.payload === "string" ? event.payload : JSON.stringify(event.payload);

  switch (event.type) {
    case "lead_research":
      await runLeadResearcher(task);
      break;
    case "outreach_draft":
      await runOutreachStrategist(task);
      break;
    case "follow_up_sweep":
      await runFollowUpManager(task);
      break;
    case "reply_received":
      await runReplyHandler(task);
      break;
    case "weekly_analysis":
      await runSalesAnalyzer(task);
      break;
    case "creator_research":
      await runCreatorResearcher(task);
      break;
    case "partnership_outreach":
      await runPartnershipOutreach(task);
      break;
    case "creator_reply":
      await runCollaborationTracker(task);
      break;
    default: {
      const unhandled: never = event.type;
      logger.warn("orchestrator", `Unhandled event type: ${unhandled}`);
    }
  }

  logger.info("orchestrator", `Event ${event.type} completed in ${Date.now() - start}ms`);
}
