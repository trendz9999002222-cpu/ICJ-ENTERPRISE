import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LegalEcosystemService from "../services/legalEcosystemService";
import MainLayout from "../layouts/MainLayout";

export default function BillingInvoicing() {
  const [invoices, setInvoices] = useState([]);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [payAmount, setPayAmount] = useState(10000);

  const loadData = () => {
    setInvoices(LegalEcosystemService.getInvoices());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenPay = (caseId) => {
    setSelectedCaseId(caseId);
    setPayOpen(true);
  };

  const handleConfirmPay = () => {
    if (!selectedCaseId) return;
    LegalEcosystemService.recordPayment(selectedCaseId, payAmount);
    setPayOpen(false);
    loadData();
  };

  const totalBilled = invoices.reduce((sum, i) => sum + i.feeAmount, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalAdvocateShare = invoices.reduce((sum, i) => sum + i.advocateShare, 0);
  const totalTrustShare = invoices.reduce((sum, i) => sum + i.trustShare, 0);

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <ReceiptIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Legal Billing & Revenue Share Platform
            </Typography>
            <Typography color="text.secondary">
              Fee Billing, Client Payments & ICJ Trust 70:30 Advocate Revenue Split
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #1976d2" }}>
              <Typography color="text.secondary" variant="body2">Total Billed Fees</Typography>
              <Typography variant="h5" fontWeight="bold">₹{totalBilled.toLocaleString("en-IN")}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #2e7d32" }}>
              <Typography color="text.secondary" variant="body2">Total Collected Payments</Typography>
              <Typography variant="h5" fontWeight="bold">₹{totalCollected.toLocaleString("en-IN")}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #ed6c02" }}>
              <Typography color="text.secondary" variant="body2">Advocate Pool (70%)</Typography>
              <Typography variant="h5" fontWeight="bold">₹{totalAdvocateShare.toLocaleString("en-IN")}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #9c27b0" }}>
              <Typography color="text.secondary" variant="body2">ICJ Trust Revenue (30%)</Typography>
              <Typography variant="h5" fontWeight="bold">₹{totalTrustShare.toLocaleString("en-IN")}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Invoice Table */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Invoice & Fee Management Ledger
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice No</TableCell>
                <TableCell>Case Title</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Advocate</TableCell>
                <TableCell>Total Fee</TableCell>
                <TableCell>Paid Amount</TableCell>
                <TableCell>Remaining Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.invoiceNo} hover>
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{inv.invoiceNo}</TableCell>
                  <TableCell>{inv.caseTitle}</TableCell>
                  <TableCell>{inv.clientName}</TableCell>
                  <TableCell>{inv.advocateName}</TableCell>
                  <TableCell>₹{inv.feeAmount.toLocaleString("en-IN")}</TableCell>
                  <TableCell color="success.main">₹{inv.paidAmount.toLocaleString("en-IN")}</TableCell>
                  <TableCell color="error.main">₹{inv.remainingAmount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Chip
                      label={inv.status}
                      size="small"
                      color={inv.status === "Paid" ? "success" : inv.status === "Partial" ? "warning" : "error"}
                    />
                  </TableCell>
                  <TableCell>
                    {inv.remainingAmount > 0 && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleOpenPay(inv.caseId)}
                      >
                        Record Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Record Payment Dialog */}
        <Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Record Payment Receipt</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                type="number"
                label="Payment Amount (₹)"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleConfirmPay}>Confirm Receipt</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
