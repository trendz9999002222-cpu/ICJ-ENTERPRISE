"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import LoyaltyIcon from "@mui/icons-material/Loyalty";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { adminLeadsService } from "@/services/admin/adminLeads.service";
import type { LeadCreditPlanItem } from "@/types/lead";

const EMPTY_PLAN: Partial<LeadCreditPlanItem> = {
  name: "",
  code: "",
  price_paise: 0,
  credits_granted: 0,
  validity_days: 30,
  description: "",
  is_active: true,
  display_order: 0,
};

export default function AdminLeadPlansPage() {
  const [plans, setPlans] = useState<LeadCreditPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<LeadCreditPlanItem>>(EMPTY_PLAN);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await adminLeadsService.listPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPlans(); }, []);

  const openCreate = () => {
    setEditingPlan({ ...EMPTY_PLAN });
    setIsEditing(false);
    setSaveError("");
    setSaveSuccess("");
    setModalOpen(true);
  };

  const openEdit = (plan: LeadCreditPlanItem) => {
    setEditingPlan({ ...plan });
    setIsEditing(true);
    setSaveError("");
    setSaveSuccess("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingPlan.name?.trim() || !editingPlan.code?.trim()) {
      setSaveError("Name and Code are required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      if (isEditing && editingPlan.id) {
        await adminLeadsService.updatePlan(editingPlan.id, editingPlan);
      } else {
        await adminLeadsService.createPlan(editingPlan);
      }
      setSaveSuccess(isEditing ? "Plan updated." : "Plan created.");
      await loadPlans();
      setTimeout(() => setModalOpen(false), 1000);
    } catch (err: any) {
      setSaveError(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (plan: LeadCreditPlanItem) => {
    try {
      await adminLeadsService.updatePlan(plan.id, { is_active: !plan.is_active });
      loadPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: AdminTableColumn<LeadCreditPlanItem>[] = [
    {
      key: "display_order",
      label: "#",
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", fontWeight: 600 }}>{row.display_order}</Typography>
      ),
    },
    {
      key: "name",
      label: "Plan Name",
      render: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>{row.name}</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontFamily: "monospace" }}>{row.code}</Typography>
        </Box>
      ),
    },
    {
      key: "price_inr",
      label: "Price",
      render: (row) => (
        <Typography sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.875rem" }}>
          ₹{(row.price_inr ?? row.price_paise / 100).toLocaleString("en-IN")}
        </Typography>
      ),
    },
    {
      key: "credits_granted",
      label: "Credits",
      render: (row) => (
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={0.5}>
          <ConfirmationNumberIcon sx={{ fontSize: 15, color: "#7c3aed" }} />
          <Typography sx={{ fontWeight: 700, color: "#7c3aed", fontSize: "0.875rem" }}>{row.credits_granted}</Typography>
        </Stack>
      ),
    },
    {
      key: "validity_days",
      label: "Validity",
      render: (row) => (
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={0.5}>
          <CalendarTodayIcon sx={{ fontSize: 13, color: "#64748b" }} />
          <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>{row.validity_days} days</Typography>
        </Stack>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.description || "—"}</Typography>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
          <Switch
            size="small"
            checked={row.is_active}
            onChange={() => toggleActive(row)}
            color="success"
          />
          <Chip
            label={row.is_active ? "Active" : "Inactive"}
            size="small"
            color={row.is_active ? "success" : "default"}
            variant="outlined"
          />
        </Stack>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <Tooltip title="Edit plan">
          <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => openEdit(row)} sx={{ fontSize: "0.75rem" }}>
            Edit
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Lead Credit Plans"
      subtitle="Create and manage lead credit subscription plans for professionals."
      actions={
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} size="small">
          Add Plan
        </Button>
      }
    >
      {/* Summary */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
        {[
          { label: "Total Plans", value: plans.length, color: "#2563eb" },
          { label: "Active Plans", value: plans.filter((p) => p.is_active).length, color: "#16a34a" },
          { label: "Total Credits Available", value: plans.filter(p => p.is_active).reduce((s, p) => s + p.credits_granted, 0), color: "#7c3aed" },
        ].map((stat) => (
          <Box key={stat.label} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#fff", textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>{stat.label}</Typography>
          </Box>
        ))}
      </Box>

      <AdminDataTable<LeadCreditPlanItem>
        columns={columns}
        rows={plans}
        loading={loading}
        getRowKey={(p) => p.id || p.code}
      />

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <LoyaltyIcon color="primary" />
            <span>{isEditing ? "Edit Plan" : "Create New Plan"}</span>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
              <TextField label="Plan Name *" size="small" fullWidth value={editingPlan.name || ""}
                onChange={(e) => setEditingPlan((p) => ({ ...p, name: e.target.value }))} />
              <TextField label="Code *" size="small" fullWidth value={editingPlan.code || ""}
                onChange={(e) => setEditingPlan((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                slotProps={{ htmlInput: { style: { fontFamily: "monospace" } } }} />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Price (₹) *"
                size="small"
                fullWidth
                type="number"
                value={editingPlan.price_paise ? editingPlan.price_paise / 100 : ""}
                onChange={(e) => setEditingPlan((p) => ({ ...p, price_paise: Math.round(parseFloat(e.target.value || "0") * 100) }))}
                slotProps={{ htmlInput: { min: 0, step: "1" } }}
              />
              <TextField label="Credits Granted *" size="small" fullWidth type="number"
                value={editingPlan.credits_granted || ""}
                onChange={(e) => setEditingPlan((p) => ({ ...p, credits_granted: parseInt(e.target.value || "0") }))}
                slotProps={{ htmlInput: { min: 1 } }} />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField label="Validity (days)" size="small" fullWidth type="number"
                value={editingPlan.validity_days || ""}
                onChange={(e) => setEditingPlan((p) => ({ ...p, validity_days: parseInt(e.target.value || "30") }))}
                slotProps={{ htmlInput: { min: 1 } }} />
              <TextField label="Display Order" size="small" fullWidth type="number"
                value={editingPlan.display_order ?? ""}
                onChange={(e) => setEditingPlan((p) => ({ ...p, display_order: parseInt(e.target.value || "0") }))} />
            </Box>
            <TextField label="Description" size="small" fullWidth multiline rows={2}
              value={editingPlan.description || ""}
              onChange={(e) => setEditingPlan((p) => ({ ...p, description: e.target.value }))} />
            <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
              <Switch
                checked={!!editingPlan.is_active}
                onChange={(e) => setEditingPlan((p) => ({ ...p, is_active: e.target.checked }))}
                color="success"
              />
              <Typography variant="body2">Active (visible to professionals)</Typography>
            </Stack>
          </Stack>
          {saveError && <Alert severity="error" sx={{ mt: 2 }}>{saveError}</Alert>}
          {saveSuccess && <Alert severity="success" sx={{ mt: 2 }}>{saveSuccess}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Update Plan" : "Create Plan"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
