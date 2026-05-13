"use client";

import { useEffect, useState } from "react";

type QualificationResult = {
  score: number;
  label: "Hot Lead" | "Warm Lead" | "Cold Lead" | "Disqualified";
  reasoning: string;
};

const labelConfig = {
  "Hot Lead": {
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    bar: "bg-gradient-to-r from-emerald-600 to-emerald-400",
    dot: "bg-emerald-400",
    accent: "border-emerald-500/20",
    glow: "drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]",
    scoreColor: "text-emerald-300",
  },
  "Warm Lead": {
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    bar: "bg-gradient-to-r from-amber-600 to-amber-300",
    dot: "bg-amber-400",
    accent: "border-amber-500/20",
    glow: "drop-shadow-[0_0_12px_rgba(251,191,36,0.30)]",
    scoreColor: "text-amber-300",
  },
  "Cold Lead": {
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    bar: "bg-gradient-to-r from-blue-600 to-blue-400",
    dot: "bg-blue-400",
    accent: "border-blue-500/20",
    glow: "drop-shadow-[0_0_12px_rgba(96,165,250,0.30)]",
    scoreColor: "text-blue-300",
  },
  Disqualified: {
    badge: "bg-slate-500/15 text-slate-400 border-slate-500/25",
    bar: "bg-slate-600",
    dot: "bg-slate-400",
    accent: "border-white/8",
    glow: "",
    scoreColor: "text-slate-400",
  },
};

function useCountUp(target: number, duration = 700) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }

    const raf = requestAnimationFrame((now) => {
      setTimeout(() => requestAnimationFrame(step), 120);
      return now;
    });

    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return count;
}

export default function QualificationResult({
  result,
}: {
  result: QualificationResult;
}) {
  const [visible, setVisible] = useState(false);
  const [barReady, setBarReady] = useState(false);

  const config = labelConfig[result.label];
  const displayScore = useCountUp(visible ? result.score : 0);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 40);
    const bar = setTimeout(() => setBarReady(true), 160);
    return () => {
      clearTimeout(show);
      clearTimeout(bar);
    };
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
    >
      <div
        className={`bg-[#0e1120] border ${config.accent} rounded-2xl overflow-hidden`}
      >
        {/* Score header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start justify-between mb-5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium uppercase tracking-wider ${config.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {result.label}
            </span>

            <div className={`text-right ${config.glow}`}>
              <span
                className={`font-display text-5xl font-bold leading-none ${config.scoreColor}`}
              >
                {displayScore}
              </span>
              <span className="text-slate-600 text-sm ml-1">/100</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${config.bar}`}
              style={{ width: barReady ? `${result.score}%` : "0%" }}
              role="progressbar"
              aria-valuenow={result.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Lead score: ${result.score} out of 100`}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mx-8" />

        {/* Reasoning */}
        <div className="px-8 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium mb-3">
            AI Analysis
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {result.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
}
