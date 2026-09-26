"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
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
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
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

export default function MembershipFormBuilderPage() {
  const [forms, setForms] = useState<MembershipFormAdmin[]>([]);
  const [formId, setFormId] = useState("");
  const [steps, setSteps] = useState<MembershipStepAdmin[]>([]);
  const [fieldsByStep, setFieldsByStep] = useState<Record<string, MembershipStepFieldAdmin[]>>({});
  const [loading, setLoading] = useState(true);
  const [stepDialog, setStepDialog] = useState(false);
  const [fieldDialog, setFieldDialog] = useState<{ stepId: string } | null>(null);
  const [stepForm, setStepForm] = useState({ title: "", name: "", slug: "" });
  const [fieldForm, setFieldForm] = useState({
    name: "",
    field_key: "",
    field_type: "text",
    is_required: true,
  });

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
    setStepDialog(true);
  };

  const addStep = async () => {
    const fid = await ensureActiveFormId();
    const title = stepForm.title.trim();
    const name = stepForm.name.trim() || title;
    const slug = stepForm.slug.trim() || slugFromName(name);
    await membershipOnboardingAdminService.createStep(fid, {
      title,
      name,
      slug,
      display_order: steps.length,
      is_active: true,
      is_required: true,
    });
    setStepDialog(false);
    setStepForm({ title: "", name: "", slug: "" });
    loadSteps();
  };

  const addField = async () => {
    if (!fieldDialog) return;
    const name = fieldForm.name.trim();
    const field_key = fieldForm.field_key.trim() || slugFromName(name).replace(/-/g, "_");
    await membershipOnboardingAdminService.createStepField(fieldDialog.stepId, {
      name,
      label: name,
      field_key,
      field_type: fieldForm.field_type,
      is_required: fieldForm.is_required,
      display_order: fieldsByStep[fieldDialog.stepId]?.length ?? 0,
      is_active: true,
    });
    setFieldDialog(null);
    setFieldForm({ name: "", field_key: "", field_type: "text", is_required: true });
    loadSteps();
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
                  <Button size="small" variant="outlined" onClick={() => setFieldDialog({ stepId: step.id })} sx={{ textTransform: "none" }}>
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
                      py: 0.75,
                      px: 1,
                      borderRadius: 1,
                      bgcolor: "#f8fafc",
                    }}
                  >
                    <Typography variant="body2">
                      <strong>{f.name}</strong> ({f.field_key}) — {f.field_type}
                      {f.is_required ? " · required" : ""}
                    </Typography>
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

      <Dialog open={stepDialog} onClose={() => setStepDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add step</DialogTitle>
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
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStepDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={addStep} disabled={!stepForm.title.trim()}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(fieldDialog)} onClose={() => setFieldDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Add field</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Label"
              value={fieldForm.name}
              onChange={(e) => setFieldForm((s) => ({ ...s, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Field key"
              value={fieldForm.field_key}
              onChange={(e) => setFieldForm((s) => ({ ...s, field_key: e.target.value }))}
              fullWidth
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={addField} disabled={!fieldForm.name.trim()}>Save</Button>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
