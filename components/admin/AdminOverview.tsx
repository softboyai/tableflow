"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AdminOverviewData } from "@/lib/admin";

type AdminOverviewProps = {
  password: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "No scans yet";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export default function AdminOverview({ password }: AdminOverviewProps) {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/overview", {
          headers: {
            "x-admin-password": password
          }
        });

        const payload = (await response.json()) as {
          data?: AdminOverviewData;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load admin overview.");
        }

        if (isActive) {
          setData(payload.data || null);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load admin overview."
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
  }, [password]);

  const statCards = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        label: "Total restaurants signed up",
        value: formatNumber(data.stats.totalRestaurants)
      },
      {
        label: "Total QR scans this month",
        value: formatNumber(data.stats.totalScansThisMonth)
      },
      {
        label: "Total contacts collected this month",
        value: formatNumber(data.stats.totalContactsThisMonth)
      },
      {
        label: "Restaurants with zero activity in last 7 days",
        value: formatNumber(data.stats.zeroActivityRestaurants),
        danger: data.stats.zeroActivityRestaurants > 0
      }
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-6 text-sm text-ivory/60">
        Loading founder dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[20px] border border-red-400/20 bg-red-500/5 p-6 text-sm text-red-200">
        {error || "Unable to load founder dashboard."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[18px] border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-sm leading-6 text-ivory/58">{card.label}</p>
            <p
              className={`mt-3 text-[28px] font-extrabold tracking-[-0.04em] ${
                card.danger ? "text-red-300" : "text-ivory"
              }`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <h2 className="text-xl font-bold tracking-[-0.03em] text-ivory">
            Restaurants
          </h2>
          <p className="mt-1 text-sm text-ivory/58">
            Sorted by latest activity so you can see who needs attention first.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left">
            <thead className="bg-white/[0.02] text-[12px] uppercase tracking-[0.08em] text-ivory/42">
              <tr>
                <th className="px-5 py-3 font-medium sm:px-6">Restaurant</th>
                <th className="px-5 py-3 font-medium">Date joined</th>
                <th className="px-5 py-3 font-medium">Total scans</th>
                <th className="px-5 py-3 font-medium">Scans this week</th>
                <th className="px-5 py-3 font-medium">Contacts all time</th>
                <th className="px-5 py-3 font-medium">Contacts this week</th>
                <th className="px-5 py-3 font-medium">Last activity</th>
                <th className="px-5 py-3 font-medium sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.restaurants.map((restaurant) => (
                <tr
                  key={restaurant.id}
                  className="border-t border-white/10 text-sm text-ivory/82"
                >
                  <td className="px-5 py-4 sm:px-6">
                    <Link
                      href={`/admin/restaurants/${restaurant.slug}`}
                      className="font-semibold text-ivory transition hover:text-gold-200"
                    >
                      {restaurant.name}
                    </Link>
                    <p className="mt-1 text-xs text-ivory/42">
                      /r/{restaurant.slug}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-ivory/60">
                    {formatDate(restaurant.joinedAt)}
                  </td>
                  <td className="px-5 py-4">{formatNumber(restaurant.totalScans)}</td>
                  <td className="px-5 py-4">{formatNumber(restaurant.scansThisWeek)}</td>
                  <td className="px-5 py-4">
                    {formatNumber(restaurant.contactsAllTime)}
                  </td>
                  <td className="px-5 py-4">
                    {formatNumber(restaurant.contactsThisWeek)}
                  </td>
                  <td className="px-5 py-4 text-ivory/60">
                    {formatDate(restaurant.lastActivity)}
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        restaurant.isActive
                          ? "bg-emerald-500/15 text-emerald-200"
                          : "bg-white/10 text-ivory/58"
                      }`}
                    >
                      {restaurant.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
