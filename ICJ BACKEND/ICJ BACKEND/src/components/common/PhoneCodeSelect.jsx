import { useMemo } from "react";
import { Autocomplete, TextField, Box, Typography, Popper } from "@mui/material";
import ITU_GLOBAL_COUNTRY_MASTERS, {
  getCountryByCodeOrIso,
} from "../../data/internationalPhoneMaster";

/**
 * ICJ ENTERPRISE — COMPACT PHONE ISD CODE SELECTOR
 *
 * Closed input  →  shows ONLY the calling code, e.g.  +91
 * Open dropdown →  shows flag + country name + code, e.g.  🇮🇳 India  +91
 *
 * Search works by BOTH country name ("India") AND code ("+91" or "91").
 */

const filterByNameOrCode = (options, state) => {
  const q = state.inputValue.trim().toLowerCase();
  if (!q) return options;
  return options.filter((o) =>
    o.country.toLowerCase().includes(q) ||
    o.code.replace("+", "").includes(q.replace("+", ""))
  );
};

// Custom Popper to prevent the dropdown menu from being squished to the input width
const CustomPopper = (props) => {
  return <Popper {...props} sx={{ width: "280px !important", zIndex: 1400 }} placement="bottom-start" />;
};

export default function PhoneCodeSelect({
  value = "+91",
  onChange,
  label = "Code",
  disabled = false,
}) {
  const selected = useMemo(() => getCountryByCodeOrIso(value), [value]);

  return (
    <Autocomplete
      options={ITU_GLOBAL_COUNTRY_MASTERS}
      disabled={disabled}
      disableClearable
      PopperComponent={CustomPopper}
      filterOptions={filterByNameOrCode}
      // ── Closed input: show flag + country + code ─────────────────────
      getOptionLabel={(option) =>
        typeof option === "string"
          ? option
          : `${option.flag || ""} ${option.code || ""}`.trim()
      }
      value={selected}
      onChange={(_, newValue) => {
        if (newValue && typeof newValue === "object") onChange(newValue);
      }}
      isOptionEqualToValue={(option, val) =>
        option.code === (val?.code ?? val) ||
        option.iso  === (val?.iso  ?? val)
      }
      // ── Open dropdown: show flag + name + code ───────────────────────
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <Box
            component="li"
            key={key ?? `${option.iso}-${option.code}`}
            {...rest}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 0.75,
              px: 1.5,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{option.flag}</span>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {option.country}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, minWidth: 40, textAlign: "right" }}
            >
              {option.code}
            </Typography>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="+91"
          inputProps={{
            ...params.inputProps,
            autoComplete: "new-password",
            style: { fontWeight: 700, letterSpacing: 0.5, paddingRight: 0 },
          }}
        />
      )}
      autoHighlight
      blurOnSelect
      sx={{
        minWidth: 80,
        "& .MuiAutocomplete-inputRoot": {
          px: 1,
        },
        "& .MuiAutocomplete-endAdornment": {
          right: 4,
        },
      }}
    />
  );
}
