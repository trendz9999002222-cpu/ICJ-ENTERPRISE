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
import { getCountryCallingCode, isValidPhoneNumber, validatePhoneNumberLength } from "libphonenumber-js/max";
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
  // Dynamically find country and state fields in case field keys aren't exact matches
  const countryKey = Object.keys(values).find(k => k.toLowerCase().includes("country")) || "country";
  const stateKey = Object.keys(values).find(k => k.toLowerCase().includes("state")) || "state";
  
  const selectedCountryName = values[countryKey] || "India";
  const selectedStateName = values[stateKey] || "";
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
    case "city":
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
      if (displayValue) {
        if (countryCode === "IN") {
          if (!/^[6-9]/.test(displayValue)) {
            phoneError = "Mobile number must start with 6, 7, 8, or 9";
          } else if (displayValue.length !== 10) {
            phoneError = "Mobile number must be exactly 10 digits";
          }
        }
        if (!phoneError) {
          try {
            if (!isValidPhoneNumber(displayValue, countryCode)) {
              phoneError = `Enter a valid mobile number for ${selectedCountryName}`;
            }
          } catch(e) {
            phoneError = `Enter a valid mobile number for ${selectedCountryName}`;
          }
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
            let digits = e.target.value;
            if (digits.startsWith(callingCode)) digits = digits.slice(callingCode.length);
            digits = digits.replace(/\D/g, "");

            if (countryCode === "IN") {
              if (digits.length > 10) {
                digits = digits.slice(0, 10);
              }
            } else {
              if (digits.length > 0) {
                let validDigits = digits;
                while (
                  validDigits.length > 0 &&
                  validatePhoneNumberLength(validDigits, countryCode) === "TOO_LONG"
                ) {
                  validDigits = validDigits.slice(0, -1);
                }
                digits = validDigits;
              }
            }
            
            onChange(digits ? `${callingCode}${digits}` : "");
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
    default: {
      const isPincode = (field.label || field.field_key || "").toLowerCase().includes("pincode");
      const isNumber = field.field_type === "number";
      
      let inputType = "text";
      if (isNumber && !isPincode) inputType = "number";
      else if (field.field_type === "email") inputType = "email";

      return (
        <TextField
          fullWidth
          size="small"
          type={inputType}
          label={labelWithFlag}
          placeholder={field.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => {
            let val = e.target.value;
            if (isPincode) {
              val = val.replace(/\D/g, "");
              if (val.length > 6) val = val.slice(0, 6);
            }
            onChange(val);
          }}
          error={!!error}
          helperText={error ?? field.help_text}
          disabled={disabled}
        />
      );
    }
  }
}
