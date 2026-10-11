"use client";

import {
  Chip,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
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

export default function MappedCommonFieldsPage({ formCode, title, subtitle, actions }: Props) {
  const [globalFields, setGlobalFields] = useState<CommonField[]>([]);
  const [configs, setConfigs] = useState<FormFieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [toastMsg, setToastMsg] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

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

  // Build rows combining global fields with their config
  const rows: CombinedRow[] = globalFields.map(gf => ({
    globalField: gf,
    config: configs.find(c => c.common_field === gf.id) || null
  }));

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
      render: (r) => (
        <TextField
          size="small"
          type="number"
          sx={{ width: 80 }}
          value={r.config?.display_order ?? ""}
          placeholder="N/A"
          disabled={savingId === r.globalField.id || !r.config?.is_visible}
          onBlur={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && r.config && val !== r.config.display_order) {
              handleUpdateConfig(r, { display_order: val });
            }
          }}
        />
      ),
    },
  ];

  return (
    <AdminPageShell title={title} subtitle={subtitle} actions={actions}>
      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        Toggle <strong>Visible</strong> to map a master field to this onboarding flow.
        You can also configure if it is required and set its display order.
      </Typography>

      <AdminDataTable
        columns={columns}
        rows={rows}
        loading={loading}
        error={error}
        getRowKey={(r) => r.globalField.id}
        emptyMessage="No common fields found. Please create them in the global Common Form Fields tab."
      />

      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg("")} message={toastMsg} />
    </AdminPageShell>
  );
}

