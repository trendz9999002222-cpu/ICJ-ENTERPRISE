import React, { useState, useEffect } from "react";
import {
  Paper,
  Stack,
  Box,
  Typography,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CheckIcon from "@mui/icons-material/Check";
import { GlobalLegalJurisdictionService, JURISDICTIONS } from "../../services/globalLegalJurisdictionService";
import LanguageService, { SUPPORTED_LANGUAGES } from "../../services/languageService";

export default function GlobalLanguageJurisdictionBar({ onJurisdictionChange, onLanguageChange }) {
  const [activeJurisdiction, setActiveJurisdiction] = useState(GlobalLegalJurisdictionService.getActiveJurisdiction());
  const [currentLang, setCurrentLang] = useState(LanguageService.getCurrentLanguage());
  const [langMenuAnchor, setLangMenuAnchor] = useState(null);

  useEffect(() => {
    const handleLangChange = (e) => {
      const newLang = e.detail || LanguageService.getCurrentLanguage();
      setCurrentLang(newLang);
      if (onLanguageChange) onLanguageChange(newLang);
    };

    window.addEventListener("icj_language_changed", handleLangChange);
    return () => window.removeEventListener("icj_language_changed", handleLangChange);
  }, [onLanguageChange]);

  const activeLangConfig = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const handleSelectJurisdiction = (jId) => {
    const updated = GlobalLegalJurisdictionService.setActiveJurisdiction(jId);
    setActiveJurisdiction(updated);
    if (onJurisdictionChange) onJurisdictionChange(updated);
  };

  const handleSelectLanguage = (langCode) => {
    LanguageService.setLanguage(langCode);
    setCurrentLang(langCode);
    setLangMenuAnchor(null);
  };

  return (
    <Paper
      elevation={2}
      className="bigtech-card glass-card"
      sx={{
        p: 1,
        mb: 2.5,
        borderRadius: "14px",
        bgcolor: "#0f172a",
        color: "#ffffff",
        border: "1px solid #1e293b",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        {/* 🌐 LEFT SIDE: CLEAN JURISDICTION SELECTOR (NO DUPLICATE CHIP) */}
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography variant="caption" fontWeight={800} color="#38bdf8" sx={{ whiteSpace: "nowrap" }}>
            🌐 Global Jurisdiction:
          </Typography>

          <Stack direction="row" spacing={0.6}>
            {Object.values(JURISDICTIONS).map((j) => (
              <Button
                key={j.id}
                size="small"
                variant={activeJurisdiction.id === j.id ? "contained" : "outlined"}
                onClick={() => handleSelectJurisdiction(j.id)}
                sx={{
                  py: 0.2,
                  px: 1,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  textTransform: "none",
                  height: 26,
                  bgcolor: activeJurisdiction.id === j.id ? "#0284c7" : "transparent",
                  color: "#ffffff",
                  borderColor: activeJurisdiction.id === j.id ? "#0284c7" : "#334155",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: "#0369a1" },
                }}
              >
                {j.flag} {j.id}
              </Button>
            ))}
          </Stack>
        </Stack>

        {/* 🗣️ RIGHT SIDE: CLEAN LANGUAGE SELECTOR DROPDOWN */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button
            size="small"
            variant="contained"
            startIcon={<LanguageIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => setLangMenuAnchor(e.currentTarget)}
            sx={{
              fontWeight: 800,
              fontSize: "0.75rem",
              textTransform: "none",
              bgcolor: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #334155",
              borderRadius: "8px",
              height: 26,
              px: 1.5,
              "&:hover": { bgcolor: "#334155" },
            }}
          >
            🌐 {activeLangConfig.nativeLabel} ({activeLangConfig.label}) ▼
          </Button>

          {/* Language Selection Menu (13 Languages) */}
          <Menu
            anchorEl={langMenuAnchor}
            open={Boolean(langMenuAnchor)}
            onClose={() => setLangMenuAnchor(null)}
            PaperProps={{
              style: {
                maxHeight: 360,
                width: 240,
                backgroundColor: "#1e293b",
                color: "#ffffff",
                borderRadius: "12px",
              },
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                selected={currentLang === lang.code}
                sx={{
                  "&:hover": { backgroundColor: "#334155" },
                  "&.Mui-selected": { backgroundColor: "#0284c7" },
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff", minWidth: 28 }}>
                  {currentLang === lang.code && <CheckIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={currentLang === lang.code ? "bold" : "normal"}>
                      {lang.nativeLabel} ({lang.label})
                    </Typography>
                  }
                />
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Stack>
    </Paper>
  );
}
