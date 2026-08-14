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
} from "@mui/icons-material";

import { getRoleOrderedModules, UNIVERSAL_PERMISSION_COLORS } from "../core/navigation";
import useAuth from "../hooks/useAuth";

const drawerWidth = 210;

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

// Helper for rich pill background & border styling based on Universal 5-Color System
const getPillStyle = (item, isActive) => {
  const code = item.colorClassification?.code || "FREQUENT";
  switch (code) {
    case "CRITICAL":
      return {
        bgcolor: isActive ? "#dc2626" : "rgba(239, 68, 68, 0.16)",
        borderLeft: "4px solid #ef4444",
        border: isActive ? "1px solid #f87171" : "1px solid rgba(239, 68, 68, 0.3)",
        textColor: isActive ? "#ffffff" : "#fca5a5",
        iconColor: "#ef4444",
        badge: "🔴",
      };
    case "FINANCE":
      return {
        bgcolor: isActive ? "#7c3aed" : "rgba(139, 92, 246, 0.16)",
        borderLeft: "4px solid #8b5cf6",
        border: isActive ? "1px solid #c084fc" : "1px solid rgba(139, 92, 246, 0.3)",
        textColor: isActive ? "#ffffff" : "#d8b4fe",
        iconColor: "#a855f7",
        badge: "🟣",
      };
    case "NORMAL":
      return {
        bgcolor: isActive ? "#ea580c" : "rgba(249, 115, 22, 0.14)",
        borderLeft: "4px solid #f97316",
        border: isActive ? "1px solid #fb923c" : "1px solid rgba(249, 115, 22, 0.3)",
        textColor: isActive ? "#ffffff" : "#fdba74",
        iconColor: "#f97316",
        badge: "🟠",
      };
    case "SYSTEM":
      return {
        bgcolor: isActive ? "#2563eb" : "rgba(59, 130, 246, 0.14)",
        borderLeft: "4px solid #3b82f6",
        border: isActive ? "1px solid #60a5fa" : "1px solid rgba(59, 130, 246, 0.3)",
        textColor: isActive ? "#ffffff" : "#93c5fd",
        iconColor: "#3b82f6",
        badge: "🔵",
      };
    case "FREQUENT":
    default:
      return {
        bgcolor: isActive ? "#059669" : "rgba(16, 185, 129, 0.14)",
        borderLeft: "4px solid #10b981",
        border: isActive ? "1px solid #34d399" : "1px solid rgba(16, 185, 129, 0.3)",
        textColor: isActive ? "#ffffff" : "#6ee7b7",
        iconColor: "#10b981",
        badge: "🟢",
      };
  }
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const role = String(user?.role || "member").toLowerCase();
  const roleOrderedList = getRoleOrderedModules(role);

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
          "& ::-webkit-scrollbar": {
            width: "5px",
          },
          "& ::-webkit-scrollbar-track": {
            background: "rgba(0,0,0,0.1)",
          },
          "& ::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.2)",
            borderRadius: "4px",
          },
          "& ::-webkit-scrollbar-thumb:hover": {
            background: "rgba(255,255,255,0.4)",
          },
        },
      }}
    >
      <Toolbar sx={{ px: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
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

      {/* CLEAN EXECUTIVE HIGH-DENSITY NAVIGATION LIST (ZERO DEBUG BANNERS) */}
      <Box sx={{ overflowY: "auto", px: 0.8, py: 1, flex: 1 }}>
        <List disablePadding>
          {roleOrderedList.map((item) => {
            const isActive = location.pathname === item.route;
            const style = getPillStyle(item, isActive);

            return (
              <ListItemButton
                key={item.id}
                onClick={() => navigate(item.route)}
                sx={{
                  mx: 0.3,
                  mb: 0.5,
                  py: 0.55,
                  px: 1,
                  borderRadius: 1.5,
                  bgcolor: style.bgcolor,
                  borderLeft: style.borderLeft,
                  border: style.border,
                  minHeight: 38,
                  boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                  transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: style.bgcolor,
                    transform: "translateX(3px)",
                    filter: "brightness(1.15)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#ffffff" : style.iconColor,
                    minWidth: 32,
                    "& .MuiSvgIcon-root": { fontSize: "1.15rem" },
                  }}
                >
                  {iconMap[item.icon] || <Gavel />}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={0.6}>
                      {/* PROMINENT HIGH-CONTRAST MOBILE BADGE ICON */}
                      <Box
                        component="span"
                        sx={{
                          fontSize: "1.1rem",
                          lineHeight: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
                        }}
                      >
                        {style.badge}
                      </Box>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "0.78rem",
                          fontWeight: isActive ? 800 : 600,
                          color: style.textColor,
                          letterSpacing: 0.1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.name}
                      </Typography>
                    </Stack>
                  }
                  sx={{ display: { xs: "none", md: "block" }, my: 0 }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
}