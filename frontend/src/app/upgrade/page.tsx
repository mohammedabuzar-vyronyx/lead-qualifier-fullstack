import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UpgradeButtons from "@/components/UpgradeButtons";

export default async function UpgradePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isPaid = false;
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();
    isPaid =
      profile?.subscription_status === "active" ||
      profile?.subscription_status === "trialing";
  }

  return (
    <div className="min-h-screen bg-[#070911] flex flex-col items-center px-4 py-16">
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(109,40,217,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-8"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to qualifier
        </Link>

        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-white mb-3">
            Choose your plan
          </h1>
          <p className="text-slate-400 text-sm">
            Qualify more leads and close more deals.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free */}
          <div className="bg-[#0e1120] border border-white/6 rounded-2xl p-6 flex flex-col">
            <div className="mb-5">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
                Free
              </p>
              <p className="font-display text-3xl font-bold text-white">$0</p>
              <p className="text-xs text-slate-500 mt-1">forever</p>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-400 flex-1">
              <FeatureRow>2 qualifications per day</FeatureRow>
              <FeatureRow>AI scoring &amp; reasoning</FeatureRow>
              <FeatureRow>Lead history</FeatureRow>
            </ul>
            <div className="mt-6 py-2.5 rounded-xl border border-white/8 text-center text-sm text-slate-500">
              Current plan
            </div>
          </div>

          {/* Pro */}
          <div className="bg-[#0e1120] border border-violet-500/30 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% -20%, rgba(109,40,217,0.1) 0%, transparent 60%)",
              }}
            />
            <div className="relative mb-5">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs text-violet-400 uppercase tracking-widest">
                  Pro
                </p>
                {isPaid && (
                  <span className="text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="font-display text-3xl font-bold text-white">$29</p>
              <p className="text-xs text-slate-500 mt-1">per month</p>
            </div>
            <ul className="relative space-y-2.5 text-sm text-slate-300 flex-1">
              <FeatureRow accent>Unlimited qualifications</FeatureRow>
              <FeatureRow accent>AI scoring &amp; reasoning</FeatureRow>
              <FeatureRow accent>Lead history</FeatureRow>
              <FeatureRow accent>Priority support</FeatureRow>
            </ul>
            <div className="relative mt-6">
              <UpgradeButtons isPaid={isPaid} />
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          Payments are processed securely by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}

function FeatureRow({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      <svg
        className={`w-3.5 h-3.5 shrink-0 ${accent ? "text-violet-400" : "text-slate-600"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      {children}
    </li>
  );
}
