import { createClient } from "@supabase/supabase-js";
import { demoRestaurantData } from "@/lib/data/demoRestaurant";
import {
  Restaurant,
  RestaurantEvent,
  RestaurantMenuCategory,
  RestaurantGalleryItem,
  RestaurantMenuItem,
  RestaurantPageData
} from "@/types/restaurant";

type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  whatsapp_number: string | null;
  phone_number: string | null;
  promo_text: string | null;
  promo_title: string | null;
  hero_image_url: string | null;
  menu_pdf_url: string | null;
  maps_embed_url: string | null;
  address: string | null;
  location_hint: string | null;
  hours_label: string | null;
};

type MenuItemRow = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  tags: string[] | null;
  is_available: boolean | null;
  is_featured: boolean | null;
  sort_order: number | null;
  menu_categories?: { name: string | null }[] | null;
};

type MenuCategoryRow = {
  id: string;
  name: string;
  sort_order: number | null;
};

type GalleryRow = {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number | null;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  start_at: string | null;
};

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false }
  });
}

function formatEventTimeLabel(dateValue: string | null, fallbackTitle: string) {
  if (!dateValue) {
    return fallbackTitle;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return fallbackTitle;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function mapRestaurant(row: RestaurantRow): Restaurant {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline || "Modern hospitality, elegantly delivered.",
    whatsappNumber: row.whatsapp_number || "250787878745",
    phoneNumber: row.phone_number || row.whatsapp_number || "250787878745",
    promoTitle: row.promo_title || "Today's Signature Offer",
    promoText: row.promo_text || "Ask your server for today's curated special.",
    heroImageUrl:
      row.hero_image_url || demoRestaurantData.restaurant.heroImageUrl,
    menuPdfUrl: row.menu_pdf_url,
    mapsEmbedUrl:
      row.maps_embed_url || demoRestaurantData.restaurant.mapsEmbedUrl,
    address: row.address || "Visit our venue",
    locationHint:
      row.location_hint || "Find us in the heart of the city",
    hoursLabel: row.hours_label || "Open daily"
  };
}

function mapMenuItem(row: MenuItemRow): RestaurantMenuItem {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    categoryId: row.category_id,
    categoryName: row.menu_categories?.[0]?.name || null,
    name: row.name,
    description: row.description || "House favorite.",
    price: row.price,
    currency: row.currency || "RWF",
    imageUrl: row.image_url || null,
    tags: row.tags || [],
    isAvailable: Boolean(row.is_available),
    isFeatured: Boolean(row.is_featured),
    sortOrder: row.sort_order || 0
  };
}

function mapMenuCategory(row: MenuCategoryRow): RestaurantMenuCategory {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order || 0
  };
}

function mapGalleryItem(row: GalleryRow): RestaurantGalleryItem {
  return {
    id: row.id,
    imageUrl: row.image_url,
    altText: row.alt_text || "Restaurant gallery image",
    sortOrder: row.sort_order || 0
  };
}

function mapEvent(row: EventRow): RestaurantEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "An exclusive experience awaits.",
    timeLabel: formatEventTimeLabel(row.start_at, row.title)
  };
}

async function fetchRestaurantFromSupabase(
  slug: string
): Promise<RestaurantPageData | null> {
  const supabase = getServerSupabase();

  if (!supabase) {
    return null;
  }

  const { data: restaurantRow, error: restaurantError } = await supabase
    .from("restaurants")
    .select(
      "id, name, slug, tagline, whatsapp_number, phone_number, promo_text, promo_title, hero_image_url, menu_pdf_url, maps_embed_url, address, location_hint, hours_label"
    )
    .eq("slug", slug)
    .single<RestaurantRow>();

  if (restaurantError || !restaurantRow) {
    return null;
  }

  const [menuResponse, categoriesResponse, galleryResponse, eventsResponse] = await Promise.all([
    supabase
      .from("menu_items")
      .select(
        "id, restaurant_id, category_id, name, description, price, currency, image_url, tags, is_available, is_featured, sort_order, menu_categories(name)"
      )
      .eq("restaurant_id", restaurantRow.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_categories")
      .select("id, name, sort_order")
      .eq("restaurant_id", restaurantRow.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("restaurant_gallery")
      .select("id, image_url, alt_text, sort_order")
      .eq("restaurant_id", restaurantRow.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("events")
      .select("id, title, description, start_at")
      .eq("restaurant_id", restaurantRow.id)
      .order("start_at", { ascending: true })
  ]);

  const menuItems = (menuResponse.data || []).map((item) =>
    mapMenuItem(item as unknown as MenuItemRow)
  );
  const menuCategories = (categoriesResponse.data || []).map((item) =>
    mapMenuCategory(item as MenuCategoryRow)
  );
  const gallery = (galleryResponse.data || []).map((item) =>
    mapGalleryItem(item as GalleryRow)
  );
  const events = (eventsResponse.data || []).map((item) =>
    mapEvent(item as EventRow)
  );

  return {
    restaurant: mapRestaurant(restaurantRow),
    menuCategories,
    signatureDishes: menuItems
      .filter((item) => item.isFeatured && item.isAvailable)
      .slice(0, 6),
    menuItems,
    gallery,
    events
  };
}

export async function getRestaurantPageData(
  slug: string
): Promise<RestaurantPageData | null> {
  const fromSupabase = await fetchRestaurantFromSupabase(slug);

  if (fromSupabase) {
    return fromSupabase;
  }

  if (slug === demoRestaurantData.restaurant.slug) {
    return demoRestaurantData;
  }

  return null;
}

export function getDemoRestaurantSlug() {
  return demoRestaurantData.restaurant.slug;
}

export async function listLiveRestaurants() {
  const supabase = getServerSupabase();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "id, name, slug, tagline, whatsapp_number, phone_number, promo_text, promo_title, hero_image_url, menu_pdf_url, maps_embed_url, address, location_hint, hours_label"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapRestaurant(row as RestaurantRow));
}
