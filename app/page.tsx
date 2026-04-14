import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/Container";
import { getDemoRestaurantSlug, listLiveRestaurants } from "@/lib/restaurants";

function TableFlowMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3.5" y="3.5" width="5.5" height="5.5" rx="1.2" />
        <rect x="15" y="3.5" width="5.5" height="5.5" rx="1.2" />
        <rect x="3.5" y="15" width="5.5" height="5.5" rx="1.2" />
        <path d="M15 15H17.5V17.5H15V15Z" />
        <path d="M20.5 15V17.5" />
        <path d="M15 20.5H17.5" />
        <path d="M18.5 18.5H20.5V20.5H18.5V18.5Z" />
      </g>
    </svg>
  );
}

const stats = [
  {
    number: "200+",
    label: "customer contacts per restaurant in 30 days"
  },
  {
    number: "1 afternoon",
    label: "to set up and go live"
  },
  {
    number: "RWF 0",
    label: "to try it - no card needed"
  }
];

const benefits = [
  {
    title: "Stop losing customers you will never know",
    body: "Every guest who eats here and leaves without sharing their details is gone forever. TableFlow gives them a simple way to stay connected - right at the table, before they walk out."
  },
  {
    title: "Your offer seen by the right person at the right moment",
    body: "Your promotion appears while guests are already looking at your menu and deciding what to order. Not on Instagram three days later. Right there. At the table."
  },
  {
    title: "A customer list that grows every single day",
    body: "Every scan, every visit adds a real name and WhatsApp number to your private dashboard. A list you own. A list you can reach anytime. No platform in the way."
  }
];

const useCases = [
  {
    number: "01",
    title: "Send a WhatsApp message to everyone who visited last month",
    body: "Tell them about a new dish, a weekend special, or a private event. Directly. No algorithm deciding who sees it.",
    cardClass:
      "border-[#eadba7] bg-[#f9f1cf]",
    numberClass: "text-[#d2b24f]/55",
    label: "Bring people back"
  },
  {
    number: "02",
    title: "Fill your events before you spend on promotion",
    body: "Guests who already visited are the easiest people to bring back. Reach out with a personal message. Watch your tables fill.",
    cardClass:
      "border-[#cfe1f5] bg-[#dff0ff]",
    numberClass: "text-[#78a8d6]/50",
    label: "Fill quiet nights"
  },
  {
    number: "03",
    title: "Bring back guests you have not seen in a while",
    body: "See who has gone quiet. Send one message. A guest who came once and felt welcomed will come back if you ask them to.",
    cardClass:
      "border-[#ecd5de] bg-[#f8e5ec]",
    numberClass: "text-[#d48ca4]/50",
    label: "Reconnect guests"
  }
];

const processSteps = [
  {
    number: "01",
    title: "A guest scans the QR code on their table",
    body: "They open your restaurant's page on their phone. Menu, current offer, upcoming events - everything in one place. No app to download."
  },
  {
    number: "02",
    title: "They browse, engage, and leave their details",
    body: "They find what they want, notice your promotion, and leave their WhatsApp number before they go. Simple for them. Valuable for you."
  },
  {
    number: "03",
    title: "You build a list and stay connected forever",
    body: "Every visit adds to your dashboard. Every contact is a real guest you can now reach directly - today, next week, any time you have something to say."
  }
];

const testimonials = [
  {
    quote:
      "We had no way to tell our regulars about our new menu. Now we send one message and people show up. It actually works.",
    name: "Amani R.",
    detail: "Restaurant owner - Kigali",
    cardClass:
      "border-[#cfe1f5] bg-[#dff0ff]",
    accentClass: "border-l-[#78a8d6]"
  },
  {
    quote:
      "Guests notice the offer because they see it while they are looking at the menu. That is the difference. The timing is perfect.",
    name: "Chidi N.",
    detail: "Cafe owner - Kigali",
    cardClass:
      "border-[#f0ddd1] bg-[#f8e9df]",
    accentClass: "border-l-[#e1a57f]"
  }
];

const mockupPoints = [
  "A menu guests enjoy using",
  "Offers shown at the right moment",
  "A simple way to collect their details"
];

