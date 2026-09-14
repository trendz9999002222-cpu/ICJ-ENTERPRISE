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
  InputAdornment,
  Stack,
  CircularProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import SecurityIcon from "@mui/icons-material/Security";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PageHeader from "@/components/features/public/PageHeader";
import { verificationService } from "@/services/public";
import type { DonationVerification } from "@/types/public";

export default function VerifyDonationPage() {
  const [receiptNumber, setReceiptNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<DonationVerification | null | undefined>(undefined);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptNumber.trim()) return;
    setSearching(true);
    setResult(undefined);
    try {
      const res = await verificationService.verifyDonation(receiptNumber);
      setResult(res);
    } catch {
      setResult(null);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="Donation Receipt Verification"
        subtitle="Validate the authenticity of any ICJ donation or Nyaya Daan Mudra contribution receipt against our public institutional audit ledger."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Verify Donation" },
        ]}
      />

      <Container maxWidth="md" sx={{ mt: 5 }}>
        {/* Search Card */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            bgcolor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 3,
            mb: 4,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
            Enter Receipt or Ledger Number
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
            Enter the receipt number found on your ICJ contribution acknowledgement. Format: <strong>ICJ-DON-XXXXX</strong> or <strong>ICJ-CSR-XXXXX</strong>.
          </Typography>

          <form onSubmit={handleVerify}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                placeholder="e.g. ICJ-DON-84920 or ICJ-CSR-99412"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value.toUpperCase())}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={searching}
                sx={{
                  px: 4,
                  py: 1.5,
                  whiteSpace: "nowrap",
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "#0f172a",
                  minWidth: 160,
                  "&:hover": { bgcolor: "#1e293b" },
                }}
              >
                {searching ? <CircularProgress size={22} color="inherit" /> : "Verify Receipt"}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Try sample receipt numbers: <strong>ICJ-DON-84920</strong> or <strong>ICJ-CSR-99412</strong>
            </Typography>
          </Box>
        </Card>

        {/* Result Display */}
        {result === null && (
          <Alert
            severity="error"
            icon={<CancelIcon />}
            sx={{ mb: 4, borderRadius: 2 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Receipt Not Found</Typography>
            <Typography variant="body2">
              The receipt number <strong>{receiptNumber}</strong> was not found in the ICJ donation ledger. Please verify the number on your acknowledgement or contact{" "}
              <strong>finance@icj-india.org</strong>.
            </Typography>
          </Alert>
        )}

        {result && (
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4.5 },
              bgcolor: "#ffffff",
              border: "2px solid #059669",
              borderRadius: 3,
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: "#ecfdf5",
                    color: "#059669",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Contribution Verified
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#059669", fontWeight: 600 }}>
                    {result.status}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={result.taxExemptionEligible ? "80G Tax Exempt" : "Non-Taxable"}
                sx={{
                  bgcolor: result.taxExemptionEligible ? "#ecfdf5" : "#f1f5f9",
                  color: result.taxExemptionEligible ? "#059669" : "#64748b",
                  fontWeight: 700,
                }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2.5}>
              {[
                { label: "Receipt / Ledger Number", value: result.receiptNumber },
                { label: "Donor (Privacy-Protected Initials)", value: result.donorInitials },
                { label: "Contribution Category", value: result.donationCategory },
                { label: "Contribution Date", value: new Date(result.donationDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                { label: "Audit Status", value: result.status },
                { label: "80G Tax Exemption", value: result.taxExemptionEligible ? "Eligible — Verification Valid" : "Not Applicable" },
              ].map((field, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>
                      {field.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e293b", mt: 0.5 }}>
                      {field.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        )}

        {/* How It Works */}
        <Card
          elevation={0}
          sx={{
            p: 4,
            bgcolor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 2.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 2.5 }}>
            About Our Donation Audit Framework
          </Typography>
          <List dense disablePadding>
            {[
              { icon: <QrCode2Icon sx={{ color: "#2563eb" }} />, text: "Each contribution receipt carries a cryptographic verification code traceable to the ICJ audit register." },
              { icon: <SecurityIcon sx={{ color: "#059669" }} />, text: "Donations are independently audited quarterly by a statutory chartered accountant empaneled by ICAI." },
              { icon: <LockIcon sx={{ color: "#7c3aed" }} />, text: "Donor financial details are protected by our data confidentiality policy; only privacy-protected initials are publicly recorded." },
              { icon: <CheckCircleIcon sx={{ color: "#d97706" }} />, text: "80G compliance certificates are issued electronically and verifiable against our annual FCRA audit statement." },
            ].map((item, idx) => (
              <ListItem key={idx} disableGutters sx={{ py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{ primary: { sx: { fontSize: "0.85rem", color: "#334155", lineHeight: 1.5 } } }}
                />
              </ListItem>
            ))}
          </List>
        </Card>
      </Container>
    </Box>
  );
}
