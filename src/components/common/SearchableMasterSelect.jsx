import { useMemo } from "react";
import { Autocomplete, TextField, Grid } from "@mui/material";
import { ProfessionalMasterService } from "../../data/professionalMasterData";

const OTHER_TRIGGERS = [
  "Other / Not Listed",
  "Other (Enter Manually)",
  "Other / Custom District",
  "Other",
];

/**
 * ICJ ENTERPRISE PLATFORM — SEARCHABLE MASTER AUTOCOMPLETE SELECT
 * Upgrades all master dropdowns (State, District, City, Court, Practice Area, Specialization, etc.)
 * with searchable options and "Other / Not Listed" inline manual text entry.
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
  metadata = {},
}) {
  // Enforce "Other / Not Listed" presence in options
  const masterOptions = useMemo(() => {
    const list = Array.isArray(options) ? [...options] : [];
    const mainTrigger = "Other / Not Listed";
    if (!list.some((opt) => OTHER_TRIGGERS.includes(opt))) {
      list.push(mainTrigger);
    }
    return list;
  }, [options]);

  const isCustomActive =
    OTHER_TRIGGERS.includes(value) ||
    (value && !options.includes(value) && value !== "");

  const handleSelectChange = (event, newValue) => {
    if (!newValue) {
      onChange({ target: { name: category.toLowerCase(), value: "" } });
      return;
    }

    if (OTHER_TRIGGERS.includes(newValue)) {
      onChange({ target: { name: category.toLowerCase(), value: newValue } });
    } else {
      onChange({ target: { name: category.toLowerCase(), value: newValue } });
    }
  };

  const handleCustomTextChange = (e) => {
    const customVal = e.target.value;
    if (onCustomValueChange) {
      onCustomValueChange(customVal);
    }
    // Automatically submit to Super Admin Queue with provenance metadata
    if (customVal && customVal.trim().length >= 2) {
      ProfessionalMasterService.submitCustomMaster(
        category,
        customVal,
        "Inline Master Custom Input",
        {
          source: "CUSTOM/MANUAL",
          ...metadata,
        }
      );
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
            if (newInputValue && !options.includes(newInputValue) && !OTHER_TRIGGERS.includes(newInputValue)) {
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
                  ? `Custom ${category} (Manual Entry Active)`
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
            label={`Manual ${category} Entry (Not Listed)`}
            placeholder={`Type manual ${category} name...`}
            value={customValue || (value && !OTHER_TRIGGERS.includes(value) ? value : "")}
            onChange={handleCustomTextChange}
            helperText="Custom value will be preserved and sent to Admin Queue"
            error={Boolean(!customValue && !OTHER_TRIGGERS.includes(value) && (!value || !value.trim()))}
          />
        </Grid>
      )}
    </Grid>
  );
}
