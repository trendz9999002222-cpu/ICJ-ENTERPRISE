"use client";

import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Avatar,
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
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
import {
  membershipOnboardingAdminService,
  type AdminMembershipApplication,
} from "@/services/admin/membershipOnboarding.service";

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  under_review: "default",
  draft: "default",
  cancelled: "default",
};

const PAGE_SIZE = 10;

export default function AdminMembershipsPage() {
  const [rows, setRows] = useState<AdminMembershipApplication[]>([]);
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
      const data = await membershipOnboardingAdminService.listApplications({
        search,
        status: statusFilter || undefined,
        page: page + 1,
        page_size: rowsPerPage,
      });
      setRows(data.results ?? []);
      setTotalCount(data.count ?? 0);
    } catch {
      setError("Failed to load membership applications. Please try again.");
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: AdminTableColumn<AdminMembershipApplication>[] = [
    {
      key: "member",
      label: "Member",
      minWidth: 240,
      render: (row) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#eff6ff",
              fontSize: "0.85rem",
              fontWeight: 800,
              color: "#1d4ed8",
              boxShadow: "0 2px 6px rgba(37,99,235,0.15)",
              border: "2px solid #dbeafe",
            }}
          >
            {(row.person_name || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 220,
              }}
            >
              {row.person_name || "—"}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 220,
              }}
            >
              {row.email || "—"}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: "reference_id",
      label: "Application ID",
      minWidth: 140,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 700,
            color: "#2563eb",
            fontFamily: "monospace",
            fontSize: "0.825rem",
          }}
        >
          {row.reference_id}
        </Typography>
      ),
    },
    {
      key: "membership_id",
      label: "Membership ID",
      minWidth: 140,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 700,
            color: row.membership_id ? "#059669" : "#94a3b8",
            fontFamily: "monospace",
            fontSize: "0.825rem",
          }}
        >
          {row.membership_id || "—"}
        </Typography>
      ),
    },
    {
      key: "mobile",
      label: "Mobile",
      minWidth: 130,
      render: (row) => (
        <Typography sx={{ fontSize: "0.825rem", color: "#334155", fontWeight: 500 }}>
          {row.mobile || "—"}
        </Typography>
      ),
    },
    {
      key: "submitted_at",
      label: "Submitted Date",
      minWidth: 130,
      render: (row) => {
        const date = row.submitted_at || row.created_at;
        return (
          <Typography sx={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 500 }}>
            {date
              ? new Date(date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </Typography>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      minWidth: 120,
      render: (row) => (
        <Chip
          size="small"
          label={row.status.replace("_", " ")}
          color={STATUS_COLOR[row.status] ?? "default"}
          sx={{
            fontWeight: 700,
            fontSize: "0.7rem",
            textTransform: "capitalize",
            borderRadius: 1.5,
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: 80,
      align: "right",
      render: (row) => (
        <Tooltip title="View application details">
          <IconButton
            size="small"
            component={Link}
            href={`/admin/membership-onboarding/applications/${row.id}`}
            sx={{
              color: "#2563eb",
              bgcolor: "#eff6ff",
              border: "1px solid #bfdbfe",
              "&:hover": { bgcolor: "#dbeafe" },
            }}
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

  const filterSlot = (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flexWrap: "wrap", alignItems: "center" }}>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel sx={{ fontSize: "0.85rem" }}>Status</InputLabel>
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          sx={{ bgcolor: "#fff", borderRadius: 2, fontSize: "0.85rem" }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="under_review">Under Review</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </FormControl>
      {(statusFilter || search) && (
        <Chip
          label="Clear Filters"
          onDelete={() => {
            setStatusFilter("");
            setSearch("");
            setPage(0);
          }}
          onClick={() => {
            setStatusFilter("");
            setSearch("");
            setPage(0);
          }}
          size="medium"
          sx={{
            fontWeight: 700,
            bgcolor: "#fee2e2",
            color: "#b91c1c",
            borderRadius: 2,
            "&:hover": { bgcolor: "#fecaca" },
            cursor: "pointer",
          }}
        />
      )}
    </Stack>
  );

  return (
    <AdminPageShell
      title="Memberships Directory"
      subtitle="Review and manage membership applications submitted through the public form."
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        searchValue={search}
        searchPlaceholder="Search by reference, name, email, mobile…"
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        filterSlot={filterSlot}
        getRowKey={(row) => row.id}
        emptyMessage="No membership applications found matching the selected criteria."
        pagination={pagination}
        showSerialNumber
      />
    </AdminPageShell>
  );
}
