type TrendPoint = {
  label: string;
  value: number;
};

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="panel" aria-labelledby="trend-chart-title">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Engagement</p>
          <h3 id="trend-chart-title">Tendance hebdomadaire</h3>
        </div>
      </div>
      <div className="trend-grid" aria-hidden="true">
        {data.map((item) => (
          <div key={item.label} className="trend-column">
            <div
              className="trend-bar"
              style={{ height: `${Math.max((item.value / maxValue) * 100, 8)}%` }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>Tendance hebdomadaire de l'engagement</caption>
        <tbody>
          {data.map((item) => (
            <tr key={item.label}>
              <th scope="row">{item.label}</th>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
