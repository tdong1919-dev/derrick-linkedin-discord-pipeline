# n8n Workflow Setup Guide

## What this workflow does
Polls your Google Sheets every 15 minutes. When a lead's status becomes high-intent (Call Requested, Demo Requested, etc.), it:
1. Sends a Gmail alert to YOUR_EMAIL
2. Posts to your Discord lead-alerts channel
3. Sends an SMS to YOUR_PHONE_NUMBER (URGENT statuses only)
4. Adds a row to the Call_Requests tab (if Call Requested)
5. Marks the row as notified so you never get duplicate alerts
6. Updates the lead's status in the Leads tab

---

## Step 1 — Discord Webhook ✅ Done

Discord webhook URL is already configured in `n8n-workflow.json`. No action needed here.

---

## Step 2 — Set Up Google Sheets

### Add two columns to your Conversations tab
The workflow filters by these columns — add them if they don't exist yet:

| Column | Purpose |
|--------|---------|
| `notification_sent` | Leave blank on new rows. Workflow writes "Yes" after alerting. |
| `notification_sent_date` | Workflow writes the date it fired. |

Also add to Call_Requests tab:
| Column | Purpose |
|--------|---------|
| `times_requested` | Filled when lead replies with their available times. |

### Get your Spreadsheet ID
1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/`**`THIS_IS_YOUR_ID`**`/edit`
3. Copy that ID — you'll use it in Step 4

---

## Step 3 — Import the Workflow into n8n

1. Open n8n
2. Click **+** (New Workflow) → **Import from File** (or paste JSON)
3. Import `n8n-workflow.json` from this project folder
4. The workflow will appear with nodes — do NOT activate it yet

---

## Step 4 — Replace All Placeholders

Search for these placeholders and replace them:

| Placeholder | Replace with |
|-------------|-------------|
| `YOUR_SPREADSHEET_ID` | Your Google Sheets ID from Step 2 |
| `DISCORD_WEBHOOK_URL` | ✅ Already set in the JSON |
| `YOUR_TWILIO_PHONE_NUMBER` | Your Twilio sending number (e.g., `+15551234567`) |
| `GOOGLE_CREDENTIAL_ID` | Set up in Step 5 — come back to this |
| `GMAIL_CREDENTIAL_ID` | Set up in Step 5 — come back to this |
| `TWILIO_CREDENTIAL_ID` | Set up in Step 5 — come back to this |

**Quick way to find all placeholders:**
In n8n, click each node and look for fields with these exact strings. Or do a global find in the JSON before importing.

---

## Step 5 — Connect Your Credentials

### Google Sheets
1. In n8n → **Credentials** → **New** → Search `Google Sheets OAuth2`
2. Follow the OAuth flow — sign in with your Google account
3. Name it `Google Sheets — Autom8`
4. Assign this credential to all Google Sheets nodes in the workflow

### Gmail
1. In n8n → **Credentials** → **New** → Search `Gmail OAuth2`
2. Follow the OAuth flow — sign in with the Gmail you want notifications sent from
3. Name it `Gmail — Autom8 Alerts`
4. Assign to the `Send Gmail Alert` node

### Twilio (optional — only if you want SMS)
1. Create a free Twilio account at twilio.com if you don't have one
2. Get a phone number from Twilio (~$1/month)
3. In n8n → **Credentials** → **New** → Search `Twilio`
4. Enter your Account SID and Auth Token from the Twilio console
5. Name it `Twilio — Autom8`
6. Assign to the `Send SMS Alert` node
7. Replace `YOUR_TWILIO_PHONE_NUMBER` with your Twilio number

**If you don't want SMS yet:** Right-click the `Send SMS Alert` node → **Disable**. The workflow will skip it.

---

## Step 6 — Test the Workflow

1. Open your Google Sheet → Conversations tab
2. Add a test row with:
   - `conversation_id`: CONV-TEST-001
   - `lead_id`: LEAD-001
   - `name`: Test Lead
   - `company`: Test Co
   - `status_update`: Call Requested
   - `notify_founder`: true
   - `notification_sent`: (leave blank)
   - `reply_text`: Hey, I'd love to hop on a call
   - `draft_reply`: Sounds good — what are 2–3 times this week that work for you? I'll confirm one that fits.

3. In n8n, click **Execute Workflow** (manual run)
4. Check that:
   - ✅ You received a Gmail at YOUR_EMAIL
   - ✅ Discord channel received a message
   - ✅ SMS received at YOUR_PHONE_NUMBER
   - ✅ A new row appeared in Call_Requests tab
   - ✅ The test row in Conversations now shows `notification_sent = Yes`
   - ✅ The lead's status in Leads tab updated to `Call Requested`

5. Delete the test row from Conversations and Call_Requests

---

## Step 7 — Activate

Once the test passes:
1. Click the toggle in the top-right of the workflow → **Active**
2. The workflow now runs automatically every 15 minutes

---

## Trigger Statuses (what fires alerts)

| Status | Urgency | Email | Discord | SMS |
|--------|---------|-------|---------|-----|
| Call Requested | URGENT | ✅ | ✅ | ✅ |
| Signup Ready | URGENT | ✅ | ✅ | ✅ |
| Demo Requested | HIGH | ✅ | ✅ | — |
| Pricing Asked | HIGH | ✅ | ✅ | — |
| Qualified Lead Replied | HIGH | ✅ | ✅ | — |
| Hot Lead Replied | MEDIUM | ✅ | ✅ | — |

---

## How the No-Calendly Scheduling Works

1. Lead asks for a call → Conversation Handler drafts: *"Sounds good — what are 2–3 times this week that work for you? I'll confirm one that fits."*
2. You approve and send that reply
3. Lead replies with their available times
4. Conversation Handler logs those times in `available_times_from_lead` column in Conversations
5. Next notification alert shows their times prominently:
   ```
   LEAD'S AVAILABLE TIMES:
   [what they said]
   → Reply on LinkedIn/Instagram/Email confirming which time works for you.
   ```
6. You reply directly in the conversation confirming the time — no booking tool needed

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No emails arriving | Check Gmail credential is connected. Check spam folder. |
| Discord not getting messages | Verify webhook URL is correct (not the invite link). |
| Duplicate alerts | Make sure `notification_sent` column exists in Conversations tab. |
| Workflow not finding rows | Make sure your sheet tab is named exactly `Conversations` (case-sensitive). |
| SMS not sending | Check Twilio credential and that your Twilio number supports SMS. |
| Google Sheets read fails | Re-authorize the Google Sheets credential in n8n credentials. |

---

## File Location

`n8n-workflow.json` is in the root of `/autom8-agent-team/`. Import directly into n8n.
