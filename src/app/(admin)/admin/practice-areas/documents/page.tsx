"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import ActiveStatusChip from "@/components/features/admin/professional-onboarding/ActiveStatusChip";
import ConfirmDeleteDialog from "@/components/features/admin/professional-onboarding/ConfirmDeleteDialog";
import { fieldKeyFromName } from "@/components/features/admin/professional-onboarding/constants";
import AdminDataTable, {
  type AdminTableColumn,
} from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  getOnboardingApiErrorMessage,
  professionalOnboardingService,
} from "@/services/admin/professionalOnboarding.service";
import type { OnboardingDocument } from "@/types/admin/professionalOnboarding";

const PAGE_SIZE = 10;

type FormState = {
  name: string;
  document_key: string;
  description: string;
  allowed_file_types: string;
  max_file_size_mb: number;
  is_active: boolean;
  display_order: number;
};

const emptyForm: FormState = {
  name: "",
  document_key: "",
  description: "",
  allowed_file_types: "pdf,jpg,png",
  max_file_size_mb: 5,
  is_active: true,
  display_order: 0,
};

export default function DocumentsPage() {
  const [rows, setRows] = useState<OnboardingDocument[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OnboardingDocument | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toastMsg, setToastMsg] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<OnboardingDocument | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await professionalOnboardingService.listDocuments({
        search,
        page: page + 1,
        page_size: rowsPerPage,
        ordering: "display_order",
      });
      setRows(res.results);
      setTotalCount(res.count);
    } catch (err) {
      setError(getOnboardingApiErrorMessage(err, "Failed to load documents."));
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: AdminTableColumn<OnboardingDocument>[] = [
    { key: "name", label: "Name", minWidth: 160, render: (r) => <strong>{r.name}</strong> },
    { key: "key", label: "Key", minWidth: 120, render: (r) => r.document_key },
    {
      key: "types",
      label: "Allowed types",
      minWidth: 140,
      render: (r) => r.allowed_file_types.join(", "),
    },
    { key: "size", label: "Max MB", width: 80, render: (r) => r.max_file_size_mb },
    {
      key: "status",
      label: "Status",
      width: 100,
      render: (r) => <ActiveStatusChip active={r.is_active} />,
    },
    {
      key: "actions",
      label: "",
      width: 90,
      align: "right",
      render: (r) => (
        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <IconButton
            size="small"
            onClick={() => {
              setEditing(r);
              setForm({
                name: r.name,
                document_key: r.document_key,
                description: r.description,
                allowed_file_types: r.allowed_file_types.join(","),
                max_file_size_mb: r.max_file_size_mb,
                is_active: r.is_active,
                display_order: r.display_order,
              });
              setDialogOpen(true);
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteTarget(r)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const savePayload = () => ({
    name: form.name,
    document_key: form.document_key || fieldKeyFromName(form.name),
    description: form.description,
    allowed_file_types: form.allowed_file_types
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    max_file_size_mb: form.max_file_size_mb,
    is_active: form.is_active,
    display_order: form.display_order,
  });

  return (
    <AdminPageShell
      title="Document catalog"
      subtitle="Reusable document definitions assigned per profession"
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
              setForm(emptyForm);
              setDialogOpen(true);
            }}
          >
            Add document
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
        emptyMessage="No documents in the catalog."
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editing ? "Edit document" : "Add document"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Name"
              required
              fullWidth
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  document_key: f.document_key || fieldKeyFromName(name),
                }));
              }}
            />
            <TextField
              label="Document key"
              fullWidth
              value={form.document_key}
              onChange={(e) => setForm((f) => ({ ...f, document_key: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <TextField
              label="Allowed file types"
              fullWidth
              helperText="Comma-separated, e.g. pdf,jpg,png"
              value={form.allowed_file_types}
              onChange={(e) => setForm((f) => ({ ...f, allowed_file_types: e.target.value }))}
            />
            <TextField
              label="Max file size (MB)"
              type="number"
              fullWidth
              value={form.max_file_size_mb}
              onChange={(e) =>
                setForm((f) => ({ ...f, max_file_size_mb: Number(e.target.value) || 1 }))
              }
            />
            <TextField
              label="Display order"
              type="number"
              fullWidth
              value={form.display_order}
              onChange={(e) =>
                setForm((f) => ({ ...f, display_order: Number(e.target.value) || 0 }))
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                const payload = savePayload();
                if (editing) {
                  await professionalOnboardingService.updateDocument(editing.id, payload);
                } else {
                  await professionalOnboardingService.createDocument(payload);
                }
                setDialogOpen(false);
                setToastMsg("Document saved.");
                load();
              } catch (err) {
                setToastMsg(getOnboardingApiErrorMessage(err, "Failed to save document."));
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Delete document?"
        description="Deletion may fail if the document is assigned to professions."
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await professionalOnboardingService.deleteDocument(deleteTarget.id);
            setDeleteTarget(null);
            setToastMsg("Document deleted.");
            load();
          } catch (err) {
            setToastMsg(getOnboardingApiErrorMessage(err, "Failed to delete."));
          }
        }}
      />

      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg("")} message={toastMsg} />
    </AdminPageShell>
  );
}
