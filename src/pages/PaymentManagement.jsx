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
  MenuItem,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import DownloadIcon from "@mui/icons-material/Download";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentBillingService from "../services/paymentBillingService";
import MainLayout from "../layouts/MainLayout";

const PAYMENT_METHODS = [
  "BHIM UPI / Google Pay",
  "PhonePe UPI",
  "Paytm UPI",
  "Credit Card",
  "Debit Card",
  "Net Banking (HDFC/ICICI/SBI)",
  "IMPS / NEFT / RTGS",
  "Wallet Payment",
  "Offline Cash Receipt (Admin)",
];

const printReceipt = (invoice, txn) => {
  const w = window.open("", "_blank");
  w.document.write(`
    <html>
    <head><title>ICJ Official Payment Receipt - ${invoice.invoiceNo}</title></head>
    <body style="font-family:sans-serif;padding:40px;max-width:800px;margin:auto;border:4px double #1a237e">
      <div style="text-align:center">
        <h2 style="color:#1a237e;margin-bottom:2px">INTERNATIONAL CONSORTIUM OF JURISTS</h2>
        <h4 style="color:#b71c1c;margin-top:0">Official Tax Invoice & Payment Receipt</h4>
        <hr style="border:1px solid #1a237e">
      </div>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr><td style="padding:6px"><b>Invoice No:</b> ${invoice.invoiceNo}</td><td style="padding:6px"><b>Date:</b> ${new Date().toLocaleDateString("en-IN")}</td></tr>
        <tr><td style="padding:6px"><b>Client Name:</b> ${invoice.clientName}</td><td style="padding:6px"><b>Case ID:</b> ${invoice.caseId}</td></tr>
        <tr><td style="padding:6px"><b>Case Title:</b> ${invoice.caseTitle}</td><td style="padding:6px"><b>Advocate:</b> ${invoice.advocateName}</td></tr>
      </table>
      <table style="width:100%;border-collapse:collapse;border:1px solid #ccc;margin-bottom:20px">
        <tr style="background:#f5f5f5"><th style="padding:8px;border:1px solid #ccc">Description</th><th style="padding:8px;border:1px solid #ccc">Amount (₹)</th></tr>
        <tr><td style="padding:8px;border:1px solid #ccc">Case Legal Retainer Fee</td><td style="padding:8px;border:1px solid #ccc">₹${(invoice.feeBreakdown?.caseFee || 0).toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ccc">AI Reading & Processing Fee</td><td style="padding:8px;border:1px solid #ccc">₹${(invoice.feeBreakdown?.aiProcessingFee || 0).toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ccc">Document Analysis Fee</td><td style="padding:8px;border:1px solid #ccc">₹${(invoice.feeBreakdown?.documentAnalysisFee || 0).toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ccc">Advocate Consultation & Drafting Fee</td><td style="padding:8px;border:1px solid #ccc">₹${((invoice.feeBreakdown?.advocateConsultationFee || 0) + (invoice.feeBreakdown?.draftingFee || 0)).toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ccc">Court Appearance & Misc Charges</td><td style="padding:8px;border:1px solid #ccc">₹${((invoice.feeBreakdown?.courtAppearanceFee || 0) + (invoice.feeBreakdown?.miscellaneous || 0)).toLocaleString("en-IN")}</td></tr>
        <tr style="font-weight:bold"><td style="padding:8px;border:1px solid #ccc">Subtotal</td><td style="padding:8px;border:1px solid #ccc">₹${(invoice.subtotal || 0).toLocaleString("en-IN")}</td></tr>
        {invoice.discountAmount > 0 && <tr><td style="padding:8px;border:1px solid #ccc;color:green">Discount Coupon (${invoice.couponCode})</td><td style="padding:8px;border:1px solid #ccc;color:green">-₹${invoice.discountAmount.toLocaleString("en-IN")}</td></tr>}
        <tr><td style="padding:8px;border:1px solid #ccc">GST @ 18%</td><td style="padding:8px;border:1px solid #ccc">₹${(invoice.gstAmount || 0).toLocaleString("en-IN")}</td></tr>
        <tr style="background:#e8eaf6;font-size:16px;font-weight:bold"><td style="padding:10px;border:1px solid #ccc">Total Paid Amount</td><td style="padding:10px;border:1px solid #ccc">₹${(invoice.paidAmount || 0).toLocaleString("en-IN")}</td></tr>
      </table>
      <div style="margin-top:30px">
        <p><b>Transaction Ref:</b> ${txn ? txn.transactionId : invoice.transactionId || "TXN-DIRECT"}</p>
        <p><b>Payment Method:</b> ${invoice.paymentMethod || "Online Gateway"}</p>
        <p style="font-size:11px;color:#666">Computer Generated Receipt — Valid for All Official Court Purposes</p>
      </div>
      <script>window.print();<\/script>
    </body>
    </html>
  `);
  w.document.close();
};