export default async function Home() {
  const demoSlug = getDemoRestaurantSlug();
  const liveRestaurants = await listLiveRestaurants();

  return (
    <main className="overflow-hidden bg-ink text-ivory">
      <section className="sticky top-0 z-[100] border-b border-white/10 bg-ink/80 backdrop-blur-[8px]">
        <Container className="max-w-[1080px] py-4">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold-200/25 bg-gold-200/10 text-gold-200">
                <TableFlowMark className="h-5 w-5" />
              </div>
              <div>
                <p className="font-body text-xl font-semibold tracking-[-0.03em]">
                  TableFlow
                </p>
                <p className="tf-mono text-[11px] uppercase tracking-[0.12em] text-ivory/45">
                  Made For Restaurants
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href={`/r/${demoSlug}`}
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-ivory transition hover:border-gold-200/50 hover:bg-white/[0.04]"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative isolate border-b border-white/10 py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,213,142,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_45%)]" />
        <div className="absolute left-[-10%] top-24 h-72 w-72 rounded-full bg-gold-200/10 blur-3xl" />
        <div className="absolute right-[-5%] top-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <Container className="relative z-10 max-w-[1080px]">
          <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-8">
            <div className="space-y-8">
              <div className="space-y-6 text-center lg:text-left">
                <div className="flex justify-center lg:justify-start">
                  <span className="inline-flex items-center rounded-full border border-gold-200/35 px-4 py-2 text-[12px] uppercase tracking-[0.08em] text-gold-200">
                    Built for restaurants in Rwanda
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-[720px] text-balance text-[35px] font-extrabold leading-[1.04] tracking-[-0.045em] sm:text-[45px] lg:text-[58px]">
                    Every week, guests eat here and leave.
                    <br />
                    You never hear from them again.
                  </h1>
                  <p className="mx-auto max-w-[560px] text-[17px] font-normal leading-[1.75] tracking-[-0.01em] text-ivory/68 lg:mx-0 lg:text-[18px]">
                    TableFlow gives your restaurant a page guests open at the
                    table. They browse your menu, see your offer, and leave
                    their WhatsApp number. You get a growing list of real
                    customers you can reach anytime.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                    <Link
                      href={`/r/${demoSlug}`}
                      className="tf-button-primary gap-2 px-6 py-3.5"
                    >
                      Try the Demo
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      href="/join"
                      className="tf-button-secondary px-6 py-3.5"
                    >
                      Get Started
                    </Link>
                  </div>
                  <p className="text-center text-[13px] text-ivory/45 lg:text-left">
                    Free to try <span className="inline-block h-1 w-1 rounded-full bg-ivory/30 align-middle" /> No credit card needed <span className="inline-block h-1 w-1 rounded-full bg-ivory/30 align-middle" /> Set up in one afternoon
                  </p>
                  {liveRestaurants.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2 pt-2 lg:justify-start">
                      {liveRestaurants.map((restaurant) => (
                        <Link
                          key={restaurant.id}
                          href={`/r/${restaurant.slug}`}
                          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-ivory/75 transition hover:border-gold-200/40 hover:text-ivory"
                        >
                          Open {restaurant.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(249,248,245,0.94),rgba(249,248,245,0.88))] p-3 text-ink sm:p-4">
                <p className="tf-mono px-1 pb-3 text-[11px] uppercase tracking-[0.12em] text-ink/42">
                  What your guests see at the table
                </p>
                <div className="rounded-[20px] border border-ink/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(249,248,245,0.82))] p-2 sm:p-3">
                  <div className="rounded-[18px] border border-ink/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(247,231,180,0.12))] p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="tf-mono text-[10px] uppercase tracking-[0.12em] text-gold-500/80">
                          Guest View
                        </p>
                        <p className="mt-1.5 font-display text-[21px] font-extrabold leading-none tracking-[-0.04em]">
                          Aurum
                        </p>
                      </div>
                      <div className="rounded-2xl border border-ink/10 bg-white/70 px-3 py-2 text-right backdrop-blur-sm">
                        <p className="tf-mono text-[10px] uppercase tracking-[0.12em] text-ink/40">
                          Offer
                        </p>
                        <p className="text-sm text-gold-500">BOGO Pizza</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      <div className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 backdrop-blur-sm">
                        <p className="tf-mono text-[11px] text-ink/50">
                          Find something you want
                        </p>
                        <p className="mt-1 text-sm text-ink/85">
                          burger, pizza, mocktail...
                        </p>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {["Mains", "Drinks", "Dessert"].map((tab, index) => (
                          <div
                            key={tab}
                            className={`tf-mono whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-[0.08em] ${
                              index === 0
                                ? "bg-gold-300 text-ink"
                                : "border border-ink/10 bg-white/75 text-ink/68"
                            }`}
                          >
                            {tab}
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-2.5">
                        {["Prime Ribeye", "Pepperoni Royale"].map((dish, index) => (
                          <div
                            key={dish}
                            className="rounded-2xl border border-ink/10 bg-white/72 px-4 py-3 backdrop-blur-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[14px] font-semibold tracking-[-0.02em] text-ink/88">
                                  {dish}
                                </p>
                                <p className="tf-mono mt-1 text-[10px] tracking-[0.02em] text-ink/50">
                                  {index === 0
                                    ? "Featured tonight"
                                    : "Stone-baked and guest favorite"}
                                </p>
                              </div>
                              <p className="text-sm text-gold-500">
                                RWF {index === 0 ? "34,000" : "19,000"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col items-center justify-center gap-2.5 border-t border-ink/10 pt-4 text-center text-[13px] text-ink/52 sm:flex-row sm:flex-wrap sm:gap-6">
                  {mockupPoints.map((point) => (
                    <p key={point} className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-500" />
                      {point}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-white/10 py-8 sm:py-10">
        <Container className="max-w-[1080px]">
          <div className="grid gap-8 text-center md:grid-cols-3 md:gap-0">
            {stats.map((stat, index) => (
              <div
                key={stat.number}
                className={`px-6 py-4 ${
                  index < stats.length - 1 ? "md:border-r md:border-white/10" : ""
                }`}
              >
                <p className="text-3xl font-extrabold text-ivory sm:text-[36px]">
                  {stat.number}
                </p>
                <p className="mx-auto mt-2 max-w-[220px] text-[13px] text-ivory/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="max-w-[1080px]">
          <div className="max-w-[640px]">
            <h2 className="text-[31px] font-extrabold tracking-[-0.035em] text-ivory">
              What TableFlow does for your restaurant every day
            </h2>
            <p className="mt-2 text-base text-ivory/60">
              Three things that make a real difference to your business.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-[10px] border border-white/10 bg-[linear-gradient(180deg,rgba(249,248,245,0.94),rgba(247,231,180,0.10))] p-7 text-ink transition hover:border-gold-200/25"
              >
                <h3 className="mb-[10px] text-[21px] font-bold leading-[1.15] tracking-[-0.03em] text-ink/88">
                  {benefit.title}
                </h3>
                <p className="max-w-[640px] text-[15px] leading-[1.7] text-ink/68">
                  {benefit.body}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/10 bg-[linear-gradient(180deg,rgba(249,248,245,0.95),rgba(249,248,245,0.88))] py-16 text-ink sm:py-24">
        <Container className="max-w-[1080px]">
          <div className="max-w-[640px]">
            <h2 className="text-[31px] font-extrabold tracking-[-0.035em] text-ink/90">
              What you can do once you have your customer list
            </h2>
          </div>

          <div className="mt-12 grid gap-5">
            {useCases.map((useCase) => (
              <article
                key={useCase.number}
                className={`rounded-[18px] border p-6 text-ink transition sm:p-7 ${useCase.cardClass}`}
              >
                <div className="grid gap-4 md:grid-cols-[88px_1fr] md:items-start">
                  <p
                    className={`text-[44px] font-extrabold leading-none sm:text-[52px] ${useCase.numberClass}`}
                  >
                    {useCase.number}
                  </p>
                  <div>
                    <p className="tf-mono mb-2 text-[10px] uppercase tracking-[0.12em] text-ink/46">
                      {useCase.label}
                    </p>
                    <h3 className="max-w-[560px] text-[18px] font-bold leading-[1.3] tracking-[-0.025em] text-ink/88">
                      {useCase.title}
                    </h3>
                    <p className="mt-3 max-w-[640px] text-[15px] leading-[1.7] text-ink/66">
                      {useCase.body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="max-w-[1080px]">
          <div className="max-w-[640px]">
            <h2 className="text-[31px] font-extrabold tracking-[-0.035em] text-ivory">
              How it works at your restaurant
            </h2>
          </div>

          <div className="mt-12">
            {processSteps.map((step, index) => (
              <div
                key={step.number}
                className={`${index > 0 ? "border-t border-white/10" : ""} py-8`}
              >
                <div className="grid gap-5 md:grid-cols-[100px_1fr] md:items-start">
                  <p className="text-[64px] font-extrabold leading-none text-ivory/12">
                    {step.number}
                  </p>
                  <div>
                    <h3 className="text-[21px] font-bold tracking-[-0.03em] text-ivory">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-[640px] text-[15px] leading-[1.7] text-ivory/65">
                      {step.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/10 bg-[linear-gradient(180deg,rgba(249,248,245,0.95),rgba(249,248,245,0.9))] py-16 text-ink sm:py-24">
        <Container className="max-w-[1080px]">
          <div className="max-w-[640px]">
            <h2 className="text-[31px] font-extrabold tracking-[-0.035em] text-ink/90">
              What restaurant owners are saying
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className={`rounded-[18px] border border-l-[3px] p-6 sm:p-7 ${testimonial.cardClass} ${testimonial.accentClass}`}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <p className="text-5xl leading-none text-ink/18">"</p>
                  <p className="tf-mono text-[10px] uppercase tracking-[0.12em] text-ink/42">
                    Owner feedback
                  </p>
                </div>
                <p className="max-w-[480px] text-[16px] leading-[1.75] text-ink/84">
                  {testimonial.quote}
                </p>
                <div className="mt-6 border-t border-ink/10 pt-4">
                  <p className="text-[14px] font-bold tracking-[-0.015em] text-ink/88">
                    {testimonial.name}
                  </p>
                  <p className="mt-1 text-[13px] text-ink/52">
                    {testimonial.detail}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="max-w-[1080px]">
          <div className="mx-auto max-w-[640px] rounded-[24px] border border-gold-200/20 bg-[linear-gradient(180deg,rgba(249,248,245,0.94),rgba(247,231,180,0.12))] p-8 text-center text-ink sm:p-10">
            <h2 className="text-[31px] font-extrabold tracking-[-0.035em] text-ink/90">
              Simple pricing. Less than one table a night.
            </h2>
            <p className="mt-4 text-[16px] leading-[1.7] text-ink/66">
              TableFlow is priced for independent restaurants - not enterprise
              budgets. We are onboarding our first restaurants in Rwanda now.
              Talk to us about founding partner rates.
            </p>
            <div className="mt-8">
              <Link href="/join" className="tf-button-primary gap-2 px-6 py-3.5">
                Get Early Access
                <ArrowRight size={16} />
              </Link>
              <p className="mt-4 text-[13px] text-ink/48">
                No contract. No setup fee. Cancel anytime.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-16 sm:py-24">
        <Container className="max-w-[1080px]">
          <div className="rounded-[32px] border border-gold-200/20 bg-[linear-gradient(180deg,rgba(249,248,245,0.94),rgba(247,231,180,0.10))] p-7 text-ink sm:p-10">
            <div className="mx-auto max-w-[640px] text-center">
              <h2 className="text-[31px] font-extrabold tracking-[-0.035em] text-ink/90">
                See it exactly the way your guests will
              </h2>
              <p className="mt-4 text-[16px] leading-[1.7] text-ink/66">
                Open the live demo. Browse the menu. See the offer. Experience
                TableFlow the way a guest at your table would. It takes less
                than one minute.
              </p>

              <div className="mt-8">
                <Link
                  href={`/r/${demoSlug}`}
                  className="tf-button-primary gap-2 px-6 py-3.5"
                >
                  Open the Demo
                  <ArrowRight size={16} />
                </Link>
              </div>

              <p className="mt-5 text-sm text-ink/58">
                Ready to sign up?{" "}
                <Link
                  href="/join"
                  className="text-gold-500 transition hover:text-gold-400"
                >
                  Get started here
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>

      <footer className="border-t border-white/10 py-6">
        <Container className="max-w-[1080px]">
          <p className="text-center text-[13px] text-ivory/45">
            Currently serving restaurants in Rwanda
          </p>
        </Container>
      </footer>
    </main>
  );
}
