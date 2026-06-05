# Autom8 Agent Team

A fully automated LinkedIn outbound pipeline built on the Anthropic Claude API and Google Sheets. Scores leads, drafts personalized messages, manages follow-up cadence, captures replies, and alerts you only when someone wants to move forward.

**→ [Setup guide](SETUP.md)**

---

## How it works

```
Derrick (LinkedIn enrichment)
    ↓
Lead Researcher agent — scores leads → Leads tab
    ↓
Outreach Strategist — drafts messages → Message_Drafts tab
    ↓
You review + approve in Google Sheets (~5 min/day)
    ↓
Send_Queue — copy/paste into LinkedIn (~10 min/day)
    ↓
Follow-Up Manager — auto-queues follow-ups on cadence
    ↓
Gmail → n8n → Reply Handler — captures + classifies replies
    ↓
Discord alert — only fires for high-intent signals
```

---

## Agents

| Agent | Role |
|---|---|
| Lead Researcher | Scores Derrick-enriched leads by fit, intent, timing |
| Outreach Strategist | Drafts personalized LinkedIn DMs + connection requests |
| Follow-Up Manager | Manages 7-touch cadence, different angle each time |
| Reply Handler | Classifies replies, drafts responses, alerts on high intent |
| Notification Agent | Discord/email alerts for Wants Call / Demo / Pricing / Signup |

---

## Tech stack

- **Runtime:** Node.js + TypeScript
- **AI:** Anthropic Claude API (`claude-opus-4-7` with adaptive thinking)
- **CRM:** Google Sheets (10 tabs)
- **LinkedIn enrichment:** Derrick Google Sheets extension
- **Automation:** n8n (cloud)
- **Tunnel:** ngrok (static domain)
- **Notifications:** Discord webhooks

---

## Sheets tabs

| Tab | Purpose |
|---|---|
| `Send_Queue` | Approved drafts formatted for fast manual sending |
| `Inbound_Replies` | Paste replies here — agent processes automatically |
| `import_YYYY_MM_DD` | Derrick landing zone for each LinkedIn import |
| `Raw_Leads` | Legacy raw leads tab |
| `Leads` | Scored lead database |
| `Connection_Follow_Queue` | Connection requests + follow-up drafts |
| `Message_Drafts` | Outreach message drafts |
| `Conversations` | Every reply classified + draft response |
| `Call_Requests` | Leads who asked for a strategy call |
| `Signups` | Confirmed conversions |
| `Analytics` | Weekly pipeline performance |

---

## n8n schedule

| Time | Workflow |
|---|---|
| 8:00am Mon–Fri | Score new leads |
| 9:00am | Draft outreach messages |
| 9:15am | Draft connection requests |
| 9:30am | Discord summary of pending drafts |
| 10:00am | Follow-up sweep |
| Every 30 min | Gmail → capture LinkedIn replies |

---

## Safety rules

- **No auto-send** — every message requires human approval
- **No fake personalization** — only honest, observable signals
- **No invented data** — unknown fields left blank
- **Human always in the loop** — agents draft, you approve and send
- **Max 7 touches** per lead, sequences close gracefully

---

## Getting started

See **[SETUP.md](SETUP.md)** for full step-by-step instructions.
