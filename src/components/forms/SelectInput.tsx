"use client";

import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";
import type { FieldOption } from "@/types/onboarding-form";
import { RADIUS } from "@/theme/designTokens";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: FieldOption[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export default function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  required,
  error,
  disabled,
}: Props) {
  const labelId = `select-label-${name}`;

  return (
    <FormControl
      fullWidth
      required={required}
      error={Boolean(error)}
      disabled={disabled}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: RADIUS.sm,
          bgcolor: "#fff",
          "&:hover fieldset": {
            borderColor: "#94a3b8",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#2563eb",
            borderWidth: 2,
          },
        },
        "& .MuiInputLabel-root": {
          color: "#475569",
          fontWeight: 600,
          fontSize: "0.92rem",
          "&.Mui-focused": {
            color: "#2563eb",
            fontWeight: 700,
          },
        },
      }}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={`select-${name}`}
        name={name}
        label={label}
        value={value || ""}
        onChange={(e) => onChange(e.target.value as string)}
        MenuProps={{
          disableScrollLock: true,
          slotProps: {
            paper: {
              sx: {
                maxHeight: 320,
                borderRadius: RADIUS.sm,
                boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.15)",
                "& .MuiMenuItem-root": {
                  fontSize: "0.9rem",
                  py: 1.25,
                  fontWeight: 500,
                  "&.Mui-selected": {
                    bgcolor: "#eff6ff",
                    fontWeight: 700,
                    color: "#1d4ed8",
                  },
                },
              },
            },
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {error && (
        <FormHelperText sx={{ fontWeight: 600, fontSize: "0.78rem", mt: 0.75 }}>
          {error}
        </FormHelperText>
      )}
    </FormControl>
  );
}
