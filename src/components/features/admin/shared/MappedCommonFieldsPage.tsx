"use client";

import {
  Chip,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useCallback, useEffect, useState } from "react";

import ActiveStatusChip from "@/components/features/admin/professional-onboarding/ActiveStatusChip";
import AdminDataTable, { type AdminTableColumn } from "@/components/features/admin/shared/AdminDataTable";
import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import { coreOnboardingService, getCoreApiErrorMessage } from "@/services/admin/coreOnboarding.service";
import type { CommonField, FormFieldConfig } from "@/types/admin/coreOnboarding";

type Props = {
  formCode: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
};

// Represents a row in the UI (Global Field + its Form Config if any)
type CombinedRow = {
  globalField: CommonField;
  config: FormFieldConfig | null;
};

function OrderInputCell({
  displayOrder,
  disabled,
  onSave,
}: {
  displayOrder: number | undefined;
  disabled: boolean;
  onSave: (val: number) => void;
}) {
  const currentVal = displayOrder !== undefined ? String(displayOrder) : "0";
  const [val, setVal] = useState<string>(currentVal);

  useEffect(() => {
    setVal(displayOrder !== undefined ? String(displayOrder) : "0");
  }, [displayOrder]);

  const handleCommit = () => {
    const num = parseInt(val, 10);
    const existingNum = displayOrder !== undefined ? displayOrder : 0;
    if (!isNaN(num) && (displayOrder === undefined || num !== displayOrder)) {
      onSave(num);
    } else if (isNaN(num)) {
      setVal(String(existingNum));
    }
  };

  return (
    <TextField
      size="small"
      type="number"
      sx={{ width: 85 }}
      value={val}
      placeholder="0"
      disabled={disabled}
      onChange={(e) => setVal(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          (e.target as HTMLInputElement).blur();
        }
      }}
      onBlur={handleCommit}
    />
  );
}

