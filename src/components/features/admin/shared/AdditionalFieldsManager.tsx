import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";

import AdminFieldsTable, { type GenericAdminField } from "./AdminFieldsTable";
import FieldFormFields, { emptyFieldForm, type FieldFormState } from "./FieldFormFields";

interface AdditionalFieldsManagerProps {
  title?: string;
  description?: React.ReactNode;
  entityName?: string; // e.g., "Field", "Profession Field"
  fields: GenericAdminField[];
  loading?: boolean;
  emptyMessage?: string;
  onSaveField: (fieldId: string | null, form: FieldFormState) => Promise<void>;
  onDeleteField?: (field: GenericAdminField) => Promise<void>;
  onToggleActive?: (field: GenericAdminField) => Promise<void>;
  onOptions?: (field: GenericAdminField) => void;
  onAddClickHook?: () => Promise<boolean | void>; // If it returns false, adding is aborted
  onReorderField?: (sourceIndex: number, destinationIndex: number) => Promise<void> | void;
}

export default function AdditionalFieldsManager({
  title = "Additional Fields",
  description,
  entityName = "Field",
  fields,
  loading = false,
  emptyMessage = "No additional fields have been added yet.",
  onSaveField,
  onDeleteField,
  onToggleActive,
  onOptions,
  onAddClickHook,
  onReorderField,
}: AdditionalFieldsManagerProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FieldFormState>(emptyFieldForm);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (onAddClickHook) {
      setSaving(true);
      try {
        const proceed = await onAddClickHook();
        if (proceed === false) return;
      } finally {
        setSaving(false);
      }
    }
    setEditingId(null);
    setForm(emptyFieldForm);
    setOpen(true);
  };

  const handleEdit = (field: GenericAdminField) => {
    setEditingId(field.id);
    setForm({
      name: field.name || field.label,
      label: field.label,
      field_key: field.field_key,
      field_type: field.field_type as any,
      is_required: field.is_required,
      is_active: field.is_active,
      placeholder: field.placeholder || "",
      help_text: field.help_text || "",
      description: field.description || "",
      display_order: field.display_order,
      options: field.options || [],
    });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveField(editingId, form);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box>
          {title && <Typography variant="h6" sx={{ fontWeight: 800, mb: description ? 0.5 : 0 }}>{title}</Typography>}
          {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} disabled={saving} sx={{ textTransform: "none" }}>
          Add {entityName}
        </Button>
      </Stack>

      <AdminFieldsTable
        fields={fields}
        loading={loading}
        emptyMessage={emptyMessage}
        onEdit={handleEdit}
        onDelete={onDeleteField}
        onToggleActive={onToggleActive}
        onOptions={onOptions}
        onReorder={onReorderField}
      />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>{editingId ? `Edit ${entityName}` : `Add ${entityName}`}</DialogTitle>
        <DialogContent dividers>
          <FieldFormFields form={form} onChange={setForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.label.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
