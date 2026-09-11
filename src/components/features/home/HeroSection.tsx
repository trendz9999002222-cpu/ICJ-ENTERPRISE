"use client";

import GavelIcon from "@mui/icons-material/Gavel";
import { Box, Chip, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";

import { RADIUS } from "@/theme/designTokens";

export default function HeroSection() {
  return (
    <Box
      component="section"
      className="icj-animate-fade-up"
      sx={{
        position: "relative",
        minHeight: { xs: 340, sm: 400, md: 460, lg: 500, xl: 540 },
        borderBottom: "1px solid rgba(203,213,225,0.6)",
        overflow: "hidden",
      }}
    >
      <Image
        src="/images/icj_HeroV1.0.png"
        alt="Supreme Court of India — ICJ Enterprise Legal Platform"
        fill
        priority
        quality={95}
        sizes="100vw"
        style={{
          objectFit: "cover",
          objectPosition: "left top",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: {
            xs: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(248,250,252,0.82) 100%)",
            md: "linear-gradient(90deg, rgba(15,23,42,0.04) 0%, rgba(255,255,255,0.12) 35%, rgba(255,255,255,0.72) 58%, rgba(255,255,255,0.92) 100%)",
          },
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
          pt: { xs: 3, sm: 4, md: 5, lg: 6 },
          pb: { xs: 3, sm: 4, md: 5, lg: 6 },
          minHeight: { xs: 340, sm: 400, md: 460, lg: 500, xl: 540 },
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            textAlign: { xs: "center", md: "right" },
            maxWidth: { md: 640, lg: 720 },
            ml: { md: "auto" },
            mr: { md: 2, lg: 3 },
            width: "100%",
          }}
        >
          <Chip
            icon={<GavelIcon sx={{ color: "#38bdf8 !important" }} />}
            label="Bar Council Rule 36 & IT Act Sec 79 Sovereign Compliant Digital Platform"
            size="small"
            className="icj-animate-float"
            sx={{
              bgcolor: "rgba(15,23,42,0.92)",
              color: "#38bdf8",
              fontWeight: 700,
              mb: { xs: 1.5, md: 2 },
              borderRadius: RADIUS.sm,
              boxShadow: "0 8px 24px rgba(15,23,42,0.25)",
              border: "1px solid rgba(56,189,248,0.25)",
              backdropFilter: "blur(8px)",
              height: "auto",
              fontSize: { xs: "0.68rem", sm: "0.72rem", md: "0.8rem" },
              "& .MuiChip-label": { whiteSpace: "normal", lineHeight: 1.35, py: 0.5 },
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.45rem", sm: "1.8rem", md: "2.5rem", lg: "3rem", xl: "3.1rem" },
              color: "#0f172a",
              mb: { xs: 1, md: 1.5 },
              lineHeight: 1.2,
              textShadow: "0 2px 20px rgba(255,255,255,0.9)",
            }}
          >
            विधिक सहायता, केस इनटेक एवं अधिकृत अधिवक्ता पैनल
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "0.875rem", sm: "0.95rem", md: "1.1rem", lg: "1.2rem" },
              color: "#334155",
              maxWidth: { xs: "100%", md: 700, lg: 900 },
              ml: { md: "auto" },
              lineHeight: 1.7,
              textShadow: "0 1px 12px rgba(255,255,255,0.85)",
            }}
          >
            140 करोड़ नागरिकों, अधिवक्ताओं और ज़िला केंद्रों के लिए अखिल भारतीय स्तर पर पारदर्शी, सशक्त और त्वरित डिजिटल न्याय मंच
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              mt: { xs: 2, md: 3 },
              justifyContent: { xs: "center", md: "flex-end" },
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {["Pan-India Coverage", "BCI Compliant", "24x7 Legal Desk"].map((label) => (
              <Chip
                key={label}
                label={label}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.9)",
                  color: "#1e40af",
                  fontWeight: 700,
                  borderRadius: RADIUS.sm,
                  border: "1px solid #bfdbfe",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.12)",
                  fontSize: { xs: "0.68rem", md: "0.75rem" },
                }}
              />
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
