import { MessageCircle } from "lucide-react";
import TrackedLink from "./TrackedLink";

type FloatingWhatsAppProps = {
  restaurantId: string;
  whatsappHref: string;
};

export default function FloatingWhatsApp({
  restaurantId,
  whatsappHref
}: FloatingWhatsAppProps) {
  return (
    <TrackedLink
      restaurantId={restaurantId}
      actionType="whatsapp_click"
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gold-300 px-5 py-3 text-sm font-semibold text-ink shadow-luxury-card transition hover:translate-y-[-2px] hover:bg-gold-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={18} />
      Chat Now
    </TrackedLink>
  );
}
