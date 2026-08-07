import { useMemo } from "react";
import {
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  MenuItem,
  ListSubheader,
  Chip,
  Stack,
  Alert,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Box,
} from "@mui/material";
import {
  PROFESSIONAL_CLASSIFICATION,
  CUSTOM_PROFESSION_TRIGGERS,
} from "../../data/professionalMasterData";
import { STATES_LIST } from "../../data/locationMasterData";
import SearchableMasterSelect from "../common/SearchableMasterSelect";
import SearchableCountrySelect from "../common/SearchableCountrySelect";
import { getCountryByCodeOrIso } from "../../data/internationalPhoneMaster";

export default function MemberForm({
  form,
  handleChange,
  saveMember,
  existingMembers = [],
}) {
  const MIN_AGE = 18;
  const currentYr = new Date().getFullYear();
  const maxYr = currentYr - MIN_AGE;

  const isCustomSelected = CUSTOM_PROFESSION_TRIGGERS.includes(form.profession);
  const regType = form.regType || "Individual";
  const mobileCountryCode = form.mobileCountryCode || "+91";
  const waCountryCode = form.waCountryCode || "+91";
  const emergencyCountryCode = form.emergencyCountryCode || "+91";

  const mobCfg = getCountryByCodeOrIso(mobileCountryCode);
  const waCfg = getCountryByCodeOrIso(waCountryCode);
  const emgCfg = getCountryByCodeOrIso(emergencyCountryCode);

  // Sanitize and Format Handlers
  const handleNameChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^[a-zA-Z\p{Script=Devanagari}\s.'-]+$/u.test(val)) {
      handleChange({ target: { name: e.target.name, value: val } });
    }
  };

  const handleDigitsOnlyChange = (e, maxLen) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    handleChange({ target: { name: e.target.name, value: digits } });
  };

  const handlePANChange = (e) => {
    const upper = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    handleChange({ target: { name: e.target.name, value: upper } });
  };

  const handleEmailChange = (e) => {
    const trimmed = e.target.value.trim().slice(0, 254);
    handleChange({ target: { name: "email", value: trimmed } });
  };

  // Validation Logic Flags
  const isNameValid = useMemo(() => {
    const val = (form.name || "").trim();
    return val.length >= 2 && /^[a-zA-Z\p{Script=Devanagari}\s.'-]+$/u.test(val);
  }, [form.name]);

  const isEmailValid = useMemo(() => {
    const email = (form.email || "").trim();
    if (!email) return false;
    const rfcRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return email.length <= 254 && rfcRegex.test(email);
  }, [form.email]);

  const isMobileValid = useMemo(() => {
    const mob = (form.mobile || "").trim();
    return mobCfg.regex.test(mob);
  }, [form.mobile, mobCfg]);

  const isWaValid = useMemo(() => {
    const wa = (form.whatsapp || "").trim();
    if (!wa) return true; // optional
    return waCfg.regex.test(wa);
  }, [form.whatsapp, waCfg]);

  const isEmergencyValid = useMemo(() => {
    const emg = (form.emergencyContact || "").trim();
    if (!emg) return true; // optional
    return emgCfg.regex.test(emg);
  }, [form.emergencyContact, emgCfg]);

  const isAadhaarValid = useMemo(() => {
    const aadh = (form.aadhaar || "").trim();
    if (!aadh) return true; // optional
    return /^\d{12}$/.test(aadh);
  }, [form.aadhaar]);

  const isPANValid = useMemo(() => {
    const pan = (form.pan || "").trim();
    if (!pan) return true; // optional
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  }, [form.pan]);

  const isPincodeValid = useMemo(() => {
    const pin = (form.pincode || "").trim();
    if (!pin) return true; // optional
    return /^\d{6}$/.test(pin);
  }, [form.pincode]);

  const isBirthYearValid = useMemo(() => {
    if (regType === "Organisation") return true;
    if (!form.birthYear || !String(form.birthYear).trim()) return true;
    const yr = parseInt(form.birthYear, 10);
    return yr >= 1900 && yr <= maxYr;
  }, [form.birthYear, maxYr, regType]);

  const isProfessionValid = useMemo(() => {
    if (!form.profession) return false;
    if (isCustomSelected) {
      return Boolean((form.customProfession || "").trim());
    }
    return true;
  }, [form.profession, isCustomSelected, form.customProfession]);

  // Duplicate Check Validation
  const duplicateErrors = useMemo(() => {
    const errors = [];
    const mob = (form.mobile || "").trim();
    const email = (form.email || "").trim();
    const aadh = (form.aadhaar || "").trim();
    const pan = (form.pan || "").trim();

    if (mob && existingMembers.some((m) => (m.mobile || "").includes(mob))) {
      errors.push("Mobile number already registered in Master Dataset.");
    }
    if (email && existingMembers.some((m) => (m.email || "").toLowerCase() === email.toLowerCase())) {
      errors.push("Email address already registered in Master Dataset.");
    }
    if (aadh && existingMembers.some((m) => (m.aadhaar || "") === aadh)) {
      errors.push("Aadhaar number already registered in Master Dataset.");
    }
    if (pan && existingMembers.some((m) => (m.pan || "").toUpperCase() === pan.toUpperCase())) {
      errors.push("PAN number already registered in Master Dataset.");
    }

    return errors;
  }, [form.mobile, form.email, form.aadhaar, form.pan, existingMembers]);

  const isFormValid =
    isNameValid &&
    isEmailValid &&
    isMobileValid &&
    isWaValid &&
    isEmergencyValid &&
    isAadhaarValid &&
    isPANValid &&
    isPincodeValid &&
    isBirthYearValid &&
    isProfessionValid &&
    duplicateErrors.length === 0;

  return (
    <Paper sx={{ mt: 4, p: { xs: 2.5, md: 4 }, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
      <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom sx={{ borderBottom: "2px solid", borderColor: "primary.main", pb: 1, mb: 3 }}>
        Member Registration
      </Typography>

      {duplicateErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {duplicateErrors.join(" | ")}
        </Alert>
      )}

      <Stack spacing={4}>
        {/* SECTION 1: IDENTITY */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ mb: 1.5, pb: 0.5, borderBottom: "1px solid #e0e0e0" }}>
            SECTION 1 — Identity
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: "bold", fontSize: "0.85rem", mb: 0.5 }}>
                  Registration Type
                </FormLabel>
                <RadioGroup row name="regType" value={regType} onChange={handleChange}>
                  <FormControlLabel value="Individual" control={<Radio color="primary" size="small" />} label="Individual Practitioner / Member" />
                  <FormControlLabel value="Organisation" control={<Radio color="secondary" size="small" />} label="Organisation / Institution / Law Firm / NGO" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={regType === "Organisation" ? "Entity Name" : "Full Name"}
                name="name"
                value={form.name || ""}
                onChange={handleNameChange}
                error={Boolean(form.name && !isNameValid)}
                helperText={
                  form.name
                    ? isNameValid
                      ? "✓ Valid Name"
                      : "Min. 2 characters • English/Hindi letters only"
                    : "English, Hindi or Unicode letters"
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SearchableMasterSelect
                label="Organisation"
                category="Organisation"
                value={form.organisation || ""}
                customValue={form.customOrganisation || ""}
                onChange={(e) => handleChange({ target: { name: "organisation", value: e.target.value } })}
                onCustomValueChange={(val) => handleChange({ target: { name: "customOrganisation", value: val } })}
                options={[
                  "Supreme Court Bar Association (SCBA)",
                  "High Court Bar Association",
                  "District Bar Association",
                  "Bar Council of India",
                  "ICAI - Institute of Chartered Accountants",
                  "ICSI - Institute of Company Secretaries",
                  "Indian Legal Service",
                  "Corporate Law Chamber",
                  "Independent Law Practice",
                ]}
                placeholder="Search organisation..."
                helperText="Firm, bar council or institution"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Designations"
                name="designations"
                placeholder="e.g. Senior Partner, Standing Counsel"
                value={form.designations || ""}
                onChange={handleChange}
                helperText="Comma separated for multiple roles"
              />
            </Grid>
          </Grid>
        </Box>

        {/* SECTION 2: COMMUNICATION */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ mb: 1.5, pb: 0.5, borderBottom: "1px solid #e0e0e0" }}>
            SECTION 2 — Communication
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={1}>
                <Grid item xs={5}>
                  <SearchableCountrySelect
                    label="Country"
                    value={mobileCountryCode}
                    onChange={(c) => handleChange({ target: { name: "mobileCountryCode", value: c.code } })}
                  />
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    name="mobile"
                    placeholder={mobCfg.placeholder}
                    value={form.mobile || ""}
                    onChange={(e) => handleDigitsOnlyChange(e, mobCfg.maxDigits)}
                    error={Boolean(form.mobile && !isMobileValid)}
                    helperText={
                      form.mobile
                        ? isMobileValid
                          ? `✓ Valid Mobile • ${mobCfg.country} (${mobCfg.code})`
                          : mobCfg.minDigits === mobCfg.maxDigits
                            ? `Must contain exactly ${mobCfg.maxDigits} digits`
                            : `Must contain ${mobCfg.minDigits}–${mobCfg.maxDigits} digits`
                        : `${mobCfg.minDigits === mobCfg.maxDigits ? `${mobCfg.maxDigits} digits` : `${mobCfg.minDigits}–${mobCfg.maxDigits} digits`} • ${mobCfg.country} (${mobCfg.code})`
                    }
                    inputProps={{ maxLength: mobCfg.maxDigits }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={1}>
                <Grid item xs={5}>
                  <SearchableCountrySelect
                    label="Country"
                    value={waCountryCode}
                    onChange={(c) => handleChange({ target: { name: "waCountryCode", value: c.code } })}
                  />
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    fullWidth
                    label="WhatsApp"
                    name="whatsapp"
                    placeholder={waCfg.placeholder}
                    value={form.whatsapp || ""}
                    onChange={(e) => handleDigitsOnlyChange(e, waCfg.maxDigits)}
                    error={Boolean(form.whatsapp && !isWaValid)}
                    helperText={
                      form.whatsapp
                        ? isWaValid
                          ? `✓ Valid WhatsApp • ${waCfg.country} (${waCfg.code})`
                          : waCfg.minDigits === waCfg.maxDigits
                            ? `Must contain exactly ${waCfg.maxDigits} digits`
                            : `Must contain ${waCfg.minDigits}–${waCfg.maxDigits} digits`
                        : `${waCfg.minDigits === waCfg.maxDigits ? `${waCfg.maxDigits} digits` : `${waCfg.minDigits}–${waCfg.maxDigits} digits`} • ${waCfg.country} (${waCfg.code})`
                    }
                    inputProps={{ maxLength: waCfg.maxDigits }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={form.email || ""}
                onChange={handleEmailChange}
                error={Boolean(form.email && !isEmailValid)}
                helperText={
                  form.email
                    ? isEmailValid
                      ? "✓ Valid Email"
                      : "Invalid email format"
                    : "RFC 5322 compliant email"
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="OTP Channel"
                name="otpChannel"
                value={form.otpChannel || "SMS"}
                onChange={handleChange}
                helperText="Channel for verification OTPs"
              >
                <MenuItem value="SMS">📱 SMS Gateway</MenuItem>
                <MenuItem value="WhatsApp">💬 WhatsApp API</MenuItem>
                <MenuItem value="Email">📧 Email OTP</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* SECTION 3: IDENTITY VERIFICATION */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ mb: 1.5, pb: 0.5, borderBottom: "1px solid #e0e0e0" }}>
            SECTION 3 — Identity Verification
          </Typography>
          <Grid container spacing={2.5}>
            {regType === "Individual" && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Aadhaar"
                  name="aadhaar"
                  value={form.aadhaar || ""}
                  onChange={(e) => handleDigitsOnlyChange(e, 12)}
                  error={Boolean(form.aadhaar && !isAadhaarValid)}
                  helperText={
                    form.aadhaar
                      ? isAadhaarValid
                        ? "✓ Valid Aadhaar"
                        : "Must be exactly 12 digits"
                      : "12 numeric digits"
                  }
                  inputProps={{ maxLength: 12 }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="PAN"
                name="pan"
                value={form.pan || ""}
                onChange={handlePANChange}
                error={Boolean(form.pan && !isPANValid)}
                helperText={
                  form.pan
                    ? isPANValid
                      ? "✓ Valid PAN"
                      : "Must match format ABCDE1234F"
                    : "ABCDE1234F format"
                }
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* SECTION 4: PROFESSIONAL INFORMATION */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ mb: 1.5, pb: 0.5, borderBottom: "1px solid #e0e0e0" }}>
            SECTION 4 — Professional Information
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Profession"
                name="profession"
                value={form.profession || ""}
                onChange={handleChange}
                error={Boolean(form.profession && !isProfessionValid)}
                helperText="Select category & profession"
              >
                <ListSubheader sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "#fff", lineHeight: "36px" }}>
                  {PROFESSIONAL_CLASSIFICATION.LEGAL.label}
                </ListSubheader>
                {Object.entries(PROFESSIONAL_CLASSIFICATION.LEGAL.categories).map(([subCat, items]) => [
                  <ListSubheader key={subCat} sx={{ fontWeight: "bold", color: "primary.main", bgcolor: "action.hover" }}>
                    ── {subCat} ──
                  </ListSubheader>,
                  ...items.map((item) => (
                    <MenuItem key={item} value={item} sx={{ pl: 4 }}>
                      {item}
                    </MenuItem>
                  )),
                ])}

                <ListSubheader sx={{ fontWeight: "bold", bgcolor: "secondary.main", color: "#fff", lineHeight: "36px", mt: 1 }}>
                  {PROFESSIONAL_CLASSIFICATION.NON_LEGAL.label}
                </ListSubheader>
                {Object.entries(PROFESSIONAL_CLASSIFICATION.NON_LEGAL.categories).map(([subCat, items]) => [
                  <ListSubheader key={subCat} sx={{ fontWeight: "bold", color: "secondary.main", bgcolor: "action.hover" }}>
                    ── {subCat} ──
                  </ListSubheader>,
                  ...items.map((item) => (
                    <MenuItem key={item} value={item} sx={{ pl: 4 }}>
                      {item}
                    </MenuItem>
                  )),
                ])}

                <ListSubheader sx={{ fontWeight: "bold", color: "warning.main", bgcolor: "action.hover", mt: 1 }}>
                  ── Custom (other) ──
                </ListSubheader>
                {CUSTOM_PROFESSION_TRIGGERS.map((trigger) => (
                  <MenuItem key={trigger} value={trigger} sx={{ pl: 4, fontWeight: "bold" }}>
                    {trigger} (Custom Entry)
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {isCustomSelected && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Custom Profession"
                  name="customProfession"
                  placeholder="e.g. Senior Tax Consultant"
                  value={form.customProfession || ""}
                  onChange={handleChange}
                  error={Boolean(!form.customProfession || !form.customProfession.trim())}
                  helperText="Subject to admin approval"
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <SearchableMasterSelect
                label="Practice Area"
                category="Practice Area"
                value={form.practiceAreas || ""}
                customValue={form.customPracticeArea || ""}
                onChange={(e) => handleChange({ target: { name: "practiceAreas", value: e.target.value } })}
                onCustomValueChange={(val) => handleChange({ target: { name: "customPracticeArea", value: val } })}
                options={[
                  "Constitutional Law",
                  "Criminal Litigation",
                  "Civil & Commercial Litigation",
                  "Corporate & M&A",
                  "Taxation & GST",
                  "Intellectual Property (IPR)",
                  "Arbitration & ADR",
                  "Family & Matrimonial Law",
                  "Labor & Employment Law",
                  "Banking & Insolvency (IBC)",
                  "Cyber Law & Data Privacy",
                ]}
                placeholder="Search practice area..."
                helperText="Search or select practice area"
              />
            </Grid>
          </Grid>
        </Box>

        {/* SECTION 5: ADDRESS */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ mb: 1.5, pb: 0.5, borderBottom: "1px solid #e0e0e0" }}>
            SECTION 5 — Address
          </Typography>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Address"
                name="address"
                placeholder="House/Office, street, chamber details..."
                value={form.address || ""}
                onChange={handleChange}
                helperText="House/Office, street, chamber details"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Landmark"
                name="landmark"
                placeholder="e.g. High Court Gate 3"
                value={form.landmark || ""}
                onChange={handleChange}
                helperText="Locality or nearby landmark"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <SearchableMasterSelect
                label="State"
                category="State"
                value={form.state || "Delhi"}
                customValue={form.customState || ""}
                onChange={(e) => handleChange({ target: { name: "state", value: e.target.value } })}
                onCustomValueChange={(val) => handleChange({ target: { name: "customState", value: val } })}
                options={STATES_LIST}
                placeholder="Search State..."
                helperText="Select State or UT"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <SearchableMasterSelect
                label="District"
                category="District"
                value={form.district || ""}
                customValue={form.customDistrict || ""}
                onChange={(e) => handleChange({ target: { name: "district", value: e.target.value } })}
                onCustomValueChange={(val) => handleChange({ target: { name: "customDistrict", value: val } })}
                options={["New Delhi", "Central Delhi", "South Delhi", "Mumbai City", "Bengaluru Urban", "Lucknow", "Chennai", "Kolkata"]}
                placeholder="Search District..."
                helperText="Select District"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <SearchableMasterSelect
                label="City"
                category="City"
                value={form.city || ""}
                customValue={form.customCity || ""}
                onChange={(e) => handleChange({ target: { name: "city", value: e.target.value } })}
                onCustomValueChange={(val) => handleChange({ target: { name: "customCity", value: val } })}
                options={["New Delhi", "Mumbai", "Bengaluru", "Lucknow", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Hyderabad"]}
                placeholder="Search City..."
                helperText="Select City"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="PIN Code"
                name="pincode"
                value={form.pincode || ""}
                onChange={(e) => handleDigitsOnlyChange(e, 6)}
                error={Boolean(form.pincode && !isPincodeValid)}
                helperText={
                  form.pincode
                    ? isPincodeValid
                      ? "✓ Valid PIN Code"
                      : "Must be exactly 6 digits"
                    : "6 numeric digits"
                }
                inputProps={{ maxLength: 6 }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* SECTION 6: ADDITIONAL DETAILS */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ mb: 1.5, pb: 0.5, borderBottom: "1px solid #e0e0e0" }}>
            SECTION 6 — Additional Details
          </Typography>
          <Grid container spacing={2.5}>
            {regType === "Individual" && (
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={form.gender || "Male"}
                  onChange={handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
            )}

            {regType === "Individual" && (
              <Grid item xs={12} md={4}>
                {(() => {
                  const yr = parseInt(form.birthYear, 10);
                  const isUnderAge = yr > maxYr;
                  const isInvalidYr = form.birthYear && (isNaN(yr) || yr < 1900 || String(form.birthYear).length !== 4);
                  const isError = Boolean(isUnderAge || isInvalidYr);

                  let helperMsg = `Min. 18 years • Max Year: ${maxYr}`;
                  if (isUnderAge) {
                    helperMsg = `Ineligible: Must be at least 18 years old`;
                  } else if (isInvalidYr) {
                    helperMsg = `Enter valid 4-digit year (1900–${maxYr})`;
                  } else if (yr >= 1900 && yr <= maxYr) {
                    helperMsg = `✓ Age: ${currentYr - yr} Years`;
                  }

                  return (
                    <TextField
                      fullWidth
                      label="Birth Year"
                      name="birthYear"
                      placeholder="e.g. 1995"
                      value={form.birthYear || ""}
                      onChange={(e) => handleDigitsOnlyChange(e, 4)}
                      error={isError}
                      helperText={helperMsg}
                      inputProps={{ maxLength: 4 }}
                    />
                  );
                })()}
              </Grid>
            )}

            <Grid item xs={12} md={4}>
              <Grid container spacing={1}>
                <Grid item xs={5}>
                  <SearchableCountrySelect
                    label="Country"
                    value={emergencyCountryCode}
                    onChange={(c) => handleChange({ target: { name: "emergencyCountryCode", value: c.code } })}
                  />
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    name="emergencyContact"
                    placeholder={emgCfg.placeholder}
                    value={form.emergencyContact || ""}
                    onChange={(e) => handleDigitsOnlyChange(e, emgCfg.maxDigits)}
                    error={Boolean(form.emergencyContact && !isEmergencyValid)}
                    helperText={
                      form.emergencyContact
                        ? isEmergencyValid
                          ? `✓ Valid Contact • ${emgCfg.country} (${emgCfg.code})`
                          : emgCfg.minDigits === emgCfg.maxDigits
                            ? `Must contain exactly ${emgCfg.maxDigits} digits`
                            : `Must contain ${emgCfg.minDigits}–${emgCfg.maxDigits} digits`
                        : `${emgCfg.minDigits === emgCfg.maxDigits ? `${emgCfg.maxDigits} digits` : `${emgCfg.minDigits}–${emgCfg.maxDigits} digits`} • ${emgCfg.country} (${emgCfg.code})`
                    }
                    inputProps={{ maxLength: emgCfg.maxDigits }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* DOCUMENT CHECKLIST & SUBMISSION */}
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.secondary">
                  Document Checklist
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label="Photo Attached" color="primary" variant="outlined" size="small" />
                  <Chip label="Digital Signature" color="primary" variant="outlined" size="small" />
                  <Chip label="Aadhaar Verified" color="success" variant="outlined" size="small" />
                  <Chip label="PAN Verified" color="success" variant="outlined" size="small" />
                  <Chip label="Bar Certificate" color="secondary" variant="outlined" size="small" />
                  <Chip label="GST / CIN" color="info" variant="outlined" size="small" />
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(form.policyAccepted)}
                    onChange={(e) => handleChange({ target: { name: "policyAccepted", value: e.target.checked } })}
                    color="primary"
                  />
                }
                label="I verify that all details are accurate and accept the ICJ Master Policy & Terms."
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={saveMember}
                disabled={!isFormValid || !form.policyAccepted}
                sx={{ py: 1.5, fontWeight: "bold", borderRadius: 2 }}
              >
                {isFormValid && form.policyAccepted
                  ? "Register Member"
                  : "Complete Required Fields"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Paper>
  );
}