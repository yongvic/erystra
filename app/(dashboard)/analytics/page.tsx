import { MetricCard } from "@/components/metric-card";
import { Topbar } from "@/components/topbar";
import { TrendChart } from "@/components/trend-chart";
import { getDashboardData } from "@/lib/dashboard";

export default async function AnalyticsPage() {
  const data = await getDashboardData();

  return (
    <div className="dashboard-grid">
      <Topbar
        title="Analytics"
        subtitle="Suivi simple des indicateurs utiles a l'equipe marketing interne."
      />
      {data.isFallback ? (
        <div className="notice-banner">
          <p>Les analytics sont actuellement issus d'un jeu de secours. Relancez la synchronisation pour retrouver les donnees reelles.</p>
        </div>
      ) : null}

      <section className="metrics-grid">
        <MetricCard label="Engagement cumule" value={`${data.metrics.engagement}`} hint="Interactions enregistrees" />
        <MetricCard label="Portee cumulee" value={`${data.metrics.reach}`} hint="Reach consolide" />
        <MetricCard label="Croissance abonnes" value={`+${data.metrics.followerGrowth}`} hint="Base followers" />
        <MetricCard label="Canaux actifs" value={`${data.accounts.length}`} hint="Comptes actuellement relies" />
      </section>

      <TrendChart data={data.trend} />
    </div>
  );
}
