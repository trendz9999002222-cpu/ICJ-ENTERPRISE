"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import LoyaltyIcon from "@mui/icons-material/Loyalty";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import PaymentIcon from "@mui/icons-material/Payment";
import SaveIcon from "@mui/icons-material/Save";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import TuneIcon from "@mui/icons-material/Tune";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { adminLeadsService } from "@/services/admin/adminLeads.service";
import { membershipOnboardingAdminService } from "@/services/admin/membershipOnboarding.service";
import type { LeadCreditPlanItem } from "@/types/lead";

const PRESET_AMOUNTS = [299, 499, 999, 1499, 2499];

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

function ICJPlansPageContent() {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");

  const getInitialTab = () => {
    if (
      initialTabParam === "membership-fee" ||
      initialTabParam === "membership-settings" ||
      initialTabParam === "membership" ||
      initialTabParam === "subscriptions" ||
      initialTabParam === "settings"
    ) {
      return 1;
    }
    return 0;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // ==========================================
  // TAB 0: Professional Credit Plans State
  // ==========================================
  const [plans, setPlans] = useState<LeadCreditPlanItem[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Partial<LeadCreditPlanItem>>(EMPTY_PLAN);
  const [isEditing, setIsEditing] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savePlanError, setSavePlanError] = useState("");
  const [savePlanSuccess, setSavePlanSuccess] = useState("");

  const loadPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const data = await adminLeadsService.listPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 0) {
      loadPlans();
    }
  }, [activeTab, loadPlans]);

  const openCreatePlan = () => {
    setEditingPlan({ ...EMPTY_PLAN });
    setIsEditing(false);
    setSavePlanError("");
    setSavePlanSuccess("");
    setModalOpen(true);
  };

  const openEditPlan = (plan: LeadCreditPlanItem) => {
    setEditingPlan({ ...plan });
    setIsEditing(true);
    setSavePlanError("");
    setSavePlanSuccess("");
    setModalOpen(true);
  };

  const handleSavePlan = async () => {
    if (!editingPlan.name?.trim() || !editingPlan.code?.trim()) {
      setSavePlanError("Name and Code are required.");
      return;
    }
    setSavingPlan(true);
    setSavePlanError("");
    try {
      if (isEditing && editingPlan.id) {
        await adminLeadsService.updatePlan(editingPlan.id, editingPlan);
      } else {
        await adminLeadsService.createPlan(editingPlan);
      }
      setSavePlanSuccess(isEditing ? "Plan updated." : "Plan created.");
      await loadPlans();
      setTimeout(() => setModalOpen(false), 800);
    } catch (err: any) {
      setSavePlanError(err?.message || "Save failed.");
    } finally {
      setSavingPlan(false);
    }
  };

  const togglePlanActive = async (plan: LeadCreditPlanItem) => {
    try {
      await adminLeadsService.updatePlan(plan.id, { is_active: !plan.is_active });
      loadPlans();
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // TAB 1: Membership Fee & Gateway Settings State
  // ==========================================
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [amountInr, setAmountInr] = useState<number | string>(499);
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [gateway, setGateway] = useState("easebuzz");
  const [easebuzzKey, setEasebuzzKey] = useState("P2OTPKQ5X");
  const [easebuzzConfigured, setEasebuzzConfigured] = useState(true);
  const [easebuzzEnv, setEasebuzzEnv] = useState("test");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadMembershipSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const data = await membershipOnboardingAdminService.getPaymentSettings();
      setAmountInr(data.amount_inr ?? 499);
      setIsPaymentEnabled(Boolean(data.is_payment_enabled));
      setCurrency(data.currency || "INR");
      if (data.payment_gateway) setGateway(data.payment_gateway);
      if (data.easebuzz_key) setEasebuzzKey(data.easebuzz_key);
      if (data.easebuzz_configured !== undefined) setEasebuzzConfigured(data.easebuzz_configured);
      if (data.easebuzz_env) setEasebuzzEnv(data.easebuzz_env);
      setUpdatedAt(data.updated_at);
    } catch {
      setToast({
        open: true,
        message: "Failed to load membership fee settings.",
        severity: "error",
      });
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      loadMembershipSettings();
    }
  }, [activeTab, loadMembershipSettings]);

  const handleSaveSettings = async () => {
    const num = Number(amountInr);
    if (isNaN(num) || num < 0) {
      setToast({
        open: true,
        message: "Please enter a valid amount (₹0 or greater).",
        severity: "error",
      });
      return;
    }
    setSavingSettings(true);
    try {
      const updated = await membershipOnboardingAdminService.updatePaymentSettings({
        amount_inr: num,
        is_payment_enabled: isPaymentEnabled,
      });
      setAmountInr(updated.amount_inr);
      setIsPaymentEnabled(Boolean(updated.is_payment_enabled));
      setUpdatedAt(updated.updated_at);
      setToast({
        open: true,
        message: "Membership registration fee settings saved successfully.",
        severity: "success",
      });
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.message || "Failed to update membership fee settings.",
        severity: "error",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // ==========================================
  // Plan Table Columns
  // ==========================================
  const planColumns: AdminTableColumn<LeadCreditPlanItem>[] = [
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
      label: "Credits / Tokens",
      render: (row) => (
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={0.5}>
          <ConfirmationNumberIcon sx={{ fontSize: 15, color: "#7c3aed" }} />
          <Typography sx={{ fontWeight: 700, color: "#7c3aed", fontSize: "0.875rem" }}>
            {row.credits_granted} Token{row.credits_granted === 1 ? "" : "s"}
          </Typography>
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
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.description || "—"}
        </Typography>
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
            onChange={() => togglePlanActive(row)}
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
          <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => openEditPlan(row)} sx={{ fontSize: "0.75rem" }}>
            Edit
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="ICJ Plans"
      subtitle="Create and manage professional lead credit packages, token plans, and citizen membership registration fees."
      actions={
        activeTab === 0 ? (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreatePlan} size="small" sx={{ fontWeight: 700 }}>
            Add Plan
          </Button>
        ) : undefined
      }
    >
      {/* Top Navigation Tabs - Unified Application Style */}
      <Box sx={{ borderBottom: "1px solid #e2e8f0", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              minHeight: 44,
              px: 2.5,
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main",
                fontWeight: 700,
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              bgcolor: "primary.main",
            },
          }}
        >
          <Tab
            icon={<LoyaltyIcon fontSize="small" />}
            iconPosition="start"
            label="Professional Credit Plans"
          />
          <Tab
            icon={<CardMembershipIcon fontSize="small" />}
            iconPosition="start"
            label="Membership Fee &amp; Gateway Settings"
          />
        </Tabs>
      </Box>

      {/* ========================================================= */}
      {/* TAB 0: Professional Credit Plans                          */}
      {/* ========================================================= */}
      {activeTab === 0 && (
        <Box>
          {/* Summary Stats */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
            {[
              { label: "Total Plans", value: plans.length, color: "#2563eb" },
              { label: "Active Plans", value: plans.filter((p) => p.is_active).length, color: "#16a34a" },
              {
                label: "Total Credits Available",
                value: plans.filter((p) => p.is_active).reduce((s, p) => s + p.credits_granted, 0),
                color: "#7c3aed",
              },
            ].map((stat) => (
              <Box key={stat.label} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#fff", textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>{stat.label}</Typography>
              </Box>
            ))}
          </Box>

          <AdminDataTable<LeadCreditPlanItem>
            columns={planColumns}
            rows={plans}
            loading={loadingPlans}
            getRowKey={(p) => p.id || p.code}
          />
        </Box>
      )}

      {/* ========================================================= */}
      {/* TAB 1: Membership Fee & Gateway Settings                  */}
      {/* ========================================================= */}
      {activeTab === 1 && (
        <Box>
          {settingsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Fee Configuration Card */}
              <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                    <TuneIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Citizen Membership Registration Fee
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Configure the one-time registration fee charged to citizens during the membership onboarding process.
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Registration Fee Amount"
                        type="number"
                        fullWidth
                        value={amountInr}
                        onChange={(e) => setAmountInr(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {currency}
                                </Typography>
                              </InputAdornment>
                            ),
                          },
                          htmlInput: { min: 0, step: 1 },
                        }}
                        helperText="Applicable to all new citizen membership registrations"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
                          QUICK PRESETS
                        </Typography>
                        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                          {PRESET_AMOUNTS.map((p) => (
                            <Chip
                              key={p}
                              label={`₹${p}`}
                              clickable
                              color={Number(amountInr) === p ? "primary" : "default"}
                              variant={Number(amountInr) === p ? "filled" : "outlined"}
                              onClick={() => setAmountInr(p)}
                              sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* Payment Required Switch */}
                  <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }} spacing={2}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Require Online Payment During Onboarding
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        When enabled, applicants must complete payment via the Easebuzz gateway before their membership application is submitted.
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isPaymentEnabled}
                          onChange={(e) => setIsPaymentEnabled(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Chip
                          label={isPaymentEnabled ? "PAYMENT REQUIRED" : "FREE / DISABLED"}
                          color={isPaymentEnabled ? "success" : "default"}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                        />
                      }
                      labelPlacement="start"
                      sx={{ m: 0 }}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Payment Gateway Information Card */}
              <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                    <PaymentIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Active Payment Gateway (Easebuzz)
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    All membership registration payments are securely routed through the configured Easebuzz Payment Gateway.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          GATEWAY
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, textTransform: "capitalize", mt: 0.5 }}>
                          {gateway}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          ENVIRONMENT
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.5 }}>
                          <Chip
                            label={easebuzzEnv.toUpperCase()}
                            size="small"
                            color={easebuzzEnv === "prod" ? "success" : "warning"}
                            sx={{ fontWeight: 700, fontSize: "0.7rem", height: 20 }}
                          />
                        </Stack>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          STATUS
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mt: 0.5 }}>
                          <ShieldOutlinedIcon color={easebuzzConfigured ? "success" : "error"} fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: easebuzzConfigured ? "success.main" : "error.main" }}>
                            {easebuzzConfigured ? "Connected & Active" : "Not Configured"}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>

                  {easebuzzKey && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        MERCHANT KEY: <span style={{ fontFamily: "monospace", color: "#1e293b" }}>{easebuzzKey}</span>
                      </Typography>
                    </Box>
                  )}

                  {updatedAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                      Last updated: {new Date(updatedAt).toLocaleString("en-IN")}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Bottom Save Action */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={savingSettings ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  disabled={settingsLoading || savingSettings}
                  onClick={handleSaveSettings}
                  sx={{
                    bgcolor: "#2563eb",
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: 2,
                    px: 4,
                    py: 1.2,
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  {savingSettings ? "Saving Settings…" : "Save Changes"}
                </Button>
              </Box>
            </Stack>
          )}
        </Box>
      )}

      {/* Plan Create / Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2.5 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <LoyaltyIcon color="primary" />
            <span>{isEditing ? "Edit Plan" : "Create New Plan"}</span>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
              <TextField
                label="Plan Name *"
                size="small"
                fullWidth
                value={editingPlan.name || ""}
                onChange={(e) => setEditingPlan((p) => ({ ...p, name: e.target.value }))}
              />
              <TextField
                label="Code *"
                size="small"
                fullWidth
                value={editingPlan.code || ""}
                onChange={(e) => setEditingPlan((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                slotProps={{ htmlInput: { style: { fontFamily: "monospace" } } }}
              />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Price (₹) *"
                size="small"
                fullWidth
                type="number"
                value={editingPlan.price_paise ? editingPlan.price_paise / 100 : ""}
                onChange={(e) =>
                  setEditingPlan((p) => ({
                    ...p,
                    price_paise: Math.round(parseFloat(e.target.value || "0") * 100),
                  }))
                }
                slotProps={{ htmlInput: { min: 0, step: "1" } }}
              />
              <TextField
                label="Credits / Tokens Granted *"
                size="small"
                fullWidth
                type="number"
                value={editingPlan.credits_granted || ""}
                onChange={(e) => setEditingPlan((p) => ({ ...p, credits_granted: parseInt(e.target.value || "0") }))}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Validity (days)"
                size="small"
                fullWidth
                type="number"
                value={editingPlan.validity_days || ""}
                onChange={(e) => setEditingPlan((p) => ({ ...p, validity_days: parseInt(e.target.value || "30") }))}
                slotProps={{ htmlInput: { min: 1 } }}
              />
              <TextField
                label="Display Order"
                size="small"
                fullWidth
                type="number"
                value={editingPlan.display_order ?? ""}
                onChange={(e) => setEditingPlan((p) => ({ ...p, display_order: parseInt(e.target.value || "0") }))}
              />
            </Box>
            <TextField
              label="Description"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={editingPlan.description || ""}
              onChange={(e) => setEditingPlan((p) => ({ ...p, description: e.target.value }))}
            />
            <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
              <Switch
                checked={!!editingPlan.is_active}
                onChange={(e) => setEditingPlan((p) => ({ ...p, is_active: e.target.checked }))}
                color="success"
              />
              <Typography variant="body2">Active (visible to professionals in marketplace)</Typography>
            </Stack>
          </Stack>
          {savePlanError && <Alert severity="error" sx={{ mt: 2 }}>{savePlanError}</Alert>}
          {savePlanSuccess && <Alert severity="success" sx={{ mt: 2 }}>{savePlanSuccess}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setModalOpen(false)} disabled={savingPlan}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePlan} disabled={savingPlan} sx={{ fontWeight: 700 }}>
            {savingPlan ? "Saving..." : isEditing ? "Update Plan" : "Create Plan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </AdminPageShell>
  );
}

export default function AdminLeadPlansPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <ICJPlansPageContent />
    </Suspense>
  );
}
