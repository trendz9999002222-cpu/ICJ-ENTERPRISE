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
import { adminAdvocatesService } from "@/services/admin/adminAdvocates.service";
import type { AdminAdvocate } from "@/types/admin";

// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<
  AdminAdvocate["verification_status"],
  "success" | "warning" | "error" | "default"
> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  under_review: "default",
};

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------

export default function AdvocatesPage() {
  const [rows, setRows] = useState<AdminAdvocate[]>([]);
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
      const res = await adminAdvocatesService.listAdvocates({
        search,
        status: statusFilter || undefined,
        page: page + 1,
        page_size: rowsPerPage,
      });
      setRows(res.results);
      setTotalCount(res.count);
    } catch {
      setError("Failed to load advocates. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  const columns: AdminTableColumn<AdminAdvocate>[] = [
    {
      key: "name",
      label: "Name",
      minWidth: 180,
      render: (a) => (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: "#eff6ff",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              fontSize: "0.65rem",
              fontWeight: 800,
              color: "#1d4ed8",
            }}
          >
            {a.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </Box>
          <Box>
            <Box sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
              {a.full_name}
            </Box>
            <Box sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{a.email}</Box>
          </Box>
        </Stack>
      ),
    },
    {
      key: "bar",
      label: "Bar #",
      minWidth: 130,
      render: (a) => <span style={{ fontWeight: 600, color: "#2563eb" }}>{a.bar_number}</span>,
    },
    {
      key: "council",
      label: "Bar Council",
      minWidth: 160,
      render: (a) => a.state_bar_council || "—",
    },
    {
      key: "practice",
      label: "Practice Areas",
      minWidth: 180,
      render: (a) =>
        a.practice_areas.length
          ? a.practice_areas.slice(0, 2).join(", ") + (a.practice_areas.length > 2 ? " +" + (a.practice_areas.length - 2) : "")
          : "—",
    },
    {
      key: "exp",
      label: "Exp.",
      minWidth: 80,
      render: (a) => a.years_of_experience ? `${a.years_of_experience} yr` : "—",
    },
    {
      key: "mobile",
      label: "Mobile",
      minWidth: 130,
      render: (a) => a.mobile || "—",
    },
    {
      key: "status",
      label: "Status",
      minWidth: 120,
      render: (a) => (
        <Chip
          size="small"
          label={a.verification_status.replace("_", " ")}
          color={STATUS_COLOR[a.verification_status]}
          sx={{ fontWeight: 700, fontSize: "0.68rem", textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "joined",
      label: "Submitted",
      minWidth: 120,
      render: (a) =>
        new Date(a.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" }),
    },
    {
      key: "actions",
      label: "",
      minWidth: 60,
      align: "right",
      render: (a) => (
        <Tooltip title="View details">
          <IconButton
            size="small"
            component={Link}
            href={`/admin/advocates/${a.id}`}
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
      title="Advocates"
      subtitle="Registered advocates — data pulled from Django DB"
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        searchValue={search}
        searchPlaceholder="Search name, email, or bar number…"
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
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="under_review">Under Review</MenuItem>
          </Select>
        }
        getRowKey={(a) => a.id}
        emptyMessage="No advocates found."
        pagination={pagination}
      />
    </AdminPageShell>
  );
}
