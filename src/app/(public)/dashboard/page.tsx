import { redirect } from "next/navigation";

// Legacy URL — redirects to the Admin Portal dashboard.
// The LoginForm still pushes "/dashboard" on login; this ensures
// backward compatibility while the new admin route is at /admin/dashboard.
export default function LegacyDashboardPage() {
  redirect("/admin/dashboard");
}
