"use client";

import { useState } from "react";

type Lead = {
  name: string;
  email: string;
  company: string;
  role: string;
  budget: string;
};

type Props = {
  onSubmit: (lead: Lead) => void;
  isLoading: boolean;
};

const inputClass =
  "w-full bg-[#070911] border border-white/8 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200";

const inputErrorClass =
  "w-full bg-[#070911] border border-red-500/40 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10 transition-all duration-200";

const labelClass = "block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-widest";

export default function LeadForm({ onSubmit, isLoading }: Props) {
  const [fields, setFields] = useState<Lead>({
    name: "",
    email: "",
    company: "",
    role: "",
    budget: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof Lead, boolean>>>({});

  function update(field: keyof Lead, value: string) {
    setFields((f) => ({ ...f, [field]: value }));
  }

  function touch(field: keyof Lead) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function isEmpty(field: keyof Lead) {
    return touched[field] && !fields[field].trim();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      (Object.keys(fields) as (keyof Lead)[]).map((k) => [k, true])
    );
    setTouched(allTouched);

    const hasEmpty = (Object.keys(fields) as (keyof Lead)[]).some(
      (k) => !fields[k].trim()
    );
    if (hasEmpty) return;

    onSubmit(fields);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-1 mb-6">
        <h2 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">
          Lead Details
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="off"
            placeholder="Jane Smith"
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => touch("name")}
            className={isEmpty("name") ? inputErrorClass : inputClass}
          />
          {isEmpty("name") && (
            <p className="mt-1 text-xs text-red-400">Required</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Business Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="off"
            placeholder="jane@company.com"
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => touch("email")}
            className={isEmpty("email") ? inputErrorClass : inputClass}
          />
          {isEmpty("email") && (
            <p className="mt-1 text-xs text-red-400">Required</p>
          )}
        </div>

        <div>
          <label htmlFor="company" className={labelClass}>
            Company
          </label>
          <input
            id="company"
            type="text"
            autoComplete="off"
            placeholder="Acme Corp"
            value={fields.company}
            onChange={(e) => update("company", e.target.value)}
            onBlur={() => touch("company")}
            className={isEmpty("company") ? inputErrorClass : inputClass}
          />
          {isEmpty("company") && (
            <p className="mt-1 text-xs text-red-400">Required</p>
          )}
        </div>

        <div>
          <label htmlFor="role" className={labelClass}>
            Job Title
          </label>
          <input
            id="role"
            type="text"
            autoComplete="off"
            placeholder="VP of Marketing"
            value={fields.role}
            onChange={(e) => update("role", e.target.value)}
            onBlur={() => touch("role")}
            className={isEmpty("role") ? inputErrorClass : inputClass}
          />
          {isEmpty("role") && (
            <p className="mt-1 text-xs text-red-400">Required</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="budget" className={labelClass}>
          Budget Range
        </label>
        <input
          id="budget"
          type="text"
          autoComplete="off"
          placeholder='e.g. "$5k–$10k/mo", "Exploring options", "Unknown"'
          value={fields.budget}
          onChange={(e) => update("budget", e.target.value)}
          onBlur={() => touch("budget")}
          className={isEmpty("budget") ? inputErrorClass : inputClass}
        />
        {isEmpty("budget") && (
          <p className="mt-1 text-xs text-red-400">Required</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium text-sm py-3.5 px-6 rounded-lg transition-all duration-200 group"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-violet-300/30 border-t-violet-300 animate-spin" />
            Analyzing&hellip;
          </>
        ) : (
          <>
            Analyze Lead
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
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
          </>
        )}
      </button>
    </form>
  );
}
