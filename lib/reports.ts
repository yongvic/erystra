import { ReportSummaryData } from "@/types/report";
import { prisma } from "@/lib/prisma";

export async function getReportSummary(periodStart: Date, periodEnd: Date): Promise<ReportSummaryData> {
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { publishedAt: { gte: periodStart, lte: periodEnd } },
        { scheduledFor: { gte: periodStart, lte: periodEnd } }
      ]
    },
    include: {
      publications: {
        include: { socialAccount: true }
      }
    }
  });

  const published = posts.filter((post) => post.status === "PUBLISHED").length;
  const scheduled = posts.filter((post) => post.status === "SCHEDULED").length;

  const byProvider = posts.flatMap((post) => post.publications).reduce<Record<string, number>>((acc, item) => {
    acc[item.socialAccount.provider] = (acc[item.socialAccount.provider] || 0) + 1;
    return acc;
  }, {});

  return {
    published,
    scheduled,
    totalPosts: posts.length,
    byProvider,
    generatedAt: new Date().toISOString()
  };
}
