"use client";

import { useState } from "react";

type RestaurantEvent = {
  id: string;
  title: string;
  description: string;
  startAt: string | null;
};

type RestaurantEventsManagerProps = {
  restaurantId: string;
  slug: string;
  events: RestaurantEvent[];
};

function toDatetimeInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function RestaurantEventsManager({
  restaurantId,
  slug,
  events
}: RestaurantEventsManagerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [status, setStatus] = useState("");
  const [busyEventId, setBusyEventId] = useState("");

  const addEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");

    const response = await fetch(`/api/restaurants/${slug}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        restaurantId,
        title,
        description,
        startAt
      })
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(data.error || "We couldn't save that event yet.");
      return;
    }

    window.location.reload();
  };

  const deleteEvent = async (eventId: string, eventTitle: string) => {
    const confirmed = window.confirm(
      `Remove "${eventTitle}" from your upcoming events?`
    );

    if (!confirmed) {
      return;
    }

    setBusyEventId(eventId);
    setStatus("");

    try {
      const response = await fetch(
        `/api/restaurants/${slug}/events/${eventId}?restaurantId=${encodeURIComponent(
          restaurantId
        )}`,
        {
          method: "DELETE"
        }
      );

      const data = (await response.json()) as { error?: string };

      setBusyEventId("");

      if (!response.ok) {
        setStatus(data.error || "We couldn't remove that event yet.");
        return;
      }

      window.location.reload();
    } catch {
      setBusyEventId("");
      setStatus("The request could not reach the server. Please try again.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="tf-panel p-6">
        <p className="tf-eyebrow">Events</p>
        <h2 className="mt-3 text-2xl font-semibold text-ivory">
          Add upcoming moments guests should not miss
        </h2>
        <p className="mt-2 text-sm text-ivory/65">
          Share live nights, tasting menus, brunches, and special evenings so
          guests know what is coming up.
        </p>

        <form onSubmit={addEvent} className="mt-5 space-y-4">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
              Event Title
            </span>
            <input
              value={title}
              onChange={(input) => setTitle(input.target.value)}
              placeholder="Live Jazz Night"
              className="tf-input"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
              Description
            </span>
            <textarea
              value={description}
              onChange={(input) => setDescription(input.target.value)}
              rows={3}
              placeholder="A relaxed evening with live music and signature cocktails."
              className="tf-input"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
              Date And Time
            </span>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(input) => setStartAt(input.target.value)}
              className="tf-input"
            />
          </label>

          <button type="submit" className="tf-button-primary">
            Save Event
          </button>

          {status ? <p className="text-sm text-red-300">{status}</p> : null}
        </form>
      </div>

      <div className="tf-panel p-6">
        <p className="tf-eyebrow">Coming Up</p>
        <div className="mt-4 space-y-3">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-ivory">
                      {event.title}
                    </p>
                    <p className="text-xs text-ivory/55">
                      {event.startAt
                        ? new Date(event.startAt).toLocaleString()
                        : "Time not set yet"}
                    </p>
                    {event.description ? (
                      <p className="text-sm text-ivory/65">{event.description}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteEvent(event.id, event.title)}
                    disabled={busyEventId === event.id}
                    className="rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-400/20 disabled:opacity-60"
                  >
                    {busyEventId === event.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-5">
              <p className="text-sm text-ivory/60">
                No events yet. Add one to make the guest page feel active and
                alive.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
