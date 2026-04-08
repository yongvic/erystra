import { getReportSummary } from "@/lib/reports";
import { createSimplePdf } from "@/lib/pdf";
import { sendReportEmail } from "@/lib/email";
import { generateGeminiReportAnalysis } from "@/lib/gemini";
import { getAnalyticsSummary } from "@/lib/analytics";

export async function generateReportArtifacts({
  periodStart,
  periodEnd,
  format,
  recipient,
  reportMode = "premium"
}: {
  periodStart: Date;
  periodEnd: Date;
  format: "PDF" | "EMAIL";
  recipient?: string | null;
  reportMode?: "premium";
}) {
  const [summary, analytics] = await Promise.all([
    getReportSummary(periodStart, periodEnd),
    getAnalyticsSummary()
  ]);

  let analysis;

  try {
    analysis = await generateGeminiReportAnalysis({
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      summary,
      analytics: {
        totals: analytics.totals,
        byProvider: analytics.byProvider
      }
    });
  } catch (error) {
    throw new Error(`Gemini premium analysis failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  const fileName = `report-${periodStart.getTime()}-${periodEnd.getTime()}.pdf`;
  const pdfLines = [
    "Erystra Group - Premium Social Media Report",
    `Periode: ${periodStart.toISOString()} -> ${periodEnd.toISOString()}`,
    `Mode rapport: ${reportMode}`,
    `Score global IA: ${analysis.overallScore}/100`,
    `Posts total: ${summary.totalPosts}`,
    `Publies: ${summary.published}`,
    `Planifies: ${summary.scheduled}`,
    `Reach cumule: ${analytics.totals.reach}`,
    `Engagement cumule: ${analytics.totals.engagement}`,
    `Followers cumules: ${analytics.totals.followers}`,
    "",
    "Resume dirigeant:",
    analysis.boardSummary,
    "",
    "Synthese executive:",
    analysis.executiveSummary,
    "",
    "Points forts:",
    ...analysis.keyWins.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Vigilances:",
    ...analysis.watchouts.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Recommandations par canal:",
    ...analysis.channelRecommendations.map(
      (item) => `${item.provider} | score ${item.score}/100 | ${item.status} | ${item.recommendation}`
    ),
    "",
    "Actions prioritaires:",
    ...analysis.nextActions.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Analyse narrative Gemini:",
    ...analysis.rawText.split("\n")
  ];

  const pdfPath = await createSimplePdf(fileName, pdfLines);

  if (format === "EMAIL") {
    if (!recipient) {
      throw new Error("Recipient is required for email reports.");
    }

    await sendReportEmail({
      to: recipient,
      subject: "Erystra Group - Rapport premium social media",
      text: [
        `Score global: ${analysis.overallScore}/100`,
        `Resume dirigeant: ${analysis.boardSummary}`,
        "Actions prioritaires:",
        ...analysis.nextActions.map((item, index) => `${index + 1}. ${item}`)
      ].join("\n"),
      attachmentPath: pdfPath,
      attachmentName: fileName
    });
  }

  return {
    summary: {
      ...summary,
      reportMode,
      aiAnalysis: analysis,
      analyticsTotals: analytics.totals
    },
    pdfPath,
    publicPath: `/storage/reports/${fileName}`
  };
}
