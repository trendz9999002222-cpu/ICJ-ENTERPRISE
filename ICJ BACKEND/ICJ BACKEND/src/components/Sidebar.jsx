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
  IconButton,
  Button,
  Divider,
  useMediaQuery,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";

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
  SupportAgent,
} from "@mui/icons-material";

import { getRoleOrderedModules } from "../core/navigation";
import useAuth from "../hooks/useAuth";

const drawerWidth = 220;

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
  support_agent: <SupportAgent />,
};

// Helper for rich pill background & border styling based on Universal 5-Color System
const getPillStyle = (item, isActive) => {
  const code = item.colorClassification?.code || "FREQUENT";
  switch (code) {
    case "CRITICAL":
      return {
        bgcolor: isActive ? "#dc2626" : "rgba(239, 68, 68, 0.25)",
        borderLeft: "4px solid #ef4444",
        border: isActive ? "1px solid #f87171" : "1px solid rgba(239, 68, 68, 0.4)",
        textColor: "#ffffff",
        iconColor: "#ef4444",
        badge: "🔴",
      };
    case "FINANCE":
      return {
        bgcolor: isActive ? "#7c3aed" : "rgba(139, 92, 246, 0.25)",
        borderLeft: "4px solid #8b5cf6",
        border: isActive ? "1px solid #c084fc" : "1px solid rgba(139, 92, 246, 0.4)",
        textColor: "#ffffff",
        iconColor: "#a855f7",
        badge: "🟣",
      };
    case "NORMAL":
      return {
        bgcolor: isActive ? "#ea580c" : "rgba(249, 115, 22, 0.22)",
        borderLeft: "4px solid #f97316",
        border: isActive ? "1px solid #fb923c" : "1px solid rgba(249, 115, 22, 0.4)",
        textColor: "#ffffff",
        iconColor: "#f97316",
        badge: "🟠",
      };
    case "SYSTEM":
      return {
        bgcolor: isActive ? "#2563eb" : "rgba(59, 130, 246, 0.22)",
        borderLeft: "4px solid #3b82f6",
        border: isActive ? "1px solid #60a5fa" : "1px solid rgba(59, 130, 246, 0.4)",
        textColor: "#ffffff",
        iconColor: "#3b82f6",
        badge: "🔵",
      };
    case "FREQUENT":
    default:
      return {
        bgcolor: isActive ? "#059669" : "rgba(16, 185, 129, 0.22)",
        borderLeft: "4px solid #10b981",
        border: isActive ? "1px solid #34d399" : "1px solid rgba(16, 185, 129, 0.4)",
        textColor: "#ffffff",
        iconColor: "#10b981",
        badge: "🟢",
      };
  }
};

export default function Sidebar({ mobileOpen = false, onMobileClose = () => {} }) {
  const isMobile = useMediaQuery("(max-width:899.95px)");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const role = String(user?.role || "member").toLowerCase();
  const roleOrderedList = getRoleOrderedModules(role);

  const handleLogout = async () => {
    onMobileClose();
    try {
      if (logout) await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
    navigate("/login");
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: { xs: 0, md: drawerWidth },
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: { xs: 280, md: drawerWidth },
          boxSizing: "border-box",
          border: "none",
          background: "#0a192f",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
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
      {/* DRAWER HEADER WITH BRAND AND MOBILE CLOSE BUTTON */}
      <Toolbar sx={{ px: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
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
            }}
          >
            ICJ
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              letterSpacing: 0.3,
              color: "#fff",
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
            }}
          >
            ENTERPRISE
          </Typography>
        </Stack>

        {isMobile && (
          <IconButton onClick={onMobileClose} sx={{ color: "#94a3b8", "&:hover": { color: "#ffffff" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1 }} />

      {/* MODULES LIST */}
      <Box sx={{ overflowY: "auto", px: 1, py: 0.5, flex: 1 }}>
        <List disablePadding>
          {roleOrderedList.map((item) => {
            const isActive = location.pathname === item.route;
            const style = getPillStyle(item, isActive);

            return (
              <ListItemButton
                key={item.id}
                onClick={() => {
                  navigate(item.route);
                  if (isMobile) onMobileClose();
                }}
                sx={{
                  mx: 0.3,
                  mb: 0.6,
                  py: { xs: 1.1, md: 0.6 },
                  px: 1.2,
                  borderRadius: 1.5,
                  bgcolor: style.bgcolor,
                  borderLeft: style.borderLeft,
                  border: style.border,
                  minHeight: { xs: 44, md: 38 },
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
                      <Box
                        component="span"
                        sx={{
                          fontSize: "1rem",
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
                          fontSize: "0.8rem",
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
                  sx={{ my: 0 }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* MOBILE DRAWER BOTTOM LOGOUT / EXIT BUTTON */}
      {isMobile && (
        <Box sx={{ p: 1.5, borderTop: "1px solid rgba(255,255,255,0.1)", bgcolor: "#071322" }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              fontWeight: 900,
              borderRadius: 2,
              py: 1.2,
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            Exit Account / Logout (लॉगआउट)
          </Button>
        </Box>
      )}
    </Drawer>
  );
}