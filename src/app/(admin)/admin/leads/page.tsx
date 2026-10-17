"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Alert,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import PublishIcon from "@mui/icons-material/Publish";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import EditIcon from "@mui/icons-material/Edit";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SettingsIcon from "@mui/icons-material/Settings";
import SummarizeIcon from "@mui/icons-material/Summarize";
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

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<DetailedLead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<DetailedLead | null>(null);

  // Price Edit Modal
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingPricePaise, setEditingPricePaise] = useState<number>(100000);
  const [savingPrice, setSavingPrice] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminLeadsService.listLeads({
        page: page + 1,
        page_size: pageSize,
        search: search || undefined,
        status: statusTab !== "all" ? statusTab : undefined,
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
  }, [page, pageSize, search, statusTab]);

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
      minWidth: 160,
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
      render: (row) => `${row.city_name}, ${row.state_name}`,
    },
    {
      key: "price",
      label: "Lead Fee",
      minWidth: 110,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          ₹{(row.price_inr ?? (row.price_paise ? row.price_paise / 100 : 0)).toFixed(2)}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      minWidth: 140,
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
      minWidth: 160,
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => { setSelectedLead(row); setDetailModalOpen(true); }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

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
      title="Lead Marketplace Management"
      subtitle="Review citizen assistance requests, approve and safely publish leads to the verified professional marketplace."
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            component={Link}
            href="/admin/leads/settings"
            variant="outlined"
            size="small"
            startIcon={<SettingsIcon />}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Commercial Settings
          </Button>
          <Button
            component={Link}
            href="/admin/leads/reports"
            variant="contained"
            size="small"
            startIcon={<SummarizeIcon />}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Marketplace Analytics
          </Button>
        </Stack>
      }
    >
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={statusTab} onChange={(_, val) => setStatusTab(val)}>
          <Tab label="All Leads" value="all" sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label="Pending Review" value="pending_review" sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label="Published" value="published" sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label="Accepted" value="accepted" sx={{ textTransform: "none", fontWeight: 600 }} />
          <Tab label="Unavailable" value="unavailable" sx={{ textTransform: "none", fontWeight: 600 }} />
        </Tabs>
      </Box>

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

              {selectedLead.acceptance_info && (
                <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#15803d" }}>
                    Acceptance Information
                  </Typography>
                  <Typography variant="body2">
                    Accepted By: <strong>{selectedLead.acceptance_info.professional_email}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Receipt Reference: <strong>{selectedLead.acceptance_info.receipt_reference}</strong> • Method: <strong>{selectedLead.acceptance_info.payment_method}</strong>
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
