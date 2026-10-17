"use client";

import { usePathname } from "next/navigation";
import PortalShell from "@/components/features/dashboard/layout/PortalShell";
import AdminShell from "@/components/features/admin/layout/AdminShell";

interface DashboardShellSelectorProps {
  children: React.ReactNode;
}

export default function DashboardShellSelector({ children }: DashboardShellSelectorProps) {
  const pathname = usePathname();

  // If navigating under the admin dashboard route, wrap in Admin workspace shell
  if (pathname.startsWith("/dashboard/admin")) {
    return <AdminShell>{children}</AdminShell>;
  }

  // Otherwise wrap in user portal workspace shell (member, professional, profile, password)
  return <PortalShell>{children}</PortalShell>;
}
