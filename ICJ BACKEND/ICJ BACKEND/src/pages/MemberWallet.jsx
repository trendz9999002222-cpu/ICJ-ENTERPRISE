import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Alert,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LockIcon from "@mui/icons-material/Lock";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GavelIcon from "@mui/icons-material/Gavel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Link } from "react-router-dom";

import { MemberService } from "../services/memberService";
import TokenLedgerService, { TOKEN_STATUS } from "../services/tokenLedgerService";
import TokenRateService from "../services/tokenRateService";
import ConditionalTokenService from "../services/conditionalTokenService";

export default function MemberWallet() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [currentRate, setCurrentRate] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const list = await MemberService.getAll();
        const memberList = Array.isArray(list) ? list : [];
        setMembers(memberList);
        if (memberList.length > 0 && !selectedMember) {
          const firstKey = memberList[0].members || memberList[0].member_id || memberList[0].id || memberList[0].uuid;
          setSelectedMember(firstKey);
        }
        const rate = TokenRateService.getCurrentRate();
        setCurrentRate(rate);
      } catch (error) {
        console.error("Failed to load members or token rate", error);
      }
    };
    loadData();
  }, []);

  const currentMember = useMemo(() => {
    return members.find((member) => {
      const id = member.members || member.member_id || member.id || member.uuid;
      return id === selectedMember;
    });
  }, [members, selectedMember]);

  const memberIdCode = useMemo(() => {
    if (!currentMember) return "";
    return currentMember.member_id || currentMember.memberId || currentMember.members || currentMember.id;
  }, [currentMember]);

  // Real-time Token Data calculation for selected member
  const memberTokenEntries = useMemo(() => {
    if (!memberIdCode) return [];
    return TokenLedgerService.getForMember(memberIdCode);
  }, [memberIdCode]);

  const activeTokenCount = useMemo(() => {
    if (!memberIdCode) return Number(currentMember?.token_balance || 0);
    const ledgerBal = TokenLedgerService.getMemberBalance(memberIdCode);
    return ledgerBal > 0 ? ledgerBal : Number(currentMember?.token_balance || 0);
  }, [memberIdCode, currentMember]);

  const lockedTokenEntries = useMemo(() => {
    if (!memberIdCode) return [];
    return ConditionalTokenService.getForMember(memberIdCode);
  }, [memberIdCode]);

  const lockedTokenCount = useMemo(() => {
    return lockedTokenEntries
      .filter((e) => e.status === TOKEN_STATUS.LOCKED)
      .reduce((sum, e) => sum + (e.tokenAmount || 0), 0);
  }, [lockedTokenEntries]);

  const walletBalanceInr = Number(currentMember?.wallet_balance || 0);
  const ratePerToken = currentRate?.tokenToInr || 10;
  const tokenValuationInr = activeTokenCount * ratePerToken;
  const totalCombinedWorthInr = walletBalanceInr + tokenValuationInr;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Banner */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #7c3aed 100%)",
          color: "#fff",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: "#f59e0b", width: 56, height: 56 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Member Digital Wallet & Token Vault
              </Typography>
              <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                Multi-Asset Wallet — Cash Balance + ICJ Barter Tokens + Escrow Locked Tokens
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              icon={<TrendingUpIcon sx={{ color: "#34d399 !important" }} />}
              label={`Live Rate: ₹${ratePerToken}/Token`}
              sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: "bold", py: 2 }}
            />
            <Button
              component={Link}
              to="/token-exchange"
              variant="contained"
              sx={{ bgcolor: "#f59e0b", color: "#0f172a", fontWeight: "bold", "&:hover": { bgcolor: "#d97706" } }}
              startIcon={<SwapHorizIcon />}
            >
              Token Exchange
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Member Selector & Summary Grid */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="#1e3a8a">
              👤 Select Member Profile
            </Typography>

            <TextField
              fullWidth
              select
              label="Select Member"
              value={selectedMember}
              onChange={(event) => setSelectedMember(event.target.value)}
              helperText="Choose a member to inspect their live Wallet & Token vault"
              sx={{ mb: 2 }}
            >
              {members.map((member) => {
                const key = member.members || member.member_id || member.id || member.uuid;
                const code = member.member_id || key;
                return (
                  <MenuItem key={key} value={key}>
                    {`${member.name || "Member"} (${code})`}
                  </MenuItem>
                );
              })}
            </TextField>

            {currentMember && (
              <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                  {currentMember.name || "ICJ Member"}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Member ID: <strong>{memberIdCode}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Type: {currentMember.member_type || currentMember.memberType || "Individual"}
                </Typography>
                <Chip
                  label="Status: Active"
                  size="small"
                  color="success"
                  sx={{ mt: 1, fontWeight: "bold" }}
                />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Balance Overview Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {/* Cash Balance */}
            <Grid item xs={12} sm={6}>
              <Card elevation={3} sx={{ borderRadius: 3, borderLeft: "6px solid #1e3a8a", height: "100%" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography color="text.secondary" variant="body2" fontWeight="bold" textTransform="uppercase">
                      💵 Cash Wallet Balance
                    </Typography>
                    <Avatar sx={{ bgcolor: "#1e3a8a15", color: "#1e3a8a", width: 40, height: 40 }}>
                      <AccountBalanceWalletIcon />
                    </Avatar>
                  </Stack>
                  <Typography variant="h4" fontWeight="bold" color="#1e3a8a">
                    {`₹${walletBalanceInr.toLocaleString("en-IN")}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Direct INR Wallet funds
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Active ICJ Tokens */}
            <Grid item xs={12} sm={6}>
              <Card elevation={3} sx={{ borderRadius: 3, borderLeft: "6px solid #f59e0b", height: "100%" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography color="text.secondary" variant="body2" fontWeight="bold" textTransform="uppercase">
                      🪙 Active ICJ Tokens
                    </Typography>
                    <Avatar sx={{ bgcolor: "#f59e0b15", color: "#f59e0b", width: 40, height: 40 }}>
                      <MonetizationOnIcon />
                    </Avatar>
                  </Stack>
                  <Typography variant="h4" fontWeight="bold" color="#d97706">
                    {`${activeTokenCount.toLocaleString("en-IN")} Tokens`}
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" color="#059669">
                    ≈ ₹{tokenValuationInr.toLocaleString("en-IN")} (at ₹{ratePerToken}/Token)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Escrow Locked Tokens */}
            <Grid item xs={12} sm={6}>
              <Card elevation={3} sx={{ borderRadius: 3, borderLeft: "6px solid #dc2626", height: "100%" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography color="text.secondary" variant="body2" fontWeight="bold" textTransform="uppercase">
                      🔒 Escrow Locked Tokens
                    </Typography>
                    <Avatar sx={{ bgcolor: "#dc262615", color: "#dc2626", width: 40, height: 40 }}>
                      <LockIcon />
                    </Avatar>
                  </Stack>
                  <Typography variant="h4" fontWeight="bold" color="#dc2626">
                    {`${lockedTokenCount.toLocaleString("en-IN")} Tokens`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Event/Case resolution pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Estimated Worth */}
            <Grid item xs={12} sm={6}>
              <Card elevation={3} sx={{ borderRadius: 3, borderLeft: "6px solid #10b981", height: "100%", bgcolor: "#f0fdf4" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography color="#065f46" variant="body2" fontWeight="bold" textTransform="uppercase">
                      💎 Total Asset Valuation
                    </Typography>
                    <Avatar sx={{ bgcolor: "#10b98120", color: "#10b981", width: 40, height: 40 }}>
                      <CheckCircleIcon />
                    </Avatar>
                  </Stack>
                  <Typography variant="h4" fontWeight="bold" color="#047857">
                    {`₹${totalCombinedWorthInr.toLocaleString("en-IN")}`}
                  </Typography>
                  <Typography variant="caption" color="#065f46">
                    Cash + Active Token INR Valuation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Token Ledger Custody Audit Table for Selected Member */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Typography variant="h6" fontWeight="bold" color="#0f172a">
            📜 Member Token Custody & Serial Ledger
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`${memberTokenEntries.length} Token Records`} sx={{ bgcolor: "#ede9fe", color: "#4c1d95", fontWeight: 700 }} />
            <Chip label="Indian Trusts Act 1882 Compliant" color="success" size="small" />
          </Stack>
        </Stack>

        {memberTokenEntries.length === 0 ? (
          <Alert severity="info" icon={<GavelIcon />}>
            No ICJ Tokens issued to this member yet. Admin can mint or assign work tokens via the Token Ledger Dashboard.
          </Alert>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  {["Token Serial", "Type", "Status", "Amount", "Case Ref Code", "INR Value", "Issued Date", "Legal Nature"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "#1e3a8a", whiteSpace: "nowrap" }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {memberTokenEntries.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", color: "#1e3a8a", fontWeight: 700 }}>
                      {e.tokenSerial}
                    </TableCell>
                    <TableCell>
                      <Chip label={e.tokenType?.replace(/_/g, " ")} size="small" sx={{ bgcolor: "#ede9fe", color: "#4c1d95", fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={e.status}
                        size="small"
                        color={e.status === TOKEN_STATUS.ACTIVE ? "success" : e.status === TOKEN_STATUS.LOCKED ? "error" : "default"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={e.amount} size="small" sx={{ bgcolor: "#1e3a8a", color: "#fff", fontWeight: "bold" }} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 11, color: "#dc2626" }}>
                      {e.caseRefCode || "—"}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      ₹{((e.amount || 1) * ratePerToken).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap", fontSize: 11 }}>
                      {e.date || new Date(e.timestamp).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell sx={{ fontSize: 10, color: "#64748b" }}>
                      Charitable Trust Internal Unit (GST Exempt)
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}