"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BalanceIcon from "@mui/icons-material/Balance";
import DescriptionIcon from "@mui/icons-material/Description";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Box, Button, Card, Chip, Typography } from "@mui/material";

import type { OnboardingRoleOption } from "@/constants/onboarding";
import AccentIconBox from "@/components/ui/AccentIconBox";
import { RADIUS, SHADOW, TRANSITION, actionButtonSx } from "@/theme/designTokens";

const ICONS = {
  citizen: DescriptionIcon,
  advocate: BalanceIcon,
  franchise: StorefrontIcon,
} as const;

type Props = {
  role: OnboardingRoleOption;
  selected: boolean;
  onSelect: () => void;
  onProceed: () => void;
};

export default function RoleCard({ role, selected, onSelect, onProceed }: Props) {
  const Icon = ICONS[role.icon];

  return (
    <Card
      onClick={onSelect}
      elevation={0}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 340,
        display: "flex",
        flexDirection: "column",
        borderRadius: RADIUS.lg,
        border: `2.5px solid ${selected ? role.border : "#e2e8f0"}`,
        bgcolor: "#fff",
        boxShadow: selected ? SHADOW.cardHover : SHADOW.card,
        transition: TRANSITION.smooth,
        cursor: "pointer",
        overflow: "visible",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: SHADOW.cardHover,
          borderColor: role.border,
        },
      }}
    >
      <Box sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", height: "100%" }}>
        {selected && (
          <Chip
            label="चयनित (Selected) ✓"
            size="small"
            sx={{
              alignSelf: "flex-start",
              mb: 1.5,
              bgcolor: role.chipBg,
              color: role.chipColor,
              fontWeight: 800,
              borderRadius: RADIUS.sm,
            }}
          />
        )}

        <AccentIconBox color={role.color} bg={role.bg}>
          <Icon sx={{ color: role.color, fontSize: 26 }} />
        </AccentIconBox>

        <Typography sx={{ fontWeight: 900, color: role.chipBg, fontSize: { xs: "0.95rem", md: "1.05rem" }, mt: 2, mb: 0.5, lineHeight: 1.35 }}>
          {role.stepLabel}. {role.titleHi}
        </Typography>
        <Typography sx={{ color: role.color, fontWeight: 800, fontSize: "0.82rem", mb: 1.5 }}>
          {role.titleEn}
        </Typography>

        <Typography sx={{ color: "#475569", fontSize: "0.88rem", lineHeight: 1.65, mb: 3, flex: 1 }}>
          {role.descriptionHi}
        </Typography>

        <Button
          fullWidth
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={(e) => {
            e.stopPropagation();
            if (selected) onProceed();
            else onSelect();
          }}
          sx={{
            ...actionButtonSx(role.color),
            mt: "auto",
            borderRadius: RADIUS.sm,
          }}
        >
          {selected ? "आगे बढ़ें (Proceed to Step 2)" : "इसे चुनें (Select)"}
        </Button>
      </Box>
    </Card>
  );
}
