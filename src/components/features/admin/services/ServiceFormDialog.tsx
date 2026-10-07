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
  MenuItem,
} from "@mui/material";
import type { AdminJusticeService, AdminServiceCategory } from "@/types/admin";
import { adminServicesService } from "@/services/admin/adminServices.service";

type Props = {
  open: boolean;
  onClose: () => void;
  service: AdminJusticeService | null;
  onSave: () => void;
};

export default function ServiceFormDialog({ open, onClose, service, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<AdminJusticeService>>({
    title: "",
    slug: "",
    short_description: "",
    category: "",
    icon_name: "",
    who_it_is_for: [],
    how_icj_helps: [],
    available_assistance: [],
    next_steps: [],
    related_professionals: [],
    is_featured: false,
    is_active: true,
    display_order: 0,
  });
  const [categories, setCategories] = useState<AdminServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminServicesService.listCategories({ page_size: 100 }).then((res) => {
      setCategories(res.results);
    });
  }, []);

  useEffect(() => {
    if (service) {
      setFormData(service);
    } else {
      setFormData({
        title: "",
        slug: "",
        short_description: "",
        category: "",
        icon_name: "",
        who_it_is_for: [],
        how_icj_helps: [],
        available_assistance: [],
        next_steps: [],
        related_professionals: [],
        is_featured: false,
        is_active: true,
        display_order: 0,
      });
    }
  }, [service]);

  const handleChange = (field: keyof AdminJusticeService, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleListChange = (field: keyof AdminJusticeService, value: string) => {
    const list = value.split("\n").map(s => s.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, [field]: list }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (service?.id) {
        await adminServicesService.updateService(service.id, formData);
      } else {
        await adminServicesService.createService(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error saving service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{service ? "Edit Service" : "Add Service"}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            <TextField
              label="Category"
              select
              required
              fullWidth
              value={formData.category || ""}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Slug (optional)"
              fullWidth
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
            />
            <TextField
              label="Icon Name"
              fullWidth
              value={formData.icon_name}
              onChange={(e) => handleChange("icon_name", e.target.value)}
            />
            <TextField
              label="Short Description"
              required
              fullWidth
              multiline
              rows={2}
              sx={{ gridColumn: "span 2" }}
              value={formData.short_description}
              onChange={(e) => handleChange("short_description", e.target.value)}
            />
            
            <TextField
              label="Who It Is For (One per line)"
              fullWidth
              multiline
              rows={3}
              value={formData.who_it_is_for?.join("\n") || ""}
              onChange={(e) => handleListChange("who_it_is_for", e.target.value)}
            />
            <TextField
              label="How ICJ Helps (One per line)"
              fullWidth
              multiline
              rows={3}
              value={formData.how_icj_helps?.join("\n") || ""}
              onChange={(e) => handleListChange("how_icj_helps", e.target.value)}
            />
            <TextField
              label="Available Assistance (One per line)"
              fullWidth
              multiline
              rows={3}
              value={formData.available_assistance?.join("\n") || ""}
              onChange={(e) => handleListChange("available_assistance", e.target.value)}
            />
            <TextField
              label="Next Steps (One per line)"
              fullWidth
              multiline
              rows={3}
              value={formData.next_steps?.join("\n") || ""}
              onChange={(e) => handleListChange("next_steps", e.target.value)}
            />
            <TextField
              label="Related Professionals (One per line)"
              fullWidth
              multiline
              rows={3}
              value={formData.related_professionals?.join("\n") || ""}
              onChange={(e) => handleListChange("related_professionals", e.target.value)}
            />
            
            <Box sx={{ gridColumn: "span 2", display: "flex", gap: 3 }}>
              <TextField
                label="Display Order"
                type="number"
                value={formData.display_order}
                onChange={(e) => handleChange("display_order", Number(e.target.value))}
              />
              <FormControlLabel
                control={<Switch checked={formData.is_active} onChange={(e) => handleChange("is_active", e.target.checked)} />}
                label="Is Active"
              />
              <FormControlLabel
                control={<Switch checked={formData.is_featured} onChange={(e) => handleChange("is_featured", e.target.checked)} />}
                label="Is Featured"
              />
            </Box>
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
