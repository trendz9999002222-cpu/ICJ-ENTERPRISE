"use client";

import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
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
      setError("Failed to load practitioners. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: AdminTableColumn<AdminAdvocate>[] = [
    {
      key: "name",
      label: "Practitioner",
      minWidth: 200,
      render: (a) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Avatar
            src={a.photo_url || undefined}
            sx={{
              width: 34,
              height: 34,
              bgcolor: "#eff6ff",
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "#1d4ed8",
              boxShadow: "0 2px 6px rgba(37,99,235,0.15)",
            }}
          >
            {a.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
              {a.full_name}
            </Box>
            <Box sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{a.email}</Box>
          </Box>
        </Stack>
      ),
    },
    {
      key: "profession",
      label: "Profession & Category",
      minWidth: 170,
      render: (a) => (
        <Stack spacing={0.5}>
          <Chip
            size="small"
            color="primary"
            label={a.profession_name || "Advocate"}
            sx={{ fontWeight: 700, fontSize: "0.68rem", maxWidth: 150 }}
          />
          {a.category_name && (
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
              {a.category_name}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      key: "bar",
      label: "Reg / Enrollment #",
      minWidth: 140,
      render: (a) => <span style={{ fontWeight: 600, color: "#2563eb", fontFamily: "monospace" }}>{a.bar_number}</span>,
    },
    {
      key: "council",
      label: "Regulatory Body",
      minWidth: 160,
      render: (a) => a.state_bar_council || "—",
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
      key: "actions",
      label: "Actions",
      minWidth: 90,
      align: "right",
      render: (a) => (
        <Tooltip title="View full profile">
          <IconButton
            size="small"
            component={Link}
            href={`/admin/advocates/${a.id}`}
            sx={{ color: "#2563eb" }}
          >
            <VisibilityIcon sx={{ fontSize: 18 }} />
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
    onRowsPerPageChange: (r) => {
      setRowsPerPage(r);
      setPage(0);
    },
    rowsPerPageOptions: [10, 25, 50],
  };

  return (
    <AdminPageShell
      title="Professionals & Advocates Directory"
      subtitle="Review and manage empaneled advocates, chartered accountants, company secretaries, mediators, and institutional practitioners."
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        searchValue={search}
        searchPlaceholder="Search by name, email, reg number…"
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        filterSlot={
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            displayEmpty
            sx={{ minWidth: 150, bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.875rem" }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="under_review">Under Review</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        }
        getRowKey={(a) => a.id}
        emptyMessage="No practitioners found matching the selected criteria."
        pagination={pagination}
      />
    </AdminPageShell>
  );
}
