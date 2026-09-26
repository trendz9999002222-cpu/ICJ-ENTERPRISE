"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

import PageHeader from "@/components/features/public/PageHeader";
import { membershipOnboardingPublicService } from "@/services/public/membershipOnboardingPublic.service";
import type { MembershipTypePublic } from "@/types/public/membershipOnboarding";

const BENEFITS = [
  "Verified institutional membership registry",
  "Digital credentials and professional visibility",
  "Access to pro bono panels and policy working groups",
  "Research, events, and fraternity networking",
];

const PROCESS = [
  "Choose your membership type",
  "Complete the dynamic application form",
  "Upload required documents",
  "Accept declaration and submit",
  "Admin review and approval (no payment in this phase)",
];

export default function MembershipPage() {
  const [types, setTypes] = useState<MembershipTypePublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    membershipOnboardingPublicService
      .fetchTypes()
      .then(setTypes)
      .catch(() => setTypes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="Institutional & Professional Membership"
        subtitle="Join the International Consortium of Jurists — a fraternity dedicated to rule of law, constitutional jurisprudence, and public justice."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Membership" }]}
        primaryAction={{
          label: "Become a Member",
          href: "/join-membership",
          icon: <CardMembershipIcon />,
        }}
      />

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Why become a member?</Typography>
            <Typography sx={{ color: "#475569", lineHeight: 1.7, mb: 3 }}>
              Membership connects you to a national network of jurists, practitioners, and citizens committed to
              accessible justice. Applications are reviewed by the ICJ secretariat — payment integration will be added in a
              later phase.
            </Typography>
            <List dense>
              {BENEFITS.map((b) => (
                <ListItem key={b} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleIcon sx={{ color: "#059669", fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText primary={b} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontWeight: 800, mb: 1 }}>Application process</Typography>
              <List dense>
                {PROCESS.map((step, i) => (
                  <ListItem key={step} disableGutters>
                    <ListItemText primary={`${i + 1}. ${step}`} slotProps={{ primary: { sx: { fontSize: "0.9rem" } } }} />
                  </ListItem>
                ))}
              </List>
              <Button
                component={Link}
                href="/join-membership"
                variant="contained"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 2, py: 1.2, textTransform: "none", fontWeight: 700, bgcolor: "#2563eb" }}
              >
                Apply for Membership
              </Button>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Membership types</Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : types.length === 0 ? (
          <Typography sx={{ color: "#64748b" }}>No membership types are configured yet. Please check back soon.</Typography>
        ) : (
          <Grid container spacing={3}>
            {types.map((type) => (
              <Grid size={{ xs: 12, md: 6 }} key={type.id}>
                <Card sx={{ p: 3, height: "100%", borderRadius: 3, border: "1px solid #e2e8f0" }}>
                  <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{type.name}</Typography>
                    <Chip label="Open" size="small" color="primary" variant="outlined" />
                  </Stack>
                  <Typography variant="body2" sx={{ color: "#64748b", mb: 2, minHeight: 48 }}>
                    {type.description || "Admin-configured membership track."}
                  </Typography>
                  <Button
                    component={Link}
                    href={`/join-membership?type=${type.slug}`}
                    variant="outlined"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Apply for {type.name}
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
