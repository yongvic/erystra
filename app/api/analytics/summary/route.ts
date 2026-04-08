import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshots = await prisma.analyticsSnapshot.findMany({
    orderBy: { capturedAt: "desc" },
    take: 30,
    include: { socialAccount: true }
  });

  const summary = snapshots.reduce(
    (acc, item) => {
      acc.engagement += item.engagement;
      acc.reach += item.reach;
      acc.followers += item.followersCount;
      return acc;
    },
    { engagement: 0, reach: 0, followers: 0 }
  );

  return NextResponse.json(summary);
}
