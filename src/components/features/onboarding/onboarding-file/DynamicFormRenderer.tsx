"use client";

import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";

import { buildYearOptions, getOptions } from "@/lib/registrationClient";
import { isFieldVisible } from "@/lib/validation";
import type { FormField, FormSchema, Theme } from "@/types/registration";

import { RADIUS, resolveIcon } from "./iconMap";

type Props = {
  schema: FormSchema;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  theme: Theme;
  onChange: (name: string, value: unknown) => void;
};

function labelWithFlag(field: FormField) {
  if (field.required) return `${field.label} *`;
  if (field.optionalTag) return `${field.label} (Optional)`;
  return field.label;
}

function resolveOptionEntries(field: FormField): { value: string; label: string }[] {
  if (field.optionItems?.length) return field.optionItems;
  const opts = getOptions(field.optionsRef, field.options);
  return opts.map((o) => ({ value: o, label: o }));
}

export default function DynamicFormRenderer({ schema, values, errors, theme, onChange }: Props) {
  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm, bgcolor: "#fff" },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.color },
    "& label.Mui-focused": { color: theme.color },
  } as const;

  const renderField = (field: FormField) => {
    if (!isFieldVisible(field.visibleWhen, values)) return null;

    const error = errors[field.name];
    const value = values[field.name];

    const wrap = (node: React.ReactNode) => (
      <Box
        key={field.name}
        data-field={field.name}
        sx={{ gridColumn: { xs: "span 12", md: `span ${field.col ?? 3}` } }}
      >
        {node}
      </Box>
    );

    switch (field.type) {
      case "select":
      case "year": {
        const options =
          field.type === "year"
            ? buildYearOptions(field.yearFrom ?? 1960).map((y) => ({ value: y, label: y }))
            : resolveOptionEntries(field);

        return wrap(
          <TextField
            select
            fullWidth
            size="small"
            label={labelWithFlag(field)}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            error={!!error}
            helperText={error ?? field.helper}
            sx={inputSx}
          >
            <MenuItem value="">
              <em>Select</em>
            </MenuItem>
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        );
      }

      case "radio": {
        const options = resolveOptionEntries(field);
        return wrap(
          <FormControl error={!!error} component="fieldset" fullWidth>
            <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>
              {labelWithFlag(field)}
            </FormLabel>
            <RadioGroup
              row
              value={(value as string) ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            >
              {options.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio size="small" sx={{ "&.Mui-checked": { color: theme.color } }} />}
                  label={<Typography sx={{ fontSize: "0.85rem" }}>{opt.label}</Typography>}
                />
              ))}
            </RadioGroup>
            {(error || field.helper) && <FormHelperText>{error ?? field.helper}</FormHelperText>}
          </FormControl>
        );
      }

      case "checkboxGroup": {
        const options = resolveOptionEntries(field);
        const selected = Array.isArray(value) ? (value as string[]) : [];
        const toggle = (opt: string) => {
          const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt];
          onChange(field.name, next);
        };

        return wrap(
          <FormControl error={!!error} component="fieldset" fullWidth>
            <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>
              {labelWithFlag(field)}{" "}
              {field.helper && (
                <Typography component="span" sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  ({field.helper})
                </Typography>
              )}
            </FormLabel>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: `repeat(${field.columns ?? 2}, minmax(0, 1fr))`,
                },
                columnGap: 1,
              }}
            >
              {options.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  control={
                    <Checkbox
                      size="small"
                      checked={selected.includes(opt.value)}
                      onChange={() => toggle(opt.value)}
                      sx={{ "&.Mui-checked": { color: theme.color } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: "0.83rem" }}>{opt.label}</Typography>}
                />
              ))}
            </Box>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );
      }

      case "checkbox":
        return wrap(
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={Boolean(value)}
                onChange={(e) => onChange(field.name, e.target.checked)}
                sx={{ "&.Mui-checked": { color: theme.color } }}
              />
            }
            label={<Typography sx={{ fontSize: "0.85rem" }}>{labelWithFlag(field)}</Typography>}
          />
        );

      case "textarea":
        return wrap(
          <TextField
            fullWidth
            multiline
            rows={field.rows ?? 3}
            label={labelWithFlag(field)}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            error={!!error}
            helperText={error ?? field.helper}
            sx={inputSx}
          />
        );

      case "date":
        return wrap(
          <TextField
            fullWidth
            size="small"
            type="date"
            label={labelWithFlag(field)}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            error={!!error}
            helperText={error ?? field.helper}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={inputSx}
          />
        );

      default:
        return wrap(
          <TextField
            fullWidth
            size="small"
            type={field.type === "number" ? "number" : field.type === "tel" ? "tel" : "text"}
            label={labelWithFlag(field)}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => {
              let val = e.target.value;
              if (field.type === "tel") {
                val = val.replace(/\D/g, "");
                if (val.length > 10) return;
              }
              onChange(field.name, val);
            }}
            error={!!error}
            helperText={error ?? field.helper}
            slotProps={{
              htmlInput: field.type === "tel" ? { maxLength: 10 } : undefined,
              input: field.prefix
                ? { startAdornment: <InputAdornment position="start">{field.prefix}</InputAdornment> }
                : undefined
            }}
            sx={inputSx}
          />
        );
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {schema.sections.map((section) => {
        const SectionIcon = resolveIcon(section.icon);
        return (
          <Box
            key={section.id}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: RADIUS.md,
              overflow: "hidden",
              bgcolor: "#fff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 2,
                py: 1.25,
                bgcolor: theme.bg,
                borderBottom: `1px solid ${theme.border}`,
              }}
            >
              <SectionIcon sx={{ color: theme.color, fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                {section.title}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                display: "grid",
                gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                columnGap: 2,
                rowGap: 2.5,
              }}
            >
              {section.fields.map(renderField)}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
