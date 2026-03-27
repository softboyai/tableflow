import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/restaurantAdmin";
import {
  getOwnerDashboardCookieName,
  hashOwnerPassword,
  verifyOwnerPassword
} from "@/lib/ownerAuth";

export async function POST(
  request: Request,
  context: { params: { slug: string } | Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const { password } = (await request.json()) as { password?: string };

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("dashboard_password_hash")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !restaurant?.dashboard_password_hash) {
    return NextResponse.json(
      { error: "Owner password is not set yet.", requiresSetup: true },
      { status: 404 }
    );
  }

  if (!password || !verifyOwnerPassword(password, restaurant.dashboard_password_hash)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  cookies().set({
    name: getOwnerDashboardCookieName(slug),
    value: restaurant.dashboard_password_hash,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  context: { params: { slug: string } | Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const supabase = getServiceSupabase();

  if (!supabase) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const { password } = (await request.json()) as { password?: string };

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("dashboard_password_hash")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !restaurant) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  if (restaurant.dashboard_password_hash) {
    return NextResponse.json(
      { error: "Owner password already exists." },
      { status: 409 }
    );
  }

  const passwordHash = hashOwnerPassword(password);

  const { error: updateError } = await supabase
    .from("restaurants")
    .update({ dashboard_password_hash: passwordHash })
    .eq("slug", slug);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  cookies().set({
    name: getOwnerDashboardCookieName(slug),
    value: passwordHash,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return NextResponse.json({ ok: true });
}
