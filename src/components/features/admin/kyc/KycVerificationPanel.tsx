"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { adminKycService } from "@/services/admin/adminKyc.service";
import type { AdminKycApplication, KycStatus } from "@/types/admin";

// ---------------------------------------------------------------------------

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
] as const;

type TabValue = (typeof STATUS_TABS)[number]["value"];

function statusChipColor(
  status: string
): "warning" | "success" | "error" | "default" {
  if (status === "pending") return "warning";
  if (status === "approved") return "success";
  if (status === "rejected") return "error";
  return "default";
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ---------------------------------------------------------------------------

export default function KycVerificationPanel() {
  const [statusFilter, setStatusFilter] = useState<TabValue>("pending");
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<AdminKycApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<AdminKycApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const loadList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminKycService.listApplications({
        status: statusFilter as KycStatus | "all",
        search: search.trim() || undefined,
      });
      setApplications(res.results);
    } catch {
      setError("Unable to load KYC applications.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openDetail = async (id: string) => {
    setError("");
    try {
      const app = await adminKycService.getApplication(id);
      setDetail(app);
      setRejectReason("");
      setDetailOpen(true);
    } catch {
      setError("Failed to load application details.");
    }
  };

  const handleApprove = async () => {
    if (!detail) return;
    setActionLoading(true);
    setError("");
    try {
      await adminKycService.approveApplication(detail.id);
      setDetailOpen(false);
      setDetail(null);
      await loadList();
    } catch {
      setError("Approval failed. Application may no longer be pending.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!detail) return;
    setActionLoading(true);
    setError("");
    try {
      await adminKycService.rejectApplication(detail.id, rejectReason);
      setDetailOpen(false);
      setDetail(null);
      await loadList();
    } catch {
      setError("Rejection failed. Application may no longer be pending.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      {/* Header row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 2.5 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
            KYC Applications
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Review advocate onboarding submissions — approve or reject KYC documents.
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          size="small"
          onClick={loadList}
          disabled={loading}
          sx={{ borderColor: "#e2e8f0", color: "#475569", alignSelf: "flex-start" }}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Status tabs */}
      <Tabs
        value={statusFilter}
        onChange={(_, v) => setStatusFilter(v)}
        sx={{
          mb: 2,
          borderBottom: "1px solid #e2e8f0",
          "& .MuiTab-root": { fontWeight: 600, fontSize: "0.8125rem" },
          "& .Mui-selected": { color: "#2563eb" },
          "& .MuiTabs-indicator": { bgcolor: "#2563eb" },
        }}
      >
        {STATUS_TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      {/* Search */}
      <TextField
        size="small"
        label="Search reference, email, name, or bar number"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") loadList(); }}
        sx={{ mb: 2, width: { xs: "100%", sm: 380 } }}
      />

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : applications.length === 0 ? (
        <Typography
          color="text.secondary"
          sx={{ py: 4, textAlign: "center" }}
        >
          No applications found for this filter.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#475569", textTransform: "uppercase" }}>Reference</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#475569", textTransform: "uppercase" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#475569", textTransform: "uppercase" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#475569", textTransform: "uppercase" }}>Bar #</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#475569", textTransform: "uppercase" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#475569", textTransform: "uppercase" }}>Submitted</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#475569", textTransform: "uppercase" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 700, color: "#2563eb", fontSize: "0.8125rem" }}>
                  {row.reference_id}
                </TableCell>
                <TableCell sx={{ fontSize: "0.8125rem" }}>{row.full_name || "—"}</TableCell>
                <TableCell sx={{ fontSize: "0.8125rem" }}>{row.email}</TableCell>
                <TableCell sx={{ fontSize: "0.8125rem" }}>{row.bar_number || "—"}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.status}
                    color={statusChipColor(row.status)}
                    sx={{ fontWeight: 700, fontSize: "0.7rem", textTransform: "capitalize" }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: "0.8125rem", color: "#64748b" }}>
                  {formatDate(row.created_at)}
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => openDetail(row.id)}
                    sx={{ fontWeight: 700, color: "#2563eb" }}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Detail dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: "#0f172a" }}>
          {detail?.reference_id} — {detail?.full_name || detail?.email}
        </DialogTitle>
        <DialogContent dividers>
          {detail && (
            <Stack spacing={2.5}>
              {/* Status chips */}
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                <Chip
                  label={detail.status}
                  color={statusChipColor(detail.status)}
                  sx={{ fontWeight: 700, textTransform: "capitalize" }}
                />
                <Chip
                  label={`Bar: ${(detail.advocate_data?.barNumber as string) || "—"}`}
                  variant="outlined"
                />
                <Chip
                  label={`Mobile: ${detail.mobile || "—"}`}
                  variant="outlined"
                />
                {detail.reviewed_by_email && (
                  <Chip
                    label={`Reviewed by: ${detail.reviewed_by_email}`}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>

              {/* Bio */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Professional Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(detail.advocate_data?.profileBio as string) || "No bio provided."}
                </Typography>
              </Box>

              {/* Practice areas */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Practice Areas
                </Typography>
                <Typography variant="body2">
                  {Array.isArray(detail.advocate_data?.practiceAreas)
                    ? (detail.advocate_data.practiceAreas as string[]).join(", ")
                    : "—"}
                </Typography>
              </Box>

              {/* Personal details */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Bar Council &amp; Enrollment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Council: {(detail.advocate_data?.stateBarCouncil as string) || "—"} &nbsp;|&nbsp;
                  Enrollment: {(detail.advocate_data?.enrollmentNumber as string) || "—"} &nbsp;|&nbsp;
                  Experience: {(detail.advocate_data?.yearsOfExperience as number) || "—"} yr(s)
                </Typography>
              </Box>

              {/* Documents */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Uploaded Documents
                </Typography>
                <Stack spacing={0.5}>
                  {detail.documents.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No documents uploaded.</Typography>
                  ) : detail.documents.map((doc) => (
                    <Link
                      key={doc.id}
                      href={doc.file_url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontSize: "0.8125rem" }}
                    >
                      {doc.doc_key}: {doc.original_name}
                    </Link>
                  ))}
                </Stack>
              </Box>

              {/* Rejection reason (if already rejected) */}
              {detail.status === "rejected" && detail.rejection_reason && (
                <Alert severity="warning">
                  Rejection reason: {detail.rejection_reason}
                </Alert>
              )}

              {/* Reject reason input (only for pending) */}
              {detail.status === "pending" && (
                <TextField
                  label="Rejection reason (optional)"
                  multiline
                  minRows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  fullWidth
                  helperText="Leave blank if approving. Required only when rejecting."
                />
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setDetailOpen(false)} sx={{ color: "#64748b" }}>
            Close
          </Button>
          {detail?.status === "pending" && (
            <>
              <Button
                color="error"
                variant="outlined"
                startIcon={<HighlightOffIcon />}
                onClick={handleReject}
                disabled={actionLoading}
              >
                Reject
              </Button>
              <Button
                color="success"
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing…" : "Approve"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
