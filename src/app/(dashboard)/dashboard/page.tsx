"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { normalizePlatformRole } from "@/lib/roles";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

export default function RootDashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    const token = readCookie("icj_access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const payload = decodeJwt(token);
    if (!payload) {
      router.replace("/login");
      return;
    }

    if (payload.role === "admin" || payload.role === "super_admin") {
      router.replace("/dashboard/admin");
      return;
    }

    let roles: string[] = [];
    if (Array.isArray(payload.roles) && payload.roles.length) {
      roles = payload.roles as string[];
    } else if (payload.role) {
      roles = [String(payload.role)];
    }

    if (roles.includes("professional")) {
      router.replace("/dashboard/professional");
    } else {
      router.replace("/dashboard/member");
    }
  }, [router]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        gap: 2,
      }}
    >
      <CircularProgress size={36} />
      <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
        Loading your workspace…
      </Typography>
    </Box>
  );
}
