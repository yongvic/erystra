import Image from "next/image";
import { ReportSummaryData } from "@/types/report";

type ReportSummaryProps = {
  summary: ReportSummaryData;
};

export function ReportSummary({ summary }: ReportSummaryProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div className="report-hero report-hero-compact">
          <Image
            src="/logo.png"
            alt="Logo Erystra Group"
            width={52}
            height={52}
            className="brand-logo"
          />
          <div>
            <p className="eyebrow">Reporting</p>
            <h3>Synthese exportable</h3>
          </div>
        </div>
      </div>
      <div className="metrics-grid report-grid">
        <div className="metric-card">
          <p className="metric-label">Posts total</p>
          <strong className="metric-value">{summary.totalPosts}</strong>
        </div>
        <div className="metric-card">
          <p className="metric-label">Publies</p>
          <strong className="metric-value">{summary.published}</strong>
        </div>
        <div className="metric-card">
          <p className="metric-label">Planifies</p>
          <strong className="metric-value">{summary.scheduled}</strong>
        </div>
      </div>
      <div className="account-list report-provider-list">
        {Object.entries(summary.byProvider).map(([provider, count]) => (
          <div className="account-row" key={provider}>
            <strong>{provider}</strong>
            <span>{count} post(s)</span>
          </div>
        ))}
      </div>
      <p className="muted compact">Genere le {new Date(summary.generatedAt).toLocaleString("fr-FR")}</p>
    </section>
  );
}
