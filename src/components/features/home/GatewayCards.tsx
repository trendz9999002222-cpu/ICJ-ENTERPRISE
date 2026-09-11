"use client";

import { Container, Grid } from "@mui/material";

import { GATEWAY_CARDS } from "@/constants/home";

import GatewayCard from "./GatewayCard";

export default function GatewayCards() {
  return (
    <Container
      maxWidth="xl"
      sx={{
        position: "relative",
        zIndex: 3,
        mt: { xs: 2, md: 3 },
        mb: 6,
        overflow: "visible",
      }}
    >
      <Grid container spacing={3} sx={{ flexWrap: { xs: "wrap", lg: "nowrap" }, alignItems: "stretch" }}>
        {GATEWAY_CARDS.map((card, index) => (
          <Grid
            key={card.id}
            size={{ xs: 12, sm: 6, lg: 4 }}
            sx={{
              display: "flex",
              minWidth: 0,
              width: "100%",
              animation: `icj-fade-up 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.1}s both`,
            }}
          >
            <GatewayCard card={card} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
