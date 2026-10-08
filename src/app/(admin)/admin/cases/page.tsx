"use client";

import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import AdminDataTable, {
  type AdminPaginationConfig,
  type AdminTableColumn,
} from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { adminCasesService } from "@/services/admin/adminCases.service";

// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<string, "default" | "info" | "warning" | "success" | "error"> = {
  open: "info",
  assigned: "warning",
  in_progress: "warning",
  closed: "success",
};

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------

export default function CasesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminCasesService.listCases({
        search,
        status: statusFilter || undefined,
        page: page + 1,
        page_size: rowsPerPage,
      });
      setRows(res.results || []);
      setTotalCount(res.count || 0);
    } catch {
      setError("Failed to load cases. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  const columns: AdminTableColumn<any>[] = [
    {
      key: "number",
      label: "Case ID",
      minWidth: 120,
      render: (c) => (
        <span style={{ fontWeight: 700, color: "#2563eb", whiteSpace: "nowrap" }}>
          {c.case_id}
        </span>
      ),
    },
    {
      key: "client",
      label: "Client Details",
      minWidth: 180,
      render: (c) => (
        <Box>
          <Box sx={{ fontWeight: 600 }}>{c.assistance_request_details?.full_name}</Box>
          <Box sx={{ fontSize: "0.8rem", color: "#64748b" }}>{c.assistance_request_details?.category}</Box>
        </Box>
      ),
    },
    {
      key: "advocate",
      label: "Professional / Group",
      minWidth: 150,
      render: (c) => (
        <Box>
          <Box sx={{ fontWeight: 600, fontSize: "0.8rem" }}>{c.professional_name || "Unassigned"}</Box>
          <Box sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{c.professional_group_name || c.group_type}</Box>
        </Box>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      minWidth: 100,
      render: (c) => `₹${c.budget}`,
    },
    {
      key: "status",
      label: "Status",
      minWidth: 130,
      render: (c) => (
        <Chip
          size="small"
          label={c.status.replace("_", " ")}
          color={STATUS_COLOR[c.status] || "default"}
          sx={{ fontWeight: 700, fontSize: "0.68rem", textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "date",
      label: "Created",
      minWidth: 130,
      render: (c) =>
        c.created_at
          ? new Date(c.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })
          : "—",
    },
    {
      key: "actions",
      label: "",
      minWidth: 60,
      align: "right",
      render: (c) => (
        <Tooltip title="View case details">
          <IconButton
            size="small"
            component={Link}
            href={`/admin/cases/${c.id}`}
            sx={{ color: "#2563eb" }}
          >
            <VisibilityIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const pagination: AdminPaginationConfig = {
    page,
    totalCount,
    rowsPerPage,
    onPageChange: (p) => setPage(p),
    onRowsPerPageChange: (r) => { setRowsPerPage(r); setPage(0); },
    rowsPerPageOptions: [10, 25, 50],
  };

  return (
    <AdminPageShell
      title="Cases"
      subtitle="All legal cases registered on the platform"
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        searchValue={search}
        searchPlaceholder="Search case ID or client name..."
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        filterSlot={
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            displayEmpty
            sx={{ minWidth: 160, bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.875rem" }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        }
        getRowKey={(c) => c.id}
        emptyMessage="No cases found."
        pagination={pagination}
      />
    </AdminPageShell>
  );
}
