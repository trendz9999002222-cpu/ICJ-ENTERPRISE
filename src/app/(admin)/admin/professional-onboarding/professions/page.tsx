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
import CategoryGroupProfessionSelect, {
  type CascadeValue,
} from "@/components/features/admin/professional-onboarding/CategoryGroupProfessionSelect";
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
import type { OnboardingCategory, OnboardingGroup, OnboardingProfession } from "@/types/admin/professionalOnboarding";

const PAGE_SIZE = 10;

function ProfessionsPageContent() {
  const searchParams = useSearchParams();
  const initialGroup = searchParams.get("group") ?? "";

  const [rows, setRows] = useState<OnboardingProfession[]>([]);
  const [categories, setCategories] = useState<OnboardingCategory[]>([]);
  const [groups, setGroups] = useState<OnboardingGroup[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterGroup, setFilterGroup] = useState(initialGroup);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OnboardingProfession | null>(null);
  const [cascade, setCascade] = useState<CascadeValue>({
    categoryId: "",
    groupId: initialGroup ? "" : "",
    professionId: "",
  });
  const [form, setForm] = useState({
    group: initialGroup,
    name: "",
    slug: "",
    description: "",
    is_active: true,
    display_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<OnboardingProfession | null>(null);
  const [theme, setTheme] = useState<ThemeEditorState>(emptyThemeEditorState(true));
  const [themeResolved, setThemeResolved] = useState<ThemeColors | undefined>();
  const [themeLoading, setThemeLoading] = useState(false);

  useEffect(() => {
    professionalOnboardingService
      .listCategories({ page_size: 200 })
      .then((res) => setCategories(res.results))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!filterCategory) {
      setGroups([]);
      return;
    }
    professionalOnboardingService
      .listGroups({ category: filterCategory, page_size: 200 })
      .then((res) => setGroups(res.results))
      .catch(() => {});
  }, [filterCategory]);

  useEffect(() => {
    if (initialGroup && !filterGroup) setFilterGroup(initialGroup);
  }, [initialGroup, filterGroup]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await professionalOnboardingService.listProfessions({
        search,
        group: filterGroup || undefined,
        category: filterCategory || undefined,
        page: page + 1,
        page_size: rowsPerPage,
        ordering: "display_order",
      });
      setRows(res.results);
      setTotalCount(res.count);
    } catch (err) {
      setError(getOnboardingApiErrorMessage(err, "Failed to load professions."));
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage, filterGroup, filterCategory]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setCascade({ categoryId: filterCategory, groupId: filterGroup, professionId: "" });
    setForm({
      group: filterGroup,
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

  const openEdit = async (row: OnboardingProfession) => {
    setEditing(row);
    setCascade({
      categoryId: row.category_id,
      groupId: row.group,
      professionId: row.id,
    });
    setForm({
      group: row.group,
      name: row.name,
      slug: row.slug,
      description: row.description,
      is_active: row.is_active,
      display_order: row.display_order,
    });
    setDialogOpen(true);
    setThemeLoading(true);
    try {
      const payload = await professionalOnboardingService.getProfessionTheme(row.id);
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
    const groupId = editing ? form.group : cascade.groupId;
    if (!groupId) {
      setToastMsg("Select a group for this profession.");
      return;
    }
    if (!themeIsValid()) {
      setToastMsg("Please enter valid HEX colors for the visual theme.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        group: groupId,
        name: form.name,
        slug: form.slug || slugFromName(form.name),
        description: form.description,
        is_active: form.is_active,
        display_order: form.display_order,
      };
      let entityId = editing?.id;
      if (editing) {
        await professionalOnboardingService.updateProfession(editing.id, payload);
        setToastMsg("Profession updated.");
      } else {
        const created = await professionalOnboardingService.createProfession(payload);
        entityId = created.id;
        setToastMsg("Profession created.");
      }
      if (entityId) {
        await professionalOnboardingService.saveProfessionTheme(
          entityId,
          editorStateToApiPayload(theme),
        );
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      setToastMsg(getOnboardingApiErrorMessage(err, "Failed to save profession."));
    } finally {
      setSaving(false);
    }
  };

  const columns: AdminTableColumn<OnboardingProfession>[] = [
    {
      key: "name",
      label: "Profession",
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
    { key: "group", label: "Group", minWidth: 120, render: (r) => r.group_name },
    { key: "slug", label: "Slug", minWidth: 100, render: (r) => r.slug },
    {
      key: "status",
      label: "Status",
      width: 110,
      render: (r) => <ActiveStatusChip active={r.is_active} />,
    },
    {
      key: "config",
      label: "Configuration",
      minWidth: 200,
      render: (r) => (
        <Stack direction="row" spacing={1}>
          <Link
            href={`/admin/practice-areas/profession-fields?profession=${r.id}`}
            style={{ color: "#2563eb", fontWeight: 600, fontSize: "0.75rem" }}
          >
            Fields
          </Link>
          <Link
            href={`/admin/practice-areas/profession-fields?profession=${r.id}&tab=documents`}
            style={{ color: "#2563eb", fontWeight: 600, fontSize: "0.75rem" }}
          >
            Documents
          </Link>
          <Link
            href={`/admin/practice-areas/preview?profession=${r.id}`}
            style={{ color: "#64748b", fontWeight: 600, fontSize: "0.75rem" }}
          >
            Preview
          </Link>
        </Stack>
      ),
    },
    {
      key: "actions",
      label: "",
      width: 90,
      align: "right",
      render: (r) => (
        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(r)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" color="error" onClick={() => setDeleteTarget(r)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Professions"
      subtitle="Professions belong to a group"
      actions={
        <Stack direction="row" spacing={1}>
          <Button component={Link} href="/admin/practice-areas" variant="outlined" size="small">
            Back
          </Button>
          <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>
            Add profession
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
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterGroup("");
                setPage(0);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Group"
              value={filterGroup}
              disabled={!filterCategory && !groups.length}
              onChange={(e) => {
                setFilterGroup(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              {groups.map((g) => (
                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
              ))}
            </TextField>
          </Stack>
        }
        emptyMessage="No professions found."
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editing ? "Edit profession" : "Add profession"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {!editing && (
              <CategoryGroupProfessionSelect
                value={cascade}
                onChange={(v) => {
                  setCascade(v);
                  setForm((f) => ({ ...f, group: v.groupId }));
                }}
                requireProfession={false}
              />
            )}
            {editing && (
              <TextField label="Group" value={form.group} disabled fullWidth helperText="Group is set via hierarchy; change group by re-creating if needed." />
            )}
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
                parentThemeLabel="Use group theme"
                resolvedParentColors={themeResolved}
                previewCategoryName={
                  categories.find((c) => c.id === cascade.categoryId)?.name || "Category"
                }
                previewGroupName={groups.find((g) => g.id === form.group)?.name || "Group"}
                previewProfessionName={form.name || "Profession name"}
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
        title="Delete profession?"
        description={`Delete "${deleteTarget?.name}"?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await professionalOnboardingService.deleteProfession(deleteTarget.id);
            setToastMsg("Profession deleted.");
            setDeleteTarget(null);
            load();
          } catch (err) {
            setToastMsg(getOnboardingApiErrorMessage(err, "Failed to delete."));
          }
        }}
      />

      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg("")} message={toastMsg} />
    </AdminPageShell>
  );
}

export default function ProfessionsPage() {
  return (
    <Suspense
      fallback={
        <AdminPageShell title="Professions" subtitle="Loading…">
          <span />
        </AdminPageShell>
      }
    >
      <ProfessionsPageContent />
    </Suspense>
  );
}
