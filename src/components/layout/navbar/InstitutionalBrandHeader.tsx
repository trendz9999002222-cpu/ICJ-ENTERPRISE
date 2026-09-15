"use client";

import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function InstitutionalBrandHeader() {
  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        py: { xs: 1.5, sm: 2, md: 2.25 },
        width: "100%",
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          {/* ── Brand Identity: Logo + Bilingual Headings ── */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2, md: 2.5 },
              textDecoration: "none",
              color: "inherit",
              flexShrink: 0,
            }}
          >
            {/* Circular ICJ Seal */}
            <Box
              sx={{
                position: "relative",
                width: { xs: 52, sm: 64, md: 74, lg: 82 },
                height: { xs: 52, sm: 64, md: 74, lg: 82 },
                flexShrink: 0,
                borderRadius: "50%",
                boxShadow: "0 4px 14px rgba(15,23,42,0.12)",
                p: 0.4,
                bgcolor: "#ffffff",
                border: "2px solid #e2e8f0",
              }}
            >
              <Image
                src="/images/icj-logo.png"
                alt="International Consortium of Jurists — Official Emblem"
                width={82}
                height={82}
                priority
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }}
              />
            </Box>

            {/* Typography hierarchy */}
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.95rem" },
                  fontWeight: 600,
                  color: "#475569",
                  lineHeight: 1.2,
                  letterSpacing: "0.01em",
                }}
              >
                अंतर्राष्ट्रीय न्यायविद संघ
              </Typography>

              <Typography
                component="span"
                sx={{
                  fontSize: { xs: "1.05rem", sm: "1.35rem", md: "1.65rem", lg: "1.8rem" },
                  fontWeight: 900,
                  color: "#0f2942",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                  my: 0.2,
                  display: "block",
                }}
              >
                International Consortium of Jurists
              </Typography>

              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                    fontWeight: 700,
                    color: "#b45309",
                    letterSpacing: "0.04em",
                  }}
                >
                  Justice • Integrity • Humanity
                </Typography>

                <Box
                  sx={{
                    display: { xs: "none", md: "inline-block" },
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    bgcolor: "#cbd5e1",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#64748b",
                    display: { xs: "none", md: "inline" },
                  }}
                >
                  Statutory Non-Profit Legal Guild &amp; Pro Bono Mission
                </Typography>
              </Stack>
            </Box>
          </Box>

          {/* ── Right Side: Badge + CTA Buttons (desktop only) ── */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", display: { xs: "none", lg: "flex" } }}
          >
            {/* Quality credential badge — xl+ only */}
            <Box
              sx={{
                display: { xs: "none", xl: "flex" },
                alignItems: "center",
                gap: 1.5,
                p: 1.25,
                px: 2,
                borderRadius: 2,
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <SecurityOutlinedIcon sx={{ color: "#059669", fontSize: 26 }} />
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "#0f172a" }}>
                  Empaneled Jurists Registry
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                  ISO 9001:2015 Audited Legal Aid
                </Typography>
              </Box>
            </Box>

            {/* Member Login — navy outline */}
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              startIcon={<AccountCircleOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderColor: "#0f2942",
                color: "#0f2942",
                fontWeight: 700,
                fontSize: "0.85rem",
                textTransform: "none",
                px: 2,
                py: 0.9,
                borderRadius: 2,
                whiteSpace: "nowrap",
                "&:hover": { borderColor: "#1e3a5f", bgcolor: "#f0f4f8", color: "#1e3a5f" },
              }}
            >
              Login
            </Button>

            {/* Seek Legal Assistance — primary CTA */}
            <Button
              component={Link}
              href="/join"
              variant="contained"
              startIcon={<GavelIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: "#0f2942",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.875rem",
                textTransform: "none",
                px: 2.5,
                py: 1,
                borderRadius: 2,
                boxShadow: "0 4px 14px rgba(15,41,66,0.35)",
                whiteSpace: "nowrap",
                borderBottom: "3px solid #b45309",
                "&:hover": { bgcolor: "#1e3a5f" },
              }}
            >
              Register as Professional
            </Button>

            {/* <Button
              component={Link}
              href="/assistance"
              variant="contained"
              startIcon={<GavelIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: "#0f2942",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.875rem",
                textTransform: "none",
                px: 2.5,
                py: 1,
                borderRadius: 2,
                boxShadow: "0 4px 14px rgba(15,41,66,0.35)",
                whiteSpace: "nowrap",
                borderBottom: "3px solid #b45309",
                "&:hover": { bgcolor: "#1e3a5f" },
              }}
            >
              Seek Legal Assistance
            </Button> */}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
