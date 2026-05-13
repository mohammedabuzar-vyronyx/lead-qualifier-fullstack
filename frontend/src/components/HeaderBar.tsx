"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function HeaderBar({ email }: { email: string | null }) {
  const router = useRouter();

  if (!email) return null;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const truncatedEmail =
    email.length > 24 ? email.slice(0, 22) + "…" : email;

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-12 border-b border-white/6 bg-[#070911]/80 backdrop-blur-md flex items-center justify-between px-6">
      <span className="font-display text-sm font-bold text-white/50 tracking-tight">
        AI Lead Qualifier
      </span>

      <div className="flex items-center gap-4">
        <Link
          href="/history"
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          History
        </Link>

        <span className="text-slate-700 text-xs">·</span>

        <span className="text-xs text-slate-500 hidden sm:block">
          {truncatedEmail}
        </span>

        <button
          onClick={handleSignOut}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
