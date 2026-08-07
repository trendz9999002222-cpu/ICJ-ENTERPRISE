import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";

function Topbar() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: "var(--icj-surface, #ffffff)",
        color: "var(--icj-text-primary, #212529)",
        borderBottom: "1px solid var(--icj-border, #dee2e6)",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
            }}
          >
            ICJ Enterprise Platform
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            International Consortium of Jurists
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton>
            <NotificationsIcon />
          </IconButton>

          <IconButton>
            <SettingsIcon />
          </IconButton>

          <Avatar sx={{ bgcolor: "#0B5ED7" }}>
            A
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;
