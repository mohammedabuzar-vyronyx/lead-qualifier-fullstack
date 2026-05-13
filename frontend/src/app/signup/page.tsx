"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[#070911] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-colors";

  return (
    <div className="min-h-screen bg-[#070911] flex flex-col items-center justify-center px-4">
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, #7c3aed 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs text-violet-400 font-medium tracking-wide uppercase">
              AI Lead Qualifier
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="bg-[#0e1120] border border-white/6 rounded-2xl p-8 text-center">
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
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h2 className="font-display text-lg font-bold text-white mb-2">
              Check your inbox
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We&apos;ve sent a confirmation link to{" "}
              <span className="text-slate-200">{email}</span>. Click it to
              activate your account.
            </p>
          </div>
        ) : (
          /* Sign-up form */
          <div className="bg-[#0e1120] border border-white/6 rounded-2xl p-8">
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Password{" "}
                  <span className="text-slate-600">(min. 6 characters)</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
