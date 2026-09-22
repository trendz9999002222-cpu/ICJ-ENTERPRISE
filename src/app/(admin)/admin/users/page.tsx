"use client";

import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
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
import { adminUsersService } from "@/services/admin/adminUsers.service";
import { professionalOnboardingService } from "@/services/admin/professionalOnboarding.service";
import type { AdminUser } from "@/types/admin";
import type {
  OnboardingCategory,
  OnboardingGroup,
  OnboardingProfession,
} from "@/types/admin/professionalOnboarding";

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
  member: "default",
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

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [professionFilter, setProfessionFilter] = useState("");

  // Dropdown options
  const [categories, setCategories] = useState<OnboardingCategory[]>([]);
  const [groups, setGroups] = useState<OnboardingGroup[]>([]);
  const [professions, setProfessions] = useState<OnboardingProfession[]>([]);

  // Action states
  const [toastMsg, setToastMsg] = useState("");
  const [toggling, setToggling] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load dropdown lists (categories, groups, professions)
  useEffect(() => {
    professionalOnboardingService
      .listCategories({ page_size: 100 })
      .then((res) => setCategories(res.results || []))
      .catch(() => {});

    professionalOnboardingService
      .listGroups({ page_size: 100 })
      .then((res) => setGroups(res.results || []))
      .catch(() => {});

    professionalOnboardingService
      .listProfessions({ page_size: 100 })
      .then((res) => setProfessions(res.results || []))
      .catch(() => {});
  }, []);

  // Filter groups if category is chosen
  const filteredGroups = categoryFilter
    ? groups.filter((g) => g.category === categoryFilter)
    : groups;

  // Filter professions if group is chosen
  const filteredProfessions = groupFilter
    ? professions.filter((p) => p.group === groupFilter)
    : categoryFilter
    ? professions.filter((p) => filteredGroups.some((g) => g.id === p.group))
    : professions;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminUsersService.listUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        group: groupFilter || undefined,
        profession: professionFilter || undefined,
        page: page + 1,
        page_size: rowsPerPage,
      });
      setRows(res.results);
      setTotalCount(res.count);
    } catch {
      setError("Failed to load users. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, categoryFilter, groupFilter, professionFilter, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (user: AdminUser) => {
    setToggling(user.id);
    try {
      await adminUsersService.toggleUserStatus(user.id, user.status);
      const next = user.status === "active" ? "deactivated" : "activated";
      setToastMsg(`${user.full_name} ${next} successfully.`);
      load();
    } catch {
      setToastMsg("Failed to update user status.");
    } finally {
      setToggling(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminUsersService.deleteUser(deleteTarget.id);
      setToastMsg(`User ${deleteTarget.email} deleted permanently.`);
      setDeleteTarget(null);
      load();
    } catch {
      setToastMsg("Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = Boolean(
    roleFilter || statusFilter || categoryFilter || groupFilter || professionFilter || search
  );

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setCategoryFilter("");
    setGroupFilter("");
    setProfessionFilter("");
    setPage(0);
  };

  const columns: AdminTableColumn<AdminUser>[] = [
    {
      key: "name",
      label: "User",
      minWidth: 170,
      render: (u) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: u.role === "admin" || u.role === "super_admin" ? "#dbeafe" : "#f1f5f9",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              fontSize: "0.7rem",
              fontWeight: 800,
              color: u.role === "admin" || u.role === "super_admin" ? "#1d4ed8" : "#475569",
            }}
          >
            {u.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.8125rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {u.full_name}
            </Box>
            <Box sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>@{u.username}</Box>
          </Box>
        </Stack>
      ),
    },
    {
      key: "email",
      label: "Email & Mobile",
      minWidth: 180,
      render: (u) => (
        <Box>
          <Typography sx={{ fontSize: "0.8rem", color: "#0f172a", fontWeight: 500 }}>{u.email}</Typography>
          {u.mobile && (
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              {u.mobile}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "role",
      label: "Role",
      minWidth: 110,
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
      key: "hierarchy",
      label: "Category / Group / Profession",
      minWidth: 200,
      render: (u) => {
        const catName = u.category_name || (u.categories && u.categories.length > 0 ? u.categories[0].name : null);
        const grpName = u.group_name || (u.groups && u.groups.length > 0 ? u.groups[0].name : null);
        const profName = u.profession_name || (u.professions && u.professions.length > 0 ? u.professions[0].name : null);

        if (!catName && !grpName && !profName) {
          return <Typography variant="caption" sx={{ color: "#94a3b8" }}>—</Typography>;
        }

        return (
          <Stack spacing={0.5} sx={{ py: 0.5 }}>
            {catName && (
              <Chip
                size="small"
                variant="outlined"
                label={catName}
                sx={{ fontSize: "0.65rem", height: 20, maxWidth: 180, fontWeight: 600 }}
              />
            )}
            {grpName && (
              <Chip
                size="small"
                variant="outlined"
                color="primary"
                label={grpName}
                sx={{ fontSize: "0.65rem", height: 20, maxWidth: 180, fontWeight: 600 }}
              />
            )}
            {profName && (
              <Chip
                size="small"
                color="secondary"
                label={profName}
                sx={{ fontSize: "0.65rem", height: 20, maxWidth: 180, fontWeight: 600 }}
              />
            )}
          </Stack>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      minWidth: 100,
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
      minWidth: 85,
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
      minWidth: 110,
      render: (u) => (
        <Typography variant="caption" sx={{ color: "#64748b" }}>
          {new Date(u.date_joined).toLocaleDateString("en-IN", { dateStyle: "medium" })}
        </Typography>
      ),
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
          <Tooltip title={u.status === "active" ? "Deactivate / Block user" : "Activate user"}>
            <IconButton
              size="small"
              onClick={() => handleToggle(u)}
              disabled={toggling === u.id}
              sx={{
                color: u.status === "active" ? "#dc2626" : "#16a34a",
                opacity: toggling === u.id ? 0.4 : 1,
              }}
            >
              {u.status === "active" ? (
                <BlockIcon sx={{ fontSize: 16 }} />
              ) : (
                <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete user permanently">
            <IconButton
              size="small"
              onClick={() => setDeleteTarget(u)}
              sx={{ color: "#94a3b8", "&:hover": { color: "#dc2626" } }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
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
    onRowsPerPageChange: (r) => {
      setRowsPerPage(r);
      setPage(0);
    },
    rowsPerPageOptions: [10, 25, 50],
  };

  return (
    <AdminPageShell
      title="User Management"
      subtitle="Filter, search, and manage platform users by role, category, group, profession, and status."
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        searchValue={search}
        searchPlaceholder="Search by name, email, mobile, ref ID…"
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        filterSlot={
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: "wrap", alignItems: "center" }}
          >
            {/* Role Filter */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel id="role-filter-label" sx={{ fontSize: "0.8rem" }}>Role</InputLabel>
              <Select
                labelId="role-filter-label"
                label="Role"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(0);
                }}
                sx={{ bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.8125rem" }}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="advocate">Advocate</MenuItem>
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="member">Member</MenuItem>
              </Select>
            </FormControl>

            {/* Category Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="cat-filter-label" sx={{ fontSize: "0.8rem" }}>Category</InputLabel>
              <Select
                labelId="cat-filter-label"
                label="Category"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setGroupFilter("");
                  setProfessionFilter("");
                  setPage(0);
                }}
                sx={{ bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.8125rem" }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Group Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="grp-filter-label" sx={{ fontSize: "0.8rem" }}>Group</InputLabel>
              <Select
                labelId="grp-filter-label"
                label="Group"
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value);
                  setProfessionFilter("");
                  setPage(0);
                }}
                sx={{ bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.8125rem" }}
              >
                <MenuItem value="">All Groups</MenuItem>
                {filteredGroups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Profession Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="prof-filter-label" sx={{ fontSize: "0.8rem" }}>Profession</InputLabel>
              <Select
                labelId="prof-filter-label"
                label="Profession"
                value={professionFilter}
                onChange={(e) => {
                  setProfessionFilter(e.target.value);
                  setPage(0);
                }}
                sx={{ bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.8125rem" }}
              >
                <MenuItem value="">All Professions</MenuItem>
                {filteredProfessions.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="status-filter-label" sx={{ fontSize: "0.8rem" }}>Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                sx={{ bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.8125rem" }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Button
                variant="outlined"
                size="small"
                color="secondary"
                startIcon={<FilterAltOffIcon />}
                onClick={handleResetFilters}
                sx={{ textTransform: "none", fontSize: "0.8rem" }}
              >
                Reset
              </Button>
            )}
          </Stack>
        }
        getRowKey={(u) => u.id}
        emptyMessage="No users found matching the selected filters."
        pagination={pagination}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm User Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete user{" "}
            <strong>{deleteTarget?.email}</strong> ({deleteTarget?.full_name})? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleting}
            sx={{ fontWeight: 700 }}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast notification */}
      <Snackbar
        open={!!toastMsg}
        autoHideDuration={3500}
        onClose={() => setToastMsg("")}
        message={toastMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </AdminPageShell>
  );
}
