"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";

import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import StorefrontIcon from "@mui/icons-material/Storefront";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { DetailedLead } from "@/types/lead";

export default function MyLeadsPage() {
  const [leads, setLeads] = useState<DetailedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [selectedLead, setSelectedLead] = useState<DetailedLead | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundStatusMessage, setRefundStatusMessage] = useState("");

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await leadMarketplaceService.getMyLeads({ page_size: 50 });
      setLeads(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleOpenRefund = (lead: DetailedLead) => {
    setSelectedLead(lead);
    setRefundReason("");
    setRefundStatusMessage("");
    setRefundModalOpen(true);
  };

  const handleSubmitRefund = async () => {
    if (!selectedLead || !refundReason.trim()) return;
    setSubmittingRefund(true);
    try {
      await leadMarketplaceService.requestRefund(selectedLead.id, refundReason);
      setRefundStatusMessage("Refund request submitted for admin review.");
      setTimeout(() => {
        setRefundModalOpen(false);
        loadLeads();
      }, 1500);
    } catch (err: any) {
      setRefundStatusMessage(err?.message || "Failed to submit refund request.");
    } finally {
      setSubmittingRefund(false);
    }
  };

  return (
    <PortalPageShell
      title="My Accepted Leads"
      subtitle="Exclusive legal inquiries accepted by you. Unlocked client contact details, matter progress, and document access."
      actions={
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, next) => next && setViewMode(next)}
            size="small"
            sx={{ bgcolor: "#f8fafc" }}
          >
            <ToggleButton value="grid" aria-label="cards view">
              <Tooltip title="Cards View">
                <GridViewIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <Tooltip title="List View">
                <ViewListIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            component={Link}
            href="/dashboard/professional/leads"
            variant="contained"
            size="small"
            startIcon={<StorefrontIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Marketplace
          </Button>
        </Stack>
      }
    >
      <SectionCard
        title="Accepted Leads Portfolio"
        subtitle={`${leads.length} matter${leads.length !== 1 ? "s" : ""} under your representation`}
        icon={<ContactPhoneIcon sx={{ color: "#2563eb", fontSize: 20 }} />}
        noPadding
      >
        {loading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={<ContactPhoneIcon sx={{ fontSize: 48, color: "#94a3b8" }} />}
            message="No Accepted Leads Yet"
            description="Explore the Lead Marketplace to review verified inquiries and accept matters in your practice domain using tokens."
            action={
              <Button
                component={Link}
                href="/dashboard/professional/leads"
                variant="contained"
                size="small"
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Explore Lead Marketplace
              </Button>
            }
          />
        ) : viewMode === "grid" ? (
          /* CARDS VIEW */
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2.5}>
              {leads.map((lead) => (
                <Card
                  key={lead.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: "#e2e8f0",
                    p: 2,
                    bgcolor: "#fff",
                    transition: "border-color 0.15s ease",
                    "&:hover": { borderColor: "#93c5fd" },
                  }}
                >
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "3fr 4fr 2fr 3fr" }, gap: 2, alignItems: "center" }}>
                    {/* Left: Lead Identity & Category */}
                    <Box>
                      <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 700 }}>
                        {lead.lead_id}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {lead.category}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip
                          label={lead.urgency}
                          size="small"
                          color={lead.urgency.toLowerCase() === "high" || lead.urgency.toLowerCase() === "critical" ? "error" : "warning"}
                          sx={{ fontSize: "0.7rem", height: 20, fontWeight: 600 }}
                        />
                        <Chip
                          label={lead.city_name || "Location"}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      </Stack>
                    </Box>

                    {/* Middle: Client Contact Details */}
                    <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #f1f5f9" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {lead.client_name || "Client"}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 0.5, color: "#475569", fontSize: "0.8rem", flexWrap: "wrap" }}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                          <PhoneIcon sx={{ fontSize: 15, color: "#16a34a" }} />
                          <a href={`tel:${lead.client_mobile}`} style={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}>
                            {lead.client_mobile || "No phone"}
                          </a>
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                          <EmailIcon sx={{ fontSize: 15, color: "#2563eb" }} />
                          <a href={`mailto:${lead.client_email}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {lead.client_email || "No email"}
                          </a>
                        </Stack>
                      </Stack>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                        Preferred: <strong>{lead.client_preferred_contact || "Phone"}</strong>
                      </Typography>
                    </Box>

                    {/* Right-Middle: Receipt and Tokens */}
                    <Box>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                        RECEIPT REF
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {lead.acceptance_info?.receipt_reference || "Direct"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>
                        Tokens Spent: <strong>{lead.acceptance_info?.tokens_spent || lead.tokens_required || 1}</strong>
                      </Typography>
                    </Box>

                    {/* Right: Actions */}
                    <Stack spacing={1} direction={{ xs: "row", md: "column" }} sx={{ justifyContent: "flex-end" }}>
                      <Button
                        component={Link}
                        href={`/dashboard/professional/leads/${lead.id}`}
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: "none", fontSize: "0.8rem", fontWeight: 600 }}
                      >
                        View Matter & Documents
                      </Button>
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => handleOpenRefund(lead)}
                        sx={{ textTransform: "none", fontSize: "0.75rem" }}
                      >
                        Request Refund / Conflict
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Box>
        ) : (
          /* TABLE LIST VIEW */
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>LEAD ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>CATEGORY</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>URGENCY</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>CLIENT NAME</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>CONTACT</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>LOCATION</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>TOKENS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", textAlign: "right" }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: "#2563eb", fontSize: "0.8rem" }}>
                      {lead.lead_id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                      {lead.category}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={lead.urgency}
                        size="small"
                        color={lead.urgency.toLowerCase() === "high" || lead.urgency.toLowerCase() === "critical" ? "error" : "warning"}
                        sx={{ fontWeight: 600, fontSize: "0.68rem", height: 20 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem" }}>
                      {lead.client_name || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      {lead.client_mobile || lead.client_email || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {lead.city_name}, {lead.state_name}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1d4ed8", fontSize: "0.8rem" }}>
                      {lead.acceptance_info?.tokens_spent || lead.tokens_required || 1}
                    </TableCell>
                    <TableCell sx={{ textAlign: "right" }}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <Button
                          component={Link}
                          href={`/dashboard/professional/leads/${lead.id}`}
                          variant="outlined"
                          size="small"
                          sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.3 }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() => handleOpenRefund(lead)}
                          sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.3 }}
                        >
                          Refund
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      {/* Refund Request Modal */}
      <Dialog
        open={refundModalOpen}
        onClose={() => !submittingRefund && setRefundModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
          Request Refund or Report Conflict
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {refundStatusMessage && <Alert severity="info">{refundStatusMessage}</Alert>}
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              If you have a professional conflict of interest or this lead is invalid, submit your reason below for Admin review.
            </Typography>
            <TextField
              label="Reason for Refund / Release"
              multiline
              rows={3}
              fullWidth
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Existing representation of opposite party, client unreachable, etc."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={() => setRefundModalOpen(false)} disabled={submittingRefund} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitRefund}
            disabled={submittingRefund || !refundReason.trim()}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {submittingRefund ? <CircularProgress size={18} color="inherit" /> : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </PortalPageShell>
  );
}
