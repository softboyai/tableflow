import { NextResponse } from "next/server";
import {
  getAdminPasswordFromRequest,
  getAdminRestaurantDetailData,
  isValidAdminPassword
} from "@/lib/admin";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const password = getAdminPasswordFromRequest(request);

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;

  try {
    const data = await getAdminRestaurantDetailData(slug);

    if (!data) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load restaurant.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
