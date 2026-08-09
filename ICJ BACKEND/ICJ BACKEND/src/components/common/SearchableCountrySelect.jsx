import { useMemo } from "react";
import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import ITU_GLOBAL_COUNTRY_MASTERS, {
  getCountryByCodeOrIso,
} from "../../data/internationalPhoneMaster";

/**
 * ICJ ENTERPRISE PLATFORM — SEARCHABLE INTERNATIONAL COUNTRY AUTOCOMPLETE
 * Supports two modes:
 *   compact=true  → Phone calling-code picker (shows flag + code only in input)
 *   compact=false → Full country picker (shows flag + full country name in input)
 */
export default function SearchableCountrySelect({
  value = "+91",
  onChange,
  label = "Country",
  disabled = false,
  compact = false,
}) {
  const selectedCountry = useMemo(() => {
    return getCountryByCodeOrIso(value);
  }, [value]);

  return (
    <Autocomplete
      options={ITU_GLOBAL_COUNTRY_MASTERS}
      disabled={disabled}
      getOptionLabel={(option) => {
        if (typeof option === "string") return option;
        // compact=true → closed input shows ONLY the ISD code, e.g. "+91"
        // compact=false → closed input shows flag + country name, e.g. "🇮🇳 India"
        if (compact) return option.code;
        return `${option.flag} ${option.country}`;
      }}
      value={selectedCountry}
      onChange={(event, newValue) => {
        if (newValue && typeof newValue === "object") {
          onChange(newValue);
        }
      }}
      isOptionEqualToValue={(option, val) =>
        option.code === (val?.code || val) || option.iso === (val?.iso || val)
      }
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            component="li"
            key={key || `${option.iso}-${option.code}`}
            {...optionProps}
            sx={{ fontSize: "14px", display: "flex", gap: 1 }}
          >
            <span>{option.flag}</span>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {option.country}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
              {option.code}
            </Typography>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={compact ? "Code..." : "Search country..."}
          inputProps={{
            ...params.inputProps,
            autoComplete: "new-password",
          }}
        />
      )}
    />
  );
}
