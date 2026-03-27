import { Calendar } from "lucide-react";
import Container from "./Container";
import SectionHeader from "./SectionHeader";
import { RestaurantEvent } from "@/types/restaurant";

type EventsProps = {
  events: RestaurantEvent[];
};

export default function Events({ events }: EventsProps) {
  return (
    <section className="py-16">
      <Container className="space-y-8">
        <SectionHeader
          eyebrow="Events"
          title="Evenings curated for you"
          subtitle="Live music, DJs, and unforgettable nights."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <article key={event.id} className="tf-panel p-5 transition hover:-translate-y-1 hover:border-gold-200/60">
              <div className="flex items-center gap-3 text-gold-200">
                <Calendar size={18} />
                <span className="text-xs uppercase tracking-[0.3em]">
                  {event.timeLabel}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ivory">
                {event.title}
              </h3>
              <p className="mt-2 text-sm text-ivory/70">
                {event.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
