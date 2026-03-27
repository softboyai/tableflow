"use client";

import { useState } from "react";

type RestaurantEditorProps = {
  restaurant: {
    name: string;
    slug: string;
    tagline: string | null;
    whatsapp_number: string | null;
    phone_number: string | null;
    promo_title: string | null;
    promo_text: string | null;
    hero_image_url: string | null;
    menu_pdf_url: string | null;
    maps_embed_url: string | null;
    address: string | null;
    location_hint: string | null;
    hours_label: string | null;
  };
};

export default function RestaurantContentEditor({
  restaurant
}: RestaurantEditorProps) {
  const [form, setForm] = useState({
    name: restaurant.name || "",
    slug: restaurant.slug || "",
    tagline: restaurant.tagline || "",
    whatsappNumber: restaurant.whatsapp_number || "",
    phoneNumber: restaurant.phone_number || "",
    promoTitle: restaurant.promo_title || "",
    promoText: restaurant.promo_text || "",
    address: restaurant.address || "",
    locationHint: restaurant.location_hint || "",
    hoursLabel: restaurant.hours_label || "",
    mapsEmbedUrl: restaurant.maps_embed_url || ""
  });
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [menuPdf, setMenuPdf] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));

    if (heroImage) {
      payload.append("heroImage", heroImage);
    }

    if (menuPdf) {
      payload.append("menuPdf", menuPdf);
    }

    const response = await fetch(`/api/restaurants/${restaurant.slug}`, {
      method: "PATCH",
      body: payload
    });

    const data = (await response.json()) as {
      error?: string;
      pageUrl?: string;
      dashboardUrl?: string;
    };

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "We couldn't save your changes.");
      return;
    }

    setStatus("success");
    setMessage("Your restaurant details have been updated.");

    if (data.dashboardUrl && data.dashboardUrl !== `/dashboard/${restaurant.slug}`) {
      window.location.href = data.dashboardUrl;
      return;
    }

    window.location.reload();
  };

  return (
    <div className="tf-panel p-6">
      <div className="space-y-2">
        <p className="tf-eyebrow">
          Your Details
        </p>
        <h2 className="text-2xl font-semibold text-ivory">
          Refresh the experience your guests see
        </h2>
        <p className="text-sm text-ivory/65">
          Update your restaurant name, welcome message, offer, contact details, and menu files whenever things change.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Restaurant Name"
            value={form.name}
            onChange={(value) => setForm((current) => ({ ...current, name: value }))}
          />
          <Field
            label="Slug"
            value={form.slug}
            onChange={(value) => setForm((current) => ({ ...current, slug: value }))}
          />
          <Field
            label="WhatsApp Number"
            value={form.whatsappNumber}
            onChange={(value) =>
              setForm((current) => ({ ...current, whatsappNumber: value }))
            }
          />
          <Field
            label="Phone Number"
            value={form.phoneNumber}
            onChange={(value) =>
              setForm((current) => ({ ...current, phoneNumber: value }))
            }
          />
        </div>

        <Field
          label="Tagline"
          value={form.tagline}
          onChange={(value) => setForm((current) => ({ ...current, tagline: value }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Promo Title"
            value={form.promoTitle}
            onChange={(value) =>
              setForm((current) => ({ ...current, promoTitle: value }))
            }
          />
          <Field
            label="Hours Label"
            value={form.hoursLabel}
            onChange={(value) =>
              setForm((current) => ({ ...current, hoursLabel: value }))
            }
          />
        </div>

        <TextField
          label="Promo Text"
          value={form.promoText}
          onChange={(value) => setForm((current) => ({ ...current, promoText: value }))}
        />
        <Field
          label="Address"
          value={form.address}
          onChange={(value) => setForm((current) => ({ ...current, address: value }))}
        />
        <Field
          label="Location Hint"
          value={form.locationHint}
          onChange={(value) =>
            setForm((current) => ({ ...current, locationHint: value }))
          }
        />
        <TextField
          label="Google Maps Embed URL"
          value={form.mapsEmbedUrl}
          onChange={(value) =>
            setForm((current) => ({ ...current, mapsEmbedUrl: value }))
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FileField
            label={`Hero Image${restaurant.hero_image_url ? " (replace)" : ""}`}
            accept="image/*"
            onChange={setHeroImage}
          />
          <FileField
            label={`Menu PDF${restaurant.menu_pdf_url ? " (replace)" : ""}`}
            accept="application/pdf"
            onChange={setMenuPdf}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="tf-button-primary disabled:opacity-60"
          >
            {status === "loading" ? "Saving..." : "Save"}
          </button>
          {message ? (
            <p
              className={`text-sm ${
                status === "error" ? "text-red-300" : "text-gold-200"
              }`}
            >
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function Field({ label, value, onChange }: FieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="tf-input"
      />
    </label>
  );
}

function TextField({ label, value, onChange }: FieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="tf-input"
      />
    </label>
  );
}

type FileFieldProps = {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
};

function FileField({ label, accept, onChange }: FileFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
        {label}
      </span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] || null)}
        className="w-full rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm text-ivory file:mr-4 file:rounded-full file:border-0 file:bg-gold-300 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink"
      />
    </label>
  );
}
