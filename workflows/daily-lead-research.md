# Daily Lead Research Workflow

## Purpose
Generate a steady pipeline of qualified leads every day. The Lead Researcher Agent runs this workflow each morning to ensure new leads are always entering the system.

---

## Frequency
- Run: Daily (Monday–Friday)
- Recommended time: 8:00 AM
- Expected output: 5–10 new qualified leads per day

---

## Daily Research Targets

### Primary Targets (rotate daily focus)
| Day | Focus Area |
|-----|------------|
| Monday | SaaS founders + App builders |
| Tuesday | Ecommerce founders + Shopify store owners |
| Wednesday | Marketing agencies + Social media agencies |
| Thursday | Creator-led businesses + Coaches + Educators |
| Friday | Growth marketers + CEOs of digital businesses |

### Weekly Minimum Targets
- Total new leads added: 25–50 per week
- Minimum fit_score for inclusion: 5
- Minimum: at least 5 Hot or Qualified leads per week

---

## Research Process (Step by Step)

### Step 1: Source Selection
Choose research sources based on daily focus:

**For SaaS Founders / App Builders:**
- LinkedIn search: "founder" + "SaaS" + "Instagram"
- Product Hunt: look at recent launches with active founders
- Twitter/X: search "building in public" + Instagram references
- Indie Hackers: founder profiles with social presence

**For Ecommerce / Shopify:**
- LinkedIn search: "Shopify" + "founder" + "ecommerce"
- Instagram: brand accounts with high engagement
- AppSumo: recent listings with founder bios

**For Agencies:**
- LinkedIn search: "social media agency" + "Instagram marketing"
- LinkedIn company pages with 2–50 employees
- Google search: top Instagram marketing agencies

**For Creators / Coaches / Educators:**
- Instagram: accounts with active comment sections
- LinkedIn: "founder" + "coach" + "course"
- YouTube: educators with active community

---

### Step 2: Initial Screening
Before full research, screen each candidate:

**Quick screen (< 1 minute per lead):**
- [ ] Do they have a public Instagram or LinkedIn with visible activity?
- [ ] Do they sell something (product, service, app, course)?
- [ ] Does their business model involve social engagement?
- [ ] Is their fit_score likely to be ≥ 5?

If yes to all: proceed to full research
If no: skip

---

### Step 3: Full Research
For each screened lead:
1. Read their public LinkedIn profile
2. Review their public Instagram profile (follower count, post frequency, engagement visible in comments)
3. Visit their website or landing page
4. Check for any other public presence (Twitter, YouTube, podcast, press)
5. Complete the lead JSON with all available data
6. Score fit, intent, and timing
7. Assign lead temperature

---

### Step 4: Quality Check
Before adding to the Leads tab:
- [ ] fit_score ≥ 5
- [ ] At least 3 fields beyond name and company are populated
- [ ] lead_temperature is set
- [ ] autom8_angle is specific (not generic)
- [ ] No invented data — all fields reflect real public information

---

### Step 5: Add to Google Sheets
1. Add new row to **Leads** tab
2. Set status = `New`
3. Set date_added = today

---

### Step 6: Pass to Personalization Engine
For each new lead with lead_temperature = Warm, Hot, or Qualified:
1. Send lead JSON to Personalization Engine
2. Receive personalization payload
3. Attach to lead record (add to notes or separate personalization column)

---

### Step 7: Queue for Outreach Strategist
For each lead with personalization payload complete:
1. Flag lead for Outreach Strategist Agent
2. Update status to `Queued`

---

## Daily Output Summary

At the end of each research session, log:

```
Date: [YYYY-MM-DD]
Leads researched: [N]
Leads added: [N]
  Cold: [N]
  Warm: [N]
  Hot: [N]
  Qualified: [N]
Leads skipped (below threshold): [N]
Top lead today: [Name] | [Company] | [Temperature] | [Fit Score]
Notes: [Any observations about today's research]
```

---

## Integration Points

| System | Action |
|--------|--------|
| Google Sheets → Leads tab | New row added per lead |
| Personalization Engine | Receives lead JSON for Warm+ leads |
| Outreach Strategist | Receives leads + personalization for draft creation |

---

## Compliance Reminders
- Use public sources only
- Never buy, scrape, or use private databases
- Do not invent any data
- If email is not publicly listed, leave it blank
- Do not claim to have reviewed private information
