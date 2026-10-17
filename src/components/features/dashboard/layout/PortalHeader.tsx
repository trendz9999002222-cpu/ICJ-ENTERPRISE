"use client";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CheckIcon from "@mui/icons-material/Check";
import DescriptionIcon from "@mui/icons-material/Description";
import GavelIcon from "@mui/icons-material/Gavel";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonIcon from "@mui/icons-material/Person";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  IconButton,
  Link as MuiLink,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  professional: "Professional Practice",
  member: "Membership",
  advocate: "Professional",
  profile: "My Profile",
  application: "Application Status",
  documents: "Documents & Vault",
  support: "Support Desk",
  "find-advocate": "Find Professionals",
  card: "Membership Card",
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

export interface ProfessionItem {
  registration_id: string;
  reference_id: string;
  profession_name: string;
  category_name?: string;
  group_name?: string;
  is_advocate?: boolean;
  status?: string;
}

export interface MembershipItem {
  application_id: string;
  reference_id: string;
  membership_id?: string | null;
  membership_type: string;
  status?: string;
  is_approved?: boolean;
}

type Props = {
  onMenuClick: () => void;
  roles: string[];
  activeRole: string;
  onRoleChange?: (role: string) => void;
  professions?: ProfessionItem[];
  activeProfession?: ProfessionItem | null;
  onSelectProfession?: (prof: ProfessionItem) => void;
  membership?: MembershipItem | null;
  userName?: string;
  userEmail?: string;
};

