"use client";

import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdditionalFieldsManager from "@/components/features/admin/shared/AdditionalFieldsManager";
import { type FieldFormState } from "@/components/features/admin/shared/FieldFormFields";
import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import type { HonorableFormField } from "@/services/public/honorableAdvisory.service";
import HonorableAdvisoryActions from "./HonorableAdvisoryActions";

const ADMIN_BASE = "/honorable-advisory/admin";

type AdminField = HonorableFormField & { id?: string; is_active?: boolean };

export default function AdminHonorableAdvisoryPage() {
  const [fields, setFields] = useState<AdminField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fieldPage, setFieldPage] = useState(0);
  const [fieldRowsPerPage, setFieldRowsPerPage] = useState(10);

  const token = () => readAccessTokenFromCookie();

  const load = async () => {
    setLoading(true);
    const t = token();
    if (!t) return;
    try {
      const res = await apiClient<{ success: boolean; data: { results: AdminField[] } }>(
        `${ADMIN_BASE}/form-fields/`, { headers: { Authorization: `Bearer ${t}` } }
      );
      setFields(res.data.results);
    } catch {
      setError("Could not load form fields.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);



  const handleSaveField = async (id: string | null, form: FieldFormState) => {
    const t = token();
    if (!t) return;
    try {
      await apiClient(`${ADMIN_BASE}/form-fields/`, {
        method: id ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${t}` },
        body: {
          ...(id ? { id } : {}),
          label: form.label.trim(),
          field_type: form.field_type,
          required: form.is_required,
          display_order: form.display_order || 0,
          is_active: form.is_active,
          options: form.options,
        },
      });
      load();
    } catch {
      setError("Could not save field.");
    }
  };

  const handleToggleActive = async (f: AdminField) => {
    const t = token();
    if (!t) return;
    setLoading(true);
    try {
      await apiClient(`${ADMIN_BASE}/form-fields/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${t}` },
        body: { id: f.id, is_active: !f.is_active },
      });
      load();
    } finally {
      setLoading(false);
    }
  };

  const activePreviewFields = fields.filter((f) => f.is_active !== false);
  const paginatedFields = fields.slice(fieldPage * fieldRowsPerPage, fieldPage * fieldRowsPerPage + fieldRowsPerPage);

  return (
    <AdminPageShell
      title="Additional Fields"
      subtitle="Manage form fields and review applications"
      actions={<HonorableAdvisoryActions />}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Box>
          <AdditionalFieldsManager
            title="Additional Fields"
            description="Common fields are currently used for onboarding. Manage additional fields for the application form here."
            fields={fields.map(f => ({
              id: f.id!,
              label: f.label,
              field_key: f.field_key,
              field_type: f.field_type,
              is_required: f.required ?? false,
              is_active: f.is_active !== false,
              display_order: f.display_order ?? 0,
              original: f
            }))}
            loading={loading}
            onSaveField={handleSaveField}
            onToggleActive={(f) => handleToggleActive(f.original)}
          />
        </Box>
      </Paper>
    </AdminPageShell>
  );
}
