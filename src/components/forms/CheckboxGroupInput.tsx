"use client";

import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
} from "@mui/material";

interface Option {
  value: string;
  label: string;
}

interface Props {
  name: string;
  label: string;
  id?: string;
  value: string[];
  options: Option[];
  onChange: (value: string[]) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export default function CheckboxGroupInput({
  name,
  label,
  value,
  options,
  onChange,
  required,
  error,
  disabled,
}: Props) {
  const selected = value || [];

  const toggle = (optionValue: string) => {
    if (disabled) return;
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else {
      onChange([...selected, optionValue]);
    }
  };

  return (
    <FormControl
      id={`checkbox-group-${name}`}
      component="fieldset"
      error={Boolean(error)}
      disabled={disabled}
      sx={{ width: "100%" }}
    >
      <FormLabel sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.92rem", mb: 0.5 }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </FormLabel>
      <FormGroup>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 0.5,
          }}
        >
          {options.map((opt) => (
            <FormControlLabel
              key={opt.value}
              control={
                <Checkbox
                  checked={selected.includes(opt.value)}
                  onChange={() => toggle(opt.value)}
                  size="small"
                />
              }
              label={<span style={{ fontSize: "0.88rem" }}>{opt.label}</span>}
            />
          ))}
        </Box>
      </FormGroup>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
