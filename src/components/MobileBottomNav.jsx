import { useNavigate, useLocation } from "react-router-dom";
import { Paper, BottomNavigation, BottomNavigationAction, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";

import useAuth from "../hooks/useAuth";
import useMobileKeyboardHandler from "../hooks/useMobileKeyboardHandler";

export default function MobileBottomNav({ isKeyboardActive = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isKeyboardOpen } = useMobileKeyboardHandler();

  const hideNav = isKeyboardActive || isKeyboardOpen;
  const role = String(user?.role || "member").toLowerCase();

  // Determine current active tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("dashboard") || path === "/") return 0;
    if (path.includes("join") || path.includes("onboarding")) return 1;
    if (path.includes("administration")) return 2;
    if (path.includes("ai")) return 3;
    if (path.includes("profile") || path.includes("settings")) return 4;
    return 0;
  };

  return (
    <Box sx={{ display: { xs: "block", md: "none" } }}>
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          borderRadius: "16px 16px 0 0",
          overflow: "hidden",
          borderTop: "1px solid rgba(229, 231, 235, 0.8)",
          bgcolor: "#0a192f",
          transform: hideNav ? "translateY(100%)" : "translateY(0)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <BottomNavigation
          showLabels
          value={getActiveTab()}
          onChange={(_, newValue) => {
            if (newValue === 0) navigate(role === "admin" ? "/super-admin-dashboard" : "/dashboard");
            else if (newValue === 1) navigate("/join");
            else if (newValue === 2) navigate(role === "admin" ? "/administration" : "/client-portal");
            else if (newValue === 3) navigate("/ai-drafter");
            else if (newValue === 4) navigate("/member-profile");
          }}
          sx={{
            bgcolor: "#0a192f",
            height: 60,
            "& .MuiBottomNavigationAction-root": {
              color: "#94a3b8",
              minWidth: "auto",
              py: 0.5,
              "&.Mui-selected": {
                color: "#38bdf8",
                fontWeight: "bold",
              },
            },
            "& .MuiSvgIcon-root": {
              fontSize: "1.4rem",
            },
          }}
        >
          <BottomNavigationAction label="Home" icon={<DashboardIcon />} />
          <BottomNavigationAction label="Join" icon={<HowToRegIcon />} />
          <BottomNavigationAction label={role === "admin" ? "Admin" : "Portal"} icon={<AdminPanelSettingsIcon />} />
          <BottomNavigationAction label="AI Studio" icon={<SmartToyIcon />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
