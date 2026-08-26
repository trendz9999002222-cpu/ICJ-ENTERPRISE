import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  TextField,
  Autocomplete,
  Button,
  CircularProgress,
  Typography,
  Chip,
  InputAdornment,
  Stack,
  Alert,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import { PAN_INDIA_STATES, PAN_INDIA_DISTRICTS_MAP } from "../../data/panIndiaMaster.js";
import { PincodeLookupService } from "../../services/pincodeLookupService.js";
import { sanitizeStrictPincode } from "../../utils/validationStandards.js";

/**
 * SmartLocationSelector — Instant Pincode & GPS Auto-Location Resolver
 * 
 * Props:
 * - state: current selected state
 * - district: current selected district
 * - tehsil: current selected tehsil/city
 * - policeStation: current police station
 * - pincode: current pincode
 * - onChange: callback ({ state, district, tehsil, policeStation, pincode, village })
 * - title: optional title banner
 * - required: boolean
 * - themeColor: theme accent color (default: #15803d)
 */
export default function SmartLocationSelector({
  state = "Delhi",
  district = "New Delhi",
  tehsil = "",
  policeStation = "",
  pincode = "",
  onChange,
  title = "📍 Pan-India Geographic Location & Node Jurisdiction",
  required = true,
  themeColor = "#15803d",
}) {
  const [loadingPin, setLoadingPin] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);
  const [autoStatus, setAutoStatus] = useState(null);
  const [villageOptions, setVillageOptions] = useState([]);
  const [gpsError, setGpsError] = useState("");

  const handlePincodeChange = async (newPinRaw) => {
    const cleanPin = sanitizeStrictPincode(newPinRaw);
    onChange?.({ pincode: cleanPin });
    setGpsError("");

    if (cleanPin.length === 6) {
      setLoadingPin(true);
      try {
        const result = await PincodeLookupService.lookupPincode(cleanPin);
        if (result && result.success) {
          const matchedState = result.state || state;
          const matchedDistrict = result.district || district;
          const matchedTehsil = result.tehsil || tehsil;
          const matchedThana = result.policeStation || policeStation;

          if (Array.isArray(result.postOffices) && result.postOffices.length > 0) {
            setVillageOptions(result.postOffices.map((po) => po.name));
          } else if (Array.isArray(result.tehsilOptions)) {
            setVillageOptions(result.tehsilOptions);
          }

          onChange?.({
            pincode: cleanPin,
            state: matchedState,
            district: matchedDistrict,
            tehsil: matchedTehsil,
            policeStation: matchedThana,
            village: result.village || "",
          });

          setAutoStatus(`Auto-detected: ${matchedDistrict}, ${matchedState} (${result.source === "INDIA_POST_LIVE" ? "India Post Live" : "Verified Master"})`);
        }
      } catch (err) {
        console.warn("Pincode lookup error:", err);
      } finally {
        setLoadingPin(false);
      }
    } else {
      setAutoStatus(null);
    }
  };

  const handleGpsDetect = async () => {
    setLoadingGps(true);
    setGpsError("");
    setAutoStatus(null);
    try {
      const result = await PincodeLookupService.detectGpsLocation();
      if (result && result.success) {
        onChange?.({
          pincode: result.pincode || pincode,
          state: result.state || state,
          district: result.district || district,
          tehsil: result.tehsil || tehsil,
          policeStation: result.policeStation || policeStation,
          village: result.village || "",
        });
        setAutoStatus(`GPS Located: ${result.district}, ${result.state} (PIN: ${result.pincode || "Detected"})`);
      }
    } catch (err) {
      setGpsError(err.message || "Unable to acquire GPS coordinates.");
    } finally {
      setLoadingGps(false);
    }
  };

  const handleStateChange = (newState) => {
    const defaultDist = (PAN_INDIA_DISTRICTS_MAP[newState] || [])[0] || "";
    onChange?.({
      state: newState,
      district: defaultDist,
    });
    setAutoStatus(null);
  };

  const handleDistrictChange = (newDistrict) => {
    onChange?.({
      district: newDistrict,
    });
    setAutoStatus(null);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header with Title & GPS Button */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: themeColor, display: "flex", alignItems: "center", gap: 0.8 }}>
            <LocationOnIcon fontSize="small" /> {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Enter 6-digit Pincode or click GPS to auto-populate State, District, Tehsil & Thana
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={handleGpsDetect}
          disabled={loadingGps}
          startIcon={loadingGps ? <CircularProgress size={16} color="inherit" /> : <MyLocationIcon />}
          sx={{
            fontWeight: 800,
            textTransform: "none",
            borderRadius: 2,
            borderColor: themeColor,
            color: themeColor,
            bgcolor: `${themeColor}0a`,
            "&:hover": { borderColor: themeColor, bgcolor: `${themeColor}1a` },
            flexShrink: 0,
          }}
        >
          {loadingGps ? "Acquiring GPS..." : "📍 Auto-Detect My Location"}
        </Button>
      </Stack>

      {/* Auto-detected Alert / GPS Error Badge */}
      {autoStatus && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{ mb: 2, py: 0.5, fontWeight: 700, fontSize: "0.85rem" }}
          onClose={() => setAutoStatus(null)}
        >
          {autoStatus}
        </Alert>
      )}

      {gpsError && (
        <Alert severity="warning" sx={{ mb: 2, py: 0.5, fontSize: "0.85rem" }} onClose={() => setGpsError("")}>
          {gpsError}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* FIELD 1: 6-Digit PIN Code (Primary Instant Anchor) */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            required={required}
            label="Postal Pincode (6 Digits)"
            name="pincode"
            value={pincode}
            onChange={(e) => handlePincodeChange(e.target.value)}
            placeholder="e.g. 110001"
            inputProps={{ maxLength: 6, inputMode: "numeric" }}
            helperText="Type 6 digits to auto-fill State & District"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: themeColor }} />
                </InputAdornment>
              ),
              endAdornment: loadingPin ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} sx={{ color: themeColor }} />
                </InputAdornment>
              ) : pincode.length === 6 ? (
                <InputAdornment position="end">
                  <CheckCircleIcon color="success" fontSize="small" />
                </InputAdornment>
              ) : null,
            }}
          />
        </Grid>

        {/* FIELD 2: State / UT (Auto-selected, Dropdown Enabled) */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Autocomplete
            disableClearable
            options={PAN_INDIA_STATES}
            value={state || PAN_INDIA_STATES[0]}
            onChange={(_, newValue) => handleStateChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required={required}
                label="State / Union Territory"
                name="state"
              />
            )}
          />
        </Grid>

        {/* FIELD 3: District (Filtered by State) */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Autocomplete
            disableClearable
            options={PAN_INDIA_DISTRICTS_MAP[state] || []}
            value={district || (PAN_INDIA_DISTRICTS_MAP[state] || [])[0] || ""}
            onChange={(_, newValue) => handleDistrictChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required={required}
                label="District"
                name="district"
              />
            )}
          />
        </Grid>

        {/* FIELD 4: Tehsil / Sub-district / Center Location */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Autocomplete
            freeSolo
            options={villageOptions}
            value={tehsil || ""}
            onInputChange={(_, newInputValue) => onChange?.({ tehsil: newInputValue })}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required={required}
                label="Tehsil / Sub-district / City"
                name="tehsil"
                placeholder="Tehsil or Sub-district name..."
                helperText="Auto-suggested from Pincode or type manually"
              />
            )}
          />
        </Grid>

        {/* FIELD 5: Jurisdictional Police Station (Thana) */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Nearest Police Station (Thana)"
            name="policeStation"
            value={policeStation || ""}
            onChange={(e) => onChange?.({ policeStation: e.target.value })}
            placeholder="e.g. Hazratganj PS, Kotwali Thana..."
            helperText="Local jurisdictional police station"
          />
        </Grid>

        {/* FIELD 6: Specific Village / Area / Ward / Street Landmark */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Village / Area / Locality / Ward"
            name="village"
            placeholder="e.g. Sector 18, Gandhi Nagar, Main Market..."
            helperText="Exact local area or premise landmark"
            onChange={(e) => onChange?.({ village: e.target.value })}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
