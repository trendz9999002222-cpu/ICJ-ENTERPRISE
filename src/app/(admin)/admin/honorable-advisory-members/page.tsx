"use client";

import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Chip, Stack, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Divider, TextField } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import ConfiguredFormField from "@/components/form/ConfiguredFormField";
import { validateConfiguredFieldList } from "@/lib/form/configuredFieldValidation";
import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import type { HonorableAdvisoryMember, HonorableFormField } from "@/services/public/honorableAdvisory.service";

const ADMIN_BASE = "/honorable-advisory/admin";
type AdminField = HonorableFormField & { id?: string; is_active?: boolean };

export default function AdminHonorableAdvisoryMembersPage() {
  const [members, setMembers] = useState<HonorableAdvisoryMember[]>([]);
  const [fields, setFields] = useState<AdminField[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMember, setViewMember] = useState<HonorableAdvisoryMember | null>(null);

  const load = async () => {
    setLoading(true);
    const t = readAccessTokenFromCookie();
    if (!t) return;
    
    try {
      const fieldRes = await apiClient<{ success: boolean; data: { results: AdminField[] } }>(
        `${ADMIN_BASE}/form-fields/`, { headers: { Authorization: `Bearer ${t}` } }
      );
      setFields(fieldRes.data.results);
    } catch {
      // Ignore field error
    }

    try {
      const res = await apiClient<{
        success: boolean;
        data: { results: HonorableAdvisoryMember[] };
      }>(`${ADMIN_BASE}/members/`, { headers: { Authorization: `Bearer ${t}` } });
      setMembers(res.data.results);
    } catch {
      setError("Could not load members.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const t = readAccessTokenFromCookie();
    if (!t) return;
    try {
      await apiClient(`${ADMIN_BASE}/members/${id}/toggle-status/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` }
      });
      // Update local state for immediate feedback
      setMembers(prev => prev.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m));
      setViewMember(prev => prev && prev.id === id ? { ...prev, is_active: !prev.is_active } : prev);
    } catch {
      setError("Could not update member status.");
    }
  };

  const [memberOpen, setMemberOpen] = useState(false);
  const [memberForm, setMemberForm] = useState<Record<string, any>>({ display_order: "0" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [memberSaving, setMemberSaving] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  
  const activePreviewFields = fields.filter((f) => f.is_active !== false);

  const openEditModal = (m: HonorableAdvisoryMember) => {
    // Flatten field_values for the form
    const form = { display_order: String(m.display_order), ...(m.field_values || {}) };
    setMemberForm(form);
    setEditMemberId(m.id!);
    setMemberOpen(true);
  };

  const createMember = async () => {
    const t = readAccessTokenFromCookie();
    if (!t) return;
    
    // Only validate required fields if we are creating or if the field is empty on edit
    // Wait, the dynamic validation will check everything. That's fine.
    const errors = validateConfiguredFieldList(activePreviewFields, memberForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    
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

      const method = editMemberId ? "PUT" : "POST";
      const url = editMemberId 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}${ADMIN_BASE}/members/${editMemberId}/`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}${ADMIN_BASE}/members/`;

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${t}` },
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to save");

      setMemberOpen(false);
      setEditMemberId(null);
      setMemberForm({ display_order: "0" });
      load();
    } catch {
      setError(editMemberId ? "Could not update member." : "Could not onboard member.");
    } finally {
      setMemberSaving(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: AdminTableColumn<HonorableAdvisoryMember>[] = [
    {
      key: "member",
      label: "Member",
      minWidth: 240,
      render: (m) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar
            src={m.photo_url || undefined}
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#eff6ff",
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "#1d4ed8",
              boxShadow: "0 2px 6px rgba(37,99,235,0.15)",
              border: "2px solid #dbeafe",
            }}
          >
            {!m.photo_url && m.name.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 220,
              }}
            >
              {m.name}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 220,
              }}
            >
              {m.role || "—"}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: "qualification",
      label: "Qualification",
      minWidth: 150,
      render: (m) => (
        <Typography sx={{ fontSize: "0.825rem", color: "#334155", fontWeight: 500 }}>
          {m.qualification || "—"}
        </Typography>
      ),
    },
    {
      key: "display_order",
      label: "Order",
      minWidth: 80,
      align: "center",
      render: (m) => (
        <Typography sx={{ fontSize: "0.825rem", color: "#64748b", fontWeight: 700 }}>
          {m.display_order}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      minWidth: 100,
      render: (m) => (
        <Chip
          size="small"
          label={m.is_active ? "Active" : "Inactive"}
          color={m.is_active ? "success" : "default"}
          sx={{
            fontWeight: 700,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            borderRadius: 1.5,
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: 80,
      align: "right",
      render: (m) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <Tooltip title="View member details">
            <IconButton
              size="small"
              onClick={() => setViewMember(m)}
              sx={{
                color: "#2563eb",
                bgcolor: "#eff6ff",
                border: "1px solid #bfdbfe",
                "&:hover": { bgcolor: "#dbeafe" },
              }}
            >
              <VisibilityIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit member">
            <IconButton
              size="small"
              onClick={() => openEditModal(m)}
              sx={{
                color: "#16a34a",
                bgcolor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                "&:hover": { bgcolor: "#dcfce7" },
              }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.role && m.role.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedMembers = filteredMembers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <AdminPageShell
      title="Honorable Advisory Members"
      subtitle="View all registered members of the Honorable Advisory Board"
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
        </Stack>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <AdminDataTable
        columns={columns}
        rows={paginatedMembers}
        loading={loading}
        error={error}
        searchValue={search}
        searchPlaceholder="Search by name, role..."
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        getRowKey={(row) => row.id!}
        emptyMessage="No members found matching the selected criteria."
        showSerialNumber
        pagination={{
          page,
          rowsPerPage,
          totalCount: filteredMembers.length,
          onPageChange: (newPage) => setPage(newPage),
          onRowsPerPageChange: (newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
          },
        }}
      />

      <Dialog open={memberOpen} onClose={() => { setMemberOpen(false); setEditMemberId(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editMemberId ? "Edit Advisory Board Member" : "Onboard Advisory Board Member"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1, pb: 1 }}>
            {activePreviewFields.map((field) => (
              <ConfiguredFormField
                key={field.field_key}
                field={field as any}
                value={memberForm[field.field_key] || ""}
                values={memberForm}
                error={formErrors[field.field_key]}
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
          <Button onClick={() => { setMemberOpen(false); setEditMemberId(null); }}>Cancel</Button>
          <Button variant="contained" disabled={memberSaving || activePreviewFields.length === 0} onClick={createMember}>
            {memberSaving ? "Saving…" : editMemberId ? "Save Changes" : "Publish member"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!viewMember} onClose={() => setViewMember(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: "1px solid #e2e8f0" }}>
          Member Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {viewMember && (
            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Avatar
                  src={viewMember.photo_url || undefined}
                  sx={{ width: 100, height: 100, fontSize: "2rem", bgcolor: "#2563eb" }}
                >
                  {!viewMember.photo_url && viewMember.name.substring(0, 2).toUpperCase()}
                </Avatar>
              </Box>

              <Stack direction="row" spacing={2}>
                <Typography sx={{ width: 120, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>Name:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{viewMember.name}</Typography>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Typography sx={{ width: 120, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>Role:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{viewMember.role || "—"}</Typography>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Typography sx={{ width: 120, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>Qualification:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{viewMember.qualification || "—"}</Typography>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Typography sx={{ width: 120, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>Status:</Typography>
                <Box>
                  <Chip
                    size="small"
                    label={viewMember.is_active ? "Active" : "Inactive"}
                    color={viewMember.is_active ? "success" : "default"}
                    sx={{ fontWeight: 700, fontSize: "0.7rem", borderRadius: 1.5 }}
                  />
                </Box>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Box>
                <Typography sx={{ fontWeight: 700, color: "#64748b", mb: 0.5 }}>Bio:</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                  {viewMember.bio || "No biography provided."}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0", justifyContent: "space-between" }}>
          {viewMember && (
            <Button
              onClick={() => toggleStatus(viewMember.id!)}
              variant="contained"
              color={viewMember.is_active ? "error" : "success"}
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              {viewMember.is_active ? "Deactivate Member" : "Activate Member"}
            </Button>
          )}
          <Button onClick={() => setViewMember(null)} variant="outlined" sx={{ fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
