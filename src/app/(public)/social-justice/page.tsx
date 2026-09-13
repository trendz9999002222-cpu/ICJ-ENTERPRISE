"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import FemaleIcon from "@mui/icons-material/Female";
import ElderlyIcon from "@mui/icons-material/Elderly";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PageHeader from "@/components/features/public/PageHeader";
import { socialImpactService } from "@/services/public";
import type { SocialImpactProgram } from "@/types/public";
import Link from "next/link";

export default function SocialJusticePage() {
  const [programs, setPrograms] = useState<SocialImpactProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialImpactService.listPrograms().then((data) => {
      setPrograms(data);
      setLoading(false);
    });
  }, []);

  const getProgramIcon = (title: string) => {
    if (title.toLowerCase().includes("stree") || title.toLowerCase().includes("women")) {
      return <FemaleIcon sx={{ color: "#ec4899", fontSize: 32 }} />;
    }
    if (title.toLowerCase().includes("vridh") || title.toLowerCase().includes("senior")) {
      return <ElderlyIcon sx={{ color: "#d97706", fontSize: 32 }} />;
    }
    return <Diversity1Icon sx={{ color: "#2563eb", fontSize: 32 }} />;
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="Social Justice & Pro Bono Initiatives"
        subtitle="Dedicated public interest legal aid programs structured to protect fundamental rights, support vulnerable groups, and empower marginalized citizens across India."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Social Justice" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {/* Core Pillars Grid */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {programs.map((prog) => (
              <Grid size={{ xs: 12, md: 6 }} key={prog.id}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3.5,
                    height: "100%",
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "#2563eb",
                      boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.08)",
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      {getProgramIcon(prog.title)}
                      <Chip
                        label={prog.beneficiaryGroup}
                        size="small"
                        sx={{
                          bgcolor: "#eff6ff",
                          color: "#1d4ed8",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                        }}
                      />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, fontSize: "1.2rem" }}>
                      {prog.title}
                    </Typography>

                    <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 700, display: "block", mb: 2 }}>
                      Focus: {prog.focusArea}
                    </Typography>

                    <Typography variant="body2" sx={{ color: "#475569", mb: 2.5, lineHeight: 1.6 }}>
                      {prog.description}
                    </Typography>

                    <Divider sx={{ my: 2, borderColor: "#f1f5f9" }} />

                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Structured Assistance Provided:
                    </Typography>
                    <List dense disablePadding sx={{ mt: 1, mb: 3 }}>
                      {prog.assistanceProvided.map((assist, aIdx) => (
                        <ListItem key={aIdx} disableGutters sx={{ py: 0.3 }}>
                          <ListItemIcon sx={{ minWidth: 22 }}>
                            <CheckCircleIcon sx={{ fontSize: 16, color: "#059669" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={assist}
                            slotProps={{ primary: { sx: { fontSize: "0.85rem", color: "#334155" } } }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Button
                    component={Link}
                    href="/assistance"
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: "#0f172a",
                      "&:hover": { bgcolor: "#1e293b" },
                    }}
                  >
                    Request Case Assistance
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Nyaya Daan Mudra Social Justice Integration Banner */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            bgcolor: "#0f172a",
            color: "#ffffff",
            borderRadius: 3,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <Box>
            <Chip
              label="TRANSPARENT SOCIAL JUSTICE CREDITS"
              size="small"
              sx={{ bgcolor: "rgba(37, 99, 235, 0.3)", color: "#93c5fd", fontWeight: 700, mb: 1.5 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
              Powered by Nyaya Daan Mudra
            </Typography>
            <Typography variant="body1" sx={{ color: "#94a3b8", maxWidth: 640, lineHeight: 1.6 }}>
              All social justice defense initiatives are funded through the Nyaya Daan Mudra social credit architecture, ensuring transparent honorarium disbursements to empaneled advocates and zero fee burden on needy citizens.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: { xs: "100%", md: "auto" } }}>
            <Button
              component={Link}
              href="/donate"
              variant="contained"
              sx={{
                bgcolor: "#2563eb",
                textTransform: "none",
                fontWeight: 700,
                px: 3.5,
                py: 1.3,
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              Sponsor a Social Justice Matter
            </Button>
            <Button
              component={Link}
              href="/nyaya-daan-mudra"
              variant="outlined"
              sx={{
                borderColor: "#475569",
                color: "#ffffff",
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1.3,
                whiteSpace: "nowrap",
                "&:hover": { borderColor: "#ffffff", bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              Learn About NDM
            </Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
