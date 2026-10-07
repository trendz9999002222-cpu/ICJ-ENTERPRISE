"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
} from "@mui/material";
import type { AdminServiceCategory } from "@/types/admin";
import { adminServicesService } from "@/services/admin/adminServices.service";

type Props = {
  open: boolean;
  onClose: () => void;
  category: AdminServiceCategory | null;
  onSave: () => void;
};

export default function CategoryFormDialog({ open, onClose, category, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<AdminServiceCategory>>({
    name: "",
    slug: "",
    value: "",
    is_active: true,
    display_order: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        name: "",
        slug: "",
        value: "",
        is_active: true,
        display_order: 0,
      });
    }
  }, [category]);

  const handleChange = (field: keyof AdminServiceCategory, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (category?.id) {
        await adminServicesService.updateCategory(category.id, formData);
      } else {
        await adminServicesService.createCategory(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving category. Check if value is unique.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <TextField
              label="Slug (optional)"
              fullWidth
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              helperText="Leave empty to auto-generate"
            />
            <TextField
              label="Value (machine-readable)"
              required
              fullWidth
              value={formData.value}
              onChange={(e) => handleChange("value", e.target.value)}
              helperText="e.g. specialized_law"
            />
            <TextField
              label="Display Order"
              type="number"
              fullWidth
              value={formData.display_order}
              onChange={(e) => handleChange("display_order", Number(e.target.value))}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => handleChange("is_active", e.target.checked)}
                />
              }
              label="Is Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
