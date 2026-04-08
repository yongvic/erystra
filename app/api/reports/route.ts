import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReportArtifacts } from "@/lib/report-delivery";
import path from "path";
import { z } from "zod";
import { getSession } from "@/lib/auth";

const reportSchema = z.object({
  format: z.enum(["PDF", "EMAIL"]),
  periodStart: z.string(),
  periodEnd: z.string(),
  recipient: z.string().email().optional().or(z.literal("")),
  reportMode: z.enum(["premium"]).optional().default("premium")
});

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await prisma.generatedReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  const rawPayload = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());

  const payload = reportSchema.parse(rawPayload);
  const delivery = await generateReportArtifacts({
    periodStart: new Date(payload.periodStart),
    periodEnd: new Date(payload.periodEnd),
    format: payload.format,
    recipient: payload.recipient || null,
    reportMode: payload.reportMode
  });

  const relativeFile = path.relative(process.cwd(), delivery.pdfPath).replace(/\\/g, "/");
  const report = await prisma.generatedReport.create({
    data: {
      format: payload.format,
      periodStart: new Date(payload.periodStart),
      periodEnd: new Date(payload.periodEnd),
      recipient: payload.recipient || null,
      status: "READY",
      fileUrl: relativeFile,
      summary: delivery.summary
    }
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/reports?generated=${report.id}`, request.url), 303);
  }

  return NextResponse.json(report, { status: 201 });
}
