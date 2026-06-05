import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { ReadRawLeadsOutput } from "../schemas/tool-outputs";
import { strictRespond, logger } from "../utils";
import { readRows } from "../services/google-sheets";
import type { SheetTab } from "../services/google-sheets";

/**
 * readRawLeads
 *
 * Replaces the previous LinkedIn scraper stub. LinkedIn enrichment is now
 * handled OUTSIDE this codebase by the Derrick Google Sheets extension.
 * Each Derrick import lands in its own dated tab named `import_YYYY_MM_DD`
 * with columns: name, headline, location, linkedinUrl, import leads status.
 *
 * The agent reads `status = "new"` rows, scores them, writes to the Leads
 * tab, and flips the source row's status to "scored".
 */
export const readRawLeads = betaZodTool({
  name: "readRawLeads",
  description:
    "Read LinkedIn leads from a Derrick import tab in Google Sheets. " +
    "The tab is named `import_YYYY_MM_DD` (e.g. import_2026_05_31). " +
    "Columns: name, headline, location, linkedinUrl, `import leads status`. " +
    "Defaults to returning rows with status='new' (un-scored). " +
    "If you don't know the latest import tab name, ask the user.",
  inputSchema: z.object({
    tab_name: z
      .string()
      .describe(
        "The Derrick import tab to read from, e.g. 'import_2026_05_31'. " +
          "Must start with 'import_'."
      ),
    filter_status: z
      .enum(["new", "scored", "skipped", "all"])
      .default("new")
      .describe("Filter on the `import leads status` column. 'new' = un-scored."),
    limit: z.number().int().positive().default(25).describe("Max rows to return"),
  }),
  run: async (input) => {
    logger.tool("readRawLeads", input);

    const ALLOWED_PREFIXES = ["import_", "CRYSTAL_"];
    if (!ALLOWED_PREFIXES.some((p) => input.tab_name.startsWith(p))) {
      throw new Error(
        `tab_name must start with one of: ${ALLOWED_PREFIXES.join(", ")} (got: ${input.tab_name})`
      );
    }

    const filterColumn =
      input.filter_status === "all" ? undefined : "import leads status";
    const filterValue =
      input.filter_status === "all" ? undefined : input.filter_status;

    const result = await readRows(
      input.tab_name as SheetTab,
      filterColumn,
      filterValue,
      input.limit
    );

    return strictRespond(ReadRawLeadsOutput, {
      tab: input.tab_name,
      rows: result.rows,
      count: result.count,
      note:
        result.count === 0
          ? `No leads matched in ${input.tab_name}. Check that rows have 'import leads status' = 'new'.`
          : `Returned ${result.count} lead(s) from ${input.tab_name} for scoring.`,
    });
  },
});

// Backwards-compat alias.
export const searchLinkedInLeads = readRawLeads;
