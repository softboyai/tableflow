import Link from "next/link";
import {
  ArrowRight,
  Crown,
  QrCode,
  TrendingUp,
  UtensilsCrossed
} from "lucide-react";
import Container from "@/components/Container";
import { getDemoRestaurantSlug } from "@/lib/restaurants";

const proofPoints = [
  "A menu guests enjoy using",
  "Offers people actually notice",
  "A simple way to keep customers close"
];

const valueCards = [
  {
    icon: QrCode,
    title: "Make a better first impression at the table",
    body: "Give guests a menu that feels clear, polished, and easy to explore from the moment they sit down."
  },
  {
    icon: UtensilsCrossed,
    title: "Put your offers in front of the right eyes",
    body: "Show specials while guests are already looking through the menu and deciding what to order."
  },
  {
    icon: TrendingUp,
    title: "Turn more visits into return visits",
    body: "Collect customer details, see what gets attention, and build stronger reasons for guests to come back."
  }
];

const processSteps = [
  {
    label: "01",
    title: "A guest opens your menu",
    body: "They see your dishes, your offer, and the details they need in one smooth place."
  },
  {
    label: "02",
    title: "They explore and respond",
    body: "They browse the menu, notice your offer, and reach out or leave their details."
  },
  {
    label: "03",
    title: "You keep the relationship going",
    body: "You create a better experience, promote what matters, and build a list of customers you can welcome back."
  }
];

