import {
  BadgePercent,
  Crown,
  MapPin,
  MessageCircle,
  PhoneCall,
  UtensilsCrossed
} from "lucide-react";
import Container from "./Container";
import SectionHeader from "./SectionHeader";
import TrackedLink from "./TrackedLink";

type QuickActionsProps = {
  restaurantId: string;
  whatsappHref: string;
  callHref: string;
};

type ActionItem = {
  title: string;
  description: string;
  icon: typeof UtensilsCrossed;
  href: string;
  external?: boolean;
  actionType?: "whatsapp_click" | "waiter_call";
};

export default function QuickActions({
  restaurantId,
  whatsappHref,
  callHref
}: QuickActionsProps) {
  const actions: ActionItem[] = [
    {
      title: "View Menu",
      description: "See what is being served today.",
      icon: UtensilsCrossed,
      href: "#menu"
    },
    {
      title: "Special Offer",
      description: "See what is being highlighted today.",
      icon: BadgePercent,
      href: "#promotion"
    },
    {
      title: "Find Us",
      description: "See where to find us.",
      icon: MapPin,
      href: "#location"
    },
    {
      title: "Message Us",
      description: "Ask about a table, dish, or reservation.",
      icon: MessageCircle,
      href: whatsappHref,
      external: true,
      actionType: "whatsapp_click"
    },
    {
      title: "Stay In Touch",
      description: "Leave your details for news and offers.",
      icon: Crown,
      href: "#join-club"
    },
    {
      title: "Call Waiter",
      description: "Reach the team quickly during service.",
      icon: PhoneCall,
      href: callHref,
      actionType: "waiter_call"
    }
  ];

  return (
    <section className="py-16">
      <Container className="space-y-10">
        <SectionHeader
          eyebrow="Quick Actions"
          title="Everything guests may need in one place"
          subtitle="Fast actions for people who want to decide, message, or call without hunting through the page."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <>
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl border border-gold-200/30 bg-gold-200/10 p-3 text-gold-200">
                    <Icon size={22} />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-200/70">
                    Open
                  </span>
                </div>
                <div className="mt-6 space-y-2">
                  <h3 className="text-lg font-semibold text-ivory">
                    {action.title}
                  </h3>
                  <p className="text-sm text-ivory/70">
                    {action.description}
                  </p>
                </div>
              </>
            );

            if (action.actionType) {
              return (
                <TrackedLink
                  key={action.title}
                  restaurantId={restaurantId}
                  actionType={action.actionType}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noreferrer" : undefined}
                  className="tf-panel group p-5 transition hover:-translate-y-1 hover:border-gold-200/60 hover:bg-white/10"
                >
                  {content}
                </TrackedLink>
              );
            }

            return (
              <a
                key={action.title}
                href={action.href}
                target={action.external ? "_blank" : undefined}
                rel={action.external ? "noreferrer" : undefined}
                className="tf-panel group p-5 transition hover:-translate-y-1 hover:border-gold-200/60 hover:bg-white/10"
              >
                {content}
              </a>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
