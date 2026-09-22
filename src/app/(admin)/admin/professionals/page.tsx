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
import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { adminAdvocatesService } from "@/services/admin/adminAdvocates.service";
import type { AdminAdvocate } from "@/types/admin";

// ---------------------------------------------------------------------------
// Types for filter dropdowns
// ---------------------------------------------------------------------------

type FilterOption = { id: string; name: string };

type ApiEnvelope<T> = { success: boolean; message: string; data: T };
type ListData<T> = { results: T[]; count: number };

function authHeaders(): Record<string, string> {
  const token = readAccessTokenFromCookie();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

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

export default function ProfessionalsPage() {
  const [rows, setRows] = useState<AdminAdvocate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [professionFilter, setProfessionFilter] = useState("");

  // Filter options
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [groups, setGroups] = useState<FilterOption[]>([]);
  const [professions, setProfessions] = useState<FilterOption[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // -------------------------------------------------------------------------
  // Load filter options on mount
  // -------------------------------------------------------------------------

  useEffect(() => {
    async function loadFilters() {
      setLoadingFilters(true);
      try {
        const res = await apiClient<ApiEnvelope<ListData<FilterOption>>>(
          `${API_ENDPOINTS.adminProfessionalOnboarding.categories}?page_size=200`,
          { headers: authHeaders() }
        );
        setCategories(res.data.results ?? []);
      } catch {
        // ignore; filters won't show options but page still works
      } finally {
        setLoadingFilters(false);
      }
    }
    loadFilters();
  }, []);

  // Load groups when category changes
  useEffect(() => {
    setGroupFilter("");
    setProfessionFilter("");
    setProfessions([]);
    if (!categoryFilter) {
      setGroups([]);
      return;
    }
    async function loadGroups() {
      try {
        const res = await apiClient<ApiEnvelope<ListData<FilterOption>>>(
          `${API_ENDPOINTS.adminProfessionalOnboarding.categoryGroups(categoryFilter)}?page_size=200`,
          { headers: authHeaders() }
        );
        setGroups(res.data.results ?? []);
      } catch {
        setGroups([]);
      }
    }
    loadGroups();
  }, [categoryFilter]);

  // Load professions when group changes
  useEffect(() => {
    setProfessionFilter("");
    if (!groupFilter) {
      setProfessions([]);
      return;
    }
    async function loadProfessions() {
      try {
        const res = await apiClient<ApiEnvelope<ListData<FilterOption>>>(
          `${API_ENDPOINTS.adminProfessionalOnboarding.groupProfessions(groupFilter)}?page_size=200`,
          { headers: authHeaders() }
        );
        setProfessions(res.data.results ?? []);
      } catch {
        setProfessions([]);
      }
    }
    loadProfessions();
  }, [groupFilter]);

  // -------------------------------------------------------------------------
  // Load professionals
  // -------------------------------------------------------------------------

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminAdvocatesService.listAdvocates({
        search,
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
      setError("Failed to load professionals. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, groupFilter, professionFilter, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  // -------------------------------------------------------------------------
  // Table columns
  // -------------------------------------------------------------------------

  const columns: AdminTableColumn<AdminAdvocate>[] = [
    {
      key: "name",
      label: "Professional",
      minWidth: 220,
      render: (a) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar
            src={a.photo_url || undefined}
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#eff6ff",
              fontSize: "0.78rem",
              fontWeight: 800,
              color: "#1d4ed8",
              boxShadow: "0 2px 8px rgba(37,99,235,0.18)",
              border: "2px solid #dbeafe",
            }}
          >
            {a.full_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                fontWeight: 700,
                color: "#0f172a",
                fontSize: "0.8125rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 160,
              }}
            >
              {a.full_name}
            </Box>
            <Box sx={{ fontSize: "0.7rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
              {a.email}
            </Box>
          </Box>
        </Stack>
      ),
    },
    {
      key: "category",
      label: "Category",
      minWidth: 130,
      render: (a) =>
        a.category_name ? (
          <Chip
            size="small"
            label={a.category_name}
            sx={{
              bgcolor: "#f0fdf4",
              color: "#15803d",
              fontWeight: 700,
              fontSize: "0.68rem",
              border: "1px solid #bbf7d0",
            }}
          />
        ) : (
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            —
          </Typography>
        ),
    },
    {
      key: "group",
      label: "Group",
      minWidth: 130,
      render: (a) =>
        a.group_name ? (
          <Chip
            size="small"
            label={a.group_name}
            sx={{
              bgcolor: "#faf5ff",
              color: "#7e22ce",
              fontWeight: 700,
              fontSize: "0.68rem",
              border: "1px solid #e9d5ff",
            }}
          />
        ) : (
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            —
          </Typography>
        ),
    },
    {
      key: "profession",
      label: "Profession",
      minWidth: 150,
      render: (a) => (
        <Chip
          size="small"
          color="primary"
          label={a.profession_name || "—"}
          sx={{ fontWeight: 700, fontSize: "0.68rem", maxWidth: 140 }}
        />
      ),
    },
    {
      key: "bar",
      label: "Reg / Ref #",
      minWidth: 130,
      render: (a) => (
        <span style={{ fontWeight: 600, color: "#2563eb", fontFamily: "monospace", fontSize: "0.78rem" }}>
          {a.bar_number}
        </span>
      ),
    },
    {
      key: "mobile",
      label: "Mobile",
      minWidth: 120,
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
      minWidth: 80,
      align: "right",
      render: (a) => (
        <Tooltip title="View full profile">
          <IconButton
            size="small"
            component={Link}
            href={`/admin/professionals/${a.id}`}
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

  // -------------------------------------------------------------------------
  // Filter slot — cascading dropdowns
  // -------------------------------------------------------------------------

  const filterSlot = (
    <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }} useFlexGap>
      {/* Status */}
      <Select
        size="small"
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(0);
        }}
        displayEmpty
        sx={{ minWidth: 140, bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.875rem" }}
      >
        <MenuItem value="">All Statuses</MenuItem>
        <MenuItem value="approved">Approved</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="under_review">Under Review</MenuItem>
        <MenuItem value="rejected">Rejected</MenuItem>
      </Select>

      {/* Category */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel sx={{ fontSize: "0.875rem" }}>Category</InputLabel>
        <Select
          label="Category"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(0);
          }}
          sx={{ bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.875rem" }}
          disabled={loadingFilters}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Group — only if category selected */}
      {categoryFilter && (
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontSize: "0.875rem" }}>Group</InputLabel>
          <Select
            label="Group"
            value={groupFilter}
            onChange={(e) => {
              setGroupFilter(e.target.value);
              setPage(0);
            }}
            sx={{ bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.875rem" }}
          >
            <MenuItem value="">All Groups</MenuItem>
            {groups.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Profession — only if group selected */}
      {groupFilter && (
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ fontSize: "0.875rem" }}>Profession</InputLabel>
          <Select
            label="Profession"
            value={professionFilter}
            onChange={(e) => {
              setProfessionFilter(e.target.value);
              setPage(0);
            }}
            sx={{ bgcolor: "#fff", borderRadius: 1.5, fontSize: "0.875rem" }}
          >
            <MenuItem value="">All Professions</MenuItem>
            {professions.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Stack>
  );

  // -------------------------------------------------------------------------

  return (
    <AdminPageShell
      title="Professionals Directory"
      subtitle="Review and manage registered professionals — advocates, chartered accountants, company secretaries, mediators, and institutional practitioners."
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        searchValue={search}
        searchPlaceholder="Search by name, email, ref number, category…"
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        filterSlot={filterSlot}
        getRowKey={(a) => a.id}
        emptyMessage="No professionals found matching the selected criteria."
        pagination={pagination}
      />
    </AdminPageShell>
  );
}
