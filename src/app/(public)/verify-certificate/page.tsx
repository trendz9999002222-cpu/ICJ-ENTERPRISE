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
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import SecurityIcon from "@mui/icons-material/Security";
import LockIcon from "@mui/icons-material/Lock";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PageHeader from "@/components/features/public/PageHeader";
import { verificationService } from "@/services/public";
import type { CertificateVerification } from "@/types/public";

export default function VerifyCertificatePage() {
  const [certNumber, setCertNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<CertificateVerification | null | undefined>(undefined);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim()) return;
    setSearching(true);
    setResult(undefined);
    try {
      const res = await verificationService.verifyCertificate(certNumber);
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
        title="Certificate Verification Portal"
        subtitle="Verify the authenticity of any ICJ institutional certificate, professional empanelment credential, or academy qualification record."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Verify Certificate" },
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
            Enter Certificate Number
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
            Enter the certificate number found on your ICJ credential document. Formats: <strong>ICJ-CERT-YYYY-XXX</strong> or <strong>ICJ-ACAD-YYYY-XXX</strong>
          </Typography>

          <form onSubmit={handleVerify}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                placeholder="e.g. ICJ-CERT-2026-001 or ICJ-ACAD-2026-104"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value.toUpperCase())}
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
                {searching ? <CircularProgress size={22} color="inherit" /> : "Verify Now"}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Try: <strong>ICJ-CERT-2026-001</strong> or <strong>ICJ-ACAD-2026-104</strong>
            </Typography>
          </Box>
        </Card>

        {/* Not Found Result */}
        {result === null && (
          <Alert
            severity="error"
            icon={<CancelIcon />}
            sx={{ mb: 4, borderRadius: 2 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Certificate Not Found in Registry</Typography>
            <Typography variant="body2">
              Certificate number <strong>{certNumber}</strong> is not registered in the ICJ credential registry. Please re-check the number printed on your document, or contact <strong>registry@icj-india.org</strong>.
            </Typography>
          </Alert>
        )}

        {/* Valid Certificate Result */}
        {result && (
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4.5 },
              bgcolor: "#ffffff",
              border: `2px solid ${result.status === "Valid" ? "#059669" : "#ef4444"}`,
              borderRadius: 3,
              mb: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: result.status === "Valid" ? "#ecfdf5" : "#fef2f2",
                    color: result.status === "Valid" ? "#059669" : "#ef4444",
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
                    {result.status === "Valid" ? "Credential Verified" : "Credential Status Alert"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: result.status === "Valid" ? "#059669" : "#ef4444" }}>
                    Status: {result.status}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={result.certificateType}
                sx={{
                  bgcolor: "#f8fafc",
                  color: "#334155",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  border: "1px solid #e2e8f0",
                }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2.5}>
              {[
                { label: "Certificate Number", value: result.certificateNumber },
                { label: "Credential Holder", value: result.recipientName },
                { label: "Designation / Qualification", value: result.recipientDesignation },
                { label: "Certificate Type", value: result.certificateType },
                { label: "Date of Issue", value: new Date(result.issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                { label: "Issuing Authority", value: result.issuingAuthority },
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

            {result.verificationHash && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: "#0f172a",
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 0.5 }}>
                  <LockIcon sx={{ color: "#60a5fa", fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                    Cryptographic Verification Hash
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#38bdf8",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    display: "block",
                  }}
                >
                  {result.verificationHash}
                </Typography>
              </Box>
            )}
          </Card>
        )}

        {/* Trust Framework */}
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
            ICJ Credential Trust Infrastructure
          </Typography>
          <List dense disablePadding>
            {[
              { icon: <QrCode2Icon sx={{ color: "#2563eb" }} />, text: "Every certificate carries a QR-embedded cryptographic signature for instant mobile verification." },
              { icon: <CalendarMonthIcon sx={{ color: "#059669" }} />, text: "Credential validity is reviewed annually; revocations are reflected in this registry within 48 hours." },
              { icon: <SecurityIcon sx={{ color: "#7c3aed" }} />, text: "Professional empanelment credentials are cross-verified against Bar Council, ICAI, and ICSI statutory rolls." },
              { icon: <LockIcon sx={{ color: "#d97706" }} />, text: "Certificate hashes are generated using SHA-256 and stored in an air-gapped institutional ledger." },
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
