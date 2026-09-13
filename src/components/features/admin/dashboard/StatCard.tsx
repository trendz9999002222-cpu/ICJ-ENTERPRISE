"use client";

import {
  AssignmentInd as AssignmentIndIcon,
  CalendarMonth as CalendarMonthIcon,
  FolderOpen as FolderOpenIcon,
  Gavel as GavelIcon,
  PeopleAlt as PeopleAltIcon,
  ReportProblem as ReportProblemIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { DashboardStat } from "@/types/admin";

// ---------------------------------------------------------------------------
// Icon resolver — maps string icon names to MUI components
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, ReactNode> = {
  PeopleAlt: <PeopleAltIcon sx={{ fontSize: 26 }} />,
  Gavel: <GavelIcon sx={{ fontSize: 26 }} />,
  AssignmentInd: <AssignmentIndIcon sx={{ fontSize: 26 }} />,
  FolderOpen: <FolderOpenIcon sx={{ fontSize: 26 }} />,
  CalendarMonth: <CalendarMonthIcon sx={{ fontSize: 26 }} />,
  ReportProblem: <ReportProblemIcon sx={{ fontSize: 26 }} />,
};

const COLOR_MAP: Record<string, { bg: string; icon: string; badge: string }> = {
  primary:   { bg: "#eff6ff", icon: "#2563eb", badge: "#dbeafe" },
  success:   { bg: "#f0fdf4", icon: "#16a34a", badge: "#dcfce7" },
  warning:   { bg: "#fffbeb", icon: "#d97706", badge: "#fef3c7" },
  info:      { bg: "#f0f9ff", icon: "#0284c7", badge: "#e0f2fe" },
  secondary: { bg: "#faf5ff", icon: "#7c3aed", badge: "#ede9fe" },
  error:     { bg: "#fff1f2", icon: "#dc2626", badge: "#fee2e2" },
};

// ---------------------------------------------------------------------------

type Props = {
  stat: DashboardStat;
};

export default function StatCard({ stat }: Props) {
  const colors = COLOR_MAP[stat.color] ?? COLOR_MAP.primary;
  const icon = ICON_MAP[stat.icon] ?? <PeopleAltIcon sx={{ fontSize: 26 }} />;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid #e2e8f0",
        borderRadius: 3,
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Icon badge */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: colors.bg,
            display: "grid",
            placeItems: "center",
            color: colors.icon,
          }}
        >
          {icon}
        </Box>

        {/* Trend badge */}
        {stat.trend && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: "center",
              px: 1,
              py: 0.4,
              borderRadius: 5,
              bgcolor: stat.trend.direction === "up"
                ? "#f0fdf4"
                : stat.trend.direction === "down"
                  ? "#fff1f2"
                  : "#f8fafc",
              color: stat.trend.direction === "up"
                ? "#16a34a"
                : stat.trend.direction === "down"
                  ? "#dc2626"
                  : "#64748b",
            }}
          >
            {stat.trend.direction === "up" ? (
              <TrendingUpIcon sx={{ fontSize: 14 }} />
            ) : stat.trend.direction === "down" ? (
              <TrendingDownIcon sx={{ fontSize: 14 }} />
            ) : null}
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.7rem" }}>
              {stat.trend.value}%
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Value */}
      <Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1 }}
        >
          {typeof stat.value === "number" ? stat.value.toLocaleString("en-IN") : stat.value}
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5, fontWeight: 500 }}>
          {stat.label}
        </Typography>
        {stat.trend && (
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            {stat.trend.label}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