export default function MappedCommonFieldsPage({ formCode, title, subtitle, actions }: Props) {
  const [globalFields, setGlobalFields] = useState<CommonField[]>([]);
  const [configs, setConfigs] = useState<FormFieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [toastMsg, setToastMsg] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fieldsRes, configsRes] = await Promise.all([
        coreOnboardingService.listCommonFields({ page_size: 1000, ordering: "name" }),
        coreOnboardingService.listFormFieldConfigs({ form_code: formCode, page_size: 1000 }),
      ]);
      setGlobalFields(fieldsRes.results);
      setConfigs(configsRes.results);
    } catch (err) {
      setError(getCoreApiErrorMessage(err, "Failed to load fields and configurations."));
    } finally {
      setLoading(false);
    }
  }, [formCode]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateConfig = async (row: CombinedRow, updates: Partial<FormFieldConfig>) => {
    setSavingId(row.globalField.id);
    try {
      if (row.config) {
        // Update existing mapping
        await coreOnboardingService.updateFormFieldConfig(row.config.id, updates);
        setToastMsg("Updated field configuration.");
      } else {
        // Create new mapping
        await coreOnboardingService.createFormFieldConfig({
          form: formCode,
          common_field: row.globalField.id,
          section_name: "General",
          is_visible: updates.is_visible ?? true,
          is_required: updates.is_required ?? false,
          display_order: updates.display_order ?? (configs.length * 10),
        });
        setToastMsg("Mapped field successfully.");
      }
      // Silently reload data to get new IDs
      const configsRes = await coreOnboardingService.listFormFieldConfigs({ form_code: formCode, page_size: 1000 });
      setConfigs(configsRes.results);
    } catch (err) {
      setToastMsg(getCoreApiErrorMessage(err, "Failed to save configuration."));
    } finally {
      setSavingId(null);
    }
  };

  // Build and sort rows initially by display_order ascending, then alphabetically
  const [orderedRows, setOrderedRows] = useState<CombinedRow[]>([]);

  useEffect(() => {
    const combined: CombinedRow[] = globalFields
      .map((gf) => ({
        globalField: gf,
        config: configs.find((c) => c.common_field === gf.id) || null,
      }))
      .sort((a, b) => {
        const orderA = a.config?.display_order !== undefined ? a.config.display_order : 9999;
        const orderB = b.config?.display_order !== undefined ? b.config.display_order : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return a.globalField.label.localeCompare(b.globalField.label);
      });
    setOrderedRows(combined);
  }, [globalFields, configs]);

  const handleRowReorder = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;

    const actualSource = page * rowsPerPage + sourceIndex;
    const actualDest = page * rowsPerPage + destinationIndex;

    const nextRows = [...orderedRows];
    const [movedItem] = nextRows.splice(actualSource, 1);
    nextRows.splice(actualDest, 0, movedItem);

    // Re-sequence display orders in steps of 10 (10, 20, 30, 40...)
    const itemsToPersist: Array<{ row: CombinedRow; newOrder: number }> = [];
    const resequencedRows = nextRows.map((item, idx) => {
      const newOrder = (idx + 1) * 10;
      if (item.config?.display_order !== newOrder) {
        itemsToPersist.push({ row: item, newOrder });
      }
      return {
        ...item,
        config: item.config ? { ...item.config, display_order: newOrder } : null,
      };
    });

    // Instant local UI update
    setOrderedRows(resequencedRows);

    // Save changes to backend
    if (itemsToPersist.length > 0) {
      try {
        await Promise.all(
          itemsToPersist.map(async ({ row, newOrder }) => {
            if (row.config) {
              return coreOnboardingService.updateFormFieldConfig(row.config.id, {
                display_order: newOrder,
              });
            } else {
              return coreOnboardingService.createFormFieldConfig({
                form: formCode,
                common_field: row.globalField.id,
                section_name: "General",
                is_visible: true,
                is_required: false,
                display_order: newOrder,
              });
            }
          })
        );
        setToastMsg("Field display order updated successfully via drag-and-drop.");
        const configsRes = await coreOnboardingService.listFormFieldConfigs({
          form_code: formCode,
          page_size: 1000,
        });
        setConfigs(configsRes.results);
      } catch (err) {
        setToastMsg(getCoreApiErrorMessage(err, "Failed to persist reordered fields."));
      }
    }
  };

  const filteredRows = orderedRows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.globalField.label.toLowerCase().includes(q) ||
      r.globalField.field_key.toLowerCase().includes(q) ||
      r.globalField.field_type.toLowerCase().includes(q)
    );
  });

  const columns: AdminTableColumn<CombinedRow>[] = [
    { key: "label", label: "Field", render: (r) => <strong>{r.globalField.label}</strong> },
    { key: "key", label: "Key", render: (r) => r.globalField.field_key },
    { key: "type", label: "Type", render: (r) => <Chip size="small" label={r.globalField.field_type} /> },
    { key: "active", label: "Global Status", render: (r) => <ActiveStatusChip active={r.globalField.is_active} /> },
    {
      key: "visible",
      label: "Visible (This Flow)",
      render: (r) => (
        <Switch
          size="small"
          checked={r.config ? r.config.is_visible : r.globalField.is_active}
          disabled={savingId === r.globalField.id}
          onChange={(e) => handleUpdateConfig(r, { is_visible: e.target.checked })}
        />
      ),
    },
    {
      key: "required",
      label: "Required",
      render: (r) => (
        <Switch
          size="small"
          checked={r.config?.is_required || false}
          disabled={savingId === r.globalField.id || !(r.config ? r.config.is_visible : r.globalField.is_active)}
          onChange={(e) => handleUpdateConfig(r, { is_required: e.target.checked })}
        />
      ),
    },
    {
      key: "order",
      label: "Order",
      minWidth: 160,
      render: (r) => (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Chip
            size="small"
            label={`#${r.config?.display_order ?? 0}`}
            sx={{
              fontWeight: 800,
              fontSize: "0.75rem",
              bgcolor: "#0f2942",
              color: "#ffffff",
              minWidth: 46,
              height: 24,
            }}
          />
          <OrderInputCell
            displayOrder={r.config?.display_order}
            disabled={savingId === r.globalField.id || !(r.config ? r.config.is_visible : r.globalField.is_active)}
            onSave={(newOrder) => handleUpdateConfig(r, { display_order: newOrder })}
          />
        </Stack>
      ),
    },
  ];

  return (
    <AdminPageShell title={title} subtitle={subtitle} actions={actions}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          mb: 2,
          p: 1.25,
          bgcolor: "rgba(15, 41, 66, 0.04)",
          borderRadius: 2,
          border: "1px dashed #cbd5e1",
        }}
      >
        <DragIndicatorIcon sx={{ color: "#0f2942", fontSize: 20 }} />
        <Typography variant="body2" sx={{ color: "#0f2942", fontSize: "0.825rem", fontWeight: 600 }}>
          Drag & Drop Enabled:
          <span style={{ fontWeight: 400, color: "#475569", marginLeft: 4 }}>
            Click and drag any row using the <strong>⠿ handle</strong> to reorder fields. The sequence (10, 20, 30...) updates and saves to the database automatically.
          </span>
        </Typography>
      </Stack>

      <AdminDataTable
        columns={columns}
        rows={filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        error={error}
        isDraggable={!search.trim()}
        onRowReorder={handleRowReorder}
        searchValue={search}
        searchPlaceholder="Search common fields by label, key, type..."
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        getRowKey={(r) => r.globalField.id}
        emptyMessage="No common fields found. Please create them in the global Common Form Fields tab."
        pagination={{
          page,
          totalCount: filteredRows.length,
          rowsPerPage,
          rowsPerPageOptions: [10, 25, 50],
          onPageChange: (p) => setPage(p),
          onRowsPerPageChange: (s) => {
            setRowsPerPage(s);
            setPage(0);
          },
        }}
      />

      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg("")} message={toastMsg} />
    </AdminPageShell>
  );
}

