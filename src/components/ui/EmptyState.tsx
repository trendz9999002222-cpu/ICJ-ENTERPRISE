"use client";

import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

// =============================================================================
// EmptyState
//
// Consistent empty-state placeholder used when lists/tables have no data.
// Matches admin dashboard empty states.
// =============================================================================

type EmptyStateProps = {
  /** MUI icon element displayed above the message */
  icon: ReactNode;
  /** Main message text */
  message: string;
  /** Optional sub-message */
  description?: string;
  /** Optional action element (e.g. button) */
  action?: ReactNode;
};

export default function EmptyState({ icon, message, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 5,
        px: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Box sx={{ color: "#cbd5e1", mb: 1.5 }}>{icon}</Box>
      <Typography variant="body1" sx={{ fontWeight: 700, color: "#475569", mb: 0.5 }}>
        {message}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: "#94a3b8", maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
