"use client";

import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import {
  Avatar,
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
import { resolveMediaUrl } from "@/lib/mediaUrl";

import AdminDataTable, {
  type AdminPaginationConfig,
  type AdminTableColumn,
} from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { formatAdminDateShort } from "@/components/features/admin/shared/adminDetailFormatters";
import CredentialsDialog, {
  type CredentialsData,
} from "@/components/features/admin/shared/CredentialsDialog";
import { adminUsersService } from "@/services/admin/adminUsers.service";
import { professionalOnboardingService } from "@/services/admin/professionalOnboarding.service";
import type { AdminUser } from "@/types/admin";
import type {
  OnboardingCategory,
  OnboardingGroup,
  OnboardingProfession,
} from "@/types/admin/professionalOnboarding";
import { formatPlatformRoleLabel, normalizePlatformRole, normalizePlatformRoles } from "@/lib/roles";

// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<AdminUser["status"], "success" | "warning" | "error" | "default"> = {
  active: "success",
  pending: "warning",
  suspended: "error",
  inactive: "default",
};

const ROLE_COLOR: Record<string, "primary" | "secondary" | "success" | "warning" | "info" | "default"> = {
  admin: "primary",
  professional: "warning",
  member: "success",
};

const PAGE_SIZE = 10;

const USERS_PAGE_SUBTITLE =
  "Search and manage users by role and status. Open a user to view category, group, and profession details.";

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
  const [generatingPwdId, setGeneratingPwdId] = useState<number | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<{
    open: boolean;
    data: CredentialsData | null;
  }>({ open: false, data: null });

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

  const handlePasswordAction = async (u: AdminUser) => {
    if (u.temp_password) {
      setCredentialsModal({
        open: true,
        data: {
          user_id: u.id,
          email: u.email,
          name: u.full_name,
          role: u.role,
          temp_password: u.temp_password,
          profession_name: u.profession_name || undefined,
          category_name: u.category_name || undefined,
          is_new_user: false,
        },
      });
      return;
    }

    setGeneratingPwdId(u.id);
    try {
      const res = await adminUsersService.resetUserPassword(u.id);
      setCredentialsModal({
        open: true,
        data: {
          user_id: u.id,
          email: res.email || u.email,
          name: res.name || u.full_name,
          role: res.role || u.role,
          temp_password: res.temp_password,
          profession_name: u.profession_name || undefined,
          category_name: u.category_name || undefined,
          is_new_user: false,
        },
      });
      setToastMsg(`Temporary password generated for ${u.email}`);
      await load();
    } catch {
      setToastMsg("Failed to generate temporary password.");
    } finally {
      setGeneratingPwdId(null);
    }
  };

  const columns: AdminTableColumn<AdminUser>[] = [
    {
      key: "name",
      label: "User",
      minWidth: 170,
      render: (u) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <Avatar
            src={resolveMediaUrl(u.profile_picture_url || u.photo_url) || undefined}
            alt={u.full_name}
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              bgcolor: normalizePlatformRole(u.role) === "admin" ? "#dbeafe" : "#eff6ff",
              fontSize: "0.75rem",
              fontWeight: 800,
              color: normalizePlatformRole(u.role) === "admin" ? "#1d4ed8" : "#2563eb",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {u.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </Avatar>
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
      label: "Role(s)",
      minWidth: 120,
      render: (u) => {
        const rolesList = normalizePlatformRoles(
          u.roles && u.roles.length > 0 ? u.roles : [u.role],
        );
        return (
          <Stack spacing={0.5} sx={{ py: 0.5 }}>
            {rolesList.map((r) => (
              <Chip
                key={r}
                size="small"
                label={formatPlatformRoleLabel(r)}
                color={ROLE_COLOR[r] || "default"}
                sx={{ fontWeight: 700, fontSize: "0.68rem" }}
              />
            ))}
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
          {formatAdminDateShort(u.date_joined)}
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
          <Tooltip title={u.temp_password ? "View Temporary Password" : "Generate / Reset Temporary Password"}>
            <IconButton
              size="small"
              onClick={() => handlePasswordAction(u)}
              disabled={generatingPwdId === u.id}
              sx={{ color: "#d97706", "&:hover": { bgcolor: "#fef3c7" } }}
            >
              <VpnKeyIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
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
      subtitle={USERS_PAGE_SUBTITLE}
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
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="professional">Professional</MenuItem>
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

      {/* Credentials Dialog */}
      <CredentialsDialog
        open={credentialsModal.open}
        onClose={() => setCredentialsModal({ open: false, data: null })}
        credentials={credentialsModal.data}
        title="User Login Credentials"
      />

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
