import { useState, useMemo, useEffect } from "react";
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
  Select,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import GavelIcon from "@mui/icons-material/Gavel";
import FolderIcon from "@mui/icons-material/Folder";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LanguageIcon from "@mui/icons-material/Language";

import useAuth from "../hooks/useAuth";
import LanguageService from "../services/languageService";

function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [langMode, setLangMode] = useState(LanguageService.getCurrentLanguage());

  const supportedLanguages = LanguageService.getSupportedLanguages();

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setLangMode(newLang);
    LanguageService.setLanguage(newLang);
  };

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
      elevation={1}
      sx={{
        background: "#ffffff",
        color: "#212529",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1976d2", lineHeight: 1.2 }}>
              {LanguageService.t("brandTitle", "ICJ ENTERPRISE PLATFORM")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {LanguageService.t("brandSubtitle", "Unified Legal Command Centre & AI Intelligence Layer")}
            </Typography>
          </Box>

          {/* Phase E — Unified Global Enterprise Search */}
          <TextField
            size="small"
            value={globalQuery}
            onChange={handleSearchChange}
            placeholder={LanguageService.t("globalSearchPlaceholder", "Global Search (Members, Cases, Advocates)...")}
            sx={{ width: 380 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
            }}
          />

          {/* Search Dropdown Popup */}
          <Menu
            anchorEl={searchAnchor}
            open={Boolean(searchAnchor && globalQuery.trim().length >= 2)}
            onClose={() => setSearchAnchor(null)}
            PaperProps={{ style: { width: 380, maxHeight: 350 } }}
          >
            <MenuItem onClick={() => handleSearchResultClick(`/membership?search=${encodeURIComponent(globalQuery)}`)}>
              <ListItemIcon><PersonIcon fontSize="small" color="primary" /></ListItemIcon>
              <ListItemText primary={`Search Members: "${globalQuery}"`} secondary="Master Member Directory" />
            </MenuItem>
            <MenuItem onClick={() => handleSearchResultClick(`/legal?search=${encodeURIComponent(globalQuery)}`)}>
              <ListItemIcon><GavelIcon fontSize="small" color="secondary" /></ListItemIcon>
              <ListItemText primary={`Search Cases / Writs: "${globalQuery}"`} secondary="Legal Matter Ecosystem" />
            </MenuItem>
          </Menu>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Multi-Language & Script Selector Dropdown */}
          <Select
            size="small"
            value={langMode}
            onChange={handleLangChange}
            startAdornment={<LanguageIcon sx={{ color: "#1976d2", mr: 1, fontSize: 20 }} />}
            sx={{
              bgcolor: "#f8fafc",
              fontWeight: 700,
              fontSize: "0.85rem",
              borderRadius: 2,
              "& .MuiSelect-select": { py: 0.8, px: 1.5, display: "flex", alignItems: "center" },
            }}
          >
            {supportedLanguages.map((l) => (
              <MenuItem key={l.code} value={l.code} sx={{ fontWeight: 600 }}>
                {l.flag} {l.label}
              </MenuItem>
            ))}
          </Select>

          <IconButton onClick={() => navigate("/notifications")}>
            <Badge badgeContent={12} color="error">
              <NotificationsIcon color="action" />
            </Badge>
          </IconButton>

          <IconButton onClick={() => navigate("/settings")}>
            <SettingsIcon color="action" />
          </IconButton>

          {/* TOP RIGHT USER IDENTIFICATION BADGE — VISIBLE ON EVERY PAGE */}
          <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: "rgba(245, 247, 250, 0.9)",
              border: "1px solid #e2e8f0",
            }}
          >
            <Box textAlign="right">
              <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                {(() => {
                  const prefix = user?.namePrefix || user?.name_prefix || "";
                  const name = user?.fullName || user?.name || user?.username || "Logged User";
                  return prefix && !name.startsWith(prefix) ? `${prefix} ${name}` : name;
                })()}
              </Typography>

              <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center" sx={{ mt: 0.3 }}>
                <Chip
                  label={
                    userRole === "super_admin" || user?.user_type === "super_admin" || user?.username === "ICJSuperAdmin1234"
                      ? "👑 SUPER ADMIN"
                      : userRole === "admin"
                      ? "🛡️ ADMIN"
                      : userRole === "employee"
                      ? "💼 ICJ STAFF"
                      : "🟢 MEMBER"
                  }
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.65rem",
                    height: 18,
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

            <Avatar sx={{ bgcolor: "#1976d2", width: 36, height: 36, fontWeight: "bold" }}>
              {userInitial}
            </Avatar>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;