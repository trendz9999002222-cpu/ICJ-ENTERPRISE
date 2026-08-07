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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

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
              ICJ ENTERPRISE PLATFORM
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Unified Command Centre & Global Intelligence Layer
            </Typography>
          </Box>

          {/* Phase E — Unified Global Enterprise Search */}
          <TextField
            size="small"
            value={globalQuery}
            onChange={handleSearchChange}
            placeholder="Global Search (Members, Cases, Advocates, Documents, Payments)..."
            sx={{ width: 420 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
            }}
          />

          {/* Search Dropdown Popup */}
          <Menu
            anchorEl={searchAnchor}
            open={Boolean(searchAnchor && globalQuery.trim().length >= 2)}
            onClose={() => setSearchAnchor(null)}
            PaperProps={{ style: { width: 420, maxHeight: 350 } }}
          >
            <MenuItem disabled><Typography variant="caption" fontWeight="bold">UNIFIED GLOBAL MATCHES FOR "{globalQuery}"</Typography></MenuItem>
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
              <ListItemText primary={`Search Payments / Wallet: "${globalQuery}"`} secondary="Finance & Ledger Engine" />
            </MenuItem>
          </Menu>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate("/notifications")}>
            <Badge badgeContent={12} color="error">
              <NotificationsIcon color="action" />
            </Badge>
          </IconButton>

          <IconButton onClick={() => navigate("/settings")}>
            <SettingsIcon color="action" />
          </IconButton>

          <Box textAlign="right" sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography variant="body2" fontWeight="bold">
              {user?.fullName || user?.name || user?.username || "Super Admin"}
            </Typography>

            <Typography variant="caption" color="primary" sx={{ fontWeight: "bold" }}>
              Role: {(userRole || "Admin").toUpperCase()}
            </Typography>
          </Box>

          <Avatar sx={{ bgcolor: "#1976d2", fontWeight: "bold" }}>
            {userInitial}
          </Avatar>

          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            sx={{ fontWeight: "bold" }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;