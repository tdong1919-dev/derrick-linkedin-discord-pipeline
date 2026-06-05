# Outreach Draft Queue Workflow

## Purpose
Define how outreach drafts are created, reviewed, approved, and queued for sending. Nothing is ever auto-sent. This workflow ensures the founder or designated reviewer sees every message before it goes out.

---

## End-to-End Draft Flow

```
Lead Researcher → Leads tab (New)
       ↓
Personalization Engine → Personalization payload created
       ↓
Outreach Strategist → Message_Drafts tab (pending_review)
       ↓
Human Review → Approve / Edit / Reject
       ↓
Approved drafts → Connection_Follow_Queue (approved)
       ↓
Human sends manually (or via approved tool)
       ↓
Update status: sent
       ↓
Conversations tab receives replies
       ↓
Conversation Handler classifies and drafts reply
       ↓
Human approves reply
       ↓
Update status: sent
```

---

## Draft Creation Process

### 1. Trigger
A lead reaches status `Queued` in the Leads tab with:
- Personalization payload complete
- lead_temperature = Warm, Hot, or Qualified (Cold leads can also proceed)
- Recommended outreach channel identified

### 2. Outreach Strategist Creates Draft
Agent produces a full draft package in the Message_Drafts tab:
- connection_request_note
- initial_message
- full follow-up sequence (24hr, 1, 2, 3, 4, closeout)
- booking_call_message
- autom8_signup_message
- recommended_cta

All drafts start with `status = pending_review`.

### 3. Human Review
Review queue is visible in Message_Drafts tab filtered by `pending_review`.

**For each draft, reviewer decides:**

| Decision | Action | When to use |
|----------|--------|-------------|
| Approve | Change status to `approved` | Draft is ready to send as-is |
| Edit + Approve | Edit the message, then change to `approved` | Draft is good but needs tweaking |
| Reject | Change status to `rejected` | Lead is not right, message is off, or not ready |
| Hold | Change status to `paused` | Lead is good but timing is wrong |

### 4. Approved Drafts → Queue
After approval:
1. Connection request note moves to Connection_Follow_Queue for pre-action scheduling
2. Initial message waits until connection is accepted
3. Follow-up sequence is queued with timing logic

### 5. Sending
All sending is done manually by the human reviewer (or via approved automation tool). The agent never sends.

After sending:
- Update Message_Drafts: `status = sent`, `date_sent = [date]`
- Update Leads: `status = Outreach Sent`, `date_contacted = [date]`

---

## Draft Review Checklist

Before approving any draft, verify:

**Connection Request Note:**
- [ ] Does it sound natural and human?
- [ ] Is it under 300 characters?
- [ ] Does it NOT pitch or sell?
- [ ] Does it NOT mention Autom8 by name unless genuinely natural?

**Initial Message:**
- [ ] Is it 2–3 sentences max?
- [ ] Does it mention Autom8 briefly and honestly?
- [ ] Is the CTA appropriate for the lead temperature?
- [ ] Is there no fake personalization?

**Follow-Ups:**
- [ ] Does each follow-up use a different angle than the previous?
- [ ] Do they feel human, not sequenced?
- [ ] Do they avoid guilt, pressure, or urgency?
- [ ] Is the final closeout gracious and open-ended?

**Signup / Demo Message:**
- [ ] Does it include https://autom8ig.io?
- [ ] Is it 2 sentences max?

---

## Draft Status Definitions

| Status | Meaning | Who Sets It |
|--------|---------|-------------|
| `pending_review` | Created by agent, awaits human review | Outreach Strategist Agent |
| `approved` | Human approved, ready to send | Human reviewer |
| `rejected` | Human rejected, will not be used | Human reviewer |
| `paused` | On hold — timing or lead status issue | Human reviewer |
| `sent` | Initial message has been sent | Human after sending |
| `expired` | Lead went cold or closed before sending | Auto or human |

---

## Batch Review Timing

Recommended review schedule:
- **Daily review**: 15–20 min, morning
- Review all `pending_review` drafts from previous day
- Approve, edit, or reject each
- Queue approved items for sending

Ideal daily output:
- 5–10 drafts reviewed
- 3–7 approved and ready to send
- 2–3 messages actually sent

---

## Volume Guidelines

| Channel | Safe Daily Volume |
|---------|------------------|
| LinkedIn Connection Requests | 3–5 per day |
| LinkedIn DMs | 5–10 per day |
| Instagram DMs | 3–5 per day |
| Email | 10–20 per day |

**Note:** LinkedIn has rate limits that can result in account restrictions if exceeded. Stay conservative, especially in the first months.

---

## Integration with n8n / Make

Once the manual flow is stable, the draft creation step can be semi-automated:

```
[Google Sheets: Leads tab]
→ Filter: status = "Queued" AND personalization_complete = TRUE
→ Trigger: Outreach Strategist Agent (via Claude API or webhook)
→ Agent creates draft → writes to Message_Drafts tab
→ Slack/email notification to reviewer: "New drafts ready for review"
```

This keeps the human in the loop while removing the manual step of triggering the agent.
