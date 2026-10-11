"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { FIELD_TYPE_OPTIONS, OPTION_FIELD_TYPES, fieldKeyFromName } from "./constants";
import type { FieldType } from "@/types/admin/professionalOnboarding";

export type FieldOptionDraft = {
  id?: string;
  value: string;
  label: string;
  display_order?: number;
  is_active?: boolean;
};

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
  options?: FieldOptionDraft[];
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
  options: [],
};

type Props = {
  form: FieldFormState;
  onChange: (next: FieldFormState) => void;
};

export default function FieldFormFields({ form, onChange }: Props) {
  const [newOptionValue, setNewOptionValue] = useState("");
  const [newOptionLabel, setNewOptionLabel] = useState("");

  const isOptionType = OPTION_FIELD_TYPES.includes(form.field_type);
  const optionsList = form.options || [];

  const handleAddOption = () => {
    const val = newOptionValue.trim();
    const lbl = (newOptionLabel || newOptionValue).trim();
    if (!val) return;

    if (optionsList.some((o) => o.value === val)) {
      return;
    }

    const nextOptions: FieldOptionDraft[] = [
      ...optionsList,
      {
        value: val,
        label: lbl,
        display_order: optionsList.length * 10,
        is_active: true,
      },
    ];

    onChange({ ...form, options: nextOptions });
    setNewOptionValue("");
    setNewOptionLabel("");
  };

  const handleRemoveOption = (indexToRemove: number) => {
    const nextOptions = optionsList.filter((_, idx) => idx !== indexToRemove);
    onChange({ ...form, options: nextOptions });
  };

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
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
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      {isOptionType && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: "#f8fafc",
            borderColor: "#cbd5e1",
            borderRadius: 2,
          }}
        >
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b" }}>
                {form.field_type === "radio"
                  ? "Radio Options (Single choice)"
                  : form.field_type === "checkbox"
                  ? "Checkbox Options (Multiple choices)"
                  : "Dropdown Options"}
              </Typography>
              <Chip
                size="small"
                label={`${optionsList.length} options`}
                color={optionsList.length > 0 ? "primary" : "default"}
                variant="outlined"
              />
            </Box>

            {optionsList.length > 0 ? (
              <Stack spacing={1} sx={{ my: 1 }}>
                {optionsList.map((opt, idx) => (
                  <Box
                    key={`${opt.value}-${idx}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 1.5,
                      py: 0.75,
                      bgcolor: "#ffffff",
                      borderRadius: 1.5,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {opt.label}
                      </Typography>
                      {opt.value !== opt.label && (
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          ({opt.value})
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveOption(idx)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>

                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="caption" sx={{ color: "#64748b", fontStyle: "italic" }}>
                No options added yet. Enter an option below and click Add Option.
              </Typography>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                size="small"
                label="Option Label"
                placeholder="e.g. Yes / Civil Law"
                fullWidth
                value={newOptionLabel}
                onChange={(e) => {
                  setNewOptionLabel(e.target.value);
                  if (!newOptionValue) {
                    setNewOptionValue(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
              />
              <TextField
                size="small"
                label="Value / Key"
                placeholder="e.g. yes / civil_law"
                fullWidth
                value={newOptionValue}
                onChange={(e) => setNewOptionValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddOption}
                disabled={!newOptionValue.trim() && !newOptionLabel.trim()}
                sx={{ flexShrink: 0, textTransform: "none", fontWeight: 600 }}
              >
                Add Option
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

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
