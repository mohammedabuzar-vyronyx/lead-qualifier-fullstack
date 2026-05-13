"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradeButtons({ isPaid }: { isPaid: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      let data: { url?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        setError(`Server error (${res.status}) — check Vercel environment variables (STRIPE_SECRET_KEY, STRIPE_PRICE_ID).`);
        return;
      }
      if (data.url) {
        router.push(data.url);
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) router.push(data.url);
      else setError(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isPaid) {
    return (
      <button
        onClick={handleManage}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 text-slate-300 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-slate-200 animate-spin" />
        ) : null}
        Manage Subscription
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {loading ? (
          <span className="w-4 h-4 rounded-full border-2 border-violet-300 border-t-white animate-spin" />
        ) : null}
        Upgrade to Pro — $29/month
      </button>
    </div>
  );
}
