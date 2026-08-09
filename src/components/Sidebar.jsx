import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
} from "@mui/material";

import {
  Dashboard,
  Groups,
  Gavel,
  Folder,
  SmartToy,
  Science,
  AccountBalanceWallet,
  Settings,
  AdminPanelSettings,
  Assessment,
  Storage,
  VerifiedUser,
  Api,
  CloudUpload,
  MonitorHeart,
  Badge,
  HowToReg,
  Savings,
  History,
  Notifications,
  ReceiptLong,
  LocationOn,
  Lock,
} from "@mui/icons-material";

import Navigation from "../core/navigation";
import useAuth from "../hooks/useAuth";

const drawerWidth = 270;

const iconMap = {
  dashboard: <Dashboard />,
  groups: <Groups />,
  badge: <Badge />,
  how_to_reg: <HowToReg />,
  gavel: <Gavel />,
  folder: <Folder />,
  smart_toy: <SmartToy />,
  science: <Science />,
  account_balance_wallet: <AccountBalanceWallet />,
  receipt_long: <ReceiptLong />,
  savings: <Savings />,
  admin_panel_settings: <AdminPanelSettings />,
  verified_user: <VerifiedUser />,
  location_on: <LocationOn />,
  storage: <Storage />,
  api: <Api />,
  cloud_upload: <CloudUpload />,
  monitor_heart: <MonitorHeart />,
  assessment: <Assessment />,
  history: <History />,
  settings: <Settings />,
  notifications: <Notifications />,
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const role = String(user?.role || "member").toLowerCase();

  const allowedByRole = {
    admin: new Set(Navigation.map((item) => item.id)),
    employee: new Set([
      "dashboard",
      "membership",
      "member-directory",
      "member-verification",
      "member-profile",
      "legal",
      "advocate-dashboard",
      "client-portal",
      "court-calendar",
      "ai-drafter",
      "ai",
      "billing",
      "finance",
      "payment-management",
      "token",
      "documents",
      "research",
      "notifications",
      "reports",
      "activity-log",
      "settings",
    ]),
    member: new Set([
      "dashboard",
      "member-profile",
      "client-portal",
      "court-calendar",
      "ai-drafter",
      "ai",
      "documents",
      "finance",
      "notifications",
    ]),
  };

  const visibleNavigation = Navigation.filter((item) =>
    (allowedByRole[role] || allowedByRole.member).has(item.id)
  );

  const groupAModules = visibleNavigation.filter((item) => item.group === "A");
  const groupBModules = visibleNavigation.filter((item) => item.group === "B");

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: { xs: 76, md: drawerWidth },
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: 76, md: drawerWidth },
          boxSizing: "border-box",
          border: "none",
          background: "#0a192f", // Deep Navy Professional Theme
          color: "#fff",
        },
      }}
    >
      <Toolbar sx={{ px: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            w: 32,
            h: 32,
            borderRadius: "8px",
            bgcolor: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 14,
            px: 1.2,
            py: 0.4,
          }}
        >
          ICJ
        </Box>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ letterSpacing: 0.5, color: "#fff", display: { xs: "none", md: "block" } }}
        >
          ENTERPRISE
        </Typography>
      </Toolbar>

      <Box sx={{ overflowY: "auto", px: 1, py: 1, flex: 1 }}>

        {/* ─── GROUP A: ACTIVE MEMBER MODULES (EMERALD GREEN ACCENT) ───────── */}
        {groupAModules.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                mx: 1,
                my: 1,
                px: 1.5,
                py: 0.6,
                borderRadius: 1.5,
                bgcolor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: "#34d399",
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                }}
              >
                GROUP A — MEMBER DATA
              </Typography>
              <Chip
                label="ACTIVE WORKFLOW"
                size="small"
                sx={{
                  bgcolor: "#059669",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "0.62rem",
                  height: 18,
                }}
              />
            </Box>

            <List disablePadding>
              {groupAModules.map((item) => {
                const isActive = location.pathname === item.route;
                return (
                  <ListItemButton
                    key={item.id}
                    onClick={() => navigate(item.route)}
                    sx={{
                      mx: 0.5,
                      mb: 0.5,
                      borderRadius: 1.5,
                      color: isActive ? "#ffffff" : "#94a3b8",
                      bgcolor: isActive ? "#059669" : "transparent",
                      borderLeft: isActive ? "3px solid #34d399" : "3px solid transparent",
                      transition: "all 0.18s ease",
                      "&:hover": {
                        bgcolor: isActive ? "#047857" : "rgba(16, 185, 129, 0.15)",
                        color: "#ffffff",
                        transform: "translateX(3px)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "#ffffff" : "#10b981",
                        minWidth: 38,
                      }}
                    >
                      {iconMap[item.icon] || <Gavel />}
                    </ListItemIcon>

                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{
                        fontSize: "0.85rem",
                        fontWeight: isActive ? 700 : 500,
                      }}
                      secondary={item.category}
                      secondaryTypographyProps={{
                        sx: {
                          color: isActive ? "rgba(255,255,255,0.85)" : "#64748b",
                          fontSize: 10,
                          display: { xs: "none", md: "block" },
                        },
                      }}
                      sx={{ display: { xs: "none", md: "block" } }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        )}

        <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.08)" }} />

        {/* ─── GROUP B: UNLOCKED INFRASTRUCTURE MODULES (ACTIVE BLUE ACCENT) ─ */}
        {groupBModules.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                mx: 1,
                my: 1,
                px: 1.5,
                py: 0.6,
                borderRadius: 1.5,
                bgcolor: "rgba(37, 99, 235, 0.12)",
                border: "1px solid rgba(37, 99, 235, 0.3)",
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <VerifiedUser sx={{ fontSize: 13, color: "#60a5fa" }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: "#60a5fa",
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                  }}
                >
                  GROUP B — INFRASTRUCTURE
                </Typography>
              </Stack>
              <Chip
                label="UNFROZEN 🔓"
                size="small"
                sx={{
                  bgcolor: "#1d4ed8",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "0.62rem",
                  height: 18,
                }}
              />
            </Box>

            <List disablePadding>
              {groupBModules.map((item) => {
                const isActive = location.pathname === item.route;
                return (
                  <ListItemButton
                    key={item.id}
                    onClick={() => navigate(item.route)}
                    sx={{
                      mx: 0.5,
                      mb: 0.5,
                      borderRadius: 1.5,
                      color: isActive ? "#ffffff" : "#cbd5e1",
                      bgcolor: isActive ? "#1d4ed8" : "transparent",
                      borderLeft: isActive ? "3px solid #60a5fa" : "3px solid transparent",
                      transition: "all 0.18s ease",
                      "&:hover": {
                        bgcolor: isActive ? "#1e40af" : "rgba(37, 99, 235, 0.15)",
                        color: "#ffffff",
                        transform: "translateX(3px)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "#ffffff" : "#60a5fa",
                        minWidth: 38,
                      }}
                    >
                      {iconMap[item.icon] || <Gavel />}
                    </ListItemIcon>

                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{
                        fontSize: "0.85rem",
                        fontWeight: isActive ? 700 : 500,
                      }}
                      secondary={item.category}
                      secondaryTypographyProps={{
                        sx: {
                          color: isActive ? "rgba(255,255,255,0.7)" : "#475569",
                          fontSize: 10,
                          display: { xs: "none", md: "block" },
                        },
                      }}
                      sx={{ display: { xs: "none", md: "block" } }}
                    />
                    <Lock sx={{ fontSize: 13, color: "#475569", ml: "auto", display: { xs: "none", md: "block" } }} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        )}

      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          mt: "auto",
          p: 2,
          borderTop: "1px solid rgba(255,255,255,.08)",
          bgcolor: "rgba(0,0,0,0.2)",
        }}
      >
        <Typography variant="caption" color="#64748b" display="block">
          ICJ Enterprise Platform
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#94a3b8" }}>
          Group A: Active | Group B: Frozen 🔒
        </Typography>
      </Box>
    </Drawer>
  );
}