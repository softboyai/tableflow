import Image from "next/image";
import Container from "./Container";
import SectionHeader from "./SectionHeader";
import { RestaurantMenuItem } from "@/types/restaurant";

type SignatureDishesProps = {
  dishes: RestaurantMenuItem[];
};

export default function SignatureDishes({ dishes }: SignatureDishesProps) {
  return (
    <section className="py-16">
      <Container className="space-y-8">
        <SectionHeader
          eyebrow="Signature Dishes"
          title="Handcrafted culinary icons"
          subtitle="A glimpse into the plates that define the house."
        />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {dishes.map((dish) => (
            <article
              key={dish.id}
              className="min-w-[240px] flex-1 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-luxury-soft transition hover:-translate-y-1 hover:border-gold-200/50"
            >
              <div className="relative h-40 overflow-hidden rounded-2xl">
                {dish.imageUrl ? (
                  <Image
                    src={dish.imageUrl}
                    alt={dish.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 70vw, 240px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center border border-white/10 bg-white/5 px-4 text-center">
                    <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ivory/55">
                      No Photo
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="text-lg font-semibold text-ivory">
                  {dish.name}
                </h3>
                <p className="text-sm text-ivory/70">{dish.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
