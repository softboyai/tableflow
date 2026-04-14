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
  const { restaurantId, actionType } = await request.json();
  const supabase = getServiceSupabase();

  if (
    !supabase ||
    !restaurantId ||
    !["whatsapp_click", "waiter_call"].includes(actionType)
  ) {
    return NextResponse.json({ ok: true });
  }

  await supabase.from("restaurant_action_clicks").insert({
    restaurant_id: restaurantId,
    action_type: actionType
  });

  return NextResponse.json({ ok: true });
}
