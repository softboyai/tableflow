import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getServiceSupabase,
  getText,
  parseTagInput,
  uploadFileIfPresent
} from "@/lib/restaurantAdmin";
import { getOwnerDashboardCookieName } from "@/lib/ownerAuth";

export async function POST(
  request: Request,
  context: { params: { slug: string } | Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const restaurantId = getText(formData, "restaurantId");

  let { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, slug, dashboard_password_hash")
    .eq("slug", slug)
    .maybeSingle();

  if ((!restaurant || restaurantError) && restaurantId) {
    const fallbackResponse = await supabase
      .from("restaurants")
      .select("id, slug, dashboard_password_hash")
      .eq("id", restaurantId)
      .maybeSingle();

    restaurant = fallbackResponse.data;
    restaurantError = fallbackResponse.error;
  }

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const ownerCookie = cookies().get(getOwnerDashboardCookieName(slug))?.value;

  if (!restaurant.dashboard_password_hash || ownerCookie !== restaurant.dashboard_password_hash) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const name = getText(formData, "name");

  if (!name) {
    return NextResponse.json(
      { error: "Menu item name is required." },
      { status: 400 }
    );
  }

  const priceValue = getText(formData, "price");
  const currency = getText(formData, "currency") || "RWF";
  const categoryId = getText(formData, "categoryId") || null;
  const description = getText(formData, "description") || null;
  const imageUrl = getText(formData, "imageUrl") || null;
  const tags = parseTagInput(getText(formData, "tags"));
  const isFeatured = getText(formData, "isFeatured") === "true";

  const normalizedPriceInput = priceValue
    ? priceValue.replace(/[,\s]/g, "")
    : "";
  const normalizedPrice = !normalizedPriceInput ? null : Number(normalizedPriceInput);

  if (normalizedPrice !== null && Number.isNaN(normalizedPrice)) {
    return NextResponse.json({ error: "Invalid price." }, { status: 400 });
  }

  const { count } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);

  let uploadedImageUrl = imageUrl;

  try {
    const uploadedImage = await uploadFileIfPresent(
      supabase,
      restaurant.id,
      formData.get("imageFile"),
      `menu-item-${count || 0}`
    );

    if (uploadedImage) {
      uploadedImageUrl = uploadedImage;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload item image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      restaurant_id: restaurant.id,
      category_id: categoryId,
      name,
      description,
      price: normalizedPrice,
      currency,
      image_url: uploadedImageUrl,
      tags,
      is_featured: isFeatured,
      is_available: true,
      sort_order: count || 0
    })
    .select(
      "id, name, description, price, currency, image_url, tags, is_available, is_featured, sort_order, category_id"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}
