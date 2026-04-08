"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Dashboard" },
  { href: "/accounts", label: "Comptes" },
  { href: "/posts", label: "Publications" },
  { href: "/planner", label: "Planification" },
  { href: "/analytics", label: "Analytics" },
  { href: "/reports", label: "Rapports" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-lockup">
          <Image
            src="/logo.png"
            alt="Logo Erystra Group"
            width={56}
            height={56}
            className="brand-logo"
            priority
          />
          <div>
            <p className="eyebrow">Erystra Group</p>
            <h1>Social Desk</h1>
          </div>
        </div>
        <p className="brand-copy">
          Ensemble, faconnons un avenir prospere, resilient et durable.
        </p>
      </div>

      <nav className="nav-list" aria-label="Navigation principale">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "nav-link active" : "nav-link"}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>Mission</p>
        <strong>Developper talents et organisations avec des solutions innovantes et durables.</strong>
      </div>
    </aside>
  );
}
