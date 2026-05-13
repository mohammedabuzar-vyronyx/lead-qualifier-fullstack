"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import QualificationResult from "@/components/QualificationResult";

type Lead = {
  name: string;
  email: string;
  company: string;
  role: string;
  budget: string;
};

type LeadResult = {
  score: number;
  label: "Hot Lead" | "Warm Lead" | "Cold Lead" | "Disqualified";
  reasoning: string;
};

type SubscriptionInfo = {
  isPaid: boolean;
  usedToday: number;
  dailyLimit: number;
};

const LOADING_MESSAGES = [
  "Sending to Claude AI…",
  "Evaluating decision-making authority…",
  "Analyzing budget signals…",
  "Scoring company fit…",
  "Generating reasoning…",
];

function LoadingCard() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mt-6">
      <div className="bg-[#0e1120] border border-white/6 rounded-2xl px-8 py-7 flex items-center gap-5">
        <div className="shrink-0 w-8 h-8 rounded-full border-2 border-violet-800 border-t-violet-400 animate-spin" />
        <div>
          <p className="text-sm text-slate-200 transition-all duration-300">
            {LOADING_MESSAGES[msgIndex]}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            This usually takes 5&ndash;15 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [result, setResult] = useState<LeadResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [justUpgraded, setJustUpgraded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      // Sync subscription status directly from Stripe then refresh
      fetch("/api/stripe/sync", { method: "POST" })
        .then((r) => r.json())
        .then((data) => {
          if (data.isPaid) setJustUpgraded(true);
        })
        .catch(() => null)
        .finally(() => {
          // Clean up the URL
          window.history.replaceState({}, "", "/");
          fetch("/api/user/subscription")
            .then((r) => r.json())
            .then((data) => { if (!data.error) setSubscription(data as SubscriptionInfo); })
            .catch(() => null);
        });
    } else {
      fetch("/api/user/subscription")
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) setSubscription(data as SubscriptionInfo);
        })
        .catch(() => null);
    }
  }, [result]); // re-fetch after each qualification to update the counter

  async function handleSubmit(lead: Lead) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLimitReached(false);

    try {
      const response = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      const data = await response.json();

      if (response.status === 402) {
        setLimitReached(true);
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const showUsageBar =
    subscription && !subscription.isPaid;

  const usageAtLimit =
    showUsageBar && subscription.usedToday >= subscription.dailyLimit;

  return (
    <div className="min-h-screen bg-[#070911] flex flex-col items-center py-16 px-4">
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(109,40,217,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="relative w-full max-w-xl mb-10 text-center">
        <Link
          href="/upgrade"
          className="absolute right-0 top-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 text-xs font-medium hover:bg-violet-500/15 transition-colors"
        >
          Upgrade to Pro
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/8 border border-violet-500/20 text-violet-400 text-xs uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Powered by Claude AI
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight leading-none mb-4 bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          AI Lead Qualifier
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
          Enter lead details below and let Claude AI score and analyze their
          qualification in seconds.
        </p>
      </div>

      {/* Upgrade success banner */}
      {justUpgraded && (
        <div className="w-full max-w-xl mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          You&apos;re now on Pro — unlimited qualifications unlocked!
        </div>
      )}

      {/* Form Card */}
      <div className="w-full max-w-xl bg-[#0e1120] border border-white/6 rounded-2xl p-8">
        <LeadForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Free-tier usage counter */}
      {showUsageBar && (
        <div className="w-full max-w-xl mt-3 flex items-center justify-between px-1">
          <p
            className={`text-xs ${usageAtLimit ? "text-amber-400" : "text-slate-500"}`}
          >
            {subscription.usedToday}/{subscription.dailyLimit} free qualifications used today
          </p>
          <Link
            href="/upgrade"
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Upgrade for unlimited →
          </Link>
        </div>
      )}

      {/* Loading */}
      {isLoading && <LoadingCard />}

      {/* Limit-reached upgrade prompt */}
      {limitReached && !isLoading && (
        <div className="w-full max-w-xl mt-6 bg-[#0e1120] border border-violet-500/25 rounded-2xl px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <svg
                className="w-4.5 h-4.5 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200">
                Daily limit reached
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                You&apos;ve used your 2 free qualifications today. Upgrade to Pro for unlimited qualifications.
              </p>
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
              >
                Upgrade to Pro — $29/month
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
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Generic error */}
      {error && !isLoading && (
        <div className="w-full max-w-xl mt-6 px-5 py-4 bg-red-500/8 border border-red-500/20 rounded-xl flex items-start gap-3">
          <svg
            className="w-4 h-4 text-red-400 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && !isLoading && (
        <div className="w-full max-w-xl mt-6">
          <QualificationResult result={result} />
          <div className="mt-3 text-center">
            <a
              href="/history"
              className="text-xs text-slate-500 hover:text-violet-400 transition-colors"
            >
              View all past results →
            </a>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="mt-16 text-xs text-slate-600">
        Scores are generated by AI and should be used as a guide only.
      </p>
    </div>
  );
}
