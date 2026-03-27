import { MessageCircle } from "lucide-react";

type FloatingWhatsAppProps = {
  whatsappHref: string;
};

export default function FloatingWhatsApp({
  whatsappHref
}: FloatingWhatsAppProps) {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gold-300 px-5 py-3 text-sm font-semibold text-ink shadow-luxury-card transition hover:translate-y-[-2px] hover:bg-gold-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={18} />
      Chat Now
    </a>
  );
}
