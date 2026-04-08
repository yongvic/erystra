"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export function DashboardShell({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="app-shell">
      <button
        className="mobile-menu-toggle"
        type="button"
        onClick={() => setIsMobileNavOpen(true)}
        aria-label="Ouvrir le menu principal"
        aria-controls="mobile-navigation"
        aria-expanded={isMobileNavOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </button>

      <Sidebar />
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      <main id="main-content" className="content-shell">
        {children}
      </main>
    </div>
  );
}
