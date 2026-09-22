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
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import ActiveStatusChip from "@/components/features/admin/professional-onboarding/ActiveStatusChip";
import ConfirmDeleteDialog from "@/components/features/admin/professional-onboarding/ConfirmDeleteDialog";
import FieldFormFields, {
  emptyFieldForm,
  type FieldFormState,
} from "@/components/features/admin/professional-onboarding/FieldFormFields";
import { OPTION_FIELD_TYPES } from "@/components/features/admin/professional-onboarding/constants";
import AdminDataTable, {
  type AdminTableColumn,
} from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  getOnboardingApiErrorMessage,
  professionalOnboardingService,
} from "@/services/admin/professionalOnboarding.service";
import type { CommonField, FieldOption } from "@/types/admin/professionalOnboarding";

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
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsField, setOptionsField] = useState<CommonField | null>(null);
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [optionForm, setOptionForm] = useState({ value: "", label: "", display_order: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await professionalOnboardingService.listCommonFields({
        search,
        page: page + 1,
        page_size: rowsPerPage,
        ordering: "display_order",
      });
      setRows(res.results);
      setTotalCount(res.count);
    } catch (err) {
      setError(getOnboardingApiErrorMessage(err, "Failed to load common fields."));
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  const loadOptions = async (field: CommonField) => {
    const res = await professionalOnboardingService.listFieldOptions({
      common_field: field.id,
      page_size: 100,
      ordering: "display_order",
    });
    setOptions(res.results);
  };

  const openOptions = async (field: CommonField) => {
    setOptionsField(field);
    setOptionsOpen(true);
    try {
      await loadOptions(field);
    } catch (err) {
      setToastMsg(getOnboardingApiErrorMessage(err, "Failed to load options."));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await professionalOnboardingService.updateCommonField(editing.id, form);
        setToastMsg("Field updated.");
      } else {
        await professionalOnboardingService.createCommonField(form);
        setToastMsg("Field created.");
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setToastMsg(getOnboardingApiErrorMessage(err, "Failed to save field."));
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
      key: "required",
      label: "Required",
      width: 90,
      render: (r) => (r.is_required ? "Yes" : "No"),
    },
    {
      key: "status",
      label: "Status",
      width: 100,
      render: (r) => <ActiveStatusChip active={r.is_active} />,
    },
    {
      key: "order",
      label: "Order",
      width: 70,
      render: (r) => r.display_order,
    },
    {
      key: "actions",
      label: "",
      width: 130,
      align: "right",
      render: (r) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          {OPTION_FIELD_TYPES.includes(r.field_type) && (
            <Button size="small" onClick={() => openOptions(r)}>Options</Button>
          )}
          <IconButton size="small" onClick={() => {
            setEditing(r);
            setForm({
              name: r.name,
              field_key: r.field_key,
              field_type: r.field_type,
              label: r.label,
              placeholder: r.placeholder,
              help_text: r.help_text,
              description: r.description,
              is_required: r.is_required,
              is_active: r.is_active,
              display_order: r.display_order,
              options: r.options || [],
            });
            setDialogOpen(true);

          }}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteTarget(r)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
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
          <Button component={Link} href="/admin/practice-areas" variant="outlined" size="small">
            Back
          </Button>
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

      <Dialog open={optionsOpen} onClose={() => setOptionsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Options — {optionsField?.label}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {options.map((o) => (
              <Stack key={o.id} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {o.label} ({o.value})
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={async () => {
                    try {
                      await professionalOnboardingService.deleteFieldOption(o.id);
                      if (optionsField) await loadOptions(optionsField);
                    } catch (err) {
                      setToastMsg(getOnboardingApiErrorMessage(err, "Failed to delete option."));
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <TextField
              label="Value"
              size="small"
              value={optionForm.value}
              onChange={(e) => setOptionForm((f) => ({ ...f, value: e.target.value }))}
            />
            <TextField
              label="Label"
              size="small"
              value={optionForm.label}
              onChange={(e) => setOptionForm((f) => ({ ...f, label: e.target.value }))}
            />
            <Button
              variant="outlined"
              onClick={async () => {
                if (!optionsField) return;
                try {
                  await professionalOnboardingService.createFieldOption({
                    common_field: optionsField.id,
                    value: optionForm.value,
                    label: optionForm.label || optionForm.value,
                    display_order: optionForm.display_order,
                    is_active: true,
                  });
                  setOptionForm({ value: "", label: "", display_order: 0 });
                  await loadOptions(optionsField);
                } catch (err) {
                  setToastMsg(getOnboardingApiErrorMessage(err, "Failed to add option."));
                }
              }}
            >
              Add option
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Delete common field?"
        description="Deletion may fail if the field is in use."
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await professionalOnboardingService.deleteCommonField(deleteTarget.id);
            setToastMsg("Field deleted.");
            setDeleteTarget(null);
            load();
          } catch (err) {
            setToastMsg(getOnboardingApiErrorMessage(err, "Failed to delete field."));
          }
        }}
      />

      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg("")} message={toastMsg} />
    </AdminPageShell>
  );
}
