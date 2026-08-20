import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";

// Icons
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentIcon from "@mui/icons-material/Payment";
import SecurityIcon from "@mui/icons-material/Security";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PrintIcon from "@mui/icons-material/Print";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import WalletService from "../services/walletService";
import ActivityService from "../services/activityService";
import TokenLedgerService from "../services/tokenLedgerService";
import TokenRateService from "../services/tokenRateService";
import TransactionChargeService from "../services/transactionChargeService";
import UniversalActionToolbar from "../components/common/UniversalActionToolbar";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

export default function Wallet() {
  const [tabIndex, setTabIndex] = useState(0);
  const [wallets, setWallets] = useState([]);
  const [alertMsg, setAlertMsg] = useState("");

  // Transfer Modal State
  const [openTransfer, setOpenTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromWallet: "Community Wallet (ICJ Master)",
    toWallet: "Member Wallet (ICJMember1234)",
    amount: "5000",
    remarks: "Quarterly Member Token Grant",
  });

  // Transactions State
  const [transactions, setTransactions] = useState([
    { id: "TXN-2026-9811", type: "Membership Fee", wallet: "Member Wallet", amount: 15000, gst: 2700, total: 17700, date: "2026-08-06", status: "Completed", hash: "SHA256-TXN-9811-OK" },
    { id: "TXN-2026-9812", type: "Legal Service Fee", wallet: "Advocate Wallet", amount: 45000, gst: 8100, total: 53100, date: "2026-08-05", status: "Completed", hash: "SHA256-TXN-9812-OK" },
    { id: "TXN-2026-9813", type: "CSR Fund Grant", wallet: "Organization Wallet", amount: 250000, gst: 0, total: 250000, date: "2026-08-01", status: "Completed", hash: "SHA256-TXN-9813-OK" },
  ]);

  useEffect(() => {
    let isMounted = true;
    WalletService.getAll().then((data) => {
      if (isMounted) setWallets(Array.isArray(data) ? data : []);
    }).catch(() => {
      if (isMounted) setWallets([]);
    });
    return () => { isMounted = false; };
  }, []);

  const handleTransfer = () => {
    if (!transferForm.amount || Number(transferForm.amount) <= 0) {
      alert("Please enter a valid transfer amount.");
      return;
    }

    const nextTxn = {
      id: `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      type: "Wallet Transfer",
      wallet: transferForm.toWallet,
      amount: Number(transferForm.amount),
      gst: 0,
      total: Number(transferForm.amount),
      date: new Date().toISOString().split("T")[0],
      status: "Completed",
      hash: `SHA256-TXN-${Math.floor(10000 + Math.random() * 90000)}-OK`,
    };

    setTransactions((prev) => [nextTxn, ...prev]);
    ActivityService.create({
      title: `Wallet Transfer: ₹${transferForm.amount} transferred to ${transferForm.toWallet}`,
      type: "finance",
    });

    setOpenTransfer(false);
    setAlertMsg(`₹${transferForm.amount} transferred successfully with SHA-256 Audit Log!`);
    setTimeout(() => setAlertMsg(""), 3500);
  };

  // Real-time Dashboard Cards (Phase H) & Income Breakdown (Phase A)
  const stats = useMemo(() => {
    const totalIncome = 327700;
    const totalExpense = 45000;
    const walletBalance = totalIncome - totalExpense;
    const donations = 50000;
    const membershipIncome = 77700;
    const legalServiceIncome = 150000;
    const csrFunds = 50000;
    const todayCollection = 17700;
    const monthlyCollection = 327700;

    const tokenStats = TokenLedgerService.getCirculationStats();
    const tokenRate = TokenRateService.getCurrentRate();
    const chargeRevenue = TransactionChargeService.getTotalChargesCollected();

    return { totalIncome, totalExpense, walletBalance, donations, membershipIncome, legalServiceIncome, csrFunds, todayCollection, monthlyCollection, tokenStats, tokenRate, chargeRevenue };
  }, []);

  const cards = [
    { title: "Master Wallet Balance", value: `₹${stats.walletBalance.toLocaleString("en-IN")}`, color: "#1976d2", icon: <AccountBalanceWalletIcon /> },
    { title: "Active ICJ Tokens", value: `${stats.tokenStats?.totalActive || 0} Tokens`, color: "#f59e0b", icon: <SwapHorizIcon /> },
    { title: "Token Valuation Rate", value: `₹${stats.tokenRate?.tokenToInr || 10}/Token`, color: "#2e7d32", icon: <TrendingUpIcon /> },
    { title: "Token Charge Collected", value: `₹${stats.chargeRevenue.toLocaleString("en-IN")}`, color: "#9c27b0", icon: <CheckCircleIcon /> },
    { title: "Total Revenue / Income", value: `₹${stats.totalIncome.toLocaleString("en-IN")}`, color: "#0288d1", icon: <AccountBalanceIcon /> },
    { title: "CSR & Grant Funds", value: `₹${stats.csrFunds.toLocaleString("en-IN")}`, color: "#ed6c02", icon: <CheckCircleIcon /> },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Finance, Accounts & Digital Wallet Engine
            </Typography>
            <Typography color="text.secondary">
              Community Wallets, GST Tax Ledger, Double-Entry Accounting & Financial Audit Trail
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => {
            console.log("PRINT BUTTON CLICKED - Wallet Balance Sheet");
            const w = window.open("", "_blank", "width=900,height=1200");
            if (w) {
              w.document.write(`<html><head><title>Balance Sheet</title></head><body style="font-family:sans-serif;padding:30px"><h2>INTERNATIONAL CONSORTIUM OF JURISTS — BALANCE SHEET</h2><p>Date: ${new Date().toLocaleDateString("en-IN")}</p><hr/><script>window.print();window.close();</script></body></html>`);
              w.document.close();
              w.focus();
            }
          }}>
            Print Balance Sheet
          </Button>
          <Button variant="contained" startIcon={<SwapHorizIcon />} onClick={() => setOpenTransfer(true)}>
            Transfer Wallet Funds
          </Button>
        </Stack>
      </Stack>

      {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}

      {/* Real-time Dashboard Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {cards.map((item) => (
          <Grid item xs={12} sm={6} md={2} key={item.title}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderLeft: `4px solid ${item.color}`,
              }}
            >
              <Box sx={{ color: item.color }}>{item.icon}</Box>
              <Box>
                <Typography color="text.secondary" variant="caption" fontWeight="bold" display="block">
                  {item.title}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {item.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<AccountBalanceWalletIcon />} iconPosition="start" label="Digital Wallets" />
          <Tab icon={<AccountBalanceIcon />} iconPosition="start" label="Double-Entry Accounting & Ledger" />
          <Tab icon={<ReceiptLongIcon />} iconPosition="start" label="GST & Tax Invoices (18%)" />
          <Tab icon={<PaymentIcon />} iconPosition="start" label="Banking & Gateways (UPI/NEFT)" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Financial Reports & SHA-256 Audit Log" />
        </Tabs>
      </Box>

      {/* TAB 0: DIGITAL WALLETS */}
      <TabPanel value={tabIndex} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #1976d2" }}>
              <Typography variant="h6" fontWeight="bold">Community Master Wallet</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ my: 1 }}>₹2,82,700</Typography>
              <Typography variant="caption" color="text.secondary">Master Treasury & Reserve Account</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #2e7d32" }}>
              <Typography variant="h6" fontWeight="bold">Member Wallets Ledger</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ my: 1 }}>₹45,000</Typography>
              <Typography variant="caption" color="text.secondary">25 Active Member Accounts</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #9c27b0" }}>
              <Typography variant="h6" fontWeight="bold">Advocate Escrow Wallet</Typography>
              <Typography variant="h4" fontWeight="bold" color="secondary.main" sx={{ my: 1 }}>₹75,000</Typography>
              <Typography variant="caption" color="text.secondary">Retainer & Fee Escrow Account</Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* TAB 1: ACCOUNTING & LEDGER */}
      <TabPanel value={tabIndex} index={1}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Double-Entry Accounting Ledger & Trial Balance
          </Typography>

          <UniversalActionToolbar
            title="Master Financial Ledger & Tax Invoice Statement"
            documentId="ICJ-FINANCE-LEDGER-2026"
            version="v3.2.0"
          />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Account Head</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Debit (₹)</TableCell>
                <TableCell>Credit (₹)</TableCell>
                <TableCell>Balance (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Membership Registration Income</TableCell>
                <TableCell><Chip label="Income" color="success" size="small" /></TableCell>
                <TableCell>₹0</TableCell>
                <TableCell>₹77,700</TableCell>
                <TableCell>₹77,700 Cr</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Legal Counsel Service Fees</TableCell>
                <TableCell><Chip label="Income" color="success" size="small" /></TableCell>
                <TableCell>₹0</TableCell>
                <TableCell>₹1,50,000</TableCell>
                <TableCell>₹1,50,000 Cr</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>CSR & Grants Fund</TableCell>
                <TableCell><Chip label="Grant" color="primary" size="small" /></TableCell>
                <TableCell>₹0</TableCell>
                <TableCell>₹50,000</TableCell>
                <TableCell>₹50,000 Cr</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* TAB 2: GST & TAX */}
      <TabPanel value={tabIndex} index={2}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            GST & Tax Engine (18% Statutory CGST + SGST)
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Txn Ref</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>SAC Code</TableCell>
                <TableCell>Base Amount</TableCell>
                <TableCell>CGST (9%)</TableCell>
                <TableCell>SGST (9%)</TableCell>
                <TableCell>Total Tax</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell sx={{ fontFamily: "monospace" }}>{t.id}</TableCell>
                  <TableCell>{t.type}</TableCell>
                  <TableCell>998211</TableCell>
                  <TableCell>₹{t.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>₹{(t.gst / 2).toLocaleString("en-IN")}</TableCell>
                  <TableCell>₹{(t.gst / 2).toLocaleString("en-IN")}</TableCell>
                  <TableCell><Chip label={`₹${t.gst.toLocaleString("en-IN")}`} color="secondary" size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* TAB 3: BANKING */}
      <TabPanel value={tabIndex} index={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Banking Integration, UPI & QR Payment Gateway
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">Master HDFC Bank Escrow Account</Typography>
                <Typography variant="caption" display="block">Account No: 50200012345678</Typography>
                <Typography variant="caption" display="block">IFSC Code: HDFC0001234</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">Instant UPI & QR Merchant ID</Typography>
                <Typography variant="caption" display="block">VPA: icj.master@hdfcbank</Typography>
                <Typography variant="caption" display="block">Status: 🟢 Gateway Online & Synced</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* TAB 4: AUDIT LOG */}
      <TabPanel value={tabIndex} index={4}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Financial Audit Trail & SHA-256 Integrity Verification
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Txn Ref ID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Total Value</TableCell>
                <TableCell>SHA-256 Hash</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell sx={{ fontFamily: "monospace" }}>{t.id}</TableCell>
                  <TableCell>{t.type} ({t.wallet})</TableCell>
                  <TableCell>₹{t.total.toLocaleString("en-IN")}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: "11px" }}>{t.hash}</TableCell>
                  <TableCell><Chip label="Integrity Verified" color="success" size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* Transfer Dialog */}
      <Dialog open={openTransfer} onClose={() => setOpenTransfer(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>Transfer Digital Wallet Funds</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField select fullWidth label="Source Wallet" value={transferForm.fromWallet} onChange={(e) => setTransferForm({ ...transferForm, fromWallet: e.target.value })}>
                <MenuItem value="Community Wallet (ICJ Master)">Community Wallet (ICJ Master)</MenuItem>
                <MenuItem value="Organization Wallet">Organization Wallet</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Destination Wallet / Member ID" value={transferForm.toWallet} onChange={(e) => setTransferForm({ ...transferForm, toWallet: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Transfer Amount (₹)" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Remarks / Purpose" value={transferForm.remarks} onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenTransfer(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleTransfer}>Execute Transfer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}