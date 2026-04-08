import { providerConfigs } from "@/lib/social-providers";

export function SocialConnectPanel() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Comptes sociaux</p>
          <h3>Connecter un nouveau canal</h3>
        </div>
      </div>
      <div className="account-list">
        {providerConfigs.map((provider) => (
          <div key={provider.key} className="account-row">
            <div>
              <strong>{provider.label}</strong>
              <p className="muted compact">Scopes: {provider.scopes.join(", ")}</p>
            </div>
            <a
              className="button button-secondary"
              href={`/api/social-accounts/connect?provider=${provider.key}`}
              aria-label={`Connecter le canal ${provider.label}`}
            >
              Connecter
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
