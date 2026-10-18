"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ReceiptIcon from "@mui/icons-material/Receipt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import {
  donationService,
  AdminDonationItem,
  AdminDonationStats,
  OfficialReceiptData,
} from "@/services/dashboard/donations.service";
import DonationReceiptModal from "@/components/features/donations/DonationReceiptModal";

export default function AdminDonationsPage() {
  // Stats
  const [stats, setStats] = useState<AdminDonationStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Table Data
  const [donations, setDonations] = useState<AdminDonationItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loadingTable, setLoadingTable] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [fundFilter, setFundFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Modals
  const [auditItem, setAuditItem] = useState<{
    donation: AdminDonationItem;
    receipt: OfficialReceiptData;
    raw_response: any;
  } | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState<boolean>(false);
  const [loadingAuditId, setLoadingAuditId] = useState<string | null>(null);

  const [activeReceipt, setActiveReceipt] = useState<OfficialReceiptData | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);

  // Load KPI Stats
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await donationService.fetchAdminStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load donation stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Load Table
  const loadDonations = useCallback(async () => {
    setLoadingTable(true);
    try {
      const res = await donationService.fetchAdminDonations({
        page,
        page_size: pageSize,
        search: searchQuery || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        fund: fundFilter !== "ALL" ? fundFilter : undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setDonations(res.results);
      setTotalCount(res.count);
    } catch (err) {
      console.error("Failed to load admin donations:", err);
    } finally {
      setLoadingTable(false);
    }
  }, [page, searchQuery, statusFilter, fundFilter, roleFilter, startDate, endDate]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  // View Audit Detail
  const handleViewAudit = async (donationId: string) => {
    setLoadingAuditId(donationId);
    try {
      const data = await donationService.fetchAdminDonationDetail(donationId);
      setAuditItem(data);
      setAuditModalOpen(true);
    } catch (err: any) {
      alert("Failed to load audit detail: " + (err.message || "Unknown error"));
    } finally {
      setLoadingAuditId(null);
    }
  };

  // Open 80G Receipt
  const handleOpenReceipt = async (donationId: string) => {
    try {
      const data = await donationService.fetchReceipt(donationId);
      setActiveReceipt(data);
      setReceiptModalOpen(true);
    } catch (err: any) {
      alert("Unable to open receipt: " + err.message);
    }
  };

  // Handle Export CSV
  const handleExportCsv = () => {
    const url = donationService.getExportCsvUrl({
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      fund: fundFilter !== "ALL" ? fundFilter : undefined,
    });
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <VolunteerActivismIcon sx={{ color: "#2563eb", fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Trust Donations & 80G Management
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Audit all charitable donations, track 80G compliance, and manage trust corpus contributions.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCsv}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              borderColor: "#cbd5e1",
              color: "#0f172a",
              "&:hover": { borderColor: "#0f172a", bgcolor: "#fff" },
            }}
          >
            Export Form 10BD CSV
          </Button>

          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => {
              loadStats();
              loadDonations();
            }}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              bgcolor: "#2563eb",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    Total Raised (All-Time)
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
                    {loadingStats ? "..." : `₹${(stats?.total_raised || 0).toLocaleString("en-IN")}`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#16a34a", fontWeight: 600 }}>
                    {stats?.total_donations || 0} Successful Donations
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: "#eff6ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AccountBalanceWalletIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    This Month Collection
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
                    {loadingStats ? "..." : `₹${(stats?.month_raised || 0).toLocaleString("en-IN")}`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    {stats?.month_count || 0} Donors this month
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: "#f0fdf4",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUpIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    Registered Donors
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
                    {loadingStats ? "..." : stats?.unique_donors || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Members & Professionals
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: "#fdf4ff",
                    color: "#c026d3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PeopleAltIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 2.5, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    80G Certificates Issued
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.5 }}>
                    {loadingStats ? "..." : stats?.total_80g_certificates || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 600 }}>
                    ₹{(stats?.total_80g_amount || 0).toLocaleString("en-IN")} Claimed
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    bgcolor: "#fef3c7",
                    color: "#d97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ReceiptIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Card with Search & Filters */}
      <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
        <CardContent sx={{ p: 3 }}>
          {/* Filters Bar */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 3.5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search donor name, email, PAN, txn ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="SUCCESS">Success</MenuItem>
                <MenuItem value="INITIATED">Initiated</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Fund Category"
                value={fundFilter}
                onChange={(e) => setFundFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Funds</MenuItem>
                <MenuItem value="LEGAL_AID">Legal Aid Fund</MenuItem>
                <MenuItem value="CYBER_CRIME">Cyber Crime Fund</MenuItem>
                <MenuItem value="PRO_BONO">Pro Bono Fund</MenuItem>
                <MenuItem value="CORPUS_FUND">Corpus Fund</MenuItem>
                <MenuItem value="GENERAL">General Welfare</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Table */}
          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Receipt No.</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Donor Details</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Fund / Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Amount (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: "#475569" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingTable ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                      <Typography variant="body2" sx={{ color: "#64748b", mt: 1 }}>
                        Loading donations...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : donations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <VolunteerActivismIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        No donation records match the selected filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  donations.map((item) => {
                    const roles = item.user_info?.roles || [];
                    const roleBadge = roles.includes("professional")
                      ? "Professional"
                      : roles.includes("member")
                      ? "Member"
                      : "User";

                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}
                          >
                            {item.receipt_number || "—"}
                          </Typography>
                          {item.donor_pan && (
                            <Chip
                              label={`PAN: ${item.donor_pan}`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                bgcolor: "#f1f5f9",
                                color: "#334155",
                                mt: 0.5,
                              }}
                            />
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e293b" }}>
                            {item.is_anonymous ? (
                              <span style={{ fontStyle: "italic", color: "#64748b" }}>Anonymous Benefactor</span>
                            ) : (
                              item.donor_name
                            )}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                            {item.donor_email}
                          </Typography>
                          {item.donor_phone && (
                            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                              {item.donor_phone}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={roleBadge}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.72rem",
                              bgcolor: roleBadge === "Professional" ? "#fdf4ff" : "#eff6ff",
                              color: roleBadge === "Professional" ? "#9333ea" : "#2563eb",
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e40af", maxWidth: 200 }}>
                            {item.fund_category_display}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                            ₹{Number(item.amount).toLocaleString("en-IN")}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={item.status}
                            size="small"
                            color={
                              item.status === "SUCCESS"
                                ? "success"
                                : item.status === "INITIATED"
                                ? "warning"
                                : "error"
                            }
                            sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="caption" sx={{ color: "#475569", display: "block" }}>
                            {new Date(item.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                            {new Date(item.created_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <Tooltip title="View Full Audit Logs">
                              <IconButton
                                size="small"
                                onClick={() => handleViewAudit(item.id)}
                                disabled={loadingAuditId === item.id}
                                sx={{ color: "#2563eb", border: "1px solid #e2e8f0" }}
                              >
                                {loadingAuditId === item.id ? <CircularProgress size={16} /> : <VisibilityIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>

                            {item.status === "SUCCESS" && (
                              <Tooltip title="Print / Download 80G Receipt">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenReceipt(item.id)}
                                  sx={{ color: "#16a34a", border: "1px solid #e2e8f0" }}
                                >
                                  <ReceiptIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalCount > pageSize && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Pagination
                count={Math.ceil(totalCount / pageSize)}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Audit Detail Dialog */}
      <Dialog
        open={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle
          component="div"
          sx={{ bgcolor: "#0f172a", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography component="div" sx={{ fontWeight: 800, fontSize: "1.05rem" }}>
            Donation Audit Record & Gateway Payload
          </Typography>
          <IconButton size="small" onClick={() => setAuditModalOpen(false)} sx={{ color: "#94a3b8" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {auditItem && (
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Receipt Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: "monospace" }}>
                    {auditItem.donation.receipt_number || "PENDING"}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Amount & Status
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 800, color: "#16a34a" }}>
                    ₹{Number(auditItem.donation.amount).toLocaleString("en-IN")} ({auditItem.donation.status})
                  </Typography>
                </Grid>
              </Grid>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                  Donor Profile & 80G Tax Data
                </Typography>
                <Grid container spacing={1.5} sx={{ fontSize: "0.85rem" }}>
                  <Grid size={{ xs: 6 }}>
                    <strong>Name:</strong> {auditItem.donation.donor_name}
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <strong>PAN:</strong> {auditItem.donation.donor_pan || "N/A"}
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <strong>Email:</strong> {auditItem.donation.donor_email}
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <strong>Phone:</strong> {auditItem.donation.donor_phone || "N/A"}
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <strong>Address:</strong> {auditItem.donation.donor_address || "N/A"}{" "}
                    {auditItem.donation.donor_state ? `, ${auditItem.donation.donor_state}` : ""}{" "}
                    {auditItem.donation.donor_pincode ? ` - ${auditItem.donation.donor_pincode}` : ""}
                  </Grid>
                  {auditItem.donation.notes && (
                    <Grid size={{ xs: 12 }}>
                      <strong>Dedication / Notes:</strong> {auditItem.donation.notes}
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                  Easebuzz Payment Gateway Logs
                </Typography>
                <Grid container spacing={1.5} sx={{ fontSize: "0.85rem" }}>
                  <Grid size={{ xs: 6 }}>
                    <strong>Transaction ID (TxnID):</strong> {auditItem.donation.easebuzz_txnid}
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <strong>Easebuzz Payment ID:</strong> {auditItem.donation.easebuzz_payment_id || "N/A"}
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <strong>Payment Mode:</strong> {auditItem.donation.payment_mode}
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <strong>Bank Ref No:</strong> {auditItem.donation.bank_ref_num || "N/A"}
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                  Raw Gateway Response Payload
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    p: 2,
                    bgcolor: "#0f172a",
                    color: "#38bdf8",
                    borderRadius: 1.5,
                    fontSize: "0.75rem",
                    overflowX: "auto",
                    maxHeight: 180,
                  }}
                >
                  {JSON.stringify(auditItem.raw_response || {}, null, 2)}
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: "#f8fafc" }}>
          {auditItem?.donation.status === "SUCCESS" && (
            <Button
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={() => {
                setActiveReceipt(auditItem.receipt);
                setAuditModalOpen(false);
                setReceiptModalOpen(true);
              }}
              sx={{ bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" }, textTransform: "none", fontWeight: 700 }}
            >
              Open 80G Receipt
            </Button>
          )}
          <Button onClick={() => setAuditModalOpen(false)} sx={{ textTransform: "none", color: "#64748b" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* 80G Receipt Modal */}
      <DonationReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={activeReceipt}
      />
    </Box>
  );
}
