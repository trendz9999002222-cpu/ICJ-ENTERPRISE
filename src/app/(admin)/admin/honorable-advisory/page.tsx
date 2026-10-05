"use client";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PreviewIcon from "@mui/icons-material/Preview";
import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Box,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";

import ConfiguredFormField from "@/components/form/ConfiguredFormField";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import type { HonorableFormField } from "@/services/public/honorableAdvisory.service";

const ADMIN_BASE = "/honorable-advisory/admin";

type AdminField = HonorableFormField & { id?: string; is_active?: boolean };
type AdminApplication = { id: string; reference_id: string; status: string; submitted_at?: string };

export default function AdminHonorableAdvisoryPage() {
  const [fields, setFields] = useState<AdminField[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);

  const [fieldOpen, setFieldOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldForm, setFieldForm] = useState({
    label: "",
    field_type: "text",
    required: false,
    display_order: "0",
    is_active: true,
  });
  const [fieldSaving, setFieldSaving] = useState(false);

  const [memberOpen, setMemberOpen] = useState(false);
  const [memberForm, setMemberForm] = useState<Record<string, any>>({ display_order: "0" });
  const [memberPhoto, setMemberPhoto] = useState<File | null>(null);
  const [memberSaving, setMemberSaving] = useState(false);

  const [fieldPage, setFieldPage] = useState(0);
  const [fieldRowsPerPage, setFieldRowsPerPage] = useState(10);
  const [appPage, setAppPage] = useState(0);
  const [appRowsPerPage, setAppRowsPerPage] = useState(10);

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
    }
    try {
      const apps = await apiClient<{ success: boolean; data: { results: AdminApplication[] } }>(
        `${ADMIN_BASE}/applications/`, { headers: { Authorization: `Bearer ${t}` } }
      );
      setApplications(apps.data.results);
    } catch {
      // Optional
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createMember = async () => {
    const t = readAccessTokenFromCookie();
    if (!t) return;
    setMemberSaving(true);
    try {
      const fd = new FormData();
      const fieldValuesOnly: Record<string, any> = {};

      for (const [key, value] of Object.entries(memberForm)) {
        if (key === "display_order") {
          fd.set(key, value);
        } else if (value instanceof File) {
          fd.set(`file__${key}`, value);
        } else {
          fieldValuesOnly[key] = value;
        }
      }

      fd.set("field_values", JSON.stringify(fieldValuesOnly));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}${ADMIN_BASE}/members/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to create");

      setMemberOpen(false);
      setMemberForm({ display_order: "0" });
      load();
    } catch {
      setError("Could not onboard member.");
    } finally {
      setMemberSaving(false);
    }
  };

  const handleAddField = () => {
    setEditingFieldId(null);
    setFieldForm({ label: "", field_type: "text", required: false, display_order: "0", is_active: true });
    setFieldOpen(true);
  };

  const handleEditField = (f: AdminField) => {
    setEditingFieldId(f.id!);
    setFieldForm({
      label: f.label,
      field_type: f.field_type,
      required: !!f.required,
      display_order: String(f.display_order ?? 0),
      is_active: f.is_active !== false,
    });
    setFieldOpen(true);
  };

  const saveField = async () => {
    const t = token();
    if (!t || !fieldForm.label.trim()) return;
    setFieldSaving(true);
    try {
      await apiClient(`${ADMIN_BASE}/form-fields/`, {
        method: editingFieldId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${t}` },
        body: {
          ...(editingFieldId ? { id: editingFieldId } : {}),
          label: fieldForm.label.trim(),
          field_type: fieldForm.field_type,
          required: fieldForm.required,
          display_order: parseInt(fieldForm.display_order) || 0,
          is_active: fieldForm.is_active,
        },
      });
      setFieldOpen(false);
      setEditingFieldId(null);
      load();
    } catch {
      setError("Could not save field.");
    } finally {
      setFieldSaving(false);
    }
  };

  const approve = async (id: string) => {
    const t = token();
    if (!t) return;
    await apiClient(`${ADMIN_BASE}/applications/${id}/approve/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}` },
      body: {},
    });
    load();
  };

  const fieldColumns: AdminTableColumn<AdminField>[] = [
    {
      key: "display_order",
      label: "Order",
      minWidth: 80,
      render: (f) => <Typography sx={{ fontSize: "0.825rem", color: "#64748b", fontWeight: 700 }}>{f.display_order}</Typography>,
    },
    {
      key: "label",
      label: "Label",
      minWidth: 150,
      render: (f) => <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>{f.label}</Typography>,
    },
    {
      key: "field_key",
      label: "Key",
      minWidth: 120,
      render: (f) => <Typography sx={{ fontSize: "0.825rem", color: "#64748b", fontFamily: "monospace" }}>{f.field_key}</Typography>,
    },
    {
      key: "field_type",
      label: "Type",
      minWidth: 100,
      render: (f) => <Typography sx={{ fontSize: "0.825rem", color: "#334155" }}>{f.field_type}</Typography>,
    },
    {
      key: "required",
      label: "Required",
      minWidth: 90,
      render: (f) => <Typography sx={{ fontSize: "0.825rem", color: "#334155" }}>{f.required ? "Yes" : "No"}</Typography>,
    },
    {
      key: "active",
      label: "Active",
      minWidth: 90,
      render: (f) => (
        <Chip size="small" label={f.is_active ? "Active" : "Off"} color={f.is_active ? "success" : "default"} sx={{ fontWeight: 700, fontSize: "0.7rem", borderRadius: 1.5 }} />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: 90,
      align: "right",
      render: (f) => (
        <Button size="small" variant="outlined" onClick={() => handleEditField(f)} sx={{ textTransform: "none", py: 0.25 }}>Edit</Button>
      ),
    },
  ];

  const appColumns: AdminTableColumn<AdminApplication>[] = [
    {
      key: "reference_id",
      label: "Reference",
      minWidth: 140,
      render: (a) => <Typography sx={{ fontWeight: 700, color: "#2563eb", fontFamily: "monospace", fontSize: "0.825rem" }}>{a.reference_id}</Typography>,
    },
    {
      key: "status",
      label: "Status",
      minWidth: 120,
      render: (a) => (
        <Chip
          size="small"
          label={a.status.replace("_", " ")}
          color={a.status === "pending" ? "warning" : a.status === "approved" ? "success" : "default"}
          sx={{ fontWeight: 700, fontSize: "0.7rem", textTransform: "capitalize", borderRadius: 1.5 }}
        />
      ),
    },
    {
      key: "submitted_at",
      label: "Submitted",
      minWidth: 130,
      render: (a) => (
        <Typography sx={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 500 }}>
          {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </Typography>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: 100,
      align: "right",
      render: (a) => (
        <Box>
          {a.status === "pending" && (
            <Button size="small" onClick={() => approve(a.id)}>Approve</Button>
          )}
        </Box>
      ),
    },
  ];

  const activePreviewFields = fields.filter((f) => f.is_active !== false);
  const paginatedFields = fields.slice(fieldPage * fieldRowsPerPage, fieldPage * fieldRowsPerPage + fieldRowsPerPage);
  const paginatedApps = applications.slice(appPage * appRowsPerPage, appPage * appRowsPerPage + appRowsPerPage);

  return (
    <AdminPageShell
      title="Honorable Advisory Board Onboarding"
      subtitle="Manage form fields and review applications"
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setMemberOpen(true)}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Add Honorable Advisory Board Member
          </Button>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setPreviewOpen(true)}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Preview form
          </Button>
        </Stack>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3, border: "1px solid #e2e8f0" }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Form fields</Typography>
          <Button variant="outlined" startIcon={<AddIcon />} size="small" onClick={handleAddField} sx={{ textTransform: "none" }}>
            Add Field
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage fields for the application form. Keys are auto-generated.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <AdminDataTable
            columns={fieldColumns}
            rows={paginatedFields}
            loading={loading}
            getRowKey={(f) => f.field_key}
            emptyMessage="No form fields found."
            pagination={{
              page: fieldPage,
              rowsPerPage: fieldRowsPerPage,
              totalCount: fields.length,
              onPageChange: setFieldPage,
              onRowsPerPageChange: (v) => { setFieldRowsPerPage(v); setFieldPage(0); }
            }}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, border: "1px solid #e2e8f0" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Pending applications</Typography>
        <Box sx={{ mt: 2 }}>
          <AdminDataTable
            columns={appColumns}
            rows={paginatedApps}
            loading={loading}
            getRowKey={(a) => a.id}
            emptyMessage="No applications."
            pagination={{
              page: appPage,
              rowsPerPage: appRowsPerPage,
              totalCount: applications.length,
              onPageChange: setAppPage,
              onRowsPerPageChange: (v) => { setAppRowsPerPage(v); setAppPage(0); }
            }}
          />
        </Box>
      </Paper>

      <Dialog open={memberOpen} onClose={() => setMemberOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Onboard advisory board member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1, pb: 1 }}>
            {activePreviewFields.map((field) => (
              <ConfiguredFormField
                key={field.field_key}
                field={field as any}
                value={memberForm[field.field_key] || ""}
                onChange={(val) => setMemberForm((p) => ({ ...p, [field.field_key]: val }))}
              />
            ))}
            {activePreviewFields.length === 0 && (
              <Typography color="text.secondary">No fields configured. Please add fields first.</Typography>
            )}
            <Divider sx={{ my: 1 }} />
            <TextField
              label="Display order"
              type="number"
              fullWidth
              value={memberForm.display_order || "0"}
              onChange={(e) => setMemberForm((p) => ({ ...p, display_order: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={memberSaving || activePreviewFields.length === 0} onClick={createMember}>
            {memberSaving ? "Saving…" : "Publish member"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={fieldOpen} onClose={() => setFieldOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingFieldId ? "Edit Form Field" : "Add Form Field"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Field Label"
              required
              fullWidth
              value={fieldForm.label}
              onChange={(e) => setFieldForm((p) => ({ ...p, label: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select
                label="Field Type"
                value={fieldForm.field_type}
                onChange={(e) => setFieldForm((p) => ({ ...p, field_type: e.target.value }))}
              >
                <MenuItem value="text">Text Input</MenuItem>
                <MenuItem value="textarea">Textarea</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="number">Number</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="file">File Upload</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Display Order"
              type="number"
              fullWidth
              value={fieldForm.display_order}
              onChange={(e) => setFieldForm((p) => ({ ...p, display_order: e.target.value }))}
            />
            <FormControlLabel
              control={<Switch checked={fieldForm.required} onChange={(e) => setFieldForm((p) => ({ ...p, required: e.target.checked }))} />}
              label="Required field"
            />
            <FormControlLabel
              control={<Switch checked={fieldForm.is_active} onChange={(e) => setFieldForm((p) => ({ ...p, is_active: e.target.checked }))} />}
              label="Active field"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={fieldSaving || !fieldForm.label.trim()} onClick={saveField}>
            {fieldSaving ? "Saving…" : "Save Field"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Form preview</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ py: 1 }}>
            {activePreviewFields.map((field) => (
              <ConfiguredFormField key={field.field_key} field={field as any} value="" disabled onChange={() => { }} />
            ))}
            {activePreviewFields.length === 0 && (
              <Typography color="text.secondary">No fields configured.</Typography>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}
