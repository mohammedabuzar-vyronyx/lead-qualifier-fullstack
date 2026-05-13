import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type LeadScoreRow = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  budget: string;
  score: number;
  label: "Hot Lead" | "Warm Lead" | "Cold Lead" | "Disqualified";
  reasoning: string;
  created_at: string;
};

const labelConfig = {
  "Hot Lead": {
    badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    score: "text-emerald-400",
  },
  "Warm Lead": {
    badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    score: "text-amber-400",
  },
  "Cold Lead": {
    badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    score: "text-blue-400",
  },
  Disqualified: {
    badge: "bg-slate-500/10 border-slate-500/20 text-slate-400",
    score: "text-slate-400",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("lead_scores")
    .select("*")
    .order("created_at", { ascending: false });

  const leads = (rows ?? []) as LeadScoreRow[];

  if (error) {
    console.error("Failed to load history:", error.message);
  }

  return (
    <div className="min-h-screen bg-[#070911] px-4 py-12">
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, #7c3aed 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6"
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
          <h1 className="font-display text-2xl font-bold text-white">
            Lead History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {leads.length === 0
              ? "No leads qualified yet."
              : `${leads.length} lead${leads.length === 1 ? "" : "s"} qualified`}
          </p>
        </div>

        {/* Empty state */}
        {leads.length === 0 && (
          <div className="bg-[#0e1120] border border-white/6 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                />
              </svg>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              No leads qualified yet — head back to the qualifier and analyze
              your first lead.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              Qualify a lead
            </Link>
          </div>
        )}

        {/* Lead cards */}
        <div className="space-y-3">
          {leads.map((lead) => {
            const config = labelConfig[lead.label];
            return (
              <div
                key={lead.id}
                className="bg-[#0e1120] border border-white/6 rounded-2xl px-6 py-5"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: lead info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-200 truncate">
                        {lead.company}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.badge}`}
                      >
                        {lead.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lead.name} · {lead.role}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                      {lead.reasoning}
                    </p>
                  </div>

                  {/* Right: score + date */}
                  <div className="text-right shrink-0">
                    <span
                      className={`font-display text-2xl font-bold ${config.score}`}
                    >
                      {lead.score}
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      {formatDate(lead.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
