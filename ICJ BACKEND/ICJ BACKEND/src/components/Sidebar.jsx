import { useNavigate } from "react-router-dom";
import {
  Drawer,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
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

import Navigation from "../core/navigation";
import useAuth from "../hooks/useAuth";

const drawerWidth = 260;

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

function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = String(user?.role || "member").toLowerCase();

  const allowedByRole = {
    admin: new Set(Navigation.map((item) => item.id)),
    employee: new Set([
      "dashboard",
      "membership",
      "member-directory",
      "member-verification",
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
          background:
            "linear-gradient(180deg,#0B5ED7 0%,#084298 100%)",
          color: "#fff",
        },
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ letterSpacing: 1, display: { xs: "none", md: "block" } }}
        >
          ICJ PLATFORM
        </Typography>
      </Toolbar>

      <Box sx={{ overflow: "auto", mt: 2 }}>
        <List>
          {visibleNavigation.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => navigate(item.route)}
              sx={{
                mx: 1,
                mb: 1,
                borderRadius: 2,
                color: "#fff",
                transition: "0.3s",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.18)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "#fff",
                  minWidth: 42,
                }}
              >
                {iconMap[item.icon] || <Gavel />}
              </ListItemIcon>

              <ListItemText
                primary={item.name}
                secondary={item.category}
                secondaryTypographyProps={{
                  sx: {
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 11,
                    display: { xs: "none", md: "block" },
                  },
                }}
                sx={{ display: { xs: "none", md: "block" } }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box
        sx={{
          mt: "auto",
          p: 2,
          borderTop: "1px solid rgba(255,255,255,.15)",
        }}
      >
        <Typography variant="caption" color="rgba(255,255,255,.8)">
          ICJ Enterprise Platform
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          Version 1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
}

export default Sidebar;