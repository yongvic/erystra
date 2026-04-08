import { requireSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  await requireSession();

  return (
    <DashboardShell>{children}</DashboardShell>
  );
}
