import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/restaurantAdmin";
import { getOwnerDashboardCookieName } from "@/lib/ownerAuth";

export async function DELETE(
  request: Request,
  context: {
    params:
      | { slug: string; eventId: string }
      | Promise<{ slug: string; eventId: string }>;
  }
) {
  const { slug, eventId } = await context.params;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const restaurantId =
    new URL(request.url).searchParams.get("restaurantId") || "";

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
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("restaurant_id", restaurant.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
