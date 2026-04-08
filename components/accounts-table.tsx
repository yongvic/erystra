type AccountItem = {
  id: string;
  provider: string;
  label: string;
  handle: string;
  isActive?: boolean;
};

export function AccountsTable({ items }: { items: AccountItem[] }) {
  if (items.length === 0) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Inventaire</p>
            <h3>Comptes connectes</h3>
          </div>
        </div>
        <div className="empty-state">
          <h4>Aucun compte connecte</h4>
          <p>Connectez un premier canal pour lancer la synchronisation, la planification et le reporting.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Inventaire</p>
          <h3>Comptes connectes</h3>
        </div>
      </div>
      <div className="table-shell">
        <p className="table-caption">Inventaire des comptes actifs et de leur statut de connexion.</p>
        <table>
          <caption className="sr-only">Liste des comptes sociaux connectés</caption>
          <thead>
            <tr>
              <th>Compte</th>
              <th>Reseau</th>
              <th>Handle</th>
              <th>Etat</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.label}</strong></td>
                <td>{item.provider}</td>
                <td>{item.handle}</td>
                <td>
                  <span className={`status-badge ${item.isActive === false ? "status-cancelled" : "status-published"}`}>
                    {item.isActive === false ? "INACTIF" : "ACTIF"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
