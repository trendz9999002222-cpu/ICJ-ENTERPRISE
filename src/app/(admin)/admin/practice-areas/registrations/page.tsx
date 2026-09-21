"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";
import { Alert, Box, Button, Chip, CircularProgress, Typography } from "@mui/material";

import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  getOnboardingApiErrorMessage,
  professionalOnboardingService,
} from "@/services/admin/professionalOnboarding.service";

type Row = {
  id: string;
  reference_id: string;
  applicant_name: string;
  email: string;
  categories: string[];
  groups: string[];
  professions: string[];
  status: string;
  created_at: string;
};

export default function RegistrationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await professionalOnboardingService.listRegistrations({
        page_size: 50,
        ordering: "-created_at",
      });
      setRows(res.results);
    } catch (err) {
      setError(getOnboardingApiErrorMessage(err, "Failed to load registrations."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: AdminTableColumn<Row>[] = [
    { key: "ref", label: "Request ID", minWidth: 140, render: (r) => <strong>{r.reference_id}</strong> },
    { key: "name", label: "Applicant", minWidth: 140, render: (r) => r.applicant_name },
    { key: "email", label: "Email", minWidth: 160, render: (r) => r.email },
    {
      key: "professions",
      label: "Professions",
      minWidth: 180,
      render: (r) => r.professions.join(", ") || "—",
    },
    {
      key: "status",
      label: "Status",
      width: 110,
      render: (r) => <Chip size="small" label={r.status} />,
    },
    {
      key: "created",
      label: "Submitted",
      width: 160,
      render: (r) => new Date(r.created_at).toLocaleString(),
    },
    {
      key: "view",
      label: "",
      width: 90,
      render: (r) => (
        <Button component={Link} href={`/admin/practice-areas/registrations/${r.id}`} size="small">
          View
        </Button>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Register as Professional"
      subtitle="Review professional onboarding applications submitted from the public join flow."
    >
      <Box sx={{ mb: 2 }}>
        <Button component={Link} href="/admin/practice-areas" variant="outlined" size="small">
          Back to onboarding hub
        </Button>
      </Box>
      <AdminDataTable<Row>
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        emptyMessage="No registrations yet."
        getRowKey={(r) => r.id}
      />
    </AdminPageShell>
  );
}
