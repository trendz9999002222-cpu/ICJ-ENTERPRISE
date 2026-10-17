"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from "@mui/icons-material/Save";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { adminLeadsService } from "@/services/admin/adminLeads.service";
import type { LeadCommercialSettingsData } from "@/types/lead";

export default function AdminLeadSettingsPage() {
  const [settings, setSettings] = useState<Partial<LeadCommercialSettingsData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminLeadsService.getCommercialSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await adminLeadsService.updateCommercialSettings(settings);
      setSuccess("Commercial settings saved successfully.");
    } catch (err: any) {
      setError(err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const update = (patch: Partial<LeadCommercialSettingsData>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  return (
    <AdminPageShell
      title="Commercial Settings"
      subtitle="Configure lead marketplace pricing, payment methods, and compliance rules."
      actions={
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving || loading}
          size="small"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      }
    >
      {loading && (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>Loading settings...</Typography>
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {!loading && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4 }}>
          {/* Pricing */}
          <Box sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2.5, bgcolor: "#fff" }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 2.5 }} spacing={1}>
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SettingsIcon sx={{ fontSize: 16, color: "#2563eb" }} />
              </Box>
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>Pricing Configuration</Typography>
            </Stack>
            <Stack spacing={3}>
              <TextField
                label="Default Lead Price (₹)"
                size="small"
                fullWidth
                type="number"
                value={settings.default_lead_price_paise ? settings.default_lead_price_paise / 100 : ""}
                onChange={(e) => update({ default_lead_price_paise: Math.round(parseFloat(e.target.value || "0") * 100) })}
                helperText="Default price applied to new leads before admin override"
                slotProps={{ htmlInput: { min: 0, step: "1" } }}
              />
              <TextField
                label="Tax Percentage (%)"
                size="small"
                fullWidth
                type="number"
                value={settings.tax_percentage ?? ""}
                onChange={(e) => update({ tax_percentage: parseFloat(e.target.value || "0") })}
                helperText="GST or applicable tax on lead purchases"
                slotProps={{ htmlInput: { min: 0, max: 100, step: "0.01" } }}
              />
              <TextField
                label="Reservation Timeout (minutes)"
                size="small"
                fullWidth
                type="number"
                value={settings.reservation_timeout_minutes ?? ""}
                onChange={(e) => update({ reservation_timeout_minutes: parseInt(e.target.value || "15") })}
                helperText="Time a professional has to complete payment after reserving a lead"
                slotProps={{ htmlInput: { min: 1, max: 60 } }}
              />
            </Stack>
          </Box>

          {/* Payment Methods */}
          <Box sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2.5, bgcolor: "#fff" }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 2.5 }} spacing={1}>
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CreditCardIcon sx={{ fontSize: 16, color: "#16a34a" }} />
              </Box>
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>Payment Methods</Typography>
            </Stack>

            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!settings.paid_unlock_enabled}
                      onChange={(e) => update({ paid_unlock_enabled: e.target.checked })}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Paid Lead Unlock</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>Enable the lead marketplace payment system overall</Typography>
                    </Box>
                  }
                />
              </Box>

              <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!settings.allow_wallet_payment}
                      onChange={(e) => update({ allow_wallet_payment: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                      <AccountBalanceWalletIcon sx={{ fontSize: 16, color: "#2563eb" }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>ICJ Wallet Payment</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>Allow professionals to pay using wallet balance</Typography>
                      </Box>
                    </Stack>
                  }
                />
              </Box>

              <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!settings.allow_lead_credit_payment}
                      onChange={(e) => update({ allow_lead_credit_payment: e.target.checked })}
                      color="secondary"
                    />
                  }
                  label={
                    <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                      <LoyaltyIcon sx={{ fontSize: 16, color: "#7c3aed" }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Lead Credit Payment</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>Allow professionals to use lead credits from purchased plans</Typography>
                      </Box>
                    </Stack>
                  }
                />
              </Box>

              <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!settings.allow_direct_payment}
                      onChange={(e) => update({ allow_direct_payment: e.target.checked })}
                      color="warning"
                    />
                  }
                  label={
                    <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                      <CreditCardIcon sx={{ fontSize: 16, color: "#d97706" }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Direct Payment (Razorpay)</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>Allow professionals to pay directly via Razorpay gateway</Typography>
                      </Box>
                    </Stack>
                  }
                />
              </Box>
            </Stack>
          </Box>

          {/* Compliance Notice */}
          <Box sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2.5, bgcolor: "#fff", gridColumn: { xs: "span 1", md: "span 2" } }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 2 }} spacing={1}>
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: "#fefce8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: "#ca8a04" }} />
              </Box>
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>Compliance Notice</Typography>
            </Stack>
            <TextField
              label="Compliance Notice Text"
              size="small"
              fullWidth
              multiline
              rows={4}
              value={settings.compliance_notice ?? ""}
              onChange={(e) => update({ compliance_notice: e.target.value })}
              helperText="This notice is displayed to professionals before they accept a lead. Should include any legal or ethical disclaimers."
              placeholder="e.g. By accepting this lead, you agree to maintain client confidentiality per Bar Council regulations..."
            />
          </Box>

          {/* Last updated */}
          {settings.updated_at && (
            <Box sx={{ gridColumn: { xs: "span 1", md: "span 2" } }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Last updated: {new Date(settings.updated_at).toLocaleString("en-IN")}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </AdminPageShell>
  );
}
