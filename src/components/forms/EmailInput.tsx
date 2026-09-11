"use client";

import { InputAdornment, TextField } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { RADIUS } from "@/theme/designTokens";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export default function EmailInput({
  label,
  name,
  value,
  onChange,
  placeholder = "name@example.com",
  required,
  error,
  disabled,
}: Props) {
  return (
    <TextField
      fullWidth
      id={`email-${name}`}
      name={name}
      label={label}
      value={value || ""}
      onChange={(e) => onChange(e.target.value.toLowerCase().trim())}
      placeholder={placeholder}
      required={required}
      error={Boolean(error)}
      helperText={error}
      disabled={disabled}
      type="email"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <EmailOutlinedIcon sx={{ fontSize: 19, color: "#64748b" }} />
            </InputAdornment>
          ),
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
