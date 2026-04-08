"use client";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="dashboard-grid">
      <section className="panel empty-state" role="alert">
        <h3>Impossible de charger cette vue</h3>
        <p>{error.message || "Une erreur inattendue est survenue."}</p>
        <button className="button button-primary" type="button" onClick={reset}>
          Reessayer
        </button>
      </section>
    </div>
  );
}
