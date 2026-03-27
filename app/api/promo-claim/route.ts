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
  const { restaurantId, promoTitle } = await request.json();
  const supabase = getServiceSupabase();

  if (!supabase || !restaurantId) {
    return NextResponse.json({ ok: true });
  }

  const { data, error } = await supabase
    .from("promo_claims")
    .insert({
    restaurant_id: restaurantId,
    promo_text_snapshot: promoTitle || "Promotion claimed"
    })
    .select("id, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const claimCode = String(data.id).replace(/-/g, "").slice(0, 8).toUpperCase();

  return NextResponse.json({
    ok: true,
    claimCode,
    claimedAt: data.created_at
  });
}
