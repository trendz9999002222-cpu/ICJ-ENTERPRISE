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
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/api/client";
import {
  type AdvocateApplicationDetail,
  type AdvocateApplicationSummary,
  onboardingService,
} from "@/services/onboarding.service";

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
] as const;

function statusColor(status: string): "warning" | "success" | "error" | "default" {
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

export default function AdvocateVerificationPanel() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<AdvocateApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<AdvocateApplicationDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const loadList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await onboardingService.listAdvocateApplications({
        status: statusFilter,
        search: search.trim() || undefined,
      });
      setApplications(res.data.results);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError("You do not have permission to verify advocate applications.");
      } else {
        setError("Unable to load advocate applications. Check API connection and login.");
      }
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
      const res = await onboardingService.getAdvocateApplication(id);
      setDetail(res.data);
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
      await onboardingService.approveAdvocateApplication(detail.id);
      setDetailOpen(false);
      setDetail(null);
      await loadList();
    } catch {
      setError("Approval failed. The application may no longer be pending.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!detail) return;
    setActionLoading(true);
    setError("");
    try {
      await onboardingService.rejectAdvocateApplication(detail.id, rejectReason);
      setDetailOpen(false);
      setDetail(null);
      await loadList();
    } catch {
      setError("Rejection failed. The application may no longer be pending.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 2 }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Advocate onboarding verification
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review KYC submissions from the public join flow and approve or reject advocates.
          </Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={loadList} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Tabs
        value={statusFilter}
        onChange={(_, value) => setStatusFilter(value)}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        {STATUS_TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>

      <TextField
        size="small"
        label="Search reference, email, or name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") loadList();
        }}
        sx={{ mb: 2, minWidth: 280 }}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : applications.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
          No applications found for this filter.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Reference</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Bar #</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.reference_id}</TableCell>
                <TableCell>{row.full_name || "—"}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.bar_number || "—"}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.status} color={statusColor(row.status)} />
                </TableCell>
                <TableCell>{formatDate(row.created_at)}</TableCell>
                <TableCell align="right">
                  <Button size="small" startIcon={<VisibilityIcon />} onClick={() => openDetail(row.id)}>
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {detail?.reference_id} — {detail?.full_name || detail?.email}
        </DialogTitle>
        <DialogContent dividers>
          {detail && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Chip label={detail.status} color={statusColor(detail.status)} />
                <Chip label={`Bar: ${(detail.advocate_data?.barNumber as string) || "—"}`} variant="outlined" />
                <Chip label={`Mobile: ${(detail.personal_data?.mobile as string) || "—"}`} variant="outlined" />
              </Stack>

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Professional summary</Typography>
              <Typography variant="body2" color="text.secondary">
                {(detail.advocate_data?.profileBio as string) || "No bio provided."}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Practice areas</Typography>
              <Typography variant="body2">
                {Array.isArray(detail.advocate_data?.practiceAreas)
                  ? (detail.advocate_data.practiceAreas as string[]).join(", ")
                  : "—"}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Documents</Typography>
              <Stack spacing={0.5}>
                {detail.documents.map((doc) => (
                  <Link key={doc.id} href={doc.file_url ?? "#"} target="_blank" rel="noopener noreferrer">
                    {doc.doc_key}: {doc.original_name}
                  </Link>
                ))}
              </Stack>

              {detail.status === "rejected" && detail.rejection_reason && (
                <Alert severity="warning">Rejection reason: {detail.rejection_reason}</Alert>
              )}

              {detail.status === "pending" && (
                <TextField
                  label="Rejection reason (optional)"
                  multiline
                  minRows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  fullWidth
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          {detail?.status === "pending" && (
            <>
              <Button
                color="error"
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
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
