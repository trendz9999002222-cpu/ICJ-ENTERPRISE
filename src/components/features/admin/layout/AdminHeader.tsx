"use client";

import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Chip,
  IconButton,
  Link as MuiLink,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { env } from "@/config/env";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import NotificationBellMenu from "@/components/features/notifications/NotificationBellMenu";

// ---------------------------------------------------------------------------
// Build breadcrumbs from the current URL path
// ---------------------------------------------------------------------------

const LABEL_MAP: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  users: "Users",
  advocates: "Advocates",
  kyc: "KYC Verification",
  cases: "Cases",
  assistance: "Assistance",
  documents: "Documents",
  appointments: "Appointments",
  services: "Services",
  "practice-areas": "Practice Areas",
  content: "Content",
  research: "Research",
  events: "Events",
  memberships: "Memberships",
  professionals: "Professionals",
  "professional-onboarding": "Member & Professional Onboarding",
  categories: "Wings (Categories)",
  "profession-fields": "Wing Fields",
  "form-builder": "Form Builder",
  applications: "Applications",
  grievances: "Grievances",
  notifications: "Notifications",
  reports: "Reports",
  settings: "Settings",
};

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let href = "";
  for (const seg of segments) {
    href += `/${seg}`;
    crumbs.push({ label: LABEL_MAP[seg] ?? seg, href });
  }
  return crumbs;
}

// ---------------------------------------------------------------------------

type Props = {
  onMenuClick: () => void;
};

export default function AdminHeader({ onMenuClick }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = buildBreadcrumbs(pathname);

  const [adminName, setAdminName] = useState("Super Admin");
  const [adminAvatarUrl, setAdminAvatarUrl] = useState<string | null>(null);
  const [adminInitials, setAdminInitials] = useState("SA");

  useEffect(() => {
    function readCookie(name: string): string | null {
      if (typeof document === "undefined") return null;
      const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
      return m ? decodeURIComponent(m[1]) : null;
    }
    const token = readCookie("icj_access_token");
    if (!token) return;

    fetch(`${env.apiUrl}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data ?? json;
        if (data?.first_name || data?.last_name) {
          const full = `${data.first_name || ""} ${data.last_name || ""}`.trim();
          if (full) {
            setAdminName(full);
            const inits = full
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            if (inits) setAdminInitials(inits);
          }
        } else if (data?.username) {
          setAdminName(data.username);
          setAdminInitials(data.username.slice(0, 2).toUpperCase());
        }
        if (data?.profile_picture_url) {
          setAdminAvatarUrl(data.profile_picture_url);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    document.cookie =
      "icj_access_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie =
      "icj_refresh_token=; path=/; max-age=0; SameSite=Lax";
    router.push("/login");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        color: "#0f172a",
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 56, sm: 64 } }}>
        {/* Hamburger — visible on mobile / to expand collapsed sidebar */}
        <Tooltip title="Toggle sidebar">
          <IconButton
            onClick={onMenuClick}
            size="small"
            edge="start"
            sx={{ color: "#64748b" }}
            aria-label="toggle sidebar"
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>

        {/* Breadcrumbs */}
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            flex: 1,
            "& .MuiBreadcrumbs-separator": { color: "#cbd5e1" },
          }}
        >
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return isLast ? (
              <Typography
                key={crumb.href}
                variant="body2"
                sx={{ fontWeight: 700, color: "#0f172a" }}
              >
                {crumb.label}
              </Typography>
            ) : (
              <MuiLink
                key={crumb.href}
                component={Link}
                href={crumb.href}
                underline="hover"
                sx={{ color: "#64748b", fontSize: "0.8125rem", fontWeight: 500 }}
              >
                {crumb.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>

        {/* Right-side actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Enterprise Live Notifications */}
          <NotificationBellMenu isAdmin={true} />

          {/* User chip */}
          <Chip
            avatar={
              <Avatar
                src={resolveMediaUrl(adminAvatarUrl) || undefined}
                sx={{ bgcolor: "#2563eb", fontSize: "0.7rem", fontWeight: 700 }}
              >
                {adminInitials}
              </Avatar>
            }
            label={adminName}
            size="small"
            variant="outlined"
            sx={{
              borderColor: "#e2e8f0",
              color: "#0f172a",
              fontWeight: 600,
              fontSize: "0.75rem",
              display: { xs: "none", sm: "flex" },
            }}
          />

          {/* Logout */}
          <Tooltip title="Sign out">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ color: "#64748b" }}
              aria-label="sign out"
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
