# Booked Call Notification Workflow

## Purpose
Ensure the founder is immediately alerted when a lead shows high-intent buying signals — especially call requests — so no opportunity is lost due to slow response.

---

## Trigger Conditions

This workflow fires when any lead's status changes to one of:

| Status | Priority | Response Target |
|--------|----------|-----------------|
| `Call Requested` | URGENT | 2 hours |
| `Signup Ready` | URGENT | 2 hours |
| `Demo Requested` | HIGH | 4 hours |
| `Pricing Asked` | HIGH | 4 hours |
| `Qualified Lead Replied` | HIGH | 4 hours |
| `Hot Lead Replied` | MEDIUM | 24 hours |

---

## Notification Channels

### 1. Gmail (Primary)
Triggered for all high-intent statuses.

**Subject line format:**
```
Autom8 Lead Alert: [Lead Name] wants [call/demo/pricing/signup]
```

**Email body:**
```
Hi,

New lead activity requires your attention.

---
LEAD DETAILS
Name: [name]
Company: [company]
Temperature: [lead_temperature]
Channel: [platform]
Status: [new status]

WHAT THEY SAID
[reply_summary]

RECOMMENDED NEXT ACTION
[recommended_next_action]

CONTACT INFO
LinkedIn: [linkedin_url]
Instagram: [instagram_url]
Email: [email]

BOOKING STATUS
[booking_link_sent: Yes/No]

SHEET LINK
[link to CRM row]

---
Urgency: [URGENT / HIGH / MEDIUM]
Autom8 Sales System | Auto-generated
```

---

### 2. Slack (Secondary)
Post to `#autom8-leads` or `#founder-alerts` channel.

**Slack message format:**
```
🚨 Autom8 Lead Alert

Lead: [name] ([company])
Alert: [alert_type]
Temperature: [lead_temperature]
Channel: [platform]

What they said: [reply_summary]
Next step: [recommended_next_action]

LinkedIn: [linkedin_url]
Instagram: [instagram_url]
Email: [email]

→ Sheet: [sheet_row_link]
Urgency: [URGENT / HIGH / MEDIUM]
```

---

### 3. Discord (Optional)
Post to a private founder or team Discord server via webhook.

Same format as Slack message. Set up via Discord webhook URL in n8n/Make.

---

### 4. SMS (Optional — URGENT only)
For `Call Requested` and `Signup Ready` only. Use Twilio node in n8n.

**SMS format:**
```
Autom8 Alert: [Name] from [Company] wants a [call/signup]. Reply rate drops fast. Check your email now.
```

---

## Full n8n / Make Automation Setup

### n8n Workflow

```
Node 1: Google Sheets Trigger
  - Sheet: Conversations tab
  - Trigger: New or updated row
  - Watch column: status

Node 2: Filter
  - Condition: status IN ["Call Requested", "Demo Requested", "Pricing Asked", "Signup Ready", "Qualified Lead Replied"]

Node 3: Google Sheets - Get Row
  - Sheet: Leads tab
  - Lookup by: lead_id
  - Gets: name, company, linkedin_url, instagram_url, email, lead_temperature

Node 4: Set Variables
  - Combine Conversations row data + Leads row data
  - Build email subject, body, slack message

Node 5: Gmail - Send Email
  - To: founder@autom8.io
  - Subject: built from template
  - Body: built from template

Node 6: Slack - Post Message (parallel with Node 5)
  - Channel: #autom8-leads
  - Message: built from template

Node 7: (Conditional) Google Sheets - Append Row
  - If: status = "Call Requested"
  - Sheet: Call_Requests tab
  - Append new row with lead data

Node 8: (Conditional) Twilio - Send SMS
  - If: status IN ["Call Requested", "Signup Ready"]
  - To: founder phone number
  - Body: short SMS alert
```

---

## Call_Requests Tab Management

When a call is requested:

1. New row added to Call_Requests tab automatically (via n8n) or manually
2. Founder receives notification
3. Founder approves draft reply (from Conversation Handler)
4. Founder sends booking link (Calendly link)
5. Update Call_Requests: `booking_link_sent = Yes`, `booking_link_sent_date = [date]`
6. When lead books: update `call_booked = Yes`, `call_date = [date]`
7. After call: update `call_outcome = [result]`

---

## Post-Call Workflow

After a strategy call:

| Outcome | Next Action |
|---------|-------------|
| Signed Up | Add to Signups tab. Update Leads status to Deal Closed. |
| Interested — Follow Up | Add note to Call_Requests. Schedule follow-up touch in 2–3 days. |
| Not a Fit | Update status to Bad Fit / Closed. No further outreach. |
| No Show | Send one short re-booking message. If no reply in 3 days, close out. |
| Demo Scheduled | Update status. Schedule follow-up for after demo. |

---

## Notification Deduplication

To prevent duplicate notifications for the same lead:

- Log `notification_sent = Yes` + `notification_sent_date` in the Conversations row
- n8n filter: only trigger notification if `notification_sent ≠ Yes` for this conversation row
- Re-notify only if the status changes again to a new high-intent status

---

## Response Time Tracking

Track how fast the founder responds to alerts:

| Metric | Ideal Target |
|--------|-------------|
| Time from alert to draft approved | < 1 hour (URGENT) |
| Time from alert to message sent | < 2 hours (URGENT) |
| Time from alert to booking link sent | < 2 hours (URGENT) |

Log in Call_Requests: `alert_sent_time` and `response_sent_time` to calculate response speed over time.

---

## Calendly Setup Recommendation

Use Calendly for booking links:

1. Create a Calendly event type: "Autom8 Strategy Call — 30 min"
2. Connect to your Google Calendar
3. Set availability: 2 working days out minimum (not same day)
4. Include in confirmation email: Autom8 website link and what to expect
5. Calendly webhook → n8n: when booking is confirmed → update Call_Requests: `call_booked = Yes`, `call_date`