export default function PortalHeader({
  onMenuClick,
  roles,
  activeRole,
  onRoleChange,
  professions = [],
  activeProfession,
  onSelectProfession,
  membership,
  userName = "User",
  userEmail = "",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = buildBreadcrumbs(pathname);

  const [switcherAnchor, setSwitcherAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    document.cookie = "icj_access_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "icj_refresh_token=; path=/; max-age=0; SameSite=Lax";
    localStorage.clear();
    router.push("/login");
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  const isMemberRoute = pathname.startsWith("/dashboard/member");

  // Determine current active display label & icon
  let activeDisplayLabel = isMemberRoute || activeRole === "member" ? "ICJ Member" : "Professional Practice";
  let activeDisplayIcon = isMemberRoute || activeRole === "member" ? (
    <CardMembershipIcon fontSize="small" sx={{ color: "#16a34a" }} />
  ) : (
    <WorkspacePremiumIcon fontSize="small" sx={{ color: "#d97706" }} />
  );

  if (isMemberRoute || activeRole === "member") {
    activeDisplayLabel = "ICJ Member";
    activeDisplayIcon = <CardMembershipIcon fontSize="small" sx={{ color: "#16a34a" }} />;
  } else if (activeProfession?.profession_name) {
    activeDisplayLabel = activeProfession.profession_name;
    if (activeProfession.is_advocate || activeProfession.profession_name.toLowerCase().includes("advocate") || activeProfession.profession_name.toLowerCase().includes("lawyer")) {
      activeDisplayIcon = <GavelIcon fontSize="small" sx={{ color: "#2563eb" }} />;
    } else {
      activeDisplayIcon = <WorkspacePremiumIcon fontSize="small" sx={{ color: "#d97706" }} />;
    }
  } else if (activeRole === "professional" || activeRole === "advocate") {
    activeDisplayLabel = "Professional";
    activeDisplayIcon = <GavelIcon fontSize="small" sx={{ color: "#2563eb" }} />;
  }

  // Switcher dropdown is only active when user has registered professions to switch between
  const hasMultipleOptions = professions.length > 0;

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
        {/* Hamburger */}
        <Tooltip title="Toggle sidebar">
          <IconButton
            onClick={onMenuClick}
            size="small"
            edge="start"
            sx={{ color: "#64748b" }}
            aria-label="toggle sidebar"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Dynamic Breadcrumbs / Mobile Page Title */}
        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              display: { xs: "none", sm: "flex" },
              minWidth: 0,
              "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap", overflow: "hidden" },
              "& .MuiBreadcrumbs-separator": {
                color: "#cbd5e1",
                fontSize: "0.8rem",
              },
            }}
          >
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              return isLast ? (
                <Typography
                  key={crumb.href}
                  noWrap
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    lineHeight: 1.2,
                  }}
                >
                  {crumb.label}
                </Typography>
              ) : (
                <MuiLink
                  key={crumb.href}
                  component={Link}
                  href={crumb.href}
                  underline="hover"
                  noWrap
                  sx={{
                    fontSize: "0.875rem",
                    color: "#64748b",
                    fontWeight: 500,
                    "&:hover": { color: "#2563eb" },
                  }}
                >
                  {crumb.label}
                </MuiLink>
              );
            })}
          </Breadcrumbs>

          <Typography
            noWrap
            sx={{
              display: { xs: "block", sm: "none" },
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.2,
            }}
          >
            {crumbs[crumbs.length - 1]?.label || "Dashboard"}
          </Typography>
        </Box>

        {/* Dynamic Profession / Role Switcher */}
        {!hasMultipleOptions ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontWeight: 700,
              fontSize: "0.8125rem",
              borderRadius: "8px",
              px: 1.5,
              py: 0.6,
            }}
          >
            <CardMembershipIcon fontSize="small" sx={{ color: "#16a34a" }} />
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#166534" }}>
              ICJ Member
            </Typography>
          </Box>
        ) : (
          <Box>
            <Button
              size="small"
              onClick={(e) => setSwitcherAnchor(e.currentTarget)}
              endIcon={<ArrowDropDownIcon />}
              startIcon={activeDisplayIcon}
              sx={{
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#0f172a",
                fontWeight: 700,
                fontSize: "0.8125rem",
                textTransform: "none",
                borderRadius: "8px",
                px: 1.5,
                py: 0.6,
                maxWidth: 260,
                "&:hover": { bgcolor: "#f1f5f9", borderColor: "#cbd5e1" },
              }}
            >
              <Typography noWrap sx={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                {activeDisplayLabel}
              </Typography>
            </Button>
            <Menu
              anchorEl={switcherAnchor}
              open={Boolean(switcherAnchor)}
              onClose={() => setSwitcherAnchor(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 280,
                    maxWidth: 340,
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Switch Active Profession / Role
                </Typography>
              </Box>
              <Divider />

              {/* SECTION: REGISTERED PROFESSIONS */}
              {professions.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ px: 2, pt: 1, pb: 0.5, display: "block", color: "#94a3b8", fontWeight: 700, fontSize: "0.68rem" }}
                  >
                    REGISTERED PROFESSIONS ({professions.length})
                  </Typography>
                  {professions.map((prof) => {
                    const isSelected = !isMemberRoute && activeRole !== "member" && activeProfession?.registration_id === prof.registration_id;
                    const isAdv = prof.is_advocate || prof.profession_name.toLowerCase().includes("advocate") || prof.profession_name.toLowerCase().includes("lawyer");

                    return (
                      <MenuItem
                        key={prof.registration_id}
                        selected={isSelected}
                        onClick={() => {
                          if (onSelectProfession) onSelectProfession(prof);
                          setSwitcherAnchor(null);
                          if (onRoleChange) onRoleChange("professional");
                          router.push("/dashboard/professional");
                        }}
                        sx={{ py: 1, px: 2, gap: 1.5, alignItems: "flex-start" }}
                      >
                        <ListItemIcon sx={{ minWidth: 28, mt: 0.3 }}>
                          {isAdv ? (
                            <GavelIcon fontSize="small" sx={{ color: "#2563eb" }} />
                          ) : (
                            <WorkspacePremiumIcon fontSize="small" sx={{ color: "#d97706" }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={prof.profession_name || "Professional"}
                          secondary={
                            <Typography component="span" variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.7rem", lineHeight: 1.2 }}>
                              {prof.category_name} {prof.group_name ? `• ${prof.group_name}` : ""}
                              <br />
                              Ref: {prof.reference_id}
                            </Typography>
                          }
                          slotProps={{
                            primary: { sx: { fontSize: "0.85rem", fontWeight: isSelected ? 800 : 600, color: "#0f172a" } },
                          }}
                        />
                        {isSelected && <CheckIcon fontSize="small" color="primary" sx={{ mt: 0.5 }} />}
                      </MenuItem>
                    );
                  })}
                </Box>
              )}

              {/* SECTION: MEMBERSHIP */}
              {membership && (
                <Box>
                  <Divider sx={{ my: 0.5 }} />
                  <Typography
                    variant="caption"
                    sx={{ px: 2, pt: 1, pb: 0.5, display: "block", color: "#94a3b8", fontWeight: 700, fontSize: "0.68rem" }}
                  >
                    MEMBERSHIP
                  </Typography>
                  <MenuItem
                    selected={isMemberRoute || (activeRole === "member" && !activeProfession)}
                    onClick={() => {
                      if (onRoleChange) onRoleChange("member");
                      setSwitcherAnchor(null);
                      router.push("/dashboard/member");
                    }}
                    sx={{ py: 1, px: 2, gap: 1.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CardMembershipIcon fontSize="small" sx={{ color: "#16a34a" }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${membership.membership_type || "Standard"} Member`}
                      secondary={
                        membership.membership_id
                          ? `ID: ${membership.membership_id}`
                          : `App: ${membership.reference_id}`
                      }
                      slotProps={{
                        primary: { sx: { fontSize: "0.85rem", fontWeight: (isMemberRoute || activeRole === "member") ? 800 : 600 } },
                        secondary: { sx: { fontSize: "0.7rem", color: "#64748b" } },
                      }}
                    />
                    {(isMemberRoute || (activeRole === "member" && !activeProfession)) && (
                      <CheckIcon fontSize="small" color="success" />
                    )}
                  </MenuItem>
                </Box>
              )}
            </Menu>
          </Box>
        )}

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ color: "#64748b" }}>
            <Badge badgeContent={1} color="error" variant="dot">
              <NotificationsOutlinedIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Identity Chip */}
        <Stack
          direction="row"
          spacing={1}
          component={Link}
          href="/dashboard/profile"
          sx={{
            textDecoration: "none",
            alignItems: "center",
            py: 0.5,
            px: 1,
            borderRadius: "8px",
            "&:hover": { bgcolor: "#f8fafc" },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#2563eb",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              sx={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.2,
              }}
            >
              {userName}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "#64748b",
                lineHeight: 1,
              }}
            >
              {activeDisplayLabel}
            </Typography>
          </Box>
        </Stack>

        {/* Logout */}
        <Tooltip title="Logout">
          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{ color: "#64748b", "&:hover": { color: "#dc2626" } }}
            aria-label="Logout"
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
