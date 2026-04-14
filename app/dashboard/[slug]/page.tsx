import type { ComponentType } from "react";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, MessageCircle, Megaphone, PhoneCall, ScanLine, Users } from "lucide-react";
import Container from "@/components/Container";
import DashboardPasswordGate from "@/components/DashboardPasswordGate";
import RestaurantContentEditor from "@/components/RestaurantContentEditor";
import RestaurantEventsManager from "@/components/RestaurantEventsManager";
import RestaurantMenuManager from "@/components/RestaurantMenuManager";
import RestaurantQrCard from "@/components/RestaurantQrCard";
import {
  getDashboardAccessState,
  getRestaurantDashboardData
} from "@/lib/dashboard";

type DashboardPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getCleanAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/$/, "");
}

function buildImproveResultsTips(data: NonNullable<Awaited<ReturnType<typeof getRestaurantDashboardData>>>) {
  const tips: string[] = [];

  if (data.metrics.scans < 20) {
    tips.push("Place the QR where guests naturally reach first so more people open the menu.");
  }

  if (data.metrics.promoClaims === 0) {
    tips.push("Make your offer more specific so guests have a reason to tap it before ordering.");
  }

  if (data.metrics.whatsappClicks === 0) {
    tips.push("Make it clear guests can message you directly on WhatsApp for quick questions or bookings.");
  }

  if (data.metrics.leads === 0) {
    tips.push("Ask for guest contact details after they see the offer or menu, and tell them what they will get in return.");
  }

  if (data.topViewedItems.length > 0) {
    tips.push(`Promote ${data.topViewedItems[0]} more strongly since guests already notice it.`);
  }

  if (tips.length === 0) {
    tips.push("Your setup is working. Keep the menu fresh and rotate the offer so repeat guests have a reason to act.");
  }

  return tips.slice(0, 4);
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params;
  const access = await getDashboardAccessState(
    slug,
    cookies().get(`tableflow_owner_${slug}`)?.value
  );

  if (!access) {
    return (
      <main className="min-h-screen bg-ink text-ivory">
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-2xl tf-panel p-8 sm:p-10">
            <p className="tf-eyebrow">Dashboard Unavailable</p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-tight sm:text-5xl">
              We could not find this restaurant in your live data yet.
            </h1>
            <div className="mt-5 space-y-3 text-sm text-ivory/70 sm:text-base">
              <p>
                The guest demo can still open from sample content, but the
                restaurant dashboard only works after that restaurant exists in
                Supabase.
              </p>
              <p>
                If you want to manage <span className="text-ivory">{slug}</span>,
                seed the restaurant first or create it from the join page.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/join" className="tf-button-primary px-5 py-3">
                Add Restaurant
              </Link>
              <Link
                href={`/r/${slug}`}
                className="tf-button-secondary px-5 py-3"
              >
                Open Guest View
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  if (!access.isAuthorized) {
    return (
      <DashboardPasswordGate
        slug={slug}
        restaurantName={access.restaurantName}
        requiresSetup={access.requiresSetup}
      />
    );
  }

  const data = await getRestaurantDashboardData(slug);

  if (!data) {
    return (
      <main className="min-h-screen bg-ink text-ivory">
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-2xl tf-panel p-8 sm:p-10">
            <p className="tf-eyebrow">We Hit A Snag</p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-tight sm:text-5xl">
              We found the restaurant, but could not load its dashboard details.
            </h1>
            <p className="mt-5 text-sm text-ivory/70 sm:text-base">
              This usually means the database is missing part of the latest
              schema. The restaurant page may still open, but dashboard data
              needs the full restaurant tables and view.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/r/${slug}`} className="tf-button-secondary px-5 py-3">
                Open Guest View
              </Link>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  const {
    restaurant,
    metrics,
    recentLeads,
    topViewedItems,
    categories,
    menuItems,
    events
  } = data;
  const requestHeaders = headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ||
    (host?.includes("localhost") ? "http" : "https");
  const appUrl = getCleanAppUrl();
  const guestUrl = appUrl
    ? `${appUrl}/r/${restaurant.slug}`
    : `${protocol}://${host}/r/${restaurant.slug}`;
  const improveResultsTips = buildImproveResultsTips(data);

  return (
    <main className="min-h-screen bg-ink text-ivory">
      <section className="border-b border-white/10 bg-white/[0.02]">
        <Container className="py-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="tf-eyebrow">Restaurant Dashboard</p>
              <h1 className="text-balance font-display text-5xl leading-[0.94] sm:text-6xl">
                {restaurant.name}
              </h1>
              <p className="max-w-2xl text-sm text-ivory/65 sm:text-base">
                {restaurant.tagline || "Track what guests notice, what they click, and who is ready to hear from you."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/r/${restaurant.slug}`}
                className="tf-button-secondary px-5 py-3"
              >
                Open Guest View
              </Link>
              <a href="#guest-experience" className="tf-button-primary px-5 py-3">
                Improve Guest Page
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-12">
        <Container className="space-y-10">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={ScanLine}
              label="Menu Views"
              value={metrics.scans}
              helper="Guests who opened your page from the table"
            />
            <MetricCard
              icon={MessageCircle}
              label="WhatsApp Clicks"
              value={metrics.whatsappClicks}
              helper="Guests who wanted to message the team"
            />
            <MetricCard
              icon={PhoneCall}
              label="Waiter Calls"
              value={metrics.waiterCalls}
              helper="Guests who tried to reach staff quickly"
            />
            <MetricCard
              icon={Users}
              label="Leads Captured"
              value={metrics.leads}
              helper="Guests who chose to stay in touch"
            />
            <MetricCard
              icon={Megaphone}
              label="Promotion Clicks"
              value={metrics.promoClaims}
              helper="Guests who saved today's offer"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="tf-panel p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="tf-eyebrow">Recent Leads</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ivory">
                    New guest contacts ready for follow-up
                  </h2>
                </div>
                <Link href="#guest-experience" className="text-sm text-gold-200 transition hover:text-gold-100">
                  Improve guest page
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ivory">
                          {lead.name}
                        </p>
                        <p className="text-xs text-ivory/55">{lead.phone}</p>
                      </div>
                      <div className="text-xs text-ivory/50">
                        {new Date(lead.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-5">
                    <p className="text-sm text-ivory/75">
                      No leads captured yet.
                    </p>
                    <p className="mt-2 text-sm text-ivory/55">
                      No leads captured yet. Add a simple reason for guests to leave their WhatsApp number, like offers, event updates, or return specials.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[32px] border border-gold-200/20 bg-gradient-to-br from-gold-200/10 via-white/5 to-transparent p-6">
                <p className="tf-eyebrow">Improve Results</p>
                <div className="mt-4 space-y-3 text-sm text-ivory/72">
                  {improveResultsTips.map((tip) => (
                    <p key={tip}>{tip}</p>
                  ))}
                </div>
              </div>

              <div className="tf-panel p-6">
                <p className="tf-eyebrow">Most Viewed Dishes</p>
                <div className="mt-4 space-y-3">
                  {topViewedItems.length > 0 ? (
                    topViewedItems.map((item, index) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm text-ivory">{item}</p>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-ivory/45">
                            {index === 0 ? "Strongest attention" : "Guest interest"}
                          </p>
                        </div>
                        <ArrowRight size={15} className="text-gold-200" />
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-5">
                      <p className="text-sm text-ivory/75">
                        No dish data yet.
                      </p>
                      <p className="mt-2 text-sm text-ivory/55">
                        Once guests start browsing, your strongest menu items will appear here so you know what deserves more promotion.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div id="guest-experience" className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <RestaurantContentEditor restaurant={restaurant} />
            <RestaurantQrCard
              restaurantName={restaurant.name}
              guestUrl={guestUrl}
            />
          </div>

          <RestaurantEventsManager
            restaurantId={restaurant.id}
            slug={restaurant.slug}
            events={events}
          />
          <RestaurantMenuManager
            restaurantId={restaurant.id}
            slug={restaurant.slug}
            categories={categories}
            menuItems={menuItems}
          />
        </Container>
      </section>
    </main>
  );
}

type MetricCardProps = {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  helper: string;
};

function MetricCard({ icon: Icon, label, value, helper }: MetricCardProps) {
  return (
    <div className="tf-panel p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-200/25 bg-gold-200/10 text-gold-200">
        <Icon size={20} />
      </div>
      <p className="mt-5 text-xs uppercase tracking-[0.3em] text-ivory/45">
        {label}
      </p>
      <p className="mt-3 font-display text-5xl text-gold-200">{value}</p>
      <p className="mt-2 text-sm text-ivory/60">{helper}</p>
    </div>
  );
}
