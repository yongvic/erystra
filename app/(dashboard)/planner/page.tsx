import { PostTable } from "@/components/post-table";
import { Topbar } from "@/components/topbar";
import { getDashboardData } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export default async function PlannerPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [data, postsToSchedule] = await Promise.all([
    getDashboardData(),
    prisma.post.findMany({
      where: { status: { in: ["DRAFT", "FAILED", "CANCELLED"] } },
      orderBy: { createdAt: "desc" },
      take: 20
    })
  ]);
  const params = (await searchParams) ?? {};
  const scheduled = data.posts.filter((post) => post.status === "SCHEDULED");

  return (
    <div className="dashboard-grid">
      <Topbar
        title="Planification"
        subtitle="Vue operationnelle des publications a venir et de la cadence editoriale."
      />
      {params.scheduled === "1" ? (
        <div className="notice-banner">
          <p>Publication planifiee avec succes.</p>
        </div>
      ) : null}

      <section className="panel composer">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Planning</p>
            <h3>Programmer un post</h3>
          </div>
        </div>
        <form className="composer" action="/api/schedule" method="post">
          <div className="composer-grid">
            <label>
              Publication a planifier
              <select name="postId" required defaultValue="">
                <option value="" disabled>
                  Selectionnez une publication
                </option>
                {postsToSchedule.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date cible
              <input name="scheduledFor" type="datetime-local" required />
            </label>
          </div>
          {postsToSchedule.length === 0 ? (
            <div className="empty-state">
              <h4>Rien a planifier</h4>
              <p>Créez d'abord une publication brouillon depuis l'écran Publications.</p>
            </div>
          ) : null}
          <button className="button button-primary" type="submit" disabled={postsToSchedule.length === 0}>
            Planifier
          </button>
        </form>
      </section>

      <PostTable items={scheduled} title="File de planification" />
    </div>
  );
}
