export default function DashboardLoading() {
  return (
    <div className="dashboard-grid" aria-busy="true" aria-live="polite">
      <section className="topbar skeleton-loading">
        <div className="skeleton-line skeleton-medium" aria-hidden="true"></div>
        <div className="skeleton-line skeleton-long" aria-hidden="true"></div>
        <span className="sr-only">Chargement du tableau de bord</span>
      </section>
      <section className="metrics-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="metric-card skeleton-loading">
            <div className="skeleton-line skeleton-short" aria-hidden="true"></div>
            <div className="skeleton-line skeleton-medium" aria-hidden="true"></div>
          </article>
        ))}
      </section>
    </div>
  );
}
