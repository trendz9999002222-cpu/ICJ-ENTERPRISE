import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Chip,
  Tooltip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import AppsIcon from "@mui/icons-material/Apps";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import GavelIcon from "@mui/icons-material/Gavel";
import FolderIcon from "@mui/icons-material/Folder";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CampaignIcon from "@mui/icons-material/Campaign";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import MicIcon from "@mui/icons-material/Mic";
import LockIcon from "@mui/icons-material/Lock";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import useAuth from "../hooks/useAuth";
import NotificationRoutingService from "../services/notificationRoutingService.js";
import NotificationDispatcherModal from "./admin/NotificationDispatcherModal.jsx";
import GlobalCommandPalette from "./common/GlobalCommandPalette.jsx";

const MODULE_NAMES = {
  "/advocate-dashboard": "📌 ADVOCATE DESK & CHAMBERS",
  "/client-portal": "📌 LITIGANT CLIENT PORTAL",
  "/dashboard": "📌 SUPER ADMIN DASHBOARD",
  "/admin": "📌 SUPER ADMIN DASHBOARD",
  "/personal-dashboard": "📌 MEMBER PERSONAL DASHBOARD",
  "/franchise-dashboard": "📌 DISTRICT FRANCHISEE DESK",
  "/legal": "📌 LEGAL CASE REGISTRY",
  "/legal-drafter": "📌 AI LEGAL DRAFTER STUDIO",
  "/documents": "📌 DIGITAL VAULT & DRM",
  "/virtual-office": "📌 VIRTUAL COURT CHAMBER",
  "/court-calendar": "📌 COURT CAUSE LIST",
  "/finance": "📌 ESCROW FINANCIAL LEDGER",
  "/payments": "📌 ESCROW FINANCIAL LEDGER",
  "/governance": "📌 STATUTORY BSA COMPLIANCE",
  "/helpdesk": "📌 HELPDESK & SUPPORT",
  "/member-certificates": "📌 OFFICIAL CERTIFICATES",
};

