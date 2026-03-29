import { NextResponse } from "next/server";
import {
  getAdminOverviewData,
  getAdminPasswordFromRequest,
  isValidAdminPassword
} from "@/lib/admin";

export async function GET(request: Request) {
  const password = getAdminPasswordFromRequest(request);

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getAdminOverviewData();
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load admin overview.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
