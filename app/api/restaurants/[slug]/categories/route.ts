import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/restaurantAdmin";
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

  const body = (await request.json()) as { name?: string; restaurantId?: string };

  let restaurantQuery = supabase
    .from("restaurants")
    .select("id, slug, dashboard_password_hash")
    .eq("slug", slug)
    .maybeSingle();

  let { data: restaurant, error: restaurantError } = await restaurantQuery;

  if ((!restaurant || restaurantError) && body.restaurantId) {
    const fallbackResponse = await supabase
      .from("restaurants")
      .select("id, slug, dashboard_password_hash")
      .eq("id", body.restaurantId)
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

  const { name } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Category name is required." },
      { status: 400 }
    );
  }

  const { count } = await supabase
    .from("menu_categories")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);

  const { data, error } = await supabase
    .from("menu_categories")
    .insert({
      restaurant_id: restaurant.id,
      name: name.trim(),
      sort_order: count || 0
    })
    .select("id, name, sort_order")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data });
}
