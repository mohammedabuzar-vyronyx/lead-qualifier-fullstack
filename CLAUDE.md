# AI Lead Qualifier — CLAUDE.md

## Project Overview

An AI-powered lead qualification tool. The user fills out a form with basic lead information, clicks **Analyze**, and the system returns a qualification score, label, and reasoning — powered by Claude AI running inside a trigger.dev workflow.

**You (Claude Code) are the Agent in this project.** Your job is to build, debug, and iterate on this system by reading the `workflows/` instructions and using the `tools/` scripts.

---

## WAT Framework

This project is organized around the WAT framework:

| Letter | Stands for | Folder | Role |
|--------|-----------|--------|------|
| **W** | Workflows / Instructions | `workflows/` | AI prompts, qualification rules, business logic docs |
| **A** | Agent | *(you — Claude Code)* | Reads W, uses T, writes and runs code |
| **T** | Tools | `tools/` | Helper scripts, seed data, test runners, utilities |

**Always read `workflows/` before making decisions about the AI logic.** That folder is the source of truth for how leads should be evaluated.

---

## Folder Structure

```
/
├── CLAUDE.md                        ← you are here
├── workflows/                       # W: AI instructions & business logic
│   ├── lead-qualification.md        ← qualification criteria & scoring rules
│   └── prompts/
│       └── qualify-lead.txt         ← the system prompt sent to Claude AI
├── tools/                           # T: scripts & utilities
│   └── scripts/
│       ├── test-lead.ts             ← manually trigger a qualification run
│       └── seed-leads.ts            ← seed test leads for local dev
├── backend/                         # trigger.dev tasks (TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── trigger.config.ts
│   └── src/
│       └── trigger/
│           └── qualify-lead.ts      ← the main trigger.dev task
└── frontend/                        # Next.js app (deployed to Vercel)
    ├── package.json
    ├── next.config.ts
    ├── .env.local                   ← gitignored
    └── src/
        ├── app/
        │   ├── page.tsx             ← lead form UI
        │   └── api/
        │       └── qualify/
        │           └── route.ts     ← Next.js API route → calls trigger.dev
        └── components/
            ├── LeadForm.tsx         ← form component
            └── QualificationResult.tsx  ← displays score/label/reasoning
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14+ (App Router) | TypeScript, Tailwind CSS |
| Deployment (FE) | Vercel | Connected via GitHub |
| Backend | trigger.dev (cloud) | Serverless task runner |
| AI | Claude API (`claude-sonnet-4-6`) | Called inside the trigger.dev task |
| Language | TypeScript (everywhere) | Strict mode |

---

## Architecture

```
User fills form
      │
      ▼
[Next.js: /api/qualify]          ← Next.js API route (server-side)
      │  POST { lead }
      ▼
[trigger.dev SDK]                ← tasks.triggerAndWait("qualify-lead", lead)
      │
      ▼
[trigger.dev Task: qualify-lead] ← runs in trigger.dev cloud
      │  calls Claude API
      ▼
[Claude AI (claude-sonnet-4-6)]  ← returns { score, label, reasoning }
      │
      ▼
[trigger.dev Task returns output]
      │
      ▼
[Next.js API route returns JSON]
      │
      ▼
[Frontend renders QualificationResult]
```

**Key choice:** `tasks.triggerAndWait()` is used so the Next.js API route waits for the result before responding. This keeps the frontend simple (one fetch call, one response). If qualification takes >25s, switch to async polling via `tasks.trigger()` + a `/api/qualify/status/[runId]` route.

---

## Lead Schema

Fields collected in the form and sent to the trigger.dev task:

```typescript
type Lead = {
  name: string;        // Full name
  email: string;       // Business email
  company: string;     // Company name
  role: string;        // Job title / role
  budget: string;      // Budget range (e.g. "$5k–$10k/mo", "Unknown")
};
```

---

## AI Output Schema

What the trigger.dev task returns after calling Claude:

```typescript
type QualificationResult = {
  score: number;      // 0–100
  label: "Hot Lead" | "Warm Lead" | "Cold Lead" | "Disqualified";
  reasoning: string;  // 2–4 sentence explanation
};
```

**Label thresholds (defined in `workflows/lead-qualification.md`):**
- 80–100 → Hot Lead
- 50–79 → Warm Lead
- 20–49 → Cold Lead
- 0–19 → Disqualified

---

## Environment Variables

### `backend/.env`
```
ANTHROPIC_API_KEY=          # Claude API key (from console.anthropic.com)
TRIGGER_SECRET_KEY=         # trigger.dev project secret key
```

### `frontend/.env.local`
```
TRIGGER_SECRET_KEY=         # Same trigger.dev secret (used server-side in API route)
NEXT_PUBLIC_APP_URL=        # e.g. http://localhost:3000 in dev, your Vercel URL in prod
```

> Never expose `TRIGGER_SECRET_KEY` or `ANTHROPIC_API_KEY` to the browser. Both are server-side only.

---

## Development Setup

### Backend (trigger.dev)
```bash
cd backend
npm install
npx trigger.dev@latest dev   # starts local trigger.dev dev server
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev                  # starts at http://localhost:3000
```

Run both simultaneously in separate terminals.

---

## Deployment

### Backend
```bash
cd backend
npx trigger.dev@latest deploy   # deploys tasks to trigger.dev cloud
```

### Frontend
1. Push to GitHub (main branch)
2. Vercel auto-deploys on push
3. Set env vars in Vercel dashboard: `TRIGGER_SECRET_KEY`, `NEXT_PUBLIC_APP_URL`

---

## Key Build Tasks (in order)

Claude Code should tackle these in sequence:

1. **Initialize backend** — `cd backend && npm init`, install `@trigger.dev/sdk`, `@anthropic-ai/sdk`, configure `trigger.config.ts`
2. **Write `workflows/prompts/qualify-lead.txt`** — the system prompt with scoring instructions
3. **Write `workflows/lead-qualification.md`** — scoring rubric and label thresholds
4. **Write the trigger.dev task** — `backend/src/trigger/qualify-lead.ts`
5. **Initialize frontend** — `npx create-next-app@latest frontend` with TypeScript + Tailwind
6. **Write the API route** — `frontend/src/app/api/qualify/route.ts`
7. **Write `LeadForm.tsx`** — form with fields: Name, Email, Company, Role, Budget
8. **Write `QualificationResult.tsx`** — displays score bar, label badge, reasoning text
9. **Wire up `page.tsx`** — renders form, handles submit, shows result
10. **Test end-to-end** — submit a lead locally, verify trigger.dev task fires and result displays
11. **Deploy** — push backend, push frontend to GitHub, set Vercel env vars
