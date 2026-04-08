type PostItem = {
  id: string;
  title: string;
  content: string;
  status: string;
  scheduledFor: string | null;
  providerLabels: string[];
};

export function PostTable({
  items,
  title
}: {
  items: PostItem[];
  title: string;
}) {
  if (items.length === 0) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Historique</p>
            <h3>{title}</h3>
          </div>
        </div>
        <div className="empty-state">
          <h4>Aucune publication pour le moment</h4>
          <p>Créez un premier contenu ou planifiez un post pour alimenter cet historique.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Historique</p>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="table-shell">
        <p className="table-caption">Tableau des publications récentes, avec canaux, statut et date d'exécution.</p>
        <table>
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Canaux</th>
              <th>Statut</th>
              <th>Execution</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  <p className="muted compact">{item.content}</p>
                </td>
                <td>{item.providerLabels.join(", ")}</td>
                <td>
                  <span className={`status-badge status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.scheduledFor ? new Date(item.scheduledFor).toLocaleString("fr-FR") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
