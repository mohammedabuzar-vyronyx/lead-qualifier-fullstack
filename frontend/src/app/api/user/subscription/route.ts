import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FREE_DAILY_LIMIT = 2;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const isPaid =
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "trialing";

  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase
    .from("lead_scores")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .lt("created_at", `${today}T23:59:59.999Z`);

  return NextResponse.json({
    isPaid,
    usedToday: count ?? 0,
    dailyLimit: FREE_DAILY_LIMIT,
  });
}
