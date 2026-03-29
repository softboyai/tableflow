import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminPassword } from "@/lib/admin";

type SignupRow = {
  id: string;
  name: string;
  phone: string;
  created_at: string;
};

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

async function fetchLeadFeed(supabase: any) {
  const leadResponse = await supabase
    .from("customer_leads")
    .select("id, name, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!leadResponse.error) {
    return leadResponse.data as SignupRow[];
  }

  const fallbackResponse = await supabase
    .from("club_signups")
    .select("id, name, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (fallbackResponse.error) {
    throw new Error(fallbackResponse.error.message);
  }

  return fallbackResponse.data as SignupRow[];
}

export async function GET(request: Request) {
  const adminPassword =
    request.headers.get("x-admin-password")?.trim() || "";
  const expectedPassword = getAdminPassword();
  const supabase = getServiceSupabase();

  if (!expectedPassword || adminPassword !== expectedPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const data = await fetchLeadFeed(supabase);
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
