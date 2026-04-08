import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const rawPayload = isJson
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());
  const email = String(rawPayload.email || "").trim().toLowerCase();
  const password = String(rawPayload.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signSession({ userId: user.id, email: user.email });
  await setSessionCookie(token);

  if (isJson) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.redirect(new URL("/", request.url), 303);
}
