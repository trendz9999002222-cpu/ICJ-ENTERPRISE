"use client";

import ConstructionIcon from "@mui/icons-material/Construction";
import { Box, Chip, Stack, Typography } from "@mui/material";

/**
 * Persistent official notice — visible on every public page while the platform is in development.
 */
export default function PlatformDevelopmentNotice() {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          pointerEvents: "auto",
          mx: { xs: 0, sm: 2 },
          mb: { xs: 0, sm: 1.5 },
          borderRadius: { xs: 0, sm: 2 },
          border: "2px solid #f59e0b",
          borderBottom: { xs: "none", sm: "2px solid #f59e0b" },
          boxShadow: "0 -8px 32px rgba(15, 41, 66, 0.22)",
          background: "linear-gradient(90deg, #0f2942 0%, #132f4c 55%, #0f2942 100%)",
          px: { xs: 1.5, sm: 2.5 },
          py: { xs: 1.1, sm: 1.25 },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 0.75, sm: 2 }}
          sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "center" }}
        >
          <Chip
            icon={<ConstructionIcon sx={{ fontSize: "16px !important", color: "#fef3c7 !important" }} />}
            label="We will be available soon"
            sx={{
              height: 28,
              fontWeight: 800,
              fontSize: "0.72rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              bgcolor: "#b45309",
              color: "#fffbeb",
              border: "1px solid #fbbf24",
              animation: "icjSoonPulse 2.4s ease-in-out infinite",
              "@keyframes icjSoonPulse": {
                "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.45)" },
                "50%": { boxShadow: "0 0 0 6px rgba(245, 158, 11, 0)" },
              },
              "& .MuiChip-label": { px: 1 },
            }}
          />
          <Typography
            sx={{
              color: "rgba(255,255,255,0.92)",
              fontSize: { xs: "0.72rem", sm: "0.8125rem" },
              fontWeight: 600,
              lineHeight: 1.45,
              textAlign: { xs: "left", sm: "center" },
              maxWidth: 720,
            }}
          >
            Official notice: The International Consortium of Jurists digital platform is currently in{" "}
            <Box component="span" sx={{ color: "#fbbf24", fontWeight: 800 }}>
              active development mode and Each and every data is dummy data           </Box>
            . Some features are preview-only; full public services will be announced when we go live.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
