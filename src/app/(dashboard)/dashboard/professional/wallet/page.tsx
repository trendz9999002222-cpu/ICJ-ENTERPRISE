"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Paper,
} from "@mui/material";

import TollIcon from "@mui/icons-material/Toll";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import GavelIcon from "@mui/icons-material/Gavel";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { ProfessionalWalletData, WalletTransactionItem, LeadCreditPlanItem } from "@/types/lead";

export default function ProfessionalWalletPage() {
  const [wallet, setWallet] = useState<ProfessionalWalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);
  const [plans, setPlans] = useState<LeadCreditPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  // Buy Tokens Modal State
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LeadCreditPlanItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [buyError, setBuyError] = useState("");
  const [buySuccess, setBuySuccess] = useState("");

  const loadWallet = async () => {
    setLoading(true);
    try {
      const [walletData, plansData] = await Promise.all([
        leadMarketplaceService.getWallet(),
        leadMarketplaceService.getLeadPlans().catch(() => ({ plans: [], available_lead_credits: 0 })),
      ]);
      setWallet(walletData);
      setPlans(plansData.plans || []);
    } catch (err) {
      console.error("Failed to load wallet or plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    setTxLoading(true);
    try {
      const res = await leadMarketplaceService.getWalletTransactions({ page_size: 50 });
      setTransactions(res.results || []);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
    loadTransactions();
  }, []);

  const handleOpenBuyModal = () => {
    if (plans.length > 0) {
      setSelectedPlan(plans[0]);
    }
    setBuyError("");
    setBuySuccess("");
    setBuyModalOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return;
    setPurchasing(true);
    setBuyError("");
    setBuySuccess("");

    try {
      const res = await leadMarketplaceService.purchasePlan(selectedPlan.id, false);
      if (res?.gateway_order_id) {
        // Auto verify in mock / direct mode
        await leadMarketplaceService.verifyPayment({
          razorpay_order_id: res.gateway_order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: `test_sig_${res.gateway_order_id}_pay_mock_${Date.now()}`,
        });
      }

      setBuySuccess(`Successfully purchased ${selectedPlan.credits_granted} Tokens! Balance updated.`);
      setTimeout(() => {
        setBuyModalOpen(false);
        loadWallet();
        loadTransactions();
      }, 1400);
    } catch (err: any) {
      setBuyError(err?.message || "Failed to complete token pack purchase.");
    } finally {
      setPurchasing(false);
    }
  };

  const availableTokens = wallet?.token_balance ?? 0;
  const purchasedTokens = wallet?.total_tokens_purchased ?? 0;
  const spentTokens = wallet?.total_tokens_spent ?? 0;

  return (
    <PortalPageShell
      title="Professional Token Wallet"
      subtitle="Your exclusive token reserve for accepting verified legal inquiries and managing matter representation on ICJ."
    >
      {/* Balances Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2.5, mb: 3 }}>
        {/* Card 1: Available Tokens */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2.5,
            bgcolor: "#f0fdf4",
            borderColor: "#86efac",
            p: 1,
            boxShadow: "0 4px 12px -2px rgba(22, 163, 74, 0.12)",
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <TollIcon sx={{ fontSize: 36, color: "#16a34a" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#15803d", fontWeight: 800 }}>
                  AVAILABLE TOKENS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: "#14532d" }}>
                  {availableTokens}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={<AddCircleIcon />}
              onClick={handleOpenBuyModal}
              sx={{
                mt: 2,
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "#16a34a",
                "&:hover": { bgcolor: "#15803d" },
              }}
            >
              Get More Tokens
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Lifetime Tokens Purchased */}
        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "#f8fafc", borderColor: "#e2e8f0", p: 1 }}>
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <ArrowDownwardIcon sx={{ fontSize: 34, color: "#2563eb" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  TOTAL TOKENS PURCHASED
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
                  {purchasedTokens}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 2 }}>
              Prepaid token credits acquired through token packs.
            </Typography>
          </CardContent>
        </Card>

        {/* Card 3: Lifetime Tokens Used */}
        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "#f8fafc", borderColor: "#e2e8f0", p: 1 }}>
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <ArrowUpwardIcon sx={{ fontSize: 34, color: "#ea580c" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  TOTAL TOKENS USED
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#9a3412" }}>
                  {spentTokens}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 2 }}>
              Tokens redeemed to unlock verified lead matters.
            </Typography>
          </CardContent>
        </Card>

        {/* Card 4: Action quick link */}
        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "#eff6ff", borderColor: "#bfdbfe", p: 1 }}>
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <GavelIcon sx={{ fontSize: 34, color: "#2563eb" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "#1d4ed8", fontWeight: 700 }}>
                  MARKETPLACE ACCESS
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
                  1 Token = 1 Matter
                </Typography>
              </Box>
            </Stack>
            <Button
              component={Link}
              href="/dashboard/professional/leads"
              variant="outlined"
              size="small"
              fullWidth
              sx={{ mt: 2, textTransform: "none", fontWeight: 700, borderColor: "#3b82f6" }}
            >
              Browse Open Leads
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Token Ledger Table */}
      <SectionCard
        title="Token Ledger & Transaction History"
        subtitle="Complete audit statement of all token purchases, lead acceptance deductions, and administrative refunds."
        icon={<HistoryIcon sx={{ color: "#2563eb", fontSize: 22 }} />}
        noPadding
      >
        {txLoading ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CircularProgress size={32} />
          </Box>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<TollIcon sx={{ fontSize: 48, color: "#94a3b8" }} />}
            message="No token transactions yet"
            description="When you purchase tokens or unlock legal inquiries, your complete token statement will be recorded here."
            action={
              <Button variant="contained" size="small" onClick={handleOpenBuyModal} sx={{ textTransform: "none", fontWeight: 700 }}>
                Get Token Pack
              </Button>
            }
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Action Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }} align="center">Tokens</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }} align="right">Token Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => {
                  const isCredit = tx.tx_type === "credit" || tx.tx_type === "refund";
                  const tokensCount = tx.tokens_delta ?? (tx.amount_paise ? Math.round(tx.amount_paise / 10000) : 1);
                  const tokenBalanceAfter = tx.token_balance_after ?? wallet?.token_balance ?? 0;

                  return (
                    <TableRow key={tx.id} hover>
                      <TableCell sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {new Date(tx.created_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#2563eb", fontFamily: "monospace" }}>
                        {tx.reference}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isCredit ? "TOKEN CREDIT" : "TOKEN DEBIT"}
                          size="small"
                          color={isCredit ? "success" : "default"}
                          sx={{ fontWeight: 700, fontSize: "0.68rem", height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", color: "#334155" }}>
                        {tx.description}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<TollIcon style={{ fontSize: 14 }} />}
                          label={`${isCredit ? "+" : "-"}${Math.abs(tokensCount)} Token${Math.abs(tokensCount) !== 1 ? "s" : ""}`}
                          size="small"
                          color={isCredit ? "success" : "error"}
                          variant="outlined"
                          sx={{ fontWeight: 800, fontSize: "0.75rem", height: 22 }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                        {tokenBalanceAfter} Tokens
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      {/* Buy Tokens Modal */}
      <Dialog
        open={buyModalOpen}
        onClose={() => !purchasing && setBuyModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: 1 }}>
          <TollIcon sx={{ color: "#2563eb" }} /> Purchase Token Pack
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {buyError && <Alert severity="error">{buyError}</Alert>}
            {buySuccess && <Alert severity="success">{buySuccess}</Alert>}

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Tokens give you direct 1-click access to verified legal leads. Select a bundle below to add tokens instantly to your balance:
            </Typography>

            {/* Plans List */}
            <Stack spacing={1.5}>
              {plans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <Paper
                    key={plan.id}
                    variant="outlined"
                    onClick={() => setSelectedPlan(plan)}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      borderRadius: 2,
                      borderColor: isSelected ? "#2563eb" : "#e2e8f0",
                      borderWidth: isSelected ? 2 : 1,
                      bgcolor: isSelected ? "#eff6ff" : "#fff",
                      transition: "all 0.15s ease",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                          {plan.name}
                        </Typography>
                        <Chip
                          label={`${plan.credits_granted} Tokens`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                        />
                      </Stack>
                      <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.3, display: "block" }}>
                        {plan.description || `Includes ${plan.credits_granted} lead unlocks with full client contact details.`}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a" }}>
                        ₹{plan.price_inr.toLocaleString("en-IN")}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        ₹{(plan.price_inr / plan.credits_granted).toFixed(0)}/token
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>

            <Alert severity="info" sx={{ fontSize: "0.8rem" }}>
              Instant activation: Once payment is completed, your tokens will be credited immediately to your ICJ Token Wallet.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setBuyModalOpen(false)} disabled={purchasing} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmPurchase}
            disabled={purchasing || !selectedPlan}
            sx={{ textTransform: "none", fontWeight: 800, px: 3 }}
          >
            {purchasing ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              `Pay ₹${selectedPlan?.price_inr.toLocaleString("en-IN") || 0} for ${selectedPlan?.credits_granted || 0} Tokens`
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </PortalPageShell>
  );
}
