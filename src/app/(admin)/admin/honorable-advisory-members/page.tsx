"use client";

import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Chip, Stack, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import type { HonorableAdvisoryMember } from "@/services/public/honorableAdvisory.service";
import HonorableAdvisoryActions from "@/app/(admin)/admin/honorable-advisory-onboarding/HonorableAdvisoryActions";

const ADMIN_BASE = "/honorable-advisory/admin";

export default function AdminHonorableAdvisoryMembersPage() {
  const [members, setMembers] = useState<HonorableAdvisoryMember[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMember, setViewMember] = useState<HonorableAdvisoryMember | null>(null);
  const [editMember, setEditMember] = useState<{ id: string; display_order: number; field_values: Record<string, any> } | null>(null);

  const load = async () => {
    setLoading(true);
    const t = readAccessTokenFromCookie();
    if (!t) return;

    try {
      const res = await apiClient<{
        success: boolean;
        data: { results: HonorableAdvisoryMember[] };
      }>(`${ADMIN_BASE}/members/`, { headers: { Authorization: `Bearer ${t}` } });
      setMembers(res.data.results);
    } catch {
      setError("Could not load members.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const t = readAccessTokenFromCookie();
    if (!t) return;
    try {
      await apiClient(`${ADMIN_BASE}/members/${id}/toggle-status/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` }
      });
      setMembers(prev => prev.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m));
      setViewMember(prev => prev && prev.id === id ? { ...prev, is_active: !prev.is_active } : prev);
    } catch {
      setError("Could not update member status.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: AdminTableColumn<HonorableAdvisoryMember>[] = [
    {
      key: "member",
      label: "Member",
      minWidth: 240,
      render: (m) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar
            src={resolveMediaUrl(m.photo_url) || undefined}
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
            {!m.photo_url && m.name.substring(0, 2).toUpperCase()}
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
              {m.name}
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
              {m.role || "—"}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: "qualification",
      label: "Qualification",
      minWidth: 150,
      render: (m) => (
        <Typography sx={{ fontSize: "0.825rem", color: "#334155", fontWeight: 500 }}>
          {m.qualification || "—"}
        </Typography>
      ),
    },
    {
      key: "display_order",
      label: "Order",
      minWidth: 80,
      align: "center",
      render: (m) => (
        <Typography sx={{ fontSize: "0.825rem", color: "#64748b", fontWeight: 700 }}>
          {m.display_order}
        </Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      minWidth: 100,
      render: (m) => (
        <Chip
          size="small"
          label={m.is_active ? "Active" : "Inactive"}
          color={m.is_active ? "success" : "default"}
          sx={{
            fontWeight: 700,
            fontSize: "0.7rem",
            textTransform: "uppercase",
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
      render: (m) => (
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <Tooltip title="View member details">
            <IconButton
              size="small"
              onClick={() => setViewMember(m)}
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
          <Tooltip title="Edit member">
            <IconButton
              size="small"
              onClick={() => setEditMember({ id: m.id!, display_order: m.display_order, field_values: m.field_values || {} })}
              sx={{
                color: "#16a34a",
                bgcolor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                "&:hover": { bgcolor: "#dcfce7" },
              }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.role && m.role.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedMembers = filteredMembers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <AdminPageShell
      title="Honorable Advisory Members"
      subtitle="View all registered members of the Honorable Advisory Board"
      actions={
        <HonorableAdvisoryActions
          onSuccess={load}
          editMember={editMember}
          onEditClose={() => setEditMember(null)}
        />
      }
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <AdminDataTable
        columns={columns}
        rows={paginatedMembers}
        loading={loading}
        error={error}
        searchValue={search}
        searchPlaceholder="Search by name, role..."
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        getRowKey={(row) => row.id!}
        emptyMessage="No members found matching the selected criteria."
        showSerialNumber
        pagination={{
          page,
          rowsPerPage,
          totalCount: filteredMembers.length,
          onPageChange: (newPage) => setPage(newPage),
          onRowsPerPageChange: (newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
          },
        }}
      />

      {/* View Member Dialog */}
      <Dialog open={!!viewMember} onClose={() => setViewMember(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: "1px solid #e2e8f0" }}>
          Member Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {viewMember && (
            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Avatar
                  src={resolveMediaUrl(viewMember.photo_url) || undefined}
                  sx={{ width: 100, height: 100, fontSize: "2rem", bgcolor: "#2563eb" }}
                >
                  {!viewMember.photo_url && viewMember.name.substring(0, 2).toUpperCase()}
                </Avatar>
              </Box>

              <Stack direction="row" spacing={2}>
                <Typography sx={{ width: 120, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>Name:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{viewMember.name}</Typography>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Typography sx={{ width: 120, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>Role:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{viewMember.role || "—"}</Typography>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Typography sx={{ width: 120, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>Qualification:</Typography>
                <Typography sx={{ fontWeight: 600 }}>{viewMember.qualification || "—"}</Typography>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Typography sx={{ width: 120, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>Status:</Typography>
                <Box>
                  <Chip
                    size="small"
                    label={viewMember.is_active ? "Active" : "Inactive"}
                    color={viewMember.is_active ? "success" : "default"}
                    sx={{ fontWeight: 700, fontSize: "0.7rem", borderRadius: 1.5 }}
                  />
                </Box>
              </Stack>

              {/* Show all field_values dynamically */}
              {viewMember.field_values && Object.keys(viewMember.field_values).length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                    Additional Information
                  </Typography>
                  {Object.entries(viewMember.field_values).map(([key, value]) => {
                    if (key === "name" || key === "role" || key === "qualification" || !value) return null;
                    return (
                      <Stack key={key} direction="row" spacing={2}>
                        <Typography sx={{ width: 120, fontWeight: 700, color: "#64748b", flexShrink: 0, textTransform: "capitalize" }}>
                          {key.replace(/_/g, " ")}:
                        </Typography>
                        <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                          {String(value)}
                        </Typography>
                      </Stack>
                    );
                  })}
                </>
              )}

              <Divider sx={{ my: 1 }} />
              <Box>
                <Typography sx={{ fontWeight: 700, color: "#64748b", mb: 0.5 }}>Bio:</Typography>
                <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                  {viewMember.bio || "No biography provided."}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0", justifyContent: "space-between" }}>
          {viewMember && (
            <Button
              onClick={() => toggleStatus(viewMember.id!)}
              variant="contained"
              color={viewMember.is_active ? "error" : "success"}
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              {viewMember.is_active ? "Deactivate Member" : "Activate Member"}
            </Button>
          )}
          <Button onClick={() => setViewMember(null)} variant="outlined" sx={{ fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
