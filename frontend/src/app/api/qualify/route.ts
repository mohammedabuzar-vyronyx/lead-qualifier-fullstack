import { tasks, runs } from "@trigger.dev/sdk/v3";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

type Lead = {
  name: string;
  email: string;
  company: string;
  role: string;
  budget: string;
};

type QualificationResult = {
  score: number;
  label: "Hot Lead" | "Warm Lead" | "Cold Lead" | "Disqualified";
  reasoning: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Lead;

  const requiredFields: (keyof Lead)[] = [
    "name",
    "email",
    "company",
    "role",
    "budget",
  ];
  for (const field of requiredFields) {
    if (!body[field]?.trim()) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  const handle = await tasks.trigger("qualify-lead", body);

  const result = await runs.poll(handle.id, { pollIntervalMs: 1500 });

  if (result.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Qualification task failed. Please try again." },
      { status: 500 }
    );
  }

  const output = result.output as QualificationResult;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("lead_scores").insert({
        user_id: user.id,
        name: body.name,
        email: body.email,
        company: body.company,
        role: body.role,
        budget: body.budget,
        score: output.score,
        label: output.label,
        reasoning: output.reasoning,
      });
    }
  } catch (err) {
    console.error("Failed to save lead score:", err);
  }

  return NextResponse.json(output);
}
