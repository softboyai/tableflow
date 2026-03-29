import { createClient } from "@supabase/supabase-js";

type RestaurantRow = {
  id: string;
  name: string;
  slug: string;
  promo_title: string | null;
  promo_text: string | null;
  created_at: string;
};

type ScanRow = {
  restaurant_id: string;
  scanned_at: string;
};

type LeadRow = {
  id: string;
  restaurant_id: string;
  name: string;
  phone: string;
  created_at: string;
};

type PromoClaimRow = {
  restaurant_id: string;
  created_at: string;
};

type MenuItemViewRow = {
  restaurant_id: string;
  viewed_at: string;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  start_at: string | null;
};

type MenuItemRow = {
  id: string;
  name: string;
  price: number | null;
  currency: string | null;
  is_available: boolean | null;
  is_featured: boolean | null;
};

type NoteRow = {
  notes: string | null;
  updated_at: string;
};

export type AdminOverviewRow = {
  id: string;
  name: string;
  slug: string;
  joinedAt: string;
  totalScans: number;
  scansThisWeek: number;
  contactsAllTime: number;
  contactsThisWeek: number;
  lastActivity: string | null;
  isActive: boolean;
};

export type AdminOverviewData = {
  stats: {
    totalRestaurants: number;
    totalScansThisMonth: number;
    totalContactsThisMonth: number;
    zeroActivityRestaurants: number;
  };
  restaurants: AdminOverviewRow[];
};

export type AdminRestaurantDetailData = {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    promoTitle: string | null;
    promoText: string | null;
    publicUrl: string;
  };
  stats: {
    totalScans: number;
    totalContacts: number;
    totalOfferViews: number;
    totalMenuViews: number;
  };
  contacts: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    createdAt: string;
  }[];
  dailyActivity: {
    date: string;
    scans: number;
    contacts: number;
    offerViews: number;
  }[];
  menuItems: {
    id: string;
    name: string;
    price: number | null;
    currency: string | null;
    isAvailable: boolean;
    isFeatured: boolean;
  }[];
  events: {
    id: string;
    title: string;
    description: string;
    startAt: string | null;
  }[];
  notes: string;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateKey(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

function countRowsSince<T extends { restaurant_id: string }>(
  rows: T[],
  restaurantId: string,
  getDate: (row: T) => string,
  since: Date
) {
  const sinceTime = since.getTime();
  return rows.reduce((count, row) => {
    if (row.restaurant_id !== restaurantId) {
      return count;
    }

    return new Date(getDate(row)).getTime() >= sinceTime ? count + 1 : count;
  }, 0);
}

function maxDateForRestaurant<T extends { restaurant_id: string }>(
  rows: T[],
  restaurantId: string,
  getDate: (row: T) => string
) {
  let latest: string | null = null;

  for (const row of rows) {
    if (row.restaurant_id !== restaurantId) {
      continue;
    }

    const current = getDate(row);

    if (!latest || new Date(current).getTime() > new Date(latest).getTime()) {
      latest = current;
    }
  }

  return latest;
}

function formatCsvCell(value: string | null | undefined) {
  const safe = String(value ?? "");
  return `"${safe.replace(/"/g, '""')}"`;
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";
}

export function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false }
  });
}

export function isValidAdminPassword(password: string) {
  const expected = getAdminPassword();
  return Boolean(expected) && password === expected;
}

export function getAdminPasswordFromRequest(request: Request) {
  const headerValue = request.headers.get("x-admin-password")?.trim();
  const urlValue = new URL(request.url).searchParams.get("password")?.trim();
  return headerValue || urlValue || "";
}

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const supabase = getAdminSupabase();

  if (!supabase) {
    throw new Error("Admin Supabase connection is not configured.");
  }

  const [restaurantsResponse, scansResponse, contactsResponse] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, name, slug, promo_title, promo_text, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("qr_scans").select("restaurant_id, scanned_at"),
    supabase.from("customer_leads").select("id, restaurant_id, name, phone, created_at")
  ]);

  if (restaurantsResponse.error) {
    throw new Error(restaurantsResponse.error.message);
  }

  if (scansResponse.error) {
    throw new Error(scansResponse.error.message);
  }

  if (contactsResponse.error) {
    throw new Error(contactsResponse.error.message);
  }

  const restaurants = (restaurantsResponse.data || []) as RestaurantRow[];
  const scans = (scansResponse.data || []) as ScanRow[];
  const contacts = (contactsResponse.data || []) as LeadRow[];

  const now = new Date();
  const sevenDaysAgo = startOfDay(addDays(now, -7));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const rows: AdminOverviewRow[] = restaurants.map((restaurant) => {
    const totalScans = scans.filter(
      (scan) => scan.restaurant_id === restaurant.id
    ).length;
    const scansThisWeek = countRowsSince(
      scans,
      restaurant.id,
      (scan) => scan.scanned_at,
      sevenDaysAgo
    );
    const contactsAllTime = contacts.filter(
      (contact) => contact.restaurant_id === restaurant.id
    ).length;
    const contactsThisWeek = countRowsSince(
      contacts,
      restaurant.id,
      (contact) => contact.created_at,
      sevenDaysAgo
    );
    const lastActivity = maxDateForRestaurant(
      scans,
      restaurant.id,
      (scan) => scan.scanned_at
    );

    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      joinedAt: restaurant.created_at,
      totalScans,
      scansThisWeek,
      contactsAllTime,
      contactsThisWeek,
      lastActivity,
      isActive: scansThisWeek > 0
    };
  });

  rows.sort((a, b) => {
    if (!a.lastActivity && !b.lastActivity) {
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
    }

    if (!a.lastActivity) {
      return 1;
    }

    if (!b.lastActivity) {
      return -1;
    }

    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });

  return {
    stats: {
      totalRestaurants: restaurants.length,
      totalScansThisMonth: scans.filter(
        (scan) => new Date(scan.scanned_at).getTime() >= monthStart.getTime()
      ).length,
      totalContactsThisMonth: contacts.filter(
        (contact) => new Date(contact.created_at).getTime() >= monthStart.getTime()
      ).length,
      zeroActivityRestaurants: rows.filter((row) => !row.isActive).length
    },
    restaurants: rows
  };
}

