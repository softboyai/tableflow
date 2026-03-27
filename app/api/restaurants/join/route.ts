import { NextResponse } from "next/server";
import {
  buildUniqueSlug,
  getServiceSupabase,
  getText,
  normalizePhone,
  toBaseSlug,
  uploadFileIfPresent
} from "@/lib/restaurantAdmin";
import { hashOwnerPassword } from "@/lib/ownerAuth";

export async function POST(request: Request) {
  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const name = getText(formData, "name");

  if (!name) {
    return NextResponse.json(
      { error: "Restaurant name is required." },
      { status: 400 }
    );
  }

  const dashboardPassword = getText(formData, "dashboardPassword");

  if (dashboardPassword.length < 6) {
    return NextResponse.json(
      { error: "Dashboard password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const slug = await buildUniqueSlug(supabase, toBaseSlug(formData));

  let heroImageUrl: string | null = null;
  let menuPdfUrl: string | null = null;

  try {
    heroImageUrl = await uploadFileIfPresent(
      supabase,
      slug,
      formData.get("heroImage"),
      "hero"
    );
    menuPdfUrl = await uploadFileIfPresent(
      supabase,
      slug,
      formData.get("menuPdf"),
      "menu"
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload files.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const insertPayload = {
    name,
    slug,
    dashboard_password_hash: hashOwnerPassword(dashboardPassword),
    tagline: getText(formData, "tagline") || null,
    whatsapp_number: normalizePhone(formData.get("whatsappNumber")) || null,
    phone_number:
      normalizePhone(formData.get("phoneNumber")) ||
      normalizePhone(formData.get("whatsappNumber")) ||
      null,
    promo_title: getText(formData, "promoTitle") || "Welcome Offer",
    promo_text:
      getText(formData, "promoText") ||
      "Ask the team about today's signature offer.",
    address: getText(formData, "address") || null,
    location_hint: getText(formData, "locationHint") || "Find us easily",
    hours_label: getText(formData, "hoursLabel") || "Open daily",
    hero_image_url: heroImageUrl,
    menu_pdf_url: menuPdfUrl,
    maps_embed_url: getText(formData, "mapsEmbedUrl") || null
  };

  const { data, error } = await supabase
    .from("restaurants")
    .insert(insertPayload)
    .select("id, name, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    restaurant: data,
    pageUrl: `/r/${data.slug}`,
    dashboardUrl: `/dashboard/${data.slug}`,
    nextSteps: [
      "Open your restaurant page and make sure it feels like your place.",
      "Add your dishes, photos, and the details guests ask for most.",
      "Print your QR and place it where guests naturally reach for the menu."
    ]
  });
}
