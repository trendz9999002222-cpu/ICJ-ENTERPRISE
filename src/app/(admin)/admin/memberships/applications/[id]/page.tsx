"use client";

import { env } from "@/config/env";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  DetailField,
  SectionCard,
  renderFieldValue,
} from "@/components/features/admin/shared/AdminDetailPrimitives";
import {
  formatDocKey,
  formatFieldKey,
  isImageUrl,
  isPdfUrl,
  formatAdminDateShort,
} from "@/components/features/admin/shared/adminDetailFormatters";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BlockIcon from "@mui/icons-material/Block";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import GavelIcon from "@mui/icons-material/Gavel";
import HistoryIcon from "@mui/icons-material/History";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PhoneIcon from "@mui/icons-material/Phone";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RateReviewIcon from "@mui/icons-material/RateReview";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LocationOnIcon from "@mui/icons-material/LocationOn";

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
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DocumentItem {
  id: string;
  document_key: string;
  document_title: string;
  file_name: string;
  file_size_bytes?: number;
  file_url: string;
  uploaded_at?: string;
}

export interface ReviewHistoryItem {
  id: string;
  action: string;
  actor_name: string;
  note: string;
  created_at: string;
}

export interface ProfessionalApplicationDetail {
  id: string;
  application_reference: string;
  pathway: string;
  category: string;
  status: string;
  personal_data?: {
    full_name?: string;
    email?: string;
    mobile?: string;
    gender?: string;
    dob?: string;
    office_address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    [key: string]: unknown;
  };
  professional_data?: {
    enrollment_number?: string;
    state_council?: string;
    enrollment_year?: string;
    experience_years?: string;
    primary_courts?: string[] | string;
    practice_areas?: string[] | string;
    chamber_firm_name?: string;
    profile_summary?: string;
    designation?: string;
    qualification?: string;
    organization?: string;
    expertise?: string;
    [key: string]: unknown;
  };
  category_data?: Record<string, unknown>;
  rejection_reason?: string;
  info_request_note?: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_photo?: string | null;
  documents: DocumentItem[];
  review_history: ReviewHistoryItem[];
  created_at: string;
  updated_at: string;
}

const STATUS_META: Record<
  string,
  { label: string; color: "success" | "warning" | "error" | "info" | "default" }
> = {
  approved: { label: "Approved & Empaneled", color: "success" },
  pending: { label: "Pending Review", color: "warning" },
  under_review: { label: "Under Review", color: "info" },
  rejected: { label: "Application Rejected", color: "error" },
  info_requested: { label: "Info Requested", color: "warning" },
};

const PATHWAY_META: Record<string, { label: string; bg: string; color: string; border: string }> = {
  legal_professional: {
    label: "Legal Professional Wing",
    bg: "#eff6ff",
    color: "#1d4ed8",
    border: "#bfdbfe",
  },
  other_professional: {
    label: "Specialist Professionals Cadre",
    bg: "#ecfdf5",
    color: "#065f46",
    border: "#a7f3d0",
  },
  volunteer: {
    label: "Volunteer & Fellows Cadre",
    bg: "#fff7ed",
    color: "#c2410c",
    border: "#fed7aa",
  },
};

function readAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  return document.cookie.match(/(?:^|;\s*)icj_access_token=([^;]+)/)?.[1] || null;
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AdminProfessionalApplicationDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");

  const [app, setApp] = useState<ProfessionalApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Review Dialogs State
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveNote, setApproveNote] = useState("");

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [infoNote, setInfoNote] = useState("");
  const [infoError, setInfoError] = useState("");

  // Document Preview Modal
  const [previewMedia, setPreviewMedia] = useState<{
    open: boolean;
    url: string;
    title: string;
    isPdf: boolean;
  } | null>(null);

  // -------------------------------------------------------------------------
  // Load Application Details
  // -------------------------------------------------------------------------

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const token = readAccessToken();
      const res = await fetch(`${env.apiUrl}/admin/applications/${id}/`, {
        headers: {
          Authorization: `Bearer ${token || ""}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to load application (${res.status})`);
      }
      const data = await res.json();
      setApp(data?.data || data);
    } catch (err: any) {
      setError(err?.message || "Failed to load professional application. Please try again.");
      setApp(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // -------------------------------------------------------------------------
  // Review Actions
  // -------------------------------------------------------------------------

  const submitReview = async (decision: "approve" | "reject" | "request_info", note: string) => {
    const token = readAccessToken();
    const res = await fetch(`${env.apiUrl}/admin/applications/${id}/review/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token || ""}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ decision, note }),
    });
    const result = await res.json();
    if (!res.ok) {
      const msg = result?.message || result?.detail || "Action failed";
      throw new Error(msg);
    }
    return result;
  };

  const handleApprove = async () => {
    if (!app) return;
    setActionLoading(true);
    setError("");
    try {
      await submitReview("approve", approveNote.trim() || "Application approved by ICJ Empanelment Committee.");
      await load();
      setApproveDialogOpen(false);
      setApproveNote("");
      setToastMsg(`${app.applicant_name || "Candidate"} has been approved and empaneled successfully.`);
    } catch (err: any) {
      setError(err?.message || "Failed to approve application.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!app) return;
    if (!rejectReason.trim()) {
      setRejectError("Please provide a mandatory reason for rejection.");
      return;
    }
    setActionLoading(true);
    setRejectError("");
    try {
      await submitReview("reject", rejectReason.trim());
      await load();
      setRejectDialogOpen(false);
      setRejectReason("");
      setToastMsg("Application has been rejected.");
    } catch (err: any) {
      setRejectError(err?.message || "Failed to reject application.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!app) return;
    if (!infoNote.trim()) {
      setInfoError("Please enter details of the additional information required.");
      return;
    }
    setActionLoading(true);
    setInfoError("");
    try {
      await submitReview("request_info", infoNote.trim());
      await load();
      setInfoDialogOpen(false);
      setInfoNote("");
      setToastMsg("Information request successfully dispatched to candidate.");
    } catch (err: any) {
      setInfoError(err?.message || "Failed to request additional information.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnderReview = async () => {
    setActionLoading(true);
    setError("");
    try {
      await submitReview("request_info", "Application placed under administrative scrutiny.");
      await load();
      setToastMsg("Application status updated.");
    } catch (err: any) {
      setError(err?.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render States
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <AdminPageShell title="Professional Empanelment Application">
        <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
          <CircularProgress />
        </Box>
      </AdminPageShell>
    );
  }

  if (error && !app) {
    return (
      <AdminPageShell title="Professional Empanelment Application">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          component={Link}
          href="/admin/memberships"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Back to Memberships List
        </Button>
      </AdminPageShell>
    );
  }

  if (!app) {
    return (
      <AdminPageShell title="Application Not Found">
        <Alert severity="warning" sx={{ mb: 3 }}>
          The requested professional application could not be found.
        </Alert>
        <Button
          component={Link}
          href="/admin/memberships"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Back to Memberships List
        </Button>
      </AdminPageShell>
    );
  }

  // Calculated info
  const pathwayStyle = PATHWAY_META[app.pathway] || {
    label: app.pathway?.replace(/_/g, " ").toUpperCase() || "PROFESSIONAL",
    bg: "#f1f5f9",
    color: "#334155",
    border: "#cbd5e1",
  };

  const statusMeta = STATUS_META[app.status] || {
    label: app.status.replace(/_/g, " ").toUpperCase(),
    color: "default" as const,
  };

  const name = app.applicant_name || app.personal_data?.full_name || "Applicant";
  const email = app.applicant_email || app.personal_data?.email || "—";
  const phone = app.applicant_phone || app.personal_data?.mobile || "—";
  const photo = app.applicant_photo;
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const documents = app.documents ?? [];
  const reviewHistory = app.review_history ?? [];
  const profData = app.professional_data || {};
  const persData = app.personal_data || {};

  return (
    <AdminPageShell
      title="Professional Empanelment Application"
      subtitle={`Application Reference: ${app.application_reference} · ${pathwayStyle.label}`}
    >
      {/* Toast */}
      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={4000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
      />

      {/* Main Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Rejection Banner */}
      {app.status === "rejected" && app.rejection_reason && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Rejection Reason / Empanelment Scrutiny Feedback:
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {app.rejection_reason}
          </Typography>
        </Alert>
      )}

      {/* Info Requested Banner */}
      {app.status === "info_requested" && app.info_request_note && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Additional Information Requested from Candidate:
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {app.info_request_note}
          </Typography>
        </Alert>
      )}

      {/* Approved Banner */}
      {app.status === "approved" && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Empaneled & Verified Professional:
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            This candidate has been formally approved and granted verified credentials under the{" "}
            <strong>{pathwayStyle.label}</strong>.
          </Typography>
        </Alert>
      )}

      <Stack spacing={3} sx={{ width: "100%", pb: 4 }}>
        {/* ─── CANDIDATE HERO PAPER ─── */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            p: { xs: 2.5, sm: 3 },
            bgcolor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2.5}
            sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" } }}
          >
            {/* Candidate Identity */}
            <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
              <Avatar
                src={photo ? resolveMediaUrl(photo) || undefined : undefined}
                sx={{
                  width: { xs: 64, sm: 76 },
                  height: { xs: 64, sm: 76 },
                  bgcolor: pathwayStyle.bg,
                  color: pathwayStyle.color,
                  fontSize: { xs: "1.4rem", sm: "1.75rem" },
                  fontWeight: 800,
                  border: "3px solid",
                  borderColor: pathwayStyle.border,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.15)",
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.75, mb: 0.5 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: "#0f172a", fontSize: { xs: "1.2rem", sm: "1.4rem" } }}
                  >
                    {name}
                  </Typography>
                  <Chip
                    label={statusMeta.label}
                    color={statusMeta.color}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: "0.725rem", borderRadius: 1.5 }}
                  />
                  <Chip
                    label={pathwayStyle.label}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.725rem",
                      borderRadius: 1.5,
                      bgcolor: pathwayStyle.bg,
                      color: pathwayStyle.color,
                      border: "1px solid",
                      borderColor: pathwayStyle.border,
                    }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500, wordBreak: "break-word" }}>
                  {email} · Reference ID:{" "}
                  <strong style={{ color: "#1e3a8a", fontFamily: "monospace" }}>{app.application_reference}</strong>
                </Typography>
              </Box>
            </Stack>

            {/* Action Buttons */}
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
                href="/admin/memberships"
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon />}
                sx={{ borderColor: "#cbd5e1", color: "#475569", textTransform: "none", fontWeight: 600 }}
              >
                Back to Memberships List
              </Button>

              {app.status !== "approved" && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutlinedIcon />}
                  onClick={() => setApproveDialogOpen(true)}
                  disabled={actionLoading}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  Approve & Empanel
                </Button>
              )}

              {app.status !== "info_requested" && app.status !== "approved" && (
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<RateReviewIcon />}
                  onClick={() => {
                    setInfoNote("");
                    setInfoError("");
                    setInfoDialogOpen(true);
                  }}
                  disabled={actionLoading}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Request Info
                </Button>
              )}

              {app.status !== "rejected" && (
                <Button
                  variant={app.status === "approved" ? "outlined" : "contained"}
                  color="error"
                  size="small"
                  startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <BlockIcon />}
                  onClick={() => {
                    setRejectReason("");
                    setRejectError("");
                    setRejectDialogOpen(true);
                  }}
                  disabled={actionLoading}
                  sx={{ fontWeight: 700, textTransform: "none" }}
                >
                  Reject
                </Button>
              )}
            </Stack>
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          {/* Quick Info Strip */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box sx={{ bgcolor: "#f1f5f9", p: 1, borderRadius: 2, display: "flex", color: "#64748b" }}>
                  <EmailIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", wordBreak: "break-all" }}>
                    {email}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box sx={{ bgcolor: "#f1f5f9", p: 1, borderRadius: 2, display: "flex", color: "#64748b" }}>
                  <PhoneIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                    Mobile Phone
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {phone}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box sx={{ bgcolor: "#eff6ff", p: 1, borderRadius: 2, display: "flex", color: "#1e3a8a" }}>
                  <CardMembershipIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                    Cadre / Category
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e3a8a", textTransform: "capitalize" }}>
                    {app.category?.replace(/_/g, " ") || "General"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box sx={{ bgcolor: "#f1f5f9", p: 1, borderRadius: 2, display: "flex", color: "#64748b" }}>
                  <HistoryIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                    Submitted Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {formatAdminDateShort(app.created_at)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* ─── SECTION 1: PERSONAL & CONTACT INFORMATION ─── */}
        <SectionCard
          title="Candidate Identity & Contact Profile"
          icon={<LocationOnIcon sx={{ fontSize: 20 }} />}
        >
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label="Full Name" value={persData.full_name || name} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label="Gender" value={persData.gender ? String(persData.gender) : "—"} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label="Date of Birth" value={persData.dob ? String(persData.dob) : "—"} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label="Email Address" value={email} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label="Mobile Phone" value={phone} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label="City" value={persData.city ? String(persData.city) : "—"} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label="State / Jurisdiction" value={persData.state ? String(persData.state) : "—"} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField label="Postal Pincode" value={persData.pincode ? String(persData.pincode) : "—"} />
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 12 }}>
              <DetailField
                label="Residential / Office Address"
                value={persData.office_address ? String(persData.office_address) : "—"}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* ─── SECTION 2: PROFESSIONAL & STATUTORY CREDENTIALS ─── */}
        <SectionCard
          title="Professional Standing & Statutory Credentials"
          icon={<GavelIcon sx={{ fontSize: 20 }} />}
          badge={
            profData.enrollment_number ? (
              <Chip
                label={`Enrollment: ${profData.enrollment_number}`}
                size="small"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  bgcolor: "#eff6ff",
                  color: "#1d4ed8",
                  borderRadius: 1.5,
                }}
              />
            ) : undefined
          }
        >
          <Grid container spacing={2.5}>
            {/* Enrollment Number */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label="Bar Council / Statutory Enrollment No."
                value={
                  profData.enrollment_number ? (
                    <Typography sx={{ fontFamily: "monospace", fontWeight: 800, color: "#1e3a8a" }}>
                      {String(profData.enrollment_number)}
                    </Typography>
                  ) : (
                    "—"
                  )
                }
              />
            </Grid>

            {/* State Council / Regulatory Body */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label="State Bar Council / Regulatory Authority"
                value={profData.state_council ? String(profData.state_council) : "—"}
              />
            </Grid>

            {/* Year of Enrollment */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label="Year of Enrollment"
                value={profData.enrollment_year ? String(profData.enrollment_year) : "—"}
              />
            </Grid>

            {/* Practice Experience */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label="Practice Experience"
                value={
                  profData.experience_years ? `${profData.experience_years} Years Active Standing` : "—"
                }
              />
            </Grid>

            {/* Chamber / Law Firm */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label="Chamber / Organization / Firm"
                value={profData.chamber_firm_name ? String(profData.chamber_firm_name) : "—"}
              />
            </Grid>

            {/* Designation / Cadre */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label="Current Designation / Cadre"
                value={
                  profData.designation
                    ? String(profData.designation)
                    : app.category?.replace(/_/g, " ").toUpperCase() || "—"
                }
              />
            </Grid>

            {/* Primary Courts of Practice */}
            <Grid size={{ xs: 12, sm: 12 }}>
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
                Primary Courts of Practice
              </Typography>
              {Array.isArray(profData.primary_courts) && profData.primary_courts.length > 0 ? (
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                  {profData.primary_courts.map((court, i) => (
                    <Chip
                      key={i}
                      icon={<AccountBalanceIcon sx={{ fontSize: "14px !important" }} />}
                      label={String(court)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.775rem",
                        bgcolor: "#eff6ff",
                        color: "#1e3a8a",
                        borderRadius: 1.5,
                      }}
                    />
                  ))}
                </Stack>
              ) : profData.primary_courts ? (
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  {String(profData.primary_courts)}
                </Typography>
              ) : (
                <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>—</Typography>
              )}
            </Grid>

            {/* Practice Areas / Specializations */}
            <Grid size={{ xs: 12, sm: 12 }}>
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
                Specialized Practice Areas & Legal Domains
              </Typography>
              {Array.isArray(profData.practice_areas) && profData.practice_areas.length > 0 ? (
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                  {profData.practice_areas.map((area, i) => (
                    <Chip
                      key={i}
                      icon={<GavelIcon sx={{ fontSize: "13px !important" }} />}
                      label={String(area)}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.775rem",
                        color: "#0f172a",
                        borderColor: "#cbd5e1",
                        borderRadius: 1.5,
                      }}
                    />
                  ))}
                </Stack>
              ) : profData.practice_areas ? (
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  {String(profData.practice_areas)}
                </Typography>
              ) : (
                <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>—</Typography>
              )}
            </Grid>

            {/* Profile Summary / Practice Statement */}
            {profData.profile_summary && (
              <Grid size={{ xs: 12, sm: 12 }}>
                <DetailField
                  label="Professional Profile Statement"
                  value={
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 2,
                        fontStyle: "italic",
                        lineHeight: 1.6,
                      }}
                    >
                      &ldquo;{String(profData.profile_summary)}&rdquo;
                    </Box>
                  }
                />
              </Grid>
            )}
          </Grid>
        </SectionCard>

        {/* ─── SECTION 3: SUBMITTED VERIFICATION DOCUMENTS ─── */}
        <SectionCard
          title={`Submitted Verification Documents (${documents.length})`}
          icon={<DescriptionIcon sx={{ fontSize: 20 }} />}
        >
          {documents.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
              <DescriptionIcon sx={{ fontSize: 40, mb: 1, color: "#cbd5e1" }} />
              <Typography variant="body2">No verification documents uploaded for this application.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, overflow: "hidden" }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        color: "#64748b",
                        py: 1.5,
                        width: 72,
                      }}
                    >
                      Preview
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>
                      Document Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>
                      File Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>
                      File Size
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => {
                    const docUrl = resolveMediaUrl(doc.file_url);
                    const isImg = isImageUrl(docUrl, doc.file_name);
                    const isPdf = isPdfUrl(docUrl, doc.file_name);

                    const sizeFormatted = doc.file_size_bytes
                      ? `${(doc.file_size_bytes / 1024).toFixed(1)} KB`
                      : "—";

                    return (
                      <TableRow key={doc.id} hover>
                        {/* Thumbnail / Avatar */}
                        <TableCell sx={{ width: 64, py: 1.5 }}>
                          {isImg && docUrl ? (
                            <Avatar
                              src={docUrl}
                              variant="rounded"
                              sx={{
                                width: 44,
                                height: 44,
                                border: "1px solid #e2e8f0",
                                cursor: "pointer",
                                "&:hover": { transform: "scale(1.08)" },
                              }}
                              onClick={() =>
                                setPreviewMedia({
                                  open: true,
                                  url: docUrl,
                                  title: doc.document_title || formatDocKey(doc.document_key),
                                  isPdf: false,
                                })
                              }
                            />
                          ) : isPdf ? (
                            <Avatar
                              variant="rounded"
                              sx={{ width: 44, height: 44, bgcolor: "#fef2f2", color: "#ef4444" }}
                            >
                              <PictureAsPdfIcon sx={{ fontSize: 24 }} />
                            </Avatar>
                          ) : (
                            <Avatar
                              variant="rounded"
                              sx={{ width: 44, height: 44, bgcolor: "#f8fafc", color: "#64748b" }}
                            >
                              <DescriptionIcon sx={{ fontSize: 24 }} />
                            </Avatar>
                          )}
                        </TableCell>

                        {/* Title & Key */}
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                            {doc.document_title || formatDocKey(doc.document_key)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontFamily: "monospace" }}>
                            key: {doc.document_key}
                          </Typography>
                        </TableCell>

                        {/* File Name */}
                        <TableCell sx={{ py: 1.5, maxWidth: 240 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: "0.8125rem", fontWeight: 500, wordBreak: "break-all" }}
                          >
                            {doc.file_name || "—"}
                          </Typography>
                        </TableCell>

                        {/* File Size */}
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontSize: "0.8125rem", color: "#64748b" }}>
                            {sizeFormatted}
                          </Typography>
                        </TableCell>

                        {/* Action buttons */}
                        <TableCell align="right" sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                            {docUrl && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                                onClick={() =>
                                  setPreviewMedia({
                                    open: true,
                                    url: docUrl,
                                    title: doc.document_title || formatDocKey(doc.document_key),
                                    isPdf,
                                  })
                                }
                                sx={{
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                }}
                              >
                                Preview
                              </Button>
                            )}
                            {docUrl ? (
                              <Button
                                size="small"
                                variant="contained"
                                component="a"
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                                sx={{
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  bgcolor: "#1e3a8a",
                                }}
                              >
                                Open File
                              </Button>
                            ) : (
                              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                Unavailable
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </SectionCard>

        {/* ─── SECTION 4: REVIEW & AUDIT HISTORY TRAIL ─── */}
        <SectionCard
          title={`Review & Audit Trail (${reviewHistory.length})`}
          icon={<HistoryIcon sx={{ fontSize: 20 }} />}
        >
          {reviewHistory.length === 0 ? (
            <Typography sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              No previous audit or review notes recorded.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {reviewHistory.map((item, idx) => {
                const isApproved = item.action.toUpperCase() === "APPROVED";
                const isRejected = item.action.toUpperCase() === "REJECTED";
                const isInfo = item.action.toUpperCase().includes("INFO");

                return (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid #e2e8f0",
                      borderRadius: 2,
                      bgcolor: isApproved ? "#f0fdf4" : isRejected ? "#fef2f2" : "#f8fafc",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 0.75 }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Chip
                          label={item.action}
                          size="small"
                          color={isApproved ? "success" : isRejected ? "error" : isInfo ? "warning" : "default"}
                          sx={{ fontWeight: 800, fontSize: "0.7rem", borderRadius: 1.5 }}
                        />
                        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>
                          Reviewed by {item.actor_name || "Committee Admin"}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {item.created_at ? new Date(item.created_at).toLocaleString("en-IN") : "—"}
                      </Typography>
                    </Stack>
                    {item.note && (
                      <Typography sx={{ fontSize: "0.85rem", color: "#334155", pl: 0.5, mt: 0.5 }}>
                        {item.note}
                      </Typography>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          )}
        </SectionCard>
      </Stack>

      {/* ─── APPROVE DIALOG ─── */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => !actionLoading && setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#166534" }}>
          Confirm Empanelment & Approval
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: "#374151" }}>
            Are you sure you want to approve <strong>{name}</strong> for the{" "}
            <strong>{pathwayStyle.label}</strong> ({app.category?.replace(/_/g, " ").toUpperCase()})?
          </DialogContentText>
          <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
            This decision will update the candidate&apos;s role to the professional tier, granting access to institutional
            empanelment features and official registry accreditation.
          </Typography>
          <TextField
            label="Decision Note (Optional)"
            multiline
            rows={3}
            fullWidth
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
            placeholder="e.g. Credentials and Bar Council standing verified by administrative scrutiny."
            sx={{ bgcolor: "#f9fafb" }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            disabled={actionLoading}
            sx={{ textTransform: "none", color: "#6b7280" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlinedIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {actionLoading ? "Approving..." : "Approve & Empanel"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── REJECT DIALOG ─── */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => !actionLoading && setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#991b1b" }}>
          Reject Empanelment Application
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: "#374151" }}>
            Please state the formal reason for rejecting the empanelment application of{" "}
            <strong>{name}</strong>.
          </DialogContentText>
          <TextField
            label="Rejection Reason / Feedback (Mandatory)"
            multiline
            rows={4}
            fullWidth
            required
            error={Boolean(rejectError)}
            helperText={rejectError}
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              if (rejectError) setRejectError("");
            }}
            placeholder="e.g. Enrollment ID does not match Bar Council records, or incomplete supporting documentation."
            sx={{ bgcolor: "#f9fafb" }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setRejectDialogOpen(false)}
            disabled={actionLoading}
            sx={{ textTransform: "none", color: "#6b7280" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <BlockIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {actionLoading ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── REQUEST INFO DIALOG ─── */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => !actionLoading && setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#d97706" }}>
          Request Additional Information / Documents
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: "#374151" }}>
            Specify the additional documentation or clarifications required from{" "}
            <strong>{name}</strong> before empanelment can proceed.
          </DialogContentText>
          <TextField
            label="Information Instructions (Mandatory)"
            multiline
            rows={4}
            fullWidth
            required
            error={Boolean(infoError)}
            helperText={infoError}
            value={infoNote}
            onChange={(e) => {
              setInfoNote(e.target.value);
              if (infoError) setInfoError("");
            }}
            placeholder="e.g. Please provide a clear copy of your Certificate of Practice (COP) and Bar Council ID."
            sx={{ bgcolor: "#f9fafb" }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setInfoDialogOpen(false)}
            disabled={actionLoading}
            sx={{ textTransform: "none", color: "#6b7280" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRequestInfo}
            variant="contained"
            color="warning"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <RateReviewIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {actionLoading ? "Sending..." : "Send Request to Candidate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── MEDIA PREVIEW DIALOG ─── */}
      {previewMedia && (
        <Dialog
          open={previewMedia.open}
          onClose={() => setPreviewMedia(null)}
          maxWidth="lg"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: 3, p: 0, overflow: "hidden" } } }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              py: 1.5,
              px: 2.5,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              {previewMedia.title}
            </Typography>
            <IconButton size="small" onClick={() => setPreviewMedia(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
              bgcolor: "#0f172a",
            }}
          >
            {previewMedia.isPdf ? (
              <Box
                component="iframe"
                src={previewMedia.url}
                title={previewMedia.title}
                sx={{ width: "100%", height: "72vh", border: "none", borderRadius: 1.5, bgcolor: "#ffffff" }}
              />
            ) : (
              <Box
                component="img"
                src={previewMedia.url}
                alt={previewMedia.title}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "68vh",
                  objectFit: "contain",
                  borderRadius: 1.5,
                }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ px: 2.5, py: 1.5, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
            <Button
              component="a"
              href={previewMedia.url}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Open in New Window
            </Button>
            <Button
              onClick={() => setPreviewMedia(null)}
              variant="contained"
              size="small"
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Close Preview
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AdminPageShell>
  );
}
