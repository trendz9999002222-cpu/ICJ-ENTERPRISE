import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Stack, Button, Chip } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LanguageService from "../../services/languageService";

export default function SmartStepGuideBanner({
  statusKey = "guideOnboardingStatus",
  nextKey = "guideOnboardingNext",
  audioKey = "audioOnboarding",
  customStatusText = "",
  customNextText = "",
  customAudioText = "",
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lang, setLang] = useState(LanguageService.getCurrentLanguage());

  useEffect(() => {
    const handleLangChange = (e) => {
      setLang(e.detail || LanguageService.getCurrentLanguage());
    };
    window.addEventListener("icj_language_changed", handleLangChange);
    return () => {
      window.removeEventListener("icj_language_changed", handleLangChange);
    };
  }, []);

  const statusText = customStatusText || LanguageService.t(statusKey);
  const nextText = customNextText || LanguageService.t(nextKey);
  const audioText = customAudioText || LanguageService.t(audioKey) || `${statusText} ${nextText}`;

  const handleToggleAudio = () => {
    if (isPlaying) {
      LanguageService.stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      LanguageService.speakText(audioText);
      // Auto reset playing state after 8 seconds
      setTimeout(() => setIsPlaying(false), 8000);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 2.5,
        p: 1.5,
        px: 2.5,
        borderRadius: 3,
        background: "linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)",
        color: "#ffffff",
        borderLeft: "6px solid #ffb703",
        boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={1.5}
      >
        {/* Step Direction Text */}
        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
          <Chip
            icon={<HelpOutlineIcon sx={{ color: "#ffffff !important" }} />}
            label="1-LINE SMART GUIDE"
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.72rem",
              letterSpacing: 0.5,
            }}
          />

          <Typography variant="body2" sx={{ fontWeight: 600, color: "#e2e8f0" }}>
            💡 {statusText}
          </Typography>

          <Typography variant="body2" sx={{ fontWeight: 800, color: "#ffb703", display: "inline-flex", alignItems: "center", gap: 0.5 }}>
            👉 {nextText}
          </Typography>
        </Stack>

        {/* Audio Assistance Button */}
        <Button
          variant="contained"
          size="small"
          onClick={handleToggleAudio}
          startIcon={isPlaying ? <VolumeOffIcon /> : <VolumeUpIcon />}
          sx={{
            bgcolor: isPlaying ? "#d32f2f" : "#ffb703",
            color: isPlaying ? "#ffffff" : "#0f172a",
            fontWeight: 800,
            px: 2,
            py: 0.6,
            borderRadius: 2,
            textTransform: "none",
            "&:hover": {
              bgcolor: isPlaying ? "#b71c1c" : "#fb8500",
            },
          }}
        >
          {isPlaying ? LanguageService.t("btnStopAudio", "Stop Audio") : LanguageService.t("btnListen", "Listen Audio 🔊")}
        </Button>
      </Stack>
    </Paper>
  );
}
