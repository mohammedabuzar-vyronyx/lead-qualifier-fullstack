# Lead Qualification Rules

This document defines the business logic for AI lead scoring. The AI prompt in `prompts/qualify-lead.txt` is generated from these rules.

## Scoring Dimensions

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Decision-Making Authority | 30 pts | Can this person actually buy? |
| Budget Signal | 30 pts | Is there real money attached? |
| Company Fit | 20 pts | Is this a legitimate business contact? |
| Intent & Completeness | 20 pts | Did they fill the form seriously? |

## Labels & Thresholds

| Score | Label | Action |
|-------|-------|--------|
| 80–100 | Hot Lead | Priority follow-up within 24h |
| 50–79 | Warm Lead | Nurture, follow up within 48h |
| 20–49 | Cold Lead | Add to drip campaign |
| 0–19 | Disqualified | Do not pursue |

## Decision-Making Authority (30 pts)

The role field determines whether the contact can authorize a purchase.

- **25–30** — C-Suite (CEO, CTO, CFO, COO, CRO), VP, Director, Head of [Department]
- **15–24** — Manager, Senior Manager, Team Lead
- **5–14** — Individual Contributor, Specialist, Analyst, Engineer
- **0–4** — Student, Intern, unknown role, personal/hobby context

## Budget Signal (30 pts)

An explicit budget range is the strongest positive signal.

- **25–30** — Specific dollar range given (e.g. "$10k–$20k/mo")
- **15–24** — Positive but vague (e.g. "we have budget", "approved headcount")
- **5–14** — Exploring or unknown (field left blank, "not sure yet")
- **0–4** — No budget, just browsing, or price-shopping only

## Company Fit (20 pts)

Checks whether the contact is from a real, relevant business.

- **15–20** — Named company + matching professional email domain
- **5–14** — Generic company name OR free email (gmail, yahoo, hotmail, outlook)
- **0–4** — No company, suspicious/disposable email, or known competitor domain

## Intent & Completeness (20 pts)

Measures whether the lead filled out the form deliberately.

- **15–20** — All five fields filled with specific, credible values
- **5–14** — Most fields filled but some vague or generic
- **0–4** — Placeholder values ("test", "N/A", "aaa"), single characters, or mostly empty

## Tuning the Scoring

To adjust scoring behavior:
1. Edit `prompts/qualify-lead.txt` — change point ranges or add new criteria
2. The `qualify-lead.ts` task enforces label thresholds in code (overrides Claude's label to match the score), so changing thresholds requires editing both the prompt and the `scoreToLabel()` function in the task
