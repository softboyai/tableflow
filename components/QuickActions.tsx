import {
  BadgePercent,
  Crown,
  MapPin,
  MessageCircle,
  UtensilsCrossed
} from "lucide-react";
import Container from "./Container";
import SectionHeader from "./SectionHeader";

type QuickActionsProps = {
  whatsappHref: string;
  callHref: string;
};

export default function QuickActions({
  whatsappHref,
  callHref
}: QuickActionsProps) {
  const actions = [
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
      description: "Ask a question right away.",
      icon: MessageCircle,
      href: whatsappHref,
      external: true
    },
    {
      title: "Stay In Touch",
      description: "Leave your details for news and offers.",
      icon: Crown,
      href: "#join-club"
    },
    {
      title: "Call Waiter",
      description: "Get help from the team quickly.",
      icon: MessageCircle,
      href: callHref
    }
  ];

  return (
    <section className="py-16">
      <Container className="space-y-10">
        <SectionHeader
          eyebrow="At Your Table"
          title="Everything you may need in one place"
          subtitle="A simple, smooth way to move through the experience."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.title}
                href={action.href}
                target={action.external ? "_blank" : undefined}
                rel={action.external ? "noreferrer" : undefined}
                className="tf-panel group p-5 transition hover:-translate-y-1 hover:border-gold-200/60 hover:bg-white/10"
              >
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
              </a>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
