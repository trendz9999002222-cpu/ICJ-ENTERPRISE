"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { membershipOnboardingAdminService } from "@/services/admin/membershipOnboarding.service";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentIcon from "@mui/icons-material/Payment";
import SaveIcon from "@mui/icons-material/Save";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

const PRESET_AMOUNTS = [299, 499, 999, 1499, 2499];

export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [amountInr, setAmountInr] = useState<number | string>(499);
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [gateway, setGateway] = useState("easebuzz");
  const [easebuzzKey, setEasebuzzKey] = useState("P2OTPKQ5X");
  const [easebuzzConfigured, setEasebuzzConfigured] = useState(true);
  const [easebuzzEnv, setEasebuzzEnv] = useState("test");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await membershipOnboardingAdminService.getPaymentSettings();
      setAmountInr(data.amount_inr ?? 499);
      setIsPaymentEnabled(Boolean(data.is_payment_enabled));
      setCurrency(data.currency || "INR");
      if ((data as any).payment_gateway) {
        setGateway((data as any).payment_gateway);
      }
      if ((data as any).easebuzz_key) {
        setEasebuzzKey((data as any).easebuzz_key);
      }
      if ((data as any).easebuzz_configured !== undefined) {
        setEasebuzzConfigured((data as any).easebuzz_configured);
      }
      if ((data as any).easebuzz_env) {
        setEasebuzzEnv((data as any).easebuzz_env);
      }
      if ((data as any).razorpay_key_id) {
        setRazorpayKeyId((data as any).razorpay_key_id);
      }
      if ((data as any).razorpay_configured !== undefined) {
        setRazorpayConfigured((data as any).razorpay_configured);
      }
      setUpdatedAt(data.updated_at);
    } catch {
      setToast({
        open: true,
        message: "Failed to load subscription fee settings.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    const num = typeof amountInr === "string" ? parseFloat(amountInr) : amountInr;
    if (isNaN(num) || num < 0) {
      setToast({
        open: true,
        message: "Please enter a valid positive fee amount.",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await membershipOnboardingAdminService.updatePaymentSettings({
        amount_inr: num,
        is_payment_enabled: isPaymentEnabled,
      });
      setAmountInr(res.amount_inr);
      setIsPaymentEnabled(res.is_payment_enabled);
      setUpdatedAt(res.updated_at);
      setToast({
        open: true,
        message: "Membership subscription settings saved successfully.",
        severity: "success",
      });
    } catch {
      setToast({
        open: true,
        message: "Failed to update membership subscription settings.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell
      title="Subscription Management"
      subtitle="Configure membership pricing, payment requirements, and subscription billing controls."
      actions={
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          disabled={loading || saving}
          onClick={handleSave}
          sx={{
            bgcolor: "#2563eb",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      }
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3.5}>
          <Grid container spacing={3}>
            {/* Primary Settings Card */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Stack spacing={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: "#eff6ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PaymentIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a" }}>
                        Membership Subscription Fee
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Control the application fee amount charged to new membership applicants.
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Payment toggle */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isPaymentEnabled ? "#f0fdf4" : "#f8fafc",
                      border: `1px solid ${isPaymentEnabled ? "#bbf7d0" : "#e2e8f0"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                        Enable Membership Payment Step
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25 }}>
                        When enabled, applicants will see a payment step in the onboarding flow with a Skip option.
                      </Typography>
                    </Box>
                    <Switch
                      checked={isPaymentEnabled}
                      onChange={(e) => setIsPaymentEnabled(e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  {/* Amount Input */}
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#334155", mb: 1, fontSize: "0.9rem" }}>
                      Fee Amount (INR)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={amountInr}
                      onChange={(e) => setAmountInr(e.target.value)}
                      placeholder="e.g. 499"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>₹</Typography>
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Chip size="small" label={currency} sx={{ fontWeight: 700, bgcolor: "#f1f5f9" }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          bgcolor: "#fff",
                        },
                      }}
                    />

                    {/* Quick amount presets */}
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
                      <Typography variant="caption" sx={{ color: "#64748b", alignSelf: "center", mr: 0.5 }}>
                        Presets:
                      </Typography>
                      {PRESET_AMOUNTS.map((val) => (
                        <Chip
                          key={val}
                          label={`₹${val}`}
                          clickable
                          onClick={() => setAmountInr(val)}
                          color={Number(amountInr) === val ? "primary" : "default"}
                          variant={Number(amountInr) === val ? "filled" : "outlined"}
                          sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {updatedAt && (
                    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                      Last updated: {new Date(updatedAt).toLocaleString("en-IN")}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* Gateway & Integration Status Card */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <ShieldOutlinedIcon sx={{ color: "#2563eb" }} />
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>
                      Payment Gateway Status
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Active Payment Gateway
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#2563eb" }}>
                        Easebuzz
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Configuration Status
                      </Typography>
                      {easebuzzConfigured ? (
                        <Chip
                          size="small"
                          icon={<CheckCircleIcon />}
                          label="Connected"
                          color="success"
                          sx={{ fontWeight: 700 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          icon={<InfoOutlinedIcon />}
                          label="Configured in backend"
                          color="info"
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                    </Box>

                    {easebuzzKey && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          Merchant Key
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                          {easebuzzKey.slice(0, 5)}...{easebuzzKey.slice(-3)}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Mode
                      </Typography>
                      <Chip
                        size="small"
                        label={easebuzzEnv === "prod" ? "Production" : "Test Mode"}
                        sx={{
                          fontWeight: 700,
                          bgcolor: easebuzzEnv === "prod" ? "#ecfdf5" : "#fef3c7",
                          color: easebuzzEnv === "prod" ? "#065f46" : "#92400e",
                        }}
                      />
                    </Box>
                  </Stack>
                </Paper>

                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Easebuzz Gateway Active
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#475569", display: "block" }}>
                    Payments are securely processed via Easebuzz (Cards, UPI, Netbanking). Razorpay has been commented out and kept as fallback.
                  </Typography>
                </Alert>

                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Subscription Scaling Architecture
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#475569" }}>
                    This module currently controls Membership fee settings. Additional subscription tabs (e.g., Professional Tiers, Institutional Guilds) can be scaled right into this module without changing the layout.
                  </Typography>
                </Alert>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%", fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </AdminPageShell>
  );
}
