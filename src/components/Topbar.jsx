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
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import GavelIcon from "@mui/icons-material/Gavel";
import FolderIcon from "@mui/icons-material/Folder";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import useAuth from "../hooks/useAuth";

function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchAnchor, setSearchAnchor] = useState(null);

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
        borderBottom: "1px solid #e2e8f0",
        m: 0,
        p: 0,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 0.1, minHeight: "38px !important", px: { xs: 0.8, md: 1.5 } }}>
        <Box display="flex" alignItems="center" gap={1}>
          {/* 1-CLICK IN-APP BACK NAVIGATION ENGINE */}
          <Tooltip title="In-App 1-Click Back (वापसी करें)">
            <Button
              variant="contained"
              color="inherit"
              size="small"
              startIcon={<ArrowBackIcon sx={{ color: "#2563eb", fontSize: "0.95rem" }} />}
              onClick={() => navigate(-1)}
              sx={{
                bgcolor: "#f1f5f9",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "0.7rem",
                px: 0.8,
                py: 0.2,
                minHeight: 26,
                borderRadius: 1,
                border: "1px solid #cbd5e1",
                "&:hover": { bgcolor: "#e2e8f0" },
              }}
            >
              ◀ BACK
            </Button>
          </Tooltip>

          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#1976d2", lineHeight: 1 }}>
              ICJ ENTERPRISE
            </Typography>
          </Box>

          {/* Unified Global Enterprise Search */}
          <TextField
            size="small"
            value={globalQuery}
            onChange={handleSearchChange}
            placeholder="Global Search (Members, Cases, Documents)..."
            sx={{ width: { xs: 150, sm: 220, md: 320 }, "& .MuiInputBase-root": { height: 26, fontSize: "0.75rem" } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="primary" sx={{ fontSize: "0.9rem" }} /></InputAdornment>,
            }}
          />

          {/* Search Dropdown Popup */}
          <Menu
            anchorEl={searchAnchor}
            open={Boolean(searchAnchor && globalQuery.trim().length >= 2)}
            onClose={() => setSearchAnchor(null)}
            PaperProps={{ style: { width: 380, maxHeight: 350 } }}
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
            <MenuItem onClick={() => handleSearchResultClick(`/wallet?search=${encodeURIComponent(globalQuery)}`)}>
              <ListItemIcon><AccountBalanceWalletIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary={`Search Payments: "${globalQuery}"`} secondary="Finance Engine" />
            </MenuItem>
          </Menu>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <IconButton size="small" onClick={() => navigate("/notifications")}>
            <Badge badgeContent={12} color="error">
              <NotificationsIcon color="action" fontSize="small" />
            </Badge>
          </IconButton>

          <IconButton size="small" onClick={() => navigate("/settings")}>
            <SettingsIcon color="action" fontSize="small" />
          </IconButton>

          {/* UNIVERSAL USER IDENTITY BADGE — PROMINENT ON EVERY SINGLE PAGE */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              px: 1.2,
              py: 0.3,
              borderRadius: 2,
              bgcolor: "#0f172a",
              color: "#ffffff",
              border: "1px solid #1e293b",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            <Avatar sx={{ bgcolor: "#2563eb", fontWeight: "bold", width: 28, height: 28, fontSize: "0.82rem" }}>
              {userInitial}
            </Avatar>

            <Box textAlign="left">
              <Typography variant="body2" sx={{ fontWeight: 800, color: "#ffffff", fontSize: "0.78rem", lineHeight: 1.1 }}>
                {(() => {
                  const prefix = user?.namePrefix || user?.name_prefix || "";
                  const name = user?.fullName || user?.name || user?.username || "Logged User";
                  return prefix && !name.startsWith(prefix) ? `${prefix} ${name}` : name;
                })()}
              </Typography>

              <Stack direction="row" spacing={0.5} alignItems="center">
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
                    fontWeight: 800,
                    fontSize: "0.6rem",
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
              </Stack>
            </Box>

            <Button
              variant="contained"
              size="small"
              color="error"
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              sx={{ fontWeight: 800, ml: 0.5, px: 0.8, py: 0.2, minWidth: 50, fontSize: "0.68rem" }}
            >
              Exit
            </Button>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;