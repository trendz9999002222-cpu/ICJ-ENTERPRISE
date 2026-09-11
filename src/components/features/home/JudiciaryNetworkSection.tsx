"use client";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { Box, Chip, Container, Grid, Paper, Stack, Typography } from "@mui/material";

import AccentIconBox from "@/components/ui/AccentIconBox";
import { JUDICIARY_NETWORK, JUDICIARY_TIERS } from "@/constants/home";
import { RADIUS } from "@/theme/designTokens";

import JudiciaryTierCard from "./JudiciaryTierCard";

export default function JudiciaryNetworkSection() {
  const topTiers = JUDICIARY_TIERS.slice(0, 3);
  const bottomTiers = JUDICIARY_TIERS.slice(3);

  return (
    <Container maxWidth="xl" sx={{ mb: 6 }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3.5, lg: 4 },
          borderRadius: RADIUS.xl,
          border: "1px solid #e2e8f0",
          bgcolor: "#fff",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { lg: "flex-start" }, mb: { xs: 2, md: 3.5 } }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", flex: 1 }}>
            <AccentIconBox color="#1d4ed8" bg="#eff6ff">
              <AccountBalanceIcon sx={{ color: "#1d4ed8", fontSize: 28 }} />
            </AccentIconBox>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", mb: 0.75, lineHeight: 1.3 }}>
                {JUDICIARY_NETWORK.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 760, lineHeight: 1.6 }}>
                {JUDICIARY_NETWORK.subtitle}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={JUDICIARY_NETWORK.badge}
            sx={{
              bgcolor: "#0f172a",
              color: "#fbbf24",
              fontWeight: 800,
              px: 1,
              height: "auto",
              py: 0.75,
              borderRadius: RADIUS.sm,
              "& .MuiChip-label": { whiteSpace: "normal", textAlign: "center", lineHeight: 1.35 },
            }}
          />
        </Stack>

        <Grid container spacing={2.5} sx={{ alignItems: "stretch", mb: 2.5 }}>
          {topTiers.map((tier) => (
            <Grid key={tier.id} size={{ xs: 12, sm: 6, lg: 4 }} sx={{ display: "flex", width: "100%" }}>
              <JudiciaryTierCard tier={tier} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5} sx={{ alignItems: "stretch", justifyContent: "center" }}>
          {bottomTiers.map((tier) => (
            <Grid key={tier.id} size={{ xs: 12, sm: 6, lg: 4 }} sx={{ display: "flex", width: "100%" }}>
              <JudiciaryTierCard tier={tier} />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
}
