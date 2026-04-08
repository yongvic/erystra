import Image from "next/image";
import { LogoutForm } from "@/components/logout-form";

type TopbarProps = {
  title: string;
  subtitle: string;
};

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <Image
          src="/logo.png"
          alt="Logo Erystra Group"
          width={44}
          height={44}
          className="brand-logo brand-logo-topbar"
        />
        <div>
          <p className="eyebrow">Pilotage marketing interne</p>
          <h2>{title}</h2>
          <p className="muted">{subtitle}</p>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="topbar-card" aria-label="Valeurs Erystra">
          <span className="topbar-chip">Innovation</span>
          <span className="topbar-chip">Probite</span>
          <span className="topbar-chip">Excellence</span>
        </div>
        <LogoutForm />
      </div>
    </header>
  );
}
