"use client";

import { FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { INDIAN_STATES, STATE_DISTRICTS_MAP } from "@/constants/onboarding";
import { RADIUS } from "@/theme/designTokens";

interface AddressValues {
  addressLine: string;
  state: string;
  district: string;
  cityTehsil: string;
  pincode: string;
}

interface Props {
  values: AddressValues;
  onChange: (field: keyof AddressValues, value: string) => void;
  errors?: Partial<Record<keyof AddressValues, string>>;
  disabled?: boolean;
}

export default function AddressFields({ values, onChange, errors = {}, disabled }: Props) {
  const currentDistricts = values.state && STATE_DISTRICTS_MAP[values.state]
    ? STATE_DISTRICTS_MAP[values.state]
    : [];

  const handleStateChange = (newState: string) => {
    onChange("state", newState);
    // Reset district if it is not in the new state's districts
    const newDistricts = STATE_DISTRICTS_MAP[newState] || [];
    if (!newDistricts.includes(values.district)) {
      onChange("district", newDistricts[0] || "");
    }
  };

  const handlePincodeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    onChange("pincode", cleaned);
  };

  return (
    <Grid container spacing={2.5}>
      {/* Full Address Line */}
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          required
          id="field-addressLine"
          label="Street Address / House No. / Premises (पूरा पता) *"
          placeholder="e.g. Flat 302, Green Enclave, Civil Lines"
          value={values.addressLine || ""}
          onChange={(e) => onChange("addressLine", e.target.value)}
          error={Boolean(errors.addressLine)}
          helperText={errors.addressLine}
          disabled={disabled}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: RADIUS.sm,
              bgcolor: "#fff",
              "&:hover fieldset": { borderColor: "#94a3b8" },
              "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: 2 },
            },
          }}
        />
      </Grid>

      {/* State Dropdown */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <FormControl
          fullWidth
          required
          error={Boolean(errors.state)}
          disabled={disabled}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: RADIUS.sm,
              bgcolor: "#fff",
              "&:hover fieldset": { borderColor: "#94a3b8" },
              "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: 2 },
            },
          }}
        >
          <InputLabel id="state-select-label">State / राज्य *</InputLabel>
          <Select
            labelId="state-select-label"
            id="field-state"
            label="State / राज्य *"
            value={values.state || ""}
            onChange={(e) => handleStateChange(e.target.value as string)}
            MenuProps={{
              disableScrollLock: true,
              slotProps: {
                paper: {
                  sx: { maxHeight: 300, borderRadius: RADIUS.sm },
                },
              },
            }}
          >
            {INDIAN_STATES.map((st) => (
              <MenuItem key={st} value={st}>
                {st}
              </MenuItem>
            ))}
          </Select>
          {errors.state && (
            <FormHelperText sx={{ fontWeight: 600, fontSize: "0.78rem", mt: 0.75 }}>
              {errors.state}
            </FormHelperText>
          )}
        </FormControl>
      </Grid>

      {/* District Dropdown (Dependent) */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        {currentDistricts.length > 0 ? (
          <FormControl
            fullWidth
            required
            error={Boolean(errors.district)}
            disabled={disabled}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: RADIUS.sm,
                bgcolor: "#fff",
                "&:hover fieldset": { borderColor: "#94a3b8" },
                "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: 2 },
              },
            }}
          >
            <InputLabel id="district-select-label">District / ज़िला *</InputLabel>
            <Select
              labelId="district-select-label"
              id="field-district"
              label="District / ज़िला *"
              value={values.district || ""}
              onChange={(e) => onChange("district", e.target.value as string)}
              MenuProps={{
                disableScrollLock: true,
                slotProps: {
                  paper: {
                    sx: { maxHeight: 300, borderRadius: RADIUS.sm },
                  },
                },
              }}
            >
              {currentDistricts.map((dst) => (
                <MenuItem key={dst} value={dst}>
                  {dst}
                </MenuItem>
              ))}
            </Select>
            {errors.district && (
              <FormHelperText sx={{ fontWeight: 600, fontSize: "0.78rem", mt: 0.75 }}>
                {errors.district}
              </FormHelperText>
            )}
          </FormControl>
        ) : (
          <TextField
            fullWidth
            required
            id="field-district"
            label="District / ज़िला *"
            placeholder="ज़िला दर्ज करें"
            value={values.district || ""}
            onChange={(e) => onChange("district", e.target.value)}
            error={Boolean(errors.district)}
            helperText={errors.district}
            disabled={disabled}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: RADIUS.sm,
                bgcolor: "#fff",
                "&:hover fieldset": { borderColor: "#94a3b8" },
                "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: 2 },
              },
            }}
          />
        )}
      </Grid>

      {/* City / Tehsil */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          required
          id="field-cityTehsil"
          label="City / Tehsil (शहर / तहसील) *"
          placeholder="e.g. Civil Lines, Sadar"
          value={values.cityTehsil || ""}
          onChange={(e) => onChange("cityTehsil", e.target.value)}
          error={Boolean(errors.cityTehsil)}
          helperText={errors.cityTehsil}
          disabled={disabled}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: RADIUS.sm,
              bgcolor: "#fff",
              "&:hover fieldset": { borderColor: "#94a3b8" },
              "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: 2 },
            },
          }}
        />
      </Grid>

      {/* Pincode */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          fullWidth
          required
          id="field-pincode"
          label="Pincode (पिनकोड - 6 अंक) *"
          placeholder="e.g. 110001"
          value={values.pincode || ""}
          onChange={(e) => handlePincodeChange(e.target.value)}
          error={Boolean(errors.pincode)}
          helperText={errors.pincode}
          disabled={disabled}
          type="tel"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: RADIUS.sm,
              bgcolor: "#fff",
              "&:hover fieldset": { borderColor: "#94a3b8" },
              "&.Mui-focused fieldset": { borderColor: "#2563eb", borderWidth: 2 },
            },
          }}
        />
      </Grid>
    </Grid>
  );
}
