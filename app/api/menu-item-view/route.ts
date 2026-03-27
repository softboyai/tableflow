import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function POST(request: Request) {
  const { restaurantId, itemId } = await request.json();
  const supabase = getServiceSupabase();

  if (!supabase || !restaurantId || !itemId) {
    return NextResponse.json({ ok: true });
  }

  await supabase.from("menu_item_views").insert({
    restaurant_id: restaurantId,
    menu_item_id: itemId
  });

  return NextResponse.json({ ok: true });
}
