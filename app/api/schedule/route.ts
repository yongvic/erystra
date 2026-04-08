import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const scheduleSchema = z.object({
  postId: z.string().min(1),
  scheduledFor: z.string().min(1)
});

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scheduledPosts = await prisma.post.findMany({
    where: { status: "SCHEDULED" },
    orderBy: { scheduledFor: "asc" }
  });

  return NextResponse.json(scheduledPosts);
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawPayload = Object.fromEntries((await request.formData()).entries());
  const payload = scheduleSchema.parse(rawPayload);

  const post = await prisma.post.findUnique({
    where: { id: payload.postId },
    select: { id: true }
  });

  if (!post) {
    return NextResponse.json({ error: "Publication introuvable." }, { status: 404 });
  }

  await prisma.post.update({
    where: { id: payload.postId },
    data: {
      status: "SCHEDULED",
      scheduledFor: new Date(payload.scheduledFor)
    }
  });

  return NextResponse.redirect(new URL("/planner?scheduled=1", request.url), 303);
}
