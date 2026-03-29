import { NextResponse } from "next/server";
import { isValidAdminPassword } from "@/lib/admin";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    password?: string;
  };

  const password = String(body.password || "").trim();

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
