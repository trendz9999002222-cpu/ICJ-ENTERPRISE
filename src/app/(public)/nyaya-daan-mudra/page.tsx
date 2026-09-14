"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import HandshakeIcon from "@mui/icons-material/Handshake";
import GavelIcon from "@mui/icons-material/Gavel";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SecurityIcon from "@mui/icons-material/Security";
import PageHeader from "@/components/features/public/PageHeader";
import Link from "next/link";

export default function NyayaDaanMudraPage() {
  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="Nyaya Daan Mudra (NDM) Framework"
        subtitle="India's pioneering digital social justice credit architecture, designed to eliminate financial barriers to legal representation for marginalized citizens through auditable social credits."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Nyaya Daan Mudra" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {/* Core Mission Banner */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            bgcolor: "#0f172a",
            color: "#ffffff",
            borderRadius: 3,
            mb: 8,
          }}
        >
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Chip
                label="ICJ SOCIAL JUSTICE INNOVATION"
                size="small"
                sx={{ bgcolor: "rgba(37, 99, 235, 0.3)", color: "#93c5fd", fontWeight: 700, mb: 2 }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.3 }}>
                Bridging the Justice Gap Through Verifiable Social Credits
              </Typography>
              <Typography variant="body1" sx={{ color: "#94a3b8", lineHeight: 1.7, mb: 3 }}>
                Justice must not be a luxury reserved for those who can afford expensive legal representation. Nyaya Daan Mudra creates a transparent, auditable pipeline connecting institutional CSR donors, empaneled legal professionals, and needy litigants without intermediary leakage.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  component={Link}
                  href="/donate"
                  variant="contained"
                  sx={{
                    bgcolor: "#2563eb",
                    fontWeight: 700,
                    textTransform: "none",
                    px: 3.5,
                    py: 1.2,
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  Sponsor NDM Credits
                </Button>
                <Button
                  component={Link}
                  href="/assistance"
                  variant="outlined"
                  sx={{
                    borderColor: "#475569",
                    color: "#ffffff",
                    fontWeight: 700,
                    textTransform: "none",
                    px: 3.5,
                    py: 1.2,
                    "&:hover": { borderColor: "#ffffff", bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  Apply for Citizen Assistance
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.05)",
                  p: 3.5,
                  borderRadius: 2.5,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Typography variant="h3" sx={{ fontWeight: 900, color: "#38bdf8" }}>
                  100%
                </Typography>
                <Typography variant="subtitle2" sx={{ color: "#e2e8f0", mt: 0.5, fontWeight: 700 }}>
                  Direct Social Impact
                </Typography>
                <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />
                <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                  Every rupee contributed is converted into cryptographic NDM credits dedicated directly to court fee disbursements, certified drafting assistance, and counsel honoraria.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* How It Works Workflow */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography variant="overline" sx={{ color: "#2563eb", fontWeight: 700, letterSpacing: 1.2 }}>
              THE NDM OPERATING MODEL
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
              How Nyaya Daan Mudra Functions
            </Typography>
            <Typography variant="body1" sx={{ color: "#64748b", maxWidth: 650, mx: "auto", mt: 1 }}>
              A four-stage transparent cycle ensuring complete fiduciary accountability and targeted pro bono delivery.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                step: "01",
                icon: <AccountBalanceWalletIcon sx={{ color: "#2563eb", fontSize: 28 }} />,
                title: "Contribution & Credit Minting",
                desc: "Donors, CSR funds, and benefactors contribute capital to the ICJ Social Justice Fund, creating immutable, auditable NDM social credits.",
              },
              {
                step: "02",
                icon: <VerifiedUserIcon sx={{ color: "#059669", fontSize: 28 }} />,
                title: "Citizen Need Verification",
                desc: "Marginalized citizens, women in distress, and senior citizens submit their matter via the Assistance Portal. Need is verified by our triage ombudsman.",
              },
              {
                step: "03",
                icon: <GavelIcon sx={{ color: "#7c3aed", fontSize: 28 }} />,
                title: "Professional Empanelment",
                desc: "An empaneled advocate, mediator, or Chartered Accountant is assigned to represent the citizen without charging direct out-of-pocket fees to the litigant.",
              },
              {
                step: "04",
                icon: <HandshakeIcon sx={{ color: "#d97706", fontSize: 28 }} />,
                title: "Direct Honorarium Settlement",
                desc: "Upon milestone completion (drafting, appearance, settlement), NDM credits are settled directly to the practitioner’s verified bank account.",
              },
            ].map((step, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 2.5,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography sx={{ fontWeight: 800, color: "#2563eb", fontSize: "1rem" }}>
                        STEP {step.step}
                      </Typography>
                      {step.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "1.05rem" }}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6 }}>
                      {step.desc}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CSR & Institutional Engagement */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            bgcolor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 3,
            mb: 8,
          }}
        >
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5 }}>
                CSR Partnerships & Institutional Sponsorship
              </Typography>
              <Typography variant="body1" sx={{ color: "#475569", lineHeight: 1.7, mb: 2 }}>
                Corporates and philanthropic foundations can earmark Corporate Social Responsibility (CSR) allocations toward specific thematic justice funds:
              </Typography>
              <Stack spacing={1} sx={{ mb: 3 }}>
                {[
                  "Stree Nyaya: Legal defense and counseling for domestic abuse survivors",
                  "Vridh Nyaya: Maintenance enforcement and elder protection clinics",
                  "Digital Underprivileged Triage: Subsidies for tribal and rural e-Courts filings",
                ].map((item, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <SecurityIcon sx={{ color: "#059669", fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Button
                component={Link}
                href="/contact"
                variant="outlined"
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Connect with CSR Advisory Cell
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ bgcolor: "#f8fafc", p: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
                  Audited Transparency Guarantee
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6, mb: 2 }}>
                  Every receipt, voucher, and honorarium settlement under Nyaya Daan Mudra is subject to concurrent independent audit by chartered accountants and published in our annual social impact statement.
                </Typography>
                <Button
                  component={Link}
                  href="/verify-donation"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: "none", fontWeight: 700, p: 0 }}
                >
                  Verify Donation On Ledger
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
}
