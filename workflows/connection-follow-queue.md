# Connection & Follow-Up Queue Workflow

## Purpose
Manage the queue of connection requests, follows, and follow-up actions that need human approval before execution. No action in this workflow is automatic — everything requires review.

---

## What This Workflow Manages

1. **Pre-outreach warm-up actions** — follow, connect, engage naturally
2. **Connection request notes** — LinkedIn connection request drafts
3. **Follow-up timing** — when to send the next message
4. **Follow-up drafts** — ready for human review
5. **Queue prioritization** — most actionable leads first

---

## Queue Stages

### Stage 1: Pre-Action Queue
Actions to take before sending any messages.

**LinkedIn:**
- Follow target's LinkedIn profile
- Follow their company page (if exists)
- Optional: engage authentically with a recent post (only if genuinely relevant)

**Instagram:**
- Follow their Instagram account (if Instagram is part of the outreach plan)

**Rules:**
- Queue the pre-action in the Connection_Follow_Queue tab
- Mark as `pending_approval`
- Human reviews and approves before action is taken
- Wait 1–3 days after pre-action before sending connection request

---

### Stage 2: Connection Request Queue
LinkedIn connection requests waiting for approval.

**Fields required before approval:**
- Lead name and company
- Connection request note (≤300 chars, drafted by Outreach Strategist)
- Lead temperature
- LinkedIn URL

**Approval criteria (human checks):**
- Does the note sound natural and non-spammy?
- Is the lead genuinely relevant?
- Has the pre-action been completed?

**After approval:**
- Human sends connection request manually (or via approved tool)
- Update status to `Connection Request Sent`
- Record date sent

---

### Stage 3: Connection Accepted → Initial Message Queue
When a connection request is accepted (LinkedIn) or when cold email/DM outreach is approved.

**Trigger:** Status changes from `Connection Request Sent` to `Connected`

**Action:**
- Retrieve initial_message from Message_Drafts tab
- Queue for human review
- Human approves and sends
- Update status to `Outreach Sent`
- Record date sent in Message_Drafts and Leads tabs

---

### Stage 4: Follow-Up Queue
Leads who received the initial message and have not replied.

**Automatic timing trigger (via n8n/Make or manual review):**
- After 24 hours: queue follow_up_24hr for review
- After 3 days: queue follow_up_1 for review
- After 6 days: queue follow_up_2 for review
- After 9 days: queue follow_up_3 for review
- After 12 days: queue follow_up_4 for review
- After 15 days: queue final_closeout for review

**Each follow-up queued:**
- Retrieve draft from Message_Drafts or Follow-Up Manager output
- Add to Connection_Follow_Queue with status `pending_approval`
- Human reviews, edits if needed, approves, sends

---

## Connection_Follow_Queue Sheet Columns

| Column | Description |
|--------|-------------|
| `queue_id` | Unique queue entry ID (QID-001) |
| `lead_id` | Match to Leads tab |
| `name` | Lead name |
| `company` | Lead company |
| `platform` | LinkedIn / Instagram / Email |
| `action_type` | Pre-Action / Connection Request / Initial Message / Follow-Up / Closeout |
| `draft_content` | The message or note draft |
| `touch_count` | Which touch this is in the sequence |
| `status` | pending_approval / approved / sent / rejected / skipped |
| `date_queued` | When this was added to the queue |
| `date_approved` | When human approved it |
| `date_sent` | When it was actually sent |
| `approved_by` | Who approved |
| `notes` | Any edits made before sending |

---

## Priority Scoring for Queue

When multiple leads are in the queue, prioritize in this order:

1. **URGENT**: Leads with status Call Requested, Demo Requested, Signup Ready
2. **HIGH**: Hot and Qualified leads awaiting initial message
3. **MEDIUM**: Warm leads awaiting initial message
4. **LOW**: Cold leads, later follow-ups

---

## Daily Queue Review (Human Task)

Recommended: review the queue once per day, 15–20 minutes.

**Daily review checklist:**
- [ ] Review all `pending_approval` items
- [ ] Approve, edit, or reject each draft
- [ ] For approved items: send manually or via approved tool
- [ ] Mark sent items as `sent` with date
- [ ] Check for any leads that need urgent response (Call Requested, etc.)
- [ ] Review next-day follow-up timing

---

## n8n / Make Automation (Optional Enhancement)

Once manual flow is working, automate timing triggers:

```
[Google Sheets: Watch Leads tab]
→ Filter: status = "Outreach Sent"
→ Calculate: days since date_sent
→ If 1 day: add follow_up_24hr to Connection_Follow_Queue with status = pending_approval
→ If 4 days: add follow_up_1
→ If 7 days: add follow_up_2
... and so on
```

This surfaces the right follow-up at the right time without the human needing to track dates manually.

---

## Compliance Rules

- No connection requests sent without human approval
- No messages sent without human approval
- No follows or pre-actions taken automatically
- Maximum 20 LinkedIn connection requests per week (platform safety)
- Maximum 10 Instagram DM outreaches per week (platform safety)
- Space out connection requests — not all at once
