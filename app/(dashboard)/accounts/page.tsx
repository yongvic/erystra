import { prisma } from "@/lib/prisma";
import { SocialConnectPanel } from "@/components/social-connect-panel";
import { AccountsTable } from "@/components/accounts-table";
import { Topbar } from "@/components/topbar";

export default async function AccountsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const accounts = await prisma.socialAccount.findMany({
    orderBy: { createdAt: "desc" }
  });
  const params = (await searchParams) ?? {};

  return (
    <div className="dashboard-grid">
      <Topbar
        title="Comptes sociaux"
        subtitle="Connexion, inventaire et gouvernance simple des comptes Erystra Group."
      />
      {params.connected ? (
        <div className="notice-banner">
          <p>Compte connecte avec succes.</p>
        </div>
      ) : null}
      {params.synced ? (
        <div className="notice-banner">
          <p>Synchronisation terminee: {params.synced} compte(s) mis a jour.</p>
        </div>
      ) : null}
      {params.published ? (
        <div className="notice-banner">
          <p>Execution terminee: {params.published} publication(s) envoyee(s).</p>
        </div>
      ) : null}
      {params.error ? (
        <div className="notice-banner">
          <p>Une erreur est survenue: {String(params.error)}</p>
        </div>
      ) : null}
      <section className="two-column">
        <SocialConnectPanel />
        <section className="panel composer">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Synchronisation</p>
              <h3>Operations</h3>
            </div>
          </div>
          <form action="/api/social-accounts/sync" method="post">
            <button className="button button-primary" type="submit">
              Synchroniser les analytics
            </button>
          </form>
          <form action="/api/jobs/publish-scheduled" method="post">
            <button className="button button-secondary" type="submit">
              Executer les posts planifies
            </button>
          </form>
        </section>
      </section>
      <AccountsTable items={accounts} />
    </div>
  );
}
