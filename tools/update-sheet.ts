import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { UpdateGoogleSheetOutput } from "../schemas/tool-outputs";
import { strictRespond, logger } from "../utils";
import { writeRow } from "../services/google-sheets";

export const updateGoogleSheet = betaZodTool({
  name: "updateGoogleSheet",
  description:
    "Write or update a row in the Autom8 Google Sheets CRM. Supports the Leads, Message_Drafts, Conversations, Analytics, Connection_Follow_Queue, Call_Requests, and Signups tabs.",
  inputSchema: z.object({
    tab: z.enum(["Leads", "Message_Drafts", "Conversations", "Analytics", "Connection_Follow_Queue", "Call_Requests", "Signups", "Send_Queue"]),
    row_id: z.string().optional().describe("Existing row ID to update (e.g. LEAD-001). Omit to append a new row."),
    data: z.record(z.string(), z.unknown()).describe("Key-value pairs matching the column names for the target tab"),
  }),
  run: async (input) => {
    logger.tool("updateGoogleSheet", input);
    const result = await writeRow(input.tab, input.data, input.row_id);
    return strictRespond(UpdateGoogleSheetOutput, {
      success: result.success,
      tab: input.tab,
      row_id: result.row_id,
      action: result.action,
      message: result.message,
    });
  },
});
