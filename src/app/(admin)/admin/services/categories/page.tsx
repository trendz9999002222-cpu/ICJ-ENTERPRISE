"use client";

import { Box, Button, Chip, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import { adminServicesService } from "@/services/admin/adminServices.service";
import type { AdminServiceCategory } from "@/types/admin";
import CategoryFormDialog from "@/components/features/admin/services/CategoryFormDialog";
import Link from "next/link";

export default function AdminServiceCategoriesPage() {
  const [categories, setCategories] = useState<AdminServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AdminServiceCategory | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminServicesService.listCategories({
        page: page + 1,
        page_size: pageSize,
        search: search || undefined,
      });
      setCategories(res.results);
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
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await adminServicesService.deleteCategory(id);
        loadData();
      } catch (err) {
        alert("Cannot delete category. It might have associated services.");
      }
    }
  };

  const handleReorder = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    const actualSource = page * pageSize + sourceIndex;
    const actualDest = page * pageSize + destinationIndex;

    const nextCats = [...categories];
    const [moved] = nextCats.splice(actualSource, 1);
    nextCats.splice(actualDest, 0, moved);
    setCategories(nextCats);

    try {
      await Promise.all(
        nextCats.map((c, idx) => {
          const newOrder = (idx + 1) * 10;
          if (c.display_order !== newOrder) {
            return adminServicesService.updateCategory(c.id, {
              display_order: newOrder,
            });
          }
          return Promise.resolve();
        })
      );
      loadData();
    } catch (err) {
      console.error("Failed to reorder categories", err);
    }
  };

  const columns: AdminTableColumn<AdminServiceCategory>[] = [
    {
      key: "name",
      label: "Name",
      render: (row) => <strong>{row.name}</strong>,
    },
    {
      key: "slug",
      label: "Slug / Value",
      render: (row) => (
        <Box>
          <Box sx={{ fontSize: "0.8rem", color: "#64748b" }}>Slug: {row.slug}</Box>
          <Box sx={{ fontSize: "0.8rem", color: "#64748b" }}>Value: {row.value}</Box>
        </Box>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <Chip 
          label={row.is_active ? "Active" : "Inactive"} 
          size="small"
          color={row.is_active ? "success" : "default"}
        />
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
          <IconButton size="small" onClick={() => { setSelectedCategory(row); setDialogOpen(true); }}>
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
      title="Service Categories" 
      subtitle="Manage categories for justice services"
      actions={
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button component={Link} href="/admin/services" variant="outlined">
            Back to Services
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => { setSelectedCategory(null); setDialogOpen(true); }}
          >
            Add Category
          </Button>
        </Box>
      }
    >
      <AdminDataTable
        columns={columns}
        rows={categories}
        loading={loading}
        isDraggable={!search.trim()}
        onRowReorder={handleReorder}
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
        <CategoryFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          category={selectedCategory}
          onSave={loadData}
        />
      )}
    </AdminPageShell>
  );
}
