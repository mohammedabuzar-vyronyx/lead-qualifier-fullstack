import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const stripeCustomerId = profile?.stripe_customer_id as string | undefined;

  if (!stripeCustomerId) {
    return NextResponse.json({ isPaid: false });
  }

  // Fetch active subscriptions directly from Stripe
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
    limit: 1,
  });

  const active = subscriptions.data[0];

  if (active) {
    await supabase
      .from("user_profiles")
      .update({
        subscription_id: active.id,
        subscription_status: active.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  return NextResponse.json({ isPaid: !!active });
}
