"use client";

import { useEffect, useState } from "react";
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

  async function handleSubmit(lead: Lead) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });

      const data = await response.json();

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

      {/* Form Card */}
      <div className="w-full max-w-xl bg-[#0e1120] border border-white/6 rounded-2xl p-8">
        <LeadForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Loading */}
      {isLoading && <LoadingCard />}

      {/* Error */}
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
