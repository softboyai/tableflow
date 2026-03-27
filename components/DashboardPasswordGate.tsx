"use client";

import { useState } from "react";

type DashboardPasswordGateProps = {
  slug: string;
  restaurantName: string;
  requiresSetup?: boolean;
};

export default function DashboardPasswordGate({
  slug,
  restaurantName,
  requiresSetup = false
}: DashboardPasswordGateProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    if (requiresSetup) {
      if (password.length < 6) {
        setStatus("error");
        setErrorMessage("Password must be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setStatus("error");
        setErrorMessage("Passwords do not match.");
        return;
      }
    }

    const response = await fetch(`/api/restaurants/${slug}/auth`, {
      method: requiresSetup ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus("error");
      setErrorMessage(data.error || "We couldn't open your restaurant access yet.");
      return;
    }

    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-ink text-ivory">
      <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-16">
        <div className="tf-panel w-full p-8">
          <p className="tf-eyebrow">
            {requiresSetup ? "Secure Your Access" : "Welcome Back"}
          </p>
          <h1 className="mt-4 text-balance font-display text-5xl leading-[0.94]">{restaurantName}</h1>
          <p className="mt-3 text-sm text-ivory/65">
            {requiresSetup
              ? "Set your private password so only you can make changes to your restaurant."
              : "Enter your private password to continue."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
                Dashboard Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="tf-input"
              />
            </label>
            {requiresSetup ? (
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
                  Confirm Password
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="tf-input"
                />
              </label>
            ) : null}
            <button
              type="submit"
              disabled={status === "loading"}
              className="tf-button-primary w-full disabled:opacity-60"
            >
              {status === "loading"
                ? requiresSetup
                  ? "Saving..."
                  : "Unlocking..."
                : requiresSetup
                  ? "Save Password"
                  : "Open My Restaurant"}
            </button>
            {errorMessage ? (
              <p className="text-sm text-red-300">{errorMessage}</p>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  );
}
