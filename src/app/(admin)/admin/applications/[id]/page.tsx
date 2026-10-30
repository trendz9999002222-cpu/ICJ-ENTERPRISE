"use client";

import { env } from "@/config/env";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import InfoIcon from "@mui/icons-material/Info";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface ReviewHistory {
  reviewed_by: string;
  action: string;
  note: string;
  reviewed_at: string;
}

interface ApplicationDetail {
  id: string;
  reference_number: string;
  applicant_name: string;
  email: string;
  mobile_number?: string;
  pathway: string;
  category: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  personal_data?: Record<string, unknown>;
  professional_data?: Record<string, unknown>;
  category_data?: Record<string, unknown>;
  review_history?: ReviewHistory[];
}

const STATUS_CHIP: Record<string, { label: string; color: "default" | "warning" | "success" | "error" | "info" }> = {
  pending: { label: "Pending", color: "default" },
  under_review: { label: "Under Review", color: "warning" },
  approved: { label: "Approved", color: "success" },
  rejected: { label: "Rejected", color: "error" },
  info_requested: { label: "Info Requested", color: "info" },
};

function DataSection({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown> | undefined | null;
}) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 700 }}>
        {title}
      </Typography>
      <Grid container spacing={1.5}>
        {Object.entries(data).map(([k, v]) => {
          if (v === null || v === undefined || v === "") return null;
          let display = String(v);
          if (Array.isArray(v)) display = v.join(", ");
          if (typeof v === "object" && !Array.isArray(v)) display = JSON.stringify(v, null, 2);
          return (
            <Grid key={k} size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize", fontWeight: 600 }}>
                  {k.replace(/_/g, " ")}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.3, wordBreak: "break-word", fontWeight: 600 }}>
                  {display}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default function AdminApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<"approve" | "reject" | "request_info">("approve");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadApp = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/icj_access_token=([^;]+)/)?.[1];
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${env.apiUrl}/admin/applications/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load application (${res.status})`);
      const data = await res.json();
      setApp(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load application");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadApp();
  }, [loadApp]);

  const handleReview = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const token = document.cookie.match(/icj_access_token=([^;]+)/)?.[1];
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${env.apiUrl}/admin/applications/${id}/review/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: decision, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.detail || data?.action?.[0] || JSON.stringify(data);
        throw new Error(msg);
      }
      setSuccessMsg(`Application ${decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "flagged for more information"} successfully.`);
      loadApp();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Review action failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !app) {
    return (
      <Alert severity="error" action={<Button onClick={loadApp}>Retry</Button>}>
        {error}
      </Alert>
    );
  }

  if (!app) return null;

  const status = STATUS_CHIP[app.status] ?? { label: app.status, color: "default" as const };
  const isReviewable = ["pending", "under_review"].includes(app.status);

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: "center" }}>
        <Button
          component={Link}
          href="/admin/applications"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          size="small"
          sx={{ textTransform: "none" }}
        >
          Back to Applications
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            {app.reference_number}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Submitted {new Date(app.submitted_at).toLocaleString("en-IN")}
          </Typography>
        </Box>
        <Chip label={status.label} color={status.color} />
      </Stack>

      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg(null)}>{successMsg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Left: Application details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}>
            {/* Applicant info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 800 }}>
                Applicant Details
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  { label: "Full Name", value: app.applicant_name },
                  { label: "Email", value: app.email },
                  { label: "Mobile", value: app.mobile_number ?? "—" },
                  { label: "Pathway", value: app.pathway?.replace(/_/g, " ") },
                  { label: "Category", value: app.category },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ mt: 0.3, fontWeight: 700 }}>{item.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider sx={{ mb: 3 }} />
            <DataSection title="Personal Data" data={app.personal_data} />
            <DataSection title="Professional Data" data={app.professional_data} />
            <DataSection title="Category-Specific Data" data={app.category_data} />

            {/* Review history */}
            {app.review_history && app.review_history.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 800 }}>
                  Review History
                </Typography>
                <Stack spacing={2}>
                  {app.review_history.map((h, i) => (
                    <Card key={i} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} sx={{ mb: 0.5, alignItems: "center" }}>
                          {h.action === "approve" ? (
                            <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 16 }} />
                          ) : h.action === "reject" ? (
                            <InfoIcon sx={{ color: "#dc2626", fontSize: 16 }} />
                          ) : (
                            <HourglassEmptyIcon sx={{ color: "#d97706", fontSize: 16 }} />
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {h.action?.replace(/_/g, " ")} by {h.reviewed_by}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(h.reviewed_at).toLocaleDateString("en-IN")}
                          </Typography>
                        </Stack>
                        {h.note && (
                          <Typography variant="body2" color="text.secondary" sx={{ pl: 3 }}>
                            {h.note}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </>
            )}
          </Paper>
        </Grid>

        {/* Right: Review panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: isReviewable ? "1px solid #e2e8f0" : "1px solid #f1f5f9",
              borderRadius: 2,
              position: "sticky",
              top: 24,
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 800 }}>
              Review Decision
            </Typography>

            {!isReviewable && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This application has already been {app.status}. You can still update the decision.
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                size="small"
                label="Decision"
                value={decision}
                onChange={(e) => setDecision(e.target.value as typeof decision)}
              >
                <MenuItem value="approve">✅ Approve</MenuItem>
                <MenuItem value="reject">❌ Reject</MenuItem>
                <MenuItem value="request_info">ℹ️ Request More Information</MenuItem>
              </TextField>

              <TextField
                fullWidth
                multiline
                minRows={4}
                size="small"
                label="Notes / Reason"
                placeholder="Add review notes or reason for decision..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <Button
                variant="contained"
                onClick={handleReview}
                disabled={submitting}
                fullWidth
                sx={{ textTransform: "none", fontWeight: 700, py: 1.2 }}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
              >
                {submitting ? "Saving..." : "Submit Review Decision"}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
