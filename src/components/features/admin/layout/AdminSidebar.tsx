"use client";

import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CampaignIcon from "@mui/icons-material/Campaign";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import EventIcon from "@mui/icons-material/Event";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GavelIcon from "@mui/icons-material/Gavel";
import HandshakeIcon from "@mui/icons-material/Handshake";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import SettingsIcon from "@mui/icons-material/Settings";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SummarizeIcon from "@mui/icons-material/Summarize";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 56;

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  section?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <DashboardIcon fontSize="small" /> },
  { label: "Users", href: "/admin/users", icon: <PeopleAltIcon fontSize="small" />, section: "People" },
  { label: "Advocates", href: "/admin/advocates", icon: <GavelIcon fontSize="small" /> },
  { label: "KYC Verification", href: "/admin/kyc", icon: <AssignmentIndIcon fontSize="small" /> },
  { label: "Cases", href: "/admin/cases", icon: <FolderOpenIcon fontSize="small" />, section: "Legal" },
  { label: "Assistance", href: "/admin/assistance", icon: <SupportAgentIcon fontSize="small" /> },
  { label: "Documents", href: "/admin/documents", icon: <DescriptionIcon fontSize="small" /> },
  { label: "Appointments", href: "/admin/appointments", icon: <CalendarMonthIcon fontSize="small" />, section: "Operations" },
  { label: "Services", href: "/admin/services", icon: <HandshakeIcon fontSize="small" /> },
  {
    label: "Professional Onboarding",
    href: "/admin/practice-areas",
    icon: <LibraryBooksIcon fontSize="small" />,
  },
  { label: "Content", href: "/admin/content", icon: <CampaignIcon fontSize="small" />, section: "Platform" },
  { label: "Research", href: "/admin/research", icon: <LocalLibraryIcon fontSize="small" /> },
  { label: "Events", href: "/admin/events", icon: <EventIcon fontSize="small" /> },
  { label: "Memberships", href: "/admin/memberships", icon: <CardMembershipIcon fontSize="small" /> },
  { label: "Grievances", href: "/admin/grievances", icon: <ReportProblemIcon fontSize="small" />, section: "Support" },
  { label: "Notifications", href: "/admin/notifications", icon: <NotificationsIcon fontSize="small" /> },
  { label: "Reports", href: "/admin/reports", icon: <SummarizeIcon fontSize="small" />, section: "Admin" },
  { label: "Settings", href: "/admin/settings", icon: <SettingsIcon fontSize="small" /> },
];

// ---------------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  variant?: "persistent" | "temporary";
};

function SidebarContent({ open: expanded, onToggle }: { open: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const collapsed = !expanded;

  return (
    <Box
      sx={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        transition: "width 0.2s ease",
        overflow: "hidden",
      }}
    >
      {/* Brand header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 0 : 2,
          py: 1.5,
          minHeight: 56,
          borderBottom: "1px solid #e2e8f0",
          bgcolor: "#f8fafc",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                bgcolor: "#2563eb",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <GavelIcon sx={{ color: "#fff", fontSize: 16 }} />
            </Box>
            <Box>
              <Typography
                sx={{ color: "#94a3b8", fontWeight: 700, letterSpacing: 1.2, fontSize: "0.6rem", lineHeight: 1 }}
              >
                ICJ ENTERPRISE
              </Typography>
              <Typography
                sx={{ color: "#2563eb", fontWeight: 800, fontSize: "0.7rem", letterSpacing: 0.3 }}
              >
                Admin Portal
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && (
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              bgcolor: "#2563eb",
              display: "grid",
              placeItems: "center",
            }}
          >
            <GavelIcon sx={{ color: "#fff", fontSize: 16 }} />
          </Box>
        )}
        {!collapsed && (
          <Tooltip title="Collapse">
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{ color: "#94a3b8", "&:hover": { color: "#475569", bgcolor: "#f1f5f9" } }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Expand button when collapsed */}
      {collapsed && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1, borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{ color: "#94a3b8", "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" } }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Navigation — scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          pb: 2,
          // Custom scrollbar
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 2 },
          "&::-webkit-scrollbar-thumb:hover": { bgcolor: "#94a3b8" },
        }}
      >
        <List dense disablePadding sx={{ pt: 0.5 }}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Box key={item.href}>
                {/* Section label */}
                {item.section && !collapsed && (
                  <Typography
                    sx={{
                      color: "#94a3b8",
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      px: 2,
                      pt: 1.5,
                      pb: 0.25,
                      fontSize: "0.6rem",
                      textTransform: "uppercase",
                      display: "block",
                    }}
                  >
                    {item.section}
                  </Typography>
                )}
                {item.section && collapsed && (
                  <Divider sx={{ mx: 1, my: 0.75, borderColor: "#f1f5f9" }} />
                )}

                <Tooltip title={collapsed ? item.label : ""} placement="right" arrow>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={isActive}
                    sx={{
                      mx: 0.75,
                      mb: 0.25,
                      borderRadius: "8px",
                      minHeight: 36,
                      px: collapsed ? 0 : 1.25,
                      justifyContent: collapsed ? "center" : "flex-start",
                      color: isActive ? "#1d4ed8" : "#64748b",
                      bgcolor: isActive ? "#eff6ff" : "transparent",
                      border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
                      "&:hover": {
                        bgcolor: isActive ? "#dbeafe" : "#f8fafc",
                        color: isActive ? "#1d4ed8" : "#334155",
                        borderColor: isActive ? "#93c5fd" : "#e2e8f0",
                      },
                      "&.Mui-selected": {
                        bgcolor: "#eff6ff",
                        "&:hover": { bgcolor: "#dbeafe" },
                      },
                      transition: "all 0.12s ease",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: "inherit",
                        minWidth: collapsed ? 0 : 30,
                        "& svg": { fontSize: 17 },
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        slotProps={{
                          primary: {
                            sx: {
                              fontSize: "0.8125rem",
                              fontWeight: isActive ? 700 : 500,
                              lineHeight: 1.2,
                            },
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </Box>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------

export default function AdminSidebar({ open, onClose, variant = "persistent" }: Props) {
  if (variant === "temporary") {
    return (
      <Drawer
        open={open}
        onClose={onClose}
        variant="temporary"
        slotProps={{
          paper: { sx: { border: "none", width: SIDEBAR_WIDTH } },
        }}
      >
        <SidebarContent open={true} onToggle={onClose} />
      </Drawer>
    );
  }

  return (
    <Box
      component="nav"
      sx={{
        width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        flexShrink: 0,
        transition: "width 0.2s ease",
        height: "100vh",
        position: "sticky",
        top: 0,
        bgcolor: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      <SidebarContent open={open} onToggle={onClose} />
    </Box>
  );
}
