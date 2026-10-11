"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import ActiveStatusChip from "@/components/features/admin/professional-onboarding/ActiveStatusChip";
import ConfirmDeleteDialog from "@/components/features/admin/professional-onboarding/ConfirmDeleteDialog";
import { slugFromName } from "@/components/features/admin/shared/constants";
import ColorThemeEditor from "@/components/features/admin/professional-onboarding/theme/ColorThemeEditor";
import {
  apiPayloadToEditorState,
  editorStateToApiPayload,
  emptyThemeEditorState,
} from "@/components/features/admin/professional-onboarding/theme/themeHelpers";
import ThemeIndicator from "@/components/features/admin/professional-onboarding/theme/ThemeIndicator";
import { isValidHexColor } from "@/lib/color/contrast";
import type { ThemeEditorState } from "@/types/admin/visualTheme";
import AdminDataTable, {
  type AdminPaginationConfig,
  type AdminTableColumn,
} from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  getOnboardingApiErrorMessage,
  professionalOnboardingService,
} from "@/services/admin/professionalOnboarding.service";
import type { OnboardingCategory } from "@/types/admin/professionalOnboarding";

const PAGE_SIZE = 10;

type FormState = {
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  display_order: number;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  is_active: true,
  display_order: 0,
};

export default function CategoriesPage() {
  const [rows, setRows] = useState<OnboardingCategory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OnboardingCategory | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<OnboardingCategory | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [theme, setTheme] = useState<ThemeEditorState>(emptyThemeEditorState(false));
  const [themeLoading, setThemeLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await professionalOnboardingService.listCategories({
        search,
        page: page + 1,
        page_size: rowsPerPage,
        is_active:
          activeFilter === "active"
            ? true
            : activeFilter === "inactive"
              ? false
              : undefined,
        ordering: "display_order",
      });
      setRows(res.results);
      setTotalCount(res.count);
    } catch (err) {
      setError(getOnboardingApiErrorMessage(err, "Failed to load categories."));
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setTheme(emptyThemeEditorState(false));
    setDialogOpen(true);
  };

  const openEdit = async (row: OnboardingCategory) => {
    setEditing(row);
    setForm({
      name: row.name,
      slug: row.slug,
      description: row.description,
      is_active: row.is_active,
      display_order: row.display_order,
    });
    setDialogOpen(true);
    setThemeLoading(true);
    try {
      const payload = await professionalOnboardingService.getCategoryTheme(row.id);
      setTheme(apiPayloadToEditorState(payload));
    } catch {
      setTheme(emptyThemeEditorState(false));
    } finally {
      setThemeLoading(false);
    }
  };

  const themeIsValid = () => {
    const keys = [
      "primary_color",
      "secondary_color",
      "accent_color",
      "background_color",
      "text_color",
      "border_color",
      "icon_color",
    ] as const;
    return keys.every((k) => isValidHexColor(theme[k]));
  };

  const handleSave = async () => {
    if (!themeIsValid()) {
      setToastMsg("Please enter valid HEX colors for the visual theme.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugFromName(form.name),
      };
      let entityId = editing?.id;
      if (editing) {
        await professionalOnboardingService.updateCategory(editing.id, payload);
        setToastMsg("Category updated.");
      } else {
        const created = await professionalOnboardingService.createCategory(payload);
        entityId = created.id;
        setToastMsg("Category created.");
      }
      if (entityId) {
        await professionalOnboardingService.saveCategoryTheme(
          entityId,
          editorStateToApiPayload(theme),
        );
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setToastMsg(getOnboardingApiErrorMessage(err, "Failed to save category."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await professionalOnboardingService.deleteCategory(deleteTarget.id);
      setToastMsg("Category deleted.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      setToastMsg(getOnboardingApiErrorMessage(err, "Failed to delete category."));
    } finally {
      setDeleting(false);
    }
  };

  const columns: AdminTableColumn<OnboardingCategory>[] = [
    {
      key: "name",
      label: "Name",
      minWidth: 160,
      render: (r) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <ThemeIndicator
            primaryColor={r.theme_primary_color ?? "#2563EB"}
            isCustom={r.theme_is_custom}
          />
          <span style={{ fontWeight: 600 }}>{r.name}</span>
        </Stack>
      ),
    },
    { key: "slug", label: "Slug", minWidth: 120, render: (r) => r.slug },
    {
      key: "order",
      label: "Order",
      width: 80,
      render: (r) => r.display_order,
    },
    {
      key: "status",
      label: "Status",
      width: 110,
      render: (r) => <ActiveStatusChip active={r.is_active} />,
    },
    {
      key: "groups",
      label: "Groups",
      minWidth: 120,
      render: (r) => (
        <Link
          href={`/admin/practice-areas/groups?category=${r.id}`}
          style={{ color: "#2563eb", fontWeight: 600, fontSize: "0.8125rem" }}
        >
          View groups
        </Link>
      ),
    },
    {
      key: "actions",
      label: "",
      width: 100,
      align: "right",
      render: (r) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(r)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(r)}>
              <DeleteIcon fontSize="small" />
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
    onPageChange: setPage,
    onRowsPerPageChange: (n) => {
      setRowsPerPage(n);
      setPage(0);
    },
  };

  return (
    <AdminPageShell
      title="Categories"
      subtitle="Top-level onboarding categories"
      actions={
        <Stack direction="row" spacing={1}>
          <Button component={Link} href="/admin/practice-areas" variant="outlined" size="small">
            Back
          </Button>
          <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>
            Add category
          </Button>
        </Stack>
      }
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        searchPlaceholder="Search categories…"
        getRowKey={(r) => r.id}
        pagination={pagination}
        filterSlot={
          <TextField
            select
            size="small"
            label="Status"
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        }
        emptyMessage="No categories yet. Add your first category to get started."
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editing ? "Edit category" : "Add category"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Name"
              required
              fullWidth
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: f.slug || slugFromName(name),
                }));
              }}
            />
            <TextField
              label="Slug"
              fullWidth
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              helperText="URL-safe identifier; auto-generated from name if left blank on create."
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <TextField
              label="Display order"
              type="number"
              fullWidth
              value={form.display_order}
              onChange={(e) =>
                setForm((f) => ({ ...f, display_order: Number(e.target.value) || 0 }))
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
              }
              label="Active"
            />
            <Divider />
            {!themeLoading && (
              <ColorThemeEditor
                value={theme}
                onChange={setTheme}
                previewCategoryName={form.name || "Category name"}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.name.trim() || themeLoading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Delete category?"
        description={`This will permanently delete "${deleteTarget?.name}". Related groups may be affected.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />

      <Snackbar
        open={!!toastMsg}
        autoHideDuration={4000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
      />
    </AdminPageShell>
  );
}
