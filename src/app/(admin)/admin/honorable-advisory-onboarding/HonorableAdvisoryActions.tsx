"use client";

import { useState, useEffect, useCallback } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import ConfiguredFormField from "@/components/form/ConfiguredFormField";
import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { coreOnboardingService } from "@/services/admin/coreOnboarding.service";
import type { CommonField } from "@/types/admin/coreOnboarding";
import type { HonorableFormField } from "@/services/public/honorableAdvisory.service";

const ADMIN_BASE = "/honorable-advisory/admin";
type AdminField = HonorableFormField & { id?: string; is_active?: boolean };

type Props = {
  /** Called after a member is successfully created/updated so the parent can reload data */
  onSuccess?: () => void;
  /** If provided, the dialog opens in edit mode for this member */
  editMember?: { id: string; display_order: number; field_values: Record<string, any> } | null;
  /** Called when the edit dialog is closed (to clear the editMember in the parent) */
  onEditClose?: () => void;
};

export default function HonorableAdvisoryActions({ onSuccess, editMember, onEditClose }: Props) {
  const [fields, setFields] = useState<AdminField[]>([]);
  const [commonFields, setCommonFields] = useState<CommonField[]>([]);

  const [memberOpen, setMemberOpen] = useState(false);
  
  const [memberForm, setMemberForm] = useState<Record<string, any>>({ display_order: "0" });
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberError, setMemberError] = useState("");

  const load = useCallback(async () => {
    const t = readAccessTokenFromCookie();
    if (!t) return;
    try {
      const [res, configsRes, commonRes] = await Promise.all([
        apiClient<{ success: boolean; data: { results: AdminField[] } }>(
          `${ADMIN_BASE}/form-fields/`, { headers: { Authorization: `Bearer ${t}` } }
        ),
        coreOnboardingService.listFormFieldConfigs({ form_code: "HONORABLE_ADVISORY", page_size: 1000 }),
        coreOnboardingService.listCommonFields({ page_size: 1000 })
      ]);
      setFields(res.data.results);
      
      const visibleCommonFields = commonRes.results.filter(gf => {
         const config = configsRes.results.find(c => c.common_field === gf.id);
         if (config) return config.is_visible;
         return gf.is_active; // default to true if globally active
      });
      setCommonFields(visibleCommonFields);
    } catch {
      console.error("Could not load form fields for actions.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // When editMember is set from parent, open the dialog with its data
  useEffect(() => {
    if (editMember) {
      const form: Record<string, any> = {
        display_order: String(editMember.display_order ?? 0),
        ...(editMember.field_values || {}),
      };
      setMemberForm(form);
      setMemberOpen(true);
      setMemberError("");
    }
  }, [editMember]);

  const isEditMode = !!editMember;

  const handleClose = () => {
    setMemberOpen(false);
    setMemberForm({ display_order: "0" });
    setMemberError("");
    if (onEditClose) onEditClose();
  };

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
      // Backend explicitly requires a name field. Try to guess it from common keys.
      const guessedName = fieldValuesOnly.fullName || fieldValuesOnly.full_name || fieldValuesOnly.name || fieldValuesOnly.first_name || "";
      if (guessedName) {
        fd.set("name", guessedName);
        fieldValuesOnly.name = guessedName;
      }

      fd.set("field_values", JSON.stringify(fieldValuesOnly));

      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}${ADMIN_BASE}/members/${editMember!.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}${ADMIN_BASE}/members/`;

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${t}` },
        body: fd,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let errMsg = "Failed to save.";
        if (errorData.errors) {
            errMsg = Object.values(errorData.errors).flat().join(", ");
        } else if (errorData.message) {
            errMsg = errorData.message;
        }
        throw new Error(errMsg);
      }

      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Could not save member.", err);
      setMemberError(err.message || "Could not save member.");
    } finally {
      setMemberSaving(false);
    }
  };

  const activePreviewFields = fields.filter((f) => f.is_active !== false);

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => { setMemberForm({ display_order: "0" }); setMemberError(""); setMemberOpen(true); }}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Add Honorable Advisory Board Member
        </Button>
      </Stack>

      <Dialog open={memberOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {isEditMode ? "Edit Advisory Board Member" : "Onboard Advisory Board Member"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1, pb: 1 }}>
            {memberError && <Alert severity="error">{memberError}</Alert>}
            
            {commonFields.length > 0 && (
              <>
                <Typography variant="subtitle2" color="primary">Common Fields</Typography>
                {commonFields.map((field) => (
                  <ConfiguredFormField
                    key={field.field_key}
                    field={field as any}
                    value={memberForm[field.field_key] || ""}
                    values={memberForm}
                    onChange={(val) => setMemberForm((p) => ({ ...p, [field.field_key]: val }))}
                  />
                ))}
              </>
            )}

            {activePreviewFields.length > 0 && (
              <>
                <Typography variant="subtitle2" color="primary">Additional Fields</Typography>
                {activePreviewFields.map((field) => (
                  <ConfiguredFormField
                    key={field.field_key}
                    field={field as any}
                    value={memberForm[field.field_key] || ""}
                    values={memberForm}
                    onChange={(val) => setMemberForm((p) => ({ ...p, [field.field_key]: val }))}
                  />
                ))}
              </>
            )}
            
            {commonFields.length === 0 && activePreviewFields.length === 0 && (
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" disabled={memberSaving || (commonFields.length === 0 && activePreviewFields.length === 0)} onClick={createMember}>
            {memberSaving ? "Saving…" : isEditMode ? "Save Changes" : "Publish member"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
