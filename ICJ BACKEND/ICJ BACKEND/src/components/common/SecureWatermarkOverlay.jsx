import React from "react";
import { Box, Typography } from "@mui/material";
import useAuth from "../../hooks/useAuth";

export default function SecureWatermarkOverlay({ text = null }) {
  const { user } = useAuth();
  const displayId = text || `ICJ SOVEREIGN LEGAL PROTECTION • ${user?.member_id || user?.id || "ICJ-MEMBER"} • ${new Date().toLocaleDateString()}`;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 900,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "center",
        opacity: 0.035,
        userSelect: "none",
      }}
    >
      {[...Array(6)].map((_, i) => (
        <Typography
          key={i}
          variant="h3"
          sx={{
            fontWeight: 900,
            color: "#000000",
            transform: "rotate(-25deg)",
            whiteSpace: "nowrap",
            letterSpacing: 4,
          }}
        >
          {displayId}
        </Typography>
      ))}
    </Box>
  );
}
