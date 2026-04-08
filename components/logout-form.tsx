"use client";

export function LogoutForm() {
  return (
    <form action="/api/auth/logout" method="post">
      <button className="button button-secondary" type="submit">
        Deconnexion
      </button>
    </form>
  );
}
