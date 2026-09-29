"use client";

import {
  Box,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

// =============================================================================
// PortalPageShell
//
// Consistent page wrapper for all member and professional portal pages.
// Provides: dynamic page headline, subtitle, action button slot, and clean card/container layout.
// Matches AdminPageShell styling, font sizes, colors, and design tokens perfectly.
// =============================================================================

type Props = {
  title: string;
  subtitle?: string;
  /** Primary action button(s) rendered top-right */
  actions?: ReactNode;
  children: ReactNode;
};

export default function PortalPageShell({
  title,
  subtitle,
  actions,
  children,
}: Props) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Page header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
      >
        <Box>
          <Typography
            component="h1"
            variant="h5"
            sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2, letterSpacing: "-0.01em" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{ color: "#64748b", mt: 0.5, fontSize: "0.875rem" }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Stack>

      <Divider sx={{ borderColor: "#e2e8f0" }} />

      {/* Page content */}
      <Box>{children}</Box>
    </Box>
  );
}
