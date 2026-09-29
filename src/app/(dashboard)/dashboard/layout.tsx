import DashboardShell from "@/components/features/dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard Portal — ICJ Enterprise",
};

export default function RootDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
