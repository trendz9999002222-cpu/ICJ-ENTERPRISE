"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
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
  TextField,
  Typography,
} from "@mui/material";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  membershipOnboardingAdminService,
  type AdminMembershipApplication,
} from "@/services/admin/membershipOnboarding.service";

export default function AdminMembershipsPage() {
  const [rows, setRows] = useState<AdminMembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await membershipOnboardingAdminService.listApplications({ search, status });
      setRows(data.results ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminPageShell
      title="Membership Applications"
      subtitle="Review submitted membership applications. Payment is bypassed in the current phase."
    >
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button component={Link} href="/admin/memberships/form-builder" variant="contained" sx={{ textTransform: "none" }}>
          Form builder
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Reference, name, email…"
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="under_review">Under review</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={load} sx={{ textTransform: "none" }}>Refresh</Button>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={28} /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Application ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Form</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{row.reference_id}</TableCell>
                  <TableCell>{row.person_name || "—"}</TableCell>
                  <TableCell>{row.email || "—"}</TableCell>
                  <TableCell>{row.membership_type_name || "Membership"}</TableCell>
                  <TableCell>
                    <Chip label={row.status} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <Button
                        component={Link}
                        href={`/admin/memberships/applications/${row.id}`}
                        size="small"
                        sx={{ textTransform: "none" }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        onClick={async () => {
                          await membershipOnboardingAdminService.approveApplication(row.id);
                          load();
                        }}
                        disabled={row.status === "approved"}
                        sx={{ textTransform: "none" }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={async () => {
                          const reason = window.prompt("Rejection reason:");
                          if (!reason) return;
                          await membershipOnboardingAdminService.rejectApplication(row.id, reason);
                          load();
                        }}
                        disabled={row.status === "rejected"}
                        sx={{ textTransform: "none" }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography sx={{ py: 3, textAlign: "center", color: "#64748b" }}>
                      No applications yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

    </AdminPageShell>
  );
}
