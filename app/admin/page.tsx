"use client";

import { useState } from "react";
import ClubList from "@/components/ClubList";

export default function AdminPage() {
  const [adminInput, setAdminInput] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";

  return (
    <main className="min-h-screen bg-ink text-ivory">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="font-display text-3xl">Admin Dashboard</h1>
          <p className="text-sm text-ivory/60">
            Secure access to concierge requests.
          </p>
        </div>
      </div>
      {!isAuthed ? (
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="space-y-4">
              <p className="text-sm text-ivory/70">
                Admin access required to view customer data.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="password"
                  value={adminInput}
                  onChange={(event) => setAdminInput(event.target.value)}
                  placeholder="Enter admin password"
                  className="w-full flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-200/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!adminPassword) {
                      setAuthError(
                        "Admin access is unavailable. Please contact support."
                      );
                      return;
                    }
                    if (adminInput === adminPassword) {
                      setIsAuthed(true);
                      setAuthError("");
                    } else {
                      setAuthError("Incorrect password.");
                    }
                  }}
                  className="rounded-full bg-gold-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-200"
                >
                  Unlock
                </button>
              </div>
              {authError ? (
                <p className="text-sm text-red-300">{authError}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <ClubList adminToken={adminInput} />
      )}
    </main>
  );
}
