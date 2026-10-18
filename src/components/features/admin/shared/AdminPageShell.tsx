"use client";

import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import OnboardingTabs from "./OnboardingTabs";

// =============================================================================
// AdminPageShell
//
// Consistent page wrapper for all admin section pages.
// Provides: page title, subtitle, action button slot, and content area.
// =============================================================================

type Props = {
  title: string;
  subtitle?: string;
  /** Primary action button(s) rendered top-right */
  actions?: ReactNode;
  /** Optional Tabs component rendered below header */
  tabs?: ReactNode;
  children: ReactNode;
};

export default function AdminPageShell({
  title,
  subtitle,
  actions,
  tabs,
  children,
}: Props) {
  // Subtitle is client-only so SSR HTML matches first client paint (avoids hydration drift after HMR / copy changes).
  const [showSubtitle, setShowSubtitle] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    setShowSubtitle(true);
  }, []);

  let autoTabs = tabs;
  if (!autoTabs) {
    const isApplicationDetail =
      pathname.includes("/applications/") ||
      pathname.includes("/registrations/") ||
      Boolean(pathname.match(/\/admin\/(membership-onboarding|professional-onboarding)\/[0-9a-f-]{36}/i));

    if (!isApplicationDetail) {
      if (pathname.startsWith("/admin/professional-onboarding")) {
        autoTabs = <OnboardingTabs type="professional" />;
      } else if (pathname.startsWith("/admin/membership-onboarding")) {
        autoTabs = <OnboardingTabs type="membership" />;
      } else if (pathname.startsWith("/admin/honorable-advisory-onboarding")) {
        autoTabs = <OnboardingTabs type="honorable" />;
      } else if (pathname.startsWith("/admin/assistance-onboarding")) {
        autoTabs = <OnboardingTabs type="assistance" />;
      }
    }
  }

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
            sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          {subtitle && showSubtitle && (
            <Typography
              variant="body2"
              sx={{ color: "#64748b", mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Stack>

      {autoTabs && (
        <Box sx={{ mt: 1, mb: -3 }}>
          {autoTabs}
        </Box>
      )}

      <Divider sx={{ borderColor: "#e2e8f0" }} />

      {/* Page content */}
      <Box>{children}</Box>
    </Box>
  );
}
