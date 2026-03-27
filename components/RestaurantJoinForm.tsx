"use client";

import { useState } from "react";
import { slugify } from "@/lib/slugify";

type JoinResponse = {
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
  pageUrl: string;
  dashboardUrl: string;
  nextSteps: string[];
};

const initialState = {
  name: "",
  slug: "",
  dashboardPassword: "",
  confirmDashboardPassword: "",
  whatsappNumber: "",
  phoneNumber: "",
  tagline: "",
  promoTitle: "",
  promoText: "",
  address: "",
  locationHint: "",
  hoursLabel: "",
  mapsEmbedUrl: ""
};

export default function RestaurantJoinForm() {
  const [form, setForm] = useState(initialState);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [menuPdf, setMenuPdf] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<JoinResponse | null>(null);

  const handleChange = (field: keyof typeof initialState, value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "name" && !current.slug) {
        next.slug = slugify(value);
      }

      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    setResult(null);

    if (form.dashboardPassword.length < 6) {
      setStatus("error");
      setErrorMessage("Dashboard password must be at least 6 characters.");
      return;
    }

    if (form.dashboardPassword !== form.confirmDashboardPassword) {
      setStatus("error");
      setErrorMessage("Dashboard passwords do not match.");
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));

    if (heroImage) {
      payload.append("heroImage", heroImage);
    }

    if (menuPdf) {
      payload.append("menuPdf", menuPdf);
    }

    const response = await fetch("/api/restaurants/join", {
      method: "POST",
      body: payload
    });

    const data = (await response.json()) as JoinResponse & { error?: string };

    if (!response.ok) {
      setStatus("error");
      setErrorMessage(data.error || "Unable to create restaurant.");
      return;
    }

    setStatus("success");
    setResult(data);
    setForm(initialState);
    setHeroImage(null);
    setMenuPdf(null);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <form
        onSubmit={handleSubmit}
        className="tf-panel p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Restaurant Name"
            value={form.name}
            onChange={(value) => handleChange("name", value)}
            required
            placeholder="Aurum Dining"
          />
          <Field
            label="Slug"
            value={form.slug}
            onChange={(value) => handleChange("slug", slugify(value))}
            required
            placeholder="aurum-dining"
          />
          <Field
            label="WhatsApp Number"
            value={form.whatsappNumber}
            onChange={(value) => handleChange("whatsappNumber", value)}
            required
            placeholder="250787878745"
          />
          <Field
            label="Phone Number"
            value={form.phoneNumber}
            onChange={(value) => handleChange("phoneNumber", value)}
            placeholder="250787878745"
          />
          <Field
            label="Dashboard Password"
            value={form.dashboardPassword}
            onChange={(value) => handleChange("dashboardPassword", value)}
            required
            placeholder="Create your private password"
            type="password"
          />
          <Field
            label="Confirm Password"
            value={form.confirmDashboardPassword}
            onChange={(value) => handleChange("confirmDashboardPassword", value)}
            required
            placeholder="Repeat the password"
            type="password"
          />
        </div>

        <div className="mt-4 grid gap-4">
          <Field
            label="Tagline"
            value={form.tagline}
            onChange={(value) => handleChange("tagline", value)}
            placeholder="Luxury dining and effortless hospitality."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Promo Title"
              value={form.promoTitle}
              onChange={(value) => handleChange("promoTitle", value)}
              placeholder="Buy 1 Get 1 Free Pizza"
            />
            <Field
              label="Hours Label"
              value={form.hoursLabel}
              onChange={(value) => handleChange("hoursLabel", value)}
              placeholder="Open daily from 12:00 PM to 1:00 AM"
            />
          </div>
          <TextField
            label="Promo Text"
            value={form.promoText}
            onChange={(value) => handleChange("promoText", value)}
            placeholder="Tell guests about the special offer you want them to notice."
          />
          <Field
            label="Address"
            value={form.address}
            onChange={(value) => handleChange("address", value)}
            placeholder="Kigali Heights, Kigali"
          />
          <Field
            label="Location Hint"
            value={form.locationHint}
            onChange={(value) => handleChange("locationHint", value)}
            placeholder="Find us on the rooftop"
          />
          <FileField
            label="Hero Image"
            accept="image/*"
            helper="Choose the image guests should see first."
            onChange={setHeroImage}
          />
          <FileField
            label="Menu PDF"
            accept="application/pdf"
            helper="Add your menu file if you want a downloadable version too."
            onChange={setMenuPdf}
          />
          <TextField
            label="Google Maps Embed URL"
            value={form.mapsEmbedUrl}
            onChange={(value) => handleChange("mapsEmbedUrl", value)}
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="tf-button-primary disabled:opacity-60"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Creating..." : "Create My Restaurant"}
          </button>
          {status === "error" ? (
            <p className="text-sm text-red-300">{errorMessage}</p>
          ) : null}
        </div>
      </form>

      <div className="space-y-6">
        <div className="rounded-[32px] border border-gold-200/20 bg-gradient-to-br from-gold-200/10 via-white/5 to-transparent p-6">
          <h2 className="text-balance font-display text-4xl leading-[0.94] text-ivory">
            What happens next?
          </h2>
          <div className="mt-5 space-y-4 text-sm text-ivory/70">
            <p>Your restaurant gets its own page right away.</p>
            <p>That page becomes the experience guests open when they scan.</p>
            <p>You can then add dishes, images, and the details guests need most.</p>
            <p>After that, you can share the QR and start welcoming guests into it.</p>
          </div>
        </div>

        <div className="tf-panel p-6">
          <p className="tf-eyebrow">
            Your Restaurant
          </p>
          {result ? (
            <div className="mt-4 space-y-4 text-sm text-ivory/80">
              <p>
                <span className="font-semibold text-ivory">Restaurant:</span>{" "}
                {result.restaurant.name}
              </p>
              <p>
                <span className="font-semibold text-ivory">Guest Link:</span>{" "}
                <a className="text-gold-200 underline" href={result.pageUrl}>
                  {result.pageUrl}
                </a>
              </p>
              <p>
                <span className="font-semibold text-ivory">Restaurant Access:</span>{" "}
                <a className="text-gold-200 underline" href={result.dashboardUrl}>
                  {result.dashboardUrl}
                </a>
              </p>
              <div className="tf-card bg-black/20 p-4">
                <p className="tf-eyebrow text-gold-200/80">
                  Next
                </p>
                <div className="mt-3 space-y-2">
                  {result.nextSteps.map((step) => (
                    <p key={step} className="text-sm text-ivory/70">
                      - {step}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ivory/60">
              Once you create your restaurant, the guest link and your private access page will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text"
}: FieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="tf-input"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder
}: FieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="tf-input"
      />
    </label>
  );
}

type FileFieldProps = {
  label: string;
  accept: string;
  helper: string;
  onChange: (file: File | null) => void;
};

function FileField({ label, accept, helper, onChange }: FileFieldProps) {
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
      <p className="text-xs text-ivory/45">{helper}</p>
    </label>
  );
}
