"use client";

import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
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
import { adminUsersService } from "@/services/admin/adminUsers.service";
import type { AdminUser } from "@/types/admin";

// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<AdminUser["status"], "success" | "warning" | "error" | "default"> = {
  active: "success",
  pending: "warning",
  suspended: "error",
  inactive: "default",
};

const ROLE_COLOR: Record<AdminUser["role"], "primary" | "secondary" | "default"> = {
  super_admin: "primary",
  admin: "primary",
  advocate: "secondary",
  client: "default",
  staff: "default",
};

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------

export default function UsersPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0); // 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toggling, setToggling] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminUsersService.listUsers({
        search,
        status: statusFilter || undefined,
        page: page + 1,
        page_size: rowsPerPage,
      });
      setRows(res.results);
      setTotalCount(res.count);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, rowsPerPage]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (user: AdminUser) => {
    setToggling(user.id);
    try {
      await adminUsersService.toggleUserStatus(user.id);
      const next = user.status === "active" ? "deactivated" : "activated";
      setToastMsg(`${user.full_name} ${next} successfully.`);
      load();
    } catch {
      setToastMsg("Failed to update user status.");
    } finally {
      setToggling(null);
    }
  };

  const columns: AdminTableColumn<AdminUser>[] = [
    {
      key: "name",
      label: "Name",
      minWidth: 160,
      render: (u) => (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              bgcolor: u.role === "admin" || u.role === "super_admin" ? "#dbeafe" : "#f1f5f9",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              fontSize: "0.65rem",
              fontWeight: 800,
              color: u.role === "admin" || u.role === "super_admin" ? "#1d4ed8" : "#64748b",
            }}
          >
            {u.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </Box>
          <Box>
            <Box sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
              {u.full_name}
            </Box>
            <Box sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{u.username}</Box>
          </Box>
        </Stack>
      ),
    },
    {
      key: "email",
      label: "Email",
      minWidth: 200,
      render: (u) => (
        <Box sx={{ fontSize: "0.8rem", color: "#475569" }}>{u.email}</Box>
      ),
    },
    {
      key: "mobile",
      label: "Mobile",
      minWidth: 140,
      render: (u) => u.mobile || "—",
    },
    {
      key: "role",
      label: "Role",
      minWidth: 120,
      render: (u) => (
        <Chip
          size="small"
          label={u.role.replace("_", " ")}
          color={ROLE_COLOR[u.role]}
          sx={{ fontWeight: 700, fontSize: "0.68rem", textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      minWidth: 110,
      render: (u) => (
        <Chip
          size="small"
          label={u.status}
          color={STATUS_COLOR[u.status]}
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: "0.68rem", textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "verified",
      label: "Verified",
      minWidth: 90,
      render: (u) => (
        <Chip
          size="small"
          label={u.is_verified ? "Yes" : "No"}
          color={u.is_verified ? "success" : "default"}
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: "0.68rem" }}
        />
      ),
    },
    {
      key: "joined",
      label: "Joined",
      minWidth: 120,
      render: (u) =>
        new Date(u.date_joined).toLocaleDateString("en-IN", { dateStyle: "medium" }),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: 120,
      align: "right",
      render: (u) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
          <Tooltip title="View details">
            <IconButton
              size="small"
              component={Link}
              href={`/admin/users/${u.id}`}
              sx={{ color: "#2563eb" }}
            >
              <VisibilityIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={u.status === "active" ? "Deactivate user" : "Activate user"}>
            <IconButton
              size="small"
              onClick={() => handleToggle(u)}
              disabled={toggling === u.id}
              sx={{
                color: u.status === "active" ? "#dc2626" : "#16a34a",
                opacity: toggling === u.id ? 0.4 : 1,
              }}
            >
              {u.status === "active"
                ? <BlockIcon sx={{ fontSize: 16 }} />
                : <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
        </Stack>
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
      title="Users"
      subtitle="All registered platform users — activate or deactivate accounts"
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        searchValue={search}
        searchPlaceholder="Search by name, email, mobile…"
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        filterSlot={
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            displayEmpty
            sx={{ minWidth: 140, bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.875rem" }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        }
        getRowKey={(u) => u.id}
        emptyMessage="No users found."
        pagination={pagination}
      />

      {/* Toast notification */}
      <Snackbar
        open={!!toastMsg}
        autoHideDuration={3000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </AdminPageShell>
  );
}
