"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import PublishIcon from "@mui/icons-material/Publish";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import PhoneCallbackIcon from "@mui/icons-material/PhoneCallback";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SettingsIcon from "@mui/icons-material/Settings";
import SummarizeIcon from "@mui/icons-material/Summarize";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import TollIcon from "@mui/icons-material/Toll";
import Link from "next/link";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { adminLeadsService } from "@/services/admin/adminLeads.service";
import type { DetailedLead } from "@/types/lead";

const STATUS_COLOR_MAP: Record<string, "default" | "info" | "warning" | "success" | "error"> = {
  draft: "default",
  pending_review: "warning",
  published: "success",
  reserved: "info",
  accepted: "primary" as any,
  unavailable: "default",
  rejected: "error",
};

const LEGAL_CATEGORIES = [
  "Property & Real Estate Dispute",
  "Criminal Defense & Bail",
  "Civil Litigation & Recovery",
  "Family & Matrimonial Law",
  "Corporate & Commercial Contracts",
  "Consumer Dispute & Fraud",
  "Labour & Employment",
  "Cyber Law & IT Disputes",
  "Intellectual Property (IPR)",
  "Banking & Debt Recovery (DRT)",
  "Other Legal Inquiries",
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<DetailedLead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<DetailedLead | null>(null);

  // Price Edit Modal
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingPricePaise, setEditingPricePaise] = useState<number>(100000);
  const [savingPrice, setSavingPrice] = useState(false);

  // Manual Lead Generation Modal (Telephonic Intake)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    client_name: "",
    client_mobile: "",
    client_email: "",
    category: LEGAL_CATEGORIES[0],
    urgency: "Medium",
    state_name: "",
    city_name: "",
    problem_description: "",
    tokens_required: 1,
    publish_now: true,
  });

  // Reassign / Revoke Modal
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [reassignError, setReassignError] = useState("");
  const [reassignForm, setReassignForm] = useState({
    return_to_marketplace: true,
    new_professional_id: "",
    refund_previous: true,
    handover_notes: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminLeadsService.listLeads({
        page: page + 1,
        page_size: pageSize,
        search: search || undefined,
        status: statusTab !== "all" ? statusTab : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      });
      setLeads(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, search, statusTab, categoryFilter]);

  const handlePublish = async (id: string) => {
    try {
      await adminLeadsService.publishLead(id, "Published by Administrator");
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to publish lead.");
    }
  };

  const handleUnpublish = async (id: string) => {
    if (!confirm("Unpublish this lead from the marketplace?")) return;
    try {
      await adminLeadsService.unpublishLead(id, "Unpublished by Administrator");
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to unpublish lead.");
    }
  };

  const handleOpenPriceModal = (lead: DetailedLead) => {
    setSelectedLead(lead);
    setEditingPricePaise(lead.price_paise || 100000);
    setPriceModalOpen(true);
  };

  const handleSavePrice = async () => {
    if (!selectedLead) return;
    setSavingPrice(true);
    try {
      await adminLeadsService.updatePricing(selectedLead.id, editingPricePaise);
      setPriceModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to update price.");
    } finally {
      setSavingPrice(false);
    }
  };

  const handleOpenCreateModal = () => {
    setCreateError("");
    setCreateForm({
      client_name: "",
      client_mobile: "",
      client_email: "",
      category: LEGAL_CATEGORIES[0],
      urgency: "Medium",
      state_name: "",
      city_name: "",
      problem_description: "",
      tokens_required: 1,
      publish_now: true,
    });
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!createForm.client_name.trim() || !createForm.client_mobile.trim() || !createForm.problem_description.trim()) {
      setCreateError("Please fill out client name, phone number, and matter details.");
      return;
    }
    setCreatingLead(true);
    setCreateError("");
    try {
      await adminLeadsService.createLead({
        client_name: createForm.client_name,
        client_mobile: createForm.client_mobile,
        client_email: createForm.client_email,
        category: createForm.category,
        urgency: createForm.urgency,
        state_name: createForm.state_name || "Not Specified",
        city_name: createForm.city_name || "Not Specified",
        problem_description: createForm.problem_description,
        tokens_required: createForm.tokens_required,
        status: createForm.publish_now ? "published" : "pending_review",
      });
      setCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      setCreateError(err?.message || "Failed to generate lead.");
    } finally {
      setCreatingLead(false);
    }
  };

  const handleOpenReassignModal = (lead: DetailedLead) => {
    setSelectedLead(lead);
    setReassignError("");
    setReassignForm({
      return_to_marketplace: true,
      new_professional_id: "",
      refund_previous: true,
      handover_notes: "",
    });
    setReassignModalOpen(true);
  };

  const handleReassignSubmit = async () => {
    if (!selectedLead) return;
    setReassigning(true);
    setReassignError("");
    try {
      await adminLeadsService.reassignLead(selectedLead.id, {
        return_to_marketplace: reassignForm.return_to_marketplace,
        new_professional_id: reassignForm.new_professional_id || undefined,
        refund_previous: reassignForm.refund_previous,
        handover_notes: reassignForm.handover_notes,
      });
      setReassignModalOpen(false);
      setDetailModalOpen(false);
      loadData();
    } catch (err: any) {
      setReassignError(err?.message || "Failed to reassign lead.");
    } finally {
      setReassigning(false);
    }
  };

  const columns: AdminTableColumn<DetailedLead>[] = [
    {
      key: "lead_id",
      label: "Lead ID",
      minWidth: 140,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#2563eb" }}>
          {row.lead_id}
        </Typography>
      ),
    },
    {
      key: "category",
      label: "Category & Urgency",
      minWidth: 170,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.category}</Typography>
          <Chip
            label={row.urgency}
            size="small"
            color={row.urgency.toLowerCase() === "high" || row.urgency.toLowerCase() === "critical" ? "error" : "warning"}
            sx={{ fontSize: "0.68rem", height: 18, mt: 0.3 }}
          />
        </Box>
      ),
    },
    {
      key: "client",
      label: "Client Contact",
      minWidth: 180,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.client_name || "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.client_mobile || row.client_email || "Confidential"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "location",
      label: "Location",
      minWidth: 130,
      render: (row) => `${row.city_name || "—"}, ${row.state_name || "—"}`,
    },
    {
      key: "tokens",
      label: "Required Tokens",
      minWidth: 120,
      render: (row) => (
        <Chip
          icon={<TollIcon sx={{ fontSize: "14px !important" }} />}
          label={`${row.tokens_required || 1} Token${(row.tokens_required || 1) === 1 ? "" : "s"}`}
          size="small"
          sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: "#eff6ff", color: "#1d4ed8" }}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      minWidth: 130,
      render: (row) => (
        <Chip
          label={row.status.replace(/_/g, " ").toUpperCase()}
          size="small"
          color={STATUS_COLOR_MAP[row.status] || "default"}
          sx={{ fontWeight: 700, fontSize: "0.68rem", height: 22 }}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: 180,
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details & Case Progress">
            <IconButton size="small" onClick={() => { setSelectedLead(row); setDetailModalOpen(true); }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {row.status === "accepted" && (
            <Tooltip title="Reassign / Handover Lead & Refund">
              <IconButton size="small" color="primary" onClick={() => handleOpenReassignModal(row)}>
                <SwapHorizIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {row.status !== "accepted" && (
            <Tooltip title="Edit Price Override">
              <IconButton size="small" onClick={() => handleOpenPriceModal(row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {row.status !== "published" && row.status !== "accepted" && (
            <Tooltip title="Approve & Publish to Marketplace">
              <IconButton size="small" color="success" onClick={() => handlePublish(row.id)}>
                <PublishIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {row.status === "published" && (
            <Tooltip title="Unpublish from Marketplace">
              <IconButton size="small" color="error" onClick={() => handleUnpublish(row.id)}>
                <UnpublishedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Unified Leads Management"
      subtitle="Complete management for client inquiries, phone intake leads, marketplace publishing, and professional case assignments."
      actions={
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PhoneCallbackIcon />}
            onClick={handleOpenCreateModal}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            + Generate Lead (Phone Intake)
          </Button>
          <Button
            component={Link}
            href="/admin/leads/settings"
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Settings
          </Button>
          <Button
            component={Link}
            href="/admin/leads/reports"
            variant="outlined"
            size="small"
            startIcon={<SummarizeIcon />}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Analytics
          </Button>
        </Stack>
      }
    >
      {/* Filters and Tabs */}
      <Card variant="outlined" sx={{ borderRadius: 2, mb: 2, p: 1.5 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Tabs
            value={statusTab}
            onChange={(_, val) => { setStatusTab(val); setPage(0); }}
            sx={{ minHeight: 38 }}
          >
            <Tab label="All Matters" value="all" sx={{ textTransform: "none", fontWeight: 600, minHeight: 38, py: 0.5 }} />
            <Tab label="Pending Review" value="pending_review" sx={{ textTransform: "none", fontWeight: 600, minHeight: 38, py: 0.5 }} />
            <Tab label="Published" value="published" sx={{ textTransform: "none", fontWeight: 600, minHeight: 38, py: 0.5 }} />
            <Tab label="Accepted / In Progress" value="accepted" sx={{ textTransform: "none", fontWeight: 600, minHeight: 38, py: 0.5 }} />
            <Tab label="Unavailable" value="unavailable" sx={{ textTransform: "none", fontWeight: 600, minHeight: 38, py: 0.5 }} />
          </Tabs>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Filter Category"
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="all">All Legal Categories</MenuItem>
              {LEGAL_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Leads Table */}
      <AdminDataTable<DetailedLead>
        columns={columns}
        rows={leads}
        loading={loading}
        searchValue={search}
        searchPlaceholder="Search Lead ID, category, or client name..."
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        getRowKey={(row) => row.id}
        pagination={{
          totalCount: totalCount,
          page: page,
          rowsPerPage: pageSize,
          onPageChange: setPage,
          onRowsPerPageChange: (newSize) => { setPageSize(newSize); setPage(0); },
        }}
      />

      {/* Lead Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedLead ? `Lead Details: ${selectedLead.lead_id}` : "Lead Details"}
        </DialogTitle>
        <DialogContent dividers>
          {selectedLead && (
            <Stack spacing={2.5}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">CATEGORY</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedLead.category}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">URGENCY</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedLead.urgency}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">STATUS</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: "#2563eb" }}>
                    {selectedLead.status.toUpperCase()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">CLIENT FULL NAME</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedLead.client_name || "—"}</Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}>
                  <Typography variant="caption" color="text.secondary">CLIENT CONTACT</Typography>
                  <Typography variant="body1">{selectedLead.client_mobile || "—"} • {selectedLead.client_email || "—"}</Typography>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Full Confidential Matter Description:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line", bgcolor: "#f8fafc", p: 2, borderRadius: 2 }}>
                  {selectedLead.full_description || selectedLead.anonymized_summary}
                </Typography>
              </Box>

              {/* Acceptance & Reassignment History */}
              {selectedLead.status === "accepted" && (
                <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#15803d" }}>
                      Active Assignment & Progress
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      startIcon={<SwapHorizIcon />}
                      onClick={() => handleOpenReassignModal(selectedLead)}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      Reassign / Refund Lead
                    </Button>
                  </Stack>
                  <Typography variant="body2">
                    Assigned Professional: <strong>{selectedLead.assigned_professional_name || selectedLead.acceptance_info?.professional_email || "Active Professional"}</strong>
                  </Typography>
                  {selectedLead.acceptance_info && (
                    <Typography variant="body2">
                      Receipt Ref: <strong>{selectedLead.acceptance_info.receipt_reference}</strong> • Tokens Spent: <strong>{selectedLead.acceptance_info.tokens_spent || selectedLead.tokens_required || 1}</strong>
                    </Typography>
                  )}
                  {selectedLead.case_stage && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Current Stage: <strong>{selectedLead.case_stage}</strong>
                    </Typography>
                  )}
                </Box>
              )}

              {/* Handover & Case Notes */}
              {(selectedLead.case_notes || selectedLead.reassignment_notes) && (
                <Box sx={{ p: 2, bgcolor: "#fffbeb", borderRadius: 2, border: "1px solid #fde68a" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#b45309", mb: 0.5 }}>
                    Cumulative Case Progress & Handover Notes:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-line", color: "#78350f" }}>
                    {selectedLead.case_notes}
                    {selectedLead.reassignment_notes}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Manual Lead Generation Dialog (Telephonic Intake) */}
      <Dialog
        open={createModalOpen}
        onClose={() => !creatingLead && setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Generate Lead from Call / Inquiry
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {createError && <Alert severity="error">{createError}</Alert>}
            <Typography variant="body2" color="text.secondary">
              Record citizen details taken over phone call or desk inquiry. The generated lead will be cataloged and can be published immediately.
            </Typography>

            <TextField
              label="Client Full Name *"
              fullWidth
              size="small"
              value={createForm.client_name}
              onChange={(e) => setCreateForm({ ...createForm, client_name: e.target.value })}
              required
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Mobile Phone *"
                fullWidth
                size="small"
                value={createForm.client_mobile}
                onChange={(e) => setCreateForm({ ...createForm, client_mobile: e.target.value })}
                required
              />
              <TextField
                label="Email (Optional)"
                fullWidth
                size="small"
                value={createForm.client_email}
                onChange={(e) => setCreateForm({ ...createForm, client_email: e.target.value })}
              />
            </Stack>

            <FormControl fullWidth size="small">
              <InputLabel>Legal Category *</InputLabel>
              <Select
                value={createForm.category}
                label="Legal Category *"
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              >
                {LEGAL_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Urgency</InputLabel>
                <Select
                  value={createForm.urgency}
                  label="Urgency"
                  onChange={(e) => setCreateForm({ ...createForm, urgency: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Tokens Required"
                type="number"
                size="small"
                value={createForm.tokens_required}
                onChange={(e) => setCreateForm({ ...createForm, tokens_required: Math.max(1, Number(e.target.value)) })}
                sx={{ width: 140 }}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="State"
                fullWidth
                size="small"
                value={createForm.state_name}
                onChange={(e) => setCreateForm({ ...createForm, state_name: e.target.value })}
              />
              <TextField
                label="City"
                fullWidth
                size="small"
                value={createForm.city_name}
                onChange={(e) => setCreateForm({ ...createForm, city_name: e.target.value })}
              />
            </Stack>

            <TextField
              label="Problem Description / Matter Details *"
              multiline
              rows={3}
              fullWidth
              size="small"
              value={createForm.problem_description}
              onChange={(e) => setCreateForm({ ...createForm, problem_description: e.target.value })}
              placeholder="Detailed notes of caller's legal issue..."
              required
            />

            <FormControlLabel
              control={
                <Switch
                  checked={createForm.publish_now}
                  onChange={(e) => setCreateForm({ ...createForm, publish_now: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Publish immediately to Marketplace (Visible to verified professionals)
                </Typography>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCreateModalOpen(false)} disabled={creatingLead}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSubmit} disabled={creatingLead} sx={{ fontWeight: 700 }}>
            {creatingLead ? "Creating Lead..." : "Generate Lead"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reassign / Handover & Refund Modal */}
      <Dialog
        open={reassignModalOpen}
        onClose={() => !reassigning && setReassignModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Reassign Lead & Preserve Case Progress
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {reassignError && <Alert severity="error">{reassignError}</Alert>}
            <Typography variant="body2" color="text.secondary">
              When a client or professional cannot proceed, reassign this matter. All existing progress notes, documents, and case stage are preserved and transferred to the next handler without starting from zero.
            </Typography>

            <Box sx={{ p: 1.5, bgcolor: "#eff6ff", borderRadius: 2, border: "1px solid #bfdbfe" }}>
              <Typography variant="caption" sx={{ color: "#1d4ed8", fontWeight: 700 }}>
                CURRENT STATUS
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {selectedLead?.lead_id} — {selectedLead?.category}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Assigned to: {selectedLead?.assigned_professional_name || selectedLead?.acceptance_info?.professional_email || "Active Professional"}
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={reassignForm.return_to_marketplace}
                  onChange={(e) => setReassignForm({ ...reassignForm, return_to_marketplace: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Return to Marketplace for another professional to accept
                </Typography>
              }
            />

            {!reassignForm.return_to_marketplace && (
              <TextField
                label="New Professional User ID"
                fullWidth
                size="small"
                value={reassignForm.new_professional_id}
                onChange={(e) => setReassignForm({ ...reassignForm, new_professional_id: e.target.value })}
                placeholder="Enter User UUID of new professional..."
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={reassignForm.refund_previous}
                  onChange={(e) => setReassignForm({ ...reassignForm, refund_previous: e.target.checked })}
                  color="success"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Refund tokens back to current professional&apos;s wallet
                </Typography>
              }
            />

            <TextField
              label="Handover Notes / Case Status Details"
              multiline
              rows={3}
              fullWidth
              size="small"
              value={reassignForm.handover_notes}
              onChange={(e) => setReassignForm({ ...reassignForm, handover_notes: e.target.value })}
              placeholder="Reason for reassignment and current case status for next professional..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setReassignModalOpen(false)} disabled={reassigning}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleReassignSubmit} disabled={reassigning} sx={{ fontWeight: 700 }}>
            {reassigning ? "Processing..." : "Confirm Reassignment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Price Modal */}
      <Dialog
        open={priceModalOpen}
        onClose={() => !savingPrice && setPriceModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Update Lead Price</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Configure lead price in INR for {selectedLead?.lead_id}:
            </Typography>
            <TextField
              label="Price in INR"
              type="number"
              fullWidth
              value={editingPricePaise / 100}
              onChange={(e) => setEditingPricePaise(Math.round(Number(e.target.value) * 100))}
              slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1, fontWeight: 700 }}>₹</Typography> } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={() => setPriceModalOpen(false)} disabled={savingPrice}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePrice} disabled={savingPrice}>
            {savingPrice ? "Saving..." : "Save Price"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
