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
  InputAdornment,
} from "@mui/material";
import { useLocationData } from "@/hooks/useLocationData";
import { getCountryCallingCode, isValidPhoneNumber } from "libphonenumber-js/max";
// Using any to avoid circular dependency since the type can be HonorableFormField or HonoraryFormField
type Props = {
  field: any;
  value: unknown;
  error?: string;
  disabled?: boolean;
  values?: Record<string, any>;
  onChange: (value: unknown) => void;
};

export default function ConfiguredFormField({ field, value, error, disabled, values = {}, onChange }: Props) {
  const selectedCountryName = values.country || "India";
  const selectedStateName = values.state || "";
  const { countries, states, districts, loading, levels } = useLocationData(selectedCountryName, selectedStateName);

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
    case "country": {
      return (
        <TextField
          select
          fullWidth
          size="small"
          label={labelWithFlag}
          value={(value as string) ?? ""}
          onChange={(e) => {
            onChange(e.target.value);
            // Parent should ideally handle clearing but we only have onChange for this field
          }}
          error={!!error}
          helperText={error ?? field.help_text}
          disabled={disabled || loading}
        >
          <MenuItem value="">
            <em>Select Country</em>
          </MenuItem>
          {countries.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }
    case "state": {
      return (
        <TextField
          select
          fullWidth
          size="small"
          label={labelWithFlag === "State *" ? `${levels.l1} *` : labelWithFlag === "State" ? levels.l1 : labelWithFlag}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error ?? field.help_text}
          disabled={disabled || loading || !states.length}
        >
          <MenuItem value="">
            <em>{`Select ${levels.l1}`}</em>
          </MenuItem>
          {states.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }
    case "district": {
      return (
        <TextField
          select
          fullWidth
          size="small"
          label={labelWithFlag === "District *" ? `${levels.l2} *` : labelWithFlag === "District" ? levels.l2 : labelWithFlag}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          error={!!error}
          helperText={error ?? field.help_text}
          disabled={disabled || loading || !districts.length}
        >
          <MenuItem value="">
            <em>{`Select ${levels.l2}`}</em>
          </MenuItem>
          {districts.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }
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
    case "phone": {
      const countryCode = (countries.find(c => c.value === selectedCountryName)?.code?.toUpperCase() || "IN") as any;
      let callingCode = "";
      try {
        callingCode = `+${getCountryCallingCode(countryCode)}`;
      } catch(e) {}

      const rawValue = (value as string) || "";
      const displayValue = rawValue.startsWith(callingCode) ? rawValue.slice(callingCode.length) : rawValue;

      let phoneError = error;
      if (rawValue) {
         try {
           if (!isValidPhoneNumber(rawValue, countryCode)) {
              phoneError = `Enter a valid mobile number for ${selectedCountryName}`;
           }
         } catch(e) {
           phoneError = `Enter a valid mobile number for ${selectedCountryName}`;
         }
      }

      return (
        <TextField
          fullWidth
          size="small"
          type="tel"
          label={labelWithFlag}
          placeholder={field.placeholder}
          value={displayValue}
          onChange={(e) => {
            let val = e.target.value;
            if (val.startsWith(callingCode)) val = val.slice(callingCode.length);
            val = val.replace(/\D/g, "");
            onChange(val ? `${callingCode}${val}` : "");
          }}
          error={!!phoneError}
          helperText={phoneError ?? field.help_text}
          disabled={disabled}
          slotProps={{
            input: callingCode ? { startAdornment: <InputAdornment position="start">{callingCode}</InputAdornment> } : undefined
          }}
        />
      );
    }
    default:
      let inputType = "text";
      if (field.field_type === "number") inputType = "number";
      else if (field.field_type === "email") inputType = "email";

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
