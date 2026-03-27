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

  const body = (await request.json()) as {
    restaurantId?: string;
    title?: string;
    description?: string;
    startAt?: string;
  };

  let { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, slug, dashboard_password_hash")
    .eq("slug", slug)
    .maybeSingle();

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

  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const startAt = String(body.startAt || "").trim();

  if (!title) {
    return NextResponse.json({ error: "Event title is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      restaurant_id: restaurant.id,
      title,
      description: description || null,
      start_at: startAt || null
    })
    .select("id, title, description, start_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}
