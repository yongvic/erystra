import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const report = await prisma.generatedReport.findUnique({ where: { id } });

  if (!report?.fileUrl) {
    return NextResponse.json({ error: "Report file not found" }, { status: 404 });
  }

  const absolutePath = path.join(process.cwd(), report.fileUrl);
  const resolvedRoot = path.resolve(process.cwd());
  const resolvedFile = path.resolve(absolutePath);

  if (!resolvedFile.startsWith(resolvedRoot)) {
    return NextResponse.json({ error: "Invalid report path" }, { status: 400 });
  }

  const file = await fs.readFile(resolvedFile);

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="report-${id}.pdf"`
    }
  });
}