export default function PaymentManagement() {
  const [tabIndex, setTabIndex] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [revData, setRevData] = useState({});

  // Pay Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payMethod, setPayMethod] = useState("BHIM UPI / Google Pay");
  const [payAmount, setPayAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [qrDetails, setQrDetails] = useState(null);
  const [paySuccessMsg, setPaySuccessMsg] = useState("");

  // Create Invoice Modal (Admin)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newInv, setNewInv] = useState({
    caseTitle: "",
    clientName: "",
    advocateName: "",
    couponCode: "",
    feeBreakdown: {
      caseFee: 25000,
      aiProcessingFee: 2000,
      documentAnalysisFee: 3000,
      advocateConsultationFee: 5000,
      draftingFee: 3000,
      courtAppearanceFee: 2000,
      miscellaneous: 0,
    },
  });

  const loadAll = () => {
    setInvoices(PaymentBillingService.getInvoices());
    setTransactions(PaymentBillingService.getTransactions());
    setRefunds(PaymentBillingService.getRefunds());
    setRevData(PaymentBillingService.calculateRevenueDistribution());
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOpenPay = (invoice) => {
    setSelectedInvoice(invoice);
    setPayAmount(invoice.outstandingBalance || invoice.totalAmount);
    const qr = PaymentBillingService.generateUPIQR(invoice.invoiceNo, invoice.outstandingBalance || invoice.totalAmount);
    setQrDetails(qr);
    setPayModalOpen(true);
  };

  const handleExecutePayment = () => {
    if (!selectedInvoice) return;
    try {
      PaymentBillingService.processPayment(selectedInvoice.invoiceNo, payAmount, payMethod);
      setPaySuccessMsg(`Payment of ₹${payAmount.toLocaleString("en-IN")} successful!`);
      setTimeout(() => {
        setPaySuccessMsg("");
        setPayModalOpen(false);
        loadAll();
      }, 1500);
    } catch (err) {
      alert(err.message || "Payment execution failed");
    }
  };

  const handleCreateInvoice = () => {
    if (!newInv.caseTitle || !newInv.clientName) {
      alert("Please enter case title and client name.");
      return;
    }
    PaymentBillingService.createInvoice(newInv);
    setCreateModalOpen(false);
    loadAll();
  };

  const handleApproveRefund = (refundId) => {
    PaymentBillingService.approveRefund(refundId);
    loadAll();
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <PaymentIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Enterprise Payment, Billing & Revenue Platform
              </Typography>
              <Typography color="text.secondary">
                Multi-Gateway Payments, UPI QR Codes, GST Invoicing, 70:30 Revenue Split & TDS Settlements
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReceiptIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create New Invoice
          </Button>
        </Stack>

        {/* Revenue Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #1976d2" }}>
              <Typography color="text.secondary" variant="body2">Total Collections</Typography>
              <Typography variant="h5" fontWeight="bold">₹{revData.totalCollected?.toLocaleString("en-IN") || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #2e7d32" }}>
              <Typography color="text.secondary" variant="body2">Advocate Pool (70%)</Typography>
              <Typography variant="h5" fontWeight="bold">₹{revData.advocatePoolRaw?.toLocaleString("en-IN") || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #ed6c02" }}>
              <Typography color="text.secondary" variant="body2">ICJ Trust Share (30%)</Typography>
              <Typography variant="h5" fontWeight="bold">₹{revData.trustPoolRaw?.toLocaleString("en-IN") || 0}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #9c27b0" }}>
              <Typography color="text.secondary" variant="body2">Total GST (18%)</Typography>
              <Typography variant="h5" fontWeight="bold">₹{revData.totalGST?.toLocaleString("en-IN") || 0}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs for Role Specific Views */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)}>
            <Tab label="Client Invoices & Online Pay" />
            <Tab label="Admin Revenue & Settlements" />
            <Tab label="Advocate Payouts & TDS Statements" />
            <Tab label="Transaction Ledger" />
          </Tabs>
        </Box>

        {/* TAB 0: Client View */}
        {tabIndex === 0 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Client Invoices & Outstanding Bills
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice No</TableCell>
                  <TableCell>Case Title</TableCell>
                  <TableCell>Total Bill (with 18% GST)</TableCell>
                  <TableCell>Paid Amount</TableCell>
                  <TableCell>Outstanding</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.invoiceNo} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{inv.invoiceNo}</TableCell>
                    <TableCell>{inv.caseTitle}</TableCell>
                    <TableCell>₹{inv.totalAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell sx={{ color: "success.main", fontWeight: "bold" }}>₹{inv.paidAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell sx={{ color: inv.outstandingBalance > 0 ? "error.main" : "text.secondary", fontWeight: "bold" }}>
                      ₹{inv.outstandingBalance.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={inv.status}
                        size="small"
                        color={inv.status === "Paid" ? "success" : inv.status === "Partial" ? "warning" : "error"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {inv.outstandingBalance > 0 && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<PaymentIcon />}
                            onClick={() => handleOpenPay(inv)}
                          >
                            Pay Online
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => printReceipt(inv, transactions.find((t) => t.invoiceNo === inv.invoiceNo))}
                        >
                          Receipt
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* TAB 1: Admin Governance View */}
        {tabIndex === 1 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Admin Master Revenue Settlement Matrix (70:30 Split & 10% TDS)
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Net Collections (excl GST)</Typography>
                  <Typography variant="h6" fontWeight="bold">₹{revData.netCollectedNoGST?.toLocaleString("en-IN") || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Advocate TDS Deduction (10% under Sec 194J)</Typography>
                  <Typography variant="h6" fontWeight="bold" color="error.main">₹{revData.tdsDeduction?.toLocaleString("en-IN") || 0}</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Refund Requests</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Refund ID</TableCell>
                  <TableCell>Invoice No</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {refunds.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">No pending refund requests</TableCell></TableRow>
                ) : (
                  refunds.map((r) => (
                    <TableRow key={r.refundId}>
                      <TableCell sx={{ fontFamily: "monospace" }}>{r.refundId}</TableCell>
                      <TableCell>{r.invoiceNo}</TableCell>
                      <TableCell>{r.clientName}</TableCell>
                      <TableCell>₹{r.refundAmount.toLocaleString("en-IN")}</TableCell>
                      <TableCell><Chip label={r.status} size="small" color={r.status === "Approved" ? "success" : "warning"} /></TableCell>
                      <TableCell>
                        {r.status !== "Approved" && (
                          <Button size="small" variant="contained" color="success" onClick={() => handleApproveRefund(r.refundId)}>
                            Approve Refund
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* TAB 2: Advocate View */}
        {tabIndex === 2 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Advocate Counsel Earnings & Settlement Statements
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">Gross Advocate Share (70%)</Typography>
                  <Typography variant="h5" fontWeight="bold">₹{revData.advocatePoolRaw?.toLocaleString("en-IN") || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">TDS Deducted (10%)</Typography>
                  <Typography variant="h5" fontWeight="bold" color="error.main">₹{revData.tdsDeduction?.toLocaleString("en-IN") || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">Net Bank Payout</Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">₹{revData.netAdvocatePayout?.toLocaleString("en-IN") || 0}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* TAB 3: Transactions Ledger */}
        {tabIndex === 3 && (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Master Payment Transaction Ledger
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Invoice No</TableCell>
                  <TableCell>Client Name</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Gateway Ref</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.transactionId} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{t.transactionId}</TableCell>
                    <TableCell>{t.invoiceNo}</TableCell>
                    <TableCell>{t.clientName}</TableCell>
                    <TableCell sx={{ color: "success.main", fontWeight: "bold" }}>₹{t.amount.toLocaleString("en-IN")}</TableCell>
                    <TableCell>{t.paymentMethod}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{t.gatewayRef}</TableCell>
                    <TableCell>{new Date(t.timestamp).toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* Pay Online Dialog */}
        <Dialog open={payModalOpen} onClose={() => setPayModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Complete Online Payment</DialogTitle>
          <DialogContent>
            {paySuccessMsg ? (
              <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ mt: 2 }}>
                {paySuccessMsg}
              </Alert>
            ) : (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Invoice: {selectedInvoice?.invoiceNo}</Typography>
                <Typography variant="h6" color="primary.main">
                  Amount Due: ₹{(selectedInvoice?.outstandingBalance || selectedInvoice?.totalAmount || 0).toLocaleString("en-IN")}
                </Typography>

                {/* UPI QR Display */}
                {qrDetails && (
                  <Paper variant="outlined" sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Scan UPI QR Code with Google Pay / PhonePe / Paytm</Typography>
                    <img src={qrDetails.qrImageUrl} alt="UPI QR" style={{ width: 180, height: 180, margin: "auto" }} />
                    <Typography variant="caption" display="block" color="text.secondary">UPI ID: {qrDetails.upiId}</Typography>
                  </Paper>
                )}

                <TextField
                  select
                  fullWidth
                  label="Select Payment Method"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  type="number"
                  label="Payment Amount (₹)"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPayModalOpen(false)}>Cancel</Button>
            <Button variant="contained" color="success" onClick={handleExecutePayment}>
              Execute Payment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Invoice Modal */}
        <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Enterprise Legal Invoice</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Case Title / Matter"
                value={newInv.caseTitle}
                onChange={(e) => setNewInv({ ...newInv, caseTitle: e.target.value })}
              />
              <TextField
                fullWidth
                label="Client Name"
                value={newInv.clientName}
                onChange={(e) => setNewInv({ ...newInv, clientName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Empaneled Advocate"
                value={newInv.advocateName}
                onChange={(e) => setNewInv({ ...newInv, advocateName: e.target.value })}
              />
              <TextField
                fullWidth
                label="Promo / Coupon Code (e.g. ICJEARLY10, LEGAL20)"
                value={newInv.couponCode}
                onChange={(e) => setNewInv({ ...newInv, couponCode: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateInvoice}>
              Generate Invoice
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}
