import { useState } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Button, Chip, IconButton, Stack, Typography } from "@mui/material";

import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { OPTION_FIELD_TYPES } from "@/components/features/admin/shared/constants";

export type GenericAdminField = {
  id: string;
  label: string;
  name?: string;
  field_key: string;
  field_type: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  options?: any[];
  [key: string]: any;
};

type AdminFieldsTableProps = {
  fields: GenericAdminField[];
  loading?: boolean;
  emptyMessage?: string;
  onEdit: (field: GenericAdminField) => void;
  onDelete?: (field: GenericAdminField) => void;
  onToggleActive?: (field: GenericAdminField) => void;
  onOptions?: (field: GenericAdminField) => void;
};

export default function AdminFieldsTable({
  fields,
  loading = false,
  emptyMessage = "No fields found.",
  onEdit,
  onDelete,
  onToggleActive,
  onOptions,
}: AdminFieldsTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedFields = fields.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const columns: AdminTableColumn<GenericAdminField>[] = [
    {
      key: "display_order",
      label: "Order",
      minWidth: 80,
      render: (f) => (
        <Typography sx={{ fontSize: "0.825rem", color: "#64748b", fontWeight: 700 }}>
          {f.display_order ?? 0}
        </Typography>
      ),
    },
    {
      key: "label",
      label: "Label",
      minWidth: 150,
      render: (f) => (
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>
          {f.label || f.name}
        </Typography>
      ),
    },
    {
      key: "field_key",
      label: "Key",
      minWidth: 120,
      render: (f) => (
        <Typography sx={{ fontSize: "0.825rem", color: "#64748b", fontFamily: "monospace" }}>
          {f.field_key}
        </Typography>
      ),
    },
    {
      key: "field_type",
      label: "Type",
      minWidth: 100,
      render: (f) => (
        <Chip size="small" label={f.field_type} sx={{ borderRadius: 1.5, fontSize: "0.75rem", textTransform: "lowercase" }} />
      ),
    },
    {
      key: "required",
      label: "Required",
      minWidth: 90,
      render: (f) => (
        <Typography sx={{ fontSize: "0.825rem", color: "#334155" }}>
          {f.is_required ? "Yes" : "No"}
        </Typography>
      ),
    },
    {
      key: "active",
      label: "Active",
      minWidth: 90,
      render: (f) => (
        <Chip
          size="small"
          label={f.is_active ? "Active" : "Off"}
          color={f.is_active ? "success" : "default"}
          sx={{ fontWeight: 700, fontSize: "0.7rem", borderRadius: 1.5 }}
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: 140,
      align: "right",
      render: (f) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          {onOptions && OPTION_FIELD_TYPES.includes(f.field_type as any) && (
            <IconButton size="small" onClick={() => onOptions(f)}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          )}
          {onToggleActive && (
            <Button
              size="small"
              onClick={() => onToggleActive(f)}
              sx={{ textTransform: "none", minWidth: 0, mr: 0.5 }}
              color={f.is_active ? "error" : "success"}
            >
              {f.is_active ? "Deactivate" : "Activate"}
            </Button>
          )}
          <IconButton size="small" onClick={() => onEdit(f)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          {onDelete && (
            <IconButton size="small" color="error" onClick={() => onDelete(f)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <AdminDataTable
        columns={columns}
        rows={paginatedFields}
        loading={loading}
        getRowKey={(f) => f.id || f.field_key}
        emptyMessage={emptyMessage}
        pagination={{
          page,
          totalCount: fields.length,
          rowsPerPage,
          onPageChange: setPage,
          onRowsPerPageChange: (n) => {
            setRowsPerPage(n);
            setPage(0);
          },
        }}
      />
    </Box>
  );
}
