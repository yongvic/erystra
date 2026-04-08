import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seeding disabled in production" }, { status: 403 });
  }

  const email = process.env.SEED_ADMIN_EMAIL || "marketing@erystra-group.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await hashPassword(password),
      firstName: "Erystra",
      lastName: "Marketing"
    }
  });

  return NextResponse.json({ ok: true, email });
}
