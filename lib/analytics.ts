import { prisma } from "@/lib/prisma";
import { syncProviderAnalytics } from "@/lib/social/providers";

export async function getAnalyticsSummary() {
  const [snapshots, accounts, publishedPosts] = await Promise.all([
    prisma.analyticsSnapshot.findMany({
      orderBy: { capturedAt: "desc" },
      take: 60,
      include: { socialAccount: true }
    }),
    prisma.socialAccount.count({ where: { isActive: true } }),
    prisma.post.count({ where: { status: "PUBLISHED" } })
  ]);

  const totals = snapshots.reduce(
    (acc, snapshot) => {
      acc.reach += snapshot.reach;
      acc.engagement += snapshot.engagement;
      acc.followers += snapshot.followersCount;
      return acc;
    },
    { reach: 0, engagement: 0, followers: 0 }
  );

  const groupedByProvider = snapshots.reduce<Record<string, number>>((acc, snapshot) => {
    const key = snapshot.socialAccount.provider;
    acc[key] = (acc[key] || 0) + snapshot.engagement;
    return acc;
  }, {});

  return {
    totals,
    accounts,
    publishedPosts,
    byProvider: Object.entries(groupedByProvider).map(([provider, engagement]) => ({
      provider,
      engagement
    }))
  };
}

export async function syncAllAnalytics() {
  const accounts = await prisma.socialAccount.findMany({ where: { isActive: true } });
  let created = 0;
  const errors: string[] = [];

  for (const account of accounts) {
    try {
      const stats = await syncProviderAnalytics(account);

      if (!stats) {
        continue;
      }

      const capturedAt = new Date();
      capturedAt.setMinutes(0, 0, 0);

      await prisma.analyticsSnapshot.upsert({
        where: {
          socialAccountId_capturedAt: {
            socialAccountId: account.id,
            capturedAt
          }
        },
        update: {
          followersCount: stats.followersCount,
          reach: stats.reach,
          engagement: stats.engagement,
          impressions: stats.impressions,
          metadata: stats.metadata
        },
        create: {
          socialAccountId: account.id,
          capturedAt,
          followersCount: stats.followersCount,
          reach: stats.reach,
          engagement: stats.engagement,
          impressions: stats.impressions,
          metadata: stats.metadata
        }
      });

      created += 1;
    } catch (error) {
      errors.push(`${account.provider}:${account.id}:${error instanceof Error ? error.message : "unknown"}`);
    }
  }

  return { created, errors };
}
