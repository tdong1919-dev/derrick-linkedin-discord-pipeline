// Autom8 Sales CRM — Sheet Setup Script
// Open your Google Sheet → Extensions → Apps Script → paste this → Run

function setupAutom8CRM() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── Tab definitions ──────────────────────────────────────────────────────
  const tabs = [
    {
      // Send_Queue = approved drafts formatted for fast manual sending.
      // After sending a message on LinkedIn/email, flip status to "sent".
      name: "Send_Queue",
      headers: [
        "send_id", "date_queued", "lead_id", "name", "company",
        "platform", "lead_temperature", "action_type", "message",
        "status", "sent_at", "source_tab", "source_id",
        "linkedin_url", "notes"
      ],
      color: "#8E44AD"
    },
    {
      // Inbound_Replies = paste lead replies here for the agent to process.
      // Set status = "new" on any row you want the reply handler to pick up.
      // Agent flips to "processing" → "processed" (or "failed") automatically.
      name: "Inbound_Replies",
      headers: [
        "reply_id", "lead_id", "name", "company", "platform",
        "reply_text", "received_at", "status", "notes"
      ],
      color: "#E67E22"
    },
    {
      // Raw_Leads = Derrick's landing zone.
      // Derrick (Google Sheets extension) fills profile fields from LinkedIn
      // URLs. You manually (or via formula) set status = "new" when a row is
      // ready for the Lead Researcher agent to score.
      // The agent flips status to "scored" after processing.
      name: "Raw_Leads",
      headers: [
        "raw_id", "date_added", "linkedin_url", "full_name", "headline",
        "company", "title", "location", "industry", "company_size",
        "connections", "about", "recent_activity", "email_guess",
        "website", "source_search", "status", "scored_at", "notes"
      ],
      color: "#34495E"
    },
    {
      name: "Leads",
      headers: [
        "lead_id", "date_added", "name", "company", "role", "lead_type",
        "linkedin_url", "website", "instagram_url", "email", "source",
        "one_sentence_brief", "content_style", "audience_type",
        "growth_stage_guess", "customer_acquisition_style",
        "operational_bottleneck_guess", "brand_positioning_summary",
        "monetization_model_guess", "engagement_signals",
        "buying_intent_signals", "fit_score", "intent_score", "timing_score",
        "lead_temperature", "lead_temperature_reasoning", "autom8_angle",
        "suggested_channel_priority", "suggested_first_message_angle",
        "recommended_action", "status", "notes",
        "date_contacted", "date_last_updated", "assigned_to"
      ],
      color: "#4A90D9"
    },
    {
      name: "Connection_Follow_Queue",
      headers: [
        "queue_id", "lead_id", "name", "company", "platform", "action_type",
        "draft_content", "touch_count", "status",
        "date_queued", "date_approved", "date_sent", "approved_by", "notes"
      ],
      color: "#F5A623"
    },
    {
      name: "Message_Drafts",
      headers: [
        "draft_id", "lead_id", "name", "company", "platform",
        "lead_temperature", "recommended_pre_action",
        "connection_request_note", "initial_message",
        "follow_up_24hr", "follow_up_1", "follow_up_2",
        "follow_up_3", "follow_up_4", "final_closeout",
        "booking_call_message", "autom8_signup_message",
        "recommended_cta", "personalization_used",
        "status", "date_created", "date_approved", "approved_by",
        "date_sent", "notes"
      ],
      color: "#7ED321"
    },
    {
      name: "Conversations",
      headers: [
        "conversation_id", "lead_id", "name", "company", "platform",
        "reply_received_date", "reply_text", "reply_classification",
        "lead_temperature_before", "lead_temperature_after",
        "available_times_from_lead", "recommended_next_action",
        "draft_reply", "notify_founder", "notification_reason",
        "status_update", "human_approved", "sent_date",
        "notification_sent", "notification_sent_date", "notes"
      ],
      color: "#9B59B6"
    },
    {
      name: "Call_Requests",
      headers: [
        "call_request_id", "date", "lead_id", "name", "company",
        "email", "linkedin_url", "instagram_url", "platform",
        "reply_summary", "recommended_next_action",
        "booking_link_sent", "times_requested",
        "call_booked", "call_date", "call_outcome", "notes"
      ],
      color: "#E74C3C"
    },
    {
      name: "Signups",
      headers: [
        "signup_id", "date", "lead_id", "name", "company",
        "email", "linkedin_url", "instagram_url",
        "plan_selected", "acquisition_channel",
        "first_outreach_date", "days_to_signup",
        "touch_count_at_signup", "conversion_path", "notes"
      ],
      color: "#2ECC71"
    },
    {
      name: "Analytics",
      headers: [
        "report_id", "report_date", "week_start", "week_end",
        "leads_added", "messages_sent", "replies_received",
        "reply_rate_pct", "positive_replies", "positive_reply_rate_pct",
        "calls_booked", "call_booking_rate_pct",
        "signups", "signup_rate_pct",
        "top_lead_type", "top_channel", "top_angle",
        "top_objection_1", "top_objection_2", "top_objection_3",
        "recommendation_1", "recommendation_2", "recommendation_3",
        "pipeline_outreach_sent", "pipeline_follow_up_active",
        "pipeline_call_requested", "pipeline_demo_requested",
        "pipeline_pricing_asked", "pipeline_signup_ready",
        "pipeline_closed", "notes"
      ],
      color: "#1ABC9C"
    }
  ];

  // ── Rename the default Sheet1 to first tab ──────────────────────────────
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) defaultSheet.setName(tabs[0].name);

  // ── Create or update each tab ───────────────────────────────────────────
  tabs.forEach((tab, index) => {
    let sheet = ss.getSheetByName(tab.name);

    // Create if doesn't exist (first tab already renamed above)
    if (!sheet) {
      sheet = index === 0
        ? ss.getSheetByName(tab.name)  // already renamed
        : ss.insertSheet(tab.name);
    }

    // Write header row
    const headerRange = sheet.getRange(1, 1, 1, tab.headers.length);
    headerRange.setValues([tab.headers]);

    // Style header row
    headerRange.setBackground(tab.color);
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    headerRange.setWrap(false);

    // Freeze header row
    sheet.setFrozenRows(1);

    // Auto-resize columns
    sheet.autoResizeColumns(1, tab.headers.length);

    // Alternate row banding for readability
    try {
      const banding = sheet.getBandings();
      if (banding.length === 0) {
        sheet.getRange(2, 1, 999, tab.headers.length)
          .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
      }
    } catch(e) { /* skip if banding not supported */ }
  });

  // ── Add dropdown validation for key columns ─────────────────────────────

  // Send_Queue: status dropdown
  const sendQueueSheet = ss.getSheetByName("Send_Queue");
  const sendQueueStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["ready", "sent", "skipped", "failed"], true)
    .setAllowInvalid(false)
    .build();
  sendQueueSheet.getRange(2, 10, 999).setDataValidation(sendQueueStatusRule); // status col

  // Inbound_Replies: status dropdown
  const repliesSheet = ss.getSheetByName("Inbound_Replies");
  const repliesStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["new", "processing", "processed", "failed"], true)
    .setAllowInvalid(false)
    .build();
  repliesSheet.getRange(2, 8, 999).setDataValidation(repliesStatusRule); // status col

  // Inbound_Replies: platform dropdown
  const repliesPlatformRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["linkedin_dm", "instagram_dm", "email"], true)
    .setAllowInvalid(false)
    .build();
  repliesSheet.getRange(2, 5, 999).setDataValidation(repliesPlatformRule); // platform col

  // Raw_Leads: status dropdown (controls what the Lead Researcher picks up)
  const rawSheet = ss.getSheetByName("Raw_Leads");
  const rawStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["new", "scored", "skipped"], true)
    .setAllowInvalid(false)
    .build();
  rawSheet.getRange(2, 17, 999).setDataValidation(rawStatusRule); // status col

  // Leads: status dropdown
  const leadsSheet = ss.getSheetByName("Leads");
  const leadsStatusCol = 31; // "status" column
  const leadsStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      "New", "Queued", "Connection Request Sent", "Connected",
      "Outreach Sent", "No Reply", "Follow Up Active",
      "Replied Positive", "Replied Unclear", "Replied Objection",
      "Not Interested", "Call Requested", "Demo Requested",
      "Pricing Asked", "Signup Ready", "Closed Out",
      "Deal Closed", "Bad Fit"
    ], true)
    .setAllowInvalid(false)
    .build();
  leadsSheet.getRange(2, leadsStatusCol, 999).setDataValidation(leadsStatusRule);

  // Leads: lead_temperature dropdown
  const tempRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Cold", "Warm", "Hot", "Qualified"], true)
    .setAllowInvalid(false)
    .build();
  leadsSheet.getRange(2, 25, 999).setDataValidation(tempRule); // lead_temperature col

  // Message_Drafts: status dropdown
  const draftsSheet = ss.getSheetByName("Message_Drafts");
  const draftStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      "pending_review", "approved", "rejected", "paused", "sent", "expired"
    ], true)
    .setAllowInvalid(false)
    .build();
  draftsSheet.getRange(2, 20, 999).setDataValidation(draftStatusRule); // status col

  // Conversations: reply_classification dropdown
  const convSheet = ss.getSheetByName("Conversations");
  const classRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      "Positive Interest", "Wants Demo", "Wants Pricing",
      "Wants Strategy Call", "Wants Signup Link", "Sharing Available Times",
      "Not Interested", "Objection", "Needs More Info", "Bad Fit", "Unclear"
    ], true)
    .setAllowInvalid(false)
    .build();
  convSheet.getRange(2, 8, 999).setDataValidation(classRule); // reply_classification col

  // Conversations: notify_founder dropdown
  const notifyRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["true", "false"], true)
    .setAllowInvalid(false)
    .build();
  convSheet.getRange(2, 14, 999).setDataValidation(notifyRule);

  // Conversations: notification_sent dropdown
  const notifSentRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Yes", ""], true)
    .setAllowInvalid(true)
    .build();
  convSheet.getRange(2, 19, 999).setDataValidation(notifSentRule);

  // Call_Requests: call_booked dropdown
  const callSheet = ss.getSheetByName("Call_Requests");
  const callBookedRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Yes", "No", "Pending"], true)
    .setAllowInvalid(false)
    .build();
  callSheet.getRange(2, 14, 999).setDataValidation(callBookedRule);

  // Call_Requests: call_outcome dropdown
  const outcomeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      "", "Signed Up", "Interested - Follow Up", "Not a Fit",
      "No Show", "Rescheduled", "Demo Scheduled", "Closed Won", "Closed Lost"
    ], true)
    .setAllowInvalid(false)
    .build();
  callSheet.getRange(2, 16, 999).setDataValidation(outcomeRule);

  // ── Done ─────────────────────────────────────────────────────────────────
  SpreadsheetApp.getUi().alert(
    "Autom8 CRM Ready",
    "All 10 tabs created with headers, dropdowns, and formatting.\n\n" +
    "Spreadsheet ID: " + ss.getId() + "\n\n" +
    "Paste that ID into your n8n workflow wherever you see YOUR_SPREADSHEET_ID.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
