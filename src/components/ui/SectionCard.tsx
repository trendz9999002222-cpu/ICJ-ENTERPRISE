"use client";

import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

// =============================================================================
// SectionCard
//
// Consistent card wrapper with title, subtitle, and optional top-right action.
// Matches admin dashboard card design (flat, bordered, 12px radius).
// =============================================================================

type SectionCardProps = {
  /** Card heading */
  title: string;
  /** Optional description below heading */
  subtitle?: string;
  /** Optional icon before the title */
  icon?: ReactNode;
  /** Action element (button/chip) rendered top-right */
  action?: ReactNode;
  /** Card body */
  children: ReactNode;
  /** Whether to remove internal padding (useful when children have their own padding) */
  noPadding?: boolean;
};

export default function SectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
  noPadding = false,
}: SectionCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        bgcolor: "#ffffff",
      }}
    >
      <CardContent sx={{ p: noPadding ? 0 : 3, "&:last-child": { pb: noPadding ? 0 : 3 } }}>
        {/* Header row */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mb: noPadding ? 0 : 2,
            ...(noPadding && { px: 3, pt: 2.5, pb: 1.5 }),
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            {icon && (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  bgcolor: "#eff6ff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Stack>

        {/* Body */}
        {children}
      </CardContent>
    </Card>
  );
}
