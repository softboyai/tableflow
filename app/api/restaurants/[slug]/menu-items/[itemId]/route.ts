import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getServiceSupabase,
  getText,
  parseTagInput,
  uploadFileIfPresent
} from "@/lib/restaurantAdmin";
import { getOwnerDashboardCookieName } from "@/lib/ownerAuth";

export async function PATCH(
  request: Request,
  context: {
    params:
      | { slug: string; itemId: string }
      | Promise<{ slug: string; itemId: string }>;
  }
) {
  const { slug, itemId } = await context.params;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const contentType = request.headers.get("content-type") || "";
  let restaurantId = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      isAvailable?: boolean;
      restaurantId?: string;
    };
    restaurantId = body.restaurantId || "";

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

    const { data, error } = await supabase
      .from("menu_items")
      .update({
        is_available: Boolean(body.isAvailable)
      })
      .eq("id", itemId)
      .eq("restaurant_id", restaurant.id)
      .select("id, is_available")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  }

  const formData = await request.formData();
  restaurantId = getText(formData, "restaurantId");

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

  const { data: existingItem, error: existingItemError } = await supabase
    .from("menu_items")
    .select("id, image_url")
    .eq("id", itemId)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (existingItemError || !existingItem) {
    return NextResponse.json({ error: "Menu item not found." }, { status: 404 });
  }

  const name = getText(formData, "name");

  if (!name) {
    return NextResponse.json(
      { error: "Menu item name is required." },
      { status: 400 }
    );
  }

  const priceValue = getText(formData, "price");
  const normalizedPriceInput = priceValue
    ? priceValue.replace(/[,\s]/g, "")
    : "";
  const normalizedPrice = !normalizedPriceInput ? null : Number(normalizedPriceInput);

  if (normalizedPrice !== null && Number.isNaN(normalizedPrice)) {
    return NextResponse.json({ error: "Invalid price." }, { status: 400 });
  }

  let imageUrl = getText(formData, "imageUrl") || (existingItem.image_url as string | null);

  try {
    const uploadedImage = await uploadFileIfPresent(
      supabase,
      restaurant.id,
      formData.get("imageFile"),
      `menu-item-${itemId}`
    );

    if (uploadedImage) {
      imageUrl = uploadedImage;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload item image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("menu_items")
    .update({
      name,
      description: getText(formData, "description") || null,
      price: normalizedPrice,
      currency: getText(formData, "currency") || "RWF",
      image_url: imageUrl,
      tags: parseTagInput(getText(formData, "tags")),
      category_id: getText(formData, "categoryId") || null,
      is_featured: getText(formData, "isFeatured") === "true",
      is_available: getText(formData, "isAvailable") !== "false"
    })
    .eq("id", itemId)
    .eq("restaurant_id", restaurant.id)
    .select(
      "id, name, description, price, currency, image_url, tags, is_available, is_featured, sort_order, category_id"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}

export async function DELETE(
  _request: Request,
  context: {
    params:
      | { slug: string; itemId: string }
      | Promise<{ slug: string; itemId: string }>;
  }
) {
  const { slug, itemId } = await context.params;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const restaurantId = new URL(_request.url).searchParams.get("restaurantId") || "";

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

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", itemId)
    .eq("restaurant_id", restaurant.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
