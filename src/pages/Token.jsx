import { useEffect, useState, useMemo } from "react";
import {
  Box, Grid, Paper, Typography, Stack, Chip, Divider, Button,
  Table, TableHead, TableBody, TableRow, TableCell, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, Snackbar, Tabs, Tab, Tooltip,
  Card, CardContent, IconButton, LinearProgress,
} from "@mui/material";

import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import GavelIcon from "@mui/icons-material/Gavel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import TimelineIcon from "@mui/icons-material/Timeline";

import TokenLedgerService, { TOKEN_TYPES, TOKEN_STATUS } from "../services/tokenLedgerService";
import TokenRateService from "../services/tokenRateService";
import TransactionChargeService from "../services/transactionChargeService";
import ConditionalTokenService, { CASE_TYPES, COURT_CITIES, TRIGGER_EVENTS } from "../services/conditionalTokenService";
import useAuth from "../hooks/useAuth";

// ─── Tab Panel ────────────────────────────────────────────────────────────────
function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2.5 }}>{children}</Box> : null;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = "#1e3a8a", sub = "" }) {
  return (
    <Card elevation={3} sx={{
      borderRadius: 3, background: `linear-gradient(135deg, ${color}15, ${color}08)`,
      border: `1px solid ${color}30`, height: "100%",
    }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
          <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>{icon}</Avatar>
          <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>{label}</Typography>
        </Stack>
        <Typography variant="h4" fontWeight="bold" color={color}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function Token() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "admin" || user?.role === "super_admin";

  const [tab, setTab] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [rates, setRates] = useState([]);
  const [currentRate, setCurrentRate] = useState(null);
  const [escrows, setEscrows] = useState([]);
  const [stats, setStats] = useState({});
  const [chargeStats, setChargeStats] = useState({});
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  // Dialogs
  const [mintOpen, setMintOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [escrowOpen, setEscrowOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);

  // Mint form
  const [mintForm, setMintForm] = useState({ toMemberId: "", amount: "", tokenType: TOKEN_TYPES.WORK_REWARD, description: "" });

  // Rate form
  const [rateForm, setRateForm] = useState({ tokenToInr: "", reason: "", serviceChargeRate: "" });

  // Escrow form
  const [escrowForm, setEscrowForm] = useState({
    issuedToMemberId: "", tokenAmount: "", cityCode: "LKO", caseType: "PROP",
    caseTitle: "", clientName: "", advocateName: "", triggerEvent: "CASE_RESOLVED",
    promisedPercentage: "", promisedCaseValue: "",
  });

  // Unlock form
  const [unlockForm, setUnlockForm] = useState({ caseRefCode: "", resolvedEventDetails: "" });

  const loadAll = () => {
    const l = TokenLedgerService.getAll();
    const r = TokenRateService.getRateHistory();
    const cr = TokenRateService.getCurrentRate();
    const e = ConditionalTokenService.getAll();
    const s = TokenLedgerService.getCirculationStats();
    const cs = TransactionChargeService.getStats();
    setLedger(l);
    setRates(r);
    setCurrentRate(cr);
    setEscrows(e);
    setStats(s);
    setChargeStats(cs);
  };

  useEffect(() => { loadAll(); }, []);

  const show = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  // ─── Mint Tokens ────────────────────────────────────────────────────────────
  const handleMint = () => {
    try {
      if (!mintForm.toMemberId || !mintForm.amount) { show("Member ID and amount required.", "error"); return; }
      TokenLedgerService.mint({
        toMemberId: mintForm.toMemberId,
        amount: parseInt(mintForm.amount, 10),
        tokenType: mintForm.tokenType,
        description: mintForm.description,
        issuedByAdminId: user?.member_id || user?.id,
        inrValueAtIssuance: currentRate?.tokenToInr || 10,
      });
      show(`✅ ${mintForm.amount} tokens minted for ${mintForm.toMemberId}!`);
      setMintOpen(false);
      setMintForm({ toMemberId: "", amount: "", tokenType: TOKEN_TYPES.WORK_REWARD, description: "" });
      loadAll();
    } catch (e) { show(e.message, "error"); }
  };

  // ─── Set Rate ───────────────────────────────────────────────────────────────
  const handleSetRate = () => {
    try {
      if (!rateForm.tokenToInr || !rateForm.reason) { show("Rate and reason required.", "error"); return; }
      TokenRateService.setRate({
        tokenToInr: parseFloat(rateForm.tokenToInr),
        reason: rateForm.reason,
        setByAdminId: user?.member_id || user?.id,
        serviceChargeRate: rateForm.serviceChargeRate ? parseFloat(rateForm.serviceChargeRate) / 100 : undefined,
      });
      show(`✅ New rate ₹${rateForm.tokenToInr}/Token set!`);
      setRateOpen(false);
      setRateForm({ tokenToInr: "", reason: "", serviceChargeRate: "" });
      loadAll();
    } catch (e) { show(e.message, "error"); }
  };

  // ─── Issue Escrow ───────────────────────────────────────────────────────────
  const handleEscrow = () => {
    try {
      if (!escrowForm.issuedToMemberId || !escrowForm.tokenAmount || !escrowForm.caseTitle) {
        show("Member ID, token amount, and case title are required.", "error"); return;
      }
      const record = ConditionalTokenService.issue({
        ...escrowForm,
        tokenAmount: parseInt(escrowForm.tokenAmount, 10),
        promisedPercentage: escrowForm.promisedPercentage ? parseFloat(escrowForm.promisedPercentage) : null,
        promisedCaseValue: escrowForm.promisedCaseValue ? parseFloat(escrowForm.promisedCaseValue) : null,
        issuedByAdminId: user?.member_id || user?.id,
      });
      show(`✅ ${escrowForm.tokenAmount} LOCKED tokens issued! Case Ref: ${record.caseRefCode}`);
      setEscrowOpen(false);
      setEscrowForm({ issuedToMemberId: "", tokenAmount: "", cityCode: "LKO", caseType: "PROP", caseTitle: "", clientName: "", advocateName: "", triggerEvent: "CASE_RESOLVED", promisedPercentage: "", promisedCaseValue: "" });
      loadAll();
    } catch (e) { show(e.message, "error"); }
  };

  // ─── Unlock Escrow ──────────────────────────────────────────────────────────
  const handleUnlock = () => {
    try {
      if (!unlockForm.caseRefCode) { show("Case Reference Code required.", "error"); return; }
      const result = ConditionalTokenService.resolve({
        caseRefCode: unlockForm.caseRefCode,
        resolvedByAdminId: user?.member_id || user?.id,
        resolvedEventDetails: unlockForm.resolvedEventDetails,
      });
      show(`✅ ${result.unlockedCount} tokens UNLOCKED for case ${unlockForm.caseRefCode}!`);
      setUnlockOpen(false);
      setUnlockForm({ caseRefCode: "", resolvedEventDetails: "" });
      loadAll();
    } catch (e) { show(e.message, "error"); }
  };

  const tokenTypeColor = (type) => ({
    [TOKEN_TYPES.WELCOME_DEMO]: "#10b981",
    [TOKEN_TYPES.WORK_REWARD]: "#3b82f6",
    [TOKEN_TYPES.CAMPAIGN_EARN]: "#f59e0b",
    [TOKEN_TYPES.DONOR_GRANT]: "#8b5cf6",
    [TOKEN_TYPES.CONDITIONAL_ESCROW]: "#ef4444",
    [TOKEN_TYPES.TRANSFER]: "#6366f1",
    [TOKEN_TYPES.CHARGE]: "#64748b",
  }[type] || "#94a3b8");

  const statusColor = (st) => ({
    [TOKEN_STATUS.ACTIVE]: "success",
    [TOKEN_STATUS.LOCKED]: "error",
    [TOKEN_STATUS.REDEEMED]: "default",
    [TOKEN_STATUS.TREASURY]: "warning",
    [TOKEN_STATUS.PENDING]: "info",
  }[st] || "default");

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, minWidth: 0 }}>
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <Paper elevation={6} sx={{
        p: 3, mb: 3, borderRadius: 3,
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #7c3aed 100%)",
        color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2,
        boxShadow: "0 10px 30px -5px rgba(30,58,138,0.5)",
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: "#f59e0b", width: 56, height: 56, boxShadow: "0 4px 14px rgba(0,0,0,0.3)" }}>
            <MonetizationOnIcon sx={{ fontSize: 34 }} />
          </Avatar>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4" fontWeight="bold">ICJ Token Ledger</Typography>
              <Chip label="ADMIN CONTROL" size="small" sx={{ bgcolor: "#f59e0b", color: "#0f172a", fontWeight: "bold" }} />
            </Stack>
            <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
              Serial Token Engine · Dynamic Rate · Event-Locked Escrow · Indian Law Compliant
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
          <Chip icon={<CheckCircleIcon sx={{ color: "#34d399 !important" }} />}
            label={`Current Rate: ₹${currentRate?.tokenToInr || 10}/Token`}
            sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff", fontWeight: "bold", py: 2.5, px: 1, borderRadius: 2 }} />
          <Chip icon={<CheckCircleIcon sx={{ color: "#34d399 !important" }} />}
            label={`Service Charge: ${((currentRate?.serviceChargeRate || 0.2) * 100).toFixed(0)}%`}
            sx={{ bgcolor: "rgba(255,255,255,0.12)", color: "#fff", fontWeight: "bold", py: 2.5, px: 1, borderRadius: 2 }} />
        </Stack>
      </Paper>

      {/* ── Indian Law Compliance Strip ─────────────────────────────────────── */}
      <Paper sx={{ p: 1.5, mb: 3, borderRadius: 2, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
        <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
          <GavelIcon sx={{ color: "#059669", fontSize: 20 }} />
          <Typography variant="caption" fontWeight={600} color="#059669">Indian Law Compliant:</Typography>
          {["NOT a Security (SEBI Exempt)", "NOT Cryptocurrency (RBI Exempt)", "GST Exempt — Notif. 12/2017", "Indian Trusts Act 1882", "IT Act Sec 11/12 — Tax Exempt", "80G Eligible Contributions"].map((l) => (
            <Chip key={l} label={l} size="small" sx={{ bgcolor: "#dcfce7", color: "#065f46", fontWeight: 600, fontSize: 10 }} />
          ))}
        </Stack>
      </Paper>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Total Minted" value={stats.totalMinted || 0} icon={<MonetizationOnIcon fontSize="small" />} color="#1e3a8a" sub="All time" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Active" value={stats.totalActive || 0} icon={<CheckCircleIcon fontSize="small" />} color="#059669" sub="In circulation" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Locked Escrow" value={stats.totalLocked || 0} icon={<LockIcon fontSize="small" />} color="#dc2626" sub="Event-linked" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Redeemed" value={stats.totalRedeemed || 0} icon={<ReceiptLongIcon fontSize="small" />} color="#7c3aed" sub="To Treasury" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Treasury" value={stats.totalInTreasury || 0} icon={<AccountBalanceIcon fontSize="small" />} color="#d97706" sub="Ready to re-issue" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label="Charges Collected" value={`₹${(chargeStats.totalInrCollected || 0).toLocaleString("en-IN")}`} icon={<TrendingUpIcon fontSize="small" />} color="#0891b2" sub="Trust revenue" />
        </Grid>
      </Grid>

      {/* ── Admin Action Buttons ─────────────────────────────────────────────── */}
      {isSuperAdmin && (
        <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" gap={1}>
          <Button variant="contained" startIcon={<AddCircleIcon />}
            onClick={() => setMintOpen(true)}
            sx={{ bgcolor: "#1e3a8a", "&:hover": { bgcolor: "#1e40af" }, borderRadius: 2, fontWeight: "bold" }}>
            Mint Tokens
          </Button>
          <Button variant="contained" startIcon={<LockIcon />}
            onClick={() => setEscrowOpen(true)}
            sx={{ bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" }, borderRadius: 2, fontWeight: "bold" }}>
            Issue Escrow (Event-Locked)
          </Button>
          <Button variant="contained" startIcon={<LockOpenIcon />}
            onClick={() => setUnlockOpen(true)}
            sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#047857" }, borderRadius: 2, fontWeight: "bold" }}>
            Unlock Escrow (Case Resolved)
          </Button>
          <Button variant="outlined" startIcon={<SettingsIcon />}
            onClick={() => setRateOpen(true)}
            sx={{ borderColor: "#f59e0b", color: "#f59e0b", "&:hover": { borderColor: "#d97706", bgcolor: "#fef3c720" }, borderRadius: 2, fontWeight: "bold" }}>
            Update Token Rate
          </Button>
        </Stack>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable"
          sx={{ bgcolor: "#0f172a", "& .MuiTab-root": { color: "#94a3b8", fontWeight: 600 }, "& .Mui-selected": { color: "#f59e0b !important" }, "& .MuiTabs-indicator": { bgcolor: "#f59e0b" } }}>
          <Tab label="📋 Token Ledger" />
          <Tab label="🔒 Escrow Registry" />
          <Tab label="📈 Rate History" />
          <Tab label="💰 Charge Log" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {/* ── TAB 0: Token Ledger ─────────────────────────────────────────── */}
          <TabPanel value={tab} index={0}>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    {["Serial ID", "Type", "Status", "Amount", "Current Holder", "Case Ref", "INR Value", "Date"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: "#1e3a8a", whiteSpace: "nowrap" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledger.length === 0 ? (
                    <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: "#94a3b8" }}>No tokens minted yet. Use "Mint Tokens" to issue the first batch.</TableCell></TableRow>
                  ) : ledger.slice(0, 100).map((e) => (
                    <TableRow key={e.id} hover sx={{ "&:hover": { bgcolor: "#f0f9ff" } }}>
                      <TableCell sx={{ fontFamily: "monospace", color: "#1e3a8a", fontWeight: 600, whiteSpace: "nowrap" }}>{e.tokenSerial}</TableCell>
                      <TableCell>
                        <Chip label={e.tokenType?.replace(/_/g, " ")} size="small"
                          sx={{ bgcolor: `${tokenTypeColor(e.tokenType)}20`, color: tokenTypeColor(e.tokenType), fontWeight: 600, fontSize: 10 }} />
                      </TableCell>
                      <TableCell><Chip label={e.status} size="small" color={statusColor(e.status)} /></TableCell>
                      <TableCell align="center"><Chip label={e.amount} size="small" sx={{ bgcolor: "#1e3a8a", color: "#fff", fontWeight: "bold" }} /></TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: 11 }}>{e.currentHolder}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: 11, color: "#dc2626" }}>{e.caseRefCode || "—"}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>₹{(e.inrValueAtIssuance || 0).toFixed(2)}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap", fontSize: 11 }}>{e.date || new Date(e.timestamp).toLocaleDateString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {ledger.length > 100 && (
                <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: "block" }}>
                  Showing 100 of {ledger.length} entries.
                </Typography>
              )}
            </Box>
          </TabPanel>

          {/* ── TAB 1: Escrow Registry ──────────────────────────────────────── */}
          <TabPanel value={tab} index={1}>
            {escrows.length === 0 ? (
              <Alert severity="info" icon={<LockIcon />}>No Event-Locked Escrow Tokens issued yet. Use "Issue Escrow" to create case-linked locked tokens.</Alert>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#fef2f2" }}>
                      {["Case Ref Code", "Case Title", "Advocate", "Tokens", "INR Value", "Trigger Event", "Status", "Issued"].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, color: "#dc2626", whiteSpace: "nowrap" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {escrows.map((e) => (
                      <TableRow key={e.id} hover>
                        <TableCell sx={{ fontFamily: "monospace", fontWeight: 700, color: "#dc2626", whiteSpace: "nowrap" }}>{e.caseRefCode}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.caseTitle}</TableCell>
                        <TableCell sx={{ fontSize: 11 }}>{e.advocateName}</TableCell>
                        <TableCell align="center"><Chip label={e.tokenAmount} sx={{ bgcolor: "#dc2626", color: "#fff", fontWeight: "bold" }} size="small" /></TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>₹{e.inrValueAtIssuance?.toLocaleString("en-IN")}</TableCell>
                        <TableCell><Chip label={e.triggerEvent?.replace(/_/g, " ")} size="small" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600, fontSize: 10 }} /></TableCell>
                        <TableCell>
                          <Chip label={e.status} size="small"
                            color={e.status === TOKEN_STATUS.LOCKED ? "error" : e.status === TOKEN_STATUS.ACTIVE ? "success" : "default"}
                            icon={e.status === TOKEN_STATUS.LOCKED ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 11, whiteSpace: "nowrap" }}>{new Date(e.issuedAt).toLocaleDateString("en-IN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </TabPanel>

          {/* ── TAB 2: Rate History ─────────────────────────────────────────── */}
          <TabPanel value={tab} index={2}>
            {rates.length === 0 ? (
              <Alert severity="info">No rate history found. Default rate is ₹10/Token.</Alert>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#fefce8" }}>
                      {["Rate ID", "1 Token =", "Service Charge %", "Effective Date", "Status", "Set By", "Reason"].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, color: "#92400e", whiteSpace: "nowrap" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rates.map((r) => (
                      <TableRow key={r.rateId} hover sx={{ bgcolor: r.status === "ACTIVE" ? "#fefce8" : "transparent" }}>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 11 }}>{r.rateId}</TableCell>
                        <TableCell>
                          <Chip label={`₹${r.tokenToInr}`} sx={{ bgcolor: r.status === "ACTIVE" ? "#f59e0b" : "#e2e8f0", color: r.status === "ACTIVE" ? "#0f172a" : "#64748b", fontWeight: "bold" }} />
                        </TableCell>
                        <TableCell align="center">{((r.serviceChargeRate || 0.2) * 100).toFixed(0)}%</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{r.effectiveDate}</TableCell>
                        <TableCell>
                          <Chip label={r.status} size="small"
                            color={r.status === "ACTIVE" ? "warning" : r.status === "SCHEDULED" ? "info" : "default"} />
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 11 }}>{r.setByAdminId}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </TabPanel>

          {/* ── TAB 3: Charge Log ───────────────────────────────────────────── */}
          <TabPanel value={tab} index={3}>
            <Stack direction="row" spacing={2} mb={2} flexWrap="wrap" gap={1}>
              <Chip label={`Total INR Collected: ₹${(chargeStats.totalInrCollected || 0).toLocaleString("en-IN")}`} sx={{ bgcolor: "#0f172a", color: "#fff", fontWeight: "bold" }} />
              <Chip label={`Total Transactions: ${chargeStats.totalCharges || 0}`} sx={{ bgcolor: "#1e3a8a", color: "#fff", fontWeight: "bold" }} />
              <Chip label="GST: Exempt (Charitable Trust)" sx={{ bgcolor: "#dcfce7", color: "#065f46", fontWeight: 600 }} icon={<CheckCircleIcon sx={{ color: "#059669 !important" }} />} />
              <Chip label="TDS: Evaluated per Sec 194A" sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600 }} icon={<InfoIcon sx={{ color: "#d97706 !important" }} />} />
            </Stack>
            <Alert severity="success" sx={{ mb: 2 }}>
              All service charges collected are voluntary contributions to ICJ Trust — eligible for 80G deduction under Income Tax Act 1961.
            </Alert>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              Service charge log will appear here once token transactions are processed.
            </Typography>
          </TabPanel>
        </Box>
      </Paper>

      {/* ══════════════════════════ DIALOGS ════════════════════════════════════ */}

      {/* Mint Dialog */}
      <Dialog open={mintOpen} onClose={() => setMintOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1e3a8a", color: "#fff" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AddCircleIcon /> <span>Mint New Tokens</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info" icon={<GavelIcon />}>
              Only Super Admin can mint tokens. All minting is recorded in the immutable ledger. Tokens are issued as charitable trust utility credits — NOT financial instruments.
            </Alert>
            <TextField fullWidth label="Recipient Member ID" value={mintForm.toMemberId} onChange={(e) => setMintForm((p) => ({ ...p, toMemberId: e.target.value }))} placeholder="e.g. ICJ-2026-MEM-0001" />
            <TextField fullWidth type="number" label="Number of Tokens to Mint" value={mintForm.amount} onChange={(e) => setMintForm((p) => ({ ...p, amount: e.target.value }))} />
            <TextField fullWidth select label="Token Type" value={mintForm.tokenType} onChange={(e) => setMintForm((p) => ({ ...p, tokenType: e.target.value }))}>
              {Object.entries(TOKEN_TYPES).filter(([, v]) => ["WORK_REWARD", "CAMPAIGN_EARN", "DONOR_GRANT", "WELCOME_DEMO"].includes(v)).map(([k, v]) => (
                <MenuItem key={k} value={v}>{v.replace(/_/g, " ")}</MenuItem>
              ))}
            </TextField>
            <TextField fullWidth multiline rows={2} label="Description / Reason" value={mintForm.description} onChange={(e) => setMintForm((p) => ({ ...p, description: e.target.value }))} placeholder="e.g. Pro-bono work on Property Case #LKO-2026-042" />
            {mintForm.amount && currentRate && (
              <Paper sx={{ p: 2, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} color="#059669">
                  INR Value at Current Rate: ₹{(parseInt(mintForm.amount || 0) * (currentRate.tokenToInr || 10)).toLocaleString("en-IN")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Rate: ₹{currentRate.tokenToInr}/Token — This value is locked in the ledger at time of minting.
                </Typography>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMintOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleMint} sx={{ bgcolor: "#1e3a8a" }}>Mint Tokens</Button>
        </DialogActions>
      </Dialog>

      {/* Set Rate Dialog */}
      <Dialog open={rateOpen} onClose={() => setRateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#92400e", color: "#fff" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SettingsIcon /> <span>Update Token Rate</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="warning">
              Changing the rate affects ALL existing tokens immediately. 24-hour advance notice is recommended for members. Current rate: ₹{currentRate?.tokenToInr || 10}/Token
            </Alert>
            <TextField fullWidth type="number" label="New Rate: 1 ICJ Token = ₹" value={rateForm.tokenToInr} onChange={(e) => setRateForm((p) => ({ ...p, tokenToInr: e.target.value }))} placeholder="e.g. 12" />
            <TextField fullWidth type="number" label="Service Charge Rate (%)" value={rateForm.serviceChargeRate} onChange={(e) => setRateForm((p) => ({ ...p, serviceChargeRate: e.target.value }))} placeholder="e.g. 20 (leave blank to keep current)" helperText="Default: 20%. This is the charge on all token transactions." />
            <TextField fullWidth multiline rows={2} label="Reason for Rate Change *" value={rateForm.reason} onChange={(e) => setRateForm((p) => ({ ...p, reason: e.target.value }))} placeholder="e.g. September 2026 revised valuation based on trust growth" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSetRate} sx={{ bgcolor: "#92400e" }}>Set New Rate</Button>
        </DialogActions>
      </Dialog>

      {/* Escrow Dialog */}
      <Dialog open={escrowOpen} onClose={() => setEscrowOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#dc2626", color: "#fff" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LockIcon /> <span>Issue Event-Locked Escrow Tokens</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="info" icon={<GavelIcon />}>
              Escrow tokens are LOCKED until the trigger event is marked resolved. Legal basis: Indian Contract Act 1872, Section 31 (Contingent Contract).
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Advocate / Recipient Member ID" value={escrowForm.issuedToMemberId} onChange={(e) => setEscrowForm((p) => ({ ...p, issuedToMemberId: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Number of Tokens (LOCKED)" value={escrowForm.tokenAmount} onChange={(e) => setEscrowForm((p) => ({ ...p, tokenAmount: e.target.value }))} /></Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth select label="Court City" value={escrowForm.cityCode} onChange={(e) => setEscrowForm((p) => ({ ...p, cityCode: e.target.value }))}>
                  {Object.entries(COURT_CITIES).map(([k, v]) => <MenuItem key={k} value={k}>{k} — {v}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField fullWidth select label="Case Type" value={escrowForm.caseType} onChange={(e) => setEscrowForm((p) => ({ ...p, caseType: e.target.value }))}>
                  {Object.entries(CASE_TYPES).map(([k]) => <MenuItem key={k} value={k}>{k}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth select label="Trigger Event (Unlock On)" value={escrowForm.triggerEvent} onChange={(e) => setEscrowForm((p) => ({ ...p, triggerEvent: e.target.value }))}>
                  {Object.entries(TRIGGER_EVENTS).map(([k, v]) => <MenuItem key={k} value={v}>{v.replace(/_/g, " ")}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}><TextField fullWidth label="Case Title / Description" value={escrowForm.caseTitle} onChange={(e) => setEscrowForm((p) => ({ ...p, caseTitle: e.target.value }))} placeholder="e.g. Property Dispute — Ramlal vs State (Lucknow)" /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Client Name" value={escrowForm.clientName} onChange={(e) => setEscrowForm((p) => ({ ...p, clientName: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Advocate Name" value={escrowForm.advocateName} onChange={(e) => setEscrowForm((p) => ({ ...p, advocateName: e.target.value }))} /></Grid>
              <Grid item xs={6}><TextField fullWidth type="number" label="Promised % of Case Value (optional)" value={escrowForm.promisedPercentage} onChange={(e) => setEscrowForm((p) => ({ ...p, promisedPercentage: e.target.value }))} placeholder="e.g. 10" /></Grid>
              <Grid item xs={6}><TextField fullWidth type="number" label="Case Value in ₹ (optional)" value={escrowForm.promisedCaseValue} onChange={(e) => setEscrowForm((p) => ({ ...p, promisedCaseValue: e.target.value }))} placeholder="e.g. 5000000" /></Grid>
            </Grid>
            {escrowForm.tokenAmount && currentRate && (
              <Paper sx={{ p: 2, bgcolor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} color="#dc2626">
                  🔒 {escrowForm.tokenAmount} Tokens will be LOCKED · INR Value: ₹{(parseInt(escrowForm.tokenAmount || 0) * (currentRate.tokenToInr || 10)).toLocaleString("en-IN")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Case Code will be auto-generated: {escrowForm.cityCode}-{escrowForm.caseType}-{new Date().getFullYear()}-XXXX
                </Typography>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEscrowOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEscrow} sx={{ bgcolor: "#dc2626" }}>Issue Locked Tokens</Button>
        </DialogActions>
      </Dialog>

      {/* Unlock Dialog */}
      <Dialog open={unlockOpen} onClose={() => setUnlockOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#059669", color: "#fff" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <LockOpenIcon /> <span>Unlock Escrow — Case Resolved</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Alert severity="success">
              Unlocking releases all LOCKED tokens for this case. Advocate/holder will be notified and can choose Cash Redemption, Service Redemption, Donation, or Hold.
            </Alert>
            <TextField fullWidth label="Case Reference Code" value={unlockForm.caseRefCode} onChange={(e) => setUnlockForm((p) => ({ ...p, caseRefCode: e.target.value }))} placeholder="e.g. LKO-PROP-2026-0001" />
            <TextField fullWidth multiline rows={2} label="Resolution Details" value={unlockForm.resolvedEventDetails} onChange={(e) => setUnlockForm((p) => ({ ...p, resolvedEventDetails: e.target.value }))} placeholder="e.g. Hon. District Court Lucknow — Order dated 09/08/2026 — Property transferred to client" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUnlockOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUnlock} sx={{ bgcolor: "#059669" }}>Unlock Tokens ✅</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
