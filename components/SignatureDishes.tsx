import Image from "next/image";
import Container from "./Container";
import SectionHeader from "./SectionHeader";
import { RestaurantMenuItem } from "@/types/restaurant";

type SignatureDishesProps = {
  dishes: RestaurantMenuItem[];
};

export default function SignatureDishes({ dishes }: SignatureDishesProps) {
  if (dishes.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <Container className="space-y-8">
        <SectionHeader
          eyebrow="Recommended"
          title="Top picks to start with"
          subtitle="A quick shortlist before guests browse the full menu."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {dishes.slice(0, 4).map((dish) => (
            <article
              key={dish.id}
              className={`overflow-hidden rounded-[28px] border p-4 transition ${
                dish.isAvailable
                  ? "border-white/10 bg-black/20 hover:border-gold-200/40"
                  : "border-red-400/20 bg-red-400/5"
              }`}
            >
              <div className="flex gap-4">
                <div className="relative flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {dish.imageUrl ? (
                    <Image
                      src={dish.imageUrl}
                      alt={dish.name}
                      fill
                      className={`object-cover ${dish.isAvailable ? "" : "opacity-50 grayscale"}`}
                      sizes="96px"
                    />
                  ) : (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/55">
                      No Photo
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-ivory">
                        {dish.name}
                      </h3>
                      <p className="mt-1 text-sm text-ivory/60">
                        {dish.description}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gold-200">
                      {typeof dish.price === "number"
                        ? `${dish.currency || "RWF"} ${dish.price.toLocaleString()}`
                        : "Ask your server"}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-gold-200/30 bg-gold-200/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gold-200">
                      Top Pick
                    </span>
                    {dish.tags.slice(0, 2).map((tag) => (
                      <span
                        key={`${dish.id}-${tag}`}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-ivory/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
