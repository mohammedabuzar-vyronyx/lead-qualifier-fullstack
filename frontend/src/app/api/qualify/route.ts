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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Enforce free-tier daily limit
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const isPaid =
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "trialing";

  if (!isPaid) {
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("lead_scores")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00.000Z`)
      .lt("created_at", `${today}T23:59:59.999Z`);

    if ((count ?? 0) >= 2) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: "You've used your 2 free qualifications today. Upgrade to Pro for unlimited.",
        },
        { status: 402 }
      );
    }
  }

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
  } catch (err) {
    console.error("Failed to save lead score:", err);
  }

  return NextResponse.json(output);
}
