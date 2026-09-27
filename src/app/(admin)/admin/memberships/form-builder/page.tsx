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
import { slugFromName } from "@/components/features/admin/professional-onboarding/constants";
import {
  membershipOnboardingAdminService,
  type MembershipFormAdmin,
  type MembershipStepAdmin,
  type MembershipStepFieldAdmin,
} from "@/services/admin/membershipOnboarding.service";

const FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "phone",
  "number",
  "date",
  "select",
  "searchable_dropdown",
  "radio",
  "checkbox",
  "multi_select",
  "file",
  "image",
  "country",
  "state",
  "district",
  "city",
  "pincode",
];

const emptyStepForm = { title: "", name: "", slug: "" };

const emptyFieldForm = {
  label: "",
  name: "",
  field_key: "",
  field_type: "text",
  is_required: true,
  placeholder: "",
  help_text: "",
};

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

  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [fieldDialogStepId, setFieldDialogStepId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldForm, setFieldForm] = useState(emptyFieldForm);

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

  const openAddField = (stepId: string) => {
    setFieldDialogStepId(stepId);
    setEditingFieldId(null);
    setFieldForm(emptyFieldForm);
    setFieldDialogOpen(true);
  };

  const openEditField = (field: MembershipStepFieldAdmin) => {
    setFieldDialogStepId(field.step);
    setEditingFieldId(field.id);
    setFieldForm({
      label: field.label || field.name,
      name: field.name,
      field_key: field.field_key,
      field_type: field.field_type,
      is_required: field.is_required,
      placeholder: field.placeholder ?? "",
      help_text: field.help_text ?? "",
    });
    setFieldDialogOpen(true);
  };

  const closeFieldDialog = () => {
    setFieldDialogOpen(false);
    setFieldDialogStepId(null);
    setEditingFieldId(null);
    setFieldForm(emptyFieldForm);
  };

  const saveField = async () => {
    if (!fieldDialogStepId) return;
    const label = fieldForm.label.trim();
    if (!label) return;
    const name = fieldForm.name.trim() || label;
    const field_key = fieldForm.field_key.trim() || slugFromName(name).replace(/-/g, "_");
    setSaving(true);
    try {
      const payload = {
        name,
        label,
        field_key,
        field_type: fieldForm.field_type,
        is_required: fieldForm.is_required,
        placeholder: fieldForm.placeholder.trim(),
        help_text: fieldForm.help_text.trim(),
      };
      if (editingFieldId) {
        await membershipOnboardingAdminService.updateStepField(editingFieldId, payload);
      } else {
        await membershipOnboardingAdminService.createStepField(fieldDialogStepId, {
          ...payload,
          display_order: fieldsByStep[fieldDialogStepId]?.length ?? 0,
          is_active: true,
        });
      }
      closeFieldDialog();
      await loadSteps();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell
      title="Membership form builder"
      subtitle="Add steps and fields for the public membership application. New form versions become the active configuration."
    >
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <Button component={Link} href="/admin/memberships" variant="outlined" sx={{ textTransform: "none" }}>
          ← Applications
        </Button>
        {forms.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Form version</InputLabel>
            <Select label="Form version" value={formId} onChange={(e) => setFormId(e.target.value)}>
              {forms.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  v{f.version} {f.is_active ? "(active)" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Button variant="contained" onClick={createNewFormVersion} sx={{ textTransform: "none" }}>
          New form version
        </Button>
        <Button variant="contained" onClick={openAddStep} sx={{ textTransform: "none" }}>
          Add step
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress /></Box>
      ) : !formId ? (
        <Typography sx={{ color: "#64748b" }}>
          No form yet. Click <strong>New form version</strong> or <strong>Add step</strong> to create one.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {steps.map((step, idx) => (
            <Paper key={step.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>
                    Step {idx + 1}: {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>{step.slug}</Typography>
                  {!step.is_active && <Chip label="Inactive" size="small" color="warning" sx={{ mt: 1 }} />}
                </Box>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => openEditStep(step)} sx={{ textTransform: "none" }}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<ArrowUpwardIcon />} onClick={() => moveStep(step, -1)} sx={{ textTransform: "none" }}>
                    Up
                  </Button>
                  <Button size="small" startIcon={<ArrowDownwardIcon />} onClick={() => moveStep(step, 1)} sx={{ textTransform: "none" }}>
                    Down
                  </Button>
                  <Button
                    size="small"
                    onClick={() =>
                      membershipOnboardingAdminService.updateStep(step.id, { is_active: !step.is_active }).then(loadSteps)
                    }
                    sx={{ textTransform: "none" }}
                  >
                    {step.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => openAddField(step.id)} sx={{ textTransform: "none" }}>
                    Add field
                  </Button>
                </Stack>
              </Stack>
              <Stack spacing={0.5} sx={{ mt: 2 }}>
                {(fieldsByStep[step.id] ?? []).map((f) => (
                  <Box
                    key={f.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                      py: 0.75,
                      px: 1,
                      borderRadius: 1,
                      bgcolor: "#f8fafc",
                    }}
                  >
                    <Typography variant="body2" sx={{ minWidth: 0 }}>
                      <strong>{f.label || f.name}</strong> ({f.field_key}) — {f.field_type}
                      {f.is_required ? " · required" : ""}
                      {!f.is_active && " · inactive"}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                      <Button size="small" startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => openEditField(f)} sx={{ textTransform: "none", minWidth: 0 }}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          membershipOnboardingAdminService
                            .updateStepField(f.id, { is_active: !f.is_active })
                            .then(loadSteps)
                        }
                        sx={{ textTransform: "none", minWidth: 0 }}
                      >
                        {f.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </Stack>
                  </Box>
                ))}
                {!(fieldsByStep[step.id]?.length) && (
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>No fields yet.</Typography>
                )}
              </Stack>
            </Paper>
          ))}
          {!steps.length && (
            <Typography sx={{ color: "#64748b" }}>No steps yet. Use “Add step” to configure the public form.</Typography>
          )}
        </Stack>
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

      <Dialog open={fieldDialogOpen} onClose={closeFieldDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingFieldId ? "Edit field" : "Add field"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Label (shown to applicants)"
              value={fieldForm.label}
              onChange={(e) => setFieldForm((s) => ({ ...s, label: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Internal name"
              value={fieldForm.name}
              onChange={(e) => setFieldForm((s) => ({ ...s, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Field key"
              value={fieldForm.field_key}
              onChange={(e) => setFieldForm((s) => ({ ...s, field_key: e.target.value }))}
              fullWidth
              helperText="Stored in application data. Renaming may not update past submissions."
            />
            <FormControl fullWidth>
              <InputLabel>Field type</InputLabel>
              <Select
                label="Field type"
                value={fieldForm.field_type}
                onChange={(e) => setFieldForm((s) => ({ ...s, field_type: e.target.value }))}
              >
                {FIELD_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Placeholder"
              value={fieldForm.placeholder}
              onChange={(e) => setFieldForm((s) => ({ ...s, placeholder: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Help text"
              value={fieldForm.help_text}
              onChange={(e) => setFieldForm((s) => ({ ...s, help_text: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={fieldForm.is_required}
                  onChange={(e) => setFieldForm((s) => ({ ...s, is_required: e.target.checked }))}
                />
              }
              label="Required field"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFieldDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={saveField} disabled={!fieldForm.label.trim() || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
