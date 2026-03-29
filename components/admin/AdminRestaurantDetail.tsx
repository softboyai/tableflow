"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminQrPreview from "@/components/admin/AdminQrPreview";
import type { AdminRestaurantDetailData } from "@/lib/admin";

type AdminRestaurantDetailProps = {
  slug: string;
  password: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export default function AdminRestaurantDetail({
  slug,
  password
}: AdminRestaurantDetailProps) {
  const [data, setData] = useState<AdminRestaurantDetailData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [noteState, setNoteState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/admin/restaurants/${slug}`, {
          headers: {
            "x-admin-password": password
          }
        });

        const payload = (await response.json()) as {
          data?: AdminRestaurantDetailData;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load restaurant details.");
        }

        if (isActive && payload.data) {
          setData(payload.data);
          setNotes(payload.data.notes);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load restaurant details."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [password, slug]);

  const statCards = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      { label: "Total scans", value: formatNumber(data.stats.totalScans) },
      {
        label: "Total contacts collected",
        value: formatNumber(data.stats.totalContacts)
      },
      {
        label: "Total offer views",
        value: formatNumber(data.stats.totalOfferViews)
      },
      {
        label: "Total menu views",
        value: formatNumber(data.stats.totalMenuViews)
      }
    ];
  }, [data]);

  async function exportContacts() {
    try {
      const response = await fetch(
        `/api/admin/restaurants/${slug}/contacts/export`,
        {
          headers: {
            "x-admin-password": password
          }
        }
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error || "Unable to export contacts.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slug}-contacts.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Unable to export contacts."
      );
    }
  }

  async function saveNotes() {
    if (!data || notes === data.notes) {
      return;
    }

    setNoteState("saving");

    try {
      const response = await fetch(`/api/admin/restaurants/${slug}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({ notes })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save notes.");
      }

      setData((current) => (current ? { ...current, notes } : current));
      setNoteState("saved");
      window.setTimeout(() => setNoteState("idle"), 1800);
    } catch (saveError) {
      setNoteState("error");
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save notes."
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-6 text-sm text-ivory/60">
        Loading restaurant detail...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-[20px] border border-red-400/20 bg-red-500/5 p-6 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-6 text-sm text-ivory/60">
        Restaurant not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin"
            className="text-sm text-gold-200 transition hover:text-gold-100"
          >
            Back to all restaurants
          </Link>
          <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.04em] text-ivory">
            {data.restaurant.name}
          </h2>
          <p className="mt-1 text-sm text-ivory/58">
            Joined {formatDate(data.restaurant.createdAt)}
          </p>
        </div>
        <Link
          href={data.restaurant.publicUrl || `/r/${data.restaurant.slug}`}
          target="_blank"
          className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-ivory transition hover:border-gold-200/40 hover:bg-white/[0.04]"
        >
          Open Public Page
        </Link>
      </div>

      {error ? (
        <div className="rounded-[18px] border border-red-400/20 bg-red-500/5 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[18px] border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-sm leading-6 text-ivory/58">{card.label}</p>
            <p className="mt-3 text-[28px] font-extrabold tracking-[-0.04em] text-ivory">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-[20px] border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-xl font-bold tracking-[-0.03em] text-ivory">
              Contacts list
            </h3>
            <p className="mt-1 text-sm text-ivory/58">
              Newest contacts first so you can follow up quickly.
            </p>
          </div>
          <button
            type="button"
            onClick={exportContacts}
            className="inline-flex items-center justify-center rounded-full bg-gold-300 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-200"
          >
            Export as CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left">
            <thead className="bg-white/[0.02] text-[12px] uppercase tracking-[0.08em] text-ivory/42">
              <tr>
                <th className="px-5 py-3 font-medium sm:px-6">Name</th>
                <th className="px-5 py-3 font-medium">WhatsApp / Phone number</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium sm:px-6">Date submitted</th>
              </tr>
            </thead>
            <tbody>
              {data.contacts.map((contact) => (
                <tr key={contact.id} className="border-t border-white/10 text-sm">
                  <td className="px-5 py-4 font-medium text-ivory sm:px-6">
                    {contact.name}
                  </td>
                  <td className="px-5 py-4 text-ivory/78">{contact.phone}</td>
                  <td className="px-5 py-4 text-ivory/52">
                    {contact.email || "-"}
                  </td>
                  <td className="px-5 py-4 text-ivory/58 sm:px-6">
                    {formatDate(contact.createdAt)}
                  </td>
                </tr>
              ))}
              {data.contacts.length === 0 ? (
                <tr className="border-t border-white/10 text-sm text-ivory/50">
                  <td className="px-5 py-4 sm:px-6" colSpan={4}>
                    No contacts collected yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <h3 className="text-xl font-bold tracking-[-0.03em] text-ivory">
          Daily activity (last 30 days)
        </h3>
        <p className="mt-1 text-sm text-ivory/58">
          Date, scans, contacts, and offer views - newest first.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[560px] w-full text-left">
            <thead className="text-[12px] uppercase tracking-[0.08em] text-ivory/42">
              <tr>
                <th className="border-b border-white/10 px-4 py-3 font-medium">Date</th>
                <th className="border-b border-white/10 px-4 py-3 font-medium">Scans</th>
                <th className="border-b border-white/10 px-4 py-3 font-medium">Contacts</th>
                <th className="border-b border-white/10 px-4 py-3 font-medium">
                  Offer views
                </th>
              </tr>
            </thead>
            <tbody>
              {data.dailyActivity.map((row) => (
                <tr key={row.date} className="border-b border-white/10 last:border-b-0">
                  <td className="px-4 py-3 text-sm text-ivory/72">{formatDate(row.date)}</td>
                  <td className="px-4 py-3 text-sm text-ivory">{row.scans}</td>
                  <td className="px-4 py-3 text-sm text-ivory">{row.contacts}</td>
                  <td className="px-4 py-3 text-sm text-ivory">{row.offerViews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <h3 className="text-xl font-bold tracking-[-0.03em] text-ivory">
            Restaurant info
          </h3>
          <div className="mt-5 space-y-6">
            <div className="rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
              <p className="tf-mono text-[11px] uppercase tracking-[0.12em] text-ivory/42">
                Active offer
              </p>
              <p className="mt-2 text-base font-semibold text-ivory">
                {data.restaurant.promoTitle || "No active offer"}
              </p>
              <p className="mt-2 text-sm leading-7 text-ivory/62">
                {data.restaurant.promoText || "No offer text available right now."}
              </p>
            </div>

            <div className="rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="tf-mono text-[11px] uppercase tracking-[0.12em] text-ivory/42">
                  Public page
                </p>
                <Link
                  href={data.restaurant.publicUrl || `/r/${data.restaurant.slug}`}
                  target="_blank"
                  className="text-sm text-gold-200 transition hover:text-gold-100"
                >
                  Open
                </Link>
              </div>
              <p className="mt-2 break-all text-sm text-ivory/72">
                {data.restaurant.publicUrl || `/r/${data.restaurant.slug}`}
              </p>
            </div>

            <div className="rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
              <p className="tf-mono text-[11px] uppercase tracking-[0.12em] text-ivory/42">
                Current menu items
              </p>
              <div className="mt-3 space-y-2">
                {data.menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ivory">{item.name}</p>
                      <p className="mt-1 text-xs text-ivory/50">
                        {item.isAvailable ? "Available" : "Unavailable"}
                        {item.isFeatured ? " - Featured" : ""}
                      </p>
                    </div>
                    <p className="text-sm text-ivory/70">
                      {item.price ? `${item.currency || "RWF"} ${formatNumber(item.price)}` : "-"}
                    </p>
                  </div>
                ))}
                {data.menuItems.length === 0 ? (
                  <p className="text-sm text-ivory/50">No menu items yet.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
              <p className="tf-mono text-[11px] uppercase tracking-[0.12em] text-ivory/42">
                Active events
              </p>
              <div className="mt-3 space-y-3">
                {data.events.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-white/10 px-4 py-3">
                    <p className="text-sm font-semibold text-ivory">{event.title}</p>
                    <p className="mt-1 text-xs text-ivory/50">
                      {event.startAt ? formatDate(event.startAt) : "No date set"}
                    </p>
                    {event.description ? (
                      <p className="mt-2 text-sm leading-6 text-ivory/62">
                        {event.description}
                      </p>
                    ) : null}
                  </div>
                ))}
                {data.events.length === 0 ? (
                  <p className="text-sm text-ivory/50">No active events yet.</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <h3 className="text-xl font-bold tracking-[-0.03em] text-ivory">
              QR code
            </h3>
            <p className="mt-1 text-sm text-ivory/58">
              Ready to screenshot from your phone while meeting the owner.
            </p>
            <div className="mt-5">
              <AdminQrPreview
                url={data.restaurant.publicUrl || `/r/${data.restaurant.slug}`}
                restaurantName={data.restaurant.name}
              />
            </div>
          </section>

          <section className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold tracking-[-0.03em] text-ivory">
                  My private notes
                </h3>
                <p className="mt-1 text-sm text-ivory/58">
                  Only visible in the admin panel. Saves when you click away.
                </p>
              </div>
              <p className="text-sm text-ivory/48">
                {noteState === "saving"
                  ? "Saving..."
                  : noteState === "saved"
                    ? "Saved"
                    : noteState === "error"
                      ? "Save failed"
                      : " "}
              </p>
            </div>
            <textarea
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                if (noteState !== "idle") {
                  setNoteState("idle");
                }
              }}
              onBlur={() => {
                void saveNotes();
              }}
              rows={8}
              placeholder="Met owner Tuesday. Interested. Following up Friday."
              className="mt-4 min-h-[220px] w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-4 text-base leading-7 text-ivory placeholder:text-ivory/30 focus:border-gold-200/40 focus:outline-none"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
