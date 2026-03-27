import Image from "next/image";
import Container from "./Container";

type HeroProps = {
  restaurantName: string;
  tagline: string;
  heroImageUrl: string;
  whatsappHref: string;
};

export default function Hero({
  restaurantName,
  tagline,
  heroImageUrl,
  whatsappHref
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-ink" />
      <div className="absolute inset-0 bg-hero-glow" />

      <Container className="relative z-10 flex min-h-screen flex-col justify-end pb-12 pt-20 sm:pb-16 sm:pt-24">
        <div className="max-w-xl space-y-5 animate-fadeUp">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-200">
            Welcome
          </span>
          <h1 className="text-balance font-display text-5xl leading-[0.92] text-ivory sm:text-6xl md:text-7xl">
            {restaurantName}
          </h1>
          <p className="text-base leading-7 text-ivory/80 sm:text-lg">{tagline}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#menu"
              className="tf-button-primary"
            >
              View Menu
            </a>
            <a
              href={whatsappHref}
              className="tf-button-secondary border-gold-200/60 text-gold-100 hover:border-gold-100"
              target="_blank"
              rel="noreferrer"
            >
              Message Us
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
