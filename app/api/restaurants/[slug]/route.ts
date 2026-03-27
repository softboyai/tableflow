import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  buildUniqueSlug,
  getServiceSupabase,
  getText,
  normalizePhone,
  toBaseSlug,
  uploadFileIfPresent
} from "@/lib/restaurantAdmin";
import { getOwnerDashboardCookieName } from "@/lib/ownerAuth";

export async function PATCH(
  request: Request,
  context: { params: { slug: string } | Promise<{ slug: string }> }
) {
  const { slug: routeSlug } = await context.params;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const { data: restaurant, error: lookupError } = await supabase
    .from("restaurants")
    .select("id, slug, hero_image_url, menu_pdf_url, dashboard_password_hash")
    .eq("slug", routeSlug)
    .maybeSingle();

  if (lookupError || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const ownerCookie = cookies().get(getOwnerDashboardCookieName(routeSlug))?.value;

  if (!restaurant.dashboard_password_hash || ownerCookie !== restaurant.dashboard_password_hash) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const name = getText(formData, "name");

  if (!name) {
    return NextResponse.json(
      { error: "Restaurant name is required." },
      { status: 400 }
    );
  }

  const slug = await buildUniqueSlug(
    supabase,
    toBaseSlug(formData),
    restaurant.id
  );

  let heroImageUrl = restaurant.hero_image_url as string | null;
  let menuPdfUrl = restaurant.menu_pdf_url as string | null;

  try {
    const uploadedHero = await uploadFileIfPresent(
      supabase,
      slug,
      formData.get("heroImage"),
      "hero"
    );
    const uploadedMenuPdf = await uploadFileIfPresent(
      supabase,
      slug,
      formData.get("menuPdf"),
      "menu"
    );

    if (uploadedHero) {
      heroImageUrl = uploadedHero;
    }

    if (uploadedMenuPdf) {
      menuPdfUrl = uploadedMenuPdf;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload files.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const updatePayload = {
    name,
    slug,
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
    maps_embed_url: getText(formData, "mapsEmbedUrl") || null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("restaurants")
    .update(updatePayload)
    .eq("id", restaurant.id)
    .select("id, name, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    restaurant: data,
    pageUrl: `/r/${data.slug}`,
    dashboardUrl: `/dashboard/${data.slug}`
  });
}
