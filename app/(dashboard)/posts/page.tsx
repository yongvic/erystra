import { PostTable } from "@/components/post-table";
import { Topbar } from "@/components/topbar";
import { getDashboardData } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export default async function PostsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [data, accounts] = await Promise.all([
    getDashboardData(),
    prisma.socialAccount.findMany({ where: { isActive: true }, orderBy: { provider: "asc" } })
  ]);
  const params = (await searchParams) ?? {};

  return (
    <div className="dashboard-grid">
      <Topbar
        title="Publications"
        subtitle="Centre de gestion du contenu, brouillons et historique de diffusion."
      />
      {params.created === "1" ? (
        <div className="notice-banner">
          <p>Publication enregistree avec succes.</p>
        </div>
      ) : null}
      {data.isFallback ? (
        <div className="notice-banner">
          <p>L'historique affiche des donnees de secours. Verifiez la base de donnees avant de prendre une decision.</p>
        </div>
      ) : null}

      <section className="panel composer">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Composer</p>
            <h3>Nouveau contenu</h3>
          </div>
        </div>
        <form className="composer" action="/api/posts" method="post">
          <div className="composer-grid">
            <label>
              Titre
              <input name="title" placeholder="Ex: Focus transformation des organisations" required />
            </label>
            <label>
              Date de publication
              <input name="scheduledFor" type="datetime-local" />
            </label>
          </div>
          <label>
            Message
            <textarea
              name="content"
              rows={6}
              placeholder="Message institutionnel oriente impact, expertise et clarte."
              required
            />
          </label>
          <label>
            URL media
            <input name="mediaUrl" placeholder="https://..." />
          </label>
          <fieldset className="composer">
            <legend>Comptes cibles</legend>
            <p className="field-help">Laissez tout coché pour diffuser le post sur l'ensemble des comptes actifs.</p>
            <div className="checkbox-grid">
              {accounts.map((account) => (
                <label key={account.id} className="checkbox-card">
                  <input type="checkbox" name="accountIds" value={account.id} defaultChecked />
                  <span className="checkbox-card-content">
                    <strong>{account.label}</strong>
                    <span className="muted">{account.provider} · {account.handle}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="button button-primary" type="submit">
            Enregistrer la publication
          </button>
        </form>
      </section>

      <PostTable items={data.posts} title="Historique des publications" />
    </div>
  );
}
