"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonIcon from "@mui/icons-material/Person";
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
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  getOnboardingApiErrorMessage,
  professionalOnboardingService,
} from "@/services/admin/professionalOnboarding.service";

// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<string, "warning" | "info" | "success" | "error" | "default"> = {
  pending: "warning",
  under_review: "info",
  approved: "success",
  rejected: "error",
};

interface RegistrationDetail {
  id: string;
  reference_id: string;
  status: "pending" | "under_review" | "approved" | "rejected" | string;
  submitted_by?: string | null;
  applicant_name?: string;
  email?: string;
  categories?: { id: string; name: string }[];
  groups?: { id: string; name: string }[];
  professions?: { id: string; name: string }[];
  selected_category_ids?: string[];
  selected_group_ids?: string[];
  selected_profession_ids?: string[];
  common_field_values?: Record<string, unknown>;
  profession_field_values?: Record<string, unknown>;
  files?: {
    id: string;
    document_key: string;
    original_name: string;
    content_type: string;
    size_bytes: number;
    uploaded_at: string;
    file_url?: string | null;
  }[];
  created_at: string;
  updated_at: string;
}

function formatFieldLabel(key: string): string {
  const customMap: Record<string, string> = {
    dob: "Date of Birth",
    alt_mobile: "Alternate Mobile Number",
    bar_council: "State Bar Council / Regulatory Body",
    enrollment_number: "Enrollment / License Number",
    enrollment_year: "Enrollment / Registration Year",
    passing_year: "Year of Passing",
    firm_name: "Firm / Organization Name",
    practice_city: "Practice City / Location",
    practice_type: "Practice Mode",
    practice_areas: "Practice Areas & Specialisations",
    courts: "Courts & Jurisdictions",
    languages: "Languages Spoken",
    blood_group: "Blood Group",
    qualification: "Educational Qualification",
  };
  if (customMap[key]) return customMap[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function extractKeyValuePairs(raw?: Record<string, unknown>): { key: string; label: string; value: unknown }[] {
  if (!raw || typeof raw !== "object") return [];
  const entries: { key: string; label: string; value: unknown }[] = [];

  for (const [k, v] of Object.entries(raw)) {
    let parsedVal = v;
    if (typeof v === "string" && (v.startsWith("{") || v.startsWith("["))) {
      try {
        parsedVal = JSON.parse(v);
      } catch { }
    }

    if (parsedVal && typeof parsedVal === "object" && !Array.isArray(parsedVal)) {
      // It's a nested object (e.g. UUID -> { courts: [...], firm_name: "ABC", ... })
      for (const [subK, subV] of Object.entries(parsedVal as Record<string, unknown>)) {
        entries.push({
          key: `${k}_${subK}`,
          label: formatFieldLabel(subK),
          value: subV,
        });
      }
    } else {
      entries.push({
        key: k,
        label: formatFieldLabel(k),
        value: parsedVal,
      });
    }
  }

  return entries;
}

function renderFieldValue(val: unknown) {
  if (val === null || val === undefined || val === "") {
    return <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>—</Typography>;
  }

  if (Array.isArray(val)) {
    if (val.length === 0) {
      return <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>—</Typography>;
    }
    return (
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
        {val.map((item, idx) => (
          <Chip
            key={idx}
            size="small"
            label={String(item)}
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
          />
        ))}
      </Stack>
    );
  }

  if (typeof val === "boolean") {
    return (
      <Chip
        size="small"
        label={val ? "Yes" : "No"}
        color={val ? "success" : "default"}
        variant="outlined"
        sx={{ fontWeight: 700, fontSize: "0.75rem" }}
      />
    );
  }

  return (
    <Typography sx={{ color: "#0f172a", fontSize: "0.875rem", fontWeight: 500, wordBreak: "break-word" }}>
      {String(val)}
    </Typography>
  );
}

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");

  const [data, setData] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
    confirmColor?: "primary" | "error" | "warning" | "success";
  }>({
    open: false,
    title: "",
    message: "",
    action: async () => { },
  });

  const loadRegistration = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const reg = await professionalOnboardingService.getRegistration(id);
      setData(reg as unknown as RegistrationDetail);
    } catch (err) {
      setError(getOnboardingApiErrorMessage(err, "Failed to load registration details."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRegistration();
  }, [loadRegistration]);

  const handleApprove = () => {
    setConfirmDialog({
      open: true,
      title: "Approve Registration",
      message: `Are you sure you want to approve registration ${data?.reference_id || id}? The applicant will be marked as approved.`,
      confirmColor: "success",
      action: async () => {
        setActionLoading(true);
        try {
          await professionalOnboardingService.approveRegistration(id);
          setToastMsg("Registration approved successfully.");
          await loadRegistration();
        } catch (err) {
          setError(getOnboardingApiErrorMessage(err, "Failed to approve registration."));
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleReject = () => {
    setConfirmDialog({
      open: true,
      title: "Reject Registration",
      message: `Are you sure you want to reject registration ${data?.reference_id || id}?`,
      confirmColor: "error",
      action: async () => {
        setActionLoading(true);
        try {
          await professionalOnboardingService.rejectRegistration(id);
          setToastMsg("Registration rejected.");
          await loadRegistration();
        } catch (err) {
          setError(getOnboardingApiErrorMessage(err, "Failed to reject registration."));
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleUnderReview = () => {
    setConfirmDialog({
      open: true,
      title: "Mark Under Review",
      message: `Mark registration ${data?.reference_id || id} as under review?`,
      confirmColor: "warning",
      action: async () => {
        setActionLoading(true);
        try {
          await professionalOnboardingService.markRegistrationUnderReview(id);
          setToastMsg("Registration marked as under review.");
          await loadRegistration();
        } catch (err) {
          setError(getOnboardingApiErrorMessage(err, "Failed to update registration."));
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      title: "Delete Registration",
      message: `Are you sure you want to permanently delete registration ${data?.reference_id || id}? This action cannot be undone.`,
      confirmColor: "error",
      action: async () => {
        setActionLoading(true);
        try {
          await professionalOnboardingService.deleteRegistration(id);
          setToastMsg("Registration deleted.");
          router.push("/admin/practice-areas/registrations");
        } catch (err) {
          setError(getOnboardingApiErrorMessage(err, "Failed to delete registration."));
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <AdminPageShell title="Registration Details">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </AdminPageShell>
    );
  }

  if (error && !data) {
    return (
      <AdminPageShell title="Registration Details">
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button component={Link} href="/admin/practice-areas/registrations" startIcon={<ArrowBackIcon />}>
          Back to Registrations
        </Button>
      </AdminPageShell>
    );
  }

  // Find uploaded photo file if available
  const photoDoc = data?.files?.find(
    (f) =>
      f.document_key === "photo" ||
      f.document_key === "profile_photo" ||
      f.original_name?.toLowerCase().endsWith(".jpg") ||
      f.original_name?.toLowerCase().endsWith(".jpeg") ||
      f.original_name?.toLowerCase().endsWith(".png")
  );

  const commonEntries = extractKeyValuePairs(data?.common_field_values);
  const profEntries = extractKeyValuePairs(data?.profession_field_values);

  return (
    <AdminPageShell
      title={`Registration: ${data?.reference_id || id}`}
      subtitle={`Submitted on ${data?.created_at ? new Date(data.created_at).toLocaleString("en-IN") : "—"}`}
      actions={
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button
            component={Link}
            href="/admin/practice-areas/registrations"
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{ borderColor: "#e2e8f0", color: "#64748b" }}
          >
            Back
          </Button>
          {data?.status !== "approved" && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={handleApprove}
              disabled={actionLoading}
              sx={{ fontWeight: 700 }}
            >
              Approve
            </Button>
          )}
          {data?.status !== "under_review" && (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              startIcon={<HourglassEmptyIcon />}
              onClick={handleUnderReview}
              disabled={actionLoading}
              sx={{ fontWeight: 700 }}
            >
              Mark Under Review
            </Button>
          )}
          {data?.status !== "rejected" && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<CancelIcon />}
              onClick={handleReject}
              disabled={actionLoading}
              sx={{ fontWeight: 700 }}
            >
              Reject
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={actionLoading}
            sx={{ fontWeight: 700 }}
          >
            Delete
          </Button>
        </Stack>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {data && (
        <Grid container spacing={3}>
          {/* Left Column: Applicant Card & Hierarchy */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, p: 3, mb: 3, bgcolor: "#ffffff" }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
                <Avatar
                  src={photoDoc?.file_url || undefined}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "#2563eb",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    boxShadow: "0 4px 12px rgba(37,99,235,0.15)",
                  }}
                >
                  {(data.applicant_name || data.email || "P").charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }} noWrap>
                    {data.applicant_name || "—"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", wordBreak: "break-all" }}>
                    {data.email || "—"}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Status
                  </Typography>
                  <Chip
                    size="small"
                    label={data.status.replace("_", " ")}
                    color={STATUS_COLOR[data.status] || "default"}
                    sx={{ fontWeight: 700, textTransform: "capitalize" }}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Reference ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace", color: "#2563eb" }}>
                    {data.reference_id}
                  </Typography>
                </Box>
                {data.submitted_by && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                      User Account
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#0f172a", fontSize: "0.8rem" }}>
                      {data.submitted_by}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Submitted At
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#0f172a" }}>
                    {new Date(data.created_at).toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Last Updated
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#0f172a" }}>
                    {new Date(data.updated_at).toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Selected Hierarchy */}
            <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, p: 3, bgcolor: "#ffffff" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <BusinessCenterIcon sx={{ color: "#2563eb" }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Selection Hierarchy
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block", mb: 0.5 }}>
                Categories
              </Typography>
              <Stack direction="row" spacing={0.5} useFlexGap sx={{ mb: 2, flexWrap: "wrap" }}>
                {data.categories && data.categories.length > 0 ? (
                  data.categories.map((c) => (
                    <Chip key={c.id} label={c.name} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>None selected</Typography>
                )}
              </Stack>

              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block", mb: 0.5 }}>
                Groups
              </Typography>
              <Stack direction="row" spacing={0.5} useFlexGap sx={{ mb: 2, flexWrap: "wrap" }}>
                {data.groups && data.groups.length > 0 ? (
                  data.groups.map((g) => (
                    <Chip key={g.id} label={g.name} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>None selected</Typography>
                )}
              </Stack>

              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block", mb: 0.5 }}>
                Professions
              </Typography>
              <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: "wrap" }}>
                {data.professions && data.professions.length > 0 ? (
                  data.professions.map((p) => (
                    <Chip key={p.id} label={p.name} size="small" color="secondary" sx={{ fontWeight: 600 }} />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>None selected</Typography>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Right Column: Structured Forms & Documents */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Common Information */}
            <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, mb: 3, overflow: "hidden", bgcolor: "#ffffff" }}>
              <Box sx={{ px: 3, py: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  Personal / Common Information
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {commonEntries.length > 0 ? (
                      commonEntries.map((row) => (
                        <TableRow key={row.key} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ width: "38%", fontWeight: 600, color: "#64748b", fontSize: "0.8125rem" }}>
                            {row.label}
                          </TableCell>
                          <TableCell sx={{ color: "#0f172a" }}>
                            {renderFieldValue(row.value)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} sx={{ color: "#94a3b8", textAlign: "center", py: 3 }}>
                          No common fields recorded.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Profession Specific Details */}
            <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, mb: 3, overflow: "hidden", bgcolor: "#ffffff" }}>
              <Box sx={{ px: 3, py: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  Profession-Specific Details
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {profEntries.length > 0 ? (
                      profEntries.map((row) => (
                        <TableRow key={row.key} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ width: "38%", fontWeight: 600, color: "#64748b", fontSize: "0.8125rem" }}>
                            {row.label}
                          </TableCell>
                          <TableCell sx={{ color: "#0f172a" }}>
                            {renderFieldValue(row.value)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} sx={{ color: "#94a3b8", textAlign: "center", py: 3 }}>
                          No profession-specific fields submitted.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Uploaded Documents */}
            <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, overflow: "hidden", bgcolor: "#ffffff" }}>
              <Box sx={{ px: 3, py: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  Uploaded Documents ({data.files?.length || 0})
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {data.files && data.files.length > 0 ? (
                      data.files.map((f) => {
                        const isPhoto =
                          f.document_key === "photo" ||
                          f.document_key === "profile_photo" ||
                          f.original_name?.toLowerCase().endsWith(".jpg") ||
                          f.original_name?.toLowerCase().endsWith(".jpeg") ||
                          f.original_name?.toLowerCase().endsWith(".png");

                        return (
                          <TableRow key={f.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell sx={{ width: "50px" }}>
                              {isPhoto ? (
                                <Avatar
                                  src={f.file_url || undefined}
                                  variant="rounded"
                                  sx={{ width: 36, height: 36, bgcolor: "#eff6ff" }}
                                >
                                  📷
                                </Avatar>
                              ) : (
                                <DescriptionIcon sx={{ color: "#64748b", fontSize: 24 }} />
                              )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                              {f.original_name || f.document_key}
                              <Typography variant="caption" sx={{ display: "block", color: "#64748b" }}>
                                Document Type: {formatFieldLabel(f.document_key)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ color: "#64748b", fontSize: "0.8rem" }}>
                              {(f.size_bytes / 1024).toFixed(1)} KB
                            </TableCell>
                            <TableCell sx={{ color: "#64748b", fontSize: "0.8rem" }}>
                              {new Date(f.uploaded_at).toLocaleDateString("en-IN")}
                            </TableCell>
                            <TableCell align="right">
                              {f.file_url ? (
                                <Tooltip title="View Document">
                                  <IconButton
                                    size="small"
                                    component="a"
                                    href={f.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ color: "#2563eb" }}
                                  >
                                    <OpenInNewIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ color: "#94a3b8", textAlign: "center", py: 3 }}>
                          No documents uploaded.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog((d) => ({ ...d, open: false }))}>
        <DialogTitle sx={{ fontWeight: 700 }}>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDialog((d) => ({ ...d, open: false }))}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={confirmDialog.confirmColor || "primary"}
            onClick={async () => {
              const act = confirmDialog.action;
              setConfirmDialog((d) => ({ ...d, open: false }));
              await act();
            }}
            disabled={actionLoading}
            sx={{ fontWeight: 700 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
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
