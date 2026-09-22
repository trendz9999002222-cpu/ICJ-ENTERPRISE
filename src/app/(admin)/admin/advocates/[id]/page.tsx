"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BlockIcon from "@mui/icons-material/Block";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import GavelIcon from "@mui/icons-material/Gavel";
import HistoryIcon from "@mui/icons-material/History";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { adminAdvocatesService } from "@/services/admin/adminAdvocates.service";
import type {
  AdminAdvocateDetail,
  AdvocateDocument,
  AdvocateVerificationStatus,
} from "@/types/admin";

// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<
  AdvocateVerificationStatus,
  "success" | "warning" | "error" | "default"
> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  under_review: "default",
};

const DOC_KEY_LABELS: Record<string, string> = {
  barLicenseDoc: "Bar License / Registration Certificate",
  bar_certificate: "Bar Council Certificate",
  govtPhotoIdDoc: "Government Photo ID Proof",
  id_proof: "Identity Proof (Aadhaar / Passport)",
  resumeDoc: "Curriculum Vitae (CV) / Resume",
  resume: "Curriculum Vitae (CV)",
  coverLetterDoc: "Cover Letter / Statement of Purpose",
  address_proof: "Address Proof Document",
  degree_certificate: "LL.B / Law Degree Certificate",
  photo: "Passport Photograph",
};

