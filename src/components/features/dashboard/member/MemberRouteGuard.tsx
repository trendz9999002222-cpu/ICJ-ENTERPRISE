"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { env } from "@/config/env";
import { readAccessTokenFromCookie } from "@/lib/api/client";
import { normalizePlatformRoles } from "@/lib/roles";

function isAllowedPendingMemberPath(pathname: string): boolean {
  if (pathname === "/dashboard/member") return true;
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

export default function MemberRouteGuard({ children }: { children: React.ReactNode }) {
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
    if (!roles.includes("member")) {
      setReady(true);
      return;
    }

    const allowedPath = isAllowedPendingMemberPath(pathname);

    fetch(`${env.apiUrl}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const membership = json?.data?.membership ?? json?.membership;
        const approved =
          membership?.status === "approved" || membership?.is_approved === true;

        if (!approved && !allowedPath) {
          router.replace("/dashboard/member");
        }
      })
      .finally(() => setReady(true));
  }, [pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}
