import DashboardShellSelector from "@/components/features/dashboard/layout/DashboardShellSelector";

export const metadata = {
  title: "Dashboard Portal — ICJ Enterprise",
};

export default function RootDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShellSelector>{children}</DashboardShellSelector>;
}
