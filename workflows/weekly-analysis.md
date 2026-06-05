# Weekly Analysis Workflow

## Purpose
Run a structured weekly performance review every Monday to understand what is working in the outreach system, what needs to change, and what to focus on next week.

---

## Frequency
- Run: Every Monday morning
- Recommended time: 8:00 AM
- Takes: 30–45 minutes (review + planning)

---

## Data Sources

Pull data from these Google Sheets tabs for the previous week (Mon–Sun):

| Tab | What to Pull |
|-----|--------------|
| Leads | New rows added, status distribution |
| Message_Drafts | Rows with status = sent, date_sent in the past week |
| Conversations | All rows with reply_received_date in the past week |
| Call_Requests | Rows with date in the past week |
| Signups | Rows with date in the past week |

---

## Step-by-Step Process

### Step 1: Calculate Core Metrics

Run these calculations from the raw data:

```
leads_added = COUNT(Leads WHERE date_added >= week_start)
messages_sent = COUNT(Message_Drafts WHERE status = "sent" AND date_sent >= week_start)
replies_received = COUNT(Conversations WHERE reply_received_date >= week_start)
reply_rate = (replies_received / messages_sent) × 100

positive_replies = COUNT(Conversations WHERE classification IN [
  "Positive Interest", "Wants Demo", "Wants Pricing",
  "Wants Strategy Call", "Wants Signup Link"
] AND reply_received_date >= week_start)

positive_reply_rate = (positive_replies / messages_sent) × 100

calls_booked = COUNT(Call_Requests WHERE call_booked = "Yes" AND date >= week_start)
call_booking_rate = (calls_booked / positive_replies) × 100

signups = COUNT(Signups WHERE date >= week_start)
signup_rate = (signups / total_active_leads) × 100
```

### Step 2: Performance Breakdown

Segment reply rates by:
- Lead type (which lead_type had highest reply rate)
- Channel (LinkedIn vs Email vs Instagram DM)
- Message angle (which angle from follow-up sequence generated best responses)
- Lead temperature at time of outreach

### Step 3: Pipeline Snapshot

Count leads in each status as of today:
- outreach_sent
- follow_up_active
- call_requested
- demo_requested
- pricing_asked
- signup_ready
- closed

### Step 4: Objection Analysis

From Conversations tab, filter WHERE classification = "Objection":
- List top 3 objections
- For each: did the lead convert after the objection response?
  (look for follow-up positive reply from same lead_id)

### Step 5: Generate Report

Pass all calculated data to Sales Analyzer Agent with:
- All metrics calculated above
- Performance breakdown data
- Pipeline snapshot
- Objection list

Agent returns a structured report JSON + recommendations.

### Step 6: Review and Plan

Human reviews the report and sets next week's priorities:

1. Which lead types to focus on
2. Which channels to prioritize
3. Which message angles to test
4. Volume targets for new leads and outreach

---

## Weekly Report Output Location

Save weekly report to:
1. Analytics tab in Google Sheets (new row)
2. (Optional) Create a Google Doc summary for the team

---

## Key Questions the Report Must Answer

1. What is our reply rate this week vs last week?
2. Which lead type is responding best?
3. Which channel is performing best?
4. What is our call booking rate?
5. How many people asked for the demo vs how many asked for a call?
6. What are people objecting to most?
7. Are our follow-ups working or are replies coming mostly from the first message?
8. What should we change next week?

---

## Benchmark Targets (First 90 Days)

| Metric | Week 1–4 Target | Week 5–12 Target |
|--------|-----------------|------------------|
| Reply rate | > 10% | > 20% |
| Positive reply rate | > 5% | > 10% |
| Call booking rate | 1+ per week | 3+ per week |
| Signups (from outreach) | 0–1 per month | 2–5 per month |
| Leads added per week | 25–50 | 30–75 |

**Note:** These are initial benchmarks. Adjust based on actual system performance.

---

## Red Flags to Watch

Escalate immediately if:
- Reply rate drops below 5% for 2 consecutive weeks
- Zero positive replies in a full week after 10+ messages sent
- A channel generates zero replies after 15+ sends
- Same objection appears more than 5× in one week with no conversion
- Call booking rate drops to zero after 20+ positive replies

---

## Weekly Analysis → Next Week Action

The report should directly produce a next-week plan:

```
Next Week Action Plan: [Date]
---------------------------------
Lead Research Focus: [lead types]
Channel Priority: [LinkedIn / Email / Instagram]
Outreach Volume Target: [N new messages]
Message Angle to Test: [specific angle]
A/B Test: [two CTAs or opening lines to compare]
Follow-Up Adjustment: [any changes to cadence]
Objection Response Update: [if new objection needs better response]
Notes: [anything else]
```

---

## Integration Points

| System | Action |
|--------|--------|
| Google Sheets: Analytics tab | New weekly report row |
| Sales Analyzer Agent | Receives data, returns structured report |
| Leads tab | Review pipeline snapshot |
| Outreach Strategist | Updated angle priorities for next week |
| Follow-Up Manager | Updated cadence if needed |
