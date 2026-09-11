"use client";

import { Grid } from "@mui/material";
import type { FormFieldConfig } from "@/types/onboarding-form";
import TextInput from "./TextInput";
import SelectInput from "./SelectInput";
import PhoneInput from "./PhoneInput";
import EmailInput from "./EmailInput";
import DateInput from "./DateInput";
import Textarea from "./Textarea";
import FileUpload from "./FileUpload";

interface Props {
  config: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export default function FormField({ config, value, onChange, error, disabled }: Props) {
  const {
    name,
    label,
    placeholder,
    type,
    required,
    options,
    gridSize = { xs: 12, md: 6 },
    helperText,
    acceptTypes,
    maxSizeMb,
  } = config;

  let inputComponent: React.ReactNode = null;

  switch (type) {
    case "text":
      inputComponent = (
        <TextInput
          name={name}
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          error={error}
          disabled={disabled}
        />
      );
      break;

    case "select":
      inputComponent = (
        <SelectInput
          name={name}
          label={label}
          value={value}
          onChange={onChange}
          options={options || []}
          required={required}
          error={error}
          disabled={disabled}
        />
      );
      break;

    case "phone":
      inputComponent = (
        <PhoneInput
          name={name}
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          error={error}
          disabled={disabled}
        />
      );
      break;

    case "email":
      inputComponent = (
        <EmailInput
          name={name}
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          error={error}
          disabled={disabled}
        />
      );
      break;

    case "date":
      inputComponent = (
        <DateInput
          name={name}
          label={label}
          value={value}
          onChange={onChange}
          required={required}
          error={error}
          disabled={disabled}
        />
      );
      break;

    case "textarea":
      inputComponent = (
        <Textarea
          name={name}
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          error={error}
          disabled={disabled}
          rows={3}
        />
      );
      break;

    case "file":
      inputComponent = (
        <FileUpload
          name={name}
          label={label}
          value={value}
          onChange={onChange}
          required={required}
          error={error}
          helperText={helperText}
          acceptTypes={acceptTypes}
          maxSizeMb={maxSizeMb}
          disabled={disabled}
        />
      );
      break;

    default:
      inputComponent = (
        <TextInput
          name={name}
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          error={error}
          disabled={disabled}
        />
      );
  }

  return (
    <Grid size={gridSize} sx={{ display: "flex", flexDirection: "column" }}>
      {inputComponent}
    </Grid>
  );
}
