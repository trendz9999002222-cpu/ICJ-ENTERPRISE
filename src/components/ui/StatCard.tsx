"use client";

import { Box, Card, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

// =============================================================================
// StatCard
//
// Reusable metric card used across admin and professional dashboards.
// Matches admin dashboard design tokens (colors, fonts, border, radius).
// =============================================================================

type StatCardProps = {
  /** Small uppercase label above the value */
  label: string;
  /** The main metric or text */
  value: string | number;
  /** MUI icon element */
  icon: ReactNode;
  /** Icon foreground color */
  color?: string;
  /** Icon background color */
  bgColor?: string;
  /** Optional value text color override */
  valueColor?: string;
};

export default function StatCard({
  label,
  value,
  icon,
  color = "#2563eb",
  bgColor = "#eff6ff",
  valueColor = "#0f172a",
}: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        bgcolor: "#ffffff",
        p: 2.5,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            p: 1.2,
            borderRadius: "10px",
            bgcolor: bgColor,
            color: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              color: "#64748b",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              fontSize: "0.68rem",
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 800,
              color: valueColor,
              lineHeight: 1.2,
              fontSize: "1.1rem",
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
