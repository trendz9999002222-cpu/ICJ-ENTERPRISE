import AdminShell from "@/components/features/admin/layout/AdminShell";

export const metadata = {
  title: "Admin Portal — ICJ Enterprise",
  description: "ICJ Enterprise Platform Administration",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
