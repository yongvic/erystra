import { prisma } from "@/lib/prisma";
import { sampleAccounts, sampleMetrics, samplePosts, sampleTrend } from "@/lib/sample-data";

export async function getDashboardData() {
  try {
    const [accounts, latestSnapshots, posts] = await Promise.all([
      prisma.socialAccount.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.analyticsSnapshot.findMany({
        orderBy: { capturedAt: "desc" },
        take: 30,
        include: { socialAccount: true }
      }),
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { publications: { include: { socialAccount: true } } }
      })
    ]);

    const metrics = latestSnapshots.reduce(
      (acc, snapshot) => {
        acc.reach += snapshot.reach;
        acc.engagement += snapshot.engagement;
        acc.followers += snapshot.followersCount;
        return acc;
      },
      { reach: 0, engagement: 0, followers: 0 }
    );

    return {
      metrics: {
        engagement: metrics.engagement,
        reach: metrics.reach,
        followerGrowth: metrics.followers,
        scheduledPosts: posts.filter((post) => post.status === "SCHEDULED").length
      },
      accounts,
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        status: post.status,
        scheduledFor: post.scheduledFor?.toISOString() ?? null,
        providerLabels: post.publications.map((item) => item.socialAccount.provider)
      })),
      trend: buildTrend(latestSnapshots),
      isFallback: false
    };
  } catch (error) {
    console.error("Dashboard data fallback triggered", error);
    return {
      metrics: sampleMetrics,
      accounts: sampleAccounts,
      posts: samplePosts,
      trend: sampleTrend,
      isFallback: true
    };
  }
}

function buildTrend(
  snapshots: Array<{ capturedAt: Date; engagement: number }>
) {
  if (snapshots.length === 0) {
    return sampleTrend;
  }

  const buckets = new Map<string, number>();

  snapshots.forEach((snapshot) => {
    const key = snapshot.capturedAt.toLocaleDateString("fr-FR", { weekday: "short" });
    buckets.set(key, (buckets.get(key) ?? 0) + snapshot.engagement);
  });

  return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }));
}
