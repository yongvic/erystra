"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import React, { useEffect, useId, useRef } from "react";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Dashboard" },
  { href: "/accounts", label: "Comptes" },
  { href: "/posts", label: "Publications" },
  { href: "/planner", label: "Planification" },
  { href: "/analytics", label: "Analytics" },
  { href: "/reports", label: "Rapports" }
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <button
          type="button"
          className="mobile-nav-overlay"
          onClick={onClose}
          aria-label="Fermer le menu"
        />
      )}

      <aside
        id="mobile-navigation"
        className={`mobile-nav ${isOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={isOpen ? "false" : "true"}
      >
        <div className="mobile-nav-header">
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
              <h2 id={titleId}>Social Desk</h2>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            className="mobile-nav-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <nav className="nav-list" aria-label="Navigation principale mobile">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "nav-link active" : "nav-link"}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mobile-nav-footer">
          <p>Mission</p>
          <strong>Developper talents et organisations avec des solutions innovantes et durables.</strong>
        </div>
      </aside>
    </>
  );
}
