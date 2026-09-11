"use client";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BalanceIcon from "@mui/icons-material/Balance";
import BusinessIcon from "@mui/icons-material/Business";
import DescriptionIcon from "@mui/icons-material/Description";
import WorkIcon from "@mui/icons-material/Work";
import { Box, Stack, Typography } from "@mui/material";

import AccentIconBox from "@/components/ui/AccentIconBox";
import type { JudiciaryTier } from "@/constants/home";
import { RADIUS, SHADOW, TRANSITION } from "@/theme/designTokens";

const ICONS = {
  supreme: AccountBalanceIcon,
  "high-court": BalanceIcon,
  district: BusinessIcon,
  revenue: DescriptionIcon,
  tribunal: WorkIcon,
} as const;

const CARD_MIN_HEIGHT_SX = { xs: 180, sm: 200, md: 220, lg: 240 };

type Props = { tier: JudiciaryTier };

export default function JudiciaryTierCard({ tier }: Props) {
  const Icon = ICONS[tier.icon];

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: CARD_MIN_HEIGHT_SX,
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: RADIUS.md,
        border: `1.5px solid ${tier.border}`,
        bgcolor: "#fff",
        boxShadow: SHADOW.card,
        display: "flex",
        flexDirection: "column",
        transition: TRANSITION.smooth,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: SHADOW.cardHover,
        },
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", mb: 1.5, minHeight: 72 }}>
        <AccentIconBox color={tier.color} bg={tier.bg}>
          <Icon sx={{ color: tier.color, fontSize: 24 }} />
        </AccentIconBox>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.35,
            pt: 0.25,
            flex: 1,
            minWidth: 0,
          }}
        >
          {tier.title}
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        sx={{
          color: "#475569",
          lineHeight: 1.65,
          mb: 2,
          flex: 1,
          minHeight: 48,
        }}
      >
        {tier.description}
      </Typography>

      <Box
        sx={{
          px: 1.5,
          py: 1,
          mt: "auto",
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          borderRadius: RADIUS.sm,
          bgcolor: tier.chipBg,
          border: `1px solid ${tier.border}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: tier.chipColor, fontWeight: 700, lineHeight: 1.4, display: "block" }}
        >
          {tier.footer}
        </Typography>
      </Box>
    </Box>
  );
}
