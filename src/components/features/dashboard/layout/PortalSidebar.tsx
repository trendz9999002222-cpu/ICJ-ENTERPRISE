"use client";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GavelIcon from "@mui/icons-material/Gavel";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import {
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 56;

export type PortalNavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  section?: string;
  badge?: string;
};

export function getPortalNavItems(roles: string[], primaryRole: string): PortalNavItem[] {
  const allRoles = roles.length > 0 ? roles : [primaryRole];
  const hasPro = allRoles.includes("professional") || allRoles.includes("client");
  const hasMember = allRoles.includes("member");
  const hasAdvocate = allRoles.includes("advocate");

  const items: PortalNavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon fontSize="small" /> },
  ];

  // Section: Practice / Membership
  if (hasPro) {
    items.push({
      label: "Professional Practice",
      href: "/dashboard/professional",
      icon: <WorkspacePremiumIcon fontSize="small" />,
      section: "Practice",
      badge: "Pro",
    });
    items.push({
      label: "Application Status",
      href: "/dashboard/professional/application",
      icon: <DescriptionIcon fontSize="small" />,
    });
  }

  if (hasMember) {
    items.push({
      label: "Membership Card",
      href: "/dashboard/member",
      icon: <CardMembershipIcon fontSize="small" />,
      section: hasPro ? undefined : "Membership",
      badge: "Member",
    });
    items.push({
      label: "Find Advocates",
      href: "/dashboard/member/find-advocate",
      icon: <SearchIcon fontSize="small" />,
    });
  }

  if (hasAdvocate) {
    items.push({
      label: "Advocate Desk",
      href: "/dashboard/advocate",
      icon: <GavelIcon fontSize="small" />,
      section: "Legal Practice",
      badge: "Advocate",
    });
    items.push({
      label: "Advocate Profile",
      href: "/dashboard/advocate/profile",
      icon: <AccountCircleOutlinedIcon fontSize="small" />,
    });
  }

  // Section: Vault & Documents
  items.push({
    label: "Documents & Vault",
    href: hasAdvocate ? "/dashboard/advocate/documents" : "/dashboard/member/documents",
    icon: <FolderOpenIcon fontSize="small" />,
    section: "Documents",
  });

  // Section: Account & Security
  items.push({
    label: "My Profile & Edit",
    href: "/dashboard/profile",
    icon: <PersonIcon fontSize="small" />,
    section: "Account",

  });
  items.push({
    label: "Change Password",
    href: "/login/change-password",
    icon: <LockOutlinedIcon fontSize="small" />,
  });
  items.push({
    label: "Support Desk",
    href: hasAdvocate ? "/dashboard/advocate/support" : "/dashboard/member/support",
    icon: <SupportAgentIcon fontSize="small" />,
  });

  return items;
}

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  open: boolean;
  onClose: () => void;
  variant?: "permanent" | "persistent" | "temporary";
  roles: string[];
  primaryRole: string;
  userName?: string;
  userEmail?: string;
};

export default function PortalSidebar({
  open,
  onClose,
  variant = "persistent",
  roles,
  primaryRole,
  userName = "User",
  userEmail = "",
}: Props) {
  const pathname = usePathname();
  const collapsed = !open && variant === "persistent";
  const navItems = getPortalNavItems(roles, primaryRole);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#ffffff",
        overflowX: "hidden",
      }}
    >
      {/* Brand header */}
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          px: collapsed ? 1.5 : 2.5,
          borderBottom: "1px solid #e2e8f0",
          justifyContent: collapsed ? "center" : "space-between",
          flexShrink: 0,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 12,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "8px",
              bgcolor: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              flexShrink: 0,
              boxShadow: "0 2px 4px rgba(37,99,235,0.3)",
            }}
          >
            <GavelIcon sx={{ fontSize: 18 }} />
          </Box>
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "0.8125rem",
                  color: "#0f172a",
                  lineHeight: 1.2,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}
              >
                ICJ Enterprise
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: "#64748b",
                  fontWeight: 600,
                  lineHeight: 1,
                  mt: 0.2,
                }}
              >
                Member & Pro Portal
              </Typography>
            </Box>
          )}
        </Link>

        {variant === "persistent" && !collapsed && (
          <Tooltip title="Collapse sidebar">
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: "#94a3b8", "&:hover": { color: "#0f172a" } }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Nav list */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          py: 1,
          px: collapsed ? 0.75 : 1.5,
        }}
      >
        <List disablePadding>
          {navItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);

            return (
              <Box key={item.href}>
                {item.section && !collapsed && (
                  <Typography
                    sx={{
                      px: 1.5,
                      pt: 2,
                      pb: 0.5,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#94a3b8",
                    }}
                  >
                    {item.section}
                  </Typography>
                )}
                <Tooltip
                  title={collapsed ? item.label : ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={active}
                    onClick={variant === "temporary" ? onClose : undefined}
                    sx={{
                      minHeight: 38,
                      borderRadius: "8px",
                      px: collapsed ? 1.5 : 1.5,
                      py: 0.75,
                      mb: 0.3,
                      justifyContent: collapsed ? "center" : "flex-start",
                      color: active ? "#2563eb" : "#475569",
                      bgcolor: active ? "#eff6ff !important" : "transparent",
                      "&:hover": {
                        bgcolor: active ? "#eff6ff" : "#f8fafc",
                        color: active ? "#2563eb" : "#0f172a",
                      },
                      "&.Mui-selected": {
                        bgcolor: "#eff6ff",
                        "&:hover": { bgcolor: "#eff6ff" },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? "auto" : 32,
                        color: active ? "#2563eb" : "#64748b",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={item.label}
                          slotProps={{
                            primary: {
                              sx: {
                                fontSize: "0.8125rem",
                                fontWeight: active ? 700 : 500,
                                lineHeight: 1.3,
                                color: active ? "#2563eb" : "inherit",
                              },
                            },
                          }}
                        />

                        {item.badge && (
                          <Chip
                            label={item.badge}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              bgcolor: active ? "#dbeafe" : "#f1f5f9",
                              color: active ? "#1d4ed8" : "#64748b",
                              border: "none",
                            }}
                          />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
              </Box>
            );
          })}
        </List>
      </Box>

      {/* Footer User Info */}
      <Divider sx={{ borderColor: "#e2e8f0" }} />
      <Box
        sx={{
          p: collapsed ? 1 : 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: "#2563eb",
            fontSize: "0.75rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>
        {!collapsed && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8rem", lineHeight: 1.2 }}
            >
              {userName}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: "#64748b", fontSize: "0.68rem", display: "block" }}
            >
              {userEmail}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Expand button when collapsed */}
      {variant === "persistent" && collapsed && (
        <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: "#94a3b8", "&:hover": { color: "#0f172a" } }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );

  if (variant === "temporary") {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            borderRight: "1px solid #e2e8f0",
            boxSizing: "border-box",
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width,
          borderRight: "1px solid #e2e8f0",
          boxSizing: "border-box",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          overflowX: "hidden",
        },
      }}
    >
      {content}
    </Drawer>
  );
}
