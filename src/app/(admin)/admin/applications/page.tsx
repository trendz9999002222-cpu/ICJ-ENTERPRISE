"use client";

import { env } from "@/config/env";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FilterListIcon from "@mui/icons-material/FilterList";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface ApplicationRecord {
  id: string;
  reference_number: string;
  applicant_name: string;
  email: string;
  pathway: string;
  category: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "info_requested";
  submitted_at: string;
  reviewed_at?: string;
}

const STATUS_CHIP: Record<string, { label: string; color: "default" | "warning" | "success" | "error" | "info" }> = {
  pending: { label: "Pending", color: "default" },
  under_review: { label: "Under Review", color: "warning" },
  approved: { label: "Approved", color: "success" },
  rejected: { label: "Rejected", color: "error" },
  info_requested: { label: "Info Requested", color: "info" },
};

const PATHWAY_LABELS: Record<string, string> = {
  legal_professional: "Legal Professional",
  other_professional: "Other Professional",
  volunteer: "Volunteer",
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pathwayFilter, setPathwayFilter] = useState("all");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = document.cookie.match(/icj_access_token=([^;]+)/)?.[1];
      if (!token) throw new Error("Not authenticated");
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (pathwayFilter !== "all") params.set("pathway", pathwayFilter);
      const res = await fetch(`${env.apiUrl}/admin/applications/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load applications (${res.status})`);
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : data?.results ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pathwayFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending" || a.status === "under_review").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <Box>
      <Stack direction="row" sx={{ mb: 3, alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" color="#0f172a" sx={{ fontWeight: 900 }}>
            Professional Applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review, approve and manage all ICJ registration applications.
          </Typography>
        </Box>
        <IconButton onClick={loadApplications} disabled={loading} title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Stack>

      {/* Summary Chips */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
        <Chip label={`Total: ${counts.total}`} variant="outlined" />
        <Chip label={`Pending Review: ${counts.pending}`} color="warning" variant="outlined" icon={<InfoOutlinedIcon />} />
        <Chip label={`Approved: ${counts.approved}`} color="success" variant="outlined" icon={<CheckCircleIcon />} />
        <Chip label={`Rejected: ${counts.rejected}`} color="error" variant="outlined" />
      </Stack>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}>
        <Stack direction="row" spacing={2} sx={{alignItems: "center" }}>
          <FilterListIcon sx={{ color: "#64748b" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="under_review">Under Review</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="info_requested">Info Requested</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Pathway</InputLabel>
            <Select value={pathwayFilter} label="Pathway" onChange={(e) => setPathwayFilter(e.target.value)}>
              <MenuItem value="all">All Pathways</MenuItem>
              <MenuItem value="legal_professional">Legal Professional</MenuItem>
              <MenuItem value="other_professional">Other Professional</MenuItem>
              <MenuItem value="volunteer">Volunteer</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : applications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography color="text.secondary">No applications found with the selected filters.</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Applicant</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Pathway</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => {
                const status = STATUS_CHIP[app.status] ?? { label: app.status, color: "default" as const };
                return (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700 }}>
                        {app.reference_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{app.applicant_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{app.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{PATHWAY_LABELS[app.pathway] ?? app.pathway}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{app.category}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={status.label} color={status.color} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString("en-IN") : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Application">
                        <IconButton
                          component={Link}
                          href={`/admin/applications/${app.id}`}
                          size="small"
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">
        Showing {applications.length} applications. Use filters to narrow results.
      </Typography>
    </Box>
  );
}
