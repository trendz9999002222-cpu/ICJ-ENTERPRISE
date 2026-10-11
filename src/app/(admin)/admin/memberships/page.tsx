"use client";

import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
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
import { membershipOnboardingAdminService } from "@/services/admin/membershipOnboarding.service";
import type { AdminMembershipApplication } from "@/services/admin/membershipOnboarding.service";

// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  under_review: "info",
  draft: "default",
};

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------

export default function AdminMembershipsPage() {
  const [rows, setRows] = useState<AdminMembershipApplication[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);

  // -------------------------------------------------------------------------

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await membershipOnboardingAdminService.listApplications({
        page: page + 1,
        page_size: rowsPerPage,
      });
      setRows(res?.results ?? []);
      setTotalCount(res?.count ?? 0);
    } catch {
      setError("Failed to load memberships. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  // -------------------------------------------------------------------------
  // Columns
  // -------------------------------------------------------------------------

  const columns: AdminTableColumn<AdminMembershipApplication>[] = [
    {
      key: "name",
      label: "Applicant",
      minWidth: 240,
      render: (a) => (
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
            {a.person_name
              ? a.person_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
              : "?"}
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
              {a.person_name || "Unknown"}
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
              {a.email || "No email"}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (a) => (
        <Chip
          label={a.membership_type_name || "Unknown"}
          size="small"
          sx={{ fontWeight: 600, fontSize: "0.75rem", borderRadius: "6px" }}
        />
      ),
    },
    {
      key: "reference_id",
      label: "Reference ID",
      render: (a) => (
        <Typography
          sx={{
            fontWeight: 700,
            color: "#2563eb",
            fontFamily: "monospace",
            fontSize: "0.825rem",
          }}
        >
          {a.reference_id || "-"}
        </Typography>
      ),
    },
    {
      key: "mobile",
      label: "Phone",
      render: (a) => (
        <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.825rem" }}>
          {a.mobile || "-"}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (a) => (
        <Chip
          label={a.status.replace("_", " ").toUpperCase()}
          size="small"
          color={STATUS_COLOR[a.status] || "default"}
          sx={{
            fontWeight: 700,
            fontSize: "0.7rem",
            px: 0.5,
            height: 22,
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (a) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          <Tooltip title="View Application">
            <Link href={`/admin/membership-onboarding/${a.id}`}>
              <IconButton
                size="small"
                sx={{ color: "#3b82f6", bgcolor: "#eff6ff" }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Link>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const pagination: AdminPaginationConfig = {
    page,
    rowsPerPage,
    totalCount,
    onPageChange: (newPage) => setPage(newPage),
    onRowsPerPageChange: (newSize) => {
      setRowsPerPage(newSize);
      setPage(0);
    },
  };

  return (
    <AdminPageShell
      title="Memberships"
      subtitle="View all registered memberships"
    >
      <AdminDataTable
        rows={rows}
        columns={columns}
        loading={loading}
        error={error}
        pagination={pagination}
        getRowKey={(row) => row.id}
        showSerialNumber
      />
    </AdminPageShell>
  );
}
