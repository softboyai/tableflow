import { NextResponse } from "next/server";
import {
  getAdminPasswordFromRequest,
  getRestaurantContactsCsv,
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
    const csv = await getRestaurantContactsCsv(slug);

    if (!csv) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"${slug}-contacts.csv\"`
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to export contacts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
