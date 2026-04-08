import Image from "next/image";
import { Topbar } from "@/components/topbar";
import { ReportSummary } from "@/components/report-summary";
import { getReportSummary } from "@/lib/reports";
import { prisma } from "@/lib/prisma";
import { PremiumReportAnalysis } from "@/types/report";

function isPremiumAnalysis(value: unknown): value is PremiumReportAnalysis {
  return Boolean(value) && typeof value === "object" && (value as Record<string, unknown>).mode === "premium";
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodEnd.getDate() - 30);
  const params = (await searchParams) ?? {};

  const [summary, reports] = await Promise.all([
    getReportSummary(periodStart, periodEnd),
    prisma.generatedReport.findMany({ orderBy: { createdAt: "desc" }, take: 10 })
  ]);

  const latestSummary = reports[0]?.summary;
  const latestAiAnalysis = isPremiumAnalysis((latestSummary as Record<string, unknown> | null)?.aiAnalysis)
    ? ((latestSummary as Record<string, unknown>).aiAnalysis as PremiumReportAnalysis)
    : null;

  return (
    <div className="dashboard-grid">
      <Topbar
        title="Rapports"
        subtitle="Exports premium pour le suivi directionnel et operationnel de l'activite social media."
      />
      {params.generated ? (
        <div className="notice-banner">
          <p>Rapport genere avec succes.</p>
        </div>
      ) : null}

      <section className="panel composer">
        <div className="panel-header">
          <div className="report-hero">
            <Image
              src="/logo.png"
              alt="Logo Erystra Group"
              width={72}
              height={72}
              className="brand-logo"
            />
            <div>
              <p className="eyebrow">Generation</p>
              <h3>Demander un rapport premium IA</h3>
            </div>
          </div>
        </div>
        <div className="report-brand-banner">
          <div>
            <strong>Rapport Erystra</strong>
            <p className="muted compact">
              Export directionnel brande pour diffusion interne, archivage et envoi email.
            </p>
          </div>
          <span className="topbar-chip">Premium IA</span>
        </div>
        <form className="composer" action="/api/reports" method="post">
          <input type="hidden" name="reportMode" value="premium" />
          <div className="composer-grid">
            <label>
              Format
              <select name="format" defaultValue="PDF">
                <option value="PDF">PDF</option>
                <option value="EMAIL">EMAIL</option>
              </select>
            </label>
            <label>
              Email destinataire
              <input name="recipient" type="email" placeholder="marketing@erystra-group.com" />
            </label>
          </div>
          <div className="composer-grid">
            <label>
              Debut periode
              <input name="periodStart" type="datetime-local" required />
            </label>
            <label>
              Fin periode
              <input name="periodEnd" type="datetime-local" required />
            </label>
          </div>
          <button className="button button-primary" type="submit">
            Generer le rapport premium Gemini en PDF
          </button>
        </form>
      </section>

      <ReportSummary summary={summary} />

      {latestAiAnalysis ? (
        <section className="panel premium-report">
          <div className="panel-header">
            <div className="report-hero">
              <Image
                src="/logo.png"
                alt="Logo Erystra Group"
                width={64}
                height={64}
                className="brand-logo"
              />
              <div>
                <p className="eyebrow">Analyse IA Premium</p>
                <h3>Derniere synthese dirigeante</h3>
              </div>
            </div>
            <span className="score-badge">Score global {latestAiAnalysis.overallScore}/100</span>
          </div>

          <div className="premium-grid">
            <article className="metric-card">
              <p className="metric-label">Resume dirigeant</p>
              <p className="premium-copy">{latestAiAnalysis.boardSummary}</p>
            </article>
            <article className="metric-card">
              <p className="metric-label">Synthese executive</p>
              <p className="premium-copy">{latestAiAnalysis.executiveSummary}</p>
            </article>
          </div>

          <div className="premium-grid">
            <article className="panel-subsection">
              <h4>Points forts</h4>
              <ul className="premium-list">
                {latestAiAnalysis.keyWins.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="panel-subsection">
              <h4>Vigilances</h4>
              <ul className="premium-list">
                {latestAiAnalysis.watchouts.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <article className="panel-subsection">
            <h4>Recommandations par canal</h4>
            <div className="account-list">
              {latestAiAnalysis.channelRecommendations.map((item) => (
                <div className="account-row" key={item.provider}>
                  <div>
                    <strong>{item.provider}</strong>
                    <p className="muted compact">{item.recommendation}</p>
                  </div>
                  <span className="score-badge">{item.status} - {item.score}/100</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-subsection">
            <h4>Actions prioritaires</h4>
            <ol className="premium-list premium-ordered">
              {latestAiAnalysis.nextActions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>

          <article className="panel-subsection">
            <h4>Analyse narrative Gemini</h4>
            <pre className="ai-analysis">{latestAiAnalysis.rawText}</pre>
          </article>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Historique</p>
            <h3>Rapports generes</h3>
          </div>
        </div>
        <div className="account-list">
          {reports.map((report) => (
            <div className="account-row" key={report.id}>
              <div>
                <strong>{report.format}</strong>
                <p className="muted compact">
                  {new Date(report.periodStart).toLocaleDateString("fr-FR")} - {new Date(report.periodEnd).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <a className="button button-secondary" href={`/api/reports/${report.id}/download`}>
                Telecharger le PDF
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
