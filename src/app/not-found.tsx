"use client";

import React from "react";
import { Box, Container, Typography, Grid, Card, Button, Stack, Chip } from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import HomeIcon from "@mui/icons-material/Home";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";

const QUICK_LINKS = [
  { icon: <HomeIcon sx={{ color: "#2563eb" }} />, label: "Return to Homepage", href: "/" },
  { icon: <PersonSearchIcon sx={{ color: "#059669" }} />, label: "Find a Professional", href: "/professionals" },
  { icon: <SupportAgentIcon sx={{ color: "#7c3aed" }} />, label: "I Need Legal Help", href: "/assistance" },
  { icon: <SearchIcon sx={{ color: "#d97706" }} />, label: "Search Our Resources", href: "/search" },
];

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        py: 10,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box>
              <Chip
                icon={<GavelIcon />}
                label="International Consortium of Jurists"
                size="small"
                sx={{
                  bgcolor: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  mb: 3,
                  px: 1,
                  fontSize: "0.8rem",
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "6rem", md: "9rem" },
                  color: "#0f172a",
                  lineHeight: 1,
                  mb: 1,
                  letterSpacing: "-4px",
                }}
              >
                404
              </Typography>

              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5, lineHeight: 1.2 }}
              >
                Page Not Found
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: "#64748b", maxWidth: 480, lineHeight: 1.7, mb: 4 }}
              >
                The page you are looking for may have been moved, renamed, or is temporarily unavailable. Please use the navigation below or the universal search to find what you need.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  component={Link}
                  href="/"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "#0f172a",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3.5,
                    py: 1.3,
                    "&:hover": { bgcolor: "#1e293b" },
                  }}
                >
                  Go to Homepage
                </Button>
                <Button
                  component={Link}
                  href="/assistance"
                  variant="outlined"
                  size="large"
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3.5,
                    py: 1.3,
                    borderColor: "#cbd5e1",
                    color: "#0f172a",
                    "&:hover": { borderColor: "#2563eb" },
                  }}
                >
                  Request Legal Help
                </Button>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 2.5 }}>
                Helpful Quick Links
              </Typography>

              <Grid container spacing={2}>
                {QUICK_LINKS.map((link, idx) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                    <Box
                      component={Link}
                      href={link.href}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 2,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 2,
                        textDecoration: "none",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "#2563eb",
                          bgcolor: "#eff6ff",
                        },
                      }}
                    >
                      {link.icon}
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {link.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box
                sx={{
                  mt: 4,
                  p: 2.5,
                  bgcolor: "#0f172a",
                  borderRadius: 2.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#ffffff" }}>
                    Need Urgent Legal Help?
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    24-hour helpline: +91-9999002222
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  href="/assistance"
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: "#2563eb",
                    textTransform: "none",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  Get Help Now
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
