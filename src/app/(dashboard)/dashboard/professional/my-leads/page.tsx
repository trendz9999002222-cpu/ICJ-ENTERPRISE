"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  InputAdornment,
} from "@mui/material";

import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GavelIcon from "@mui/icons-material/Gavel";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EditNoteIcon from "@mui/icons-material/EditNote";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TollIcon from "@mui/icons-material/Toll";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import SyncAltIcon from "@mui/icons-material/SyncAlt";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { DetailedLead } from "@/types/lead";

const CASE_STAGES = [
  "New Matter",
  "Contacted Client",
  "Consultation Scheduled",
  "Documents Gathered",
  "Legal Drafting",
  "Filed in Court",
  "Hearing Scheduled",
  "Settlement / Negotiation",
  "Matter Resolved",
  "Closed",
];

export default function MyLeadsPage() {
  const [leads, setLeads] = useState<DetailedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  // Selected Lead for Case Management Modal
  const [manageLead, setManageLead] = useState<DetailedLead | null>(null);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const [newProgressNote, setNewProgressNote] = useState("");
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [progressSuccess, setProgressSuccess] = useState("");
  const [progressError, setProgressError] = useState("");

  // Refund Modal State
  const [selectedLead, setSelectedLead] = useState<DetailedLead | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundStatusMessage, setRefundStatusMessage] = useState("");

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await leadMarketplaceService.getMyLeads({ page_size: 50, search: search || undefined });
      setLeads(res.results || []);
    } catch (err) {
      console.error("Failed to load accepted leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [search]);

  const handleOpenManage = (lead: DetailedLead) => {
    setManageLead(lead);
    setSelectedStage(lead.case_stage || "New Matter");
    setNewProgressNote("");
    setProgressSuccess("");
    setProgressError("");
    setManageModalOpen(true);
  };

  const handleSaveProgress = async () => {
    if (!manageLead) return;
    setUpdatingProgress(true);
    setProgressSuccess("");
    setProgressError("");

    try {
      let combinedNotes = manageLead.case_notes || "";
      if (newProgressNote.trim()) {
        const timestamp = new Date().toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const noteEntry = `[${timestamp}] ${newProgressNote.trim()}`;
        combinedNotes = combinedNotes ? `${combinedNotes}\n\n${noteEntry}` : noteEntry;
      }

      const updated = await leadMarketplaceService.updateCaseProgress(manageLead.id, {
        case_stage: selectedStage,
        case_notes: combinedNotes,
      });

      setProgressSuccess("Case progress and notes saved successfully!");
      setNewProgressNote("");
      // Update local state
      setLeads((prev) => prev.map((item) => (item.id === manageLead.id ? { ...item, ...updated } : item)));
      setManageLead((prev) => (prev ? { ...prev, ...updated } : null));

      setTimeout(() => {
        setManageModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setProgressError(err?.message || "Failed to update case progress.");
    } finally {
      setUpdatingProgress(false);
    }
  };

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

  const filteredLeads = leads.filter((l) => {
    if (stageFilter !== "all" && l.case_stage !== stageFilter) {
      return false;
    }
    return true;
  });

  return (
    <PortalPageShell
      title="My Accepted Matters & Leads"
      subtitle="Exclusive legal inquiries accepted by you. Access unlocked client contact details, view documents, manage case milestones, and update case progress notes."
    >
      {/* Top Controls & Search Bar */}
      <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
        <TextField
          size="small"
          placeholder="Search by client name, mobile, lead ID or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: "100%", sm: 380 }, bgcolor: "#fff" }}
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

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 180, bgcolor: "#fff" }}>
            <InputLabel>Filter by Stage</InputLabel>
            <Select value={stageFilter} label="Filter by Stage" onChange={(e) => setStageFilter(e.target.value)}>
              <MenuItem value="all">All Case Stages</MenuItem>
              {CASE_STAGES.map((stg) => (
                <MenuItem key={stg} value={stg}>{stg}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            component={Link}
            href="/dashboard/professional/leads"
            variant="contained"
            size="medium"
            startIcon={<TollIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Explore Lead Marketplace
          </Button>
        </Stack>
      </Box>

      {/* Main Leads List Card */}
      <SectionCard
        title="Active Legal Portfolio"
        subtitle={`${filteredLeads.length} active matter${filteredLeads.length !== 1 ? "s" : ""} under your representation`}
        icon={<ContactPhoneIcon sx={{ color: "#2563eb", fontSize: 22 }} />}
        noPadding
      >
        {loading ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <CircularProgress size={36} />
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
              Loading your accepted matters...
            </Typography>
          </Box>
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            icon={<ContactPhoneIcon sx={{ fontSize: 52, color: "#94a3b8" }} />}
            message={search || stageFilter !== "all" ? "No matching leads found" : "No accepted leads yet"}
            description={
              search || stageFilter !== "all"
                ? "Try adjusting your search criteria or stage filter."
                : "Explore the Lead Marketplace to review verified inquiries and accept matters in your practice domain with your tokens."
            }
            action={
              <Button component={Link} href="/dashboard/professional/leads" variant="contained" size="small" sx={{ textTransform: "none", fontWeight: 700 }}>
                Explore Lead Marketplace
              </Button>
            }
          />
        ) : (
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={3}>
              {filteredLeads.map((lead) => {
                const isReassigned = Boolean(lead.reassignment_notes);
                const hasDocs = Array.isArray(lead.client_documents) && lead.client_documents.length > 0;

                return (
                  <Card
                    key={lead.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      borderColor: "#e2e8f0",
                      p: 2.5,
                      bgcolor: "#fff",
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: "#93c5fd", boxShadow: "0 4px 16px -2px rgba(37,99,235,0.08)" },
                    }}
                  >
                    {/* Header Row: Lead ID, Category, Urgency & Case Stage */}
                    <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
                      <Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                            {lead.category}
                          </Typography>
                          <Chip
                            label={lead.lead_id}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: "#eff6ff", color: "#1d4ed8" }}
                          />
                          <Chip
                            label={lead.urgency.toUpperCase()}
                            size="small"
                            color={lead.urgency.toLowerCase() === "high" || lead.urgency.toLowerCase() === "critical" ? "error" : "warning"}
                            sx={{ fontSize: "0.7rem", height: 22, fontWeight: 700 }}
                          />
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.5, color: "#64748b", fontSize: "0.82rem" }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                          <span>{lead.city_name}, {lead.state_name}</span>
                          <span>•</span>
                          <span>Accepted via {lead.tokens_required ?? 1} Token{(lead.tokens_required ?? 1) > 1 ? "s" : ""}</span>
                          {lead.published_at && (
                            <>
                              <span>•</span>
                              <span>Published: {new Date(lead.published_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                            </>
                          )}
                        </Stack>
                      </Box>

                      {/* Right: Stage Badge & Manage Action */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Chip
                          label={`Stage: ${lead.case_stage || "New Matter"}`}
                          size="medium"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: "0.8rem", borderRadius: 1.5, borderColor: "#3b82f6" }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<EditNoteIcon />}
                          onClick={() => handleOpenManage(lead)}
                          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                        >
                          Manage Case
                        </Button>
                      </Stack>
                    </Box>

                    {/* Reassignment / Handover Alert Banner (Zero Loss) */}
                    {isReassigned && (
                      <Alert
                        severity="info"
                        icon={<SyncAltIcon fontSize="inherit" />}
                        sx={{
                          mb: 2,
                          bgcolor: "#f0fdf4",
                          borderColor: "#86efac",
                          border: "1px solid",
                          "& .MuiAlert-message": { width: "100%" },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#15803d" }}>
                          Handover Matter (Continuous Progression)
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#166534", fontSize: "0.82rem", mt: 0.3 }}>
                          This case was assigned to you with all prior notes, milestones, and client documents preserved.
                          Work continues directly from where the previous professional left off without restarting from zero.
                        </Typography>
                        {lead.reassignment_notes && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: "#ffffff", borderRadius: 1, border: "1px solid #bbf7d0" }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "#15803d", display: "block" }}>
                              TRANSITION HANDOVER NOTES:
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#1e293b", whiteSpace: "pre-wrap" }}>
                              {lead.reassignment_notes}
                            </Typography>
                          </Box>
                        )}
                      </Alert>
                    )}

                    {/* Middle Section: Client Unlocked Card & Problem Summary */}
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" }, gap: 2, mb: 2 }}>
                      {/* Unlocked Client Contact Info Box */}
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "#f8fafc",
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
                          <LockOpenIcon sx={{ color: "#16a34a", fontSize: 18 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                            Unlocked Client Contact Details
                          </Typography>
                        </Stack>

                        <Typography variant="body1" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
                          {lead.client_name || "Client"}
                        </Typography>

                        <Stack spacing={1} sx={{ fontSize: "0.84rem" }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <PhoneIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                            <a
                              href={`tel:${lead.client_mobile}`}
                              style={{ color: "#0f172a", textDecoration: "none", fontWeight: 700 }}
                            >
                              {lead.client_mobile || "Not provided"}
                            </a>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              (Direct Phone)
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <EmailIcon sx={{ fontSize: 16, color: "#2563eb" }} />
                            <a
                              href={`mailto:${lead.client_email}`}
                              style={{ color: "#2563eb", textDecoration: "none" }}
                            >
                              {lead.client_email || "Not provided"}
                            </a>
                          </Stack>

                          <Typography variant="caption" sx={{ color: "#64748b", display: "block", pt: 0.5 }}>
                            Preferred Channel: <strong>{lead.client_preferred_contact || "Phone"}</strong>
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Matter Description / Problem Overview */}
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "#fbfcfe",
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", display: "block", mb: 0.5 }}>
                            MATTER PROBLEM STATEMENT
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#334155",
                              lineHeight: 1.6,
                              maxHeight: 110,
                              overflowY: "auto",
                              whiteSpace: "pre-line",
                            }}
                          >
                            {lead.full_description || lead.anonymized_summary || "No specific details provided."}
                          </Typography>
                        </Box>

                        {/* Documents Indicator */}
                        <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px solid #f1f5f9" }}>
                          {hasDocs ? (
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "#2563eb", fontSize: "0.8rem", fontWeight: 600 }}>
                              <AttachFileIcon sx={{ fontSize: 16 }} />
                              <span>{(lead.client_documents?.length || 0)} Client Case Document{(lead.client_documents?.length || 0) !== 1 ? "s" : ""} Attached</span>
                            </Stack>
                          ) : (
                            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                              No documents attached to intake inquiry.
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    {/* Cumulative Notes Preview if any */}
                    {lead.case_notes && (
                      <Box sx={{ mb: 2, p: 1.5, bgcolor: "#fffbeb", borderRadius: 1.5, border: "1px solid #fef3c7" }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: "#92400e", display: "block", mb: 0.5 }}>
                          LATEST CASE PROGRESS LOG:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.82rem",
                            color: "#78350f",
                            whiteSpace: "pre-wrap",
                            maxHeight: 90,
                            overflowY: "auto",
                          }}
                        >
                          {lead.case_notes}
                        </Typography>
                      </Box>
                    )}

                    {/* Bottom Actions Row */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: "1px solid #f1f5f9" }}>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        Receipt Reference: <strong>{lead.acceptance_info?.receipt_reference || "Direct Token Unlock"}</strong>
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <Button
                          component={Link}
                          href={`/dashboard/professional/leads/${lead.id}`}
                          variant="text"
                          size="small"
                          sx={{ textTransform: "none", fontSize: "0.8rem", color: "#2563eb" }}
                        >
                          Full Case Dossier →
                        </Button>
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          onClick={() => handleOpenRefund(lead)}
                          sx={{ textTransform: "none", fontSize: "0.78rem" }}
                        >
                          Report Conflict / Request Refund
                        </Button>
                      </Stack>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        )}
      </SectionCard>

      {/* Case Management & Progress Dialog */}
      <Dialog
        open={manageModalOpen}
        onClose={() => !updatingProgress && setManageModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.2rem", pb: 1 }}>
          Manage Case & Progress: {manageLead?.lead_id}
        </DialogTitle>
        <DialogContent dividers>
          {manageLead && (
            <Stack spacing={2.5}>
              {progressSuccess && <Alert severity="success">{progressSuccess}</Alert>}
              {progressError && <Alert severity="error">{progressError}</Alert>}

              {/* Case Stage Dropdown */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Current Case Milestone / Stage:
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Case Stage</InputLabel>
                  <Select
                    value={selectedStage}
                    label="Case Stage"
                    onChange={(e) => setSelectedStage(e.target.value)}
                  >
                    {CASE_STAGES.map((stg) => (
                      <MenuItem key={stg} value={stg}>{stg}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Client Documents Section */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Client Case Documents:
                </Typography>
                {Array.isArray(manageLead.client_documents) && manageLead.client_documents.length > 0 ? (
                  <Stack spacing={1}>
                    {manageLead.client_documents.map((doc: any, idx: number) => {
                      const docName = typeof doc === "string" ? doc : doc.name || doc.title || `Document_${idx + 1}`;
                      const docUrl = typeof doc === "string" ? doc : doc.url || doc.file || "#";

                      return (
                        <Paper
                          key={idx}
                          variant="outlined"
                          sx={{ p: 1.2, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <DescriptionIcon sx={{ color: "#2563eb", fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{docName}</Typography>
                          </Stack>
                          {docUrl && docUrl !== "#" ? (
                            <Button
                              variant="outlined"
                              size="small"
                              href={docUrl}
                              target="_blank"
                              rel="noreferrer"
                              sx={{ textTransform: "none", fontSize: "0.75rem" }}
                            >
                              View / Download
                            </Button>
                          ) : (
                            <Chip label="Stored in ICJ Vault" size="small" variant="outlined" />
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                ) : (
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", textAlign: "center" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      No separate files attached by client during inquiry submission.
                    </Typography>
                  </Paper>
                )}
              </Box>

              {/* Handover Notice if reassigned */}
              {manageLead.reassignment_notes && (
                <Box sx={{ p: 1.5, bgcolor: "#f0fdf4", borderRadius: 1.5, border: "1px solid #bbf7d0" }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#15803d", display: "block" }}>
                    HANDOVER / TRANSITION AUDIT TRAIL:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.82rem", color: "#166534", whiteSpace: "pre-wrap", mt: 0.5 }}>
                    {manageLead.reassignment_notes}
                  </Typography>
                </Box>
              )}

              {/* Existing Cumulative Notes Log */}
              {manageLead.case_notes && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Chronological Case Timeline & Log:
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#f8fafc",
                      borderRadius: 1.5,
                      border: "1px solid #e2e8f0",
                      maxHeight: 180,
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.84rem",
                      color: "#1e293b",
                    }}
                  >
                    {manageLead.case_notes}
                  </Box>
                </Box>
              )}

              {/* Add New Progress Note */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Append New Progress Note:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={newProgressNote}
                  onChange={(e) => setNewProgressNote(e.target.value)}
                  placeholder="Record summary of client call, evidence analyzed, petition drafted, court date set..."
                  helperText="Your note will be appended with an automated timestamp to the permanent case timeline."
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setManageModalOpen(false)} disabled={updatingProgress} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveProgress}
            disabled={updatingProgress}
            sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
          >
            {updatingProgress ? <CircularProgress size={20} color="inherit" /> : "Save Progress & Notes"}
          </Button>
        </DialogActions>
      </Dialog>

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
              If you have an ethical conflict of interest or this inquiry cannot be serviced, submit your reason below.
              Admin will review and may reassign the matter with full token refund to your wallet.
            </Typography>
            <TextField
              label="Reason for Refund / Conflict"
              multiline
              rows={3}
              fullWidth
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Existing representation of adverse party, client unreachable, outside jurisdiction..."
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
