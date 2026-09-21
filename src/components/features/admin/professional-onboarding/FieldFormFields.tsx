"use client";

import { FormControlLabel, MenuItem, Stack, Switch, TextField } from "@mui/material";

import { FIELD_TYPE_OPTIONS, fieldKeyFromName } from "./constants";
import type { FieldType } from "@/types/admin/professionalOnboarding";

export type FieldFormState = {
  name: string;
  field_key: string;
  field_type: FieldType;
  label: string;
  placeholder: string;
  help_text: string;
  description: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
};

export const emptyFieldForm: FieldFormState = {
  name: "",
  field_key: "",
  field_type: "text",
  label: "",
  placeholder: "",
  help_text: "",
  description: "",
  is_required: false,
  is_active: true,
  display_order: 0,
};

type Props = {
  form: FieldFormState;
  onChange: (next: FieldFormState) => void;
};

export default function FieldFormFields({ form, onChange }: Props) {
  return (
    <Stack spacing={2}>
      <TextField
        label="Admin name"
        required
        fullWidth
        value={form.name}
        onChange={(e) => {
          const name = e.target.value;
          onChange({
            ...form,
            name,
            field_key: form.field_key || fieldKeyFromName(name),
            label: form.label || name,
          });
        }}
      />
      <TextField
        label="Field key"
        required
        fullWidth
        value={form.field_key}
        onChange={(e) => onChange({ ...form, field_key: e.target.value })}
        helperText="Lowercase letters, digits, underscores; must start with a letter."
      />
      <TextField
        select
        label="Field type"
        required
        fullWidth
        value={form.field_type}
        onChange={(e) =>
          onChange({ ...form, field_type: e.target.value as FieldType })
        }
      >
        {FIELD_TYPE_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </TextField>
      <TextField
        label="Form label"
        required
        fullWidth
        value={form.label}
        onChange={(e) => onChange({ ...form, label: e.target.value })}
      />
      <TextField
        label="Placeholder"
        fullWidth
        value={form.placeholder}
        onChange={(e) => onChange({ ...form, placeholder: e.target.value })}
      />
      <TextField
        label="Help text"
        fullWidth
        value={form.help_text}
        onChange={(e) => onChange({ ...form, help_text: e.target.value })}
      />
      <TextField
        label="Description"
        fullWidth
        multiline
        minRows={2}
        value={form.description}
        onChange={(e) => onChange({ ...form, description: e.target.value })}
      />
      <TextField
        label="Display order"
        type="number"
        fullWidth
        value={form.display_order}
        onChange={(e) =>
          onChange({ ...form, display_order: Number(e.target.value) || 0 })
        }
      />
      <FormControlLabel
        control={
          <Switch
            checked={form.is_required}
            onChange={(e) => onChange({ ...form, is_required: e.target.checked })}
          />
        }
        label="Required"
      />
      <FormControlLabel
        control={
          <Switch
            checked={form.is_active}
            onChange={(e) => onChange({ ...form, is_active: e.target.checked })}
          />
        }
        label="Active"
      />
    </Stack>
  );
}
