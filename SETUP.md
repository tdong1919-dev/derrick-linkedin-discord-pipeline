# Setup Guide — Autom8 Agent Team

Get the full outbound pipeline running on your machine in about 30 minutes.

---

## What you'll need

| Credential | Where to get it |
|---|---|
| Anthropic API key | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| Google Sheet | Create a new blank sheet at [sheets.google.com](https://sheets.google.com) |
| Google Service Account | [console.cloud.google.com](https://console.cloud.google.com) |
| Discord webhook | Your Discord server → Channel Settings → Integrations → Webhooks |
| ngrok account (free) | [ngrok.com](https://ngrok.com) |
| n8n account | [app.n8n.io](https://app.n8n.io) (free tier works) |

---

## Step 1 — Clone and install

```bash
git clone <repo-url>
cd autom8-agent-team
npm install
```

---

## Step 2 — Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in every value. See `.env.example` for instructions on each one.

---

## Step 3 — Set up Google Sheets

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Paste the contents of `setup-sheets.gs`
4. Click **Run** → `setupAutom8CRM`
5. Grant permissions when prompted

This creates all 10 tabs with the correct headers and dropdowns.

**Share the sheet with your service account:**
- Open your `.env` — find the `client_email` field inside `GOOGLE_SERVICE_ACCOUNT_JSON`
- In Google Sheets → Share → paste that email → Editor access

---

## Step 4 — Set up Derrick (LinkedIn enrichment)

1. Install the [Derrick](https://www.derrick.app) extension in Google Sheets
2. In your sheet, go to the `import_YYYY_MM_DD` tab (create one named today's date e.g. `import_2026_06_05`)
3. Add headers: `name | headline | location | linkedinUrl | import leads status`
4. Use Derrick to import LinkedIn profiles into this tab
5. Set `import leads status = new` on rows ready for scoring

---

## Step 5 — Test the pipeline

```bash
# Score leads from Derrick import
npm run workflow:leads

# Draft outreach messages
npm run workflow:outreach

# Draft connection requests
npm run workflow:connections

# Send Discord notification
npm run workflow:notify
```

---

## Step 6 — Set up ngrok (for n8n automation)

```bash
# Install ngrok and add your authtoken
ngrok config add-authtoken YOUR_NGROK_TOKEN

# Start tunnel (use your static domain if you have one)
ngrok http --url=YOUR_DOMAIN.ngrok.app 3000
```

In a separate terminal, start the webhook server:
```bash
npm run dev:webhook
```

---

## Step 7 — Import n8n workflows

Import both files into n8n:

| File | Purpose |
|---|---|
| `n8n-schedule-workflow.json` | Daily pipeline — runs all workflows on a schedule |
| `n8n-linkedin-replies-workflow.json` | Captures LinkedIn replies from Gmail automatically |

In each workflow, connect your **Google Sheets OAuth2** and **Gmail OAuth2** credentials.

Activate both workflows.

---

## Step 8 — Gmail reply capture

Make sure LinkedIn email notifications are enabled:
- LinkedIn → Settings → Communications → Email → Messages → **On**

LinkedIn will email you when someone replies. n8n reads that email and automatically processes the reply through the agent pipeline.

---

## Daily routine (15 min)

1. **9:30am** — Discord pings you with drafts ready for review
2. Open `Message_Drafts` and `Connection_Follow_Queue` in Google Sheets
3. Flip drafts you like to `approved`, reject the rest
4. Run `npm run workflow:send-queue`
5. Open `Send_Queue` tab — copy/paste messages into LinkedIn
6. Flip sent rows to `sent`

Replies are handled automatically — you only get a Discord ping for high-intent signals (Wants Call, Demo, Pricing, Signup).

---

## Personalizing for your outreach

Update these files with your own info:

| File | What to change |
|---|---|
| `agents/notification-agent.md` | Your name, email, LinkedIn URL, Instagram handle |
| `prompts/outreach-prompt.md` | Your product name, value prop, example messages |
| `.env` | Your Calendly URL, product URL |
| `workflows/daily-lead-research.ts` | Your target ICP, import tab name |

---

## Workflow reference

| Command | What it does |
|---|---|
| `npm run workflow:leads` | Score new Derrick leads → Leads tab |
| `npm run workflow:outreach` | Draft messages for Queued leads → Message_Drafts |
| `npm run workflow:connections` | Draft connection requests → Connection_Follow_Queue |
| `npm run workflow:followups` | Queue follow-ups for no-reply leads |
| `npm run workflow:process-replies` | Process new rows in Inbound_Replies |
| `npm run workflow:notify` | Send Discord summary of pending drafts |
| `npm run dev:webhook` | Start webhook server for n8n triggers |

---

## Troubleshooting

| Error | Fix |
|---|---|
| `GOOGLE_SHEETS_ID is required` | Add `GOOGLE_SHEETS_ID=` to `.env` |
| `The caller does not have permission` | Share the sheet with your service account email |
| `Unable to parse range: Leads` | Run `setup-sheets.gs` to create the tabs |
| `Your credit balance is too low` | Add credits at [console.anthropic.com](https://console.anthropic.com) |
| ngrok `authentication failed` | Run `ngrok config add-authtoken YOUR_TOKEN` |
| Discord `400 Bad Request` | Message too long — already handled in latest version |
