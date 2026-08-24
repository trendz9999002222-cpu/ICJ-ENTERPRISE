import { useNavigate, useLocation } from "react-router-dom";
import { Paper, BottomNavigation, BottomNavigationAction, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AppsIcon from "@mui/icons-material/Apps";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import GavelIcon from "@mui/icons-material/Gavel";
import PersonIcon from "@mui/icons-material/Person";

import useAuth from "../hooks/useAuth";
import useMobileKeyboardHandler from "../hooks/useMobileKeyboardHandler";

export default function MobileBottomNav({ isKeyboardActive = false, onOpenMobileNav = () => {} }) {
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
    if (path.includes("join") || path.includes("onboarding")) return 2;
    if (path.includes("portal") || path.includes("legal") || path.includes("court")) return 3;
    if (path.includes("profile") || path.includes("settings")) return 4;
    return 0;
  };

  return (
    <Box sx={{ display: { xs: "block", md: "none" } }}>
      <Paper
        elevation={10}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          borderRadius: "16px 16px 0 0",
          overflow: "hidden",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          bgcolor: "#0a192f",
          pb: "env(safe-area-inset-bottom)",
          transform: hideNav ? "translateY(100%)" : "translateY(0)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <BottomNavigation
          showLabels
          value={getActiveTab()}
          onChange={(_, newValue) => {
            if (newValue === 0) {
              navigate(role === "advocate" ? "/advocate-dashboard" : role === "admin" ? "/super-admin-dashboard" : "/");
            } else if (newValue === 1) {
              onOpenMobileNav();
            } else if (newValue === 2) {
              navigate("/join");
            } else if (newValue === 3) {
              navigate(role === "advocate" ? "/advocate-dashboard" : "/client-portal");
            } else if (newValue === 4) {
              navigate("/member-profile");
            }
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
                fontWeight: 800,
              },
            },
            "& .MuiSvgIcon-root": {
              fontSize: "1.35rem",
            },
          }}
        >
          <BottomNavigationAction label="Home" icon={<DashboardIcon />} />
          <BottomNavigationAction label="Modules" icon={<AppsIcon sx={{ color: "#38bdf8" }} />} />
          <BottomNavigationAction label="Join" icon={<HowToRegIcon />} />
          <BottomNavigationAction label={role === "advocate" ? "Chambers" : "Portal"} icon={<GavelIcon />} />
          <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