export async function getAdminRestaurantDetailData(
  slug: string
): Promise<AdminRestaurantDetailData | null> {
  const supabase = getAdminSupabase();

  if (!supabase) {
    throw new Error("Admin Supabase connection is not configured.");
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name, slug, promo_title, promo_text, created_at")
    .eq("slug", slug)
    .maybeSingle<RestaurantRow>();

  if (restaurantError) {
    throw new Error(restaurantError.message);
  }

  if (!restaurant) {
    return null;
  }

  const [
    scansResponse,
    contactsResponse,
    offerViewsResponse,
    menuViewsResponse,
    menuItemsResponse,
    eventsResponse,
    noteResponse
  ] = await Promise.all([
    supabase
      .from("qr_scans")
      .select("restaurant_id, scanned_at")
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("customer_leads")
      .select("id, restaurant_id, name, phone, created_at")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("promo_claims")
      .select("restaurant_id, created_at")
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("menu_item_views")
      .select("restaurant_id, viewed_at")
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("menu_items")
      .select("id, name, price, currency, is_available, is_featured")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("events")
      .select("id, title, description, start_at")
      .eq("restaurant_id", restaurant.id)
      .order("start_at", { ascending: true }),
    supabase
      .from("admin_restaurant_notes")
      .select("notes, updated_at")
      .eq("restaurant_id", restaurant.id)
      .maybeSingle<NoteRow>()
  ]);

  if (scansResponse.error) {
    throw new Error(scansResponse.error.message);
  }

  if (contactsResponse.error) {
    throw new Error(contactsResponse.error.message);
  }

  if (offerViewsResponse.error) {
    throw new Error(offerViewsResponse.error.message);
  }

  if (menuViewsResponse.error) {
    throw new Error(menuViewsResponse.error.message);
  }

  if (menuItemsResponse.error) {
    throw new Error(menuItemsResponse.error.message);
  }

  if (eventsResponse.error) {
    throw new Error(eventsResponse.error.message);
  }

  if (
    noteResponse.error &&
    !noteResponse.error.message.toLowerCase().includes("admin_restaurant_notes")
  ) {
    throw new Error(noteResponse.error.message);
  }

  const scans = (scansResponse.data || []) as ScanRow[];
  const contacts = (contactsResponse.data || []) as LeadRow[];
  const offerViews = (offerViewsResponse.data || []) as PromoClaimRow[];
  const menuViews = (menuViewsResponse.data || []) as MenuItemViewRow[];
  const menuItems = (menuItemsResponse.data || []) as MenuItemRow[];
  const events = (eventsResponse.data || []) as EventRow[];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const today = startOfDay(new Date());
  const dailyActivity = Array.from({ length: 30 }, (_, index) => {
    const day = addDays(today, -index);
    const key = dateKey(day);

    return {
      date: key,
      scans: scans.filter((scan) => dateKey(scan.scanned_at) === key).length,
      contacts: contacts.filter((contact) => dateKey(contact.created_at) === key).length,
      offerViews: offerViews.filter((view) => dateKey(view.created_at) === key).length
    };
  });

  return {
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      createdAt: restaurant.created_at,
      promoTitle: restaurant.promo_title,
      promoText: restaurant.promo_text,
      publicUrl: appUrl
        ? `${appUrl.replace(/\/$/, "")}/r/${restaurant.slug}`
        : `/r/${restaurant.slug}`
    },
    stats: {
      totalScans: scans.length,
      totalContacts: contacts.length,
      totalOfferViews: offerViews.length,
      totalMenuViews: menuViews.length
    },
    contacts: contacts.map((contact) => ({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      email: null,
      createdAt: contact.created_at
    })),
    dailyActivity,
    menuItems: menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      currency: item.currency || "RWF",
      isAvailable: Boolean(item.is_available),
      isFeatured: Boolean(item.is_featured)
    })),
    events: events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description || "",
      startAt: event.start_at
    })),
    notes: noteResponse.data?.notes || ""
  };
}

export async function saveAdminRestaurantNotes(slug: string, notes: string) {
  const supabase = getAdminSupabase();

  if (!supabase) {
    throw new Error("Admin Supabase connection is not configured.");
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle<{ id: string }>();

  if (restaurantError) {
    throw new Error(restaurantError.message);
  }

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const { error } = await supabase.from("admin_restaurant_notes").upsert(
    {
      restaurant_id: restaurant.id,
      notes,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "restaurant_id"
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function getRestaurantContactsCsv(slug: string) {
  const detail = await getAdminRestaurantDetailData(slug);

  if (!detail) {
    return null;
  }

  const header = ["Name", "WhatsApp / Phone number", "Email", "Date submitted"];
  const rows = detail.contacts.map((contact) =>
    [
      formatCsvCell(contact.name),
      formatCsvCell(contact.phone),
      formatCsvCell(contact.email || ""),
      formatCsvCell(contact.createdAt)
    ].join(",")
  );

  return [header.join(","), ...rows].join("\n");
}
