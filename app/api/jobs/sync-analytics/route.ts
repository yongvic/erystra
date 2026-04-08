import { NextResponse } from "next/server";
import { syncAllAnalytics } from "@/lib/analytics";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAllAnalytics();
  return NextResponse.json(result);
}
