import mysql from "mysql2/promise";
import { PrismaClient, PostStatus, SocialProvider } from "@prisma/client";
import { hashPassword } from "../lib/crypto";

const prisma = new PrismaClient();

function mapProvider(accountType: number): SocialProvider | null {
  switch (accountType) {
    case 1:
    case 2:
    case 3:
      return "FACEBOOK";
    case 4:
      return "TWITTER";
    case 5:
      return "INSTAGRAM";
    case 6:
    case 7:
      return "LINKEDIN";
    default:
      return null;
  }
}

async function main() {
  const legacy = await mysql.createConnection({
    host: process.env.LEGACY_MYSQL_HOST,
    port: Number(process.env.LEGACY_MYSQL_PORT || "3306"),
    user: process.env.LEGACY_MYSQL_USER,
    password: process.env.LEGACY_MYSQL_PASSWORD,
    database: process.env.LEGACY_MYSQL_DATABASE
  });

  const [users] = await legacy.query<any[]>(
    "SELECT user_id, email, password, first_name, last_name FROM user_details"
  );
  const [accounts] = await legacy.query<any[]>(
    "SELECT account_id, account_type, account_name, user_name, social_id, access_token, refresh_token FROM social_accounts WHERE archived_status = 1"
  );
  const [schedules] = await legacy.query<any[]>(
    "SELECT schedule_id, user_id, one_time_schedule_date, schedule_status FROM users_schedule_details"
  );

  const userMap = new Map<number, string>();

  for (const user of users) {
    const normalizedEmail = user.email || `legacy-user-${user.user_id}@erystra.local`;
    const passwordHash =
      typeof user.password === "string" && user.password.length > 20
        ? user.password
        : await hashPassword("LegacyPassword123!");

    const created = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        firstName: user.first_name || "Legacy",
        lastName: user.last_name || "User"
      },
      create: {
        email: normalizedEmail,
        passwordHash,
        firstName: user.first_name || "Legacy",
        lastName: user.last_name || "User"
      }
    });

    userMap.set(user.user_id, created.id);
  }

  for (const account of accounts) {
    const provider = mapProvider(account.account_type);

    if (!provider) {
      continue;
    }

    await prisma.socialAccount.upsert({
      where: { externalAccountId: String(account.social_id || account.account_id) },
      update: {
        label: account.account_name || account.user_name || provider,
        handle: account.user_name || account.account_name || `legacy-${account.account_id}`
      },
      create: {
        provider,
        label: account.account_name || account.user_name || provider,
        handle: account.user_name || account.account_name || `legacy-${account.account_id}`,
        externalAccountId: String(account.social_id || account.account_id),
        accessToken: account.access_token,
        refreshToken: account.refresh_token
      }
    });
  }

  for (const schedule of schedules) {
    const authorId = userMap.get(schedule.user_id);

    if (!authorId) {
      continue;
    }

    await prisma.post.create({
      data: {
        title: `Legacy scheduled post ${schedule.schedule_id}`,
        content: "Placeholder genere depuis la migration legacy. Le contenu Mongo doit etre rattache manuellement si necessaire.",
        authorId,
        status: schedule.schedule_status === 6 ? PostStatus.PUBLISHED : PostStatus.SCHEDULED,
        scheduledFor: schedule.one_time_schedule_date ? new Date(schedule.one_time_schedule_date) : null
      }
    });
  }

  console.log("Legacy migration completed.");
  await legacy.end();
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
