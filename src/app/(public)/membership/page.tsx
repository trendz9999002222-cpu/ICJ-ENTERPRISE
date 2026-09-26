"use client";

import Link from "next/link";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import PageHeader from "@/components/features/public/PageHeader";

const BENEFITS = [
  "Verified institutional membership registry",
  "Digital credentials and professional visibility",
  "Access to pro bono panels and policy working groups",
  "Research, events, and fraternity networking",
];

const PROCESS = [
  "Open the membership application form",
  "Complete each configured step",
  "Upload required documents",
  "Accept declaration and submit",
  "Admin review and approval (no payment in this phase)",
];

export default function MembershipPage() {
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
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: "#2563eb", fontSize: 22 }} />
                  </ListItemIcon>
                  <ListItemText primary={b} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Application process</Typography>
              <List dense>
                {PROCESS.map((step, i) => (
                  <ListItem key={step} disableGutters sx={{ alignItems: "flex-start" }}>
                    <ListItemText
                      primary={`${i + 1}. ${step}`}
                      slotProps={{ primary: { variant: "body2", sx: { color: "#475569" } } }}
                    />
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

        <Typography variant="body2" sx={{ color: "#64748b", textAlign: "center" }}>
          The application form is configured by administrators and may include multiple steps and document uploads.
        </Typography>
      </Container>
    </Box>
  );
}
