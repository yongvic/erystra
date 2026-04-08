type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  isLoading?: boolean; // New prop to indicate loading state
};

export function MetricCard({ label, value, hint, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <article className="metric-card skeleton-loading">
        <div className="skeleton-line skeleton-short" aria-hidden="true"></div>
        <div className="skeleton-line skeleton-medium" aria-hidden="true"></div>
        <div className="skeleton-line skeleton-long" aria-hidden="true"></div>
        <span className="sr-only">Chargement de la carte KPI</span>
      </article>
    );
  }

  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <strong className="metric-value">{value}</strong>
      <span className="metric-hint">{hint}</span>
    </article>
  );
}
