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
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  Avatar,
  Box,
  Chip,
  Collapse,
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
import { useMemo, useState, useEffect, type ReactNode } from "react";

import { MEMBER_CHANGE_PASSWORD_QUERY } from "@/lib/memberDashboard";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { normalizePlatformRoles } from "@/lib/roles";

export const DEFAULT_SIDEBAR_WIDTH = 275;
export const MIN_SIDEBAR_WIDTH = 220;
export const MAX_SIDEBAR_WIDTH = 480;
export const SIDEBAR_WIDTH = DEFAULT_SIDEBAR_WIDTH;
export const SIDEBAR_COLLAPSED_WIDTH = 56;

export type PortalNavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  section?: string;
  badge?: string;
};

export function getMemberChildNavItems(): PortalNavItem[] {
  return [
    {
      label: "Find Advocates & Experts",
      href: "/dashboard/member/find-advocate",
      icon: <SearchIcon fontSize="small" />,
      section: "Services",
    },
    {
      label: "Documents & Vault",
      href: "/dashboard/member/documents",
      icon: <FolderOpenIcon fontSize="small" />,
      section: "Documents",
    },
    {
      label: "Donate to Trust",
      href: "/dashboard/donations",
      icon: <VolunteerActivismIcon fontSize="small" />,
      section: "Trust & Giving",
    },
    {
      label: "My Profile & Edit",
      href: "/dashboard/profile",
      icon: <PersonIcon fontSize="small" />,
      section: "Account",
    },
    {
      label: "Change Password",
      href: "/dashboard/change-password",
      icon: <LockOutlinedIcon fontSize="small" />,
    },
  ];
}

