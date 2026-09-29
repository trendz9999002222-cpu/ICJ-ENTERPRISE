"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BlockIcon from "@mui/icons-material/Block";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import HistoryIcon from "@mui/icons-material/History";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PhoneIcon from "@mui/icons-material/Phone";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RateReviewIcon from "@mui/icons-material/RateReview";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DetailField,
  renderFieldValue,
  SectionCard,
} from "@/components/features/admin/shared/AdminDetailPrimitives";
import { formatDocKey, formatFieldKey, isImageUrl, isPdfUrl } from "@/components/features/admin/shared/adminDetailFormatters";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import CredentialsDialog, {
  type CredentialsData,
} from "@/components/features/admin/shared/CredentialsDialog";
import {
  membershipOnboardingAdminService,
  type AdminMembershipApplicationDetail,
} from "@/services/admin/membershipOnboarding.service";

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  under_review: "default",
};

export default function AdminMembershipApplicationDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");

  const [app, setApp] = useState<AdminMembershipApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [previewMedia, setPreviewMedia] = useState<{ open: boolean; url: string; title: string } | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      setApp(await membershipOnboardingAdminService.getApplication(id));
    } catch {
      setError("Failed to load membership application. Please try again.");
      setApp(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const formFields = useMemo(() => {
    if (!app?.field_values) return [];
    return Object.entries(app.field_values)
      .filter(([key, val]) => key !== "declaration_accepted" && val !== null && val !== undefined && val !== "")
      .map(([key, value]) => ({
        key,
        label: formatFieldKey(key),
        value,
      }));
  }, [app]);

  const [credentialsModal, setCredentialsModal] = useState<{
    open: boolean;
    data: CredentialsData | null;
  }>({ open: false, data: null });

  const handleApprove = async () => {
    if (!app) return;
    setActionLoading(true);
    try {
      const res = (await membershipOnboardingAdminService.approveApplication(id)) as Record<string, unknown>;
      await load();
      setApproveDialogOpen(false);
      const creds = (res?.credentials || (res?.data as Record<string, unknown>)?.credentials) as CredentialsData | undefined;
      if (creds && creds.temp_password) {
        setCredentialsModal({
          open: true,
          data: {
            ...creds,
            email: creds.email || app.email || "",
            name: app.person_name || "",
            reference_id: app.reference_id,
            profession_name: app.membership_type_name || "ICJ Member",
            role: "member",
          },
        });
      } else {
        setToastMsg(`${app.person_name || "Applicant"} has been approved successfully.`);
      }
    } catch {
      setError("Failed to approve application.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!app) return;
    if (!rejectReason.trim()) {
      setRejectError("Please provide a reason for rejection.");
      return;
    }
    setActionLoading(true);
    setRejectError("");
    try {
      await membershipOnboardingAdminService.rejectApplication(id, rejectReason.trim());
      await load();
      setRejectDialogOpen(false);
      setRejectReason("");
      setToastMsg("Application has been rejected.");
    } catch {
      setRejectError("Failed to reject application.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkUnderReview = async () => {
    setActionLoading(true);
    try {
      await membershipOnboardingAdminService.reviewApplication(id);
      await load();
      setToastMsg("Application marked as under review.");
    } catch {
      setError("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminPageShell title="Membership Application">
        <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
          <CircularProgress />
        </Box>
      </AdminPageShell>
    );
  }

  if (error && !app) {
    return (
      <AdminPageShell title="Membership Application">
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button component={Link} href="/admin/memberships" startIcon={<ArrowBackIcon />} variant="outlined">
          Back to Memberships List
        </Button>
      </AdminPageShell>
    );
  }

  if (!app) {
    return (
      <AdminPageShell title="Application not found">
        <Button component={Link} href="/admin/memberships" startIcon={<ArrowBackIcon />} variant="outlined">
          Back to Memberships List
        </Button>
      </AdminPageShell>
    );
  }

  const initials = (app.person_name || app.email || "M")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const submittedDate = app.submitted_at || app.created_at;
  const documents = app.documents ?? [];

  return (
    <AdminPageShell
      title="Membership Application Details"
      subtitle={`Application Reference: ${app.reference_id}`}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {app.status === "rejected" && app.rejection_reason && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Rejection Reason / Feedback:</Typography>
          <Typography variant="body2">{app.rejection_reason}</Typography>
        </Alert>
      )}

      <Stack spacing={3} sx={{ width: "100%", pb: 4 }}>
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
            <Stack direction="row" spacing={2.5} sx={{ alignItems: "center" }}>
              <Avatar
                sx={{
                  width: { xs: 64, sm: 76 },
                  height: { xs: 64, sm: 76 },
                  bgcolor: "#2563eb",
                  fontSize: { xs: "1.4rem", sm: "1.75rem" },
                  fontWeight: 800,
                  border: "3px solid #eff6ff",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.75, mb: 0.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", fontSize: { xs: "1.2rem", sm: "1.4rem" } }}>
                    {app.person_name || "Applicant"}
                  </Typography>
                  <Chip
                    label={app.status.replace("_", " ")}
                    color={STATUS_COLOR[app.status] ?? "default"}
                    size="small"
                    sx={{ fontWeight: 700, textTransform: "capitalize", fontSize: "0.725rem", borderRadius: 1.5 }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500, wordBreak: "break-word" }}>
                  {app.email || "—"} · Reference:{" "}
                  <strong style={{ color: "#2563eb", fontFamily: "monospace" }}>{app.reference_id}</strong>
                </Typography>
              </Box>
            </Stack>

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
                Back
              </Button>

              {app.status !== "under_review" && app.status !== "approved" && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RateReviewIcon />}
                  onClick={handleMarkUnderReview}
                  disabled={actionLoading}
                  sx={{ textTransform: "none", fontWeight: 600, borderColor: "#cbd5e1" }}
                >
                  Mark Under Review
                </Button>
              )}

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
                  Approve Application
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

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box sx={{ bgcolor: "#f1f5f9", p: 1, borderRadius: 2, display: "flex", color: "#64748b" }}>
                  <EmailIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Email</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", wordBreak: "break-all" }}>
                    {app.email || "—"}
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
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Mobile</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>{app.mobile || "—"}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box sx={{ bgcolor: "#eff6ff", p: 1, borderRadius: 2, display: "flex", color: "#2563eb" }}>
                  <CardMembershipIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Application ID</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                    {app.reference_id}
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
                  <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>Submitted Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {submittedDate
                      ? new Date(submittedDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <SectionCard
          title="Application Form Responses"
          icon={<DescriptionIcon sx={{ fontSize: 20 }} />}
          badge={
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>
              {formFields.length} field{formFields.length !== 1 ? "s" : ""}
            </Typography>
          }
        >
          {formFields.length === 0 ? (
            <Typography sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>No additional form responses recorded.</Typography>
          ) : (
            <Grid container spacing={2.5}>
              {formFields.map((f) => (
                <Grid key={f.key} size={{ xs: 12, sm: 6, md: 4 }}>
                  <DetailField label={f.label} value={renderFieldValue(f.value)} />
                </Grid>
              ))}
            </Grid>
          )}
        </SectionCard>

        <SectionCard title="Declaration" icon={<CheckCircleOutlinedIcon sx={{ fontSize: 20 }} />}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label="Declaration Accepted"
                value={
                  <Chip
                    size="small"
                    label={app.declaration_accepted ? "Yes" : "No"}
                    color={app.declaration_accepted ? "success" : "warning"}
                    variant="outlined"
                    sx={{ fontWeight: 700, borderRadius: 1.5 }}
                  />
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DetailField
                label="Declaration Date"
                value={
                  app.declaration_date
                    ? new Date(app.declaration_date).toLocaleString("en-IN")
                    : "—"
                }
              />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard
          title={`Uploaded Documents (${documents.length})`}
          icon={<DescriptionIcon sx={{ fontSize: 20 }} />}
        >
          {documents.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
              <DescriptionIcon sx={{ fontSize: 40, mb: 1, color: "#cbd5e1" }} />
              <Typography variant="body2">No documents uploaded for this application.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, overflow: "hidden" }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>Preview</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>Document Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#64748b", py: 1.5 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => {
                    const isImg = isImageUrl(doc.url, doc.original_name);
                    const isPdf = isPdfUrl(doc.url, doc.original_name);
                    return (
                      <TableRow key={doc.document_key} hover>
                        <TableCell sx={{ width: 64, py: 1.5 }}>
                          {isImg && doc.url ? (
                            <Avatar
                              src={doc.url}
                              variant="rounded"
                              sx={{
                                width: 42,
                                height: 42,
                                border: "1px solid #e2e8f0",
                                cursor: "pointer",
                                "&:hover": { transform: "scale(1.08)" },
                              }}
                              onClick={() =>
                                setPreviewMedia({ open: true, url: doc.url!, title: formatDocKey(doc.document_key) })
                              }
                            />
                          ) : isPdf ? (
                            <Avatar variant="rounded" sx={{ width: 42, height: 42, bgcolor: "#fef2f2", color: "#ef4444" }}>
                              <PictureAsPdfIcon sx={{ fontSize: 22 }} />
                            </Avatar>
                          ) : (
                            <Avatar variant="rounded" sx={{ width: 42, height: 42, bgcolor: "#f8fafc", color: "#64748b" }}>
                              <DescriptionIcon sx={{ fontSize: 22 }} />
                            </Avatar>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                            {formatDocKey(doc.document_key)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontFamily: "monospace" }}>
                            key: {doc.document_key}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, maxWidth: 220 }}>
                          <Typography variant="body2" sx={{ fontSize: "0.8125rem", fontWeight: 500, wordBreak: "break-all" }}>
                            {doc.original_name || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            size="small"
                            label={doc.verification_status}
                            variant="outlined"
                            sx={{ fontSize: "0.68rem", fontWeight: 600, borderRadius: 1.5, textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                            {isImg && doc.url && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                                onClick={() =>
                                  setPreviewMedia({ open: true, url: doc.url!, title: formatDocKey(doc.document_key) })
                                }
                                sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600 }}
                              >
                                Preview
                              </Button>
                            )}
                            {doc.url ? (
                              <Button
                                size="small"
                                variant="contained"
                                component="a"
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                                sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, bgcolor: "#2563eb" }}
                              >
                                Open File
                              </Button>
                            ) : (
                              <Typography variant="caption" sx={{ color: "#94a3b8" }}>Unavailable</Typography>
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

        <SectionCard title="Application History" icon={<HistoryIcon sx={{ fontSize: 20 }} />}>
          {!app.history?.length ? (
            <Typography sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>No history entries yet.</Typography>
          ) : (
            <Stack spacing={1.25}>
              {app.history.map((h, i) => (
                <Box
                  key={i}
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 2,
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: "0.8125rem", color: "#0f172a", textTransform: "capitalize" }}>
                    {h.action.replace(/_/g, " ")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    {new Date(h.created_at).toLocaleString("en-IN")}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </SectionCard>
      </Stack>

      <Dialog
        open={Boolean(previewMedia?.open)}
        onClose={() => setPreviewMedia(null)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden", bgcolor: "#0f172a" } } }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#0f172a" }}>
          <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{previewMedia?.title}</Typography>
          <IconButton size="small" onClick={() => setPreviewMedia(null)} sx={{ color: "#94a3b8" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 2, bgcolor: "#020617", display: "flex", justifyContent: "center" }}>
          {previewMedia?.url && (
            <Box
              component="img"
              src={previewMedia.url}
              alt={previewMedia.title}
              sx={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 1.5 }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Application Approval</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Approve <strong>{app.person_name}</strong>&apos;s membership application? This will create an active membership record.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setApproveDialogOpen(false)} variant="outlined" sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <CheckCircleOutlinedIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reject Application</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Provide a reason for rejecting <strong>{app.person_name}</strong>&apos;s application.
          </DialogContentText>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            label="Rejection Reason / Feedback"
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              if (rejectError) setRejectError("");
            }}
            error={!!rejectError}
            helperText={rejectError}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRejectDialogOpen(false)} variant="outlined" sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={14} color="inherit" /> : <BlockIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Reject Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Credentials Dialog */}
      <CredentialsDialog
        open={credentialsModal.open}
        onClose={() => setCredentialsModal({ open: false, data: null })}
        credentials={credentialsModal.data}
        title="Member Account Provisioned"
      />

      <Snackbar
        open={!!toastMsg}
        autoHideDuration={4000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </AdminPageShell>
  );
}
