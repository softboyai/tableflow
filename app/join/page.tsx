import Link from "next/link";
import Container from "@/components/Container";
import RestaurantJoinForm from "@/components/RestaurantJoinForm";

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-ink text-ivory">
      <section className="relative overflow-hidden py-14 sm:py-18">
        <div className="absolute inset-0 bg-hero-glow opacity-70" />
        <Container className="relative z-10 space-y-8">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex rounded-full border border-gold-200/30 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-200">
              Start Here
            </span>
            <h1 className="text-balance font-display text-5xl leading-[0.94] sm:text-6xl">
              Create the experience your guests will scan
            </h1>
            <p className="max-w-2xl text-base leading-7 text-ivory/70 sm:text-lg">
              Add your restaurant details once and get a guest experience that
              feels polished, easy to use, and ready for the table.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/"
                className="tf-button-secondary"
              >
                Back
              </Link>
            </div>
          </div>
          <RestaurantJoinForm />
        </Container>
      </section>
    </main>
  );
}
