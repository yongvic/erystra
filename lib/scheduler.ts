import { prisma } from "@/lib/prisma";
import { publishToProvider } from "@/lib/social/providers";

export async function runScheduledPublishing() {
  const scheduledPosts = await prisma.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledFor: { lte: new Date() }
    },
    include: {
      publications: {
        include: { socialAccount: true }
      }
    }
  });

  let publishedCount = 0;
  const errors: string[] = [];

  for (const post of scheduledPosts) {
    let failed = false;

    for (const publication of post.publications) {
      try {
        const result = await publishToProvider(publication.socialAccount, {
          text: post.content,
          mediaUrl: post.mediaUrl
        });

        await prisma.postPublication.update({
          where: { id: publication.id },
          data: {
            status: "PUBLISHED",
            publishedAt: new Date(),
            providerPostId: result.providerPostId,
            metrics: result.raw
          }
        });
      } catch (error) {
        failed = true;
        const message = error instanceof Error ? error.message : "unknown";
        errors.push(`${publication.socialAccount.provider}:${publication.id}:${message}`);

        await prisma.postPublication.update({
          where: { id: publication.id },
          data: {
            status: "FAILED",
            errorMessage: message
          }
        });
      }
    }

    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: failed ? "FAILED" : "PUBLISHED",
        publishedAt: failed ? null : new Date()
      }
    });

    if (!failed) {
      publishedCount += 1;
    }
  }

  return {
    processed: scheduledPosts.length,
    published: publishedCount,
    errors
  };
}
