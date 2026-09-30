"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { env } from "@/config/env";
import { readAccessTokenFromCookie } from "@/lib/api/client";
import { isProfessionalApproved } from "@/lib/professionalDashboard";
import { normalizePlatformRoles } from "@/lib/roles";
import type { UserProfessionInfo } from "@/types/api";

function isAllowedPendingProfessionalPath(pathname: string): boolean {
  if (pathname === "/dashboard/professional") return true;
  if (pathname === "/dashboard/profile" || pathname.startsWith("/dashboard/profile/")) return true;
  if (pathname.startsWith("/login/change-password")) return true;
  return false;
}

function decodeJwtRole(token: string): string[] {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64)) as { role?: string; roles?: string[] };
    if (Array.isArray(payload.roles) && payload.roles.length) return payload.roles;
    if (payload.role) return [payload.role];
  } catch {
    /* ignore */
  }
  return [];
}

export default function ProfessionalRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = readAccessTokenFromCookie();
    if (!token) {
      setReady(true);
      return;
    }

    const roles = normalizePlatformRoles(decodeJwtRole(token));
    if (!roles.includes("professional")) {
      setReady(true);
      return;
    }

    const allowedPath = isAllowedPendingProfessionalPath(pathname);

    fetch(`${env.apiUrl}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data ?? json;
        const professions = (data?.professions ?? []) as UserProfessionInfo[];
        const approved = isProfessionalApproved(professions);

        if (!approved) {
          if (pathname === "/dashboard") {
            router.replace("/dashboard/professional");
          } else if (!allowedPath) {
            router.replace("/dashboard/professional");
          }
        }
      })
      .finally(() => setReady(true));
  }, [pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}
