import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { ReadSheetOutput } from "../../schemas/tool-outputs";
import { strictRespond, logger } from "../../utils";
import { readRows } from "../../services/google-sheets";
import type { SheetTab } from "../../services/google-sheets";

export const readSheet = betaZodTool({
  name: "readSheet",
  description:
    "Read rows from a Google Sheets tab. Optionally filter by a column value and limit results. Returns the matching rows as structured data.",
  inputSchema: z.object({
    tab: z
      .string()
      .describe("Sheet tab name: Leads, Message_Drafts, Conversations, Creators, Partnerships, etc."),
    filter_column: z.string().optional().describe("Column name to filter on"),
    filter_value: z.string().optional().describe("Value to match in the filter column"),
    limit: z.number().int().positive().optional().describe("Max rows to return"),
  }),
  run: async (input) => {
    logger.tool("readSheet", input);
    const result = await readRows(
      input.tab as SheetTab,
      input.filter_column,
      input.filter_value,
      input.limit
    );
    return strictRespond(ReadSheetOutput, {
      tab: input.tab,
      rows: result.rows,
      count: result.count,
    });
  },
});
