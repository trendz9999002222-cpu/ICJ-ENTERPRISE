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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import TollIcon from "@mui/icons-material/Toll";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { adminLeadsService } from "@/services/admin/adminLeads.service";
import type { ProfessionalWalletData, WalletTransactionItem } from "@/types/lead";

const TX_TYPE_COLOR: Record<string, "success" | "error" | "info" | "warning" | "default"> = {
  credit: "success",
  debit: "error",
  refund: "info",
  adjustment: "warning",
  hold: "default",
  hold_release: "info",
};

export default function AdminWalletsPage() {
  const [tab, setTab] = useState(0);

  // Wallets tab
  const [wallets, setWallets] = useState<ProfessionalWalletData[]>([]);
  const [walletCount, setWalletCount] = useState(0);
  const [walletPage, setWalletPage] = useState(0);
  const [walletSearch, setWalletSearch] = useState("");
  const [walletsLoading, setWalletsLoading] = useState(true);

  // Transactions tab
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);
  const [txCount, setTxCount] = useState(0);
  const [txPage, setTxPage] = useState(0);
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [txLoading, setTxLoading] = useState(true);

  // Adjust Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<ProfessionalWalletData | null>(null);
  const [adjustCurrency, setAdjustCurrency] = useState<"tokens" | "cash">("tokens");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState("");
  const [adjustSuccess, setAdjustSuccess] = useState("");

  const PAGE_SIZE = 10;

  const loadWallets = async () => {
    setWalletsLoading(true);
    try {
      const res = await adminLeadsService.listWallets({
        page: walletPage + 1,
        page_size: PAGE_SIZE,
        search: walletSearch || undefined,
      });
      setWallets(res.results);
      setWalletCount(res.count);
    } catch (err) {
      console.error(err);
    } finally {
      setWalletsLoading(false);
    }
  };

  const loadTransactions = async () => {
    setTxLoading(true);
    try {
      const res = await adminLeadsService.listWalletTransactions({
        page: txPage + 1,
        page_size: PAGE_SIZE,
        type: txTypeFilter !== "all" ? txTypeFilter : undefined,
      });
      setTransactions(res.results);
      setTxCount(res.count);
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => { loadWallets(); }, [walletPage, walletSearch]);
  useEffect(() => { loadTransactions(); }, [txPage, txTypeFilter]);

  const handleAdjust = (wallet: ProfessionalWalletData) => {
    setAdjustTarget(wallet);
    setAdjustCurrency("tokens");
    setAdjustAmount("");
    setAdjustReason("");
    setAdjustType("credit");
    setAdjustError("");
    setAdjustSuccess("");
    setAdjustModalOpen(true);
  };

  const submitAdjust = async () => {
    if (!adjustTarget) return;
    if (!adjustReason.trim()) { setAdjustError("Reason is required."); return; }

    setAdjusting(true);
    setAdjustError("");
    try {
      if (adjustCurrency === "tokens") {
        const tokenNum = parseInt(adjustAmount, 10);
        if (!tokenNum || tokenNum <= 0) {
          setAdjustError("Enter a valid positive number of tokens.");
          setAdjusting(false);
          return;
        }
        await adminLeadsService.adjustWallet(adjustTarget.id, {
          tokens_delta: tokenNum,
          is_credit: adjustType === "credit",
          reason: adjustReason,
        });
        setAdjustSuccess(`Successfully ${adjustType === "credit" ? "granted" : "deducted"} ${tokenNum} tokens.`);
      } else {
        const amt = parseFloat(adjustAmount);
        if (!amt || amt <= 0) {
          setAdjustError("Enter a valid positive cash amount.");
          setAdjusting(false);
          return;
        }
        await adminLeadsService.adjustWallet(adjustTarget.id, {
          amount_inr: amt,
          is_credit: adjustType === "credit",
          reason: adjustReason,
        });
        setAdjustSuccess("Cash balance adjusted successfully.");
      }
      loadWallets();
      setTimeout(() => setAdjustModalOpen(false), 1500);
    } catch (err: any) {
      setAdjustError(err?.message || "Failed to adjust wallet.");
    } finally {
      setAdjusting(false);
    }
  };

  const walletColumns: AdminTableColumn<ProfessionalWalletData>[] = [
    {
      key: "professional_email",
      label: "Professional",
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>{row.professional_email}</Typography>
      ),
    },
    {
      key: "token_balance",
      label: "Lead Tokens",
      render: (row) => (
        <Chip
          icon={<LoyaltyIcon sx={{ fontSize: "14px !important" }} />}
          label={`${row.token_balance ?? 0} Tokens`}
          size="small"
          color={(row.token_balance ?? 0) > 0 ? "success" : "default"}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      key: "available_inr",
      label: "Cash Balance",
      render: (row) => (
        <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.875rem" }}>
          ₹{(row.available_inr ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      key: "total_tokens_purchased",
      label: "Tokens (Bought / Spent)",
      render: (row) => (
        <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
          {row.total_tokens_purchased ?? 0} / {row.total_tokens_spent ?? 0}
        </Typography>
      ),
    },
    {
      key: "reserved_inr",
      label: "Reserved Cash",
      render: (row) => (
        <Typography sx={{ fontSize: "0.8125rem", color: "warning.main" }}>₹{(row.reserved_inr ?? 0).toFixed(2)}</Typography>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <Tooltip title="Adjust tokens or cash balance">
          <Button size="small" variant="outlined" startIcon={<AddCircleIcon />} onClick={() => handleAdjust(row)} sx={{ fontSize: "0.75rem", borderRadius: 1.5 }}>
            Adjust
          </Button>
        </Tooltip>
      ),
    },
  ];

  const txColumns: AdminTableColumn<WalletTransactionItem>[] = [
    {
      key: "reference",
      label: "Reference",
      render: (row) => (
        <Typography sx={{ fontSize: "0.75rem", fontFamily: "monospace", color: "text.secondary" }}>{row.reference}</Typography>
      ),
    },
    {
      key: "tx_type",
      label: "Type",
      render: (row) => (
        <Chip label={row.tx_type.replace("_", " ").toUpperCase()} size="small" color={TX_TYPE_COLOR[row.tx_type] ?? "default"} />
      ),
    },
    {
      key: "amount_inr",
      label: "Change / Impact",
      render: (row) => {
        if (row.tokens_delta !== undefined && row.tokens_delta !== null && row.tokens_delta !== 0) {
          const isPos = row.tokens_delta > 0;
          return (
            <Typography sx={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: isPos ? "success.main" : "error.main"
            }}>
              {isPos ? "+" : ""}{row.tokens_delta} Tokens
            </Typography>
          );
        }
        return (
          <Typography sx={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: ["credit", "refund", "hold_release"].includes(row.tx_type) ? "success.main" : "error.main"
          }}>
            {["credit", "refund", "hold_release"].includes(row.tx_type) ? "+" : "-"}₹{(row.amount_inr ?? 0).toFixed(2)}
          </Typography>
        );
      },
    },
    {
      key: "balance_after_inr",
      label: "Balance After",
      render: (row) => {
        if (row.tokens_delta !== undefined && row.tokens_delta !== null && row.tokens_delta !== 0) {
          return (
            <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", fontWeight: 600 }}>
              {row.token_balance_after ?? 0} tokens
            </Typography>
          );
        }
        return (
          <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
            ₹{(row.balance_after_inr ?? 0).toFixed(2)}
          </Typography>
        );
      },
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.description}</Typography>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (row) => (
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{new Date(row.created_at).toLocaleString("en-IN")}</Typography>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Professional Wallets & Tokens"
      subtitle="Manage lead unlock tokens, cash balances, and view all transaction history."
    >
      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        {[
          { label: "Total Wallets", value: walletCount, color: "#2563eb" },
          { label: "Circulating Tokens", value: `${wallets.reduce((s, w) => s + (w.token_balance ?? 0), 0)} Tokens`, color: "#16a34a" },
          { label: "Total Cash Balance", value: `₹${wallets.reduce((s, w) => s + (w.available_inr ?? 0), 0).toFixed(2)}`, color: "#0f172a" },
          { label: "Reserved Funds", value: `₹${wallets.reduce((s, w) => s + (w.reserved_inr ?? 0), 0).toFixed(2)}`, color: "#d97706" },
        ].map((stat) => (
          <Box key={stat.label} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", bgcolor: "#fff", textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>{stat.label}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ borderBottom: "1px solid #e2e8f0", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
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
          <Tab icon={<AccountBalanceWalletIcon fontSize="small" />} iconPosition="start" label="Wallet Overview" />
          <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="All Transactions" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <AdminDataTable<ProfessionalWalletData>
          columns={walletColumns}
          rows={wallets}
          loading={walletsLoading}
          searchValue={walletSearch}
          searchPlaceholder="Search by email..."
          onSearchChange={(v) => { setWalletSearch(v); setWalletPage(0); }}
          getRowKey={(w) => w.id}
          pagination={{
            totalCount: walletCount,
            page: walletPage,
            rowsPerPage: PAGE_SIZE,
            onPageChange: setWalletPage,
          }}
        />
      )}

      {tab === 1 && (
        <AdminDataTable<WalletTransactionItem>
          columns={txColumns}
          rows={transactions}
          loading={txLoading}
          filterSlot={
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Transaction Type</InputLabel>
                <Select value={txTypeFilter} label="Transaction Type" onChange={(e) => { setTxTypeFilter(e.target.value); setTxPage(0); }}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="debit">Debit</MenuItem>
                  <MenuItem value="refund">Refund</MenuItem>
                  <MenuItem value="adjustment">Adjustment</MenuItem>
                  <MenuItem value="hold">Hold</MenuItem>
                  <MenuItem value="hold_release">Hold Release</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">{txCount} transactions</Typography>
            </Stack>
          }
          getRowKey={(tx) => tx.id}
          pagination={{
            totalCount: txCount,
            page: txPage,
            rowsPerPage: PAGE_SIZE,
            onPageChange: setTxPage,
          }}
        />
      )}

      {/* Adjust Modal */}
      <Dialog open={adjustModalOpen} onClose={() => setAdjustModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <AccountBalanceWalletIcon color="primary" />
            <span>Adjust Professional Account</span>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {adjustTarget && (
            <Box sx={{ mb: 2, p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{adjustTarget.professional_email}</Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Tokens: <strong style={{ color: "#16a34a" }}>{adjustTarget.token_balance ?? 0} Tokens</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cash: <strong>₹{(adjustTarget.available_inr ?? 0).toFixed(2)}</strong>
                </Typography>
              </Stack>
            </Box>
          )}
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {/* Currency selector: Tokens vs Cash */}
            <FormControl fullWidth size="small">
              <InputLabel>Asset to Adjust</InputLabel>
              <Select value={adjustCurrency} label="Asset to Adjust" onChange={(e) => setAdjustCurrency(e.target.value as "tokens" | "cash")}>
                <MenuItem value="tokens">
                  <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                    <LoyaltyIcon fontSize="small" color="success" />
                    <span>Lead Tokens (Lead Unlocks)</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="cash">
                  <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                    <AccountBalanceWalletIcon fontSize="small" color="primary" />
                    <span>Cash Balance (₹)</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Adjustment Action</InputLabel>
              <Select value={adjustType} label="Adjustment Action" onChange={(e) => setAdjustType(e.target.value as "credit" | "debit")}>
                <MenuItem value="credit">
                  <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                    <AddCircleIcon fontSize="small" color="success" />
                    <span>Credit (Grant {adjustCurrency === "tokens" ? "Tokens" : "Funds"})</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="debit">
                  <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                    <RemoveCircleIcon fontSize="small" color="error" />
                    <span>Debit (Deduct {adjustCurrency === "tokens" ? "Tokens" : "Funds"})</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={adjustCurrency === "tokens" ? "Number of Tokens" : "Amount (₹)"}
              type="number"
              size="small"
              fullWidth
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              slotProps={{ htmlInput: { min: 1, step: adjustCurrency === "tokens" ? 1 : "0.01" } }}
              helperText={adjustCurrency === "tokens" ? "Specify the exact integer count of tokens to grant or deduct." : "Specify amount in Indian Rupees."}
            />

            <TextField
              label="Audit Reason / Notes"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder={adjustCurrency === "tokens" ? "e.g. Compensation for dispute, promotional token grant..." : "e.g. Promotional credit, manual correction..."}
            />
          </Stack>
          {adjustError && <Alert severity="error" sx={{ mt: 2 }}>{adjustError}</Alert>}
          {adjustSuccess && <Alert severity="success" sx={{ mt: 2 }}>{adjustSuccess}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAdjustModalOpen(false)} disabled={adjusting}>Cancel</Button>
          <Button variant="contained" color={adjustType === "credit" ? "success" : "error"} onClick={submitAdjust} disabled={adjusting}>
            {adjusting ? "Processing..." : adjustType === "credit" ? `Credit ${adjustCurrency === "tokens" ? "Tokens" : "Wallet"}` : `Debit ${adjustCurrency === "tokens" ? "Tokens" : "Wallet"}`}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
