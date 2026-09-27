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
        // ignore
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
  // Clean, uncluttered Table columns
  // -------------------------------------------------------------------------

  const columns: AdminTableColumn<AdminAdvocate>[] = [
    {
      key: "name",
      label: "Professional",
      minWidth: 240,
      render: (a) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar
            src={a.photo_url || undefined}
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
            {a.full_name
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
              {a.full_name}
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
              {a.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: "bar",
      label: "Reference ID",
      minWidth: 140,
      render: (a) => (
        <Typography
          sx={{
            fontWeight: 700,
            color: "#2563eb",
            fontFamily: "monospace",
            fontSize: "0.825rem",
          }}
        >
          {a.bar_number || a.enrollment_number || "—"}
        </Typography>
      ),
    },
    {
      key: "mobile",
      label: "Mobile",
      minWidth: 130,
      render: (a) => (
        <Typography sx={{ fontSize: "0.825rem", color: "#334155", fontWeight: 500 }}>
          {a.mobile || "—"}
        </Typography>
      ),
    },
    {
      key: "created_at",
      label: "Submitted Date",
      minWidth: 130,
      render: (a) => (
        <Typography sx={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 500 }}>
          {a.created_at
            ? new Date(a.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </Typography>
      ),
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
      render: (a) => (
        <Tooltip title="View application details">
          <IconButton
            size="small"
            component={Link}
            href={`/admin/professionals/${a.id}`}
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

  // -------------------------------------------------------------------------
  // Filter slot — cascading dropdowns (Category > Group > Profession + Status)
  // -------------------------------------------------------------------------

  const filterSlot = (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{ flexWrap: "wrap", alignItems: { xs: "stretch", sm: "center" } }}
      useFlexGap
    >
      {/* Status Filter */}
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

      {/* Category Filter */}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel sx={{ fontSize: "0.85rem" }}>Category</InputLabel>
        <Select
          label="Category"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(0);
          }}
          sx={{ bgcolor: "#fff", borderRadius: 2, fontSize: "0.85rem" }}
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

      {/* Group Filter */}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel sx={{ fontSize: "0.85rem" }}>Group</InputLabel>
        <Select
          label="Group"
          value={groupFilter}
          onChange={(e) => {
            setGroupFilter(e.target.value);
            setPage(0);
          }}
          disabled={!categoryFilter || groups.length === 0}
          sx={{ bgcolor: "#fff", borderRadius: 2, fontSize: "0.85rem" }}
        >
          <MenuItem value="">All Groups</MenuItem>
          {groups.map((g) => (
            <MenuItem key={g.id} value={g.id}>
              {g.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Profession Filter */}
      <FormControl size="small" sx={{ minWidth: 170 }}>
        <InputLabel sx={{ fontSize: "0.85rem" }}>Profession</InputLabel>
        <Select
          label="Profession"
          value={professionFilter}
          onChange={(e) => {
            setProfessionFilter(e.target.value);
            setPage(0);
          }}
          disabled={!groupFilter || professions.length === 0}
          sx={{ bgcolor: "#fff", borderRadius: 2, fontSize: "0.85rem" }}
        >
          <MenuItem value="">All Professions</MenuItem>
          {professions.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Clear Filters Button */}
      {(statusFilter || categoryFilter || groupFilter || professionFilter || search) && (
        <Chip
          label="Clear Filters"
          onDelete={() => {
            setStatusFilter("");
            setCategoryFilter("");
            setGroupFilter("");
            setProfessionFilter("");
            setSearch("");
            setPage(0);
          }}
          onClick={() => {
            setStatusFilter("");
            setCategoryFilter("");
            setGroupFilter("");
            setProfessionFilter("");
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

  // -------------------------------------------------------------------------

  return (
    <AdminPageShell
      title="Professionals Directory"
      subtitle="Review and manage registered professionals across all categories and groups."
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        searchValue={search}
        searchPlaceholder="Search by name, email, ref number…"
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        filterSlot={filterSlot}
        getRowKey={(a) => a.id}
        emptyMessage="No professionals found matching the selected criteria."
        pagination={pagination}
        showSerialNumber
      />
    </AdminPageShell>
  );
}
