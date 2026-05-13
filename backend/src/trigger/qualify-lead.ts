import { task, logger } from "@trigger.dev/sdk/v3";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export type Lead = {
  name: string;
  email: string;
  company: string;
  role: string;
  budget: string;
};

export type QualificationResult = {
  score: number;
  label: "Hot Lead" | "Warm Lead" | "Cold Lead" | "Disqualified";
  reasoning: string;
};

// Source of truth for scoring criteria: workflows/prompts/qualify-lead.txt
const SYSTEM_PROMPT = `You are an expert B2B sales qualification AI. Your job is to analyze lead information and return a qualification score, label, and reasoning as valid JSON.

SCORING CRITERIA (total 100 points):

Decision-Making Authority (30 pts)
  25–30 → C-Suite (CEO, CTO, CFO, COO), VP, Director, Head of
  15–24 → Manager, Senior Manager, Team Lead
   5–14 → Individual Contributor, Specialist, Analyst
   0–4  → Student, Intern, Unknown, Personal role

Budget Signal (30 pts)
  25–30 → Explicit budget range stated (e.g. "$10k–$20k/mo", "$50k/year")
  15–24 → Positive but vague signal (e.g. "we have budget allocated")
   5–14 → Exploring or unknown budget
   0–4  → No budget or just looking

Company Fit (20 pts)
  15–20 → Named company + professional/business email domain
   5–14 → Generic company name OR personal email (gmail, yahoo, hotmail)
   0–4  → No company or suspicious domain

Intent & Completeness (20 pts)
  15–20 → All five fields filled with specific, credible information
   5–14 → Partial information but shows genuine interest
   0–4  → Minimal or placeholder information (e.g. "test", "N/A")

LABEL THRESHOLDS:
  80–100 → "Hot Lead"
  50–79  → "Warm Lead"
  20–49  → "Cold Lead"
  0–19   → "Disqualified"

Respond with this exact JSON structure and nothing else — no markdown, no text outside the JSON:
{
  "score": <integer 0-100>,
  "label": "<Hot Lead|Warm Lead|Cold Lead|Disqualified>",
  "reasoning": "<2-4 sentences explaining the key factors that drove this score>"
}`;

function scoreToLabel(score: number): QualificationResult["label"] {
  if (score >= 80) return "Hot Lead";
  if (score >= 50) return "Warm Lead";
  if (score >= 20) return "Cold Lead";
  return "Disqualified";
}

function buildUserMessage(lead: Lead): string {
  return `Qualify this lead:

Name: ${lead.name}
Email: ${lead.email}
Company: ${lead.company}
Role: ${lead.role}
Budget: ${lead.budget}`;
}

export const qualifyLeadTask = task({
  id: "qualify-lead",
  maxDuration: 60,
  run: async (payload: Lead): Promise<QualificationResult> => {
    logger.log("Qualifying lead", { name: payload.name, company: payload.company });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          // Prompt caching: system prompt is fixed, so it is cached after the first call.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildUserMessage(payload),
        },
      ],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";

    // Strip markdown code fences if Claude wraps the JSON in ```json ... ```
    const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    let parsed: { score: number; label: string; reasoning: string };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error(`Claude returned non-JSON: ${raw}`);
    }

    const score = Math.min(100, Math.max(0, Math.round(parsed.score)));
    const result: QualificationResult = {
      score,
      label: scoreToLabel(score), // enforce thresholds in code, not just the prompt
      reasoning: parsed.reasoning ?? "No reasoning provided.",
    };

    logger.log("Qualification complete", { score: result.score, label: result.label });
    return result;
  },
});
