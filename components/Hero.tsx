import Image from "next/image";
import Container from "./Container";
import TrackedLink from "./TrackedLink";

type HeroProps = {
  restaurantId: string;
  restaurantName: string;
  tagline: string;
  heroImageUrl: string;
  whatsappHref: string;
  callHref: string;
};

export default function Hero({
  restaurantId,
  restaurantName,
  tagline,
  heroImageUrl,
  whatsappHref,
  callHref
}: HeroProps) {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <Image
        src={heroImageUrl}
        alt="Elegant plated dinner"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-ink" />
      <div className="absolute inset-0 bg-hero-glow" />

      <Container className="relative z-10 flex min-h-screen flex-col justify-end pb-12 pt-20 sm:pb-16 sm:pt-24">
        <div className="max-w-2xl space-y-5 animate-fadeUp">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-200">
              Scan. Browse. Order.
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory/70">
              Menu and offer in one place
            </span>
          </div>
          <h1 className="text-balance font-display text-5xl leading-[0.92] text-ivory sm:text-6xl md:text-7xl">
            {restaurantName}
          </h1>
          <p className="max-w-xl text-base leading-7 text-ivory/80 sm:text-lg">
            {tagline}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#menu" className="tf-button-primary">
              View Menu
            </a>
            <a
              href="#promotion"
              className="tf-button-secondary border-white/20 text-ivory hover:border-gold-100"
            >
              See Today&apos;s Offer
            </a>
            <TrackedLink
              restaurantId={restaurantId}
              actionType="whatsapp_click"
              href={whatsappHref}
              className="tf-button-secondary border-gold-200/60 text-gold-100 hover:border-gold-100"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Us
            </TrackedLink>
            <TrackedLink
              restaurantId={restaurantId}
              actionType="waiter_call"
              href={callHref}
              className="tf-button-secondary border-white/20 text-ivory hover:border-gold-100"
            >
              Call Waiter
            </TrackedLink>
          </div>
          <div className="grid gap-3 text-sm text-ivory/70 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              Browse the menu in seconds
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              Save today&apos;s offer before you order
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              Message or call the team right away
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
