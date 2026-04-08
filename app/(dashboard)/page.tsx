import { MetricCard } from "@/components/metric-card";
import { PostTable } from "@/components/post-table";
import { Topbar } from "@/components/topbar";
import { TrendChart } from "@/components/trend-chart";
import { getDashboardData } from "@/lib/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="dashboard-grid">
      <Topbar
        title="Dashboard"
        subtitle="Vue synthese orientee pilotage, publication et performance."
      />
      {data.isFallback ? (
        <div className="notice-banner">
          <p>Les donnees affichees sont un jeu de secours temporaire. Verifiez la connexion a la base ou les synchronisations.</p>
        </div>
      ) : null}

      <section className="metrics-grid">
        <MetricCard
          label="Engagement"
          value={`${data.metrics.engagement}`}
          hint="Interactions consolidees sur la periode recente"
        />
        <MetricCard
          label="Portee"
          value={`${data.metrics.reach}`}
          hint="Audience totale atteinte sur les comptes actifs"
        />
        <MetricCard
          label="Croissance abonnes"
          value={`+${data.metrics.followerGrowth}`}
          hint="Variation agregee des dernieres captures"
        />
        <MetricCard
          label="Posts planifies"
          value={`${data.metrics.scheduledPosts}`}
          hint="Contenu deja dans la file de planification"
        />
      </section>

      <section className="two-column">
        <TrendChart data={data.trend} />
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Comptes connectes</p>
              <h3>Canaux actifs</h3>
            </div>
          </div>
          <div className="account-list">
            {data.accounts.map((account) => (
              <div key={account.id} className="account-row">
                <div>
                  <strong>{account.label}</strong>
                  <p className="muted compact">{account.handle}</p>
                </div>
                <span className="topbar-chip">{account.provider}</span>
              </div>
            ))}
          </div>
        </section>
      </section>

      <PostTable items={data.posts} title="Dernieres publications et elements planifies" />
    </div>
  );
}
