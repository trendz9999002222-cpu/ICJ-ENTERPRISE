"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { slugFromName } from "@/components/features/admin/shared/constants";
import {
  membershipOnboardingAdminService,
  type MembershipFormAdmin,
  type MembershipStepAdmin,
  type MembershipStepFieldAdmin,
} from "@/services/admin/membershipOnboarding.service";
import AdditionalFieldsManager from "@/components/features/admin/shared/AdditionalFieldsManager";
import { type FieldFormState } from "@/components/features/admin/shared/FieldFormFields";

const emptyStepForm = { title: "", name: "", slug: "" };

export default function MembershipFormBuilderPage() {
  const [forms, setForms] = useState<MembershipFormAdmin[]>([]);
  const [formId, setFormId] = useState("");
  const [steps, setSteps] = useState<MembershipStepAdmin[]>([]);
  const [fieldsByStep, setFieldsByStep] = useState<Record<string, MembershipStepFieldAdmin[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepForm, setStepForm] = useState(emptyStepForm);



  const loadForms = useCallback(async () => {
    const list = await membershipOnboardingAdminService.listForms();
    setForms(list);
    const active = list.find((f) => f.is_active) ?? list[0];
    setFormId((prev) => {
      if (prev && list.some((f) => f.id === prev)) return prev;
      return active?.id ?? "";
    });
    return list;
  }, []);

  const loadSteps = useCallback(async () => {
    if (!formId) {
      setSteps([]);
      setFieldsByStep({});
      return;
    }
    const list = await membershipOnboardingAdminService.listSteps(formId);
    setSteps(list);
    const map: Record<string, MembershipStepFieldAdmin[]> = {};
    for (const s of list) {
      map[s.id] = await membershipOnboardingAdminService.listStepFields(s.id);
    }
    setFieldsByStep(map);
  }, [formId]);

  useEffect(() => {
    setLoading(true);
    loadForms().finally(() => setLoading(false));
  }, [loadForms]);

  useEffect(() => {
    setLoading(true);
    loadSteps().finally(() => setLoading(false));
  }, [loadSteps]);

  const ensureActiveFormId = async (): Promise<string> => {
    if (formId) return formId;
    const list = await loadForms();
    if (list.length) {
      const active = list.find((f) => f.is_active) ?? list[0];
      if (active) {
        setFormId(active.id);
        return active.id;
      }
    }
    const created = await membershipOnboardingAdminService.createForm({
      title: "Membership application",
      is_active: true,
    });
    await loadForms();
    setFormId(created.id);
    return created.id;
  };

  const createNewFormVersion = async () => {
    await membershipOnboardingAdminService.createForm({
      title: "Membership application",
      is_active: true,
    });
    await loadForms();
  };

  const moveStep = async (step: MembershipStepAdmin, delta: number) => {
    const order = Math.max(0, step.display_order + delta);
    await membershipOnboardingAdminService.updateStep(step.id, { display_order: order });
    loadSteps();
  };

  const openAddStep = async () => {
    await ensureActiveFormId();
    setEditingStepId(null);
    setStepForm(emptyStepForm);
    setStepDialogOpen(true);
  };

  const openEditStep = (step: MembershipStepAdmin) => {
    setEditingStepId(step.id);
    setStepForm({
      title: step.title,
      name: step.name,
      slug: step.slug,
    });
    setStepDialogOpen(true);
  };

  const closeStepDialog = () => {
    setStepDialogOpen(false);
    setEditingStepId(null);
    setStepForm(emptyStepForm);
  };

  const saveStep = async () => {
    const title = stepForm.title.trim();
    if (!title) return;
    const name = stepForm.name.trim() || title;
    const slug = stepForm.slug.trim() || slugFromName(name);
    setSaving(true);
    try {
      if (editingStepId) {
        await membershipOnboardingAdminService.updateStep(editingStepId, { title, name, slug });
      } else {
        const fid = await ensureActiveFormId();
        await membershipOnboardingAdminService.createStep(fid, {
          title,
          name,
          slug,
          display_order: steps.length,
          is_active: true,
          is_required: true,
        });
      }
      closeStepDialog();
      await loadSteps();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveField = async (id: string | null, form: FieldFormState) => {
    const stepId = steps[0]?.id;
    if (!stepId) return;
    
    const label = form.label.trim();
    if (!label) return;
    const name = form.name.trim() || label;
    const field_key = form.field_key.trim() || slugFromName(name).replace(/-/g, "_");
    
    const payload = {
      name,
      label,
      field_key,
      field_type: form.field_type,
      is_required: form.is_required,
      placeholder: form.placeholder.trim(),
      help_text: form.help_text.trim(),
      options: form.options,
    };
    
    if (id) {
      await membershipOnboardingAdminService.updateStepField(id, payload);
    } else {
      await membershipOnboardingAdminService.createStepField(stepId, {
        ...payload,
        display_order: fieldsByStep[stepId]?.length ?? 0,
        is_active: true,
      });
    }
    await loadSteps();
  };

  const handleAddClickHook = async () => {
    let targetStepId = steps[0]?.id;
    if (!targetStepId) {
      const fid = await ensureActiveFormId();
      await membershipOnboardingAdminService.createStep(fid, {
        title: "Additional Details",
        name: "Additional Details",
        slug: "additional-details",
        display_order: 0,
        is_active: true,
        is_required: true,
      });
      await loadSteps();
    }
    return true;
  };

  const handleReorderField = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    const allFields = steps.flatMap(s => fieldsByStep[s.id] || []);
    const nextFields = [...allFields];
    const [moved] = nextFields.splice(sourceIndex, 1);
    nextFields.splice(destinationIndex, 0, moved);

    try {
      await Promise.all(
        nextFields.map((f, idx) => {
          const newOrder = (idx + 1) * 10;
          if (f.display_order !== newOrder) {
            return membershipOnboardingAdminService.updateStepField(f.id, {
              display_order: newOrder,
            });
          }
          return Promise.resolve();
        })
      );
      await loadSteps();
    } catch {
      // error handled silently or on reload
    }
  };

  return (
    <AdminPageShell
      title="Additional Fields"
      subtitle="Configure additional fields for the onboarding form."
    >

      {loading ? (
        <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>
      ) : (
        <Box>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <AdditionalFieldsManager
              title="Additional Fields"
              description="Common fields are currently used for onboarding. You can add and drag & drop reorder additional fields here."
              fields={steps.flatMap(s => fieldsByStep[s.id] || []).map((f) => ({
                id: f.id,
                label: f.label,
                name: f.name,
                field_key: f.field_key,
                field_type: f.field_type,
                is_required: f.is_required,
                is_active: f.is_active,
                display_order: f.display_order,
                options: [],
                original: f
              }))}
              loading={loading}
              onSaveField={handleSaveField}
              onToggleActive={(f) =>
                membershipOnboardingAdminService
                  .updateStepField(f.id, { is_active: !f.is_active })
                  .then(loadSteps)
              }
              onAddClickHook={handleAddClickHook}
              onReorderField={handleReorderField}
            />
          </Paper>
        </Box>
      )}

      <Dialog open={stepDialogOpen} onClose={closeStepDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingStepId ? "Edit step" : "Add step"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Step title (shown to applicants)"
              value={stepForm.title}
              onChange={(e) => setStepForm((s) => ({ ...s, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Internal name"
              value={stepForm.name}
              onChange={(e) => setStepForm((s) => ({ ...s, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Slug"
              value={stepForm.slug}
              onChange={(e) => setStepForm((s) => ({ ...s, slug: e.target.value }))}
              fullWidth
              helperText="Used in URLs and configuration. Change only if you know existing submissions do not depend on it."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStepDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={saveStep} disabled={!stepForm.title.trim() || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

    </AdminPageShell>
  );
}