export default async function Home() {
  const demoSlug = getDemoRestaurantSlug();

  return (
    <main className="overflow-hidden bg-ink text-ivory">
      <section className="relative isolate border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,213,142,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_45%)]" />
        <div className="absolute left-[-10%] top-24 h-72 w-72 rounded-full bg-gold-200/10 blur-3xl" />
        <div className="absolute right-[-5%] top-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <Container className="relative z-10 py-6">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold-200/25 bg-gold-200/10 text-gold-200">
                <QrCode size={20} />
              </div>
              <div>
                <p className="font-body text-xl font-semibold tracking-[-0.03em]">TableFlow</p>
                <p className="tf-mono text-[11px] uppercase tracking-[0.18em] text-ivory/45">
                  Made For Restaurants
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href={`/r/${demoSlug}`}
                className="tf-button-secondary px-5 py-2.5"
              >
                Try Demo
              </Link>
              <Link
                href="/join"
                className="tf-button-primary px-5 py-2.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </Container>

        <Container className="relative z-10 grid gap-8 py-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-10 lg:py-14">
          <div className="max-w-3xl space-y-6">
            <span className="tf-mono inline-flex items-center gap-2 rounded-full border border-gold-200/25 bg-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-gold-200">
              <Crown size={14} />
              Built For Restaurants That Want Guests To Return
            </span>

            <div className="space-y-4">
              <h1 className="text-balance font-display text-[3.15rem] leading-[0.9] sm:text-[4.5rem] lg:text-[5.6rem]">
                Help more guests come back
                <span className="block text-gold-200">
                  after a better visit
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-ivory/68 sm:text-lg">
                TableFlow helps restaurants present an interactive menu,
                promote offers, make it easy for guests to reach out, and
                collect customer details so more people come back.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/join"
                className="tf-button-primary gap-2 py-3.5 sm:w-auto"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
              <Link
                href={`/r/${demoSlug}`}
                className="tf-button-secondary gap-2 py-3.5 sm:w-auto"
              >
                Try Demo
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div
                  key={point}
                  className="tf-card px-4 py-3.5 text-sm text-ivory/75"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="tf-shell rounded-[32px] p-3">
                <div className="rounded-[24px] border border-white/10 bg-neutral-950/90 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="tf-mono text-[10px] uppercase tracking-[0.18em] text-gold-200/80">
                        What Guests See
                      </p>
                      <p className="mt-2 font-display text-2xl">Aurum</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                      <p className="tf-mono text-[10px] uppercase tracking-[0.16em] text-ivory/40">
                        Offer
                      </p>
                      <p className="text-sm text-gold-200">BOGO Pizza</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="tf-card px-4 py-3">
                      <p className="tf-mono text-[11px] text-ivory/50">Find something you want</p>
                      <p className="mt-1 text-sm text-ivory">burger, pizza, mocktail...</p>
                    </div>
                    <div className="flex gap-2 overflow-hidden">
                      {["Mains", "Drinks", "Dessert"].map((tab, index) => (
                        <div
                          key={tab}
                          className={`tf-mono rounded-full px-3 py-2 text-[11px] font-medium ${
                            index === 0
                              ? "bg-gold-300 text-ink"
                              : "border border-white/10 bg-white/5 text-ivory/70"
                          }`}
                        >
                          {tab}
                        </div>
                      ))}
                    </div>
                    {["Prime Ribeye", "Pepperoni Royale"].map((dish, index) => (
                      <div key={dish} className="tf-card px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-ivory">{dish}</p>
                            <p className="tf-mono mt-1 text-[11px] text-ivory/50">
                              {index === 0
                                ? "Featured tonight"
                                : "Stone-baked and guest favorite"}
                            </p>
                          </div>
                          <p className="text-sm text-gold-200">
                            RWF {index === 0 ? "34,000" : "19,000"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="tf-panel p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold-200/20 bg-gold-200/10 text-gold-200">
                      <QrCode size={18} />
                    </div>
                    <div>
                      <p className="tf-eyebrow text-gold-200/75">
                        For Your Business
                      </p>
                      <p className="mt-1 text-lg font-semibold text-ivory">
                        Turn table traffic into repeat business
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      {
                        title: "Put your offer in the right moment",
                        body: "Show your best offer while guests are deciding what to order."
                      },
                      {
                        title: "Make ordering feel easier",
                        body: "Help people browse dishes, check availability, and find what they want without confusion."
                      },
                      {
                        title: "Keep customer details in one place",
                        body: "Give guests a simple way to leave their details so you can stay connected after they visit."
                      }
                    ].map((item) => (
                      <div key={item.title} className="tf-card bg-black/20 px-4 py-4">
                        <p className="text-base font-semibold tracking-[-0.02em] text-ivory">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-ivory/60">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-gold-200/20 bg-gradient-to-br from-gold-200/10 via-white/5 to-transparent p-6">
                  <p className="tf-eyebrow">
                    What Guests Feel
                  </p>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-ivory/70">
                    <p>They can find what they want faster.</p>
                    <p>They can explore the menu and notice your offers more easily.</p>
                    <p>They leave with a better feeling about your restaurant.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container className="space-y-7">
          <div className="max-w-2xl space-y-4">
            <p className="tf-eyebrow">
              Benefits
            </p>
            <h2 className="text-balance font-display text-4xl sm:text-5xl">
              What TableFlow helps your restaurant do every day
            </h2>
            <p className="text-base leading-7 text-ivory/70">
              It helps you show an interactive menu, promote offers, improve the customer experience, and build a customer list you can grow over time.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {valueCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="tf-panel p-6 transition hover:-translate-y-1 hover:border-gold-200/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-gold-200/25 bg-gold-200/10 text-gold-200">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-6 text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.03em] text-ivory">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-ivory/65">
                    {card.body}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-14">
        <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-4">
            <p className="tf-eyebrow">
              How It Works
            </p>
            <h2 className="text-balance font-display text-4xl sm:text-5xl">
              Three simple steps
            </h2>
            <p className="text-base leading-7 text-ivory/70">
              A guest opens it, interacts with your business, and you get more value from the visit.
            </p>
            <Link
              href="/join"
              className="tf-button-primary gap-2 py-3.5"
            >
              See How It Works
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {processSteps.map((step) => (
              <div
                key={step.label}
                className="tf-panel bg-black/20 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="tf-mono flex h-12 w-12 flex-none items-center justify-center rounded-[16px] border border-gold-200/20 bg-gold-200/10 text-sm font-medium text-gold-200">
                    {step.label}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-ivory">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-ivory/65">{step.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-14">
        <Container>
          <div className="rounded-[32px] border border-gold-200/20 bg-gradient-to-br from-gold-200/10 via-white/5 to-transparent p-7 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <h2 className="text-balance font-display text-4xl sm:text-5xl">
                  Try the demo for yourself
                </h2>
                <p className="text-base leading-7 text-ivory/70">
                  See what your guests would see, explore the menu, and get a feel for how TableFlow can help your restaurant feel more welcoming and more effective.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/join"
                  className="tf-button-primary gap-2 py-3.5"
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href={`/r/${demoSlug}`}
                  className="tf-button-secondary gap-2 py-3.5"
                >
                  Try Demo
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
