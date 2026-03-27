import { createClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/slugify";

export const restaurantAssetsBucket =
  process.env.NEXT_PUBLIC_SUPABASE_ASSETS_BUCKET || "restaurant-assets";

export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false }
  });
}

export function normalizePhone(rawValue: FormDataEntryValue | null) {
  return String(rawValue || "").replace(/\D/g, "");
}

export function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function buildUniqueSlug(
  supabase: any,
  baseSlug: string,
  currentRestaurantId?: string
) {
  let candidate = baseSlug || `restaurant-${Date.now()}`;
  let suffix = 1;

  while (true) {
    const { data } = await supabase
      .from("restaurants")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (!data || data.id === currentRestaurantId) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

export async function uploadFileIfPresent(
  supabase: any,
  slug: string,
  file: FormDataEntryValue | null,
  pathPrefix: string
) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const fileExt = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : "";
  const safeExt = fileExt || (file.type === "application/pdf" ? "pdf" : "jpg");
  const filePath = `${slug}/${pathPrefix}-${Date.now()}.${safeExt}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(restaurantAssetsBucket)
    .upload(filePath, fileBuffer, {
      contentType: file.type || undefined,
      upsert: false
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(restaurantAssetsBucket)
    .getPublicUrl(filePath);
  return data.publicUrl;
}

export function parseTagInput(rawValue: string | null | undefined) {
  return String(rawValue || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function toBaseSlug(formData: FormData) {
  return slugify(getText(formData, "slug") || getText(formData, "name"));
}
