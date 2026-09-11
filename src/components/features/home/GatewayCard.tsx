"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BalanceIcon from "@mui/icons-material/Balance";
import DescriptionIcon from "@mui/icons-material/Description";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Box, Button, Card, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import Link from "next/link";

import AccentIconBox from "@/components/ui/AccentIconBox";
import {
  GATEWAY_CARD_TITLE_SX,
  GATEWAY_CHIP_SX,
  type GatewayCard as GatewayCardType,
} from "@/constants/home";
import { RADIUS, SHADOW, TRANSITION, actionButtonSx } from "@/theme/designTokens";

const ICONS = {
  citizen: DescriptionIcon,
  advocate: BalanceIcon,
  franchise: StorefrontIcon,
} as const;

type Props = { card: GatewayCardType };

export default function GatewayCard({ card }: Props) {
  const Icon = ICONS[card.id as keyof typeof ICONS] ?? DescriptionIcon;

  return (
    <Card
      elevation={0}
      sx={{
        flex: 1,
        width: "100%",
        display: "flex",
        borderRadius: RADIUS.lg,
        border: `2.5px solid ${card.border}`,
        bgcolor: "#fff",
        boxShadow: SHADOW.card,
        transition: TRANSITION.smooth,
        overflow: "visible",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: SHADOW.cardHover,
          "& .icj-icon-box": { transform: "scale(1.06)" },
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={card.href}
        sx={{
          flex: 1,
          width: "100%",
          p: { xs: 2, sm: 2.5, md: 3, lg: 3.5 },
          pt: { xs: 2.5, sm: 3, md: 3.5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "space-between",
          minHeight: { xs: "auto", sm: 280, md: 360, lg: 400, xl: 420 },
          borderRadius: RADIUS.lg,
          overflow: "visible",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Chip
            label={card.chip}
            sx={{
              ...GATEWAY_CHIP_SX,
              bgcolor: card.chipBg,
              color: card.chipColor,
              mb: 2,
              width: "fit-content",
              maxWidth: "100%",
            }}
          />

          <Stack direction="row" spacing={1.5} sx={{ mb: 2, alignItems: "flex-start" }}>
            <AccentIconBox color={card.color} bg={card.bg}>
              <Icon sx={{ color: card.color, fontSize: 26 }} />
            </AccentIconBox>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h5" sx={{ ...GATEWAY_CARD_TITLE_SX, fontWeight: 900, color: card.chipBg }}>
                {card.title}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 800, color: card.color, lineHeight: 1.4 }}>
            {card.subtitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.65 }}>
            {card.description}
          </Typography>
        </Box>
        <Button
          variant="contained"
          fullWidth
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{
            ...actionButtonSx(card.color),
            mt: "auto",
            borderRadius: RADIUS.sm,
            whiteSpace: "normal",
            lineHeight: 1.35,
            py: 1.25,
            textAlign: "center",
          }}
        >
          {card.cta}
        </Button>
      </CardActionArea>
    </Card>
  );
}