function Topbar({ onOpenMobileNav = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [roleMenuAnchor, setRoleMenuAnchor] = useState(null);

  // Global helper for shortcut
  if (typeof window !== "undefined") {
    window.toggleCommandPalette = () => setPaletteOpen((prev) => !prev);
  }
  const [isSirenActive, setIsSirenActive] = useState(() => {
    try {
      return NotificationRoutingService?.isSirenActive ? NotificationRoutingService.isSirenActive() : false;
    } catch {
      return false;
    }
  });

  const handleRoleSwitch = (path) => {
    setRoleMenuAnchor(null);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      if (logout) await logout();
    } catch (err) {
      console.error("Logout error", err);
    }
    navigate("/login");
  };

  const activePath = location?.pathname || "";
  const activeModuleName = MODULE_NAMES[activePath] || 
    Object.keys(MODULE_NAMES).find(k => activePath.startsWith(k)) ? MODULE_NAMES[Object.keys(MODULE_NAMES).find(k => activePath.startsWith(k))] : "📌 ICJ ENTERPRISE PLATFORM";

  const userInitial = String(user?.fullName || user?.name || user?.username || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  const userRole = user?.role || "admin";
  const userPrefix = user?.namePrefix || user?.name_prefix || "";
  const rawUserName = user?.fullName || user?.name || user?.username || "Logged User";
  const userDisplayName = userPrefix && !rawUserName.startsWith(userPrefix) ? `${userPrefix} ${rawUserName}` : rawUserName;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setGlobalQuery(val);
    if (val.trim().length >= 2) {
      setSearchAnchor(e.currentTarget);
    } else {
      setSearchAnchor(null);
    }
  };

  const handleSearchResultClick = (path) => {
    setSearchAnchor(null);
    setGlobalQuery("");
    navigate(path);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "#ffffff",
        color: "#212529",
        borderBottom: "1px solid #cbd5e1",
        top: 0,
        zIndex: 1100,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: { xs: "48px !important", md: "42px !important" },
          height: { xs: 48, md: 42 },
          px: { xs: 1, sm: 1.5, md: 2 },
          gap: 1,
        }}
      >
        {/* ⬅️ LEFT SIDE: ALL MODULES BUTTON (MOBILE) + BRAND LOGO + DESKTOP SEARCH */}
        <Stack direction="row" alignItems="center" spacing={{ xs: 0.8, sm: 1.2 }}>
          {/* 📱 MOBILE "ALL MODULES" BUTTON — OPENS FULL MODULES DRAWER */}
          <Button
            variant="contained"
            size="small"
            startIcon={<AppsIcon sx={{ fontSize: "1.1rem" }} />}
            onClick={onOpenMobileNav}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              bgcolor: "#0f172a",
              color: "#38bdf8",
              fontWeight: 800,
              fontSize: "0.72rem",
              px: 1.2,
              py: 0.4,
              minWidth: "auto",
              height: 32,
              borderRadius: 1.5,
              border: "1px solid #0284c7",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "#1e293b" },
            }}
          >
            Modules
          </Button>

          {/* BRAND LOGO & TITLE */}
          <Box
            onClick={() => navigate("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Box
              sx={{
                bgcolor: "#2563eb",
                color: "#ffffff",
                fontWeight: 900,
                fontSize: "0.75rem",
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                display: { xs: "none", sm: "inline-flex" },
              }}
            >
              ICJ
            </Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 900,
                color: "#1e3a8a",
                lineHeight: 1,
                whiteSpace: "nowrap",
                fontSize: { xs: "0.82rem", md: "0.9rem" },
                letterSpacing: 0.3,
              }}
            >
              ICJ ENTERPRISE
            </Typography>
          </Box>

          {/* 🔍 SPOTLIGHT GLOBAL SEARCH WITH CTRL+K & VOICE TRIGGER */}
          <Button
            onClick={() => setPaletteOpen(true)}
            variant="outlined"
            size="small"
            startIcon={<SearchIcon sx={{ color: "#2563eb", fontSize: "1.05rem" }} />}
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              height: 30,
              px: 1.5,
              borderRadius: "16px",
              borderColor: "#cbd5e1",
              bgcolor: "#f8fafc",
              color: "#64748b",
              fontWeight: 700,
              fontSize: "0.76rem",
              textTransform: "none",
              gap: 1,
              "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
            }}
          >
            Search Cases, CNR, AI...
            <Chip
              label="Ctrl K"
              size="small"
              sx={{
                height: 18,
                fontSize: "0.62rem",
                fontWeight: 900,
                bgcolor: "#e2e8f0",
                color: "#1e293b",
                borderRadius: 1,
              }}
            />
          </Button>

          {/* 🎙️ GOOGLE VOICE AI SEARCH BUTTON */}
          <Tooltip title="Voice Search / Dictation (बोलकर सर्च करें)">
            <IconButton
              size="small"
              onClick={() => setPaletteOpen(true)}
              sx={{
                width: 28,
                height: 28,
                bgcolor: "#eff6ff",
                color: "#2563eb",
                border: "1px solid #bfdbfe",
                "&:hover": { bgcolor: "#dbeafe" },
              }}
            >
              <MicIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* ACTIVE MODULE BADGE (DESKTOP) */}
          <Chip
            label={activeModuleName}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: "0.68rem",
              height: 24,
              bgcolor: "#0f172a",
              color: "#38bdf8",
              border: "1px solid #0284c7",
              display: { xs: "none", lg: "inline-flex" },
            }}
          />

          {/* Search Dropdown Popup */}
          <Menu
            anchorEl={searchAnchor}
            open={Boolean(searchAnchor && globalQuery.trim().length >= 2)}
            onClose={() => setSearchAnchor(null)}
            PaperProps={{ style: { width: 350, maxHeight: 320 } }}
          >
            <MenuItem disabled>
              <Typography variant="caption" fontWeight="bold">
                UNIFIED MATCHES FOR "{globalQuery}"
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleSearchResultClick(`/membership?search=${encodeURIComponent(globalQuery)}`)}>
              <ListItemIcon><PersonIcon color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary={`Search Members: "${globalQuery}"`} secondary="Master Member Directory" />
            </MenuItem>
            <MenuItem onClick={() => handleSearchResultClick(`/legal?search=${encodeURIComponent(globalQuery)}`)}>
              <ListItemIcon><GavelIcon color="secondary" fontSize="small" /></ListItemIcon>
              <ListItemText primary={`Search Legal Cases: "${globalQuery}"`} secondary="Master Legal Registry" />
            </MenuItem>
            <MenuItem onClick={() => handleSearchResultClick(`/documents?search=${encodeURIComponent(globalQuery)}`)}>
              <ListItemIcon><FolderIcon color="info" fontSize="small" /></ListItemIcon>
              <ListItemText primary={`Search Documents: "${globalQuery}"`} secondary="Master Digital Vault" />
            </MenuItem>
          </Menu>
        </Stack>

        {/* ➡️ RIGHT SIDE: ROLE SWITCHER + NOTIFICATIONS + USER IDENTITY + EXIT BUTTON */}
        <Stack direction="row" alignItems="center" spacing={{ xs: 0.6, sm: 1 }}>
          {isSirenActive && (
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<VolumeOffIcon />}
              onClick={() => {
                NotificationRoutingService.silenceSiren();
                setIsSirenActive(false);
              }}
              sx={{ fontWeight: 800, fontSize: "0.65rem", px: 0.8, py: 0.2, height: 26 }}
            >
              Silence
            </Button>
          )}

          {/* ROLE SWITCHER BUTTON (TABLET / DESKTOP) */}
          <Button
            variant="contained"
            size="small"
            onClick={(e) => setRoleMenuAnchor(e.currentTarget)}
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.68rem",
              height: 26,
              px: 1,
              textTransform: "none",
              borderRadius: 1.5,
              "&:hover": { opacity: 0.95 },
            }}
          >
            🎭 Role View ▾
          </Button>

          {/* Role Switcher Menu */}
          <Menu
            anchorEl={roleMenuAnchor}
            open={Boolean(roleMenuAnchor)}
            onClose={() => setRoleMenuAnchor(null)}
            PaperProps={{ style: { width: 260, borderRadius: 10 } }}
          >
            <MenuItem disabled>
              <Typography variant="caption" fontWeight="bold" color="#7c3aed">
                👑 ACTIVE ROLE SIMULATOR
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleRoleSwitch("/")}>
              <ListItemIcon><Typography fontSize="1rem">👑</Typography></ListItemIcon>
              <ListItemText primary="Super Admin Command Hub" secondary="Supreme Governance" />
            </MenuItem>
            <MenuItem onClick={() => handleRoleSwitch("/advocate-dashboard")}>
              <ListItemIcon><Typography fontSize="1rem">⚖️</Typography></ListItemIcon>
              <ListItemText primary="Advocate Chambers" secondary="Legal Counsel View" />
            </MenuItem>
            <MenuItem onClick={() => handleRoleSwitch("/client-portal")}>
              <ListItemIcon><Typography fontSize="1rem">👤</Typography></ListItemIcon>
              <ListItemText primary="Litigant Client Portal" secondary="File New & Active Cases" />
            </MenuItem>
            <MenuItem onClick={() => handleRoleSwitch("/franchise-dashboard")}>
              <ListItemIcon><Typography fontSize="1rem">🏢</Typography></ListItemIcon>
              <ListItemText primary="District Franchise Desk" secondary="Network Operations" />
            </MenuItem>
            <MenuItem onClick={() => handleRoleSwitch("/member-certificates")}>
              <ListItemIcon><Typography fontSize="1rem">🎓</Typography></ListItemIcon>
              <ListItemText primary="Member Certificates" secondary="Official Verification" />
            </MenuItem>
          </Menu>

          <IconButton size="small" onClick={() => navigate("/notifications")} sx={{ p: 0.4 }}>
            <Badge badgeContent={12} color="error">
              <NotificationsIcon color="action" sx={{ fontSize: "1.1rem" }} />
            </Badge>
          </IconButton>

          {/* USER IDENTITY BADGE (ALWAYS VISIBLE & NEVER OVERFLOWING) */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              px: { xs: 0.6, sm: 1 },
              py: 0.3,
              borderRadius: 2,
              bgcolor: "#0f172a",
              color: "#ffffff",
              border: "1px solid #1e293b",
            }}
          >
            <Tooltip title="View Profile">
              <Avatar
                onClick={() => navigate("/member-profile")}
                sx={{
                  bgcolor: "#2563eb",
                  fontWeight: "bold",
                  width: { xs: 24, md: 26 },
                  height: { xs: 24, md: 26 },
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                {userInitial}
              </Avatar>
            </Tooltip>

            <Typography
              onClick={() => navigate("/member-profile")}
              variant="caption"
              sx={{
                display: { xs: "none", md: "inline" },
                fontWeight: 800,
                color: "#ffffff",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {userDisplayName}
            </Typography>

            <Chip
              label={
                userRole === "super_admin" || user?.user_type === "super_admin" || user?.username === "ICJSuperAdmin1234"
                  ? "ADMIN"
                  : userRole === "advocate"
                  ? "ADVOCATE"
                  : userRole === "franchise"
                  ? "FRANCHISE"
                  : "MEMBER"
              }
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: "0.55rem",
                height: 18,
                bgcolor:
                  userRole === "super_admin" || user?.user_type === "super_admin" || user?.username === "ICJSuperAdmin1234"
                    ? "#7c3aed"
                    : userRole === "advocate"
                    ? "#b91c1c"
                    : userRole === "franchise"
                    ? "#d97706"
                    : "#059669",
                color: "#ffffff",
                display: { xs: "none", sm: "inline-flex" },
              }}
            />

            {/* 🔐 1-CLICK COURT PRIVACY SCREEN LOCK BUTTON */}
            <Tooltip title="Lock Screen (प्राइवेसी स्क्रीन लॉक)">
              <IconButton
                size="small"
                onClick={() => {
                  if (typeof window !== "undefined" && window.lockSessionScreen) {
                    window.lockSessionScreen();
                  }
                }}
                sx={{
                  bgcolor: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  width: 24,
                  height: 24,
                  "&:hover": { bgcolor: "#e2e8f0" },
                }}
              >
                <LockIcon sx={{ fontSize: "0.85rem" }} />
              </IconButton>
            </Tooltip>

            {/* 🔴 PROMINENT 1-CLICK EXIT BUTTON (ALWAYS ACCESSIBLE ON MOBILE & DESKTOP) */}
            <Button
              variant="contained"
              size="small"
              color="error"
              startIcon={<LogoutIcon sx={{ fontSize: "0.85rem" }} />}
              onClick={handleLogout}
              sx={{
                fontWeight: 900,
                px: { xs: 0.8, sm: 1.2 },
                py: 0.2,
                minWidth: { xs: 54, sm: 64 },
                height: 24,
                fontSize: { xs: "0.68rem", sm: "0.72rem" },
                bgcolor: "#dc2626",
                borderRadius: 1.5,
                "&:hover": { bgcolor: "#b91c1c" },
              }}
            >
              Exit
            </Button>
          </Box>
        </Stack>

        <NotificationDispatcherModal
          open={dispatchModalOpen}
          onClose={() => setDispatchModalOpen(false)}
          senderName={user?.name || user?.username || "Super Admin"}
          senderRole={user?.user_type || userRole || "super_admin"}
        />

        {/* 🔍 GOOGLE SPOTLIGHT COMMAND PALETTE (CTRL+K) */}
        <GlobalCommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
        />
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;