export function getProChildNavItems(options?: { activeProfessionName?: string }): PortalNavItem[] {
  const proTitle = options?.activeProfessionName
    ? `${options.activeProfessionName} Dashboard`
    : "Legal Professional Dashboard";

  return [
    {
      label: proTitle,
      href: "/dashboard/professional",
      icon: <DashboardIcon fontSize="small" />,
    },
    {
      label: "Register New Practice",
      href: "/dashboard/professional/register",
      icon: <WorkspacePremiumIcon fontSize="small" />,
      section: "Practice",
    },
    {
      label: "Lead Marketplace",
      href: "/dashboard/professional/leads",
      icon: <StorefrontIcon fontSize="small" />,
      section: "Leads & Marketplace",
    },
    {
      label: "My Leads",
      href: "/dashboard/professional/my-leads",
      icon: <ContactPhoneIcon fontSize="small" />,
    },
    {
      label: "ICJ Wallet",
      href: "/dashboard/professional/wallet",
      icon: <AccountBalanceWalletIcon fontSize="small" />,
    },
    {
      label: "Lead Credit Plans",
      href: "/dashboard/professional/plans",
      icon: <LoyaltyIcon fontSize="small" />,
    },
    {
      label: "Payment History",
      href: "/dashboard/professional/payments",
      icon: <ReceiptLongIcon fontSize="small" />,
    },
    {
      label: "Donate to Trust",
      href: "/dashboard/donations",
      icon: <VolunteerActivismIcon fontSize="small" />,
      section: "Trust & Giving",
    },
    {
      label: "My Profile & Edit",
      href: "/dashboard/profile",
      icon: <PersonIcon fontSize="small" />,
      section: "Account",
    },
    {
      label: "Change Password",
      href: "/dashboard/change-password",
      icon: <LockOutlinedIcon fontSize="small" />,
    },
  ];
}

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
  const hasPro = hasProfessions || allRoles.includes("professional");

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
 
  // Section: Trust & Giving
  items.push({
    label: "Donate to Trust",
    href: "/dashboard/donations",
    icon: <VolunteerActivismIcon fontSize="small" />,
    section: "Trust & Giving",
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
  profilePictureUrl?: string | null;
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
  profilePictureUrl,
}: Props) {
  const pathname = usePathname();
  const collapsed = !open && variant === "persistent";

  const allRoles = normalizePlatformRoles(roles.length > 0 ? roles : [primaryRole]);
  const hasMember = allRoles.includes("member");
  const hasPro = hasProfessions || allRoles.includes("professional");
  const hasDualRole = hasMember && hasPro;

  const isMemberPath = pathname.startsWith("/dashboard/member");
  const isProPath = pathname.startsWith("/dashboard/professional");

  const [memberExpanded, setMemberExpanded] = useState<boolean>(false);
  const [proExpanded, setProExpanded] = useState<boolean>(false);

  // Dynamic sidebar width for dragging and text visibility
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("icj_sidebar_width");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
          setSidebarWidth(parsed);
        }
      }
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startW = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const nextWidth = Math.min(Math.max(startW + deltaX, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
      setSidebarWidth(nextWidth);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsResizing(false);
      const deltaX = upEvent.clientX - startX;
      const finalWidth = Math.min(Math.max(startW + deltaX, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
      setSidebarWidth(finalWidth);
      if (typeof window !== "undefined") {
        localStorage.setItem("icj_sidebar_width", String(finalWidth));
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClickResizer = () => {
    setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    if (typeof window !== "undefined") {
      localStorage.setItem("icj_sidebar_width", String(DEFAULT_SIDEBAR_WIDTH));
    }
  };

  const memberSubItems = useMemo(() => getMemberChildNavItems(), []);
  const proSubItems = useMemo(() => getProChildNavItems({ activeProfessionName }), [activeProfessionName]);

  const navItems = getPortalNavItems(roles, primaryRole, {
    memberApproved,
    professionalApproved,
    activeRole: activeRole ?? primaryRole,
    pathname,
    hasProfessions,
    activeProfessionName,
  });

  const renderNavItemsList = (items: PortalNavItem[], subIndent = false) => {
    return items.map((item) => {
      const active = isNavItemActive(pathname, item.href);

      return (
        <Box key={item.href + item.label}>
          {item.section && !collapsed && (
            <Typography
              sx={{
                px: subIndent ? 2 : 1.5,
                pt: 1.5,
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
          <Tooltip title={collapsed ? item.label : ""} placement="right" arrow>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={active}
              onClick={variant === "temporary" ? onClose : undefined}
              sx={{
                minHeight: 38,
                borderRadius: "8px",
                px: collapsed ? 1.5 : subIndent ? 2 : 1.5,
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
                  minWidth: collapsed ? "auto" : 30,
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
    });
  };

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
          {/* ─── 1. MEMBER DASHBOARD ACCORDION ─── */}
          {hasMember && (
            <Box sx={{ mb: 0.75 }}>
              <Tooltip title={collapsed ? "Member Dashboard" : ""} placement="right" arrow>
                <ListItemButton
                  component={isMemberPath ? "div" : Link}
                  href={isMemberPath ? undefined : "/dashboard/member"}
                  selected={isMemberPath}
                  onClick={() => {
                    if (variant === "temporary") onClose();
                    setMemberExpanded((p) => !p);
                  }}
                  sx={{
                    minHeight: 40,
                    borderRadius: "8px",
                    px: collapsed ? 1.5 : 1.5,
                    py: 0.75,
                    mb: 0.4,
                    cursor: "pointer",
                    justifyContent: collapsed ? "center" : "space-between",
                    color: isMemberPath ? "#1d4ed8" : "#334155",
                    bgcolor: isMemberPath ? "#eff6ff !important" : "transparent",
                    border: isMemberPath ? "1.5px solid #bfdbfe" : "1.5px solid transparent",
                    "&:hover": {
                      bgcolor: isMemberPath ? "#eff6ff" : "#f8fafc",
                      color: "#1d4ed8",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0, flex: 1, mr: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: collapsed ? "auto" : 28, color: isMemberPath ? "#2563eb" : "#64748b", justifyContent: "center" }}>
                      <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary="Member Dashboard"
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: "0.825rem",
                              fontWeight: isMemberPath ? 800 : 700,
                              color: isMemberPath ? "#1d4ed8" : "#1e293b",
                              whiteSpace: "nowrap",
                            },
                          },
                        }}
                      />
                    )}
                  </Box>
                  {!collapsed && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMemberExpanded((p) => !p);
                      }}
                      sx={{
                        p: 0.3,
                        color: isMemberPath ? "#2563eb" : "#64748b",
                        transform: memberExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease-in-out",
                      }}
                    >
                      <ExpandMoreIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItemButton>
              </Tooltip>

              <Collapse in={!collapsed && memberExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 0.5 }}>
                  {renderNavItemsList(memberSubItems, true)}
                </Box>
              </Collapse>
            </Box>
          )}

          {/* ─── 2. LEGAL PROFESSIONAL ACCORDION ─── */}
          {hasPro && (
            <Box sx={{ mb: 0.75 }}>
              <Tooltip title={collapsed ? "Legal Professional" : ""} placement="right" arrow>
                <ListItemButton
                  selected={isProPath}
                  onClick={() => {
                    if (variant === "temporary") onClose();
                    setProExpanded((p) => !p);
                  }}
                  sx={{
                    minHeight: 40,
                    borderRadius: "8px",
                    px: collapsed ? 1.5 : 1.5,
                    py: 0.75,
                    mb: 0.4,
                    cursor: "pointer",
                    justifyContent: collapsed ? "center" : "space-between",
                    color: isProPath ? "#1d4ed8" : "#334155",
                    bgcolor: isProPath ? "#eff6ff !important" : "transparent",
                    border: isProPath ? "1.5px solid #bfdbfe" : "1.5px solid transparent",
                    "&:hover": {
                      bgcolor: isProPath ? "#eff6ff" : "#f8fafc",
                      color: "#1d4ed8",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1, mr: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: collapsed ? "auto" : 26, color: isProPath ? "#2563eb" : "#64748b", justifyContent: "center" }}>
                      <GavelIcon fontSize="small" />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary="Legal Professional"
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: "0.825rem",
                              fontWeight: isProPath ? 800 : 700,
                              color: isProPath ? "#1d4ed8" : "#1e293b",
                              whiteSpace: "nowrap",
                            },
                          },
                        }}
                      />
                    )}
                  </Box>
                  {!collapsed && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, flexShrink: 0 }}>
                      <Chip
                        label="Empaneled"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.58rem",
                          fontWeight: 800,
                          bgcolor: "#dcfce7",
                          color: "#15803d",
                          border: "1px solid #bbf7d0",
                          px: 0.3,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setProExpanded((p) => !p);
                        }}
                        sx={{
                          p: 0.3,
                          color: isProPath ? "#2563eb" : "#64748b",
                          transform: proExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease-in-out",
                        }}
                      >
                        <ExpandMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </ListItemButton>
              </Tooltip>

              <Collapse in={!collapsed && proExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 0.5 }}>
                  {renderNavItemsList(proSubItems, true)}
                </Box>
              </Collapse>
            </Box>
          )}

          {/* Fallback if user has neither */}
          {!hasMember && !hasPro && renderNavItemsList(navItems)}
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
          src={resolveMediaUrl(profilePictureUrl) || undefined}
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
            width: Math.min(sidebarWidth, 320),
            borderRight: "1px solid #e2e8f0",
            boxSizing: "border-box",
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : sidebarWidth;

  return (
    <Box
      component="nav"
      sx={{
        width,
        flexShrink: 0,
        transition: isResizing ? "none" : "width 0.2s ease",
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

      {/* Draggable resize handle on right border */}
      {variant === "persistent" && !collapsed && (
        <Box
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClickResizer}
          title="Drag to resize sidebar (Double-click to reset)"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "8px",
            cursor: "col-resize",
            zIndex: 30,
            userSelect: "none",
            touchAction: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.15s ease",
            bgcolor: isResizing ? "rgba(37, 99, 235, 0.25)" : "transparent",
            "&:hover": {
              bgcolor: "rgba(59, 130, 246, 0.2)",
              "& .resizer-bar": {
                bgcolor: "#2563eb",
                opacity: 1,
                transform: "scaleY(1.2)",
              },
            },
          }}
        >
          {/* Subtle grab bar indicator */}
          <Box
            className="resizer-bar"
            sx={{
              width: "2.5px",
              height: "36px",
              borderRadius: "2px",
              bgcolor: isResizing ? "#2563eb" : "#cbd5e1",
              opacity: isResizing ? 1 : 0.6,
              transition: "all 0.15s ease",
            }}
          />
        </Box>
      )}
    </Box>
  );
}
