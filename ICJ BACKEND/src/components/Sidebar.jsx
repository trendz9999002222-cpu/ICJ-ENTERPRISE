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
  Badge,
  Token,
  VolunteerActivism,
} from "@mui/icons-material";

import Navigation from "../core/navigation";
import { useAuth } from "../hooks/useAuth";
import { hasRouteAccess } from "../core/rbac";
import { resolveRoleCode } from "../core/roles";

const drawerWidth = 260;

const iconMap = {
  dashboard: <Dashboard />,
  groups: <Groups />,
  gavel: <Gavel />,
  folder: <Folder />,
  smart_toy: <SmartToy />,
  science: <Science />,
  account_balance_wallet: <AccountBalanceWallet />,
  settings: <Settings />,
  badge: <Badge />,
  token: <Token />,
  volunteer_activism: <VolunteerActivism />,
};

function Sidebar() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const role = resolveRoleCode(profile, user);
  const visibleNavigation = Navigation.filter((item) => hasRouteAccess(role, item.path));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          border: "none",
          background: "linear-gradient(180deg,#0B5ED7 0%,#084298 100%)",
          color: "#fff",
        },
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ letterSpacing: 1 }}
        >
          ICJ PLATFORM
        </Typography>
      </Toolbar>

      <Box sx={{ overflow: "auto", mt: 2 }}>
        <List>
          {visibleNavigation.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={() => navigate(item.path)}
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
                {iconMap[item.icon] || <Dashboard />}
              </ListItemIcon>

              <ListItemText
                primary={item.title}
                secondary={item.category}
                slotProps={{
                  secondary: {
                    sx: {
                      color: "rgba(255,255,255,0.65)",
                      fontSize: 11,
                    },
                  },
                }}
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
