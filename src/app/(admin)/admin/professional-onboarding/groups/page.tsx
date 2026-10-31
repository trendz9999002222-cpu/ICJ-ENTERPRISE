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
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

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
import type { ThemeColors, ThemeEditorState } from "@/types/admin/visualTheme";
import AdminDataTable, {
  type AdminPaginationConfig,
  type AdminTableColumn,
} from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  getOnboardingApiErrorMessage,
  professionalOnboardingService,
} from "@/services/admin/professionalOnboarding.service";
import type { OnboardingCategory, OnboardingGroup } from "@/types/admin/professionalOnboarding";

const PAGE_SIZE = 10;

type FormState = {
  category: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  display_order: number;
};

function GroupsPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "";

  const [rows, setRows] = useState<OnboardingGroup[]>([]);
  const [categories, setCategories] = useState<OnboardingCategory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [activeFilter, setActiveFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OnboardingGroup | null>(null);
  const [form, setForm] = useState<FormState>({
    category: initialCategory,
    name: "",
    slug: "",
    description: "",
    is_active: true,
    display_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<OnboardingGroup | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [theme, setTheme] = useState<ThemeEditorState>(emptyThemeEditorState(true));
  const [themeResolved, setThemeResolved] = useState<ThemeColors | undefined>();
  const [themeLoading, setThemeLoading] = useState(false);

  useEffect(() => {
    professionalOnboardingService
      .listCategories({ page_size: 200, ordering: "display_order" })
      .then((res) => setCategories(res.results))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await professionalOnboardingService.listGroups({
        search,
        category: categoryFilter || undefined,
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
      setError(getOnboardingApiErrorMessage(err, "Failed to load groups."));
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage, categoryFilter, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      category: categoryFilter || "",
      name: "",
      slug: "",
      description: "",
      is_active: true,
      display_order: 0,
    });
    setTheme(emptyThemeEditorState(true));
    setThemeResolved(undefined);
    setDialogOpen(true);
  };

  const openEdit = async (row: OnboardingGroup) => {
    setEditing(row);
    setForm({
      category: row.category,
      name: row.name,
      slug: row.slug,
      description: row.description,
      is_active: row.is_active,
      display_order: row.display_order,
    });
    setDialogOpen(true);
    setThemeLoading(true);
    try {
      const payload = await professionalOnboardingService.getGroupTheme(row.id);
      setTheme(apiPayloadToEditorState(payload));
      setThemeResolved(payload.resolved);
    } catch {
      setTheme(emptyThemeEditorState(true));
    } finally {
      setThemeLoading(false);
    }
  };

  const themeIsValid = () => {
    if (theme.use_parent_theme) return true;
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
        await professionalOnboardingService.updateGroup(editing.id, payload);
        setToastMsg("Group updated.");
      } else {
        const created = await professionalOnboardingService.createGroup(payload);
        entityId = created.id;
        setToastMsg("Group created.");
      }
      if (entityId) {
        await professionalOnboardingService.saveGroupTheme(
          entityId,
          editorStateToApiPayload(theme),
        );
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setToastMsg(getOnboardingApiErrorMessage(err, "Failed to save group."));
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    const actualSource = page * rowsPerPage + sourceIndex;
    const actualDest = page * rowsPerPage + destinationIndex;

    const nextRows = [...rows];
    const [moved] = nextRows.splice(actualSource, 1);
    nextRows.splice(actualDest, 0, moved);
    setRows(nextRows);

    try {
      await Promise.all(
        nextRows.map((g, idx) => {
          const newOrder = (idx + 1) * 10;
          if (g.display_order !== newOrder) {
            return professionalOnboardingService.updateGroup(g.id, {
              display_order: newOrder,
            });
          }
          return Promise.resolve();
        })
      );
      setToastMsg("Groups order updated.");
      load();
    } catch (err) {
      setToastMsg("Failed to update group order.");
    }
  };

  const columns: AdminTableColumn<OnboardingGroup>[] = [
    {
      key: "name",
      label: "Name",
      minWidth: 140,
      render: (r) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <ThemeIndicator
            primaryColor={r.theme_primary_color ?? "#2563EB"}
            isCustom={r.theme_is_custom}
            useParentTheme={r.theme_use_parent_theme}
          />
          <strong>{r.name}</strong>
        </Stack>
      ),
    },
    { key: "category", label: "Category", minWidth: 140, render: (r) => r.category_name },
    { key: "slug", label: "Slug", minWidth: 120, render: (r) => r.slug },
    {
      key: "status",
      label: "Status",
      width: 110,
      render: (r) => <ActiveStatusChip active={r.is_active} />,
    },
    {
      key: "professions",
      label: "Professions",
      minWidth: 120,
      render: (r) => (
        <Link
          href={`/admin/practice-areas/professions?group=${r.id}`}
          style={{ color: "#2563eb", fontWeight: 600, fontSize: "0.8125rem" }}
        >
          View professions
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
          <IconButton size="small" onClick={() => openEdit(r)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteTarget(r)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Groups"
      subtitle="Groups belong to a category"
      actions={
        <Stack direction="row" spacing={1}>
          <Button component={Link} href="/admin/practice-areas" variant="outlined" size="small">
            Back
          </Button>
          <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>
            Add group
          </Button>
        </Stack>
      }
    >
      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        isDraggable={!search.trim()}
        onRowReorder={handleReorder}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        getRowKey={(r) => r.id}
        pagination={{
          page,
          totalCount,
          rowsPerPage,
          onPageChange: setPage,
          onRowsPerPageChange: (n) => {
            setRowsPerPage(n);
            setPage(0);
          },
        }}
        filterSlot={
          <Stack direction="row" spacing={1}>
            <TextField
              select
              size="small"
              label="Category"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        }
        emptyMessage="No groups found. Create a group under a category."
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editing ? "Edit group" : "Add group"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              select
              label="Category"
              required
              fullWidth
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              <MenuItem value="">Select category</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
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
                showUseParent
                parentThemeLabel="Use category theme"
                resolvedParentColors={themeResolved}
                previewCategoryName={
                  categories.find((c) => c.id === form.category)?.name || "Category"
                }
                previewGroupName={form.name || "Group name"}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !form.category || themeLoading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Delete group?"
        description={`Delete "${deleteTarget?.name}"?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            await professionalOnboardingService.deleteGroup(deleteTarget.id);
            setToastMsg("Group deleted.");
            setDeleteTarget(null);
            load();
          } catch (err) {
            setToastMsg(getOnboardingApiErrorMessage(err, "Failed to delete group."));
          } finally {
            setDeleting(false);
          }
        }}
        loading={deleting}
      />

      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg("")} message={toastMsg} />
    </AdminPageShell>
  );
}

export default function GroupsPage() {
  return (
    <Suspense
      fallback={
        <AdminPageShell title="Groups" subtitle="Loading…">
          <span />
        </AdminPageShell>
      }
    >
      <GroupsPageContent />
    </Suspense>
  );
}
