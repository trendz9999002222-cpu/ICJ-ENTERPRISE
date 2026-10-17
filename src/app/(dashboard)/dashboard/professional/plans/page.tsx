"use client";

import { useEffect, useState } from "react";
import {
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
  Grid,
  Stack,
  Typography,
  Alert,
} from "@mui/material";

import LoyaltyIcon from "@mui/icons-material/Loyalty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditCardIcon from "@mui/icons-material/CreditCard";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { LeadCreditPlanItem, ProfessionalWalletData } from "@/types/lead";

export default function LeadCreditPlansPage() {
  const [plans, setPlans] = useState<LeadCreditPlanItem[]>([]);
  const [availableCredits, setAvailableCredits] = useState(0);
  const [wallet, setWallet] = useState<ProfessionalWalletData | null>(null);
  const [loading, setLoading] = useState(true);

  // Purchase Modal State
  const [selectedPlan, setSelectedPlan] = useState<LeadCreditPlanItem | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, walletRes] = await Promise.all([
        leadMarketplaceService.getLeadPlans(),
        leadMarketplaceService.getWallet().catch(() => null),
      ]);
      setPlans(plansRes.plans || []);
      setAvailableCredits(plansRes.available_lead_credits || 0);
      setWallet(walletRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenPurchase = (plan: LeadCreditPlanItem) => {
    setSelectedPlan(plan);
    setPurchaseError("");
    setPurchaseSuccess("");
    setPurchaseModalOpen(true);
  };

  const handleConfirmPurchase = async (payWithWallet: boolean) => {
    if (!selectedPlan) return;
    setPurchasing(true);
    setPurchaseError("");
    setPurchaseSuccess("");

    try {
      const res = await leadMarketplaceService.purchasePlan(selectedPlan.id, payWithWallet);
      if (!payWithWallet && res?.gateway_order_id) {
        // Direct gateway mock/test verify
        await leadMarketplaceService.verifyPayment({
          razorpay_order_id: res.gateway_order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: `test_sig_${res.gateway_order_id}_pay_mock_${Date.now()}`,
        });
      }

      setPurchaseSuccess(`Plan '${selectedPlan.name}' purchased! Added ${selectedPlan.credits_granted} credits.`);
      setTimeout(() => {
        setPurchaseModalOpen(false);
        loadData();
      }, 1300);
    } catch (err: any) {
      setPurchaseError(err?.message || "Failed to purchase plan.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <PortalPageShell
      title="Lead Credit Subscription Plans"
      subtitle="Prepaid bundles for acquiring verified legal leads at discounted rates with 1-click acceptance."
    >
      {/* Top Banner with Active Credits */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "#f8fafc", p: 1, mb: 4 }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: "center" }} spacing={2}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <LoyaltyIcon color="success" sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  YOUR ACTIVE LEAD CREDITS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  {availableCredits} {availableCredits === 1 ? "Credit" : "Credits"} Available
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              1 Lead Credit = 1 Exclusive Lead Unlock. Never expires during active validity.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3 }}>
          {plans.map((plan, index) => {
            const isPopular = plan.code === "starter" || index === 1;
            return (
              <Box key={plan.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    borderColor: isPopular ? "#2563eb" : "#e2e8f0",
                    borderWidth: isPopular ? 2 : 1,
                    boxShadow: isPopular ? "0 8px 24px -4px rgba(37, 99, 235, 0.15)" : undefined,
                  }}
                >
                  {isPopular && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -12,
                        right: 20,
                        bgcolor: "#2563eb",
                        color: "#fff",
                        px: 1.5,
                        py: 0.3,
                        borderRadius: 1,
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        letterSpacing: 0.5,
                      }}
                    >
                      MOST POPULAR
                    </Box>
                  )}

                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", minHeight: 32, mt: 0.5 }}>
                      {plan.description || "Prepaid bundle for active practitioners."}
                    </Typography>

                    <Box sx={{ my: 3 }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a" }}>
                        ₹{plan.price_inr.toLocaleString("en-IN")}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        for {plan.credits_granted} {plan.credits_granted === 1 ? "Lead Credit" : "Lead Credits"}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={1.5} sx={{ fontSize: "0.85rem", color: "#334155" }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                        <span><strong>{plan.credits_granted}</strong> exclusive matter unlocks</span>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                        <span>Instant client contact access</span>
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                        <span>Valid for {plan.validity_days || 365} days</span>
                      </Stack>
                    </Stack>
                  </CardContent>

                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant={isPopular ? "contained" : "outlined"}
                      fullWidth
                      onClick={() => handleOpenPurchase(plan)}
                      sx={{
                        py: 1.2,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Buy Plan
                    </Button>
                  </Box>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Purchase Modal */}
      <Dialog
        open={purchaseModalOpen}
        onClose={() => !purchasing && setPurchaseModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Purchase Plan</DialogTitle>
        <DialogContent dividers>
          {selectedPlan && (
            <Stack spacing={2.5}>
              {purchaseError && <Alert severity="error">{purchaseError}</Alert>}
              {purchaseSuccess && <Alert severity="success">{purchaseSuccess}</Alert>}

              <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {selectedPlan.name} Plan
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Grants {selectedPlan.credits_granted} lead credits
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>Total Payable:</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    ₹{selectedPlan.price_inr.toLocaleString("en-IN")}
                  </Typography>
                </Stack>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Choose Payment Method:
              </Typography>

              <Stack spacing={1.5}>
                {/* Option 1: ICJ Wallet */}
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={purchasing || (wallet?.balance_paise || 0) < selectedPlan.price_paise}
                  startIcon={<AccountBalanceWalletIcon />}
                  onClick={() => handleConfirmPurchase(true)}
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.5,
                    px: 2,
                    textTransform: "none",
                    borderColor: "#e2e8f0",
                  }}
                >
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Pay with ICJ Wallet</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Available balance: ₹{wallet?.available_inr.toLocaleString("en-IN") || "0.00"}
                    </Typography>
                  </Box>
                </Button>

                {/* Option 2: Direct Payment */}
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={purchasing}
                  startIcon={<CreditCardIcon />}
                  onClick={() => handleConfirmPurchase(false)}
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.5,
                    px: 2,
                    textTransform: "none",
                    borderColor: "#e2e8f0",
                  }}
                >
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Pay Directly via Gateway</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      UPI, Cards, NetBanking via Razorpay
                    </Typography>
                  </Box>
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={() => setPurchaseModalOpen(false)} disabled={purchasing} sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </PortalPageShell>
  );
}
