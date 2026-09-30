import AdminAccountSecuritySettings from "@/components/features/admin/settings/AdminAccountSecuritySettings";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";

export const metadata = { title: "Settings — Admin Portal | ICJ Enterprise" };

export default function Page() {
  return (
    <AdminPageShell title="Settings" subtitle="Account security and platform configuration">
      <AdminAccountSecuritySettings />
    </AdminPageShell>
  );
}
