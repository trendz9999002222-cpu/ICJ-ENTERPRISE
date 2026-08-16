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
import { useNavigate } from "react-router-dom";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import GavelIcon from "@mui/icons-material/Gavel";
import FolderIcon from "@mui/icons-material/Folder";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import useAuth from "../hooks/useAuth";
import NotificationRoutingService from "../services/notificationRoutingService.js";
import NotificationDispatcherModal from "./admin/NotificationDispatcherModal.jsx";
import CampaignIcon from "@mui/icons-material/Campaign";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

function Topbar({ onOpenMobileNav = () => {} }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(NotificationRoutingService.isSirenActive());

  const userInitial = String(user?.fullName || user?.name || user?.username || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  const userRole = user?.role || "admin";

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
      position="static"
      elevation={0}
      sx={{
        background: "#ffffff",
        color: "#212529",
        borderBottom: "1px solid #cbd5e1",
        m: 0,
        p: 0,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
          py: 0.1,
          // A 34px bar is unusable on a phone; give it room for touch targets.
          minHeight: { xs: "52px !important", md: "34px !important" },
          height: { xs: 52, md: 34 },
          px: { xs: 0.6, md: 1.2 },
        }}
      >

        {/* ⬅️ LEFT SIDE: 1 STRAIGHT LINE (BRAND + SEARCH) */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flexShrink: 1 }}>
          {/* Opens the sidebar, which is an overlay drawer below md */}
          <IconButton
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            sx={{ display: { xs: "inline-flex", md: "none" }, p: 0.75, ml: -0.5 }}
          >
            <MenuIcon sx={{ fontSize: "1.4rem" }} />
          </IconButton>

          {/* BRAND NAME SIDE-BY-SIDE IN SAME STRAIGHT LINE */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: "#1976d2",
              lineHeight: 1,
              whiteSpace: "nowrap",
              fontSize: { xs: "0.75rem", md: "0.82rem" },
              letterSpacing: 0.2,
              mr: { xs: 0, md: 1 },
            }}
          >
            ICJ ENTERPRISE
          </Typography>

          {/* Unified Global Search — hidden on phones, where it crowded out
              everything else. Search is reachable from the modules themselves. */}
          <TextField
            size="small"
            value={globalQuery}
            onChange={handleSearchChange}
            placeholder="Global Search (Members, Cases, Documents)..."
            sx={{
              display: { xs: "none", md: "inline-flex" },
              width: { sm: 200, md: 300 },
              "& .MuiInputBase-root": { height: 24, fontSize: "0.72rem" },
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="primary" sx={{ fontSize: "0.85rem" }} /></InputAdornment>,
            }}
          />

          {/* Search Dropdown Popup */}
          <Menu
            anchorEl={searchAnchor}
            open={Boolean(searchAnchor && globalQuery.trim().length >= 2)}
            onClose={() => setSearchAnchor(null)}
            PaperProps={{ style: { width: 350, maxHeight: 320 } }}
          >
            <MenuItem disabled><Typography variant="caption" fontWeight="bold">UNIFIED MATCHES FOR "{globalQuery}"</Typography></MenuItem>
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

        {/* ➡️ RIGHT SIDE: 1 STRAIGHT INLINE LINE (USER IDENTITY + ROLE + LOGOUT) */}
        <Stack direction="row" alignItems="center" spacing={0.8} sx={{ flexShrink: 0 }}>
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
              sx={{ fontWeight: 800, fontSize: "0.7rem", px: 1, py: 0.2, animation: "pulse 1.5s infinite" }}
            >
              🔕 Silence Siren
            </Button>
          )}

          <Tooltip title="Sender-Assigned Notification Dispatcher">
            <IconButton size="small" onClick={() => setDispatchModalOpen(true)} sx={{ p: 0.3, color: "#f59e0b" }}>
              <CampaignIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </Tooltip>

          <IconButton size="small" onClick={() => navigate("/notifications")} sx={{ p: 0.3 }}>
            <Badge badgeContent={12} color="error">
              <NotificationsIcon color="action" sx={{ fontSize: "1rem" }} />
            </Badge>
          </IconButton>

          <IconButton size="small" onClick={() => navigate("/settings")} sx={{ p: 0.3 }}>
            <SettingsIcon color="action" sx={{ fontSize: "1rem" }} />
          </IconButton>

          {/* 1 STRAIGHT LINE USER IDENTITY BADGE */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              px: 1,
              py: 0.2,
              borderRadius: 1.5,
              bgcolor: "#0f172a",
              color: "#ffffff",
              border: "1px solid #1e293b",
              whiteSpace: "nowrap",
            }}
          >
            <Avatar sx={{ bgcolor: "#2563eb", fontWeight: "bold", width: 22, height: 22, fontSize: "0.75rem" }}>
              {userInitial}
            </Avatar>

            {/* Full name and role chip are desktop-only — on a phone they pushed
                the Exit button off the edge of the bar. */}
            <Typography
              variant="caption"
              sx={{
                display: { xs: "none", sm: "inline" },
                fontWeight: 800,
                color: "#ffffff",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                maxWidth: { sm: 120, md: "none" },
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {(() => {
                const prefix = user?.namePrefix || user?.name_prefix || "";
                const name = user?.fullName || user?.name || user?.username || "Logged User";
                return prefix && !name.startsWith(prefix) ? `${prefix} ${name}` : name;
              })()}
            </Typography>

            <Chip
              label={
                userRole === "super_admin" || user?.user_type === "super_admin" || user?.username === "ICJSuperAdmin1234"
                  ? "👑 SUPER ADMIN"
                  : userRole === "admin"
                  ? "🛡️ ADMIN"
                  : userRole === "employee"
                  ? "💼 STAFF"
                  : "🟢 MEMBER"
              }
              size="small"
              sx={{
                display: { xs: "none", md: "inline-flex" },
                fontWeight: 800,
                fontSize: "0.58rem",
                height: 16,
                bgcolor:
                  userRole === "super_admin" || user?.user_type === "super_admin" || user?.username === "ICJSuperAdmin1234"
                    ? "#7c3aed"
                    : userRole === "admin"
                    ? "#1d4ed8"
                    : userRole === "employee"
                    ? "#d97706"
                    : "#059669",
                color: "#ffffff",
              }}
            />

            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              sx={{
                fontWeight: 800,
                px: 0.6,
                py: 0.1,
                minWidth: 42,
                height: { xs: 28, md: 20 },
                fontSize: "0.62rem",
                flexShrink: 0,
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
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;