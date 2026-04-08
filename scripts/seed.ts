import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "marketing@erystra-group.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await hashPassword(password),
      firstName: "Erystra",
      lastName: "Marketing"
    }
  });

  const accounts = await Promise.all([
    prisma.socialAccount.upsert({
      where: { externalAccountId: "facebook-erystra-seed" },
      update: {},
      create: {
        provider: "FACEBOOK",
        label: "Erystra Group Facebook",
        handle: "@erystra.group",
        externalAccountId: "facebook-erystra-seed"
      }
    }),
    prisma.socialAccount.upsert({
      where: { externalAccountId: "linkedin-erystra-seed" },
      update: {},
      create: {
        provider: "LINKEDIN",
        label: "Erystra Group LinkedIn",
        handle: "erystra-group",
        externalAccountId: "linkedin-erystra-seed"
      }
    }),
    prisma.socialAccount.upsert({
      where: { externalAccountId: "twitter-erystra-seed" },
      update: {},
      create: {
        provider: "TWITTER",
        label: "Erystra Group X",
        handle: "@ErystraGroup",
        externalAccountId: "twitter-erystra-seed"
      }
    })
  ]);

  const post = await prisma.post.create({
    data: {
      title: "Lancement du desk social Erystra",
      content: "Presentation interne de la plateforme dediee au pilotage social media du groupe.",
      authorId: user.id,
      status: "SCHEDULED",
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24),
      publications: {
        create: accounts.map((account) => ({
          socialAccountId: account.id,
          status: "QUEUED"
        }))
      }
    }
  });

  for (let day = 0; day < 7; day += 1) {
    for (const account of accounts) {
      const capturedAt = new Date();
      capturedAt.setDate(capturedAt.getDate() - day);
      capturedAt.setHours(9, 0, 0, 0);

      await prisma.analyticsSnapshot.upsert({
        where: {
          socialAccountId_capturedAt: {
            socialAccountId: account.id,
            capturedAt
          }
        },
        update: {},
        create: {
          socialAccountId: account.id,
          capturedAt,
          followersCount: 1800 + day * 25,
          reach: 4200 + day * 140,
          engagement: 320 + day * 18,
          impressions: 6100 + day * 220
        }
      });
    }
  }

  console.log(`Admin seed created for ${email}`);
  console.log(`Seed post ready: ${post.id}`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
