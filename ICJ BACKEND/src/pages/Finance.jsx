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
import FinanceService from "../services/financeService";
import WalletService from "../services/walletService";
import useAuth from "../hooks/useAuth";
import FinanceTransactionTable from "../components/finance/FinanceTransactionTable";

export default function Finance() {
  const { profile, user } = useAuth();
  const role = String(profile?.role || user?.role || "member").toLowerCase();
  const permissions = FinanceService.getPermissions(role);

  const [overview, setOverview] = useState({
    walletBalance: 0,
    tokenValue: 0,
    donationValue: 0,
    income: 0,
    expenses: 0,
    receipts: 0,
    payments: 0,
    totalTransactions: 0,
    transactions: [],
  });
  const [wallets, setWallets] = useState([]);
  const [accountHeads, setAccountHeads] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [books, setBooks] = useState({
    cashBook: [],
    bankBook: [],
    receipts: [],
    payments: [],
    income: [],
    expenses: [],
  });
  const [history, setHistory] = useState([]);

  const [entryForm, setEntryForm] = useState({
    type: "INCOME",
    mode: "Cash",
    amount: "",
    walletId: "",
    accountHeadId: "",
    referenceNo: "",
    narration: "",
  });

  const [newHead, setNewHead] = useState({ name: "", group: "INCOME" });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");

  const loadFinance = async () => {
    const [
      overviewData,
      walletRows,
      headRows,
      voucherRows,
      bookRows,
      historyRows,
    ] = await Promise.all([
      FinanceService.getOverview(),
      WalletService.getAll(),
      FinanceService.getAccountHeads(),
      FinanceService.getVouchers(),
      FinanceService.getBooks(),
      FinanceService.getTransactionHistory(),
    ]);

    setOverview(overviewData || {
      walletBalance: 0,
      tokenValue: 0,
      donationValue: 0,
      income: 0,
      expenses: 0,
      receipts: 0,
      payments: 0,
      totalTransactions: 0,
      transactions: [],
    });
    setWallets(Array.isArray(walletRows) ? walletRows : []);
    setAccountHeads(Array.isArray(headRows) ? headRows : []);
    setVouchers(Array.isArray(voucherRows) ? voucherRows : []);
    setBooks(bookRows || { cashBook: [], bankBook: [], receipts: [], payments: [], income: [], expenses: [] });
    setHistory(Array.isArray(historyRows) ? historyRows : []);
  };

  useEffect(() => {
    Promise.resolve().then(loadFinance);
  }, []);

  const cards = [
    { title: "Wallet Balance", value: `Rs ${overview.walletBalance.toLocaleString("en-IN")}` },
    { title: "Token Value", value: `Rs ${overview.tokenValue.toLocaleString("en-IN")}` },
    { title: "Donation Value", value: `Rs ${overview.donationValue.toLocaleString("en-IN")}` },
    { title: "Income", value: `Rs ${Number(overview.income || 0).toLocaleString("en-IN")}` },
    { title: "Expense", value: `Rs ${Number(overview.expenses || 0).toLocaleString("en-IN")}` },
    { title: "Receipt", value: `Rs ${Number(overview.receipts || 0).toLocaleString("en-IN")}` },
    { title: "Payment", value: `Rs ${Number(overview.payments || 0).toLocaleString("en-IN")}` },
    { title: "Transactions", value: String(overview.totalTransactions || 0) },
  ];

  const onEntryChange = (event) => {
    const { name, value } = event.target;
    setEntryForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetEntryForm = () => {
    setEntryForm({
      type: "INCOME",
      mode: "Cash",
      amount: "",
      walletId: "",
      accountHeadId: "",
      referenceNo: "",
      narration: "",
    });
  };

  const createFinanceEntry = async () => {
    if (!permissions.canPostFinanceEntries) {
      alert("You do not have permission to post finance entries.");
      return;
    }

    const selectedHead = accountHeads.find((item) => item.id === entryForm.accountHeadId);
    await FinanceService.createFinanceEntry(
      {
        ...entryForm,
        accountHeadName: selectedHead?.name || "",
      },
      role
    );

    resetEntryForm();
    await loadFinance();
  };

  const createAccountHead = async () => {
    if (!permissions.canManageAccountHeads) {
      alert("You do not have permission to create account heads.");
      return;
    }

    await FinanceService.createAccountHead(newHead, role);
    setNewHead({ name: "", group: "INCOME" });
    const heads = await FinanceService.getAccountHeads();
    setAccountHeads(Array.isArray(heads) ? heads : []);
  };

  const exportRows = (rows, type) => {
    if (!permissions.canExport) {
      alert("You do not have permission to export finance data.");
      return;
    }
    const { csv, fileName } = FinanceService.buildExport(rows, type);
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

  const filteredHistory = useMemo(() => {
    const keyword = String(search || "").toLowerCase();

    return history.filter((row) => {
      const matchesType = typeFilter === "ALL" || String(row.type || "").toUpperCase() === typeFilter;
      const matchesMode = modeFilter === "ALL" || String(row.mode || "").toLowerCase() === String(modeFilter).toLowerCase();
      const matchesSource = sourceFilter === "ALL" || String(row.source || "") === sourceFilter;
      const matchesSearch =
        !keyword ||
        String(row.reference || "").toLowerCase().includes(keyword) ||
        String(row.voucherNo || "").toLowerCase().includes(keyword) ||
        String(row.accountHeadName || "").toLowerCase().includes(keyword) ||
        String(row.narration || "").toLowerCase().includes(keyword);

      return matchesType && matchesMode && matchesSource && matchesSearch;
    });
  }, [history, search, typeFilter, modeFilter, sourceFilter]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Finance Module
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid xs={12} sm={6} md={3} key={card.title}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">{card.title}</Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{card.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Income / Expense / Receipt / Payment
            </Typography>

            <TextField fullWidth select label="Type" name="type" value={entryForm.type} onChange={onEntryChange} sx={{ mb: 2 }}>
              <MenuItem value="INCOME">Income</MenuItem>
              <MenuItem value="EXPENSE">Expense</MenuItem>
              <MenuItem value="RECEIPT">Receipt</MenuItem>
              <MenuItem value="PAYMENT">Payment</MenuItem>
            </TextField>

            <TextField fullWidth type="number" label="Amount" name="amount" value={entryForm.amount} onChange={onEntryChange} sx={{ mb: 2 }} />

            <TextField fullWidth select label="Mode" name="mode" value={entryForm.mode} onChange={onEntryChange} sx={{ mb: 2 }}>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank">Bank</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Wallet">Wallet</MenuItem>
            </TextField>

            <TextField fullWidth select label="Wallet (Optional)" name="walletId" value={entryForm.walletId} onChange={onEntryChange} sx={{ mb: 2 }}>
              <MenuItem value="">Not linked</MenuItem>
              {wallets.map((item) => (
                <MenuItem key={item.id} value={item.id}>{`${item.id} - ${item.memberId || item.member_id || "-"}`}</MenuItem>
              ))}
            </TextField>

            <TextField fullWidth select label="Account Head" name="accountHeadId" value={entryForm.accountHeadId} onChange={onEntryChange} sx={{ mb: 2 }}>
              <MenuItem value="">Not Selected</MenuItem>
              {accountHeads.map((item) => (
                <MenuItem key={item.id} value={item.id}>{`${item.name} (${item.group})`}</MenuItem>
              ))}
            </TextField>

            <TextField fullWidth label="Reference" name="referenceNo" value={entryForm.referenceNo} onChange={onEntryChange} sx={{ mb: 2 }} />
            <TextField fullWidth multiline minRows={2} label="Narration" name="narration" value={entryForm.narration} onChange={onEntryChange} sx={{ mb: 2 }} />

            <Button variant="contained" onClick={createFinanceEntry} disabled={!permissions.canPostFinanceEntries}>
              Post Entry
            </Button>
          </Paper>

          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Heads
            </Typography>

            <TextField
              fullWidth
              label="Account Head Name"
              value={newHead.name}
              onChange={(event) => setNewHead((prev) => ({ ...prev, name: event.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Group"
              value={newHead.group}
              onChange={(event) => setNewHead((prev) => ({ ...prev, group: event.target.value }))}
              sx={{ mb: 2 }}
            >
              <MenuItem value="ASSET">Asset</MenuItem>
              <MenuItem value="INCOME">Income</MenuItem>
              <MenuItem value="EXPENSE">Expense</MenuItem>
              <MenuItem value="LIABILITY">Liability</MenuItem>
            </TextField>

            <Button variant="outlined" onClick={createAccountHead} disabled={!permissions.canManageAccountHeads}>
              Create Head
            </Button>

            <Box sx={{ mt: 2 }}>
              {accountHeads.slice(0, 12).map((item) => (
                <Typography key={item.id} variant="body2" sx={{ mb: 0.5 }}>
                  {`${item.name} (${item.group})`}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Transaction History Search & Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} md={3}>
                <TextField fullWidth label="Search" value={search} onChange={(event) => setSearch(event.target.value)} />
              </Grid>
              <Grid xs={12} md={3}>
                <TextField fullWidth select label="Type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="INCOME">Income</MenuItem>
                  <MenuItem value="EXPENSE">Expense</MenuItem>
                  <MenuItem value="RECEIPT">Receipt</MenuItem>
                  <MenuItem value="PAYMENT">Payment</MenuItem>
                  <MenuItem value="CREDIT">Credit</MenuItem>
                  <MenuItem value="DEBIT">Debit</MenuItem>
                  <MenuItem value="TRANSFER">Transfer</MenuItem>
                  <MenuItem value="TOKEN">Token</MenuItem>
                  <MenuItem value="DONATION">Donation</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} md={3}>
                <TextField fullWidth select label="Mode" value={modeFilter} onChange={(event) => setModeFilter(event.target.value)}>
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank">Bank</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Wallet">Wallet</MenuItem>
                  <MenuItem value="Token">Token</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} md={3}>
                <TextField fullWidth select label="Source" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Donation">Donation</MenuItem>
                  <MenuItem value="Token">Token</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3}>
            <Grid xs={12}>
              <FinanceTransactionTable
                title="Transaction History"
                rows={filteredHistory}
                showExport={permissions.canExport}
                onExport={() => exportRows(filteredHistory, "transaction-history")}
                exportLabel="Export History"
              />
            </Grid>

            <Grid xs={12} md={6}>
              <FinanceTransactionTable
                title="Cash Book"
                rows={books.cashBook}
                showExport={permissions.canExport}
                onExport={() => exportRows(books.cashBook, "cash-book")}
                exportLabel="Export Cash Book"
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FinanceTransactionTable
                title="Bank Book"
                rows={books.bankBook}
                showExport={permissions.canExport}
                onExport={() => exportRows(books.bankBook, "bank-book")}
                exportLabel="Export Bank Book"
              />
            </Grid>
            <Grid xs={12} md={6}>
              <FinanceTransactionTable title="Receipt Book" rows={books.receipts} />
            </Grid>
            <Grid xs={12} md={6}>
              <FinanceTransactionTable title="Payment Book" rows={books.payments} />
            </Grid>
            <Grid xs={12}>
              <FinanceTransactionTable
                title="Voucher System"
                rows={vouchers.map((item) => ({
                  id: item.id,
                  source: "Voucher",
                  type: item.category,
                  reference: item.id,
                  voucherNo: item.voucherNo,
                  accountHeadName: "-",
                  mode: "-",
                  amount: item.amount,
                  status: item.status,
                  narration: item.narration,
                  createdAt: item.createdAt,
                  direction: "IN",
                }))}
                showExport={permissions.canExport}
                onExport={() =>
                  exportRows(
                    vouchers.map((item) => ({
                      id: item.id,
                      createdAt: item.createdAt,
                      source: "Voucher",
                      type: item.category,
                      direction: "IN",
                      amount: item.amount,
                      mode: "-",
                      reference: item.id,
                      voucherNo: item.voucherNo,
                      accountHeadName: "-",
                      status: item.status,
                      narration: item.narration,
                    })),
                    "vouchers"
                  )
                }
                exportLabel="Export Vouchers"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

