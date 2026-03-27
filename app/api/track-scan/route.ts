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
  const { restaurantId, slug } = await request.json();
  const supabase = getServiceSupabase();

  if (!supabase || !restaurantId || !slug) {
    return NextResponse.json({ ok: true });
  }

  await supabase.from("qr_scans").insert({
    restaurant_id: restaurantId,
    slug,
    user_agent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer")
  });

  return NextResponse.json({ ok: true });
}
