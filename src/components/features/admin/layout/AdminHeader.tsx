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
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              size="small"
              sx={{ color: "#64748b" }}
              component={Link}
              href="/admin/notifications"
              aria-label="notifications"
            >
              <Badge badgeContent={3} color="error">
                <NotificationsOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User chip */}
          <Chip
            avatar={
              <Avatar
                sx={{ bgcolor: "#2563eb", fontSize: "0.7rem", fontWeight: 700 }}
              >
                SA
              </Avatar>
            }
            label="Super Admin"
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
