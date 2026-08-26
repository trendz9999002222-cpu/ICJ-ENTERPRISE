import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";
import PlayForWorkIcon from "@mui/icons-material/PlayForWork";

export default function EscrowWaterfallPanel() {
  // 4 Master Pools Balances
  const [pools, setPools] = useState({
    clientInflow: 250000,
    investorPool: 1200000,
    advocatePool: 85000,
    trustRevenue: 45000,
  });

  // Mock Active Escrow Cases
  const [cases, setCases] = useState([
    {
      id: "CASE-9921",
      clientName: "Suresh Sharma",
      advocateName: "Senior Advocate PAWAN GUPTA",
      category: "Cheque Bounce / Debt Recovery",
      escrowAmount: 118000, // ₹1,00,000 + GST
      initialPaid: 18000,
      fundingRequired: 100000,
      investorId: "INV-8022",
      status: "PENDING_ESCROW", // PENDING_ESCROW | LIEN_HELD | DISPUTED | RELEASED
      payoutDistributed: false,
    },
    {
      id: "ICJ-2026-CASE-8842",
      clientName: "Litigant Member",
      advocateName: "Empaneled Senior Advocate",
      category: "Property / Land Dispute",
      escrowAmount: 236000,
      initialPaid: 36000,
      fundingRequired: 200000,
      investorId: "ICJ-2026-INV-9011",
      status: "LIEN_HELD",
      payoutDistributed: false,
    }
  ]);

  const [selectedCase, setSelectedCase] = useState(null);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [refundPercent, setRefundPercent] = useState(50);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleLienMark = (caseId) => {
    setCases(cases.map(c => c.id === caseId ? { ...c, status: "LIEN_HELD" } : c));
    setMsg({ type: "success", text: `केस ${caseId} की राशि पर सफलतापूर्वक Lien Mark (ग्रहणाधिकार) लगा दिया गया है।` });
  };

  const handleReleaseWaterfall = (c) => {
    if (c.payoutDistributed) return;

    // Waterfall Calculations
    const total = c.escrowAmount;
    const investorShare = c.fundingRequired * 1.10; // Principal + 10% Yield
    const trustCommission = total * 0.15; // 15% Trust share
    const advocateShare = total * 0.20; // 20% Advocate share
    const clientRefund = total - (investorShare + trustCommission + advocateShare);

    // Update Master Pools
    setPools({
      clientInflow: pools.clientInflow - total,
      investorPool: pools.investorPool + investorShare,
      advocatePool: pools.advocatePool + advocateShare,
      trustRevenue: pools.trustRevenue + trustCommission,
    });

    setCases(cases.map(item => item.id === c.id ? { ...item, status: "RELEASED", payoutDistributed: true } : item));
    
    setMsg({
      type: "success",
      text: `केस ${c.id} की राशि सफलतापूर्वक वॉटरफॉल मॉडल के अनुसार वितरित की गई! (फाइनेंसर: ₹${investorShare.toLocaleString()}, वकील: ₹${advocateShare.toLocaleString()}, ट्रस्ट: ₹${trustCommission.toLocaleString()}, मुवक्किल: ₹${clientRefund.toLocaleString()})`
    });
  };

  const handleOpenDispute = (c) => {
    setSelectedCase(c);
    setDisputeOpen(true);
  };

  const handleResolveDispute = () => {
    if (!selectedCase) return;

    const total = selectedCase.escrowAmount;
    const clientShare = (total * refundPercent) / 100;
    const advocateShare = total - clientShare;

    // Deduct from Client Inflow and release to respective pools
    setPools({
      ...pools,
      clientInflow: pools.clientInflow - total,
      advocatePool: pools.advocatePool + advocateShare,
      trustRevenue: pools.trustRevenue + (clientShare * 0.05) // 5% Admin dispute resolution charge
    });

    setCases(cases.map(c => c.id === selectedCase.id ? { ...c, status: "DISPUTED", payoutDistributed: true } : c));
    setDisputeOpen(false);
    setMsg({
      type: "warning",
      text: `ग्रीवांस कमेटी का निर्णय: ${refundPercent}% मुवक्किल को (₹${clientShare.toLocaleString()}) तथा शेष वकील को (₹${advocateShare.toLocaleString()}) ट्रांसफर किया गया।`
    });
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <AccountBalanceIcon color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h5" fontWeight="bold">फोर-पूल मास्टर एस्क्रो वॉटरफॉल कंट्रोलर (Escrow Control Panel)</Typography>
          <Typography color="text.secondary" variant="body2">सभी 4 फिजिकल मास्टर एस्क्रो बैंक खातों के लाइव बैलेंस और वॉटरफॉल रिलीज की निगरानी करें।</Typography>
        </Box>
      </Stack>

      {/* 4 Master Pools Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, borderLeft: "5px solid #2563eb" }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">पूल 1: क्लाइंट एस्क्रो (Dispute Fees)</Typography>
            <Typography variant="h5" fontWeight="black" sx={{ mt: 1, color: "#2563eb" }}>₹{pools.clientInflow.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, borderLeft: "5px solid #16a34a" }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">पूल 2: इन्वेस्टर फंड (Capital Pool)</Typography>
            <Typography variant="h5" fontWeight="black" sx={{ mt: 1, color: "#16a34a" }}>₹{pools.investorPool.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, borderLeft: "5px solid #7c3aed" }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">पूल 3: एडवोकेट पेआउट पूल</Typography>
            <Typography variant="h5" fontWeight="black" sx={{ mt: 1, color: "#7c3aed" }}>₹{pools.advocatePool.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={1} sx={{ p: 2.5, borderRadius: 3, borderLeft: "5px solid #ea580c" }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">पूल 4: ट्रस्ट ऑपरेशन्स (Commission)</Typography>
            <Typography variant="h5" fontWeight="black" sx={{ mt: 1, color: "#ea580c" }}>₹{pools.trustRevenue.toLocaleString()}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {msg.text && (
        <Alert severity={msg.type} onClose={() => setMsg({ type: "", text: "" })} sx={{ mb: 3, borderRadius: 2 }}>
          {msg.text}
        </Alert>
      )}

      {/* Escrow Cases Grid */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>सक्रिय एस्क्रो केसेस (Active Escrow Transactions)</Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f1f5f9" }}>
              <TableRow>
                <TableCell>केस आईडी</TableCell>
                <TableCell>मुवक्किल / वकील</TableCell>
                <TableCell>कुल एस्क्रो राशि</TableCell>
                <TableCell>निवेशक/फंडिंग</TableCell>
                <TableCell>स्थिति (Status)</TableCell>
                <TableCell align="right">कार्यवाही (Actions)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cases.map((c) => (
                <TableRow key={c.id}>
                  <TableCell fontWeight="bold">{c.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{c.clientName}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.advocateName}</Typography>
                  </TableCell>
                  <TableCell>₹{c.escrowAmount.toLocaleString()}</TableCell>
                  <TableCell>₹{c.fundingRequired.toLocaleString()} ({c.investorId})</TableCell>
                  <TableCell>
                    <Chip
                      label={c.status}
                      size="small"
                      color={
                        c.status === "RELEASED" ? "success" :
                        c.status === "LIEN_HELD" ? "info" :
                        c.status === "DISPUTED" ? "error" : "default"
                      }
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {c.status === "PENDING_ESCROW" && (
                        <Button size="small" variant="outlined" color="primary" onClick={() => handleLienMark(c.id)}>
                          Lien Mark
                        </Button>
                      )}
                      {c.status !== "RELEASED" && c.status !== "DISPUTED" && (
                        <>
                          <Button size="small" variant="contained" color="success" startIcon={<PlayForWorkIcon />} onClick={() => handleReleaseWaterfall(c)}>
                            Release Waterfall
                          </Button>
                          <Button size="small" variant="contained" color="error" startIcon={<GavelIcon />} onClick={() => handleOpenDispute(c)}>
                            Dispute (Grievance)
                          </Button>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Grievance Dispute Resolution Dialog */}
      <Dialog open={disputeOpen} onClose={() => setDisputeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
          <SecurityIcon color="error" /> ग्रीवांस कमेटी विवाद निपटारा
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            मुवक्किल <strong>{selectedCase?.clientName}</strong> की शिकायत के आधार पर, एस्क्रो फंड के रिफंड वितरण का प्रतिशत तय करें:
          </Typography>

          <TextField
            fullWidth
            type="number"
            label="मुवक्किल को रिफंड का % (Refund to Client %)"
            value={refundPercent}
            onChange={(e) => setRefundPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
            inputProps={{ min: 0, max: 100 }}
            sx={{ mb: 2 }}
          />

          <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">वितरण पूर्वावलोकन (Preview):</Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Typography variant="body2">मुवक्किल को वापसी: <strong>₹{((selectedCase?.escrowAmount * refundPercent) / 100).toLocaleString()}</strong></Typography>
              <Typography variant="body2">वकील को भुगतान: <strong>₹{((selectedCase?.escrowAmount * (100 - refundPercent)) / 100).toLocaleString()}</strong></Typography>
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisputeOpen(false)}>रद्द करें</Button>
          <Button variant="contained" color="error" onClick={handleResolveDispute}>
            निर्णय लागू करें
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
