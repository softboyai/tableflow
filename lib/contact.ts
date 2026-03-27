export function toWhatsAppHref(rawNumber: string) {
  const digits = rawNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function toPhoneHref(rawNumber: string) {
  const digits = rawNumber.replace(/\D/g, "");
  return `tel:+${digits}`;
}
