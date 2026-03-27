"use client";

import { useEffect, useState } from "react";
import Container from "./Container";
import SectionHeader from "./SectionHeader";

type ClubSignup = {
  id: string;
  name: string;
  phone: string;
  created_at: string;
};

type ClubListProps = {
  adminToken: string;
};

export default function ClubList({ adminToken }: ClubListProps) {
  const [signups, setSignups] = useState<ClubSignup[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchSignups = async () => {
    if (!adminToken) return;
    setStatus("loading");
    setErrorMessage("");
    const response = await fetch("/api/admin/signups", {
      headers: {
        "x-admin-password": adminToken
      }
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus("error");
      setErrorMessage(payload?.error || "Unable to load data.");
      return;
    }

    setSignups(payload?.data ?? []);
    setStatus("idle");
  };

  useEffect(() => {
    fetchSignups();
  }, [adminToken]);

  return (
    <section className="py-16">
      <Container className="space-y-8">
        <SectionHeader
          eyebrow="Club Members"
          title="Recent concierge requests"
          subtitle="A live view of guests who joined the club."
        />
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.3em] text-ivory/60">
              Live feed
            </p>
            <button
              type="button"
              onClick={fetchSignups}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-ivory/80 transition hover:border-gold-200/60 hover:text-ivory"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          {status === "error" ? (
            <p className="text-sm text-red-300">
              Unable to load customer data. {errorMessage}
            </p>
          ) : null}
          {!signups.length && status !== "loading" ? (
            <p className="text-sm text-ivory/70">No entries yet.</p>
          ) : null}
          <div className="space-y-3">
            {signups.map((signup) => (
              <div
                key={signup.id}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-ivory">
                    {signup.name}
                  </p>
                  <p className="text-xs text-ivory/60">{signup.phone}</p>
                </div>
                <p className="text-xs text-ivory/50">
                  {new Date(signup.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
