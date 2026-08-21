import { useState, useEffect } from "react";
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

  const activeLangConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

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

  const handleResetToEnglish = () => {
    LanguageService.setLanguage("en");
    setCurrentLang("en");
  };

  return (
    <Paper
      elevation={2}
      className="bigtech-card glass-card"
      sx={{
        p: 1.2,
        mb: 2.5,
        borderRadius: 2.5,
        bgcolor: "#0f172a",
        color: "#ffffff",
        border: "1px solid #1e293b",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
        
        {/* 🌐 LEFT SIDE: GLOBAL LEGAL JURISDICTION (INDIA, USA, UK, EU) */}
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" gap={0.5}>
          <Typography variant="body2" fontWeight="bold" color="#60a5fa" sx={{ whiteSpace: "nowrap" }}>
            {LanguageService.t("jurisdictionLabel", "🌐 Global Legal Jurisdiction:")}
          </Typography>
          <Chip
            label={`${activeJurisdiction.flag} ${activeJurisdiction.id}`}
            color="primary"
            size="small"
            sx={{ fontWeight: "bold", height: 24, fontSize: "0.72rem" }}
          />

          <Stack direction="row" spacing={0.5} ml={1}>
            {Object.values(JURISDICTIONS).map((j) => (
              <Button
                key={j.id}
                size="small"
                variant={activeJurisdiction.id === j.id ? "contained" : "outlined"}
                color="info"
                onClick={() => handleSelectJurisdiction(j.id)}
                sx={{
                  py: 0.2,
                  px: 1,
                  fontSize: "0.72rem",
                  fontWeight: "bold",
                  textTransform: "none",
                  height: 24,
                  borderColor: activeJurisdiction.id === j.id ? "#3b82f6" : "#334155",
                }}
              >
                {j.flag} {j.id}
              </Button>
            ))}
          </Stack>
        </Stack>

        {/* 🗣️ RIGHT SIDE: DECOUPLED LANGUAGE SELECTOR & PERMANENT ENGLISH FALLBACK */}
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          {/* Active Language Dropdown Button */}
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<LanguageIcon />}
            onClick={(e) => setLangMenuAnchor(e.currentTarget)}
            sx={{
              fontWeight: "bold",
              fontSize: "0.75rem",
              textTransform: "none",
              bgcolor: "#7c3aed",
              "&:hover": { bgcolor: "#6d28d9" },
              height: 28,
            }}
          >
            🌐 {activeLangConfig.nativeLabel} ({activeLangConfig.label}) ▼
          </Button>

          {/* 🚨 PERMANENT ENGLISH FALLBACK BUTTON (Always Visible & Accessible in 1-Click) */}
          <Button
            size="small"
            variant={currentLang === "en" ? "contained" : "outlined"}
            color="primary"
            onClick={handleResetToEnglish}
            sx={{
              fontWeight: 900,
              fontSize: "0.75rem",
              textTransform: "none",
              bgcolor: currentLang === "en" ? "#2563eb" : "transparent",
              color: "#ffffff",
              borderColor: "#3b82f6",
              letterSpacing: 0.5,
              height: 28,
              px: 1.5,
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            🇬🇧 ENGLISH
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
              },
            }}
          >
            <Box p={1} borderBottom="1px solid #334155">
              <Typography variant="caption" fontWeight="bold" color="#94a3b8">
                SELECT INTERFACE LANGUAGE (13)
              </Typography>
            </Box>

            {SUPPORTED_LANGUAGES.map((l) => (
              <MenuItem
                key={l.code}
                selected={currentLang === l.code}
                onClick={() => handleSelectLanguage(l.code)}
                sx={{
                  color: currentLang === l.code ? "#38bdf8" : "#f8fafc",
                  fontWeight: currentLang === l.code ? "bold" : "normal",
                  "&:hover": { bgcolor: "#334155" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 28, fontSize: "1rem" }}>
                  {l.flag}
                </ListItemIcon>
                <ListItemText
                  primary={`${l.nativeLabel} (${l.label})`}
                  primaryTypographyProps={{ fontSize: "0.82rem", fontWeight: "bold" }}
                />
                {currentLang === l.code && <CheckIcon fontSize="small" color="info" />}
              </MenuItem>
            ))}
          </Menu>
        </Stack>

      </Stack>
    </Paper>
  );
}
