"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import ActiveStatusChip from "@/components/features/admin/professional-onboarding/ActiveStatusChip";
import CategoryGroupProfessionSelect, {
  type CascadeValue,
} from "@/components/features/admin/professional-onboarding/CategoryGroupProfessionSelect";
import ConfirmDeleteDialog from "@/components/features/admin/professional-onboarding/ConfirmDeleteDialog";
import FieldFormFields, {
  emptyFieldForm,
  type FieldFormState,
} from "@/components/features/admin/professional-onboarding/FieldFormFields";
import AdminDataTable, {
  type AdminTableColumn,
} from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  getOnboardingApiErrorMessage,
  professionalOnboardingService,
} from "@/services/admin/professionalOnboarding.service";
import type {
  OnboardingDocument,
  ProfessionDocument,
  ProfessionField,
} from "@/types/admin/professionalOnboarding";

function ProfessionFieldsPageContent() {
  const searchParams = useSearchParams();
  const initialProfession = searchParams.get("profession") ?? "";
  const initialTab = searchParams.get("tab") === "documents" ? 1 : 0;

  const [tab, setTab] = useState(initialTab);
  const [cascade, setCascade] = useState<CascadeValue>({
    categoryId: "",
    groupId: "",
    professionId: initialProfession,
  });
  const [fieldRows, setFieldRows] = useState<ProfessionField[]>([]);
  const [docRows, setDocRows] = useState<ProfessionDocument[]>([]);
  const [catalogDocs, setCatalogDocs] = useState<OnboardingDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldDialog, setFieldDialog] = useState(false);
  const [editingField, setEditingField] = useState<ProfessionField | null>(null);
  const [fieldForm, setFieldForm] = useState<FieldFormState>(emptyFieldForm);
  const [docDialog, setDocDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ProfessionDocument | null>(null);
  const [docForm, setDocForm] = useState({
    document: "",
    is_required: true,
    is_active: true,
    display_order: 0,
    instructions: "",
  });
  const [toastMsg, setToastMsg] = useState("");
  const [deleteField, setDeleteField] = useState<ProfessionField | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<ProfessionDocument | null>(null);

  useEffect(() => {
    professionalOnboardingService
      .listDocuments({ is_active: true, page_size: 200 })
      .then((res) => setCatalogDocs(res.results))
      .catch(() => {});
  }, []);

  const loadProfessionContext = useCallback(async () => {
    if (!cascade.professionId) {
      setFieldRows([]);
      setDocRows([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [fields, docs] = await Promise.all([
        professionalOnboardingService.listProfessionFields({
          profession: cascade.professionId,
          page_size: 200,
          ordering: "display_order",
        }),
        professionalOnboardingService.listProfessionDocuments({
          profession: cascade.professionId,
          page_size: 200,
          ordering: "display_order",
        }),
      ]);
      setFieldRows(fields.results);
      setDocRows(docs.results);
    } catch (err) {
      setError(getOnboardingApiErrorMessage(err, "Failed to load profession configuration."));
    } finally {
      setLoading(false);
    }
  }, [cascade.professionId]);

  useEffect(() => {
    loadProfessionContext();
  }, [loadProfessionContext]);

  const fieldColumns: AdminTableColumn<ProfessionField>[] = [
    { key: "label", label: "Label", minWidth: 140, render: (r) => <strong>{r.label}</strong> },
    { key: "key", label: "Key", minWidth: 120, render: (r) => r.field_key },
    { key: "type", label: "Type", width: 100, render: (r) => <Chip size="small" label={r.field_type} /> },
    { key: "req", label: "Required", width: 90, render: (r) => (r.is_required ? "Yes" : "No") },
    { key: "status", label: "Status", width: 100, render: (r) => <ActiveStatusChip active={r.is_active} /> },
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
              setEditingField(r);
              setFieldForm({
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
              });
              setFieldDialog(true);
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteField(r)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const docColumns: AdminTableColumn<ProfessionDocument>[] = [
    { key: "name", label: "Document", minWidth: 160, render: (r) => <strong>{r.document_name}</strong> },
    { key: "key", label: "Key", minWidth: 120, render: (r) => r.document_key },
    { key: "req", label: "Required", width: 90, render: (r) => (r.is_required ? "Yes" : "No") },
    { key: "status", label: "Status", width: 100, render: (r) => <ActiveStatusChip active={r.is_active} /> },
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
              setEditingDoc(r);
              setDocForm({
                document: r.document,
                is_required: r.is_required,
                is_active: r.is_active,
                display_order: r.display_order,
                instructions: r.instructions,
              });
              setDocDialog(true);
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteDoc(r)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Profession configuration"
      subtitle="Profession-specific fields and required documents"
      actions={
        <Button component={Link} href="/admin/practice-areas" variant="outlined" size="small">
          Back
        </Button>
      }
    >
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #e2e8f0", borderRadius: 3 }}>
        <CategoryGroupProfessionSelect value={cascade} onChange={setCascade} />
      </Paper>

      {!cascade.professionId && (
        <Paper elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 3 }}>
          Select a category, group, and profession to configure fields and documents.
        </Paper>
      )}

      {cascade.professionId && (
        <Box>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Profession fields" />
            <Tab label="Required documents" />
          </Tabs>

          {tab === 0 && (
            <>
              <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 2 }}>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => {
                    setEditingField(null);
                    setFieldForm(emptyFieldForm);
                    setFieldDialog(true);
                  }}
                >
                  Add field
                </Button>
              </Stack>
              <AdminDataTable
                columns={fieldColumns}
                rows={fieldRows}
                loading={loading}
                error={error}
                getRowKey={(r) => r.id}
                emptyMessage="No profession-specific fields for this profession."
              />
            </>
          )}

          {tab === 1 && (
            <>
              <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 2 }}>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => {
                    setEditingDoc(null);
                    setDocForm({
                      document: "",
                      is_required: true,
                      is_active: true,
                      display_order: 0,
                      instructions: "",
                    });
                    setDocDialog(true);
                  }}
                >
                  Assign document
                </Button>
              </Stack>
              <AdminDataTable
                columns={docColumns}
                rows={docRows}
                loading={loading}
                error={error}
                getRowKey={(r) => r.id}
                emptyMessage="No documents assigned to this profession."
              />
            </>
          )}
        </Box>
      )}

      <Dialog open={fieldDialog} onClose={() => setFieldDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingField ? "Edit profession field" : "Add profession field"}
        </DialogTitle>
        <DialogContent>
          <FieldFormFields form={fieldForm} onChange={setFieldForm} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFieldDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!cascade.professionId) return;
              try {
                const payload = { ...fieldForm, profession: cascade.professionId };
                if (editingField) {
                  await professionalOnboardingService.updateProfessionField(editingField.id, payload);
                } else {
                  await professionalOnboardingService.createProfessionField(payload);
                }
                setFieldDialog(false);
                setToastMsg("Field saved.");
                loadProfessionContext();
              } catch (err) {
                setToastMsg(getOnboardingApiErrorMessage(err, "Failed to save field."));
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={docDialog} onClose={() => setDocDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingDoc ? "Edit assignment" : "Assign document"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Document"
              fullWidth
              disabled={!!editingDoc}
              value={docForm.document}
              onChange={(e) => setDocForm((f) => ({ ...f, document: e.target.value }))}
            >
              <MenuItem value="">Select document</MenuItem>
              {catalogDocs.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Instructions"
              fullWidth
              multiline
              minRows={2}
              value={docForm.instructions}
              onChange={(e) => setDocForm((f) => ({ ...f, instructions: e.target.value }))}
            />
            <TextField
              label="Display order"
              type="number"
              fullWidth
              value={docForm.display_order}
              onChange={(e) =>
                setDocForm((f) => ({ ...f, display_order: Number(e.target.value) || 0 }))
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={docForm.is_required}
                  onChange={(e) => setDocForm((f) => ({ ...f, is_required: e.target.checked }))}
                />
              }
              label="Required"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={docForm.is_active}
                  onChange={(e) => setDocForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDocDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!docForm.document && !editingDoc}
            onClick={async () => {
              if (!cascade.professionId) return;
              try {
                const payload = { ...docForm, profession: cascade.professionId };
                if (editingDoc) {
                  await professionalOnboardingService.updateProfessionDocument(editingDoc.id, payload);
                } else {
                  await professionalOnboardingService.createProfessionDocument(payload);
                }
                setDocDialog(false);
                setToastMsg("Document assignment saved.");
                loadProfessionContext();
              } catch (err) {
                setToastMsg(getOnboardingApiErrorMessage(err, "Failed to save."));
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteField}
        title="Delete field?"
        description={`Remove "${deleteField?.label}" from this profession?`}
        onClose={() => setDeleteField(null)}
        onConfirm={async () => {
          if (!deleteField) return;
          try {
            await professionalOnboardingService.deleteProfessionField(deleteField.id);
            setDeleteField(null);
            loadProfessionContext();
          } catch (err) {
            setToastMsg(getOnboardingApiErrorMessage(err, "Failed to delete."));
          }
        }}
      />

      <ConfirmDeleteDialog
        open={!!deleteDoc}
        title="Remove document?"
        description={`Unassign "${deleteDoc?.document_name}"?`}
        onClose={() => setDeleteDoc(null)}
        onConfirm={async () => {
          if (!deleteDoc) return;
          try {
            await professionalOnboardingService.deleteProfessionDocument(deleteDoc.id);
            setDeleteDoc(null);
            loadProfessionContext();
          } catch (err) {
            setToastMsg(getOnboardingApiErrorMessage(err, "Failed to delete."));
          }
        }}
      />

      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg("")} message={toastMsg} />
    </AdminPageShell>
  );
}

export default function ProfessionFieldsPage() {
  return (
    <Suspense
      fallback={
        <AdminPageShell title="Profession configuration" subtitle="Loading…">
          <span />
        </AdminPageShell>
      }
    >
      <ProfessionFieldsPageContent />
    </Suspense>
  );
}
