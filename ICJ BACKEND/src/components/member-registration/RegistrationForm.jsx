import { useState } from "react";
import {
  Box,
  Typography,
  Alert,
  Button,
  Paper,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import MemberForm from "../membership/MemberForm";
import PasswordField from "../auth/PasswordField";
import { MemberService } from "../../services/memberService";
import MasterDataService from "../../services/masterDataService";

const STAGES = [
  "Policy Acceptance",
  "Quick Registration",
  "Personal & Identity",
  "Address & Organisation",
  "Documents & Verification",
];

const POLICIES_LIST = [
  {
    key: "membership_policy",
    title: "Membership Policy",
    content: "The ICJ Enterprise Membership Policy governs member rights, responsibilities, eligibility criteria, code of ethics, and continuous compliance obligations across all legal, revenue, finance, and professional cadres.",
  },
  {
    key: "privacy_policy",
    title: "Privacy Policy",
    content: "This Privacy Policy details how Indian Council of Jurists (ICJ) collects, stores, protects, and processes member personal, identity, and location data in compliance with Government of India Information Technology regulations.",
  },
  {
    key: "terms_conditions",
    title: "Terms & Conditions",
    content: "By registering on the ICJ Enterprise Platform, members agree to adhere to all terms of usage, platform security rules, service delivery protocols, and administrative guidelines issued by ICJ governing authorities.",
  },
  {
    key: "code_of_conduct",
    title: "Code of Conduct",
    content: "Members are expected to uphold the highest standards of professional integrity, ethical behavior, truthfulness in documentation, and respectful representation of ICJ enterprise initiatives.",
  },
  {
    key: "data_processing",
    title: "Data Processing Consent",
    content: "Consent is hereby granted for automated and manual verification of identity documents, address hierarchy records, professional accreditation, and administrative role assignments.",
  },
  {
    key: "ai_usage_policy",
    title: "AI Usage Policy",
    content: "ICJ Enterprise Platform utilizes AI-assisted processing, automated validation algorithms, and smart search indexing to streamline member onboarding, document indexing, and workflow routing.",
  },
  {
    key: "doc_verification_policy",
    title: "Document Verification Policy",
    content: "All submitted identity documents, professional certificates, and registration credentials are subject to multi-tier verification by authorized ICJ review officers and regulatory authorities.",
  },
];

const defaultFormData = {
  name: "",
  mobile: "",
  mobile_country_code: "+91",
  whatsapp: "",
  whatsapp_country_code: "+91",
  email: "",
  password: "",
  confirmPassword: "",
  service_role: "receive",
  need_services: "receive",
  provide_services: "no",
  member_type: "Individual",
  profession: "",
  organisation: "",
  designation: "",
  birth_year: "",
  dob: "",
  age: "",
  gender: "",
  aadhar: "",
  pan: "",
  address_line1: "",
  address_line2: "",
  landmark: "",
  country: "India",
  city: "",
  district: "",
  state: "",
  locality: "",
  post_office: "",
  pincode: "",
  postal_code: "",
  experience: "",
  verification_status: "Not Verified",
  member_level: "BASIC",
  remarks: "",
  user_id: "",
  member_id: "",
  status: "Pending Profile Completion",
};

export default function RegistrationForm() {
  const [stage, setStage] = useState(0); // Stage 0 = Policy Acceptance Screen
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Policy Acceptance Declarations
  const [policyDeclarations, setPolicyDeclarations] = useState({
    readAndAccepted: false,
    mayChangeNotice: false,
    responsibilityToRead: false,
    consentElectronicRecords: false,
  });

  // Policy Modal Viewer
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const professionsList = MasterDataService.getProfessions();

  const allDeclarationsChecked =
    policyDeclarations.readAndAccepted &&
    policyDeclarations.mayChangeNotice &&
    policyDeclarations.responsibilityToRead &&
    policyDeclarations.consentElectronicRecords;

  const handleDeclarationChange = (event) => {
    const { name, checked } = event.target;
    setPolicyDeclarations((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDownloadPolicyPdf = (policy) => {
    const content = `==================================================\nINDIAN COUNCIL OF JURISTS (ICJ) ENTERPRISE PLATFORM\nPOLICY DOCUMENT: ${policy.title.toUpperCase()}\n==================================================\n\n${policy.content}\n\nGenerated Date: ${new Date().toLocaleString("en-IN")}\nICJ Enterprise Platform Compliance Bureau`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ICJ_${policy.key}_Policy.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePolicyAcceptanceSubmit = () => {
    if (!allDeclarationsChecked) {
      setErrorMessage("You must accept all mandatory policy declarations before proceeding.");
      return;
    }
    setErrorMessage("");
    setStage(1); // Proceed to Stage 1: Quick Registration
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "mobile" || name === "whatsapp") {
      const digits = String(value || "").replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    if (name === "service_role") {
      let need_services = "none";
      let provide_services = "no";
      if (value === "receive") need_services = "receive";
      if (value === "provide") provide_services = "yes";
      if (value === "both") {
        need_services = "receive";
        provide_services = "yes";
      }
      setFormData((prev) => ({
        ...prev,
        service_role: value,
        need_services,
        provide_services,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateQuickRegistration = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    const digitsOnly = /^\d+$/;

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return false;
    }
    if (!formData.profession || !formData.profession.trim()) {
      setErrorMessage("Please select or search your profession.");
      return false;
    }
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setErrorMessage("Please enter a valid email address (e.g. user@domain.com).");
      return false;
    }
    if (!formData.mobile.trim() || !digitsOnly.test(formData.mobile)) {
      setErrorMessage("Mobile number must contain digits only.");
      return false;
    }
    if ((formData.mobile_country_code || "+91") === "+91" && formData.mobile.length !== 10) {
      setErrorMessage("Indian mobile number (+91) must be exactly 10 digits.");
      return false;
    }
    if (!formData.whatsapp.trim() || !digitsOnly.test(formData.whatsapp)) {
      setErrorMessage("WhatsApp number must contain digits only.");
      return false;
    }
    if ((formData.whatsapp_country_code || "+91") === "+91" && formData.whatsapp.length !== 10) {
      setErrorMessage("Indian WhatsApp number (+91) must be exactly 10 digits.");
      return false;
    }
    if (!formData.password) {
      setErrorMessage("Please enter a password.");
      return false;
    }
    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Password and Confirm Password do not match.");
      return false;
    }
    if (!formData.service_role) {
      setErrorMessage("Please select a Service Role option.");
      return false;
    }
    return true;
  };

  const handleQuickRegisterSubmit = async (event) => {
    if (event) event.preventDefault();
    if (!validateQuickRegistration()) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const generatedUserId = `USR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedTempMemberId = `TEMP-ICJ-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      const payload = {
        ...formData,
        user_id: generatedUserId,
        member_id: generatedTempMemberId,
        status: "Pending Profile Completion",
      };

      const createdMember = await MemberService.create(payload);
      setFormData((prev) => ({
        ...prev,
        id: createdMember.id || createdMember.member_id || generatedTempMemberId,
        user_id: generatedUserId,
        member_id: generatedTempMemberId,
        status: "Pending Profile Completion",
      }));

      setSuccessMessage(
        `Account instantiated! User ID: ${generatedUserId} | Temp Member ID: ${generatedTempMemberId}. Navigating directly to Stage 2...`
      );

      setStage(2);
    } catch (error) {
      setErrorMessage(error?.message || "Unable to complete Quick Registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateStage2 = () => {
    const birthYearStr = String(formData.birth_year || formData.dob || "").trim();
    if (!birthYearStr || birthYearStr.length !== 4) {
      setErrorMessage("Please enter a valid 4-digit Birth Year (e.g. 1990).");
      return false;
    }
    const yearNum = Number(birthYearStr);
    const currentYear = new Date().getFullYear();
    if (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
      setErrorMessage(`Birth Year must be between 1900 and ${currentYear}.`);
      return false;
    }
    if (!formData.gender) {
      setErrorMessage("Please select Gender.");
      return false;
    }
    if (formData.aadhar && String(formData.aadhar).length !== 12) {
      setErrorMessage("Aadhaar Number must be exactly 12 digits.");
      return false;
    }
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(String(formData.pan).toUpperCase())) {
      setErrorMessage("PAN Number format must be valid (e.g. ABCDE1234F).");
      return false;
    }
    return true;
  };

  const handleStageCompletion = async (nextStage) => {
    setErrorMessage("");
    if (stage === 2 && nextStage === 3) {
      if (!validateStage2()) return;
    }
    setLoading(true);
    try {
      const finalStatus = nextStage > 4 ? "Pending Verification" : "Pending Profile Completion";
      const updatedPayload = {
        ...formData,
        status: finalStatus,
      };

      if (formData.id) {
        await MemberService.update(formData.id, updatedPayload);
      }

      if (nextStage > 4) {
        setSuccessMessage("All registration stages completed! Membership application submitted for verification.");
        setStage(4);
      } else {
        setStage(nextStage);
        setSuccessMessage(`Stage ${stage} saved successfully. Continuing to Stage ${nextStage}...`);
      }
    } catch (err) {
      setErrorMessage(err?.message || "Unable to save stage details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 980, mx: "auto" }}>
      <Typography variant="h4" fontWeight="bold" mb={1} color="primary">
        ICJ Member Registration Portal
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Official Enterprise Onboarding Suite (Government / NIC Standards)
      </Typography>

      {/* Unified Progress Indicator */}
      <Stepper activeStep={stage} sx={{ mb: 4 }} alternativeLabel>
        {STAGES.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {errorMessage && <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

      {/* STAGE 0: MANDATORY POLICY ACCEPTANCE SCREEN */}
      {stage === 0 && (
        <Paper sx={{ p: 4, borderRadius: 3 }} variant="outlined">
          <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
            Mandatory ICJ Enterprise Policy Acceptance
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Please review all official ICJ policies and check each mandatory declaration below before initializing registration.
          </Typography>

          {/* Policy List Grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {POLICIES_LIST.map((policy) => (
              <Grid item xs={12} sm={6} md={4} key={policy.key}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main">
                    {policy.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ height: 42, overflow: "hidden", mb: 1.5 }}>
                    {policy.content}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => setSelectedPolicy(policy)}>
                      View
                    </Button>
                    <Button size="small" variant="text" onClick={() => handleDownloadPolicyPdf(policy)}>
                      Download PDF
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Mandatory Checkbox Declarations */}
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="error.main">
            Mandatory Declarations (All 4 Checkboxes Required):
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="readAndAccepted"
                  checked={policyDeclarations.readAndAccepted}
                  onChange={handleDeclarationChange}
                  color="primary"
                />
              }
              label={<Typography variant="body2">I have read, understood and accepted all ICJ Policies.</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="mayChangeNotice"
                  checked={policyDeclarations.mayChangeNotice}
                  onChange={handleDeclarationChange}
                  color="primary"
                />
              }
              label={<Typography variant="body2">I understand that ICJ Policies may change from time to time.</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="responsibilityToRead"
                  checked={policyDeclarations.responsibilityToRead}
                  onChange={handleDeclarationChange}
                  color="primary"
                />
              }
              label={<Typography variant="body2">It is my responsibility to read every updated policy whenever I login.</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="consentElectronicRecords"
                  checked={policyDeclarations.consentElectronicRecords}
                  onChange={handleDeclarationChange}
                  color="primary"
                />
              }
              label={<Typography variant="body2">I consent to electronic records, AI-assisted processing and digital communication.</Typography>}
            />
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setPolicyDeclarations({
                  readAndAccepted: false,
                  mayChangeNotice: false,
                  responsibilityToRead: false,
                  consentElectronicRecords: false,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={!allDeclarationsChecked}
              onClick={handlePolicyAcceptanceSubmit}
            >
              Accept & Continue
            </Button>
          </Stack>
        </Paper>
      )}

      {/* STAGE 1: QUICK REGISTRATION UI */}
      {stage === 1 && (
        <Paper sx={{ p: 4, borderRadius: 3 }} variant="outlined">
          <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
            Stage 1 – Quick Registration
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter essential account credentials and service role preference to instantiate your ICJ Membership.
          </Typography>

          <Grid container spacing={3}>
            {/* ROW 1: Full Name & Profession (Large Width, Searchable Master Dropdown with Full Text) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={professionsList}
                getOptionLabel={(option) => String(option || "")}
                value={formData.profession || ""}
                onInputChange={(_, newInputValue) => {
                  handleChange({ target: { name: "profession", value: newInputValue || "" } });
                }}
                onChange={(_, newValue) => {
                  handleChange({ target: { name: "profession", value: newValue || "" } });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    label="Profession"
                    name="profession"
                    placeholder="Search or select profession..."
                    sx={{ "& .MuiInputBase-input": { textOverflow: "ellipsis" } }}
                  />
                )}
              />
            </Grid>

            {/* ROW 2: Mobile Number & WhatsApp Number (+91 Country Code, Equal Width) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <TextField
                      select
                      variant="standard"
                      disableUnderline
                      name="mobile_country_code"
                      value={formData.mobile_country_code || "+91"}
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
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <TextField
                  fullWidth
                  required
                  label="WhatsApp Number"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <TextField
                        select
                        variant="standard"
                        disableUnderline
                        name="whatsapp_country_code"
                        value={formData.whatsapp_country_code || "+91"}
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
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(formData.whatsapp && formData.whatsapp === formData.mobile)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange({ target: { name: "whatsapp", value: formData.mobile || "" } });
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

            {/* ROW 3: Email Address (Full Width) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            {/* ROW 4: Password & Confirm Password (Same Row) */}
            <Grid item xs={12} md={6}>
              <PasswordField
                fullWidth
                required
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <PasswordField
                fullWidth
                required
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>

            {/* Mandatory Service Role Section */}
            <Grid item xs={12}>
              <FormControl component="fieldset" required sx={{ width: "100%", mt: 1 }}>
                <FormLabel component="legend" sx={{ fontWeight: 600, color: "primary.main", mb: 1 }}>
                  Service Role Requirement *
                </FormLabel>
                <RadioGroup
                  row
                  name="service_role"
                  value={formData.service_role || "receive"}
                  onChange={handleChange}
                >
                  <FormControlLabel value="receive" control={<Radio />} label="I Need Services" />
                  <FormControlLabel value="provide" control={<Radio />} label="I Want to Provide Services" />
                  <FormControlLabel value="both" control={<Radio />} label="Both (Need & Provide)" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                onClick={handleQuickRegisterSubmit}
              >
                {loading ? "Creating Account..." : "Create Account & Continue to Stage 2"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* STAGE 2 VIEW ONLY */}
      {stage === 2 && (
        <Paper sx={{ p: 4, borderRadius: 3 }} variant="outlined">
          <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
            Stage 2 – Personal Details & Identity
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Please complete your personal details, age computation, and identity proof information.
          </Typography>

          <MemberForm
            form={formData}
            handleChange={handleChange}
            onChange={handleChange}
            stage={2}
            hideSaveButton
          />

          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => setStage(1)}
            >
              Back to Stage 1
            </Button>

            <Button
              variant="contained"
              disabled={loading}
              onClick={() => handleStageCompletion(3)}
            >
              {loading ? "Saving Stage 2..." : "Continue to Stage 3"}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* STAGE 3 VIEW ONLY */}
      {stage === 3 && (
        <Paper sx={{ p: 4, borderRadius: 3 }} variant="outlined">
          <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
            Stage 3 – Address & Organisation Details
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Complete your official organization details and cascading address location hierarchy.
          </Typography>

          <MemberForm
            form={formData}
            onChange={handleChange}
            stage={3}
            hideSaveButton
          />

          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => setStage(2)}
            >
              Back to Stage 2
            </Button>

            <Button
              variant="contained"
              disabled={loading}
              onClick={() => handleStageCompletion(4)}
            >
              {loading ? "Saving Stage 3..." : "Continue to Stage 4"}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* STAGE 4 VIEW ONLY */}
      {stage === 4 && (
        <Paper sx={{ p: 4, borderRadius: 3 }} variant="outlined">
          <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
            Stage 4 – Documents & Final Verification
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Upload required photo, signature, and verification documents to complete onboarding.
          </Typography>

          <MemberForm
            form={formData}
            onChange={handleChange}
            stage={4}
            hideSaveButton
          />

          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => setStage(3)}
            >
              Back to Stage 3
            </Button>

            <Button
              variant="contained"
              color="success"
              disabled={loading}
              onClick={() => handleStageCompletion(5)}
            >
              {loading ? "Submitting Registration..." : "Submit Registration for Verification"}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* POLICY MODAL DIALOG */}
      <Dialog
        open={Boolean(selectedPolicy)}
        onClose={() => setSelectedPolicy(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle fontWeight="bold" color="primary">
          {selectedPolicy?.title}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph style={{ whiteSpace: "pre-line" }}>
            {selectedPolicy?.content}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Official Policy Document of Indian Council of Jurists (ICJ) Enterprise Platform.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPolicy(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedPolicy) handleDownloadPolicyPdf(selectedPolicy);
            }}
          >
            Download Text PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
