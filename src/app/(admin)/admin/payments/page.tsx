"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
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
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import SearchIcon from "@mui/icons-material/Search";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { adminLeadsService } from "@/services/admin/adminLeads.service";
import { membershipOnboardingAdminService } from "@/services/admin/membershipOnboarding.service";

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

const PAGE_SIZE = 10;

function PaymentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");

  useEffect(() => {
    if (
      initialTabParam === "membership-settings" ||
      initialTabParam === "subscriptions" ||
      initialTabParam === "settings" ||
      initialTabParam === "membership-fee"
    ) {
      router.replace("/admin/lead-plans?tab=membership-fee");
    }
  }, [initialTabParam, router]);

  const getInitialTab = () => {
    if (initialTabParam === "refunds") {
      return 2;
    }
    if (initialTabParam === "membership-payments" || initialTabParam === "memberships") {
      return 1;
    }
    return 0;
  };

  const [tab, setTab] = useState(getInitialTab);

  // 1. Professional Payments
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsCount, setPaymentsCount] = useState(0);
  const [paymentsPage, setPaymentsPage] = useState(0);
  const [payStatusFilter, setPayStatusFilter] = useState("all");
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  // 2. Membership Payments
  const [membershipPayments, setMembershipPayments] = useState<any[]>([]);
  const [membershipCount, setMembershipCount] = useState(0);
  const [membershipPage, setMembershipPage] = useState(0);
  const [membershipStatusFilter, setMembershipStatusFilter] = useState("all");
  const [membershipSearch, setMembershipSearch] = useState("");
  const [membershipLoading, setMembershipLoading] = useState(false);

  // 3. Refunds
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

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Load Professional Payments
  const loadPayments = useCallback(async () => {
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
  }, [paymentsPage, payStatusFilter]);

  // Load Membership Payments
  const loadMembershipPayments = useCallback(async () => {
    setMembershipLoading(true);
    try {
      const res = await membershipOnboardingAdminService.listPayments({
        page: membershipPage + 1,
        page_size: PAGE_SIZE,
        status: membershipStatusFilter !== "all" ? membershipStatusFilter : undefined,
        search: membershipSearch.trim() || undefined,
      });
      const results = res?.results || (Array.isArray(res) ? res : []);
      setMembershipPayments(results);
      setMembershipCount(res?.count || results.length);
    } catch (err) {
      console.error(err);
    } finally {
      setMembershipLoading(false);
    }
  }, [membershipPage, membershipStatusFilter, membershipSearch]);

  // Load Refunds
  const loadRefunds = useCallback(async () => {
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
  }, [refundsPage, refundStatusFilter]);

  useEffect(() => {
    if (tab === 0) loadPayments();
  }, [tab, loadPayments]);

  useEffect(() => {
    if (tab === 1) loadMembershipPayments();
  }, [tab, loadMembershipPayments]);

  useEffect(() => {
    if (tab === 2) loadRefunds();
  }, [tab, loadRefunds]);

  // Refund Modal handlers
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
    setProcessSuccess("");
    try {
      await adminLeadsService.processRefund(selectedRefund.id, refundDecision === "approve", refundNotes);
      setProcessSuccess(`Refund request ${refundDecision === "approve" ? "approved" : "rejected"} successfully.`);
      await loadRefunds();
      setTimeout(() => setRefundModalOpen(false), 800);
    } catch (err: any) {
      setProcessError(err?.message || "Failed to process refund decision.");
    } finally {
      setProcessing(false);
    }
  };

  // 1. Professional Payment Columns
  const paymentColumns: AdminTableColumn<any>[] = [
    {
      key: "order_id",
      label: "Order ID",
      render: (row) => (
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.8125rem", fontWeight: 700 }}>
          {row.order_id || row.id?.slice(0, 8)}
        </Typography>
      ),
    },
    {
      key: "purpose",
      label: "Purpose",
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>
            {row.order_type ? row.order_type.replace(/_/g, " ").toUpperCase() : (row.purpose?.replace(/_/g, " ") || "Payment")}
          </Typography>
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
          ₹{Number(row.amount_inr || (row.amount_paise ? row.amount_paise / 100 : 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      key: "gateway",
      label: "Gateway",
      render: (row) => (
        <Chip label={(row.gateway || "easebuzz").toUpperCase()} size="small" variant="outlined" sx={{ fontSize: "0.7rem", height: 22 }} />
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
      label: "Date",
      render: (row) => (
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          {row.created_at ? new Date(row.created_at).toLocaleString("en-IN") : "—"}
        </Typography>
      ),
    },
  ];

  // 2. Membership Payment Columns
  const membershipPaymentColumns: AdminTableColumn<any>[] = [
    {
      key: "id",
      label: "Payment ID / Order",
      render: (row) => (
        <Box>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.8125rem", fontWeight: 700 }}>
            {row.order_id || row.id?.slice(0, 8)}
          </Typography>
          {row.easebuzz_txnid && (
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary" }}>
              Txn: {row.easebuzz_txnid}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "user",
      label: "Citizen / Applicant",
      render: (row) => (
        <Box>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>
            {row.full_name || row.user?.full_name || row.user?.email || "Citizen Applicant"}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            {row.email || row.user?.email || "—"} {row.phone ? `• ${row.phone}` : ""}
          </Typography>
        </Box>
      ),
    },
    {
      key: "amount_inr",
      label: "Fee Amount",
      render: (row) => (
        <Typography sx={{ fontWeight: 700, color: "success.main", fontSize: "0.875rem" }}>
          ₹{Number(row.amount_inr || (row.amount_paise ? row.amount_paise / 100 : row.amount || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      key: "easepayid",
      label: "Easebuzz Pay ID",
      render: (row) => (
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary" }}>
          {row.easepayid || row.transaction_id || "—"}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const rawStatus = (row.status || "created").toLowerCase();
        return (
          <Chip
            label={rawStatus.toUpperCase()}
            size="small"
            color={STATUS_COLOR[rawStatus] ?? "default"}
            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
          />
        );
      },
    },
    {
      key: "created_at",
      label: "Date",
      render: (row) => (
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          {row.created_at ? new Date(row.created_at).toLocaleString("en-IN") : "—"}
        </Typography>
      ),
    },
  ];

  // 3. Refund Columns
  const refundColumns: AdminTableColumn<any>[] = [
    {
      key: "id",
      label: "Refund ID",
      render: (row) => (
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.8125rem", fontWeight: 700 }}>
          {row.id?.slice(0, 8)}
        </Typography>
      ),
    },
    {
      key: "professional",
      label: "Professional",
      render: (row) => (
        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>
          {row.professional_email || row.professional?.email || "Professional"}
        </Typography>
      ),
    },
    {
      key: "amount_inr",
      label: "Amount",
      render: (row) => (
        <Typography sx={{ fontWeight: 700, color: "warning.main", fontSize: "0.875rem" }}>
          ₹{Number(row.amount_inr || (row.amount_paise ? row.amount_paise / 100 : 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (row) => (
        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {row.reason || "—"}
        </Typography>
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
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          {row.created_at ? new Date(row.created_at).toLocaleString("en-IN") : "—"}
        </Typography>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) =>
        row.status === "pending" ? (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => openRefundModal(row, "approve")}
              sx={{ fontSize: "0.7rem", px: 1 }}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => openRefundModal(row, "reject")}
              sx={{ fontSize: "0.7rem", px: 1 }}
            >
              Reject
            </Button>
          </Stack>
        ) : (
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Processed</Typography>
        ),
    },
  ];

  const pendingRefundsCount = refunds.filter((r) => r.status === "pending").length;

  return (
    <AdminPageShell
      title="Payments & Refunds Hub"
      subtitle="Centralized management of Professional payments, Membership onboarding transactions, and refund requests."
    >
      <Box sx={{ borderBottom: "1px solid #e2e8f0", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              minHeight: 44,
              px: 2.5,
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main",
                fontWeight: 700,
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              bgcolor: "primary.main",
            },
          }}
        >
          <Tab icon={<ReceiptLongIcon fontSize="small" />} iconPosition="start" label="Professional Payments" />
          <Tab icon={<CardMembershipIcon fontSize="small" />} iconPosition="start" label="Membership Payments" />
          <Tab
            icon={<AssignmentReturnIcon fontSize="small" />}
            iconPosition="start"
            label={`Refund Requests${pendingRefundsCount ? ` (${pendingRefundsCount})` : ""}`}
          />
        </Tabs>
      </Box>

      {/* TAB 0: Professional Payments */}
      {tab === 0 && (
        <AdminDataTable<any>
          columns={paymentColumns}
          rows={payments}
          loading={paymentsLoading}
          getRowKey={(r) => r.id || r.order_id || r.reference || Math.random().toString()}
          filterSlot={
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={payStatusFilter}
                  label="Status"
                  onChange={(e) => {
                    setPayStatusFilter(e.target.value);
                    setPaymentsPage(0);
                  }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          }
          pagination={{
            totalCount: paymentsCount,
            page: paymentsPage,
            rowsPerPage: PAGE_SIZE,
            onPageChange: setPaymentsPage,
          }}
        />
      )}

      {/* TAB 1: Membership Payments */}
      {tab === 1 && (
        <AdminDataTable<any>
          columns={membershipPaymentColumns}
          rows={membershipPayments}
          loading={membershipLoading}
          getRowKey={(r) => r.id || r.order_id || r.easebuzz_txnid || Math.random().toString()}
          filterSlot={
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, width: "100%" }}>
              <TextField
                size="small"
                placeholder="Search member name, email, phone, Easebuzz PayID..."
                value={membershipSearch}
                onChange={(e) => {
                  setMembershipSearch(e.target.value);
                  setMembershipPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ minWidth: { xs: "100%", sm: 320 } }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={membershipStatusFilter}
                  label="Payment Status"
                  onChange={(e) => {
                    setMembershipStatusFilter(e.target.value);
                    setMembershipPage(0);
                  }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="paid">Paid (Success)</MenuItem>
                  <MenuItem value="created">Created (Pending)</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          }
          pagination={{
            totalCount: membershipCount,
            page: membershipPage,
            rowsPerPage: PAGE_SIZE,
            onPageChange: setMembershipPage,
          }}
        />
      )}

      {/* TAB 2: Refund Requests */}
      {tab === 2 && (
        <AdminDataTable<any>
          columns={refundColumns}
          rows={refunds}
          loading={refundsLoading}
          getRowKey={(r) => r.id || Math.random().toString()}
          filterSlot={
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={refundStatusFilter}
                label="Status"
                onChange={(e) => {
                  setRefundStatusFilter(e.target.value);
                  setRefundsPage(0);
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          }
          pagination={{
            totalCount: refundsCount,
            page: refundsPage,
            rowsPerPage: PAGE_SIZE,
            onPageChange: setRefundsPage,
          }}
        />
      )}

      {/* Refund Decision Modal */}
      <Dialog
        open={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            {refundDecision === "approve" ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
            <span>{refundDecision === "approve" ? "Approve Refund" : "Reject Refund"}</span>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRefund && (
            <Box sx={{ mb: 2, p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedRefund.professional_email || "Professional"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Reason: {selectedRefund.reason}
              </Typography>
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
          <Button onClick={() => setRefundModalOpen(false)} disabled={processing}>
            Cancel
          </Button>
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

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </AdminPageShell>
  );
}

export default function AdminPaymentsPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      }
    >
      <PaymentsPageContent />
    </Suspense>
  );
}
