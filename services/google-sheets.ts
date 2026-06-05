import { google } from "googleapis";
import { env } from "../config/env";

// Known fixed tabs + a template-literal escape hatch for dated import tabs
// like `import_2026_05_31`. Each Derrick import lands in its own dated tab.
export type SheetTab =
  | "Leads"
  | "Raw_Leads"
  | "Message_Drafts"
  | "Conversations"
  | "Analytics"
  | "Call_Requests"
  | "Signups"
  | "Creators"
  | "Partnerships"
  | "Connection_Follow_Queue"
  | "Inbound_Replies"
  | "Send_Queue"
  | `import_${string}`
  | `CRYSTAL_${string}`;

export type WriteResult = {
  success: boolean;
  row_id?: string;
  action: "created" | "updated";
  message: string;
};

export type ReadResult = {
  rows: Record<string, unknown>[];
  count: number;
};

export type PendingFollowUpRow = {
  lead_id: string;
  follow_up_date: string;
  follow_up_number: number;
  platform: string;
  draft_message?: string;
};

export type PendingFollowUpsResult = {
  follow_ups: PendingFollowUpRow[];
  count: number;
};

function getSheets() {
  const credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function readRows(
  tab: SheetTab,
  filterColumn?: string,
  filterValue?: string,
  limit?: number
): Promise<ReadResult> {
  const sheets = getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SHEETS_ID,
    range: `${tab}!A1:ZZ`,
  });

  const [headerRow, ...dataRows] = response.data.values ?? [];
  if (!headerRow) return { rows: [], count: 0 };

  let rows: Record<string, unknown>[] = dataRows.map((row) =>
    Object.fromEntries(headerRow.map((key: string, i: number) => [key, row[i] ?? ""]))
  );

  if (filterColumn && filterValue !== undefined) {
    rows = rows.filter((row) => String(row[filterColumn]) === filterValue);
  }

  if (limit) rows = rows.slice(0, limit);

  return { rows, count: rows.length };
}

// ─── Write / Update ───────────────────────────────────────────────────────────

export async function writeRow(
  tab: SheetTab,
  data: Record<string, unknown>,
  rowId?: string
): Promise<WriteResult> {
  const sheets = getSheets();
  const spreadsheetId = env.GOOGLE_SHEETS_ID;

  if (rowId) {
    // Find the row and update it in-place
    const { rows } = await readRows(tab);
    const idKey = Object.keys(data).find((k) => k.endsWith("_id")) ?? "lead_id";
    const rowIndex = rows.findIndex((r) => String(r[idKey]) === rowId);

    if (rowIndex === -1) {
      // Row not found — fall through to append
    } else {
      const sheetRowNumber = rowIndex + 2; // +1 for header, +1 for 1-based index
      const headerRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${tab}!1:1`,
      });
      const headers: string[] = headerRes.data.values?.[0] ?? [];
      const updatedRow = headers.map((h) => (data[h] !== undefined ? data[h] : rows[rowIndex][h] ?? ""));

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tab}!A${sheetRowNumber}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [updatedRow] },
      });

      return { success: true, row_id: rowId, action: "updated", message: `Row ${rowId} updated in ${tab}.` };
    }
  }

  // Append a new row — write columns in header order
  const headerRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!1:1`,
  });
  const headers: string[] = headerRes.data.values?.[0] ?? [];
  const newRow = headers.length > 0
    ? headers.map((h) => (data[h] !== undefined ? data[h] : ""))
    : Object.values(data);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [newRow] },
  });

  const newId = String(data[Object.keys(data).find((k) => k.endsWith("_id")) ?? ""] ?? "");
  return { success: true, row_id: newId || undefined, action: "created", message: `New row appended to ${tab}.` };
}

// ─── Follow-up queue ──────────────────────────────────────────────────────────

export async function getPendingFollowUps(
  daysOverdue = 0,
  platform?: string
): Promise<PendingFollowUpsResult> {
  const { rows } = await readRows("Connection_Follow_Queue");
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysOverdue);

  const due = rows.filter((row) => {
    const touchDate = new Date(String(row["next_touch_date"] ?? ""));
    const shouldContinue = String(row["should_continue"]).toLowerCase() === "true";
    const matchesPlatform = !platform || String(row["platform"]) === platform;
    return !isNaN(touchDate.getTime()) && touchDate <= cutoff && shouldContinue && matchesPlatform;
  });

  const follow_ups: PendingFollowUpRow[] = due
    .sort((a, b) => new Date(String(a["next_touch_date"])).getTime() - new Date(String(b["next_touch_date"])).getTime())
    .map((row) => ({
      lead_id: String(row["lead_id"]),
      follow_up_date: String(row["next_touch_date"]),
      follow_up_number: Number(row["touch_count"]) + 1,
      platform: String(row["platform"]),
      draft_message: row["draft_message"] ? String(row["draft_message"]) : undefined,
    }));

  return { follow_ups, count: follow_ups.length };
}
