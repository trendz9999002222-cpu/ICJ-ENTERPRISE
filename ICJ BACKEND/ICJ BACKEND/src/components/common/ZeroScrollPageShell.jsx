import React, { useEffect } from "react";
import { Box, Paper, Stack, Button, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

/**
 * ZeroScrollPageShell — ICJ Enterprise Platform
 *
 * Universal 100vh Zero-Scroll Framework with Pure Fluid Free-Flow Navigation:
 * 1. Strictly 100vh viewport fitting (zero vertical scrolling).
 * 2. 1-Inch Top Dock (Title, Status, Context).
 * 3. 90% Clean Active Canvas (Symmetrical Boxes).
 * 4. 1-Inch Bottom Dock (Fluid [← पीछे] and [आगे बढ़ें →] navigation).
 * 5. Keyboard Navigation: ArrowLeft for Back, ArrowRight/Enter for Next.
 * 6. ZERO PAGE NUMBERS — No restrictive step counters!
 */
export default function ZeroScrollPageShell({
  title,
  subtitle,
  headerRightContent,
  children,
  canGoBack = false,
  canGoNext = false,
  onBack,
  onNext,
  backLabel = "← पीछे जाएं (Back)",
  nextLabel = "आगे बढ़ें (Next) →",
  nextDisabled = false,
}) {
  // Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept typing in input fields or textareas
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
        return;
      }

      if (e.key === "ArrowLeft" && canGoBack && onBack) {
        onBack();
      } else if ((e.key === "ArrowRight" || e.key === "Enter") && canGoNext && onNext && !nextDisabled) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canGoBack, canGoNext, onBack, onNext, nextDisabled]);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0f172a",
        color: "#f8fafc",
      }}
    >
      {/* 1. TOP 1-INCH DOCK */}
      <Paper
        elevation={0}
        sx={{
          height: 60,
          minHeight: 60,
          maxHeight: 60,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#0f172a",
          borderBottom: "1.5px solid #1e293b",
          color: "#ffffff",
          zIndex: 10,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box>
            <Typography variant="subtitle1" fontWeight={900} sx={{ color: "#f8fafc", lineHeight: 1.1 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontSize: "0.72rem" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        {headerRightContent && <Box>{headerRightContent}</Box>}
      </Paper>

      {/* 2. 90% CLEAN WORKSPACE CANVAS (ZERO VERTICAL SCROLL) */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          overflow: "hidden",
          p: 2,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f8fafc",
          color: "#0f172a",
        }}
      >
        {children}
      </Box>

      {/* 3. BOTTOM 1-INCH FLUID NAVIGATION DOCK */}
      <Paper
        elevation={0}
        sx={{
          height: 56,
          minHeight: 56,
          maxHeight: 56,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#0f172a",
          borderTop: "1.5px solid #1e293b",
          color: "#ffffff",
          zIndex: 10,
        }}
      >
        {/* Back Button */}
        <Box>
          {canGoBack && (
            <Button
              variant="outlined"
              size="medium"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{
                color: "#94a3b8",
                borderColor: "#334155",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2,
                px: 2.5,
                "&:hover": { borderColor: "#64748b", bgcolor: "#1e293b", color: "#ffffff" },
              }}
            >
              {backLabel}
            </Button>
          )}
        </Box>

        {/* Free Flow Helper */}
        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
          💡 फ्री-फ्लो नेविगेशन • कीबोर्ड <b>←</b> / <b>→</b> या <b>Enter</b> से आगे-पीछे जाएं
        </Typography>

        {/* Next Button */}
        <Box>
          {canGoNext && (
            <Button
              variant="contained"
              size="medium"
              endIcon={<ArrowForwardIcon />}
              onClick={onNext}
              disabled={nextDisabled}
              sx={{
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
                fontWeight: 800,
                textTransform: "none",
                borderRadius: 2,
                px: 3,
              }}
            >
              {nextLabel}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
