"use client";

import BoltIcon from "@mui/icons-material/Bolt";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";

import AccentIconBox from "@/components/ui/AccentIconBox";
import InteractiveSurface from "@/components/ui/InteractiveSurface";
import { RADIUS, actionButtonSx } from "@/theme/designTokens";

export default function QuickUtilitiesBar() {
  return (
    <Container maxWidth="xl" sx={{ mb: { xs: 4, md: 6 } }} className="mt-300">
      <InteractiveSurface variant="dark" enableTilt={false} sx={{ backdropFilter: "blur(12px)" }}>
        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3, lg: 3.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 2, md: 2.5 }}
            sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <AccentIconBox color="#38bdf8" bg="rgba(56,189,248,0.15)">
                <BoltIcon sx={{ color: "#38bdf8", fontSize: { xs: 22, md: 26 } }} />
              </AccentIconBox>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#38bdf8",
                    mb: 0.25,
                    fontSize: { xs: "0.9rem", sm: "1rem", md: "1.05rem", lg: "1.1rem" },
                  }}
                >
                  त्वरित नागरिक सेवाएं (Quick Citizen Legal Utilities)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#94a3b8",
                    lineHeight: 1.5,
                    fontSize: { xs: "0.68rem", sm: "0.72rem", md: "0.75rem" },
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  बिना लॉगिन के सीधे CNR केस ट्रैकिंग, प्रमाणपत्र सत्यापन एवं वैधानिक सहायता
                </Typography>
              </Box>
            </Stack>
            <Stack
              direction="row"
              sx={{
                flexWrap: "wrap",
                gap: { xs: 1, md: 1.5 },
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Button
                component={Link}
                href="/track-case"
                variant="contained"
                size="small"
                startIcon={<SearchIcon sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }} />}
                sx={{
                  ...actionButtonSx("#2563eb"),
                  fontSize: { xs: "0.72rem", sm: "0.78rem", md: "0.8rem" },
                  px: { xs: 1.5, md: 2 },
                }}
              >
                ट्रैक केस स्टेटस
              </Button>
              <Button
                component={Link}
                href="/verify-certificate"
                variant="contained"
                size="small"
                startIcon={<VerifiedUserIcon sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }} />}
                sx={{
                  ...actionButtonSx("#d97706"),
                  fontSize: { xs: "0.72rem", sm: "0.78rem", md: "0.8rem" },
                  px: { xs: 1.5, md: 2 },
                }}
              >
                सर्टिफिकेट सत्यापन
              </Button>
              <Button
                component={Link}
                href="/login"
                variant="outlined"
                size="small"
                startIcon={<LockOpenIcon sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }} />}
                sx={{
                  color: "#34d399",
                  borderColor: "rgba(52,211,153,0.5)",
                  borderRadius: RADIUS.sm,
                  fontWeight: 800,
                  textTransform: "none",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.22s ease",
                  fontSize: { xs: "0.72rem", sm: "0.78rem", md: "0.8rem" },
                  px: { xs: 1.5, md: 2 },
                  "&:hover": {
                    borderColor: "#34d399",
                    bgcolor: "rgba(52,211,153,0.1)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(52,211,153,0.2)",
                  },
                }}
              >
                सदस्य पोर्टल लॉगिन
              </Button>
            </Stack>
          </Stack>
        </Box>
      </InteractiveSurface>
    </Container>
  );
}
