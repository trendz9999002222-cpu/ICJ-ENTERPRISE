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
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { adminLeadsService } from "@/services/admin/adminLeads.service";

const STATUS_COLOR: Record<string, "success" | "error" | "warning" | "info" | "default"> = {
  created: "info",
  paid: "success",
  failed: "error",
  refunded: "warning",
  pending: "warning",
  approved: "success",
  rejected: "error",
  processing: "info",
};

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState(0);

  // Payments
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsCount, setPaymentsCount] = useState(0);
  const [paymentsPage, setPaymentsPage] = useState(0);
  const [payStatusFilter, setPayStatusFilter] = useState("all");
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  // Refunds
  const [refunds, setRefunds] = useState<any[]>([]);
  const [refundsCount, setRefundsCount] = useState(0);
  const [refundsPage, setRefundsPage] = useState(0);
  const [refundStatusFilter, setRefundStatusFilter] = useState("all");
  const [refundsLoading, setRefundsLoading] = useState(true);

  // Refund Modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [refundDecision, setRefundDecision] = useState<"approve" | "reject">("approve");
  const [refundNotes, setRefundNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState("");
  const [processSuccess, setProcessSuccess] = useState("");

  const PAGE_SIZE = 10;

  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await adminLeadsService.listPayments({
        page: paymentsPage + 1,
        page_size: PAGE_SIZE,
        status: payStatusFilter !== "all" ? payStatusFilter : undefined,
      });
      const results = res?.results || (Array.isArray(res) ? res : []);
      setPayments(results);
      setPaymentsCount(res?.count || results.length);
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const loadRefunds = async () => {
    setRefundsLoading(true);
    try {
      const res = await adminLeadsService.listRefunds({
        page: refundsPage + 1,
        page_size: PAGE_SIZE,
        status: refundStatusFilter !== "all" ? refundStatusFilter : undefined,
      });
      const results = res?.results || (Array.isArray(res) ? res : []);
      setRefunds(results);
      setRefundsCount(res?.count || results.length);
    } catch (err) {
      console.error(err);
    } finally {
      setRefundsLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, [paymentsPage, payStatusFilter]);
  useEffect(() => { loadRefunds(); }, [refundsPage, refundStatusFilter]);

  const openRefundModal = (refund: any, decision: "approve" | "reject") => {
    setSelectedRefund(refund);
    setRefundDecision(decision);
    setRefundNotes("");
    setProcessError("");
    setProcessSuccess("");
    setRefundModalOpen(true);
  };

  const submitRefundDecision = async () => {
    if (!selectedRefund) return;
    setProcessing(true);
    setProcessError("");
    try {
      await adminLeadsService.processRefund(selectedRefund.id, refundDecision === "approve", refundNotes);
      setProcessSuccess(`Refund ${refundDecision === "approve" ? "approved" : "rejected"} successfully.`);
      loadRefunds();
      setTimeout(() => setRefundModalOpen(false), 1200);
    } catch (err: any) {
      setProcessError(err?.message || "Failed to process refund.");
    } finally {
      setProcessing(false);
    }
  };

  const paymentColumns: AdminTableColumn<any>[] = [
    {
      key: "order_id",
      label: "Order ID",
      render: (row) => (
        <Typography sx={{ fontSize: "0.75rem", fontFamily: "monospace", color: "text.secondary" }}>{row.order_id || row.id?.slice(0, 8)}</Typography>
      ),
    },
    {
      key: "purpose",
      label: "Purpose",
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>{row.purpose?.replace(/_/g, " ") || "Payment"}</Typography>
          {row.professional_email && (
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{row.professional_email}</Typography>
          )}
        </Box>
      ),
    },
    {
      key: "amount_inr",
      label: "Amount",
      render: (row) => (
        <Typography sx={{ fontWeight: 700, color: "primary.main", fontSize: "0.875rem" }}>
          ₹{(row.amount_inr || row.amount_paise / 100 || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Chip label={(row.status || "unknown").toUpperCase()} size="small" color={STATUS_COLOR[row.status] ?? "default"} />
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

  const refundColumns: AdminTableColumn<any>[] = [
    {
      key: "id",
      label: "Refund ID",
      render: (row) => (
        <Typography sx={{ fontSize: "0.75rem", fontFamily: "monospace", color: "text.secondary" }}>{row.id?.slice(0, 8)}...</Typography>
      ),
    },
    {
      key: "professional_email",
      label: "Professional",
      render: (row) => (
        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>{row.professional_email || row.acceptance?.professional_email || "—"}</Typography>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.reason || "—"}</Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Chip label={(row.status || "pending").toUpperCase()} size="small" color={STATUS_COLOR[row.status] ?? "warning"} />
      ),
    },
    {
      key: "created_at",
      label: "Requested",
      render: (row) => (
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{new Date(row.created_at).toLocaleString("en-IN")}</Typography>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) =>
        row.status === "pending" ? (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />}
              onClick={() => openRefundModal(row, "approve")} sx={{ fontSize: "0.7rem", px: 1 }}>
              Approve
            </Button>
            <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
              onClick={() => openRefundModal(row, "reject")} sx={{ fontSize: "0.7rem", px: 1 }}>
              Reject
            </Button>
          </Stack>
        ) : (
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Processed</Typography>
        ),
    },
  ];

  return (
    <AdminPageShell
      title="Payments & Refunds"
      subtitle="Monitor all payment orders and process professional refund requests."
    >
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #e2e8f0" }}>
        <Tab icon={<ReceiptLongIcon fontSize="small" />} iconPosition="start" label="Payment Orders" />
        <Tab icon={<AssignmentReturnIcon fontSize="small" />} iconPosition="start" label={`Refund Requests${refunds.filter((r) => r.status === "pending").length ? ` (${refunds.filter((r) => r.status === "pending").length})` : ""}`} />
      </Tabs>

      {tab === 0 && (
        <AdminDataTable<any>
          columns={paymentColumns}
          rows={payments}
          loading={paymentsLoading}
          filterSlot={
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select value={payStatusFilter} label="Status" onChange={(e) => { setPayStatusFilter(e.target.value); setPaymentsPage(0); }}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="created">Created</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">{paymentsCount} orders</Typography>
            </Stack>
          }
          getRowKey={(row) => row.id || row.order_id}
          pagination={{
            totalCount: paymentsCount,
            page: paymentsPage,
            rowsPerPage: PAGE_SIZE,
            onPageChange: setPaymentsPage,
          }}
        />
      )}

      {tab === 1 && (
        <AdminDataTable<any>
          columns={refundColumns}
          rows={refunds}
          loading={refundsLoading}
          filterSlot={
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select value={refundStatusFilter} label="Status" onChange={(e) => { setRefundStatusFilter(e.target.value); setRefundsPage(0); }}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">{refundsCount} requests</Typography>
            </Stack>
          }
          getRowKey={(row) => row.id}
          pagination={{
            totalCount: refundsCount,
            page: refundsPage,
            rowsPerPage: PAGE_SIZE,
            onPageChange: setRefundsPage,
          }}
        />
      )}

      {/* Refund Decision Modal */}
      <Dialog open={refundModalOpen} onClose={() => setRefundModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            {refundDecision === "approve" ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
            <span>{refundDecision === "approve" ? "Approve Refund" : "Reject Refund"}</span>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRefund && (
            <Box sx={{ mb: 2, p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedRefund.professional_email || "Professional"}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Reason: {selectedRefund.reason}</Typography>
            </Box>
          )}
          <TextField
            label="Admin Notes (optional)"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={refundNotes}
            onChange={(e) => setRefundNotes(e.target.value)}
            placeholder="Add notes for this decision..."
            sx={{ mt: 1 }}
          />
          {processError && <Alert severity="error" sx={{ mt: 2 }}>{processError}</Alert>}
          {processSuccess && <Alert severity="success" sx={{ mt: 2 }}>{processSuccess}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setRefundModalOpen(false)} disabled={processing}>Cancel</Button>
          <Button
            variant="contained"
            color={refundDecision === "approve" ? "success" : "error"}
            onClick={submitRefundDecision}
            disabled={processing}
          >
            {processing ? "Processing..." : refundDecision === "approve" ? "Confirm Approval" : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
