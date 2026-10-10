"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import ActiveStatusChip from "@/components/features/admin/professional-onboarding/ActiveStatusChip";
import ConfirmDeleteDialog from "@/components/features/admin/professional-onboarding/ConfirmDeleteDialog";
import FieldFormFields, {
  emptyFieldForm,
  type FieldFormState,
} from "@/components/features/admin/shared/FieldFormFields";
import AdminDataTable, {
  type AdminTableColumn,
} from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  coreOnboardingService,
  getCoreApiErrorMessage,
} from "@/services/admin/coreOnboarding.service";
import type { CommonField } from "@/types/admin/coreOnboarding";

const PAGE_SIZE = 10;

export default function CommonFieldsPage() {
  const [rows, setRows] = useState<CommonField[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CommonField | null>(null);
  const [form, setForm] = useState<FieldFormState>(emptyFieldForm);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CommonField | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await coreOnboardingService.listCommonFields({
        search,
        page: page + 1,
        page_size: rowsPerPage,
        ordering: "name",
      });
      setRows(res.results);
      setTotalCount(res.count);
    } catch (err) {
      setError(getCoreApiErrorMessage(err, "Failed to load common fields."));
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Partial<CommonField> = {
        name: form.name,
        field_key: form.field_key,
        field_type: form.field_type,
        label: form.label,
        placeholder: form.placeholder,
        help_text: form.help_text,
        description: form.description,
        is_active: form.is_active,
        options: form.options?.map((opt, index) => ({
          ...opt,
          display_order: opt.display_order ?? index,
          is_active: opt.is_active ?? true,
        })),
      };

      if (editing) {
        await coreOnboardingService.updateCommonField(editing.id, payload);
        setToastMsg("Field updated.");
      } else {
        await coreOnboardingService.createCommonField(payload);
        setToastMsg("Field created.");
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setToastMsg(getCoreApiErrorMessage(err, "Failed to save field."));
    } finally {
      setSaving(false);
    }
  };

  const columns: AdminTableColumn<CommonField>[] = [
    { key: "label", label: "Label", minWidth: 140, render: (r) => <strong>{r.label}</strong> },
    { key: "key", label: "Key", minWidth: 120, render: (r) => r.field_key },
    {
      key: "type",
      label: "Type",
      width: 100,
      render: (r) => <Chip size="small" label={r.field_type} />,
    },
    {
      key: "status",
      label: "Status",
      width: 100,
      render: (r) => <ActiveStatusChip active={r.is_active} />,
    },
    {
      key: "system",
      label: "System",
      width: 100,
      render: (r) => (r.is_system_field ? <Chip size="small" color="primary" label="Yes" /> : "No"),
    },
    {
      key: "actions",
      label: "",
      width: 100,
      align: "right",
      render: (r) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          <IconButton size="small" onClick={() => {
            setEditing(r);
            setForm({
              name: r.name,
              field_key: r.field_key,
              field_type: r.field_type as any,
              label: r.label,
              placeholder: r.placeholder,
              help_text: r.help_text,
              description: r.description,
              is_required: false,
              is_active: r.is_active,
              display_order: 0,
              options: r.options || [],
            });
            setDialogOpen(true);
          }}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          {!r.is_system_field && (
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(r)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Common fields"
      subtitle="Centrally managed fields reused across all professions"
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => {
              setEditing(null);
              setForm(emptyFieldForm);
              setDialogOpen(true);
            }}
          >
            Add field
          </Button>
        </Stack>
      }
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        getRowKey={(r) => r.id}
        pagination={{
          page,
          totalCount,
          rowsPerPage,
          onPageChange: setPage,
          onRowsPerPageChange: (n) => {
            setRowsPerPage(n);
            setPage(0);
          },
        }}
        emptyMessage="No common fields configured yet."
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editing ? "Edit common field" : "Add common field"}
        </DialogTitle>
        <DialogContent>
          <FieldFormFields form={form} onChange={setForm} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.name || !form.field_key || !form.label}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Delete common field?"
        description="Deletion may fail if the field is in use."
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await coreOnboardingService.deleteCommonField(deleteTarget.id);
            setToastMsg("Field deleted.");
            setDeleteTarget(null);
            load();
          } catch (err) {
            setToastMsg(getCoreApiErrorMessage(err, "Failed to delete field."));
          }
        }}
      />

      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg("")} message={toastMsg} />
    </AdminPageShell>
  );
}

