"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VerifiedIcon from "@mui/icons-material/Verified";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PageHeader from "@/components/features/public/PageHeader";
import { donationService } from "@/services/public";
import Link from "next/link";

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

export default function DonatePage() {
  const [amount, setAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [fundCategory, setFundCategory] = useState("Nyaya Daan Mudra — Citizen Legal Aid Fund");
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [pan, setPan] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [donationResult, setDonationResult] = useState<{
    receiptNumber: string;
    status: string;
    message: string;
  } | null>(null);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveAmount || effectiveAmount <= 0) return;
    if (!donorName && !isAnonymous) return;
    setSubmitting(true);
    try {
      const res = await donationService.submitDonationIntent({
        donorName: isAnonymous ? "Anonymous Benefactor" : donorName,
        email,
        mobile,
        panOrTaxId: pan,
        amount: effectiveAmount,
        fundCategory,
        isAnonymous,
      });
      setDonationResult(res);
    } catch {
      // error handling
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="Support Public Justice & Legal Aid"
        subtitle="Empower marginalized citizens with access to legal remedies, subsidize courtroom representation, and foster public legal literacy."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Support & Donate" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {/* Institutional Transparency Badges */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            {
              icon: <ReceiptIcon sx={{ color: "#2563eb", fontSize: 32 }} />,
              title: "80G Tax Exemption",
              desc: "Donations to the Consortium are eligible for statutory deductions under Section 80G of the Income Tax Act, 1961.",
            },
            {
              icon: <VerifiedIcon sx={{ color: "#059669", fontSize: 32 }} />,
              title: "Verifiable Digital Receipts",
              desc: "Every contribution produces a cryptographically signed receipt verifiable on our public audit verification portal.",
            },
            {
              icon: <AccountBalanceIcon sx={{ color: "#7c3aed", fontSize: 32 }} />,
              title: "Direct Social Impact",
              desc: "100% of earmarked donations go directly to citizen assistance grants, court filing fees, and pro bono mobilization.",
            },
          ].map((item, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2.5,
                }}
              >
                <Box sx={{ mb: 1.5 }}>{item.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "1.05rem" }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6 }}>
                  {item.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Contribution Portal */}
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
          {donationResult ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "#ecfdf5",
                  color: "#059669",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <FavoriteIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                Contribution Intent Registered
              </Typography>
              <Typography variant="body1" sx={{ color: "#475569", maxWidth: 540, mx: "auto", mb: 3 }}>
                {donationResult.message}
              </Typography>

              <Box
                sx={{
                  display: "inline-block",
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  p: 3,
                  borderRadius: 2,
                  mb: 4,
                  textAlign: "left",
                }}
              >
                <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                  Temporary Receipt / Ledger Number
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#2563eb", letterSpacing: 0.5, mt: 0.5 }}>
                  {donationResult.receiptNumber}
                </Typography>
                <Typography variant="body2" sx={{ color: "#059669", fontWeight: 600, mt: 1 }}>
                  Pledged Amount: ₹{effectiveAmount.toLocaleString("en-IN")}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5 }}>
                  Fund: {fundCategory}
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "center" }}>
                <Button
                  component={Link}
                  href="/verify-donation"
                  variant="contained"
                  sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#0f172a" }}
                >
                  Verify Donation on Public Ledger
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setDonationResult(null);
                    setDonorName("");
                    setPan("");
                    setEmail("");
                    setMobile("");
                  }}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Make Another Contribution
                </Button>
              </Stack>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Institutional Justice Contribution Form
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                  Select your contribution amount and designated social justice initiative.
                </Typography>
              </Box>

              {/* Amount Selection Buttons */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1.5 }}>
                  Select Contribution Tier (INR):
                </Typography>
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = !customAmount && amount === amt;
                    return (
                      <Grid size={{ xs: 6, sm: 4, md: 2 }} key={amt}>
                        <Button
                          fullWidth
                          variant={isSelected ? "contained" : "outlined"}
                          onClick={() => {
                            setAmount(amt);
                            setCustomAmount("");
                          }}
                          sx={{
                            py: 1.2,
                            fontWeight: 700,
                            borderRadius: 2,
                            borderColor: isSelected ? "#2563eb" : "#cbd5e1",
                            bgcolor: isSelected ? "#2563eb" : "#ffffff",
                            color: isSelected ? "#ffffff" : "#0f172a",
                            "&:hover": {
                              borderColor: "#2563eb",
                              bgcolor: isSelected ? "#1d4ed8" : "#f1f5f9",
                            },
                          }}
                        >
                          ₹{amt.toLocaleString("en-IN")}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>

                <TextField
                  fullWidth
                  label="Or Enter Custom Amount (₹)"
                  placeholder="e.g. 75000"
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  helperText="Enter any custom contribution amount in INR"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Earmarked Justice Fund"
                    value={fundCategory}
                    onChange={(e) => setFundCategory(e.target.value)}
                    required
                  >
                    <MenuItem value="Nyaya Daan Mudra — Citizen Legal Aid Fund">
                      Nyaya Daan Mudra — Citizen Legal Aid Fund
                    </MenuItem>
                    <MenuItem value="Women & Senior Citizen Protection Fund">
                      Women & Senior Citizen Protection Fund
                    </MenuItem>
                    <MenuItem value="Vernacular Justice Literacy & Regional Camps">
                      Vernacular Justice Literacy & Regional Camps
                    </MenuItem>
                    <MenuItem value="Socio-Legal Research & Policy Reform Fellowship">
                      Socio-Legal Research & Policy Reform Fellowship
                    </MenuItem>
                    <MenuItem value="General Institutional Endowment">
                      General Institutional Endowment
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name / Entity Name"
                    placeholder="e.g. Shashi Kant Verma"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    disabled={isAnonymous}
                    required={!isAnonymous}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email Address"
                    placeholder="shashi.verma@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    helperText="For receiving 80G tax receipt"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Mobile Phone Number"
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="PAN Card Number (for 80G Tax Credit)"
                    placeholder="ABCDE1234F"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    helperText="Mandatory for Section 80G claim"
                  />
                </Grid>

                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Keep my donation anonymous on public benefactor registries"
                  />
                </Grid>

                <Grid size={12}>
                  <Alert severity="info" sx={{ bgcolor: "#eff6ff", color: "#1e3a8a", border: "1px solid #bfdbfe" }}>
                    Contributions are routed securely in compliance with RBI payment aggregator directives and Ministry of Corporate Affairs regulations.
                  </Alert>
                </Grid>

                <Grid size={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <FavoriteIcon />}
                    sx={{
                      py: 1.5,
                      px: 5,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      bgcolor: "#2563eb",
                      "&:hover": { bgcolor: "#1d4ed8" },
                    }}
                  >
                    {submitting
                      ? "Registering Contribution..."
                      : `Contribute ₹${effectiveAmount.toLocaleString("en-IN")} Now`}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Card>
      </Container>
    </Box>
  );
}
