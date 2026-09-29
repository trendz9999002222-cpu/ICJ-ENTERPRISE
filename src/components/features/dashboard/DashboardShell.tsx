"use client";

import PortalShell from "./layout/PortalShell";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
