import { useMemo } from "react";
import { Autocomplete, TextField, Box, Typography } from "@mui/material";
import ITU_GLOBAL_COUNTRY_MASTERS, {
  getCountryByCodeOrIso,
} from "../../data/internationalPhoneMaster";

/**
 * ICJ ENTERPRISE PLATFORM — SEARCHABLE INTERNATIONAL COUNTRY AUTOCOMPLETE
 * Searchable country selector supporting all ITU-T E.164 assigned codes & territories.
 */
export default function SearchableCountrySelect({
  value = "+91",
  onChange,
  label = "Country",
  disabled = false,
}) {
  const selectedCountry = useMemo(() => {
    return getCountryByCodeOrIso(value);
  }, [value]);

  return (
    <Autocomplete
      options={ITU_GLOBAL_COUNTRY_MASTERS}
      disabled={disabled}
      getOptionLabel={(option) =>
        typeof option === "string"
          ? option
          : `${option.flag} ${option.country} (${option.code})`
      }
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
          placeholder="Search country..."
          inputProps={{
            ...params.inputProps,
            autoComplete: "new-password", // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
}
