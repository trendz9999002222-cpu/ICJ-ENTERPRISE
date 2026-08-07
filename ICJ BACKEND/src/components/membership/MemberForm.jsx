import {
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  MenuItem,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import MasterDataService from "../../services/masterDataService";

const unique = (values = []) => [...new Set((values || []).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

const buildFallbackLocationHierarchy = (filters = {}) => {
  const defaultFields = {
    visibility: {
      state: true,
      district: true,
      city: true,
      locality: false,
      postOffice: true,
      postalCode: true,
    },
    labels: {
      state: "State / Province / Region",
      district: "District / County / Prefecture",
      city: "City / Town / Municipality",
      locality: "Locality / Village",
      postOffice: "Post Office",
      postalCode: "Postal Code / ZIP Code",
    },
  };

  if (typeof window === "undefined") {
    return {
      countries: MasterDataService.getCountryMaster().map((item) => item.country),
      states: [],
      districts: [],
      cities: [],
      localities: [],
      postOffices: [],
      postalCodes: [],
      pinCodes: [],
      fields: defaultFields,
    };
  }

  let members;
  try {
    const raw = window.localStorage.getItem("icj_members");
    const parsed = raw ? JSON.parse(raw) : [];
    members = Array.isArray(parsed) ? parsed : [];
  } catch {
    members = [];
  }

  const normalized = members.map((item) => ({
    country: String(item?.country || "").trim(),
    state: String(item?.state || "").trim(),
    district: String(item?.district || "").trim(),
    city: String(item?.city || "").trim(),
    locality: String(item?.locality || item?.village || "").trim(),
    post_office: String(item?.post_office || "").trim(),
    postal_code: String(item?.postal_code || item?.zip_code || item?.zip || item?.pincode || item?.pin_code || "").trim(),
  }));

  const countryFilter = String(filters.country || "").trim();
  const stateFilter = String(filters.state || "").trim();
  const districtFilter = String(filters.district || "").trim();
  const cityFilter = String(filters.city || "").trim();
  const localityFilter = String(filters.locality || "").trim();
  const postOfficeFilter = String(filters.post_office || "").trim();

  const isoCountries = MasterDataService.getCountryMaster().map((item) => item.country);

  return {
    countries: unique(isoCountries.concat(normalized.map((item) => item.country))),
    states: unique(
      normalized
        .filter((item) => !countryFilter || item.country === countryFilter)
        .map((item) => item.state)
    ),
    districts: unique(
      normalized
        .filter((item) => (!countryFilter || item.country === countryFilter) && (!stateFilter || item.state === stateFilter))
        .map((item) => item.district)
    ),
    cities: unique(
      normalized
        .filter((item) => (!countryFilter || item.country === countryFilter) && (!stateFilter || item.state === stateFilter) && (!districtFilter || item.district === districtFilter))
        .map((item) => item.city)
    ),
    localities: unique(
      normalized
        .filter((item) => (!countryFilter || item.country === countryFilter) && (!stateFilter || item.state === stateFilter) && (!districtFilter || item.district === districtFilter) && (!cityFilter || item.city === cityFilter))
        .map((item) => item.locality)
    ),
    postOffices: unique(
      normalized
        .filter((item) => (!countryFilter || item.country === countryFilter) && (!stateFilter || item.state === stateFilter) && (!districtFilter || item.district === districtFilter) && (!cityFilter || item.city === cityFilter) && (!localityFilter || item.locality === localityFilter))
        .map((item) => item.post_office)
    ),
    postalCodes: unique(
      normalized
        .filter((item) => (!countryFilter || item.country === countryFilter) && (!stateFilter || item.state === stateFilter) && (!districtFilter || item.district === districtFilter) && (!cityFilter || item.city === cityFilter) && (!localityFilter || item.locality === localityFilter) && (!postOfficeFilter || item.post_office === postOfficeFilter))
        .map((item) => item.postal_code)
    ),
    pinCodes: unique(
      normalized
        .filter((item) => (!countryFilter || item.country === countryFilter) && (!stateFilter || item.state === stateFilter) && (!districtFilter || item.district === districtFilter) && (!cityFilter || item.city === cityFilter) && (!localityFilter || item.locality === localityFilter) && (!postOfficeFilter || item.post_office === postOfficeFilter))
        .map((item) => item.postal_code)
    ),
    fields: defaultFields,
  };
};

export default function MemberForm({
  form,
  handleChange,
  onChange,
  saveMember,
  submitLabel = "REGISTER MEMBER",
  title = "ICJ Member Registration",
  hideSubmit = false,
  hideSaveButton = false,
  hideAdminFields = false,
  hideIdentityFields = false,
  stage = 0,
}) {
  const onFieldChange = handleChange || onChange || (() => {});

  const locationHierarchy = useMemo(() => {
    const filters = {
      country: form.country || "India",
      state: form.state || undefined,
      district: form.district || undefined,
      tehsil: form.tehsil || form.sub_division || undefined,
      city: form.city || undefined,
      locality: form.locality || undefined,
      post_office: form.post_office || undefined,
    };

    const master = MasterDataService.getLocationHierarchy(filters) || {};
    const hasMasterData =
      (Array.isArray(master.states) && master.states.length > 0) ||
      (Array.isArray(master.districts) && master.districts.length > 0) ||
      (Array.isArray(master.cities) && master.cities.length > 0);

    if (hasMasterData) {
      return {
        countries: Array.isArray(master.countries) && master.countries.length > 0 ? master.countries : ["India"],
        states: Array.isArray(master.states) ? master.states : [],
        districts: Array.isArray(master.districts) ? master.districts : [],
        subDivisions: Array.isArray(master.subDivisions) ? master.subDivisions : [],
        tehsils: Array.isArray(master.tehsils) ? master.tehsils : [],
        cities: Array.isArray(master.cities) ? master.cities : [],
        localities: Array.isArray(master.localities) ? master.localities : [],
        postOffices: Array.isArray(master.postOffices) ? master.postOffices : [],
        postalCodes: Array.isArray(master.postalCodes) ? master.postalCodes : (Array.isArray(master.pinCodes) ? master.pinCodes : []),
        pinCodes: Array.isArray(master.pinCodes) ? master.pinCodes : [],
        fields: master.fields || {
          visibility: {
            state: true,
            district: true,
            city: true,
            locality: false,
            postOffice: true,
            postalCode: true,
          },
          labels: {
            state: form.country && form.country !== "India" ? "State / Province / Region" : "State",
            district: "District",
            city: form.country && form.country !== "India" ? "City / Town / Municipality" : "City / Town / Village",
            locality: "Locality / Village",
            postOffice: "Post Office",
            postalCode: form.country && form.country !== "India" ? "Postal Code / ZIP Code" : "PIN Code",
          },
        },
      };
    }

    return buildFallbackLocationHierarchy(filters);
  }, [form.country, form.state, form.district, form.tehsil, form.sub_division, form.city, form.locality, form.post_office]);

  const addressFields = locationHierarchy.fields || {
    visibility: {
      state: true,
      district: true,
      city: true,
      locality: false,
      postOffice: true,
      postalCode: true,
    },
    labels: {
      state: form.country && form.country !== "India" ? "State / Province / Region" : "State",
      district: "District",
      city: form.country && form.country !== "India" ? "City / Town / Municipality" : "City / Town / Village",
      locality: "Locality / Village",
      postOffice: "Post Office",
      postalCode: form.country && form.country !== "India" ? "Postal Code / ZIP Code" : "PIN Code",
    },
  };

  const emitChange = (name, value) => {
    onFieldChange({ target: { name, value } });
  };

  useEffect(() => {
    const pinCodes = Array.isArray(locationHierarchy.postalCodes) ? locationHierarchy.postalCodes : [];
    if (!form.post_office) {
      return;
    }
    const currentPostal = form.postal_code || form.pincode || "";
    if (pinCodes.length === 1 && currentPostal !== pinCodes[0]) {
      emitChange("pincode", pinCodes[0]);
      emitChange("postal_code", pinCodes[0]);
      return;
    }
    if (pinCodes.length > 1 && currentPostal && !pinCodes.includes(currentPostal)) {
      emitChange("pincode", "");
      emitChange("postal_code", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationHierarchy.postalCodes, form.pincode, form.postal_code, form.post_office]);

  const onAddressFieldChange = (name, value) => {
    emitChange(name, value);
    if (name === "country") {
      emitChange("state", "");
      emitChange("district", "");
      emitChange("tehsil", "");
      emitChange("sub_division", "");
      emitChange("city", "");
      emitChange("post_office", "");
      emitChange("pincode", "");
      emitChange("postal_code", "");
      return;
    }
    if (name === "state") {
      emitChange("district", "");
      emitChange("tehsil", "");
      emitChange("sub_division", "");
      emitChange("city", "");
      emitChange("post_office", "");
      emitChange("pincode", "");
      emitChange("postal_code", "");
      return;
    }
    if (name === "district") {
      emitChange("tehsil", "");
      emitChange("sub_division", "");
      emitChange("city", "");
      emitChange("locality", "");
      emitChange("post_office", "");
      emitChange("pincode", "");
      emitChange("postal_code", "");
      return;
    }
    if (name === "tehsil" || name === "sub_division") {
      emitChange("city", "");
      emitChange("locality", "");
      emitChange("post_office", "");
      emitChange("pincode", "");
      emitChange("postal_code", "");
      return;
    }
    if (name === "city") {
      emitChange("locality", "");
      emitChange("post_office", "");
      emitChange("pincode", "");
      emitChange("postal_code", "");
      return;
    }
    if (name === "post_office") {
      const availablePins = locationHierarchy.postalCodes || [];
      if (availablePins.length === 1) {
        emitChange("pincode", availablePins[0]);
        emitChange("postal_code", availablePins[0]);
      } else {
        emitChange("pincode", "");
        emitChange("postal_code", "");
      }
    }
  };

  const onProfilePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      emitChange("profile_photo", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const onSignatureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      emitChange("signature", String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const onRegistrationDocumentChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      emitChange("registration_document", String(reader.result || ""));
      emitChange("registration_document_name", file.name || "");
      emitChange("registration_document_type", file.type || "");
      emitChange("registration_document_size", Number(file.size || 0));
    };
    reader.readAsDataURL(file);
  };

  const onBirthYearChange = (event) => {
    const rawVal = event.target.value.replace(/\D/g, "").slice(0, 4);
    emitChange("birth_year", rawVal);
    emitChange("dob", rawVal);
    if (rawVal.length === 4) {
      const yearNum = Number(rawVal);
      const currentYear = new Date().getFullYear();
      if (yearNum >= 1900 && yearNum <= currentYear) {
        emitChange("age", String(currentYear - yearNum));
      } else {
        emitChange("age", "");
      }
    } else {
      emitChange("age", "");
    }
  };

  const onAadharChange = (event) => {
    const rawVal = event.target.value.replace(/\D/g, "").slice(0, 12);
    emitChange("aadhar", rawVal);
  };

  const onPanChange = (event) => {
    const rawVal = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    emitChange("pan", rawVal);
  };

  const onNeedServicesChange = (event) => {
    const value = String(event.target.value || "receive");
    emitChange("need_services", value);
    if (value === "receive") {
      emitChange("provide_services", "no");
      emitChange("service_category", "");
      emitChange("availability", "");
    } else if (value === "provide" || value === "both") {
      if (!form.provide_services || form.provide_services === "no") {
        emitChange("provide_services", "yes");
      }
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        {title}
      </Typography>

      <Grid container spacing={2}>

        {/* STAGE 1: Rendered directly in RegistrationForm for Wizard, but shown here for Stage 0 Admin mode */}
        {stage === 0 ? (
          <>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <TextField
                        select
                        variant="standard"
                        disableUnderline
                        name="mobile_country_code"
                        value={form.mobile_country_code || "+91"}
                        onChange={handleChange}
                        sx={{ mr: 1, minWidth: 65 }}
                      >
                        <MenuItem value="+91">+91 (IN)</MenuItem>
                        <MenuItem value="+1">+1 (US)</MenuItem>
                        <MenuItem value="+44">+44 (UK)</MenuItem>
                        <MenuItem value="+971">+971 (AE)</MenuItem>
                        <MenuItem value="+61">+61 (AU)</MenuItem>
                        <MenuItem value="+86">+86 (CN)</MenuItem>
                      </TextField>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid xs={12} md={6}>
              <Box>
                <TextField
                  fullWidth
                  label="WhatsApp Number"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(form.whatsapp && form.whatsapp === form.mobile)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange({ target: { name: "whatsapp", value: form.mobile || "" } });
                        } else {
                          handleChange({ target: { name: "whatsapp", value: "" } });
                        }
                      }}
                    />
                  }
                  label={<Typography variant="caption">Same as Mobile</Typography>}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Grid>
          </>
        ) : null}

        {/* STAGE 2: Personal Details & Identity */}
        {(stage === 0 || stage === 2) ? (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Birth Year"
                name="birth_year"
                placeholder="YYYY (e.g. 1990)"
                value={form.birth_year || form.dob || ""}
                onChange={onBirthYearChange}
                inputProps={{ maxLength: 4 }}
                helperText={
                  (form.birth_year || form.dob) && String(form.birth_year || form.dob).length !== 4
                    ? "Birth Year must be 4 digits (e.g. 1990)"
                    : "Enter 4-digit Birth Year (e.g. 1990)"
                }
                error={Boolean((form.birth_year || form.dob) && String(form.birth_year || form.dob).length !== 4)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                value={form.age || ""}
                InputProps={{ readOnly: true }}
                helperText="Auto-calculated from Birth Year"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                select
                label="Gender"
                name="gender"
                value={form.gender || ""}
                onChange={onFieldChange}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            {hideIdentityFields ? null : (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Aadhaar Number"
                  name="aadhar"
                  placeholder="12-digit Aadhaar Number"
                  value={form.aadhar || ""}
                  onChange={onAadharChange}
                  inputProps={{ maxLength: 12 }}
                  helperText={form.aadhar && form.aadhar.length !== 12 ? "Aadhaar number must be exactly 12 digits" : "12-digit Aadhaar Number (Optional)"}
                  error={Boolean(form.aadhar && form.aadhar.length !== 12)}
                />
              </Grid>
            )}

            {hideIdentityFields ? null : (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="PAN Number"
                  name="pan"
                  placeholder="10-character PAN (e.g. ABCDE1234F)"
                  value={form.pan || ""}
                  onChange={onPanChange}
                  inputProps={{ maxLength: 10 }}
                  helperText={form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan) ? "Invalid PAN format (e.g. ABCDE1234F)" : "10-character PAN Number (Optional)"}
                  error={Boolean(form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan))}
                />
              </Grid>
            )}
          </>
        ) : null}

        {/* STAGE 3: Address & Organisation */}
        {(stage === 0 || stage === 3) ? (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Member Type"
                name="member_type"
                value={form.member_type || "Individual"}
                onChange={handleChange}
              >
                <MenuItem value="Individual">Individual</MenuItem>
                <MenuItem value="Institutional">Institutional</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Services Required / Offered"
                name="need_services"
                value={form.need_services || "receive"}
                onChange={onNeedServicesChange}
              >
                <MenuItem value="receive">I Need Services</MenuItem>
                <MenuItem value="provide">I Want To Provide Services</MenuItem>
                <MenuItem value="both">Both (Need & Provide Services)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Profession"
                name="profession"
                value={form.profession || ""}
                onChange={handleChange}
              >
                <MenuItem value="">Select Profession</MenuItem>
                {MasterDataService.getProfessions().map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {form.profession === "Advocate" ? null : (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Organisation"
                    name="organisation"
                    value={form.organisation || ""}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Designation"
                    name="designation"
                    value={form.designation || ""}
                    onChange={handleChange}
                  />
                </Grid>
              </>
            )}

            {/* Address & Location Hierarchy Header */}
            <Grid item xs={12} sx={{ mt: 2, mb: 1 }}>
              <Typography variant="h6" fontWeight="600" color="primary">
                Address & Location Details
              </Typography>
              {form.country && form.country !== "India" ? (
                <Typography variant="caption" color="secondary" fontWeight="500">
                  International Address Mode Active (Non-India Jurisdiction)
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Cascading Government Standard Address Hierarchy (Country → State → District → Sub-District/Tehsil → City/Village → Post Office → PIN)
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Country"
                name="country"
                value={form.country || "India"}
                onChange={(event) => onAddressFieldChange("country", event.target.value)}
              >
                {locationHierarchy.countries.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select={form.country === "India" || !form.country ? (locationHierarchy.states.length > 0) : false}
                label={addressFields.labels.state}
                name="state"
                value={form.state || ""}
                onChange={(event) => onAddressFieldChange("state", event.target.value)}
              >
                {(form.country === "India" || !form.country) && locationHierarchy.states.length > 0 ? (
                  <MenuItem value="">Select State</MenuItem>
                ) : null}
                {(form.country === "India" || !form.country) && locationHierarchy.states.map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Indian Hierarchy: District */}
            {(!form.country || form.country === "India") && addressFields.visibility.district ? (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select={locationHierarchy.districts.length > 0}
                  disabled={!form.state}
                  label={addressFields.labels.district}
                  name="district"
                  value={form.district || ""}
                  onChange={(event) => onAddressFieldChange("district", event.target.value)}
                >
                  <MenuItem value="">Select District</MenuItem>
                  {locationHierarchy.districts.map((item) => (
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            ) : null}

            {/* Indian Hierarchy: Sub-District / Tehsil */}
            {(!form.country || form.country === "India") && locationHierarchy.tehsils.length > 0 ? (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  disabled={!form.district}
                  label="Sub-District / Tehsil"
                  name="tehsil"
                  value={form.tehsil || form.sub_division || ""}
                  onChange={(event) => {
                    onAddressFieldChange("tehsil", event.target.value);
                    emitChange("sub_division", event.target.value);
                  }}
                >
                  <MenuItem value="">Select Sub-District / Tehsil</MenuItem>
                  {locationHierarchy.tehsils.map((item) => (
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            ) : null}

            {/* City / Town / Village */}
            {(!form.country || form.country === "India") ? (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select={locationHierarchy.cities.length > 0}
                  disabled={!form.district}
                  label={addressFields.labels.city}
                  name="city"
                  value={locationHierarchy.cities.includes(form.city) ? form.city : (form.city ? "OTHER" : "")}
                  onChange={(event) => {
                    const val = event.target.value;
                    if (val === "OTHER") {
                      emitChange("city", "");
                      emitChange("city_is_manual", "true");
                    } else {
                      emitChange("city_is_manual", "false");
                      onAddressFieldChange("city", val);
                    }
                  }}
                >
                  <MenuItem value="">Select City / Town / Village</MenuItem>
                  {locationHierarchy.cities.map((item) => (
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  ))}
                  <MenuItem value="OTHER">Other City / Town / Village (Manual Entry)</MenuItem>
                </TextField>
              </Grid>
            ) : (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={addressFields.labels.city}
                  name="city"
                  value={form.city || ""}
                  onChange={(event) => onAddressFieldChange("city", event.target.value)}
                />
              </Grid>
            )}

            {/* Manual City Text Field if OTHER selected or manual city flag active */}
            {(!form.country || form.country === "India") &&
             (!locationHierarchy.cities.includes(form.city) || form.city_is_manual === "true") ? (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City / Town / Village Name (Manual)"
                  name="city"
                  placeholder="Enter City / Town / Village"
                  value={form.city || ""}
                  onChange={(event) => onAddressFieldChange("city", event.target.value)}
                  helperText="Manual Entry (Not in Master Data)"
                />
              </Grid>
            ) : null}

            {/* Post Office (India Only) */}
            {(!form.country || form.country === "India") && addressFields.visibility.postOffice ? (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select={locationHierarchy.postOffices.length > 0}
                  disabled={!form.district}
                  label={addressFields.labels.postOffice}
                  name="post_office"
                  value={form.post_office || ""}
                  onChange={(event) => onAddressFieldChange("post_office", event.target.value)}
                >
                  <MenuItem value="">Select Post Office</MenuItem>
                  {locationHierarchy.postOffices.map((item) => (
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            ) : null}

            {/* PIN Code / Postal Code */}
            <Grid item xs={12} md={(!form.country || form.country === "India") ? 6 : 4}>
              <TextField
                fullWidth
                select={(!form.country || form.country === "India") && locationHierarchy.postalCodes.length > 1}
                label={addressFields.labels.postalCode}
                name="pincode"
                value={form.postal_code || form.pincode || ""}
                onChange={(event) => {
                  emitChange("pincode", event.target.value);
                  emitChange("postal_code", event.target.value);
                }}
              >
                {(!form.country || form.country === "India") && locationHierarchy.postalCodes.length > 1 ? (
                  <MenuItem value="">Select PIN Code</MenuItem>
                ) : null}
                {(!form.country || form.country === "India") && locationHierarchy.postalCodes.length > 1 ? (
                  locationHierarchy.postalCodes.map((item) => (
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  ))
                ) : null}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Address Line 1"
                name="address"
                value={form.address || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2"
                name="address_line2"
                value={form.address_line2 || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Landmark"
                name="landmark"
                value={form.landmark || ""}
                onChange={handleChange}
              />
            </Grid>
          </>
        ) : null}

        {/* STAGE 4: Documents & Verification */}
        {(stage === 0 || stage === 4) ? (
          <>
            <Grid item xs={12} md={6}>
              <Button component="label" fullWidth variant="outlined" sx={{ height: 56 }}>
                {form.profile_photo ? "Change Profile Photo" : "Upload Profile Photo"}
                <input hidden type="file" accept="image/*" onChange={onProfilePhotoChange} />
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Button component="label" fullWidth variant="outlined" sx={{ height: 56 }}>
                {form.signature ? "Change Signature" : "Upload Signature"}
                <input hidden type="file" accept="image/*" onChange={onSignatureChange} />
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button component="label" fullWidth variant="outlined" sx={{ height: 56 }}>
                {form.registration_document_name || "Upload Registration Document"}
                <input hidden type="file" accept=".pdf,image/*" onChange={onRegistrationDocumentChange} />
              </Button>
            </Grid>

            {form.profile_photo ? (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Box>
                    <img
                      src={form.profile_photo}
                      alt="Profile preview"
                      style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }}
                    />
                    <Button size="small" color="error" onClick={() => emitChange("profile_photo", "")}>Remove Photo</Button>
                  </Box>
                </Box>
              </Grid>
            ) : null}

            {form.signature ? (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                  <Box>
                    <img
                      src={form.signature}
                      alt="Signature preview"
                      style={{ width: 180, height: 80, objectFit: "contain", borderRadius: 8, border: "1px solid #ddd" }}
                    />
                    <Button size="small" color="error" onClick={() => emitChange("signature", "")}>Remove Signature</Button>
                  </Box>
                </Box>
              </Grid>
            ) : null}

            {hideIdentityFields ? null : (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="GST Number"
                  name="gst"
                  value={form.gst || ""}
                  onChange={handleChange}
                />
              </Grid>
            )}

            {hideAdminFields ? null : (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="KYC Verification"
                    name="verification_status"
                    value={form.verification_status || "Not Verified"}
                    onChange={handleChange}
                  >
                    <MenuItem value="Not Verified">Not Verified</MenuItem>
                    <MenuItem value="Verified">Verified</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Member Level"
                    name="member_level"
                    value={form.member_level || "BASIC"}
                    onChange={handleChange}
                  >
                    <MenuItem value="BASIC">Basic</MenuItem>
                    <MenuItem value="PREMIUM">Premium</MenuItem>
                    <MenuItem value="GOLD">Gold</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    name="status"
                    value={form.status || "Pending"}
                    onChange={handleChange}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Pending Profile Completion">Pending Profile Completion</MenuItem>
                    <MenuItem value="Pending Verification">Pending Verification</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="Suspended">Suspended</MenuItem>
                  </TextField>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks / Additional Information"
                name="remarks"
                value={form.remarks || ""}
                onChange={onFieldChange}
              />
            </Grid>
          </>
        ) : null}

        {hideSubmit || hideSaveButton || stage > 0 ? null : (
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              onClick={saveMember}
            >
              {submitLabel}
            </Button>
          </Grid>
        )}

      </Grid>
    </Paper>
  );
}

