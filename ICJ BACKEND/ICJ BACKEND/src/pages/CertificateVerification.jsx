import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Stack,
  TextField,
  Alert,
  Divider,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CertificateService from "../services/certificateService";
import MasterCertificateModal from "../components/common/MasterCertificateModal";

export default function CertificateVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryCert = searchParams.get("cert") || searchParams.get("certificate_number") || "";

  const [inputCertNo, setInputCertNo] = useState(queryCert);
  const [searchedRecord, setSearchedRecord] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (queryCert.trim()) {
      handleSearchCert(queryCert.trim());
    }
  }, [queryCert]);

  const handleSearchCert = (certNoToFind) => {
    const clean = String(certNoToFind || "").trim().toUpperCase();
    if (!clean) return;

    setHasSearched(true);
    const rec = CertificateService.getCertificateByNumber(clean);
    setSearchedRecord(rec);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#090d16", py: { xs: 4, md: 8 }, color: "#f8fafc" }}>
      <Container maxWidth="md">
        {/* Top Header */}
        <Stack spacing={2} textAlign="center" sx={{ mb: 5 }}>
          <Box sx={{ display: "inline-flex", justifyContent: "center", mb: 1 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "#1e293b",
                border: "2px solid #b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 24px rgba(180,83,9,0.3)",
              }}
            >
              <VerifiedUserIcon sx={{ fontSize: 40, color: "#f59e0b" }} />
            </Box>
          </Box>

          <Typography variant="h4" fontWeight={900} letterSpacing={1} color="#f8fafc">
            INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} color="#94a3b8" sx={{ textTransform: "uppercase", letterSpacing: 2 }}>
            Official Member Registration Certificate Verification Ledger
          </Typography>
          <Typography variant="body2" color="#64748b" maxWidth="600px" mx="auto">
            Live cryptographic ledger lookup for authenticated member certificates, advocates, franchise partners, and legal practitioners.
          </Typography>
        </Stack>

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            bgcolor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              fullWidth
              size="medium"
              placeholder="Enter Certificate Number (e.g. ICJ-CERT-2026-XXXXXX)..."
              value={inputCertNo}
              onChange={(e) => setInputCertNo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearchCert(inputCertNo); }}
              sx={{
                bgcolor: "#1e293b",
                borderRadius: 2,
                input: { color: "#ffffff", fontWeight: 700, fontFamily: "monospace" },
                "& fieldset": { borderColor: "#475569" },
              }}
            />
            <Button
              variant="contained"
              size="large"
              color="warning"
              startIcon={<SearchIcon />}
              onClick={() => handleSearchCert(inputCertNo)}
              sx={{ px: 4, fontWeight: 800, bgcolor: "#d97706", "&:hover": { bgcolor: "#b45309" } }}
            >
              Verify Now
            </Button>
          </Stack>
        </Paper>

        {/* Verification Result */}
        {hasSearched && (
          searchedRecord ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4.5 },
                bgcolor: "#0f172a",
                border: "2px solid #16a34a",
                borderRadius: 3,
                boxShadow: "0 12px 40px rgba(22,163,74,0.15)",
              }}
            >
              {/* Verified Badge */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3, borderBottom: "1px solid #1e293b", pb: 2 }}>
                <CheckCircleIcon sx={{ color: "#22c55e", fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" fontWeight={900} color="#22c55e">
                    AUTHENTIC & SYSTEM VERIFIED CERTIFICATE
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">
                    Registered in the ICJ Enterprise Central Registry
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="#64748b" fontWeight={700}>CERTIFICATE NUMBER</Typography>
                  <Typography variant="subtitle1" fontWeight={900} color="#f59e0b" sx={{ fontFamily: "monospace" }}>
                    {searchedRecord.certificate_number}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="#64748b" fontWeight={700}>PERMANENT MEMBER ID</Typography>
                  <Typography variant="subtitle1" fontWeight={900} color="#38bdf8" sx={{ fontFamily: "monospace" }}>
                    {searchedRecord.member_id}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="#64748b" fontWeight={700}>APPLICANT / MEMBER NAME</Typography>
                  <Typography variant="h6" fontWeight={800} color="#f8fafc">
                    {searchedRecord.applicant_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="#64748b" fontWeight={700}>ASSIGNED ROLE & PRACTICE</Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="#e2e8f0">
                    {searchedRecord.assigned_role}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="#64748b" fontWeight={700}>ISSUE DATE</Typography>
                  <Typography variant="body1" fontWeight={600} color="#cbd5e1">
                    {searchedRecord.issue_date}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="#64748b" fontWeight={700}>VERIFICATION STATUS</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={`🟢 ${searchedRecord.verification_status}`} color="success" size="small" sx={{ fontWeight: 800 }} />
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3, borderColor: "#334155" }} />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="#64748b">
                  Authorized by: <strong>{searchedRecord.authorized_signatory}</strong>
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PrintIcon />}
                    onClick={() => setPreviewOpen(true)}
                    sx={{ fontWeight: 800 }}
                  >
                    View Official Certificate
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : (
            <Alert
              severity="error"
              icon={<ErrorIcon fontSize="inherit" />}
              sx={{ bgcolor: "#450a0a", color: "#fca5a5", border: "1px solid #991b1b", borderRadius: 2 }}
            >
              <Typography fontWeight={700}>No Authenticated Certificate Found</Typography>
              The certificate number <code>"{inputCertNo}"</code> could not be verified in the ICJ official digital registry. Please check the spelling or scan the authentic QR code again.
            </Alert>
          )
        )}

        {/* Footer Navigation */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ color: "#94a3b8", "&:hover": { color: "#ffffff" } }}
          >
            Back to ICJ Enterprise Home
          </Button>
        </Box>
      </Container>

      {/* Modal Preview */}
      {searchedRecord && (
        <MasterCertificateModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          member={searchedRecord}
        />
      )}
    </Box>
  );
}
