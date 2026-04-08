import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const postSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(3),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  scheduledFor: z.string().optional().or(z.literal("")),
  accountIds: z.array(z.string()).optional().default([])
});

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { publications: { include: { socialAccount: true } } }
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  const rawPayload = contentType.includes("application/json")
    ? await request.json()
    : parsePostFormData(await request.formData());

  const payload = postSchema.parse(rawPayload);
  const selectedIds = payload.accountIds.filter(Boolean);

  const accounts = await prisma.socialAccount.findMany({
    where: selectedIds.length > 0 ? { id: { in: selectedIds }, isActive: true } : { isActive: true }
  });

  if (accounts.length === 0) {
    return NextResponse.json(
      { error: "Aucun compte actif selectionne pour cette publication." },
      { status: 400 }
    );
  }

  const post = await prisma.post.create({
    data: {
      title: payload.title,
      content: payload.content,
      mediaUrl: payload.mediaUrl || null,
      scheduledFor: payload.scheduledFor ? new Date(payload.scheduledFor) : null,
      status: payload.scheduledFor ? "SCHEDULED" : "DRAFT",
      authorId: session.userId,
      publications: {
        create: accounts.map((account) => ({
          socialAccountId: account.id,
          status: payload.scheduledFor ? "QUEUED" : "QUEUED"
        }))
      }
    },
    include: {
      publications: { include: { socialAccount: true } }
    }
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL("/posts?created=1", request.url), 303);
  }

  return NextResponse.json(post, { status: 201 });
}

function parsePostFormData(formData: FormData) {
  return {
    title: String(formData.get("title") || ""),
    content: String(formData.get("content") || ""),
    mediaUrl: String(formData.get("mediaUrl") || ""),
    scheduledFor: String(formData.get("scheduledFor") || ""),
    accountIds: formData.getAll("accountIds").map((value) => String(value))
  };
}
