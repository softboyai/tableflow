"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";

const storageKey = "tableflow-admin-password";

type AdminAuthGateProps = {
  title: string;
  subtitle: string;
  children: (password: string) => ReactNode;
};

export default function AdminAuthGate({
  title,
  subtitle,
  children
}: AdminAuthGateProps) {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(storageKey) || "";
    if (saved) {
      setPassword(saved);
    }
  }, []);

  const isAuthed = useMemo(() => Boolean(password), [password]);

  async function submitPassword(event?: FormEvent) {
    event?.preventDefault();
    setIsChecking(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password: input })
      });

      if (!response.ok) {
        setError("incorrect password");
        return;
      }

      window.sessionStorage.setItem(storageKey, input);
      setPassword(input);
      setInput("");
    } catch (fetchError) {
      setError("unable to verify password");
    } finally {
      setIsChecking(false);
    }
  }

  function clearAccess() {
    window.sessionStorage.removeItem(storageKey);
    setPassword("");
    setInput("");
    setError("");
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-6 text-ivory sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1120px] space-y-6">
        <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="tf-mono text-[11px] uppercase tracking-[0.12em] text-gold-200/80">
                Founder Admin
              </p>
              <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.04em] text-ivory sm:text-[34px]">
                {title}
              </h1>
              <p className="mt-2 max-w-[720px] text-sm leading-7 text-ivory/62 sm:text-[15px]">
                {subtitle}
              </p>
            </div>
            {isAuthed ? (
              <button
                type="button"
                onClick={clearAccess}
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-ivory transition hover:border-gold-200/40 hover:bg-white/[0.04]"
              >
                Lock Admin
              </button>
            ) : null}
          </div>
        </div>

        {isAuthed ? (
          children(password)
        ) : (
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <form className="space-y-4" onSubmit={submitPassword}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-ivory/78">
                  Enter admin password
                </span>
                <input
                  type="password"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-ivory placeholder:text-ivory/35 focus:border-gold-200/50 focus:outline-none"
                  placeholder="Admin password"
                  autoComplete="current-password"
                />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isChecking}
                  className="inline-flex items-center justify-center rounded-full bg-gold-300 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-gold-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isChecking ? "Checking..." : "Open Admin"}
                </button>
                {error ? (
                  <p className="text-sm text-red-300">{error}</p>
                ) : null}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
