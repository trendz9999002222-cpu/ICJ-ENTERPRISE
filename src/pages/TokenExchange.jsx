import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab, Grid, Card, CardContent, Chip, Stack,
  Divider, Accordion, AccordionSummary, AccordionDetails, Alert, Button,
  TextField, Table, TableHead, TableBody, TableRow, TableCell, Avatar,
  LinearProgress, Container, useTheme, useMediaQuery,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Snackbar,
  Stepper, Step, StepLabel, StepContent
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import InfoIcon from '@mui/icons-material/Info';
import BalanceIcon from '@mui/icons-material/Balance';
import GroupsIcon from '@mui/icons-material/Groups';
import LockIcon from '@mui/icons-material/Lock';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import TokenLedgerService from '../services/tokenLedgerService';
import TokenRateService from '../services/tokenRateService';
import TransactionChargeService from '../services/transactionChargeService';
import useAuth from '../hooks/useAuth';

const faqs = [
  { q: "What is the ICJ Token?", a: "ICJ Token is a social obligation instrument of the ICJ Charitable Trust, functioning as an internal utility unit for trust members. It is not a financial security or cryptocurrency." },
  { q: "Is it legally compliant?", a: "Yes. It operates under the Indian Trusts Act 1882 and complies with all regulations. It is not a listed security (no SEBI) and not a crypto asset (no RBI crypto rules apply)." },
  { q: "What is the service charge?", a: "The trust levies a default 20% service charge on transactions, acting as a voluntary contribution to the trust, eligible for 80G deductions where applicable." },
  { q: "How is the token rate decided?", a: "The Super Admin sets the current INR value based on trust policies. Rate changes are notified 24 hours in advance." },
  { q: "Is GST applicable?", a: "No, as a charitable trust, these internal utility activities are exempt from GST under Notification 12/2017-CT(Rate)." },
  { q: "How can I redeem tokens?", a: "Tokens can be used for trust services or queued for cash redemption subject to treasury limits and mutual consent." },
  { q: "Can I exchange tokens with others?", a: "Yes, members can engage in OTC exchanges through mutual consent. No forced claims are allowed." },
  { q: "What are Campaign tokens?", a: "Tokens earned via participation in ICJ social welfare campaigns, attracting lower service charges during transfers." },
  { q: "What are Escrow tokens?", a: "Tokens locked conditionally against a case or event. They unlock automatically upon resolution." },
  { q: "Is TDS applicable?", a: "No, as it is an internal barter facilitation and not a professional service fee, TDS u/s 194J does not apply." },
  { q: "What is the Social Obligation Charter?", a: "It dictates that tokens represent a social promise, rely on mutual voluntariness, and absolve the trust from future claims on adverse case outcomes." },
  { q: "Are there capital gains taxes?", a: "No, tokens are not investments or financial securities, hence no capital gains tax applies." },
  { q: "How do I create a listing?", a: "Logged-in members can navigate to the 'Token Exchange' tab to list their available tokens for INR." },
  { q: "Can I buy tokens with cash?", a: "Members can acquire tokens from other members via exchange or directly from the Treasury as work rewards or donor grants." },
  { q: "What happens if a case is unresolved?", a: "Conditional escrow tokens remain locked until a resolution event triggers their release." },
  { q: "How does the trust use the revenue?", a: "Revenue generated from service charges acts as treasury income supporting the charitable objectives of the ICJ Trust." },
];

// ─── Token Request Helpers ────────────────────────────────────────────────────
const TOKEN_REQUEST_KEY = 'icj_token_requests';
const readRequests = () => { try { return JSON.parse(localStorage.getItem(TOKEN_REQUEST_KEY) || '[]'); } catch { return []; } };
const saveRequests = (r) => localStorage.setItem(TOKEN_REQUEST_KEY, JSON.stringify(r));

