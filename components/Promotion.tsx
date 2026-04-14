"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import Container from "./Container";

type PromotionProps = {
  restaurantId: string;
  title: string;
  description: string;
};

export default function Promotion({
  restaurantId,
  title,
  description
}: PromotionProps) {
  const [buttonLabel, setButtonLabel] = useState("View Offer");
  const [claimDetails, setClaimDetails] = useState<{
    claimCode: string;
    claimedAt: string;
  } | null>(null);
  const [helperText, setHelperText] = useState("");

  const handleClaim = async () => {
    setButtonLabel("Opening...");
    setHelperText("");

    const response = await fetch("/api/promo-claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        restaurantId,
        promoTitle: title
      })
    });

    const data = (await response.json()) as {
      ok?: boolean;
      claimCode?: string;
      claimedAt?: string;
    };

    if (response.ok && data.claimCode && data.claimedAt) {
      setClaimDetails({
        claimCode: data.claimCode,
        claimedAt: data.claimedAt
      });
      setButtonLabel("Saved For You");
      setHelperText("Show this code when you order.");
      return;
    }

    setButtonLabel("Ask Your Server");
    setHelperText("Ask your server about this offer.");
  };

  return (
    <section id="promotion" className="py-16">
      <Container>
        <div className="relative overflow-hidden rounded-[32px] border border-gold-200/30 bg-gradient-to-r from-gold-200/16 via-white/5 to-transparent p-6 sm:p-8">
          <div className="absolute inset-0 bg-gold-sheen opacity-70" />
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-200/40 bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-200">
                <Sparkles size={14} /> Today&apos;s Offer
              </span>
              <h3 className="text-balance font-display text-4xl leading-[0.94] text-ivory">{title}</h3>
              <p className="max-w-lg text-sm text-ivory/70">
                {description}
              </p>
              {helperText ? (
                <p className="text-sm text-gold-100/75">{helperText}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleClaim}
              className="tf-button-secondary border-gold-200/60 bg-gold-200/20 text-gold-100 hover:bg-gold-200/30"
            >
              {buttonLabel}
            </button>
          </div>
          {claimDetails ? (
            <div className="relative z-10 mt-4 rounded-[28px] border border-gold-200/35 bg-black/45 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gold-200/85">
                Offer Saved
              </p>
              <h4 className="mt-3 text-xl font-semibold text-ivory">
                Show this to your server when you are ready.
              </h4>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-ivory/45">
                    Claim Code
                  </p>
                  <p className="mt-1 font-mono text-lg text-gold-100">
                    {claimDetails.claimCode}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-ivory/45">
                    Saved At
                  </p>
                  <p className="mt-1 text-sm text-ivory/75">
                    {new Date(claimDetails.claimedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-ivory/65">
                Your server can use this code to confirm the offer at the table.
              </p>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
