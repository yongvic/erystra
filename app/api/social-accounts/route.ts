import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const createAccountSchema = z.object({
  provider: z.enum(["FACEBOOK", "LINKEDIN", "TWITTER", "INSTAGRAM"]),
  label: z.string().min(2),
  handle: z.string().min(2),
  externalAccountId: z.string().min(1)
});

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.socialAccount.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = createAccountSchema.parse(await request.json());
  const account = await prisma.socialAccount.create({ data: payload });
  return NextResponse.json(account, { status: 201 });
}
