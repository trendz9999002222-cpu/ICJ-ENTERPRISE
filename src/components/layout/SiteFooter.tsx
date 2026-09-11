"use client";

import { Box, Container, Grid } from "@mui/material";

import FooterBrand from "@/components/layout/footer/FooterBrand";
import FooterContact from "@/components/layout/footer/FooterContact";
import FooterCopyright from "@/components/layout/footer/FooterCopyright";
import FooterLegalLinks from "@/components/layout/footer/FooterLegalLinks";

export default function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        zIndex: 2,
        bgcolor: "#0f172a",
        color: "#94a3b8",
        borderTop: "2px solid #1e293b",
        width: "100%",
        flexShrink: 0,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 5 } }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <FooterBrand />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FooterContact />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FooterLegalLinks />
          </Grid>
        </Grid>
        <FooterCopyright />
      </Container>
    </Box>
  );
}
