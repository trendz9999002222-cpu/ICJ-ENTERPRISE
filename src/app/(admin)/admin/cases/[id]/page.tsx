"use client";

import { env } from "@/config/env";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import PersonSwitchIcon from "@mui/icons-material/SwapHoriz";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface AssignmentRecord {
  id?: string;
  professional_id: string;
  professional_name?: string;
  assigned_at: string;
  assigned_by?: string;
  reason?: string;
  status?: string;
}

interface CaseDetail {
  id: string;
  case_number: string;
  title: string;
  client_name?: string;
  client_email?: string;
  client_mobile?: string;
  status: string;
  category?: string;
  created_at: string;
  assigned_professional?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  assignment_history?: AssignmentRecord[];
  installments?: Array<{
    id: string;
    installment_number: number;
    amount: string;
    due_date: string;
    is_paid: boolean;
  }>;
}

export default function AdminCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reassignment modal
  const [reassignOpen, setReassignOpen] = useState(false);
  const [newProfId, setNewProfId] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [notifyClient, setNotifyClient] = useState(true);
  const [submittingReassign, setSubmittingReassign] = useState(false);
  const [reassignError, setReassignError] = useState<string | null>(null);

  const loadCase = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/icj_access_token=([^;]+)/)?.[1];
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${env.apiUrl}/admin/services/cases/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load case #${id} (${res.status})`);
      const data = await res.json();
      setCaseData(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load case details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  const handleReassign = async () => {
    if (!newProfId.trim()) {
      setReassignError("Professional ID is required.");
      return;
    }
    if (reassignReason.trim().length < 10) {
      setReassignError("Reassignment reason must be at least 10 characters.");
      return;
    }

    setSubmittingReassign(true);
    setReassignError(null);
    try {
      const token = document.cookie.match(/icj_access_token=([^;]+)/)?.[1];
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${env.apiUrl}/admin/services/cases/${id}/reassign/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          new_professional_id: newProfId.trim(),
          reassignment_reason: reassignReason.trim(),
          notify_client: notifyClient,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || data?.error || "Reassignment failed");
      }
      setSuccessMsg("Professional successfully reassigned to case.");
      setReassignOpen(false);
      setNewProfId("");
      setReassignReason("");
      loadCase();
    } catch (e: unknown) {
      setReassignError(e instanceof Error ? e.message : "Failed to reassign case");
    } finally {
      setSubmittingReassign(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !caseData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={<Button onClick={loadCase}>Retry</Button>}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: "center" }}>
        <Button
          component={Link}
          href="/admin/cases"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          size="small"
          sx={{ textTransform: "none" }}
        >
          Back to Cases
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Case #{caseData?.case_number || id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {caseData?.title || "Legal Matter Profile"}
          </Typography>
        </Box>
        <Chip
          label={caseData?.status?.replace(/_/g, " ")?.toUpperCase() ?? "ACTIVE"}
          color="primary"
          sx={{ fontWeight: 700 }}
        />
        <Button
          variant="contained"
          startIcon={<PersonSwitchIcon />}
          onClick={() => setReassignOpen(true)}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Reassign Professional
        </Button>
      </Stack>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left: Case Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 800 }}>
              Case Summary
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: "Client Name", value: caseData?.client_name ?? "Confidential" },
                { label: "Client Email", value: caseData?.client_email ?? "—" },
                { label: "Client Mobile", value: caseData?.client_mobile ?? "—" },
                { label: "Category", value: caseData?.category ?? "General" },
                { label: "Assigned Professional", value: caseData?.assigned_professional?.name ?? "Unassigned" },
                {
                  label: "Registered Date",
                  value: caseData?.created_at
                    ? new Date(caseData.created_at).toLocaleDateString("en-IN")
                    : "—",
                },
              ].map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.3, fontWeight: 700 }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Assignment History Audit Trail */}
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
              <HistoryIcon sx={{ color: "#2563eb" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Assignment Audit Trail
              </Typography>
            </Stack>

            {caseData?.assignment_history && caseData.assignment_history.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Professional</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Assigned Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Assigned By</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reason / Note</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {caseData.assignment_history.map((record, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {record.professional_name || record.professional_id}
                      </TableCell>
                      <TableCell>
                        {record.assigned_at
                          ? new Date(record.assigned_at).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>
                      <TableCell>{record.assigned_by || "System Admin"}</TableCell>
                      <TableCell>{record.reason || "Initial assignment"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Currently assigned to: <strong>{caseData?.assigned_professional?.name || "None"}</strong>. No prior reassignments recorded.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Right: Quick Actions & Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 800 }}>
              Current Counsel
            </Typography>
            {caseData?.assigned_professional ? (
              <Box sx={{ p: 2, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 2 }}>
                <Typography variant="subtitle2" color="#166534" sx={{ fontWeight: 800 }}>
                  {caseData.assigned_professional.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  ID: {caseData.assigned_professional.id}
                </Typography>
                {caseData.assigned_professional.email && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {caseData.assigned_professional.email}
                  </Typography>
                )}
              </Box>
            ) : (
              <Alert severity="warning">No professional assigned yet.</Alert>
            )}

            <Button
              variant="outlined"
              fullWidth
              startIcon={<PersonSwitchIcon />}
              onClick={() => setReassignOpen(true)}
              sx={{ mt: 2.5, textTransform: "none", fontWeight: 700 }}
            >
              Reassign Professional
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Reassign Dialog */}
      <Dialog open={reassignOpen} onClose={() => setReassignOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reassign Case to Professional</DialogTitle>
        <DialogContent dividers>
          {reassignError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setReassignError(null)}>
              {reassignError}
            </Alert>
          )}

          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="New Professional ID or UUID *"
              placeholder="e.g., 2, or UUID"
              fullWidth
              size="small"
              value={newProfId}
              onChange={(e) => setNewProfId(e.target.value)}
              helperText="Enter the user or professional ID to assign."
            />

            <TextField
              label="Reassignment Reason (Audit Trail) *"
              placeholder="State the institutional reason for reassigning this matter (min 10 characters)..."
              fullWidth
              multiline
              minRows={3}
              size="small"
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              helperText={`${reassignReason.length}/10 characters minimum`}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={notifyClient}
                  onChange={(e) => setNotifyClient(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  Notify client of counsel change via email/SMS
                </Typography>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setReassignOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReassign}
            disabled={submittingReassign}
            startIcon={
              submittingReassign ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />
            }
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {submittingReassign ? "Reassigning..." : "Confirm Reassignment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
