# Reply Handling Workflow

## Purpose
Define how incoming replies from leads are processed — classified, responded to, and escalated when needed. Every reply is an opportunity. This workflow ensures no reply is ignored, mishandled, or responded to in a way that kills the conversation.

---

## Reply Processing Flow

```
Lead sends reply (LinkedIn / Instagram DM / Email)
        ↓
Human logs reply in Conversations tab
(or n8n/Make webhook captures it automatically)
        ↓
Conversation Handler Agent reads reply
        ↓
Agent classifies intent
        ↓
Agent determines temperature update and status update
        ↓
Agent drafts reply (2–3 sentences, pending_review)
        ↓
If high-intent: Notification Agent triggers alert
        ↓
Human reviews draft reply
        ↓
Human approves, edits, and sends
        ↓
Update Conversations tab: sent_date, human_approved = true
        ↓
Update Leads tab: new status, temperature
```

---

## Reply Entry (Manual Step)

Until automation is set up, when a lead replies:

1. Open Google Sheets → **Conversations** tab
2. Create new row:
   - Fill in: lead_id, name, company, platform, reply_received_date
   - Paste the reply text into `reply_text`
   - Set status to `needs_classification`

3. Trigger Conversation Handler Agent with the reply text and lead context
4. Agent returns classified output with draft reply
5. Fill remaining columns with agent output

---

## Automated Reply Capture (n8n / Make)

Once connected, automate entry from:

**LinkedIn (via Phantombuster or official API):**
- New message in LinkedIn inbox → webhook → add row to Conversations tab

**Gmail:**
- New email reply from known lead → Gmail trigger → append to Conversations tab

**Instagram (via Meta Business API or approved tool):**
- New DM reply → webhook → add row to Conversations tab

---

## Priority Response Tiers

| Classification | Response Time Target | Notification |
|----------------|---------------------|--------------|
| Wants Strategy Call | Within 2 hours | URGENT alert |
| Wants Signup Link | Within 2 hours | URGENT alert |
| Wants Demo | Within 4 hours | HIGH alert |
| Wants Pricing | Within 4 hours | HIGH alert |
| Positive Interest | Within 24 hours | MEDIUM alert |
| Objection | Within 24 hours | No notification |
| Needs More Info | Within 24 hours | No notification |
| Not Interested | Within 48 hours | No notification |
| Unclear | Within 24 hours | No notification |

---

## High-Intent Reply Escalation

If classification = `Wants Strategy Call`:
1. Conversation Handler immediately outputs draft reply with booking link offer
2. Notification Agent fires immediately
3. New row added to Call_Requests tab
4. Lead status updated to `Call Requested`
5. Founder alerted via email + Slack/Discord
6. Human sends approved reply within 2 hours

If classification = `Wants Signup Link` or `Signup Ready`:
1. Conversation Handler outputs draft reply with https://autom8ig.io
2. Notification Agent fires immediately
3. Lead status updated to `Signup Ready`
4. Human sends approved reply within 2 hours

---

## Objection Handling Process

1. Conversation Handler identifies objection type
2. Drafts specific, honest response (not defensive)
3. Human reviews — check that response:
   - Acknowledges the objection honestly
   - Does not argue
   - Does not over-promise
   - Leaves room for future conversation
4. Human sends approved response
5. Log objection type in Conversations tab
6. Sales Analyzer Agent tracks objection patterns weekly

---

## "Not Interested" Handling

This is important — a clean, gracious close builds future reputation.

1. Conversation Handler drafts one short, gracious closing reply
2. Human reviews and sends
3. Update lead status to `Not Interested` or `Closed`
4. Do NOT follow up again unless the lead re-initiates
5. Do NOT argue, re-pitch, or ask "are you sure?"

---

## Follow-Up After Positive Reply

If a lead replies positively but does not make a specific ask:

1. Conversation Handler classifies as `Positive Interest`
2. Drafts a reply that moves conversation one step forward
3. Human approves and sends
4. After sending: lead enters a short "active conversation" mode
5. If no further reply after 3–5 days: resume light follow-up sequence from the Follow-Up Manager

---

## Conversations Tab Required Fields

After each reply is processed:

| Field | Required Before Closing |
|-------|------------------------|
| reply_classification | Yes |
| lead_temperature_after | Yes |
| draft_reply | Yes |
| notify_founder | Yes |
| status_update | Yes |
| human_approved | Yes (before sending) |
| sent_date | Yes (after sending) |

---

## Reply Quality Standards

All draft replies from the Conversation Handler must be checked:

- [ ] Is it 2–3 sentences or shorter?
- [ ] Does it match the classification (not a demo link when they asked for pricing)?
- [ ] Does it NOT argue or over-pitch?
- [ ] Does it include https://autom8ig.io when relevant?
- [ ] Does it offer a booking link or next step when appropriate?
- [ ] Does it sound like a real person, not a template?

---

## n8n Notification Workflow

```
[Google Sheets: Conversations tab - new row]
→ Filter: notify_founder = TRUE
→ Get lead data from Leads tab (lookup by lead_id)
→ Gmail: Send notification email to founder
→ Slack: Post message to #autom8-leads channel
→ If Call Requested: also add row to Call_Requests tab
```
