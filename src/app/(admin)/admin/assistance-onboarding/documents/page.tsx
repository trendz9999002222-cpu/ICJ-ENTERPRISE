"use client";

import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import ActiveStatusChip from "@/components/features/admin/professional-onboarding/ActiveStatusChip";
import {
  assistanceOnboardingAdminService,
  type AssistanceDocument,
} from "@/services/admin/assistanceOnboarding.service";

type DocumentFormState = {
  name: string;
  document_key: string;
  description: string;
  allowed_file_types: string;
  max_file_size_mb: number;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
};

const emptyDocForm: DocumentFormState = {
  name: "",
  document_key: "",
  description: "",
  allowed_file_types: "pdf, docx, jpg, png",
  max_file_size_mb: 5,
  is_required: false,
  is_active: true,
  display_order: 10,
};

export default function SeekAssistanceDocumentsPage() {
  const [documents, setDocuments] = useState<AssistanceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<AssistanceDocument | null>(null);
  const [form, setForm] = useState<DocumentFormState>(emptyDocForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AssistanceDocument | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await assistanceOnboardingAdminService.listDocuments();
      setDocuments(data);
    } catch {
      setError("Failed to load assistance documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setForm({
      ...emptyDocForm,
      display_order: (documents.length + 1) * 10,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (doc: AssistanceDocument) => {
    setEditingDoc(doc);
    setForm({
      name: doc.name,
      document_key: doc.document_key,
      description: doc.description || "",
      allowed_file_types: Array.isArray(doc.allowed_file_types)
        ? doc.allowed_file_types.join(", ")
        : String(doc.allowed_file_types || "pdf, docx, jpg, png"),
      max_file_size_mb: doc.max_file_size_mb || 5,
      is_required: doc.is_required,
      is_active: doc.is_active,
      display_order: doc.display_order ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Document name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        document_key: form.document_key.trim() || undefined,
        description: form.description,
        allowed_file_types: form.allowed_file_types,
        max_file_size_mb: Number(form.max_file_size_mb) || 5,
        is_required: form.is_required,
        is_active: form.is_active,
        display_order: Number(form.display_order) || 0,
      };

      if (editingDoc) {
        await assistanceOnboardingAdminService.updateDocument(editingDoc.id, payload);
        setSuccessMessage("Document configuration updated.");
      } else {
        await assistanceOnboardingAdminService.createDocument(payload);
        setSuccessMessage("Document added successfully.");
      }
      setDialogOpen(false);
      await loadDocuments();
    } catch {
      setError("Failed to save document configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (doc: AssistanceDocument) => {
    try {
      await assistanceOnboardingAdminService.updateDocument(doc.id, {
        is_active: !doc.is_active,
      });
      setSuccessMessage(`Document ${!doc.is_active ? "activated" : "deactivated"}.`);
      await loadDocuments();
    } catch {
      setError("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await assistanceOnboardingAdminService.deleteDocument(deleteTarget.id);
      setSuccessMessage("Document deleted.");
      setDeleteTarget(null);
      await loadDocuments();
    } catch {
      setError("Failed to delete document.");
    }
  };

  const handleReorderDocuments = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    const actualSource = page * rowsPerPage + sourceIndex;
    const actualDest = page * rowsPerPage + destinationIndex;

    const nextDocs = [...documents];
    const [moved] = nextDocs.splice(actualSource, 1);
    nextDocs.splice(actualDest, 0, moved);
    setDocuments(nextDocs);

    try {
      await Promise.all(
        nextDocs.map((d, idx) => {
          const newOrder = (idx + 1) * 10;
          if (d.display_order !== newOrder) {
            return assistanceOnboardingAdminService.updateDocument(d.id, {
              display_order: newOrder,
            });
          }
          return Promise.resolve();
        })
      );
      setSuccessMessage("Documents reordered successfully.");
      await loadDocuments();
    } catch {
      setError("Failed to reorder documents.");
    }
  };

  const columns: AdminTableColumn<AssistanceDocument>[] = [
    {
      key: "display_order",
      label: "Order",
      minWidth: 80,
      render: (r) => (
        <Typography sx={{ fontSize: "0.825rem", color: "#64748b", fontWeight: 700 }}>
          {r.display_order}
        </Typography>
      ),
    },
    {
      key: "name",
      label: "Document Name",
      minWidth: 220,
      render: (r) => (
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#0f172a" }}>
            {r.name}
          </Typography>
          {r.description && r.description.trim() !== r.name.trim() && (
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              {r.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "document_key",
      label: "Key",
      minWidth: 150,
      render: (r) => (
        <code style={{ fontSize: "0.8rem", color: "#2563eb", background: "#eff6ff", padding: "2px 6px", borderRadius: 4 }}>
          {r.document_key}
        </code>
      ),
    },
    {
      key: "allowed_file_types",
      label: "Allowed Formats",
      minWidth: 160,
      render: (r) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {(Array.isArray(r.allowed_file_types) ? r.allowed_file_types : []).map((ext) => (
            <Chip key={ext} label={`.${ext.replace(/^\./, "")}`} size="small" variant="outlined" sx={{ fontSize: "0.75rem" }} />
          ))}
        </Box>
      ),
    },
    {
      key: "max_file_size_mb",
      label: "Max Size",
      minWidth: 100,
      render: (r) => (
        <Typography sx={{ fontSize: "0.825rem", color: "#475569" }}>
          {r.max_file_size_mb} MB
        </Typography>
      ),
    },
    {
      key: "is_required",
      label: "Requirement",
      minWidth: 120,
      render: (r) => (
        <Chip
          label={r.is_required ? "Mandatory" : "Optional"}
          size="small"
          color={r.is_required ? "primary" : "default"}
          variant={r.is_required ? "filled" : "outlined"}
          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
        />
      ),
    },
    {
      key: "is_active",
      label: "Status",
      minWidth: 100,
      render: (r) => (
        <Switch
          size="small"
          checked={r.is_active}
          onChange={() => handleToggleActive(r)}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      minWidth: 110,
      render: (r) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <IconButton size="small" onClick={() => handleOpenEdit(r)} sx={{ color: "#2563eb" }}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setDeleteTarget(r)} sx={{ color: "#dc2626" }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const filteredDocuments = documents.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.document_key.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      (Array.isArray(d.allowed_file_types) && d.allowed_file_types.some((ext) => ext.toLowerCase().includes(q)))
    );
  });

  return (
    <AdminPageShell
      title="Supporting Documents"
      subtitle="Configure uploadable supporting document specifications, allowed formats, and size limits for Seek Assistance."
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#2563eb" }}
        >
          Add Document
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <AdminDataTable
        columns={columns}
        rows={filteredDocuments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        isDraggable={!search.trim()}
        onRowReorder={handleReorderDocuments}
        searchValue={search}
        searchPlaceholder="Search documents by name, key, format..."
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        getRowKey={(r) => r.id}
        emptyMessage="No supporting document requirements configured yet."
        pagination={{
          page,
          totalCount: filteredDocuments.length,
          rowsPerPage,
          rowsPerPageOptions: [10, 25, 50],
          onPageChange: (p) => setPage(p),
          onRowsPerPageChange: (s) => {
            setRowsPerPage(s);
            setPage(0);
          },
        }}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingDoc ? "Edit Supporting Document" : "Add Supporting Document"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Document Name *"
              fullWidth
              size="small"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Attach notices, agreements, FIRs, or relevant receipts"
            />
            <TextField
              label="Document Key"
              fullWidth
              size="small"
              value={form.document_key}
              onChange={(e) => setForm({ ...form, document_key: e.target.value })}
              placeholder="e.g. supporting_documents"
              helperText="Unique identifier. Leave blank to auto-generate from name."
              disabled={Boolean(editingDoc)}
            />
            <TextField
              label="Description / Instructions"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Instructions displayed to the applicant"
            />
            <TextField
              label="Allowed File Formats"
              fullWidth
              size="small"
              value={form.allowed_file_types}
              onChange={(e) => setForm({ ...form, allowed_file_types: e.target.value })}
              placeholder="e.g. pdf, docx, jpg, png"
              helperText="Comma-separated file extensions"
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Max Size (MB)"
                type="number"
                size="small"
                sx={{ width: 140 }}
                value={form.max_file_size_mb}
                onChange={(e) => setForm({ ...form, max_file_size_mb: Number(e.target.value) })}
              />
              <TextField
                label="Display Order"
                type="number"
                size="small"
                sx={{ width: 140 }}
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              />
            </Stack>
            <Stack direction="row" spacing={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_required}
                    onChange={(e) => setForm({ ...form, is_required: e.target.checked })}
                  />
                }
                label="Mandatory Upload"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ bgcolor: "#2563eb", fontWeight: 700 }}>
            {saving ? "Saving..." : editingDoc ? "Save Changes" : "Create Document"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#475569" }}>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </AdminPageShell>
  );
}
