"use client";

import { Box, Chip, Stack, Typography } from "@mui/material";
import BalanceIcon from "@mui/icons-material/Balance";
import DescriptionIcon from "@mui/icons-material/Description";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccentIconBox from "@/components/ui/AccentIconBox";
import { ONBOARDING_ROLES, type OnboardingRole } from "@/constants/onboarding";
import { RADIUS } from "@/theme/designTokens";

interface Props {
  stepNumber: number;
  titleHi: string;
  titleEn: string;
  descriptionHi?: string;
  descriptionEn?: string;
  role: OnboardingRole;
}

const ROLE_ICONS = {
  citizen: DescriptionIcon,
  advocate: BalanceIcon,
  franchise: StorefrontIcon,
} as const;

export default function StepIndicator({
  stepNumber,
  titleHi,
  titleEn,
  descriptionHi,
  descriptionEn,
  role,
}: Props) {
  const currentRoleConfig = ONBOARDING_ROLES.find((r) => r.id === role) || ONBOARDING_ROLES[0];
  const Icon = ROLE_ICONS[role] || BalanceIcon;

  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { xs: "flex-start", sm: "center" }, mb: 2 }}
      >
        <AccentIconBox color={currentRoleConfig.color} bg={currentRoleConfig.bg}>
          <Icon sx={{ color: currentRoleConfig.color, fontSize: 28 }} />
        </AccentIconBox>

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75, flexWrap: "wrap" }}>
            <Chip
              label={`Step ${stepNumber}`}
              size="small"
              sx={{
                bgcolor: currentRoleConfig.bg,
                color: currentRoleConfig.chipBg,
                fontWeight: 800,
                fontSize: "0.78rem",
                borderRadius: RADIUS.sm,
                border: `1px solid ${currentRoleConfig.border}`,
              }}
            />
            <Chip
              label={`${currentRoleConfig.titleHi} (${currentRoleConfig.titleEn})`}
              size="small"
              sx={{
                bgcolor: "#f1f5f9",
                color: "#334155",
                fontWeight: 700,
                fontSize: "0.78rem",
                borderRadius: RADIUS.sm,
                border: "1px solid #e2e8f0",
              }}
            />
          </Stack>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              color: "#0f172a",
              fontSize: { xs: "1.2rem", sm: "1.35rem", md: "1.5rem" },
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
          >
            {titleHi}
          </Typography>
          <Typography sx={{ color: currentRoleConfig.color, fontWeight: 700, fontSize: "0.88rem", mt: 0.25 }}>
            {titleEn}
          </Typography>
        </Box>
      </Stack>

      {(descriptionHi || descriptionEn) && (
        <Box
          sx={{
            p: 1.75,
            borderRadius: RADIUS.sm,
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
            mt: 1.5,
          }}
        >
          {descriptionHi && (
            <Typography sx={{ color: "#334155", fontSize: "0.88rem", fontWeight: 600 }}>
              {descriptionHi}
            </Typography>
          )}
          {descriptionEn && (
            <Typography sx={{ color: "#64748b", fontSize: "0.82rem", mt: 0.25 }}>
              {descriptionEn}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
