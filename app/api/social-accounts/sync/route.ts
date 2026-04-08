import { NextResponse } from "next/server";
import { syncAllAnalytics } from "@/lib/analytics";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAllAnalytics();
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/accounts?synced=${result.created}`, request.url), 303);
  }

  return NextResponse.json(result);
}
