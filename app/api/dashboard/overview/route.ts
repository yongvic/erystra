import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getDashboardData();
  return NextResponse.json(data);
}
