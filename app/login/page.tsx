import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error;
  const initialError =
    errorParam === "CredentialsSignin"
      ? "Adresse email ou mot de passe incorrect."
      : errorParam
        ? "Une erreur est survenue lors de la connexion."
        : undefined;

  return (
    <main className="auth-shell">
      <section className="login-panel">
        <div className="brand-lockup brand-lockup-login">
          <Image
            src="/logo.png"
            alt="Logo Erystra Group"
            width={72}
            height={72}
            className="brand-logo"
            priority
          />
          <div>
            <p className="eyebrow">Erystra Group</p>
            <h1>Connexion interne</h1>
          </div>
        </div>
        <p className="muted">
          Mission: developper talents et organisations avec des solutions innovantes et durables.
        </p>

        <LoginForm initialError={initialError} />
      </section>
    </main>
  );
}
