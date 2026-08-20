import React, { useState } from "react";
import { Paper, BottomNavigation, BottomNavigationAction, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import GavelIcon from "@mui/icons-material/Gavel";
import FolderIcon from "@mui/icons-material/Folder";
import MicIcon from "@mui/icons-material/Mic";
import PersonIcon from "@mui/icons-material/Person";
import LanguageService from "../../services/languageService";

export default function MobileAppBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(location.pathname);

  return (
    <Box
      sx={{
        display: { xs: "block", md: "none" }, // Show ONLY on Mobile Chrome screens
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <Paper elevation={3} sx={{ borderRadius: "16px 16px 0 0", overflow: "hidden", bgcolor: "#0f172a" }}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
            navigate(newValue);
          }}
          sx={{
            bgcolor: "#0f172a",
            height: 64,
            "& .MuiBottomNavigationAction-root": {
              color: "#94a3b8",
              py: 1,
              minWidth: "auto",
              "&.Mui-selected": {
                color: "#ffb703",
                fontWeight: 800,
              },
            },
          }}
        >
          <BottomNavigationAction
            label={LanguageService.t("btnHome", "Home")}
            value="/"
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            label={LanguageService.t("btnCases", "Cases")}
            value="/client-portal"
            icon={<GavelIcon />}
          />
          <BottomNavigationAction
            label={LanguageService.t("btnVault", "Vault")}
            value="/member-documents"
            icon={<FolderIcon />}
          />
          <BottomNavigationAction
            label={LanguageService.t("btnVoice", "Voice")}
            value="/ai-assistant"
            icon={<MicIcon sx={{ color: "#ef4444" }} />}
          />
          <BottomNavigationAction
            label={LanguageService.t("btnProfile", "Profile")}
            value="/member-profile"
            icon={<PersonIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
