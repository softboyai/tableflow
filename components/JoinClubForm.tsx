"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Container from "./Container";

type JoinClubFormProps = {
  restaurantId: string;
  restaurantName: string;
};

export default function JoinClubForm({
  restaurantId,
  restaurantName
}: JoinClubFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!supabase) {
      setStatus("error");
      setMessage("Supabase is not configured yet.");
      return;
    }

    const leadPayload = {
      restaurant_id: restaurantId,
      name,
      phone,
      source: "qr_join_club"
    };

    let error: { message?: string } | null = null;

    const customerLeadInsert = await supabase
      .from("customer_leads")
      .insert(leadPayload);

    error = customerLeadInsert.error;

    if (error) {
      const fallbackInsert = await supabase.from("club_signups").insert({
        name,
        phone
      });
      error = fallbackInsert.error;
    }

    if (error) {
      setStatus("error");
      setMessage("We couldn't save your request. Please try again.");
      return;
    }

    setStatus("success");
    setMessage(`Welcome to ${restaurantName}. We will be in touch shortly.`);
    setName("");
    setPhone("");
  };

  return (
    <section id="join-club" className="py-16">
      <Container>
        <div className="relative overflow-hidden rounded-[32px] border border-gold-200/24 bg-black/50 p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-200/15 via-transparent to-transparent" />
          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <span className="tf-eyebrow">
                Join the Club
              </span>
              <h2 className="text-balance font-display text-4xl leading-[0.94] text-ivory sm:text-5xl">
                Access exclusive tastings and private events
              </h2>
              <p className="text-sm text-ivory/70">
                Members receive priority reservations, chef collaborations, and
                curated experiences. Leave your details and the {restaurantName}
                concierge team will reach out.
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.3em] text-ivory/70">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="tf-input"
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-[0.3em] text-ivory/70">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="tf-input"
                  placeholder="+250 000 000 000"
                />
              </div>
              <button
                type="submit"
                className="tf-button-primary w-full disabled:opacity-60"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Submitting..." : "Request Access"}
              </button>
              {message ? (
                <p
                  className={`text-sm ${
                    status === "success" ? "text-gold-200" : "text-red-300"
                  }`}
                >
                  {message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
