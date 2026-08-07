import { useMemo } from "react";
import { Autocomplete, TextField, Grid } from "@mui/material";
import { ProfessionalMasterService } from "../../data/professionalMasterData";

/**
 * ICJ ENTERPRISE PLATFORM — SEARCHABLE MASTER AUTOCOMPLETE SELECT
 * Upgrades all master dropdowns (State, City, Court, Practice Area, Specialization, etc.)
 * with searchable options and "Other (Enter Manually)" text entry.
 */
export default function SearchableMasterSelect({
  label = "Option",
  value = "",
  onChange,
  options = [],
  customValue = "",
  onCustomValueChange,
  category = "Master",
  placeholder = "Search...",
  helperText = "",
  required = false,
  error = false,
  fullWidth = true,
  disabled = false,
}) {
  const OTHER_TRIGGER = "Other (Enter Manually)";

  // Enforce "Other (Enter Manually)" presence in options
  const masterOptions = useMemo(() => {
    const list = Array.isArray(options) ? [...options] : [];
    if (!list.includes(OTHER_TRIGGER)) {
      list.push(OTHER_TRIGGER);
    }
    return list;
  }, [options]);

  const isCustomActive =
    value === OTHER_TRIGGER ||
    value === "Other" ||
    value === "Custom" ||
    (value && !options.includes(value));

  const handleSelectChange = (event, newValue) => {
    if (!newValue) {
      onChange({ target: { name: category.toLowerCase(), value: "" } });
      return;
    }

    if (newValue === OTHER_TRIGGER || newValue === "Other") {
      onChange({ target: { name: category.toLowerCase(), value: OTHER_TRIGGER } });
    } else {
      onChange({ target: { name: category.toLowerCase(), value: newValue } });
    }
  };

  const handleCustomTextChange = (e) => {
    const customVal = e.target.value;
    if (onCustomValueChange) {
      onCustomValueChange(customVal);
    }
    // Automatically submit to Super Admin Queue
    if (customVal && customVal.trim().length >= 2) {
      ProfessionalMasterService.submitCustomMaster(category, customVal, "Searchable Master Input");
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Autocomplete
          freeSolo
          options={masterOptions}
          value={value || ""}
          disabled={disabled}
          onChange={handleSelectChange}
          onInputChange={(event, newInputValue) => {
            if (newInputValue && !options.includes(newInputValue)) {
              if (onCustomValueChange) {
                onCustomValueChange(newInputValue);
              }
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth={fullWidth}
              label={required ? `${label} *` : label}
              placeholder={placeholder}
              error={error}
              helperText={
                isCustomActive
                  ? `Custom ${category} mode active`
                  : helperText
              }
            />
          )}
        />
      </Grid>

      {isCustomActive && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={`Custom ${category}`}
            placeholder={`Enter custom ${category}...`}
            value={customValue || ""}
            onChange={handleCustomTextChange}
            helperText="Subject to admin approval"
            error={Boolean(!customValue || !customValue.trim())}
          />
        </Grid>
      )}
    </Grid>
  );
}
