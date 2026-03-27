import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  getDashboardAccessState,
  getRestaurantDashboardData
} from "@/lib/dashboard";
import { getOwnerDashboardCookieName } from "@/lib/ownerAuth";

export async function GET(
  request: Request,
  context: { params: { slug: string } | Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const ownerCookie =
    request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${getOwnerDashboardCookieName(slug)}=`))
      ?.split("=")
      .slice(1)
      .join("=") || "";

  const runtime = {
    hasSupabaseUrl: Boolean(url),
    hasServiceRoleKey: Boolean(serviceKey),
    serviceRoleKeyPrefix: serviceKey ? serviceKey.slice(0, 12) : null,
    supabaseHost: url ? new URL(url).host : null,
    hasOwnerCookie: Boolean(ownerCookie)
  };

  let directLookup: Record<string, unknown> = {
    attempted: false
  };

  if (url && serviceKey) {
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false }
    });

    const { data, error } = await supabase
      .from("restaurants")
      .select("id, name, slug, is_active, dashboard_password_hash")
      .eq("slug", slug)
      .maybeSingle();

    directLookup = {
      attempted: true,
      foundRestaurant: Boolean(data),
      error: error?.message || null,
      restaurant: data
        ? {
            id: data.id,
            name: data.name,
            slug: data.slug,
            isActive: data.is_active,
            hasPassword: Boolean(data.dashboard_password_hash)
          }
        : null
    };
  }

  const access = await getDashboardAccessState(slug, ownerCookie || undefined);
  const dashboardData = await getRestaurantDashboardData(slug);

  return NextResponse.json({
    slug,
    runtime,
    directLookup,
    accessState: access
      ? {
          restaurantName: access.restaurantName,
          requiresSetup: access.requiresSetup,
          isAuthorized: access.isAuthorized,
          cookieName: access.cookieName
        }
      : null,
    dashboardData: {
      found: Boolean(dashboardData),
      restaurantName: dashboardData?.restaurant.name || null,
      categoryCount: dashboardData?.categories.length || 0,
      menuItemCount: dashboardData?.menuItems.length || 0,
      eventCount: dashboardData?.events.length || 0
    }
  });
}
