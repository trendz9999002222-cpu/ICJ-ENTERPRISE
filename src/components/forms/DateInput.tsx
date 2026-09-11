"use client";

import { TextField } from "@mui/material";
import { RADIUS } from "@/theme/designTokens";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export default function DateInput({
  label,
  name,
  value,
  onChange,
  required,
  error,
  disabled,
}: Props) {
  return (
    <TextField
      fullWidth
      id={`date-${name}`}
      name={name}
      label={label}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      error={Boolean(error)}
      helperText={error}
      disabled={disabled}
      type="date"
      slotProps={{
        inputLabel: {
          shrink: true,
        },
      }}
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
        "& .MuiFormHelperText-root": {
          fontWeight: 600,
          fontSize: "0.78rem",
          mt: 0.75,
        },
      }}
    />
  );
}
