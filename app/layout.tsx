import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Erystra Social Desk",
  description: "Plateforme interne de pilotage social media pour Erystra Group.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
