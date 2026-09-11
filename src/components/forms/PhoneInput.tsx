"use client";

import { InputAdornment, TextField } from "@mui/material";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
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

export default function PhoneInput({
  label,
  name,
  value,
  onChange,
  placeholder = "9876543210",
  required,
  error,
  disabled,
}: Props) {
  const handleChange = (inputVal: string) => {
    // Only allow numbers and max 10 digits
    const cleaned = inputVal.replace(/\D/g, "").slice(0, 10);
    onChange(cleaned);
  };

  return (
    <TextField
      fullWidth
      id={`phone-${name}`}
      name={name}
      label={label}
      value={value || ""}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      error={Boolean(error)}
      helperText={error}
      disabled={disabled}
      type="tel"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start" sx={{ color: "#64748b", fontWeight: 700 }}>
              <PhoneIphoneIcon sx={{ fontSize: 18, mr: 0.5, color: "#64748b" }} />
              +91
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
