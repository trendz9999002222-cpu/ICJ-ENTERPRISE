"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Paper, Snackbar } from "@mui/material";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdditionalFieldsManager from "@/components/features/admin/shared/AdditionalFieldsManager";
import { type FieldFormState } from "@/components/features/admin/shared/FieldFormFields";
import { type GenericAdminField } from "@/components/features/admin/shared/AdminFieldsTable";
import {
  assistanceOnboardingAdminService,
  type AssistanceFormField,
} from "@/services/admin/assistanceOnboarding.service";

export default function SeekAssistanceLegalMatterPage() {
  const [fields, setFields] = useState<AssistanceFormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadFields = async () => {
    setLoading(true);
    try {
      const data = await assistanceOnboardingAdminService.listFields();
      setFields(data);
    } catch {
      setError("Failed to load legal matter fields.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleSaveField = async (id: string | null, form: FieldFormState) => {
    try {
      if (id) {
        await assistanceOnboardingAdminService.updateField(id, {
          label: form.label.trim(),
          field_type: form.field_type,
          required: form.is_required,
          display_order: form.display_order ?? 0,
          is_active: form.is_active,
          options: form.options,
        });
        setSuccessMessage("Field updated successfully.");
      } else {
        await assistanceOnboardingAdminService.createField({
          label: form.label.trim(),
          field_key: form.field_key.trim() || undefined,
          field_type: form.field_type,
          required: form.is_required,
          display_order: form.display_order ?? 0,
          is_active: form.is_active,
          options: form.options,
        });
        setSuccessMessage("Field created successfully.");
      }
      await loadFields();
    } catch {
      setError("Failed to save field.");
      throw new Error("Failed to save field.");
    }
  };

  const handleToggleActive = async (field: GenericAdminField) => {
    try {
      await assistanceOnboardingAdminService.updateField(field.id, {
        is_active: !field.is_active,
      });
      setSuccessMessage(`Field ${!field.is_active ? "activated" : "deactivated"} successfully.`);
      await loadFields();
    } catch {
      setError("Failed to update field status.");
    }
  };

  const handleDeleteField = async (field: GenericAdminField) => {
    if (!window.confirm(`Are you sure you want to delete "${field.label}"?`)) {
      return;
    }
    try {
      await assistanceOnboardingAdminService.deleteField(field.id);
      setSuccessMessage("Field deleted successfully.");
      await loadFields();
    } catch {
      setError("Failed to delete field.");
    }
  };

  const handleReorderField = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    const nextFields = [...fields];
    const [moved] = nextFields.splice(sourceIndex, 1);
    nextFields.splice(destinationIndex, 0, moved);
    setFields(nextFields);

    try {
      await Promise.all(
        nextFields.map((f, idx) => {
          const newOrder = (idx + 1) * 10;
          if (f.display_order !== newOrder) {
            return assistanceOnboardingAdminService.updateField(f.id, {
              display_order: newOrder,
            });
          }
          return Promise.resolve();
        })
      );
      setSuccessMessage("Fields reordered successfully.");
      await loadFields();
    } catch {
      setError("Failed to reorder fields.");
    }
  };

  return (
    <AdminPageShell
      title="Legal Matter Information"
      subtitle="Configure legal subject categories, urgency levels, and matter description fields for Seek Assistance."
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <AdditionalFieldsManager
        title="Legal Matter Information Fields"
        description="Manage specific legal fields including category options, urgency classification, and problem description. Drag rows using the ⠿ handle to reorder."
        fields={fields.map((f) => ({
          id: f.id,
          label: f.label,
          field_key: f.field_key,
          field_type: f.field_type,
          is_required: f.required,
          is_active: f.is_active,
          display_order: f.display_order,
          options: f.options,
          original: f,
        }))}
        loading={loading}
        onSaveField={handleSaveField}
        onToggleActive={handleToggleActive}
        onDeleteField={handleDeleteField}
        onReorderField={handleReorderField}
      />

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </AdminPageShell>
  );
}
