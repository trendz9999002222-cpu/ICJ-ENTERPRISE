import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import WalletService from "../services/walletService";
import FinanceService from "../services/financeService";
import WalletDashboard from "../components/wallet/WalletDashboard";
import WalletLedgerTable from "../components/wallet/WalletLedgerTable";
import useAuth from "../hooks/useAuth";

export default function MemberWallet() {
  const { profile, user } = useAuth();
  const role = String(profile?.role || user?.role || "member").toLowerCase();
  const permissions = FinanceService.getPermissions(role);

  const [wallets, setWallets] = useState([]);
  const [accountHeads, setAccountHeads] = useState([]);
  const [ledger, setLedger] = useState([]);

  const [memberId, setMemberId] = useState("");
  const [txForm, setTxForm] = useState({
    type: "CREDIT",
    walletId: "",
    targetWalletId: "",
    amount: "",
    mode: "Wallet",
    accountHeadId: "",
    referenceNo: "",
    narration: "",
  });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [walletFilter, setWalletFilter] = useState("ALL");

  const loadWallets = async () => {
    const [walletRows, heads, financeRows] = await Promise.all([
      WalletService.getAll(),
      FinanceService.getAccountHeads(),
      FinanceService.getFinanceEntries(),
    ]);
    setWallets(Array.isArray(walletRows) ? walletRows : []);
    setAccountHeads(Array.isArray(heads) ? heads : []);
    setLedger(Array.isArray(financeRows) ? financeRows : []);
  };

  useEffect(() => {
    Promise.resolve().then(loadWallets);
  }, []);

  const visibleWallets = useMemo(() => {
    if (permissions.canViewAll) return wallets;
    const actorMemberId = profile?.member_id || profile?.memberId || user?.id;
    return wallets.filter(
      (item) => String(item.memberId || item.member_id || "") === String(actorMemberId || "")
    );
  }, [wallets, permissions.canViewAll, profile, user]);

  const walletIdSet = useMemo(
    () => new Set(visibleWallets.map((item) => String(item.id))),
    [visibleWallets]
  );

  const walletLedgerRows = useMemo(() => {
    return ledger.filter((entry) => walletIdSet.has(String(entry.walletId || "")));
  }, [ledger, walletIdSet]);

  const filteredLedgerRows = useMemo(() => {
    const keyword = String(search || "").toLowerCase();
    return walletLedgerRows.filter((entry) => {
      const matchesType = typeFilter === "ALL" || entry.type === typeFilter;
      const matchesMode = modeFilter === "ALL" || String(entry.mode || "").toLowerCase() === String(modeFilter).toLowerCase();
      const matchesWallet = walletFilter === "ALL" || String(entry.walletId || "") === String(walletFilter);
      const matchesSearch =
        !keyword ||
        String(entry.id || "").toLowerCase().includes(keyword) ||
        String(entry.referenceNo || "").toLowerCase().includes(keyword) ||
        String(entry.voucherNo || "").toLowerCase().includes(keyword) ||
        String(entry.narration || "").toLowerCase().includes(keyword);

      return matchesType && matchesMode && matchesWallet && matchesSearch;
    });
  }, [walletLedgerRows, search, typeFilter, modeFilter, walletFilter]);

  const onTxChange = (event) => {
    const { name, value } = event.target;
    setTxForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetTxForm = () => {
    setTxForm({
      type: "CREDIT",
      walletId: "",
      targetWalletId: "",
      amount: "",
      mode: "Wallet",
      accountHeadId: "",
      referenceNo: "",
      narration: "",
    });
  };

  const createWallet = async () => {
    if (!permissions.canCreateWallet) {
      alert("You do not have permission to create wallets.");
      return;
    }

    if (!memberId.trim()) {
      alert("Member ID is required.");
      return;
    }

    await WalletService.create(memberId);
    setMemberId("");
    await loadWallets();
  };

  const postWalletTransaction = async () => {
    if (!permissions.canPostWalletEntries) {
      alert("You do not have permission to post wallet transactions.");
      return;
    }

    const selectedHead = accountHeads.find((item) => item.id === txForm.accountHeadId);
    await FinanceService.createWalletEntry(
      {
        ...txForm,
        accountHeadName: selectedHead?.name || "",
      },
      role
    );

    resetTxForm();
    await loadWallets();
  };

  const exportWalletLedger = () => {
    if (!permissions.canExport) {
      alert("You do not have permission to export ledger data.");
      return;
    }

    const rows = filteredLedgerRows.map((item) => ({
      ...item,
      source: "Wallet",
      reference: item.referenceNo || item.id,
    }));

    const { csv, fileName } = FinanceService.buildExport(rows, "wallet-ledger");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Wallet Dashboard & Ledger
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create Wallet
            </Typography>
            <TextField fullWidth label="Member ID" value={memberId} onChange={(event) => setMemberId(event.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" onClick={createWallet} disabled={!permissions.canCreateWallet}>
              Create
            </Button>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Credit / Debit / Transfer
            </Typography>

            <TextField
              fullWidth
              select
              name="type"
              label="Transaction Type"
              value={txForm.type}
              onChange={onTxChange}
              sx={{ mb: 2 }}
            >
              <MenuItem value="CREDIT">Credit</MenuItem>
              <MenuItem value="DEBIT">Debit</MenuItem>
              <MenuItem value="TRANSFER">Transfer</MenuItem>
            </TextField>

            <TextField
              fullWidth
              select
              name="walletId"
              label="Wallet"
              value={txForm.walletId}
              onChange={onTxChange}
              sx={{ mb: 2 }}
            >
              {visibleWallets.map((item) => (
                <MenuItem key={item.id} value={item.id}>{`${item.id} - ${item.memberId || item.member_id || "-"}`}</MenuItem>
              ))}
            </TextField>

            {txForm.type === "TRANSFER" ? (
              <TextField
                fullWidth
                select
                name="targetWalletId"
                label="Target Wallet"
                value={txForm.targetWalletId}
                onChange={onTxChange}
                sx={{ mb: 2 }}
              >
                {visibleWallets.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{`${item.id} - ${item.memberId || item.member_id || "-"}`}</MenuItem>
                ))}
              </TextField>
            ) : null}

            <TextField fullWidth type="number" name="amount" label="Amount" value={txForm.amount} onChange={onTxChange} sx={{ mb: 2 }} />

            <TextField fullWidth select name="mode" label="Mode" value={txForm.mode} onChange={onTxChange} sx={{ mb: 2 }}>
              <MenuItem value="Wallet">Wallet</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank">Bank</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
            </TextField>

            <TextField
              fullWidth
              select
              name="accountHeadId"
              label="Account Head"
              value={txForm.accountHeadId}
              onChange={onTxChange}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Not Selected</MenuItem>
              {accountHeads.map((item) => (
                <MenuItem key={item.id} value={item.id}>{`${item.name} (${item.group})`}</MenuItem>
              ))}
            </TextField>

            <TextField fullWidth name="referenceNo" label="Reference" value={txForm.referenceNo} onChange={onTxChange} sx={{ mb: 2 }} />
            <TextField fullWidth multiline minRows={2} name="narration" label="Narration" value={txForm.narration} onChange={onTxChange} sx={{ mb: 2 }} />

            <Button variant="contained" onClick={postWalletTransaction} disabled={!permissions.canPostWalletEntries}>
              Post Transaction
            </Button>
          </Paper>
        </Grid>

        <Grid xs={12} md={8}>
          <WalletDashboard wallets={visibleWallets} />

          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Search & Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </Grid>
              <Grid xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Type"
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="CREDIT">Credit</MenuItem>
                  <MenuItem value="DEBIT">Debit</MenuItem>
                  <MenuItem value="TRANSFER">Transfer</MenuItem>
                  <MenuItem value="INCOME">Income</MenuItem>
                  <MenuItem value="EXPENSE">Expense</MenuItem>
                  <MenuItem value="RECEIPT">Receipt</MenuItem>
                  <MenuItem value="PAYMENT">Payment</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Mode"
                  value={modeFilter}
                  onChange={(event) => setModeFilter(event.target.value)}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="Wallet">Wallet</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank">Bank</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Wallet"
                  value={walletFilter}
                  onChange={(event) => setWalletFilter(event.target.value)}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  {visibleWallets.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{`${item.id}`}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          <WalletLedgerTable
            rows={filteredLedgerRows}
            canExport={permissions.canExport}
            onExport={exportWalletLedger}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
