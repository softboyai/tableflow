import { createClient } from "@supabase/supabase-js";
import { getOwnerDashboardCookieName } from "@/lib/ownerAuth";

type DashboardRestaurant = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  whatsapp_number: string | null;
  phone_number: string | null;
  promo_title: string | null;
  promo_text: string | null;
  hero_image_url: string | null;
  menu_pdf_url: string | null;
  maps_embed_url: string | null;
  address: string | null;
  location_hint: string | null;
  hours_label: string | null;
};

type MetricsRow = {
  restaurant_id: string;
  name: string;
  slug: string;
  total_qr_scans: number | null;
  total_leads: number | null;
  total_promo_claims: number | null;
};

type LeadRow = {
  id: string;
  name: string;
  phone: string;
  source: string | null;
  created_at: string;
};

type TopDishRow = {
  menu_items: {
    name: string | null;
  }[] | null;
};

type MenuCategoryRow = {
  id: string;
  name: string;
  sort_order: number | null;
};

type MenuItemRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  tags: string[] | null;
  is_available: boolean | null;
  is_featured: boolean | null;
  sort_order: number | null;
  category_id: string | null;
  menu_categories: {
    name: string | null;
  }[] | null;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  start_at: string | null;
};

export type RestaurantDashboardData = {
  restaurant: DashboardRestaurant;
  metrics: {
    scans: number;
    leads: number;
    promoClaims: number;
  };
  recentLeads: LeadRow[];
  topViewedItems: string[];
  categories: {
    id: string;
    name: string;
    sortOrder: number;
  }[];
  menuItems: {
    id: string;
    name: string;
    description: string;
    price: number | null;
    currency: string | null;
    imageUrl: string | null;
    tags: string[];
    isAvailable: boolean;
    isFeatured: boolean;
    sortOrder: number;
    categoryId: string | null;
    categoryName: string | null;
  }[];
  events: {
    id: string;
    title: string;
    description: string;
    startAt: string | null;
  }[];
};

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false }
  });
}

export async function getDashboardAccessState(slug: string, cookieStoreValue?: string) {
  const supabase = getServiceSupabase();

  if (!supabase) {
    return null;
  }

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id, name, slug, dashboard_password_hash")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !restaurant) {
    return null;
  }

  return {
    restaurantName: restaurant.name as string,
    requiresSetup: !restaurant.dashboard_password_hash,
    isAuthorized:
      Boolean(cookieStoreValue) &&
      cookieStoreValue === restaurant.dashboard_password_hash,
    cookieName: getOwnerDashboardCookieName(slug)
  };
}

export async function getRestaurantDashboardData(
  slug: string
): Promise<RestaurantDashboardData | null> {
  const supabase = getServiceSupabase();

  if (!supabase) {
    return null;
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select(
      "id, name, slug, tagline, whatsapp_number, phone_number, promo_title, promo_text, hero_image_url, menu_pdf_url, maps_embed_url, address, location_hint, hours_label"
    )
    .eq("slug", slug)
    .maybeSingle<DashboardRestaurant>();

  if (restaurantError || !restaurant) {
    return null;
  }

  const [
    metricsResponse,
    leadsResponse,
    topViewedResponse,
    categoriesResponse,
    menuItemsResponse,
    eventsResponse
  ] = await Promise.all([
    supabase
      .from("restaurant_owner_metrics")
      .select(
        "restaurant_id, name, slug, total_qr_scans, total_leads, total_promo_claims"
      )
      .eq("restaurant_id", restaurant.id)
      .maybeSingle<MetricsRow>(),
    supabase
      .from("customer_leads")
      .select("id, name, phone, source, created_at")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("menu_item_views")
      .select("menu_items(name)")
      .eq("restaurant_id", restaurant.id)
      .limit(30),
    supabase
      .from("menu_categories")
      .select("id, name, sort_order")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select(
        "id, name, description, price, currency, image_url, tags, is_available, is_featured, sort_order, category_id, menu_categories(name)"
      )
      .eq("restaurant_id", restaurant.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("events")
      .select("id, title, description, start_at")
      .eq("restaurant_id", restaurant.id)
      .order("start_at", { ascending: true })
  ]);

  const metrics = metricsResponse.data;
  const recentLeads = (leadsResponse.data || []) as LeadRow[];
  const topViewedItems = Array.from(
    new Set(
      ((topViewedResponse.data || []) as TopDishRow[])
        .map((row) => row.menu_items?.[0]?.name || "")
        .filter(Boolean)
    )
  ).slice(0, 5);
  const categories = ((categoriesResponse.data || []) as MenuCategoryRow[]).map(
    (category) => ({
      id: category.id,
      name: category.name,
      sortOrder: category.sort_order || 0
    })
  );
  const menuItems = ((menuItemsResponse.data || []) as MenuItemRow[]).map(
    (item) => ({
      id: item.id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      currency: item.currency || "RWF",
      imageUrl: item.image_url,
      tags: item.tags || [],
      isAvailable: Boolean(item.is_available),
      isFeatured: Boolean(item.is_featured),
      sortOrder: item.sort_order || 0,
      categoryId: item.category_id,
      categoryName: item.menu_categories?.[0]?.name || null
    })
  );
  const events = ((eventsResponse.data || []) as EventRow[]).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description || "",
    startAt: event.start_at
  }));

  return {
    restaurant,
    metrics: {
      scans: metrics?.total_qr_scans || 0,
      leads: metrics?.total_leads || 0,
      promoClaims: metrics?.total_promo_claims || 0
    },
    recentLeads,
    topViewedItems,
    categories,
    menuItems,
    events
  };
}
