"use client";

import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GavelIcon from "@mui/icons-material/Gavel";
import GroupsIcon from "@mui/icons-material/Groups";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";

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
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { MEMBER_CHANGE_PASSWORD_QUERY } from "@/lib/memberDashboard";
import { normalizePlatformRoles } from "@/lib/roles";

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 56;

export type PortalNavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  section?: string;
  badge?: string;
};

export function getPortalNavItems(
  roles: string[],
  primaryRole: string,
  options?: {
    memberApproved?: boolean;
    professionalApproved?: boolean;
    activeRole?: string;
    pathname?: string;
    hasProfessions?: boolean;
    activeProfessionName?: string;
  },
): PortalNavItem[] {
  const path = options?.pathname ?? "";
  const isMemberPath = path.startsWith("/dashboard/member");
  const isProPath = path.startsWith("/dashboard/professional");

  const hasProfessions = options?.hasProfessions ?? false;
  const allRoles = normalizePlatformRoles(roles.length > 0 ? roles : [primaryRole]);
  const hasMember = allRoles.includes("member");
  // User only has professional capability if they have registered profession(s)
  const hasPro = hasProfessions;

  const resolvedRole = isMemberPath
    ? "member"
    : isProPath
      ? (hasProfessions ? "professional" : "member")
      : (hasProfessions ? (options?.activeRole ?? "member") : "member");

  const isMemberMode = resolvedRole === "member";

  const items: PortalNavItem[] = [];

  // --- MEMBER MODE ---
  if (isMemberMode) {
    items.push({
      label: "Member Dashboard",
      href: "/dashboard/member",
      icon: <DashboardIcon fontSize="small" />,
    });
    items.push({
      label: "Find Advocates & Experts",
      href: "/dashboard/member/find-advocate",
      icon: <SearchIcon fontSize="small" />,
      section: "Services",
    });
    items.push({
      label: "Documents & Vault",
      href: "/dashboard/member/documents",
      icon: <FolderOpenIcon fontSize="small" />,
      section: "Documents",
    });
    if (hasPro) {
      items.push({
        label: options?.activeProfessionName ? `Go to ${options.activeProfessionName}` : "Go to Professional Portal",
        href: "/dashboard/professional",
        icon: <WorkspacePremiumIcon fontSize="small" />,
        section: "Switch Portal",
        badge: "Pro",
      });
    }
  } else {
    // --- PROFESSIONAL MODE ---
    const proTitle = options?.activeProfessionName
      ? `${options.activeProfessionName} Dashboard`
      : "Professional Dashboard";

    items.push({
      label: proTitle,
      href: "/dashboard/professional",
      icon: <DashboardIcon fontSize="small" />,
    });
    items.push({
      label: "Register New Practice",
      href: "/dashboard/professional/register",
      icon: <WorkspacePremiumIcon fontSize="small" />,
      section: "Practice",
    });
    items.push({
      label: "Lead Marketplace",
      href: "/dashboard/professional/leads",
      icon: <StorefrontIcon fontSize="small" />,
      section: "Leads & Marketplace",
    });
    items.push({
      label: "My Leads",
      href: "/dashboard/professional/my-leads",
      icon: <ContactPhoneIcon fontSize="small" />,
    });
    items.push({
      label: "ICJ Wallet",
      href: "/dashboard/professional/wallet",
      icon: <AccountBalanceWalletIcon fontSize="small" />,
    });
    items.push({
      label: "Lead Credit Plans",
      href: "/dashboard/professional/plans",
      icon: <LoyaltyIcon fontSize="small" />,
    });
    items.push({
      label: "Payment History",
      href: "/dashboard/professional/payments",
      icon: <ReceiptLongIcon fontSize="small" />,
    });

    if (hasMember) {
      items.push({
        label: "Go to Member Portal",
        href: "/dashboard/member",
        icon: <CardMembershipIcon fontSize="small" />,
        section: "Switch Portal",
        badge: "Member",
      });
    }
  }

  // Section: Account & Security
  items.push({
    label: "My Profile & Edit",
    href: "/dashboard/profile",
    icon: <PersonIcon fontSize="small" />,
    section: "Account",
  });
  items.push({
    label: "Change Password",
    href: "/dashboard/change-password",
    icon: <LockOutlinedIcon fontSize="small" />,
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
  memberApproved?: boolean;
  professionalApproved?: boolean;
  activeRole?: string;
  userName?: string;
  userEmail?: string;
  hasProfessions?: boolean;
  activeProfessionName?: string;
};

export default function PortalSidebar({
  open,
  onClose,
  variant = "persistent",
  roles,
  primaryRole,
  memberApproved = true,
  professionalApproved = true,
  activeRole,
  userName = "User",
  userEmail = "",
  hasProfessions = false,
  activeProfessionName,
}: Props) {
  const pathname = usePathname();
  const collapsed = !open && variant === "persistent";
  const navItems = getPortalNavItems(roles, primaryRole, {
    memberApproved,
    professionalApproved,
    activeRole: activeRole ?? primaryRole,
    pathname,
    hasProfessions,
    activeProfessionName,
  });

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
              width: 36,
              height: 36,
              borderRadius: "50%",
              overflow: "hidden",
              bgcolor: "#ffffff",
              border: "1.5px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 5px rgba(15,23,42,0.08)",
              p: 0.3,
            }}
          >
            <Image
              src="/images/icj-logo.png"
              alt="ICJ Brand Logo"
              width={34}
              height={34}
              priority
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }}
            />
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

        {!collapsed && (
          <Tooltip title={variant === "temporary" ? "Close sidebar" : "Collapse sidebar"}>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: "#64748b",
                bgcolor: "#f1f5f9",
                borderRadius: "8px",
                width: 32,
                height: 32,
                "&:hover": { color: "#0f172a", bgcolor: "#e2e8f0" },
              }}
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
    <Box
      component="nav"
      sx={{
        width,
        flexShrink: 0,
        transition: "width 0.2s ease",
        height: "100vh",
        position: "sticky",
        top: 0,
        bgcolor: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {content}
    </Box>
  );
}