const CASE_TYPE_OPTS = [
  { value: 'PROP', label: 'Property / Real Estate (संपत्ति)' },
  { value: 'CRIM', label: 'Criminal (आपराधिक)' },
  { value: 'CIVIL', label: 'Civil (सिविल)' },
  { value: 'FAM', label: 'Family / Matrimonial (पारिवारिक)' },
  { value: 'LAB', label: 'Labour / Employment (श्रम)' },
  { value: 'CORP', label: 'Corporate / Commercial (व्यावसायिक)' },
  { value: 'CONS', label: 'Consumer (उपभोक्ता)' },
  { value: 'TAX', label: 'Tax / Revenue (कर)' },
  { value: 'GEN', label: 'General (सामान्य)' },
];

const SERVICE_OPTS = [
  'Legal Advice / कानूनी सलाह',
  'Document Drafting / दस्तावेज़ तैयार करना',
  'Court Representation / न्यायालय प्रतिनिधित्व',
  'Notary / नोटरी',
  'Property Verification / संपत्ति सत्यापन',
  'Mediation / मध्यस्थता',
  'Customer Care Support / ग्राहक सेवा',
  'Research & Documentation / शोध',
  'Other / अन्य',
];

export default function TokenExchange() {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Data State
  const [stats, setStats] = useState(null);
  const [currentRate, setCurrentRate] = useState(null);
  const [rateHistory, setRateHistory] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // Exchange Tab State
  const [calcTokens, setCalcTokens] = useState('');
  const [calcResult, setCalcResult] = useState(null);

  // Token Request State
  const [requests, setRequests] = useState([]);
  const [reqDialog, setReqDialog] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [reqForm, setReqForm] = useState({
    requesterName: '', memberId: '', mobile: '', caseType: 'PROP',
    caseTitle: '', caseDescription: '', caseCity: '', courtName: '',
    tokenAmountNeeded: '', promisedFeePercent: '', promisedCaseValue: '',
    serviceNeeded: SERVICE_OPTS[0], additionalNotes: '',
  });
  const [reqFeeCalc, setReqFeeCalc] = useState(null);

  const showSnack = (msg, sev = 'success') => setSnack({ open: true, msg, severity: sev });
  const loadRequests = () => setRequests(readRequests());

  useEffect(() => {
    try {
      const circStats = TokenLedgerService.getCirculationStats();
      const rate = TokenRateService.getCurrentRate();
      const history = TokenRateService.getRateHistory().slice(0, 12);
      const rev = TransactionChargeService.getTotalChargesCollected();
      setStats(circStats);
      setCurrentRate(rate);
      setRateHistory(history);
      setTotalRevenue(rev);
    } catch (err) {
      console.error('Error loading token data', err);
    } finally {
      setLoading(false);
    }
    loadRequests();
  }, []);

  // Recalculate issuance fee when token amount or rate changes
  useEffect(() => {
    const n = parseInt(reqForm.tokenAmountNeeded, 10);
    const rate = currentRate?.tokenToInr || 10;
    if (n > 0) {
      const grossInr = n * rate;
      const icjFee = grossInr * 0.20; // 20% issuance fee to ICJ
      setReqFeeCalc({ tokens: n, grossInr, icjFee, netTokensIssued: n, rate });
    } else {
      setReqFeeCalc(null);
    }
  }, [reqForm.tokenAmountNeeded, currentRate]);

  const handleSubmitRequest = () => {
    if (!reqForm.requesterName || !reqForm.caseTitle || !reqForm.tokenAmountNeeded) {
      showSnack('कृपया नाम, केस शीर्षक और टोकन संख्या भरें।', 'error');
      return;
    }
    const existing = readRequests();
    const newReq = {
      id: `TOKRQ-${Date.now()}`,
      ...reqForm,
      status: 'PENDING_REVIEW',
      submittedAt: new Date().toISOString(),
      submittedDate: new Date().toLocaleDateString('en-IN'),
      icjFeePayable: reqFeeCalc?.icjFee || 0,
      tokenRate: currentRate?.tokenToInr || 10,
      // ICJ review fields
      reviewedBy: null,
      reviewedAt: null,
      approvedTokens: null,
      caseRefCode: null,
    };
    saveRequests([newReq, ...existing]);
    loadRequests();
    setReqDialog(false);
    setReqForm({ requesterName: '', memberId: '', mobile: '', caseType: 'PROP', caseTitle: '', caseDescription: '', caseCity: '', courtName: '', tokenAmountNeeded: '', promisedFeePercent: '', promisedCaseValue: '', serviceNeeded: SERVICE_OPTS[0], additionalNotes: '' });
    showSnack('✅ आपका Token Request ICJ Trust को भेज दिया गया है! 24 घंटे में समीक्षा होगी।');
  };

  const handleTabChange = (e, val) => setTabIndex(val);

  const handleCalculate = (val) => {
    setCalcTokens(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      try {
        const res = TransactionChargeService.calculateCharge({ tokenAmount: num });
        setCalcResult(res);
      } catch(e) {
        setCalcResult(null);
      }
    } else {
      setCalcResult(null);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10 }}>
      {/* Hero Banner */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        color: 'white',
        py: 6,
        px: 3,
        textAlign: 'center',
        boxShadow: 3
      }}>
        <MonetizationOnIcon sx={{ fontSize: 60, color: '#f59e0b', mb: 2 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          ICJ Token Exchange Public Portal
        </Typography>
        <Typography variant="h6" sx={{ color: '#93c5fd', maxWidth: 800, mx: 'auto' }}>
          India's First Legal Barter Token — Powered by ICJ Charitable Trust
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -4 }}>
        <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={tabIndex} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': { fontWeight: 'bold', fontSize: '1rem', py: 2 },
              '& .Mui-selected': { color: '#1e3a8a' },
              '& .MuiTabs-indicator': { backgroundColor: '#1e3a8a', height: 3 }
            }}
          >
            <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Token Dashboard" />
            <Tab icon={<SwapHorizIcon />} iconPosition="start" label="Token Exchange" />
            <Tab icon={<BalanceIcon />} iconPosition="start" label="Social Obligation Charter" />
            <Tab icon={<InfoIcon />} iconPosition="start" label="FAQ" />
            <Tab icon={<GroupsIcon />} iconPosition="start" label="🤝 Token Request" sx={{ color: '#7c3aed', '&.Mui-selected': { color: '#7c3aed !important' } }} />
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'white' }}>
            {/* TAB 1: Dashboard */}
            {tabIndex === 0 && (
              <Box>
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard title="Total Minted" value={stats?.totalMinted || 0} icon={<MonetizationOnIcon />} color="#1e3a8a" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard title="Active Circulation" value={stats?.totalActive || 0} icon={<SwapHorizIcon />} color="#10b981" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard title="Locked (Escrow)" value={stats?.totalLocked || 0} icon={<LockIcon />} color="#ef4444" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard title="Redeemed" value={stats?.totalRedeemed || 0} icon={<CheckCircleIcon />} color="#64748b" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard title="Today's Rate" value={`₹${currentRate?.tokenToInr || 0}`} icon={<TrendingUpIcon />} color="#f59e0b" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StatCard title="Total Treasury Revenue" value={`₹${totalRevenue}`} icon={<AccountBalanceIcon />} color="#0f172a" />
                  </Grid>
                </Grid>

                <Alert severity="success" sx={{ mb: 4, border: '1px solid #10b981', '& .MuiAlert-icon': { color: '#10b981' } }}>
                  <Typography variant="subtitle1" fontWeight="bold">ICJ Trust Statement</Typography>
                  ICJ Trust commits to honor all valid tokens for its services.
                </Alert>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4} justifyContent="center" flexWrap="wrap">
                  <Chip icon={<SecurityIcon />} label="NOT a Security" color="primary" variant="outlined" />
                  <Chip icon={<SecurityIcon />} label="NOT Crypto" color="primary" variant="outlined" />
                  <Chip icon={<AccountBalanceIcon />} label="GST Exempt (Charitable Trust)" color="success" variant="outlined" />
                  <Chip icon={<GavelIcon />} label="Indian Trusts Act 1882" color="secondary" variant="outlined" />
                </Stack>

                <Typography variant="h5" fontWeight="bold" mb={2} color="#0f172a">Rate History</Typography>
                <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                      <TableRow>
                        <TableCell><b>Effective Date</b></TableCell>
                        <TableCell><b>Rate (INR)</b></TableCell>
                        <TableCell><b>Service Charge</b></TableCell>
                        <TableCell><b>Status</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rateHistory.map((r) => (
                        <TableRow key={r.rateId}>
                          <TableCell>{r.effectiveDate}</TableCell>
                          <TableCell>₹{r.tokenToInr}</TableCell>
                          <TableCell>{(r.serviceChargeRate * 100).toFixed(0)}%</TableCell>
                          <TableCell>
                            <Chip size="small" label={r.status} color={r.status === 'ACTIVE' ? 'success' : 'default'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {/* TAB 2: Exchange */}
            {tabIndex === 1 && (
              <Box>
                <Alert severity="warning" icon={<InfoIcon />} sx={{ mb: 4, bgcolor: '#fef2f2', color: '#991b1b', border: '1px solid #f87171' }}>
                  <b>Warning:</b> Exchange requires mutual consent. No forced claims. ICJ charges 20% service fee.
                </Alert>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={7}>
                    <Typography variant="h6" fontWeight="bold" mb={2} color="#0f172a">Active Listings</Typography>
                    <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
                      <Table>
                        <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                          <TableRow>
                            <TableCell><b>Tokens</b></TableCell>
                            <TableCell><b>Expected Rate</b></TableCell>
                            <TableCell><b>Date Listed</b></TableCell>
                            <TableCell><b>Action</b></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                              No active listings available.
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Paper>

                    <Typography variant="h6" fontWeight="bold" mt={4} mb={2} color="#0f172a">OTC Exchange Rules</Typography>
                    <Box component="ul" sx={{ pl: 2, color: 'text.secondary', lineHeight: 1.8 }}>
                      <li>Members can negotiate token exchange directly.</li>
                      <li>The ICJ platform acts only as an escrow and ledger verifier.</li>
                      <li>A standard service charge applies to the gross INR value.</li>
                      <li>Any dispute must be settled amicably without legal claims against ICJ.</li>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Card variant="outlined" sx={{ mb: 3, borderTop: '4px solid #1e3a8a' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Create Listing</Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                          Login required to list your tokens.
                        </Typography>
                        <TextField fullWidth label="Token Amount" variant="outlined" size="small" sx={{ mb: 2 }} disabled />
                        <TextField fullWidth label="Expected INR Total" variant="outlined" size="small" sx={{ mb: 3 }} disabled />
                        <Button variant="contained" fullWidth disabled sx={{ bgcolor: '#1e3a8a' }}>
                          Submit Listing
                        </Button>
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ borderTop: '4px solid #f59e0b', bgcolor: '#fffbeb' }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Charge Calculator</Typography>
                        <TextField 
                          fullWidth 
                          label="Enter Token Amount" 
                          type="number"
                          variant="outlined" 
                          size="small" 
                          value={calcTokens}
                          onChange={(e) => handleCalculate(e.target.value)}
                          sx={{ mb: 2, bgcolor: 'white' }}
                        />
                        {calcResult && (
                          <Box sx={{ mt: 2 }}>
                            <Stack direction="row" justifyItems="space-between" mb={1}>
                              <Typography flexGrow={1}>Gross Value:</Typography>
                              <Typography fontWeight="bold">₹{calcResult.grossInr}</Typography>
                            </Stack>
                            <Stack direction="row" justifyItems="space-between" mb={1}>
                              <Typography flexGrow={1}>Service Charge ({calcResult.chargeRatePct}):</Typography>
                              <Typography color="error" fontWeight="bold">- ₹{calcResult.chargeInr}</Typography>
                            </Stack>
                            <Divider sx={{ my: 1 }} />
                            <Stack direction="row" justifyItems="space-between">
                              <Typography flexGrow={1} fontWeight="bold" color="#1e3a8a">Net Value:</Typography>
                              <Typography fontWeight="bold" color="#1e3a8a" variant="h6">₹{calcResult.netInr}</Typography>
                            </Stack>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* TAB 3: Charter */}
            {tabIndex === 2 && (
              <Box>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', 
                  color: 'white', 
                  mb: 4 
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <BalanceIcon sx={{ fontSize: 50, color: '#f59e0b', mb: 2 }} />
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      ICJ Token Social Obligation Charter
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: '#93c5fd', maxWidth: 700, mx: 'auto' }}>
                      Binding principles for every token holder ensuring trust, legality, and social impact.
                    </Typography>
                  </CardContent>
                </Card>

                <Grid container spacing={3} mb={5}>
                  {[
                    "Token = Social Promise (not legal contract)",
                    "No Future Claims on adverse outcomes",
                    "Mutual Voluntariness",
                    "Trust's unconditional service commitment",
                    "Service Charge Acceptance"
                  ].map((text, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, height: '100%', borderColor: '#e2e8f0' }}>
                        <Avatar sx={{ bgcolor: '#1e3a8a', color: 'white' }}>{idx + 1}</Avatar>
                        <Typography fontWeight="500">{text}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center" color="#0f172a">
                  Post-Resolution Options
                </Typography>
                <Grid container spacing={2} justifyContent="center" mb={4}>
                  {['Cash Redemption', 'Trust Donation', 'Hold', 'Transfer'].map((opt, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                        <GroupsIcon sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                        <Typography fontWeight="bold">{opt}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Box textAlign="center">
                  <Button variant="outlined" color="primary" size="large" sx={{ borderWidth: 2 }}>
                    Download Digital TUA
                  </Button>
                </Box>
              </Box>
            )}

            {/* TAB 4: FAQ */}
            {tabIndex === 3 && (
              <Box maxWidth="800px" mx="auto">
                <Typography variant="h5" fontWeight="bold" mb={3} color="#0f172a" textAlign="center">
                  Frequently Asked Questions
                </Typography>
                {faqs.map((faq, index) => (
                  <Accordion key={index} elevation={1} sx={{ mb: 1, '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', borderRadius: 1 }}>
                      <Typography fontWeight="bold" color="#1e3a8a">{faq.q}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography color="text.secondary">{faq.a}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
                
                <Box mt={6} textAlign="center" p={4} bgcolor="#f1f5f9" borderRadius={2}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Need more help? Contact Trust Helpline
                  </Typography>
                  <Typography color="text.secondary" mb={3}>
                    Our support team is available 24/7 to assist you with token operations.
                  </Typography>
                  <Button variant="contained" size="large" sx={{ bgcolor: '#1e3a8a', px: 4 }}>
                    Become a Member
                  </Button>
                </Box>
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 5: Community Token Issuance Request                       */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {tabIndex === 4 && (
              <Box>
                {/* Hero Section */}
                <Box sx={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', borderRadius: 3, p: 4, mb: 4, color: '#fff', textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>🤝 Community Token Issuance Request</Typography>
                  <Typography variant="h6" sx={{ color: '#ddd6fe', maxWidth: 700, mx: 'auto', mb: 2 }}>
                    ICJ से जुड़ा कोई भी व्यक्ति अपने केस के लिए टोकन जारी करवा सकता है।
                    हमें फीस दीजिए — हम टोकन जारी करेंगे — पूरा समुदाय उन्हें मान्यता देगा।
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" gap={1}>
                    <Chip label="✅ ICJ Member Anyone" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }} />
                    <Chip label="✅ 20% ICJ Issuance Fee" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }} />
                    <Chip label="✅ Community Recognized" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }} />
                    <Chip label="✅ Social Promise" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700 }} />
                  </Stack>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setReqDialog(true)}
                    sx={{ mt: 3, bgcolor: '#f59e0b', color: '#0f172a', fontWeight: 'bold', px: 5, py: 1.5, fontSize: '1.1rem', borderRadius: 2, '&:hover': { bgcolor: '#d97706' } }}
                  >
                    🪙 Token Request करें (Apply Now)
                  </Button>
                </Box>

                {/* How It Works */}
                <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #ede9fe' }}>
                  <Typography variant="h5" fontWeight="bold" color="#4c1d95" mb={3}>📋 यह कैसे काम करता है?</Typography>
                  <Stepper orientation="vertical" nonLinear>
                    {[
                      { label: '1. Request Submit करें', desc: 'अपना नाम, Member ID, केस का विवरण और कितने Token चाहिए — यह भरकर ICJ Trust को भेजें।' },
                      { label: '2. ICJ समीक्षा करता है', desc: 'ICJ Trust 24 घंटे में आपकी Request समीक्षा करता है। मामला वैध पाए जाने पर आगे बढ़ता है।' },
                      { label: '3. ICJ Issuance Fee लेता है (20%)', desc: 'टोकन की कुल INR Value का 20% ICJ Trust को सेवा शुल्क / सामाजिक योगदान के रूप में देना होगा। यह Charitable Trust में जाता है (80G eligible)।' },
                      { label: '4. Token Mint + Case Code जारी', desc: 'ICJ आपके मामले के लिए Serial Tokens मिंट करता है और एक अद्वितीय Case Reference Code देता है — जैसे LKO-PROP-2026-0042।' },
                      { label: '5. Community Portal पर मान्यता', desc: 'ये Token ICJ पोर्टल पर सभी Members को दिखते हैं। जो Member आपकी Service देना चाहे, वो Token के बदले आपकी मदद करेगा।' },
                      { label: '6. Token = Service का बदला', desc: 'Token Holder अपनी Service का बदला ICJ Tokens में लेता है। भविष्य में वो Token रिडीम, ट्रांसफर, या ट्रस्ट को डोनेट कर सकता है।' },
                    ].map((step, i) => (
                      <Step key={i} active>
                        <StepLabel>
                          <Typography fontWeight={700} color="#4c1d95">{step.label}</Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography color="text.secondary" sx={{ pb: 1 }}>{step.desc}</Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Paper>

                {/* Fee Calculator */}
                <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #fde68a', bgcolor: '#fffbeb' }}>
                  <Typography variant="h6" fontWeight="bold" color="#92400e" mb={2}>💰 ICJ Issuance Fee Calculator</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                    <TextField
                      label="कितने Token चाहिए?"
                      type="number"
                      size="small"
                      value={reqForm.tokenAmountNeeded}
                      onChange={(e) => setReqForm((p) => ({ ...p, tokenAmountNeeded: e.target.value }))}
                      sx={{ minWidth: 180 }}
                      placeholder="e.g. 500"
                    />
                    {reqFeeCalc && (
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip label={`Token INR Value: ₹${reqFeeCalc.grossInr.toLocaleString('en-IN')}`} sx={{ bgcolor: '#dbeafe', color: '#1e3a8a', fontWeight: 700 }} />
                        <Chip label={`ICJ Fee (20%): ₹${reqFeeCalc.icjFee.toLocaleString('en-IN')}`} sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }} />
                        <Chip label={`Tokens Issued: ${reqFeeCalc.tokens}`} sx={{ bgcolor: '#dcfce7', color: '#059669', fontWeight: 700 }} />
                      </Box>
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    * Current Rate: ₹{currentRate?.tokenToInr || 10}/Token · 20% = ICJ Trust voluntary contribution (80G eligible)
                  </Typography>
                </Paper>

                {/* Live Request Board */}
                <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
                    <Typography variant="h6" fontWeight="bold" color="#0f172a">📋 Community Token Request Board</Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip label={`${requests.length} Total Requests`} sx={{ bgcolor: '#ede9fe', color: '#4c1d95', fontWeight: 700 }} />
                      <Chip label={`${requests.filter(r => r.status === 'PENDING_REVIEW').length} Pending`} color="warning" />
                    </Stack>
                  </Stack>
                  {requests.length === 0 ? (
                    <Alert severity="info" icon={<GroupsIcon />}>
                      अभी कोई Token Request नहीं है। ऊपर "Token Request करें" बटन से पहली Request Submit करें।
                    </Alert>
                  ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f3ff' }}>
                            {['Request ID', 'नाम', 'केस', 'Type', 'Tokens Needed', 'INR Value', 'ICJ Fee', 'Service Needed', 'Status', 'Date'].map(h => (
                              <TableCell key={h} sx={{ fontWeight: 700, color: '#4c1d95', whiteSpace: 'nowrap' }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {requests.map(req => (
                            <TableRow key={req.id} hover sx={{ '&:hover': { bgcolor: '#faf5ff' } }}>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: 11, color: '#7c3aed' }}>{req.id}</TableCell>
                              <TableCell fontWeight={600}>{req.requesterName}</TableCell>
                              <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.caseTitle}</TableCell>
                              <TableCell><Chip label={req.caseType} size="small" sx={{ bgcolor: '#ede9fe', color: '#4c1d95', fontWeight: 700 }} /></TableCell>
                              <TableCell align="center"><Chip label={req.tokenAmountNeeded} size="small" sx={{ bgcolor: '#4c1d95', color: '#fff', fontWeight: 'bold' }} /></TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>₹{(parseInt(req.tokenAmountNeeded || 0) * (req.tokenRate || 10)).toLocaleString('en-IN')}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap', color: '#dc2626', fontWeight: 600 }}>₹{(req.icjFeePayable || 0).toLocaleString('en-IN')}</TableCell>
                              <TableCell sx={{ fontSize: 11, whiteSpace: 'nowrap' }}>{req.serviceNeeded?.split('/')[0]}</TableCell>
                              <TableCell>
                                <Chip
                                  label={req.status === 'PENDING_REVIEW' ? 'समीक्षाधीन' : req.status === 'APPROVED' ? 'स्वीकृत ✅' : 'अस्वीकृत'}
                                  size="small"
                                  color={req.status === 'PENDING_REVIEW' ? 'warning' : req.status === 'APPROVED' ? 'success' : 'error'}
                                />
                              </TableCell>
                              <TableCell sx={{ fontSize: 11, whiteSpace: 'nowrap' }}>{req.submittedDate}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  )}
                </Paper>

                {/* Trust Policy Note */}
                <Alert severity="info" icon={<GavelIcon />} sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600}>ICJ Trust नीति (Policy):</Typography>
                  <Typography variant="body2">
                    ICJ से जारी सभी Token — चाहे वो किसी भी Member के case के लिए हों — ICJ Portal पर सभी Members द्वारा मान्यता प्राप्त हैं।
                    Token एक सामाजिक प्रतिज्ञा है, कोई कानूनी देनदारी नहीं। Issuance fee (20%) Charitable Trust में जाती है (Indian Trusts Act 1882 | 80G eligible).
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* ══════════════════════════ TOKEN REQUEST DIALOG ══════════════════════ */}
      <Dialog open={reqDialog} onClose={() => setReqDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #4c1d95, #7c3aed)', color: '#fff' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <GroupsIcon />
            <Typography variant="h6" fontWeight="bold">Token Issuance Request — ICJ Trust को भेजें</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }} icon={<GavelIcon />}>
            <strong>महत्वपूर्ण:</strong> Token एक सामाजिक प्रतिज्ञा है — कोई कानूनी दावा नहीं। ICJ Trust 20% Issuance Fee लेगा।
            Request Submit करने से आप ICJ Token User Agreement (TUA-v1.0) की शर्तें स्वीकार करते हैं।
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="आवेदक का नाम *" value={reqForm.requesterName} onChange={e => setReqForm(p => ({ ...p, requesterName: e.target.value }))} placeholder="पूरा नाम" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="ICJ Member ID (यदि है)" value={reqForm.memberId} onChange={e => setReqForm(p => ({ ...p, memberId: e.target.value }))} placeholder="26ICJ08AA0001" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Mobile Number *" value={reqForm.mobile} onChange={e => setReqForm(p => ({ ...p, mobile: e.target.value }))} placeholder="10 digit mobile" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Case Type / केस का प्रकार *" value={reqForm.caseType} onChange={e => setReqForm(p => ({ ...p, caseType: e.target.value }))}>
                {CASE_TYPE_OPTS.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Case Title / केस का शीर्षक *" value={reqForm.caseTitle} onChange={e => setReqForm(p => ({ ...p, caseTitle: e.target.value }))} placeholder="e.g. Property Dispute — Ramlal vs State, Lucknow District Court" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Case Description / केस का विवरण" value={reqForm.caseDescription} onChange={e => setReqForm(p => ({ ...p, caseDescription: e.target.value }))} placeholder="संक्षेप में बताएं — क्या हुआ, क्या चाहिए, कब से चल रहा है..." />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City / Court Location" value={reqForm.caseCity} onChange={e => setReqForm(p => ({ ...p, caseCity: e.target.value }))} placeholder="e.g. Lucknow" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Court Name" value={reqForm.courtName} onChange={e => setReqForm(p => ({ ...p, courtName: e.target.value }))} placeholder="e.g. District Court, Lucknow" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="number" label="Token Quantity Needed *" value={reqForm.tokenAmountNeeded} onChange={e => setReqForm(p => ({ ...p, tokenAmountNeeded: e.target.value }))} placeholder="e.g. 500" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="number" label="Case Value in ₹ (optional)" value={reqForm.promisedCaseValue} onChange={e => setReqForm(p => ({ ...p, promisedCaseValue: e.target.value }))} placeholder="e.g. 5000000" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth type="number" label="Promised % for Services (optional)" value={reqForm.promisedFeePercent} onChange={e => setReqForm(p => ({ ...p, promisedFeePercent: e.target.value }))} placeholder="e.g. 10" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Service Needed / किस सेवा के लिए Token चाहिए" value={reqForm.serviceNeeded} onChange={e => setReqForm(p => ({ ...p, serviceNeeded: e.target.value }))}>
                {SERVICE_OPTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Additional Notes" value={reqForm.additionalNotes} onChange={e => setReqForm(p => ({ ...p, additionalNotes: e.target.value }))} placeholder="कोई और जानकारी..." />
            </Grid>
          </Grid>

          {/* Fee Preview in Dialog */}
          {reqFeeCalc && (
            <Paper sx={{ mt: 2, p: 2, bgcolor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} color="#4c1d95" mb={1}>📊 Fee Preview</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Chip label={`Tokens: ${reqFeeCalc.tokens}`} sx={{ bgcolor: '#ede9fe', color: '#4c1d95', fontWeight: 700 }} />
                <Chip label={`Total INR Value: ₹${reqFeeCalc.grossInr.toLocaleString('en-IN')}`} sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 700 }} />
                <Chip label={`ICJ Fee (20%): ₹${reqFeeCalc.icjFee.toLocaleString('en-IN')}`} sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }} />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                ICJ Fee = Charitable Trust Voluntary Contribution (80G eligible) · GST Exempt · Rate: ₹{reqFeeCalc.rate}/Token
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setReqDialog(false)} variant="outlined">रद्द करें</Button>
          <Button
            variant="contained"
            onClick={handleSubmitRequest}
            sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, fontWeight: 'bold', px: 3 }}
          >
            ✅ Request Submit करें
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 2, height: '100%', borderTop: `4px solid ${color}` }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography color="text.secondary" variant="body2" fontWeight="bold" textTransform="uppercase">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="#0f172a">
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
