"use client";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BalanceIcon from "@mui/icons-material/Balance";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Avatar, Box, Button, Container, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";

import LegalDisclaimer from "@/components/features/public/LegalDisclaimer";
import PageHeader from "@/components/features/public/PageHeader";
import { aboutData } from "@/data/public/about";
import { useEffect, useState } from "react";
import { honorableAdvisoryService, type HonorableAdvisoryMember } from "@/services/public/honorableAdvisory.service";

export default function AboutPage() {
  const [members, setMembers] = useState<HonorableAdvisoryMember[]>([]);

  useEffect(() => {
    honorableAdvisoryService.fetchMembers().then(setMembers).catch(console.error);
  }, []);

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", pb: 8 }}>
      <PageHeader
        badge="About the Consortium"
        title="International Consortium of Jurists"
        subtitle="An independent global alliance of jurists, advocates, academics, and dispute resolution specialists dedicated to the rule of law, legal literacy, and universal access to justice."
        breadcrumbs={[{ label: "About ICJ" }]}
        primaryAction={{ label: "Join the Consortium", href: "/join" }}
        secondaryAction={{ label: "View Honorable Advisory Board", href: "#governance" }}
      />

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 5 }}>
        {/* Mission & Vision Section */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 3.5,
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
                height: "100%",
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "#eff6ff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <FlagOutlinedIcon sx={{ color: "#2563eb", fontSize: 24 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Our Mission
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: "#475569", lineHeight: 1.7, fontSize: "0.95rem" }}>
                {aboutData.mission}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 3.5,
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
                height: "100%",
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: "#eff6ff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <VisibilityOutlinedIcon sx={{ color: "#2563eb", fontSize: 24 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Our Vision
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: "#475569", lineHeight: 1.7, fontSize: "0.95rem" }}>
                {aboutData.vision}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Core Values Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: "center", maxWidth: 640, mx: "auto", mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Our Core Institutional Values
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              The ethical principles guiding every initiative and member of the consortium.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {aboutData.coreValues.map((val, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    height: "100%",
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#2563eb", fontSize: 24, mb: 1.5 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.75 }}>
                    {val.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.55 }}>
                    {val.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Honorable Advisory Board Section */}
        <Box id="governance" sx={{ mb: 8, scrollMarginTop: 100 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", mb: 4, gap: 2 }}>
            <Box sx={{ maxWidth: 640 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
                Honorable Advisory Board
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                Distinguished jurists and practitioners stewarding ICJ policies and ethical standards.
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {members.map((member) => (
              <Grid key={member.id} size={{ xs: 12, sm: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    borderRadius: 3.5,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    height: "100%",
                  }}
                >
                  <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", mb: 2 }}>
                    <Avatar src={member.photo_url || undefined} sx={{ width: 56, height: 56, bgcolor: "#2563eb", fontWeight: 800, fontSize: "1.2rem" }}>
                      {!member.photo_url && member.name
                        .replace(/^Hon'ble\s*|^Justice\s*|\(Retd\.\)\s*|^Prof\.\s*|^Dr\.\s*|^Adv\.\s*/gi, "")
                        .trim()
                        .slice(0, 2)
                        .toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.1rem" }}>
                        {member.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#2563eb", fontWeight: 600 }}>
                        {member.role}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        {member.qualification}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                    {member.bio}
                  </Typography>
                </Paper>
              </Grid>
            ))}
            {members.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "#fff" }}>
                  <Typography variant="body1" color="text.secondary">
                    No active members currently displayed.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 3 }}>
            Institutional Milestones
          </Typography>

          <Grid container spacing={2.5}>
            {aboutData.institutionalMilestones.map((m, idx) => (
              <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    height: "100%",
                  }}
                >
                  <Typography sx={{ fontWeight: 900, color: "#2563eb", fontSize: "1.5rem", mb: 0.5 }}>
                    {m.year}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.75 }}>
                    {m.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.825rem", lineHeight: 1.5 }}>
                    {m.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <LegalDisclaimer />
      </Container>
    </Box>
  );
}
