import {
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  FormHelperText,
  Button,
} from "@mui/material";

// Using any to avoid circular dependency since the type can be HonorableFormField or HonoraryFormField
type Props = {
  field: any;
  value: unknown;
  error?: string;
  disabled?: boolean;
  onChange: (value: unknown) => void;
};

export default function ConfiguredFormField({ field, value, error, disabled, onChange }: Props) {
  const labelWithFlag = field.required ? `${field.label} *` : field.label;

  switch (field.field_type) {
    case "select":
      return (
        <TextField
          select
          fullWidth
          size="small"
          label={labelWithFlag}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error ?? field.help_text}
          disabled={disabled}
        >
          <MenuItem value="">
            <em>Select</em>
          </MenuItem>
          {field.options?.map((opt: any) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    case "radio":
      return (
        <FormControl error={!!error} disabled={disabled} fullWidth>
          <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>
            {labelWithFlag}
          </FormLabel>
          <RadioGroup
            row
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options?.map((opt: any) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio size="small" />}
                label={<Typography sx={{ fontSize: "0.85rem" }}>{opt.label}</Typography>}
              />
            ))}
          </RadioGroup>
          {(error || field.help_text) && <FormHelperText>{error ?? field.help_text}</FormHelperText>}
        </FormControl>
      );
    case "textarea":
      return (
        <TextField
          fullWidth
          multiline
          minRows={3}
          label={labelWithFlag}
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error ?? field.help_text}
          disabled={disabled}
        />
      );
    case "date":
      return (
        <TextField
          fullWidth
          size="small"
          type="date"
          label={labelWithFlag}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error ?? field.help_text}
          disabled={disabled}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      );
    case "file":
      const isString = typeof value === "string";
      const fileVal = !isString ? (value as File | null) : null;
      const fileName = fileVal?.name || (isString && value ? "Existing file (click to replace)" : "Choose file...");
      
      return (
        <FormControl error={!!error} disabled={disabled} fullWidth>
          <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>
            {labelWithFlag}
          </FormLabel>
          <Button variant="outlined" component="label" size="small" sx={{ alignSelf: "flex-start", textTransform: "none" }}>
            {fileName}
            <input
              type="file"
              hidden
              disabled={disabled}
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
          </Button>
          {(error || field.help_text) && <FormHelperText>{error ?? field.help_text}</FormHelperText>}
        </FormControl>
      );
    default:
      let inputType = "text";
      if (field.field_type === "number") inputType = "number";
      else if (field.field_type === "email") inputType = "email";
      else if (field.field_type === "phone") inputType = "tel";

      return (
        <TextField
          fullWidth
          size="small"
          type={inputType}
          label={labelWithFlag}
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error ?? field.help_text}
          disabled={disabled}
        />
      );
  }
}
