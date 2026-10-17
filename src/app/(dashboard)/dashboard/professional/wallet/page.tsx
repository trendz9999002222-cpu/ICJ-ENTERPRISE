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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import HistoryIcon from "@mui/icons-material/History";
import LockClockIcon from "@mui/icons-material/LockClock";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import { loadEasebuzzCheckout } from "@/lib/easebuzz/loadEasebuzz";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { ProfessionalWalletData, WalletTransactionItem } from "@/types/lead";

const PRESET_AMOUNTS = [1000, 3000, 5000, 10000];

export default function ProfessionalWalletPage() {
  const [wallet, setWallet] = useState<ProfessionalWalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  // Topup Modal State
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(3000);
  const [submittingTopup, setSubmittingTopup] = useState(false);
  const [topupError, setTopupError] = useState("");
  const [topupSuccess, setTopupSuccess] = useState("");

  const loadWallet = async () => {
    setLoading(true);
    try {
      const data = await leadMarketplaceService.getWallet();
      setWallet(data);
    } catch (err) {
      console.error(err);
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
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
    loadTransactions();
  }, []);

  const handleTopupSubmit = async () => {
    if (!topupAmount || topupAmount < 100) {
      setTopupError("Minimum top-up amount is ₹100.");
      return;
    }
    setSubmittingTopup(true);
    setTopupError("");
    setTopupSuccess("");

    try {
      const order = await leadMarketplaceService.createTopupOrder(topupAmount);

      // Load Easebuzz checkout script
      let easebuzzLoaded = false;
      try {
        await loadEasebuzzCheckout();
        easebuzzLoaded = typeof window !== "undefined" && Boolean(window.EasebuzzCheckout);
      } catch {
        easebuzzLoaded = false;
      }

      if (easebuzzLoaded && order.access_key) {
        await new Promise<void>((resolve, reject) => {
          try {
            const easebuzz = new window.EasebuzzCheckout(order.key || "P2OTPKQ5X", order.env || "test");
            const options = {
              access_key: order.access_key,
              onResponse: async (response: any) => {
                try {
                  const statusStr = String(response?.status || "").toLowerCase();
                  if (statusStr === "success" || response?.status === 1) {
                    await leadMarketplaceService.verifyPayment({
                      txnid: response.txnid || order.gateway_order_id,
                      easepayid: response.easepayid || "",
                      status: "success",
                      hash: response.hash || "",
                      order_id: order.order_id,
                    });
                    setTopupSuccess(`Successfully added ₹${topupAmount.toLocaleString("en-IN")} to your ICJ Wallet!`);
                    setTimeout(() => {
                      setTopupModalOpen(false);
                      loadWallet();
                      loadTransactions();
                    }, 1200);
                    resolve();
                  } else {
                    reject(new Error(response?.error_Message || response?.error_desc || "Payment was not successful."));
                  }
                } catch (e) {
                  reject(e);
                }
              },
            };
            easebuzz.initiatePayment(options);
          } catch (initErr) {
            if (order.payment_url) {
              window.location.href = order.payment_url;
            } else {
              reject(initErr);
            }
          }
        });
      } else if (order.payment_url) {
        window.location.href = order.payment_url;
      } else {
        throw new Error("Unable to initialize Easebuzz checkout. Please try again.");
      }
    } catch (err: any) {
      setTopupError(err?.message || "Payment top-up failed.");
    } finally {
      setSubmittingTopup(false);
    }
  };

  return (
    <PortalPageShell
      title="ICJ Professional Wallet"
      subtitle="Manage your prepaid balance for seamless, instant lead unlocks and professional service transactions."
    >
      {/* Balances Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2.5, mb: 3 }}>
        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "#f8fafc", p: 1 }}>
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  AVAILABLE BALANCE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  ₹{wallet ? wallet.available_inr.toLocaleString("en-IN") : "0.00"}
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={<AddCircleIcon />}
              onClick={() => { setTopupError(""); setTopupSuccess(""); setTopupModalOpen(true); }}
              sx={{ mt: 2, textTransform: "none", fontWeight: 700 }}
            >
              Add Money
            </Button>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "#f8fafc", p: 1 }}>
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <LockClockIcon sx={{ fontSize: 32, color: "#94a3b8" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  HELD IN CHECKOUT
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#334155" }}>
                  ₹{wallet ? wallet.reserved_inr.toLocaleString("en-IN") : "0.00"}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 2 }}>
              Temporary holds during active lead reservations.
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "#f8fafc", p: 1 }}>
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <ArrowDownwardIcon sx={{ fontSize: 32, color: "#16a34a" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  LIFETIME ADDED
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#15803d" }}>
                  ₹{wallet ? wallet.total_added_inr.toLocaleString("en-IN") : "0.00"}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 2 }}>
              Total money deposited into your wallet account.
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: "#f8fafc", p: 1 }}>
          <CardContent>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <ArrowUpwardIcon sx={{ fontSize: 32, color: "#ea580c" }} />
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                  LIFETIME SPENT
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#9a3412" }}>
                  ₹{wallet ? wallet.total_spent_inr.toLocaleString("en-IN") : "0.00"}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 2 }}>
              Used for lead acceptance and services.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Transaction Ledger Table */}
      <SectionCard
        title="Wallet Ledger Transactions"
        subtitle="Append-only immutable audit statement of all credits, debits, and adjustments."
        icon={<HistoryIcon sx={{ color: "#2563eb", fontSize: 20 }} />}
        noPadding
      >
        {txLoading ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CircularProgress size={30} />
          </Box>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon sx={{ fontSize: 44, color: "#94a3b8" }} />}
            message="No wallet transactions yet"
            description="Your deposits and lead acceptance debits will appear here with full reference tracking."
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }} align="right">Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.78rem" }} align="right">Balance After</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => {
                  const isCredit = tx.tx_type === "credit" || tx.tx_type === "refund";
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
                      <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#2563eb" }}>
                        {tx.reference}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.tx_type.toUpperCase()}
                          size="small"
                          color={isCredit ? "success" : "default"}
                          sx={{ fontWeight: 700, fontSize: "0.68rem", height: 20 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", color: "#334155" }}>
                        {tx.description}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.85rem", color: isCredit ? "#16a34a" : "#dc2626" }}>
                        {isCredit ? "+" : "-"}₹{tx.amount_inr.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }}>
                        ₹{tx.balance_after_inr.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      {/* Add Money Modal */}
      <Dialog
        open={topupModalOpen}
        onClose={() => !submittingTopup && setTopupModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.15rem" }}>
          Add Balance to ICJ Wallet
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {topupError && <Alert severity="error">{topupError}</Alert>}
            {topupSuccess && <Alert severity="success">{topupSuccess}</Alert>}

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Select or enter the amount you want to add. Funds are credited immediately upon verified payment.
            </Typography>

            {/* Presets */}
            <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
              {PRESET_AMOUNTS.map((amt) => (
                <Button
                  key={amt}
                  variant={topupAmount === amt ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setTopupAmount(amt)}
                  sx={{ textTransform: "none", fontWeight: 700, minWidth: 64 }}
                >
                  ₹{amt.toLocaleString("en-IN")}
                </Button>
              ))}
            </Stack>

            <TextField
              label="Amount in INR"
              type="number"
              fullWidth
              value={topupAmount}
              onChange={(e) => setTopupAmount(Number(e.target.value))}
              slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1, fontWeight: 700 }}>₹</Typography> } }}
            />

            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Supported payment methods: UPI, NetBanking, Cards. Amounts stored securely in integer paise.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setTopupModalOpen(false)} disabled={submittingTopup} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTopupSubmit}
            disabled={submittingTopup || !topupAmount || topupAmount < 100}
            sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
          >
            {submittingTopup ? <CircularProgress size={20} color="inherit" /> : `Pay ₹${topupAmount.toLocaleString("en-IN")}`}
          </Button>
        </DialogActions>
      </Dialog>
    </PortalPageShell>
  );
}
