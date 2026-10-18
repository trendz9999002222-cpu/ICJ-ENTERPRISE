"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Checkbox,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Alert,
  Paper,
  CircularProgress,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import PublishIcon from "@mui/icons-material/Publish";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SettingsIcon from "@mui/icons-material/Settings";
import SummarizeIcon from "@mui/icons-material/Summarize";
import TollIcon from "@mui/icons-material/Toll";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import Link from "next/link";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { adminLeadsService } from "@/services/admin/adminLeads.service";
import { adminUsersService } from "@/services/admin/adminUsers.service";
import type { DetailedLead } from "@/types/lead";

const STATUS_COLOR_MAP: Record<string, "default" | "info" | "warning" | "success" | "error" | "primary"> = {
  draft: "default",
  pending_review: "warning",
  published: "success",
  reserved: "info",
  accepted: "primary",
  reassigned: "info",
  unavailable: "default",
  rejected: "error",
  closed: "default",
};

const CATEGORIES = [
  "Specialized Law",
  "Citizen Assistance",
  "Civil Litigation",
  "Family & Matrimonial",
  "Criminal Defense",
  "Property & Real Estate",
  "Corporate & Commercial",
  "Labour & Employment",
  "Consumer Dispute",
  "Constitutional Law",
  "Taxation & Finance",
  "Cyber Law",
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
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<DetailedLead | null>(null);

  // Price & Token Edit Modal
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingPricePaise, setEditingPricePaise] = useState<number>(100000);
  const [editingTokens, setEditingTokens] = useState<number>(1);
  const [savingPrice, setSavingPrice] = useState(false);

  // Manual Generate Lead Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    client_name: "",
    client_mobile: "",
    client_email: "",
    preferred_contact: "Phone",
    state_name: "",
    city_name: "",
    category: "Specialized Law",
    urgency: "Medium",
    problem_description: "",
    anonymized_summary: "",
    tokens_required: 1,
    status: "pending_review",
  });

  // Reassignment Modal
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignLeadTarget, setReassignLeadTarget] = useState<DetailedLead | null>(null);
  const [professionalsList, setProfessionalsList] = useState<any[]>([]);
  const [reassignForm, setReassignForm] = useState({
    new_professional_id: "",
    refund_previous: true,
    handover_notes: "",
    return_to_marketplace: false,
  });
  const [reassignLoading, setReassignLoading] = useState(false);

  // Case Progress Update State inside Detail Modal
  const [newProgressNote, setNewProgressNote] = useState("");
  const [newCaseStage, setNewCaseStage] = useState("");
  const [savingProgress, setSavingProgress] = useState(false);

  const loadData = useCallback(async () => {
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
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusTab, categoryFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load professionals for reassign dropdown
  const loadProfessionals = async () => {
    try {
      const res = await adminUsersService.listUsers({ role: "professional", page_size: 100 });
      setProfessionalsList(res.results || []);
    } catch (err) {
      console.error("Failed to load professionals for reassignment:", err);
    }
  };

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
    setEditingTokens(lead.tokens_required || 1);
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
      alert(err?.message || "Failed to update price/tokens.");
    } finally {
      setSavingPrice(false);
    }
  };

  const handleOpenCreateModal = () => {
    setCreateForm({
      client_name: "",
      client_mobile: "",
      client_email: "",
      preferred_contact: "Phone",
      state_name: "",
      city_name: "",
      category: "Specialized Law",
      urgency: "Medium",
      problem_description: "",
      anonymized_summary: "",
      tokens_required: 1,
      status: "pending_review",
    });
    setCreateModalOpen(true);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.client_name.trim()) {
      alert("Please enter client full name.");
      return;
    }
    setCreateLoading(true);
    try {
      const anonSummary =
        createForm.anonymized_summary.trim() ||
        `Matter regarding ${createForm.category} in ${createForm.city_name || "Location"}, ${createForm.state_name || "State"}. Urgency: ${createForm.urgency}.`;

      await adminLeadsService.createLead({
        ...createForm,
        anonymized_summary: anonSummary,
      });
      setCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to generate lead.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenReassignModal = (lead: DetailedLead) => {
    setReassignLeadTarget(lead);
    setReassignForm({
      new_professional_id: "",
      refund_previous: true,
      handover_notes: "",
      return_to_marketplace: false,
    });
    loadProfessionals();
    setReassignModalOpen(true);
  };

  const handleConfirmReassign = async () => {
    if (!reassignLeadTarget) return;
    if (!reassignForm.return_to_marketplace && !reassignForm.new_professional_id) {
      alert("Please select a professional to reassign to, or check 'Return to Marketplace'.");
      return;
    }
    setReassignLoading(true);
    try {
      await adminLeadsService.reassignLead(reassignLeadTarget.id, reassignForm);
      setReassignModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to reassign lead.");
    } finally {
      setReassignLoading(false);
    }
  };

  const handleSaveProgressUpdate = async () => {
    if (!selectedLead) return;
    setSavingProgress(true);
    try {
      const updated = await adminLeadsService.updateCaseProgress(selectedLead.id, {
        case_stage: newCaseStage || selectedLead.case_stage,
        case_notes: newProgressNote,
      });
      setSelectedLead(updated);
      setNewProgressNote("");
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to update case progress.");
    } finally {
      setSavingProgress(false);
    }
  };

  const columns: AdminTableColumn<DetailedLead>[] = [
    {
      key: "lead_id",
      label: "Lead ID",
      minWidth: 140,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#2563eb" }}>
            {row.lead_id}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {new Date(row.created_at).toLocaleDateString()}
          </Typography>
        </Box>
      ),
    },
    {
      key: "category",
      label: "Category & Urgency",
      minWidth: 160,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.category}
          </Typography>
          <Chip
            label={row.urgency}
            size="small"
            color={
              row.urgency.toLowerCase() === "high" || row.urgency.toLowerCase() === "critical"
                ? "error"
                : row.urgency.toLowerCase() === "low"
                ? "default"
                : "warning"
            }
            sx={{ fontSize: "0.68rem", height: 18, mt: 0.3 }}
          />
        </Box>
      ),
    },
    {
      key: "client",
      label: "Client Contact (Admin View)",
      minWidth: 180,
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.client_name || "—"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#475569", display: "block" }}>
            {row.client_mobile || row.client_email || "No contact info"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "location",
      label: "Location",
      minWidth: 130,
      render: (row) => (
        <Typography variant="body2" sx={{ color: "#334155" }}>
          {row.city_name ? `${row.city_name}, ` : ""}{row.state_name || "—"}
        </Typography>
      ),
    },
    {
      key: "tokens",
      label: "Tokens Cost",
      minWidth: 110,
      render: (row) => (
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={0.5}>
          <TollIcon sx={{ color: "#f59e0b", fontSize: 16 }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
            {row.tokens_required ?? 1} Token{(row.tokens_required ?? 1) > 1 ? "s" : ""}
          </Typography>
        </Stack>
      ),
    },
    {
      key: "assigned_to",
      label: "Assigned Professional",
      minWidth: 160,
      render: (row) => {
        const pro = row.assigned_professional_details;
        if (!pro) {
          return (
            <Typography variant="caption" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
              Unassigned
            </Typography>
          );
        }
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
              {pro.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              {pro.email}
            </Typography>
          </Box>
        );
      },
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
          <Tooltip title="View Full Details & Case Progress">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedLead(row);
                setNewCaseStage(row.case_stage || "New");
                setDetailModalOpen(true);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

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

          {row.status !== "accepted" && (
            <Tooltip title="Edit Price Override">
              <IconButton size="small" onClick={() => handleOpenPriceModal(row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {/* Reassign / Handover action */}
          <Tooltip title="Reassign / Handover to another Professional">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleOpenReassignModal(row)}
            >
              <SwapHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Leads & Legal Matters Management"
      subtitle="Single unified intake, marketplace leads, client inquiries, and seamless case handovers."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
            Generate New Lead
          </Button>
          <Button
            variant="outlined"
            size="small"
            component={Link}
            href="/admin/leads/reports"
            startIcon={<SummarizeIcon />}
            sx={{ textTransform: "none" }}
          >
            Reports
          </Button>
          <Button
            variant="outlined"
            size="small"
            component={Link}
            href="/admin/leads/settings"
            startIcon={<SettingsIcon />}
            sx={{ textTransform: "none" }}
          >
            Settings
          </Button>
        </Stack>
      }
    >
      {/* Top Filter Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "5fr 3fr 4fr" }, gap: 2, alignItems: "center" }}>
          <Box>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by Lead ID, Client Name, Mobile, City..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>
          <Box>
            <FormControl size="small" fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
                setStatusTab("all");
              }}
            >
              Reset Filters
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={statusTab}
          onChange={(_, val) => {
            setStatusTab(val);
            setPage(0);
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Leads" value="all" />
          <Tab label="Pending Review" value="pending_review" />
          <Tab label="Published (Marketplace)" value="published" />
          <Tab label="Accepted by Professional" value="accepted" />
          <Tab label="Reassigned" value="reassigned" />
          <Tab label="Draft" value="draft" />
          <Tab label="Closed" value="closed" />
        </Tabs>
      </Box>

      {/* Main Table */}
      <AdminDataTable<DetailedLead>
        columns={columns}
        rows={leads}
        loading={loading}
        getRowKey={(lead) => lead.id}
        pagination={{
          totalCount,
          page,
          rowsPerPage: pageSize,
          onPageChange: setPage,
          onRowsPerPageChange: setPageSize,
        }}
        emptyMessage="No leads found matching your filters."
      />

      {/* Modal: Generate New Lead (Admin Phone / Walk-in Intake) */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleCreateLead}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Generate New Lead (Admin Manual Intake)
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Use this form to enter client details gathered via telephone intake, front desk inquiry, or direct citizen call.
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
              <Box>
                <TextField
                  label="Client Full Name *"
                  fullWidth
                  size="small"
                  required
                  value={createForm.client_name}
                  onChange={(e) => setCreateForm({ ...createForm, client_name: e.target.value })}
                />
              </Box>
              <Box>
                <TextField
                  label="Mobile Number"
                  fullWidth
                  size="small"
                  value={createForm.client_mobile}
                  onChange={(e) => setCreateForm({ ...createForm, client_mobile: e.target.value })}
                />
              </Box>
              <Box>
                <TextField
                  label="Email Address"
                  fullWidth
                  size="small"
                  type="email"
                  value={createForm.client_email}
                  onChange={(e) => setCreateForm({ ...createForm, client_email: e.target.value })}
                />
              </Box>
              <Box>
                <FormControl size="small" fullWidth>
                  <InputLabel>Preferred Contact Mode</InputLabel>
                  <Select
                    value={createForm.preferred_contact}
                    label="Preferred Contact Mode"
                    onChange={(e) => setCreateForm({ ...createForm, preferred_contact: e.target.value })}
                  >
                    <MenuItem value="Phone">Phone</MenuItem>
                    <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                    <MenuItem value="Email">Email</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <TextField
                  label="State"
                  fullWidth
                  size="small"
                  value={createForm.state_name}
                  onChange={(e) => setCreateForm({ ...createForm, state_name: e.target.value })}
                />
              </Box>
              <Box>
                <TextField
                  label="City / District"
                  fullWidth
                  size="small"
                  value={createForm.city_name}
                  onChange={(e) => setCreateForm({ ...createForm, city_name: e.target.value })}
                />
              </Box>

              <Box>
                <FormControl size="small" fullWidth>
                  <InputLabel>Legal Category</InputLabel>
                  <Select
                    value={createForm.category}
                    label="Legal Category"
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl size="small" fullWidth>
                  <InputLabel>Urgency Level</InputLabel>
                  <Select
                    value={createForm.urgency}
                    label="Urgency Level"
                    onChange={(e) => setCreateForm({ ...createForm, urgency: e.target.value })}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <TextField
                  label="Tokens Required to Accept"
                  fullWidth
                  size="small"
                  type="number"
                  slotProps={{ htmlInput: { min: 1 } }}
                  value={createForm.tokens_required}
                  onChange={(e) => setCreateForm({ ...createForm, tokens_required: parseInt(e.target.value) || 1 })}
                  helperText="Default 1 token"
                />
              </Box>
              <Box>
                <FormControl size="small" fullWidth>
                  <InputLabel>Initial Status</InputLabel>
                  <Select
                    value={createForm.status}
                    label="Initial Status"
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  >
                    <MenuItem value="pending_review">Pending Review (Hold for verification)</MenuItem>
                    <MenuItem value="published">Publish Immediately to Marketplace</MenuItem>
                    <MenuItem value="draft">Save as Draft</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ gridColumn: "1 / -1" }}>
                <TextField
                  label="Confidential Problem Description *"
                  fullWidth
                  multiline
                  rows={3}
                  required
                  placeholder="Detailed notes from citizen call, case background, documents mentioned..."
                  value={createForm.problem_description}
                  onChange={(e) => setCreateForm({ ...createForm, problem_description: e.target.value })}
                />
              </Box>

              <Box sx={{ gridColumn: "1 / -1" }}>
                <TextField
                  label="Anonymized Marketplace Summary (Public preview)"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Leave blank to auto-generate a sanitized description for professionals."
                  value={createForm.anonymized_summary}
                  onChange={(e) => setCreateForm({ ...createForm, anonymized_summary: e.target.value })}
                  helperText="Client names, phone numbers, and identifying details are automatically hidden from this preview."
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={createLoading}
              sx={{ fontWeight: 700 }}
            >
              {createLoading ? "Creating..." : "Generate Lead"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal: Reassign Lead / Case Handover */}
      <Dialog
        open={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Reassign Lead / Handover Case
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2.5 }}>
            <strong>Work Continuity Guarantee:</strong> When this lead is reassigned, all existing case progress, stage milestones, notes, and uploaded documents are <strong>100% preserved</strong>. The new professional will start exactly where the previous professional left off.
          </Alert>

          {reassignLeadTarget && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Lead: {reassignLeadTarget.lead_id} ({reassignLeadTarget.category})
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Current Assigned Professional:{" "}
                <strong>{reassignLeadTarget.assigned_professional_details?.name || "None / Unassigned"}</strong>
              </Typography>
            </Box>
          )}

          <Stack spacing={2.5}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reassignForm.return_to_marketplace}
                  onChange={(e) => setReassignForm({ ...reassignForm, return_to_marketplace: e.target.checked })}
                />
              }
              label="Return to Marketplace as Published (Allow any professional to accept)"
            />

            {!reassignForm.return_to_marketplace && (
              <FormControl size="small" fullWidth>
                <InputLabel>Select New Professional *</InputLabel>
                <Select
                  value={reassignForm.new_professional_id}
                  label="Select New Professional *"
                  onChange={(e) => setReassignForm({ ...reassignForm, new_professional_id: e.target.value })}
                >
                  {professionalsList.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.first_name || p.email} ({p.email}) - {p.role || "Professional"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={reassignForm.refund_previous}
                  onChange={(e) => setReassignForm({ ...reassignForm, refund_previous: e.target.checked })}
                />
              }
              label="Refund token(s) back to the previous professional's wallet"
            />

            <TextField
              label="Handover Notes / Reason for Reassignment"
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., Client requested change of counsel; current professional unavailable due to court schedule. Handover instructions..."
              value={reassignForm.handover_notes}
              onChange={(e) => setReassignForm({ ...reassignForm, handover_notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setReassignModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={reassignLoading}
            onClick={handleConfirmReassign}
            sx={{ fontWeight: 700 }}
          >
            {reassignLoading ? "Reassigning..." : "Confirm Reassignment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: View Full Details & Case Progress */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Lead Details: {selectedLead?.lead_id}</span>
          <Chip
            label={selectedLead?.status.replace(/_/g, " ").toUpperCase()}
            size="small"
            color={STATUS_COLOR_MAP[selectedLead?.status || ""] || "default"}
          />
        </DialogTitle>
        <DialogContent dividers>
          {selectedLead && (
            <Stack spacing={3}>
              {/* Confidential Client Details */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: "#f1f5f9", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "#0f172a" }}>
                  Client Contact Information (Confidential)
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <PersonIcon sx={{ fontSize: 16, color: "#64748b" }} />
                    <Typography variant="body2">{selectedLead.client_name || "—"}</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <PhoneIcon sx={{ fontSize: 16, color: "#64748b" }} />
                    <Typography variant="body2">{selectedLead.client_mobile || "—"}</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <EmailIcon sx={{ fontSize: 16, color: "#64748b" }} />
                    <Typography variant="body2">{selectedLead.client_email || "—"}</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <LocationOnIcon sx={{ fontSize: 16, color: "#64748b" }} />
                    <Typography variant="body2">{selectedLead.city_name}, {selectedLead.state_name}</Typography>
                  </Stack>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Preferred Mode: {selectedLead.client_preferred_contact || "Phone"}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <TollIcon sx={{ color: "#f59e0b", fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selectedLead.tokens_required ?? 1} Token{(selectedLead.tokens_required ?? 1) > 1 ? "s" : ""}
                    </Typography>
                  </Stack>
                </Box>
              </Paper>

              {/* Problem Description */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Full Matter Description:
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", bgcolor: "#f8fafc", p: 1.5, borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                  {selectedLead.full_description || selectedLead.anonymized_summary || "No description provided."}
                </Typography>
              </Box>

              {/* Handover & Reassignment Notes (if any) */}
              {selectedLead.reassignment_notes && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "#b45309" }}>
                    Handover History & Reassignment Notes:
                  </Typography>
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 1.5 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontSize: "0.82rem", color: "#92400e" }}>
                      {selectedLead.reassignment_notes}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Cumulative Case Notes & Progress */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Case Progress & Milestones (Preserved Across Handover):
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1 }}>
                  Current Stage: <Chip label={selectedLead.case_stage || "New"} size="small" sx={{ fontWeight: 600 }} />
                </Typography>

                {selectedLead.case_notes ? (
                  <Paper elevation={0} sx={{ p: 1.5, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", mb: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontSize: "0.82rem" }}>
                      {selectedLead.case_notes}
                    </Typography>
                  </Paper>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    No case notes recorded yet.
                  </Typography>
                )}

                {/* Add Progress Note */}
                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #cbd5e1" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Record New Note / Update Stage:
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "4fr 8fr" }, gap: 2 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Case Stage</InputLabel>
                      <Select
                        value={newCaseStage}
                        label="Case Stage"
                        onChange={(e) => setNewCaseStage(e.target.value)}
                      >
                        <MenuItem value="New">New</MenuItem>
                        <MenuItem value="Initial Consultation">Initial Consultation</MenuItem>
                        <MenuItem value="Document Collection & Review">Document Collection & Review</MenuItem>
                        <MenuItem value="Petition / Agreement Drafted">Petition / Agreement Drafted</MenuItem>
                        <MenuItem value="Filed in Court / Authority">Filed in Court / Authority</MenuItem>
                        <MenuItem value="Hearing in Progress">Hearing in Progress</MenuItem>
                        <MenuItem value="Matter Resolved / Closed">Matter Resolved / Closed</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Add progress note or milestone update..."
                      value={newProgressNote}
                      onChange={(e) => setNewProgressNote(e.target.value)}
                    />

                    <Box sx={{ gridColumn: "1 / -1", textAlign: "right" }}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={savingProgress || (!newProgressNote.trim() && newCaseStage === selectedLead.case_stage)}
                        onClick={handleSaveProgressUpdate}
                      >
                        {savingProgress ? "Saving..." : "Save Progress Note"}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Price & Token Override */}
      <Dialog open={priceModalOpen} onClose={() => setPriceModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Price & Tokens</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Tokens Required to Accept"
              type="number"
              fullWidth
              size="small"
              slotProps={{ htmlInput: { min: 1 } }}
              value={editingTokens}
              onChange={(e) => setEditingTokens(Math.max(1, parseInt(e.target.value) || 1))}
              helperText="Number of tokens deducted from professional wallet on acceptance"
            />
            <TextField
              label="Direct Price in Paise (₹1 = 100 paise)"
              type="number"
              fullWidth
              size="small"
              value={editingPricePaise}
              onChange={(e) => setEditingPricePaise(parseInt(e.target.value) || 0)}
              helperText={`Equivalent to ₹${(editingPricePaise / 100).toFixed(2)}`}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPriceModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePrice} disabled={savingPrice}>
            {savingPrice ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
