"use client";

import { Box, Button, Chip, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { adminServicesService } from "@/services/admin/adminServices.service";
import type { AdminJusticeService } from "@/types/admin";
import ServiceFormDialog from "@/components/features/admin/services/ServiceFormDialog";
import Link from "next/link";

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminJusticeService[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<AdminJusticeService | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminServicesService.listServices({
        page: page + 1,
        page_size: pageSize,
        search: search || undefined,
      });
      setServices(res.results);
      setTotal(res.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, search]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await adminServicesService.deleteService(id);
        loadData();
      } catch (err) {
        alert("Cannot delete service.");
      }
    }
  };

  const columns: AdminTableColumn<AdminJusticeService>[] = [
    {
      key: "title",
      label: "Title / Slug",
      render: (row) => (
        <Box>
          <strong>{row.title}</strong>
          <Box sx={{ fontSize: "0.8rem", color: "#64748b" }}>{row.slug}</Box>
        </Box>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => row.category_label,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip label={row.is_active ? "Active" : "Inactive"} size="small" color={row.is_active ? "success" : "default"} />
          {row.is_featured && <Chip label="Featured" size="small" color="primary" />}
        </Box>
      ),
    },
    {
      key: "order",
      label: "Order",
      render: (row) => row.display_order,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <IconButton size="small" onClick={() => { setSelectedService(row); setDialogOpen(true); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <AdminPageShell 
      title="Services" 
      subtitle="Manage ICJ service offerings"
      actions={
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button component={Link} href="/admin/services/categories" variant="outlined" startIcon={<FolderIcon />}>
            Manage Categories
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => { setSelectedService(null); setDialogOpen(true); }}
          >
            Add Service
          </Button>
        </Box>
      }
    >
      <AdminDataTable
        columns={columns}
        rows={services}
        loading={loading}
        getRowKey={(r) => r.id}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        pagination={{
          page,
          totalCount: total,
          rowsPerPage: pageSize,
          onPageChange: (p) => setPage(p),
          onRowsPerPageChange: (s) => { setPageSize(s); setPage(0); }
        }}
      />
      {dialogOpen && (
        <ServiceFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          service={selectedService}
          onSave={loadData}
        />
      )}
    </AdminPageShell>
  );
}
