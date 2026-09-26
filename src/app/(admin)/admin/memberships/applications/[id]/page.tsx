"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  membershipOnboardingAdminService,
  type AdminMembershipApplicationDetail,
} from "@/services/admin/membershipOnboarding.service";

export default function AdminMembershipApplicationDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [app, setApp] = useState<AdminMembershipApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setApp(await membershipOnboardingAdminService.getApplication(id));
    } catch {
      setApp(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <AdminPageShell title="Application">
        <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>
      </AdminPageShell>
    );
  }

  if (!app) {
    return (
      <AdminPageShell title="Application not found">
        <Button component={Link} href="/admin/memberships" sx={{ textTransform: "none" }}>Back</Button>
      </AdminPageShell>
    );
  }

  const fieldEntries = Object.entries(app.field_values ?? {});

  return (
    <AdminPageShell
      title={app.reference_id}
      subtitle={`${app.person_name} · ${app.membership_type_name}`}
    >
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
        <Button component={Link} href="/admin/memberships" variant="outlined" sx={{ textTransform: "none" }}>
          ← Back
        </Button>
        <Chip label={app.status} />
        <Button
          sx={{ textTransform: "none" }}
          onClick={async () => {
            await membershipOnboardingAdminService.reviewApplication(id);
            load();
          }}
          disabled={app.status === "under_review" || app.status === "approved"}
        >
          Mark under review
        </Button>
        <Button
          variant="contained"
          sx={{ textTransform: "none" }}
          onClick={async () => {
            await membershipOnboardingAdminService.approveApplication(id);
            load();
          }}
          disabled={app.status === "approved"}
        >
          Approve
        </Button>
        <Button
          color="error"
          sx={{ textTransform: "none" }}
          onClick={async () => {
            const reason = window.prompt("Rejection reason:");
            if (!reason) return;
            await membershipOnboardingAdminService.rejectApplication(id, reason);
            load();
          }}
          disabled={app.status === "rejected"}
        >
          Reject
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Applicant</Typography>
        <Typography>Name: {app.person_name || "—"}</Typography>
        <Typography>Email: {app.email || "—"}</Typography>
        <Typography>Mobile: {app.mobile || "—"}</Typography>
        <Typography sx={{ mt: 2 }}>
          Declaration: {app.declaration_accepted ? "Accepted" : "Not accepted"}
          {app.declaration_date ? ` (${app.declaration_date})` : ""}
        </Typography>
        {app.rejection_reason && (
          <Typography color="error" sx={{ mt: 1 }}>Rejection: {app.rejection_reason}</Typography>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Form responses</Typography>
        {fieldEntries.length === 0 ? (
          <Typography sx={{ color: "#64748b" }}>No field values stored.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fieldEntries.map(([key, val]) => (
                <TableRow key={key}>
                  <TableCell sx={{ fontWeight: 600 }}>{key}</TableCell>
                  <TableCell>{typeof val === "object" ? JSON.stringify(val) : String(val)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Documents</Typography>
        {!app.documents?.length ? (
          <Typography sx={{ color: "#64748b" }}>No documents uploaded.</Typography>
        ) : (
          <Stack spacing={1}>
            {app.documents.map((d) => (
              <Box key={d.document_key} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography sx={{ fontWeight: 600 }}>{d.document_key}</Typography>
                <Chip size="small" label={d.verification_status} />
                {d.url && (
                  <Button href={d.url} target="_blank" rel="noopener" size="small" sx={{ textTransform: "none" }}>
                    {d.original_name || "View file"}
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>History</Typography>
        {!app.history?.length ? (
          <Typography sx={{ color: "#64748b" }}>No history entries.</Typography>
        ) : (
          <Stack spacing={1}>
            {app.history.map((h, i) => (
              <Typography key={i} variant="body2">
                {h.created_at} — {h.action}
              </Typography>
            ))}
          </Stack>
        )}
      </Paper>
    </AdminPageShell>
  );
}
