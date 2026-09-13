"use client";

import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Stack,
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
import type { AdminCase } from "@/types/admin";

// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<AdminCase["status"], "default" | "info" | "warning" | "success" | "error"> = {
  open: "info",
  in_progress: "warning",
  pending_hearing: "warning",
  closed: "success",
  dismissed: "default",
  settled: "success",
};

const PRIORITY_COLOR: Record<AdminCase["priority"], "default" | "info" | "warning" | "error"> = {
  low: "default",
  medium: "info",
  high: "warning",
  urgent: "error",
};

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------

export default function CasesPage() {
  const [rows, setRows] = useState<AdminCase[]>([]);
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
      setRows(res.results);
      setTotalCount(res.count);
    } catch {
      setError("Failed to load cases. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  const columns: AdminTableColumn<AdminCase>[] = [
    {
      key: "number",
      label: "Case #",
      minWidth: 120,
      render: (c) => (
        <span style={{ fontWeight: 700, color: "#2563eb", whiteSpace: "nowrap" }}>
          {c.case_number}
        </span>
      ),
    },
    {
      key: "title",
      label: "Title",
      minWidth: 200,
      render: (c) => (
        <Box sx={{ fontWeight: 600, whiteSpace: "nowrap", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
          {c.title}
        </Box>
      ),
    },
    {
      key: "client",
      label: "Client",
      minWidth: 150,
      render: (c) => (
        <Box>
          <Box sx={{ fontWeight: 600, fontSize: "0.8rem" }}>{c.client_name}</Box>
          <Box sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{c.client_email}</Box>
        </Box>
      ),
    },
    {
      key: "advocate",
      label: "Advocate",
      minWidth: 150,
      render: (c) => (
        <Box>
          <Box sx={{ fontWeight: 600, fontSize: "0.8rem" }}>{c.advocate_name}</Box>
          <Box sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{c.advocate_email}</Box>
        </Box>
      ),
    },
    {
      key: "area",
      label: "Practice Area",
      minWidth: 140,
      render: (c) => c.practice_area,
    },
    {
      key: "status",
      label: "Status",
      minWidth: 130,
      render: (c) => (
        <Chip
          size="small"
          label={c.status.replace("_", " ")}
          color={STATUS_COLOR[c.status]}
          sx={{ fontWeight: 700, fontSize: "0.68rem", textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "priority",
      label: "Priority",
      minWidth: 100,
      render: (c) => (
        <Chip
          size="small"
          label={c.priority}
          color={PRIORITY_COLOR[c.priority]}
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: "0.68rem", textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "court",
      label: "Court",
      minWidth: 160,
      render: (c) => c.court_name || "—",
    },
    {
      key: "hearing",
      label: "Next Hearing",
      minWidth: 130,
      render: (c) =>
        c.next_hearing_date
          ? new Date(c.next_hearing_date).toLocaleDateString("en-IN", { dateStyle: "medium" })
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
        searchPlaceholder="Search case number, title, client, or advocate…"
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
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="pending_hearing">Pending Hearing</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="settled">Settled</MenuItem>
            <MenuItem value="dismissed">Dismissed</MenuItem>
          </Select>
        }
        getRowKey={(c) => c.id}
        emptyMessage="No cases found."
        pagination={pagination}
      />
    </AdminPageShell>
  );
}