function formatDocKey(key: string): string {
  if (DOC_KEY_LABELS[key]) return DOC_KEY_LABELS[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        sx={{
          fontSize: "0.725rem",
          fontWeight: 600,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          mb: 0.35,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#0f172a", wordBreak: "break-word" }}>
        {value ?? "—"}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------

export default function AdvocateDetailPage() {
  const params = useParams();
  const advocateId = String(params.id);

  const [advocate, setAdvocate] = useState<AdminAdvocateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Approval dialog state
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const loadAdvocate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminAdvocatesService.getAdvocateDetail(advocateId);
      if (!data) throw new Error("Advocate application not found.");
      setAdvocate(data);
    } catch {
      setError("Failed to load advocate details. Please check the ID or try again.");
    } finally {
      setLoading(false);
    }
  }, [advocateId]);

  useEffect(() => {
    loadAdvocate();
  }, [loadAdvocate]);

  const handleApprove = async () => {
    if (!advocate) return;
    setActionLoading(true);
    setError("");
    try {
      const updated = await adminAdvocatesService.approveAdvocate(advocate.id);
      setAdvocate(updated);
      setApproveDialogOpen(false);
      setToastMsg(`Advocate ${updated.full_name} has been approved successfully!`);
    } catch {
      setError("Failed to approve application. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!advocate) return;
    if (!rejectReason.trim()) {
      setRejectError("Please provide a reason for rejection.");
      return;
    }
    setActionLoading(true);
    setRejectError("");
    try {
      const updated = await adminAdvocatesService.rejectAdvocate(advocate.id, rejectReason.trim());
      setAdvocate(updated);
      setRejectDialogOpen(false);
      setRejectReason("");
      setToastMsg(`Advocate application has been rejected.`);
    } catch {
      setRejectError("Failed to reject application. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminPageShell title="Advocate Application">
        <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
          <CircularProgress />
        </Box>
      </AdminPageShell>
    );
  }

  if (error || !advocate) {
    return (
      <AdminPageShell title="Advocate Application">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Advocate application not found."}
        </Alert>
        <Button
          component={Link}
          href="/admin/advocates"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Advocates List
        </Button>
      </AdminPageShell>
    );
  }

  const initials = advocate.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const personal = advocate.personal_data || {};
  const address = advocate.address_data || {};
  const professional = advocate.advocate_data || {};
  const documents: AdvocateDocument[] = advocate.documents || [];

  return (
    <AdminPageShell
      title="Advocate Application Details"
      subtitle={`Application Reference: ${advocate.reference_id}`}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {advocate.status === "rejected" && advocate.rejection_reason && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Rejection Feedback:
          </Typography>
          <Typography variant="body2">{advocate.rejection_reason}</Typography>
        </Alert>
      )}

      {/* Main 100% Width Stack */}
      <Stack spacing={3} sx={{ width: "100%", pb: 4 }}>
        {/* =================================================================== */}
        {/* HERO / PROFILE HEADER CARD (100% Width)                             */}
        {/* =================================================================== */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            p: { xs: 2.5, sm: 3 },
            bgcolor: "#ffffff",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2.5}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
            }}
          >
            {/* Left: Avatar + Identity */}
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Avatar
                src={advocate.photo_url || undefined}
                sx={{
                  width: { xs: 56, sm: 68 },
                  height: { xs: 56, sm: 68 },
                  bgcolor: "#2563eb",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  fontWeight: 800,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    {advocate.full_name}
                  </Typography>
                  <Chip
                    label={advocate.status.replace("_", " ")}
                    color={STATUS_COLOR[advocate.status]}
                    size="small"
                    sx={{ fontWeight: 700, textTransform: "capitalize", fontSize: "0.725rem" }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                  {advocate.email} · Bar No:{" "}
                  <strong style={{ color: "#2563eb" }}>
                    {advocate.bar_number || professional.barNumber || "—"}
                  </strong>
                </Typography>
              </Box>
            </Stack>

            {/* Right: Actions */}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
                width: { xs: "100%", md: "auto" },
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Button
                component={Link}
                href="/admin/advocates"
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon />}
                sx={{ borderColor: "#cbd5e1", color: "#475569", textTransform: "none", fontWeight: 600 }}
              >
                Back to Advocates
              </Button>

              {advocate.status !== "approved" && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={
                    actionLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <CheckCircleOutlinedIcon />
                    )
                  }
                  onClick={() => setApproveDialogOpen(true)}
                  disabled={actionLoading}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  Approve Advocate
                </Button>
              )}

              {advocate.status !== "rejected" && (
                <Button
                  variant={advocate.status === "approved" ? "outlined" : "contained"}
                  color="error"
                  size="small"
                  startIcon={
                    actionLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <BlockIcon />
                    )
                  }
                  onClick={() => {
                    setRejectReason("");
                    setRejectError("");
                    setRejectDialogOpen(true);
                  }}
                  disabled={actionLoading}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  Reject Application
                </Button>
              )}
            </Stack>
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          {/* Quick Metrics Strip */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <EmailIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", wordBreak: "break-all" }}>
                    {advocate.email}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <PhoneIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                    Mobile
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {advocate.mobile || personal.mobile || "—"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <GavelIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                    Bar Council
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {advocate.state_bar_council || professional.stateBarCouncil || "—"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <HistoryIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                    Submitted At
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {new Date(advocate.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* =================================================================== */}
        {/* SECTION 1: PERSONAL INFORMATION (100% Width)                        */}
        {/* =================================================================== */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#ffffff",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              bgcolor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <PersonIcon sx={{ fontSize: 20, color: "#2563eb" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
              Personal Information
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField label="Full Name" value={personal.fullName || advocate.full_name} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField label="Email Address" value={personal.email || advocate.email} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField label="Mobile Number" value={personal.mobile || advocate.mobile} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField label="Gender" value={personal.gender} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField label="Date of Birth" value={personal.dob || personal.dateOfBirth} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField
                  label="Father / Spouse Name"
                  value={personal.fatherName || personal.spouseName || personal.father_name}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* =================================================================== */}
        {/* SECTION 2: PROFESSIONAL & BAR COUNCIL (100% Width)                  */}
        {/* =================================================================== */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#ffffff",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              bgcolor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <GavelIcon sx={{ fontSize: 20, color: "#2563eb" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
              Professional & Bar Council Information
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField
                  label="Bar Registration Number"
                  value={
                    <Typography component="span" sx={{ fontWeight: 700, color: "#2563eb" }}>
                      {advocate.bar_number || professional.barNumber || "—"}
                    </Typography>
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField
                  label="State Bar Council"
                  value={advocate.state_bar_council || professional.stateBarCouncil || "—"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField
                  label="Enrollment Number"
                  value={advocate.enrollment_number || professional.enrollmentNumber || "—"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField
                  label="Years of Experience"
                  value={
                    advocate.years_of_experience
                      ? `${advocate.years_of_experience} Years`
                      : professional.yearsOfExperience
                        ? `${professional.yearsOfExperience} Years`
                        : "—"
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField
                  label="Specialization / Courts"
                  value={professional.courtsOfPractice || professional.specialization || "—"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField
                  label="Current Employer / Law Firm"
                  value={professional.currentEmployer || professional.firmName || "—"}
                />
              </Grid>

              {/* Practice Areas */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  sx={{
                    fontSize: "0.725rem",
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    mb: 0.75,
                  }}
                >
                  Practice Areas
                </Typography>
                {advocate.practice_areas?.length ? (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                    {advocate.practice_areas.map((p) => (
                      <Chip
                        key={p}
                        label={p}
                        size="small"
                        sx={{
                          bgcolor: "#eff6ff",
                          color: "#1d4ed8",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          border: "1px solid #bfdbfe",
                        }}
                      />
                    ))}
                  </Stack>
                ) : professional.practiceAreas ? (
                  Array.isArray(professional.practiceAreas) ? (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                      {professional.practiceAreas.map((p: string) => (
                        <Chip
                          key={p}
                          label={p}
                          size="small"
                          sx={{
                            bgcolor: "#eff6ff",
                            color: "#1d4ed8",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            border: "1px solid #bfdbfe",
                          }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2">{String(professional.practiceAreas)}</Typography>
                  )
                ) : (
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    —
                  </Typography>
                )}
              </Grid>

              {professional.bio && (
                <Grid size={{ xs: 12 }}>
                  <DetailField label="Professional Bio" value={professional.bio} />
                </Grid>
              )}
            </Grid>
          </Box>
        </Paper>

        {/* =================================================================== */}
        {/* SECTION 3: ADDRESS & LOCATION (100% Width)                          */}
        {/* =================================================================== */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#ffffff",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              bgcolor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <LocationOnIcon sx={{ fontSize: 20, color: "#2563eb" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
              Address & Location Details
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField
                  label="Street / Address Line"
                  value={address.street || address.address_line_1 || address.address || "—"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField
                  label="City / Tehsil / District"
                  value={address.cityTehsil || address.district || address.city || "—"}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField label="State" value={address.state || "—"} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField label="PIN Code" value={address.pincode || address.zipCode || "—"} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DetailField label="Country" value={address.country || "India"} />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* =================================================================== */}
        {/* SECTION 4: UPLOADED DOCUMENTS (100% Width)                          */}
        {/* =================================================================== */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#ffffff",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              bgcolor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
              <DescriptionIcon sx={{ fontSize: 20, color: "#2563eb" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Uploaded Documents ({documents.length})
              </Typography>
            </Stack>
          </Box>

          {documents.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                No documents uploaded with this application.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", py: 1.5 }}>
                      Document Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", py: 1.5 }}>
                      Original File Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", py: 1.5 }}>
                      Size
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", py: 1.5 }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id || doc.doc_key} hover>
                      <TableCell sx={{ fontSize: "0.825rem", fontWeight: 600, color: "#1e293b", py: 1.75 }}>
                        {formatDocKey(doc.doc_key)}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.825rem", color: "#64748b", py: 1.75 }}>
                        {doc.original_name || doc.doc_key}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.775rem", color: "#94a3b8", py: 1.75 }}>
                        {formatBytes(doc.size_bytes)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.75 }}>
                        {doc.file_url ? (
                          <Button
                            variant="outlined"
                            size="small"
                            component="a"
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              fontSize: "0.75rem",
                              py: 0.5,
                              px: 1.5,
                              borderColor: "#2563eb",
                              color: "#2563eb",
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 1.5,
                              "&:hover": {
                                bgcolor: "#eff6ff",
                                borderColor: "#1d4ed8",
                              },
                            }}
                          >
                            View / Download
                          </Button>
                        ) : (
                          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                            File not available
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* =================================================================== */}
        {/* SECTION 5: AUDIT TIMELINE & APPLICATION DECISION (100% Width)        */}
        {/* =================================================================== */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            border: `1px solid ${
              advocate.status === "approved"
                ? "#bbf7d0"
                : advocate.status === "rejected"
                  ? "#fecaca"
                  : "#e2e8f0"
            }`,
            borderRadius: 3,
            p: { xs: 2.5, sm: 3 },
            bgcolor:
              advocate.status === "approved"
                ? "#f0fdf4"
                : advocate.status === "rejected"
                  ? "#fef2f2"
                  : "#f8fafc",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
          >
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color:
                    advocate.status === "approved"
                      ? "#16a34a"
                      : advocate.status === "rejected"
                        ? "#dc2626"
                        : "#0f172a",
                  mb: 0.5,
                }}
              >
                Application Status: {advocate.status.replace("_", " ").toUpperCase()}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {advocate.status === "approved"
                  ? "This advocate is verified and active on the platform."
                  : advocate.status === "rejected"
                    ? "This application was rejected. You can re-approve at any time after verification."
                    : "Review all documents and bar council registration details before making a decision."}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
              {advocate.status !== "approved" && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={
                    actionLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <CheckCircleOutlinedIcon />
                    )
                  }
                  onClick={() => setApproveDialogOpen(true)}
                  disabled={actionLoading}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  Approve Application
                </Button>
              )}

              {advocate.status !== "rejected" && (
                <Button
                  variant={advocate.status === "approved" ? "outlined" : "contained"}
                  color="error"
                  startIcon={
                    actionLoading ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <BlockIcon />
                    )
                  }
                  onClick={() => {
                    setRejectReason("");
                    setRejectError("");
                    setRejectDialogOpen(true);
                  }}
                  disabled={actionLoading}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  Reject Application
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Stack>

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => !actionLoading && setApproveDialogOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 460, width: "100%", p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Approve Advocate Application?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#475569", fontSize: "0.875rem" }}>
            Are you sure you want to approve <strong>{advocate.full_name}</strong> (Bar #
            {advocate.bar_number || "—"})? This will mark the application as approved and enable
            active advocate access.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            disabled={actionLoading}
            sx={{ color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={actionLoading}
            startIcon={
              actionLoading ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutlinedIcon />
            }
            sx={{ fontWeight: 700 }}
          >
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog with Reason Input */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => !actionLoading && setRejectDialogOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 480, width: "100%", p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#dc2626" }}>
          Reject Advocate Application
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#475569", fontSize: "0.875rem", mb: 2 }}>
            Please state the reason for rejecting <strong>{advocate.full_name}</strong>’s application.
            This will be recorded and visible in the application audit trail.
          </DialogContentText>

          {rejectError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {rejectError}
            </Alert>
          )}

          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            label="Rejection Reason"
            placeholder="e.g. Bar Council certificate is not legible, invalid enrollment number, etc."
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              if (rejectError) setRejectError("");
            }}
            disabled={actionLoading}
            slotProps={{
              input: { sx: { borderRadius: 2, fontSize: "0.875rem" } },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            disabled={actionLoading}
            sx={{ color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={
              actionLoading ? <CircularProgress size={14} color="inherit" /> : <BlockIcon />
            }
            sx={{ fontWeight: 700 }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={!!toastMsg}
        autoHideDuration={4000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </AdminPageShell>
  );
}
