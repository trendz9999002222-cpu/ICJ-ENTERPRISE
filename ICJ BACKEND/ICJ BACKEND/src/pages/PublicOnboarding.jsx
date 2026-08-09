import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Stack,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AssignmentLateIcon  from "@mui/icons-material/AssignmentLate";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import HandshakeIcon       from "@mui/icons-material/Handshake";
import VerifiedUserIcon    from "@mui/icons-material/VerifiedUser";
import DownloadIcon        from "@mui/icons-material/Download";
import ArrowForwardIcon    from "@mui/icons-material/ArrowForward";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton     from "@mui/material/IconButton";
import Visibility     from "@mui/icons-material/Visibility";
import VisibilityOff  from "@mui/icons-material/VisibilityOff";
import LockIcon       from "@mui/icons-material/Lock";
import SecurityIcon   from "@mui/icons-material/Security";

import FieldGovernanceService from "../services/fieldGovernanceService.js";
import MemberService, { generateMemberId } from "../services/memberService";
import AuthService from "../services/authService";
import PasswordPolicyService from "../services/passwordPolicyService";
import PhoneCodeSelect from "../components/common/PhoneCodeSelect";
import { validatePhoneNumber, getCountryByCodeOrIso } from "../data/internationalPhoneMaster";

// ─── PURPOSE MASTER ───────────────────────────────────────────────────────────

const PURPOSE_OPTIONS = [
  {
    value: "PROBLEM",
    label: "Your Problem, Our Solution.",
    icon: AssignmentLateIcon,
    color: "#d32f2f",
    bg:    "#fff5f5",
    selectedBg: "#ffebee",
  },
  {
    value: "SERVICES",
    label: "ICJ, The Solution World.",
    icon: MiscellaneousServicesIcon,
    color: "#1565c0",
    bg:    "#f5f8ff",
    selectedBg: "#e3f2fd",
  },
  {
    value: "FRANCHISE",
    label: "Become an ICJ Franchisee Partner.",
    icon: HandshakeIcon,
    color: "#2e7d32",
    bg:    "#f5fff5",
    selectedBg: "#e8f5e9",
  },
];

const PROBLEM_CATEGORIES = [
  "Legal Dispute",
  "Criminal Matter",
  "Harassment / Domestic Violence",
  "Property / Real Estate",
  "Consumer Complaint",
  "Labour / Employment Issue",
  "Family Law / Divorce",
  "Cyber Crime / Fraud",
  "Other Legal Matter",
];

const SERVICE_CATEGORIES = [
  "Legal Consultation",
  "Arbitration / Mediation",
  "Contract Drafting & Review",
  "Documentation Services",
  "Legal Audit",
  "Notarisation / Attestation",
  "Court Representation",
  "Other ICJ Service",
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function PublicOnboarding() {
  const navigate = useNavigate();

  // Tech Showcase & Privacy Modal State
  const [techShowcaseOpen, setTechShowcaseOpen] = useState(false);

  // ─── Form State ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    regType:          "Individual",
    namePrefix:       "",
    firstName:        "",
    middleName:       "",
    lastName:         "",
    orgName:          "",
    gender:           "",
    dob:              "",
    birthYear:        "",
    age:              "",
    mobile:           "",
    mobileCountryCode: "+91",
    whatsapp:         "",
    waCountryCode:    "+91",
    email:            "",
    password:         "",
    confirmPassword:  "",
    purpose:          "",          // "PROBLEM" | "SERVICES" | "FRANCHISE"
    problemCategory:  "",
    serviceCategory:  "",
    franchiseCity:    "",
    franchiseMsg:     "",
    termsAccepted:    false,
  });

  // ─── UI State ────────────────────────────────────────────────────────────
  const [stage,        setStage]        = useState("FORM");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode,      setOtpCode]      = useState("123456");
  const [otpChannel,   setOtpChannel]   = useState("SMS");
  const [createdMember,setCreatedMember]= useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── Phone config (for maxDigits / placeholder) ──────────────────────────
  const mobCfg = useMemo(() => getCountryByCodeOrIso(form.mobileCountryCode), [form.mobileCountryCode]);
  const waCfg  = useMemo(() => getCountryByCodeOrIso(form.waCountryCode),    [form.waCountryCode]);

  // ─── Derived full name ───────────────────────────────────────────────────
  const fullName = useMemo(() => {
    if (form.regType === "Organisation") return (form.orgName || "").trim();
    const parts = [form.firstName, form.middleName, form.lastName]
      .map((s) => (s || "").trim()).filter(Boolean).join(" ");
    return form.namePrefix ? `${form.namePrefix} ${parts}` : parts;
  }, [form.regType, form.namePrefix, form.firstName, form.middleName, form.lastName, form.orgName]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const maxDobDate = useMemo(() => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split("T")[0];
  }, []);

  const handleDobChange = (e) => {
    const dobVal = e.target.value;
    let birthYearVal = "";
    let ageVal = "";
    let errorMsg = "";

    if (dobVal) {
      const dobDate = new Date(dobVal);
      if (!isNaN(dobDate.getTime())) {
        birthYearVal = String(dobDate.getFullYear());
        const today = new Date();
        let calculatedAge = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge >= 0) ageVal = String(calculatedAge);
        if (calculatedAge < 18) {
          errorMsg = "Must be at least 18 years of age";
        }
      }
    }

    setForm((prev) => ({
      ...prev,
      dob: dobVal,
      birthYear: birthYearVal,
      age: ageVal,
      dobError: errorMsg,
    }));
  };

  const handleRegTypeChange = (e) => {
    setForm((prev) => ({
      ...prev,
      regType:   e.target.value,
      namePrefix: "", firstName: "", middleName: "", lastName: "", orgName: "",
      gender: "", dob: "", birthYear: "", age: "", dobError: "",
      mobile:    "", whatsapp:   "", password: "", confirmPassword: "",
    }));
  };

  const handlePhoneInput = (e, fieldName, maxLen) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    setForm((prev) => ({ ...prev, [fieldName]: digits }));
  };

  const handlePurposeSelect = (value) => {
    setForm((prev) => ({
      ...prev,
      purpose:         value,
      problemCategory: "",
      serviceCategory: "",
      franchiseCity:   "",
      franchiseMsg:    "",
    }));
  };

  // ─── Validation ──────────────────────────────────────────────────────────
  const isNameValid = useMemo(() => {
    if (form.regType === "Individual") {
      return (form.firstName || "").trim().length >= 1 &&
             (form.lastName  || "").trim().length >= 1;
    }
    return (form.orgName || "").trim().length >= 2;
  }, [form.regType, form.firstName, form.lastName, form.orgName]);

  const isAgeValid = useMemo(() => {
    if (form.regType !== "Individual") return true;
    if (!form.dob || !form.age) return false;
    return Number(form.age) >= 18 && !form.dobError;
  }, [form.regType, form.dob, form.age, form.dobError]);

  const isEmailValid = useMemo(() =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test((form.email || "").trim()),
    [form.email]
  );

  const isMobileValid = useMemo(() =>
    validatePhoneNumber(form.mobileCountryCode, form.mobile || "").isValid,
    [form.mobile, form.mobileCountryCode]
  );

  const isWaValid = useMemo(() => {
    const wa = (form.whatsapp || "").trim();
    if (!wa) return true;
    return validatePhoneNumber(form.waCountryCode, wa).isValid;
  }, [form.whatsapp, form.waCountryCode]);

  const isPasswordValid = useMemo(() => (form.password || "").length >= 6, [form.password]);

  const doPasswordsMatch = useMemo(
    () => Boolean(form.password && form.password === form.confirmPassword),
    [form.password, form.confirmPassword]
  );

  const isPurposeValid = useMemo(() => {
    if (!form.purpose) return false;
    if (form.purpose === "PROBLEM")   return Boolean(form.problemCategory);
    if (form.purpose === "SERVICES")  return Boolean(form.serviceCategory);
    if (form.purpose === "FRANCHISE") return (form.franchiseCity || "").trim().length >= 2;
    return false;
  }, [form.purpose, form.problemCategory, form.serviceCategory, form.franchiseCity]);

  const isFormValid =
    isNameValid && isAgeValid && isEmailValid && isMobileValid && isWaValid &&
    isPasswordValid && doPasswordsMatch && isPurposeValid && form.termsAccepted;

  // ─── Submission ──────────────────────────────────────────────────────────
  const handleContinueClick = () => { if (isFormValid) setOtpModalOpen(true); };

  const handleVerifyAndSubmit = async () => {
    setSubmitting(true);
    try {
      const existingList = await MemberService.getAll();
      const permanentMemberId = generateMemberId(existingList);

      const purposeLabel = PURPOSE_OPTIONS.find((p) => p.value === form.purpose)?.label || form.purpose;

      const passwordHash = PasswordPolicyService.hashPassword(form.password);

      const payload = {
        id: permanentMemberId, member_id: permanentMemberId, memberId: permanentMemberId,
        username: permanentMemberId, password: form.password, passwordHash,
        namePrefix: form.namePrefix,
        name: fullName, fullName, firstName: form.firstName, middleName: form.middleName,
        lastName: form.lastName, orgName: form.orgName,
        gender:   form.gender,
        dob:      form.dob,
        birthYear: form.birthYear,
        birth_year: form.birthYear,
        age:      form.age,
        email:    form.email.trim(),
        mobile:   `${form.mobileCountryCode} ${form.mobile.trim()}`,
        whatsapp: form.whatsapp ? `${form.waCountryCode} ${form.whatsapp.trim()}` : "",
        memberType: form.regType.toLowerCase(), regType: form.regType,
        role: "member", user_type: "member", member_level: "BASIC",
        purpose:    purposeLabel,
        purposeCode: form.purpose,
        problemCategory:  form.problemCategory,
        serviceCategory:  form.serviceCategory,
        franchiseCity:    form.franchiseCity,
        franchiseMessage: form.franchiseMsg,
        verification_status: "Approved",
        status:         "Active",
        token_balance: 10,
        welcome_tokens_issued: 10,
        welcome_grant: true,
        email_verified: true,
        mobile_verified: true,
        ready_for_login: true,
        policyAccepted: form.termsAccepted,
        otpChannel,
        created_at: new Date().toISOString(),
      };

      const result = await MemberService.create(payload);
      const finalMember = result || payload;
      // Auto-authenticate newly onboarded member session into local storage
      AuthService.persistLocalUser(finalMember);
      setCreatedMember(finalMember);
      setOtpModalOpen(false);
      setStage("SUCCESS");
    } catch (err) {
      console.error("Public onboarding creation failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!createdMember) return;
    const content =
`INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)
PUBLIC MEMBER REGISTRATION ACKNOWLEDGEMENT
--------------------------------------------------
PERMANENT MEMBER ID : ${createdMember.member_id || createdMember.memberId}
APPLICANT NAME      : ${createdMember.name}
APPLICANT TYPE      : ${createdMember.regType || createdMember.memberType}
PRIMARY EMAIL       : ${createdMember.email}
MOBILE NUMBER       : ${createdMember.mobile}
PURPOSE             : ${createdMember.purpose}
REGISTRATION DATE   : ${new Date(createdMember.created_at).toLocaleString()}
VERIFICATION STATUS : ${createdMember.verification_status || "Pending Verification"}
--------------------------------------------------
Thank you for registering with ICJ Enterprise Platform.
`;
    const el = document.createElement("a");
    el.href  = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    el.download = `ICJ_REGISTRATION_${createdMember.member_id || "RECEIPT"}.txt`;
    document.body.appendChild(el); el.click(); document.body.removeChild(el);
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">

        {/* BRANDING HEADER */}
        <Paper elevation={0} sx={{
          p: 4, mb: 3, bgcolor: "#002855", color: "#fff",
          borderRadius: 3, textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,40,85,0.12)",
        }}>
          <Typography variant="overline" sx={{ letterSpacing: 2, color: "#90caf9", fontWeight: "bold" }}>
            INTERNATIONAL CONSORTIUM OF JURISTS
          </Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5, mb: 1 }}>
            JOIN / REGISTER WITH ICJ
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.85, maxWidth: 600, mx: "auto" }}>
            ICJ Enterprise Platform — Official Public Applicant Onboarding Portal
          </Typography>
        </Paper>

        {/* STAGE 1 : FORM */}
        {stage === "FORM" && (
          <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom
              sx={{ borderBottom: "2px solid", borderColor: "primary.main", pb: 1, mb: 3 }}>
              Applicant Basic Details
            </Typography>

            <Stack spacing={3.5}>

              {/* Applicant Type */}
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: "bold", fontSize: "0.9rem", mb: 0.5, color: "text.primary" }}>
                  Applicant Type *
                </FormLabel>
                <RadioGroup row name="regType" value={form.regType} onChange={handleRegTypeChange}>
                  <FormControlLabel value="Individual"   control={<Radio color="primary"   />} label={FieldGovernanceService.getWording("onboarding_ind_label", "Individual Member")} />
                  <FormControlLabel value="Organisation" control={<Radio color="secondary" />} label={FieldGovernanceService.getWording("onboarding_org_label", "Organisation / Entity / Institution")} />
                </RadioGroup>
              </FormControl>

              {/* ROW 1 — NAME & DEMOGRAPHICS */}
              <Box>
                <Typography variant="caption" color="text.secondary"
                  sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, mb: 1, display: "block" }}>
                  Name & Demographics
                </Typography>
                {form.regType === "Individual" ? (
                  <Stack spacing={2}>
                    {/* ROW 1: TITLE (EXPANDED), FIRST NAME, MIDDLE NAME, LAST NAME — ALL IN ONE LINE */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={2.5}>
                        <TextField
                          select fullWidth
                          label="Title"
                          name="namePrefix"
                          value={form.namePrefix}
                          onChange={handleChange}
                          SelectProps={{ style: { fontWeight: "bold" } }}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="Mr.">Mr.</MenuItem>
                          <MenuItem value="Mrs.">Mrs.</MenuItem>
                          <MenuItem value="Ms.">Ms.</MenuItem>
                          <MenuItem value="Dr.">Dr.</MenuItem>
                          <MenuItem value="Adv.">Adv.</MenuItem>
                          <MenuItem value="Prof.">Prof.</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={3.1}>
                        <TextField fullWidth required label="First Name *" name="firstName"
                          value={form.firstName} onChange={handleChange} placeholder="First Name..." />
                      </Grid>
                      <Grid item xs={12} sm={3.1}>
                        <TextField fullWidth label="Middle Name" name="middleName"
                          value={form.middleName} onChange={handleChange} placeholder="Middle Name (optional)" />
                      </Grid>
                      <Grid item xs={12} sm={3.3}>
                        <TextField fullWidth required label="Last Name *" name="lastName"
                          value={form.lastName} onChange={handleChange} placeholder="Last Name..." />
                      </Grid>
                    </Grid>

                    {/* DEMOGRAPHICS: GENDER (COMPACT), DOB (CRYSTAL CLEAR) & AGE (EXPANDED/SWAPPED) */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={2.5}>
                        <TextField
                          select fullWidth
                          label="Gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          SelectProps={{ style: { fontWeight: "bold", fontSize: "0.95rem" } }}
                        >
                          <MenuItem value="">Gender</MenuItem>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4.8}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Date of Birth (Min. 18 Yrs) *"
                          name="dob"
                          value={form.dob}
                          onChange={handleDobChange}
                          error={Boolean(form.dobError)}
                          helperText={form.dobError || (form.dob ? "✓ Age 18+ Verified" : "Applicant must be 18+ years old")}
                          InputLabelProps={{ shrink: true, style: { fontWeight: "bold", color: "#1e293b" } }}
                          inputProps={{
                            max: maxDobDate,
                            style: { fontWeight: 800, fontSize: "1.15rem", color: form.dobError ? "#d32f2f" : "#000000" },
                          }}
                          sx={{
                            bgcolor: "#ffffff",
                            "& .MuiInputBase-input": {
                              fontWeight: 800,
                              fontSize: "1.15rem",
                              color: form.dobError ? "#d32f2f" : "#000000",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4.7}>
                        <TextField
                          fullWidth
                          disabled
                          label="Age / Birth Year"
                          value={
                            form.age
                              ? `${form.age} yrs (Birth Year: ${form.birthYear})`
                              : form.birthYear
                              ? `Birth Year: ${form.birthYear}`
                              : "Auto-calculated"
                          }
                          inputProps={{ style: { fontWeight: "bold" } }}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                ) : (
                  <TextField fullWidth required
                    label="Organisation / Entity / Legal Name *" name="orgName"
                    value={form.orgName} onChange={handleChange}
                    placeholder="Registered legal entity name..."
                    helperText="Official registered firm, institution or entity name"
                    error={Boolean(form.orgName && form.orgName.trim().length < 2)}
                  />
                )}
              </Box>

              {/* ROW 2 — CONTACT: MOBILE & WHATSAPP (50%-50% SPLIT WITH EQUAL-WIDTH ISD), EMAIL FULL-WIDTH */}
              <Box>
                <Typography variant="caption" color="text.secondary"
                  sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, mb: 1, display: "block" }}>
                  Contact Information
                </Typography>
                <Grid container spacing={2}>

                  {/* Mobile: [ISD Code 50%] [Mobile Number 50%] */}
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={1} alignItems="flex-start">
                      <Grid item xs={6}>
                        <PhoneCodeSelect
                          label="ISD Country Code *"
                          value={form.mobileCountryCode}
                          onChange={(c) => setForm((prev) => ({ ...prev, mobileCountryCode: c.code }))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth required
                          label="Mobile Number *"
                          name="mobile"
                          value={form.mobile}
                          onChange={(e) => handlePhoneInput(e, "mobile", mobCfg.maxDigits)}
                          placeholder={mobCfg.placeholder}
                          error={Boolean(form.mobile && !isMobileValid)}
                          helperText={
                            form.mobile
                              ? isMobileValid
                                ? `✓ Valid`
                                : `${mobCfg.minDigits}–${mobCfg.maxDigits} digits`
                              : `${mobCfg.maxDigits} digits`
                          }
                          inputProps={{ maxLength: mobCfg.maxDigits, inputMode: "numeric" }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* WhatsApp: [ISD Code 50%] [WhatsApp Number 50%] */}
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={1} alignItems="flex-start">
                      <Grid item xs={6}>
                        <PhoneCodeSelect
                          label="ISD Country Code"
                          value={form.waCountryCode}
                          onChange={(c) => setForm((prev) => ({ ...prev, waCountryCode: c.code }))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="WhatsApp Number"
                          name="whatsapp"
                          value={form.whatsapp}
                          onChange={(e) => handlePhoneInput(e, "whatsapp", waCfg.maxDigits)}
                          placeholder={waCfg.placeholder}
                          error={Boolean(form.whatsapp && !isWaValid)}
                          helperText={
                            form.whatsapp
                              ? isWaValid
                                ? `✓ Valid`
                                : `${mobCfg.minDigits}–${mobCfg.maxDigits} digits`
                              : "Optional"
                          }
                          inputProps={{ maxLength: waCfg.maxDigits, inputMode: "numeric" }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Email Address — Full Width on Contact Row */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth required
                      label="Email Address *"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="applicant@domain.com"
                      error={Boolean(form.email && !isEmailValid)}
                      helperText={
                        form.email && !isEmailValid
                          ? "Enter a valid email address"
                          : "For receipt & credentials notification"
                      }
                    />
                  </Grid>

                </Grid>
              </Box>

              {/* MEMBER PORTAL SECURITY & PASSWORD CREATION */}
              <Box>
                <Typography variant="caption" color="text.secondary"
                  sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, mb: 1, display: "block" }}>
                  Member Portal Security (Set Secret Password for Member Area Login)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth required
                      type={showPassword ? "text" : "password"}
                      label="Create Secret Password *"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 6 characters..."
                      error={Boolean(form.password && !isPasswordValid)}
                      helperText={
                        form.password
                          ? isPasswordValid
                            ? "✓ Password OK"
                            : "At least 6 characters required"
                          : "Required to open your Member Dashboard"
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="primary" fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth required
                      type={showPassword ? "text" : "password"}
                      label="Confirm Secret Password *"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter secret password..."
                      error={Boolean(form.confirmPassword && !doPasswordsMatch)}
                      helperText={
                        form.confirmPassword
                          ? doPasswordsMatch
                            ? "✓ Passwords Match"
                            : "Passwords do not match"
                          : "Must match secret password above"
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="primary" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* ROW 3 — WHAT BRINGS YOU TO ICJ? (3 vertical cards) */}
              <Box sx={{ width: "100%", overflow: "hidden", boxSizing: "border-box" }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary"
                  sx={{ mb: 2, letterSpacing: 0.3 }}>
                  WHAT BRINGS YOU TO ICJ?
                </Typography>

                {/* Three vertically stacked purpose cards — one per row */}
                <Stack spacing={1.5} sx={{ width: "100%", boxSizing: "border-box" }}>
                  {PURPOSE_OPTIONS.map((opt) => {
                    const Icon     = opt.icon;
                    const selected = form.purpose === opt.value;
                    return (
                      <Box key={opt.value} sx={{ width: "100%", boxSizing: "border-box" }}>
                        {/* Clickable card */}
                        <Paper
                          elevation={selected ? 3 : 0}
                          onClick={() => handlePurposeSelect(opt.value)}
                          sx={{
                            width: "100%",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                            p: { xs: 1.5, sm: 2 },
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            cursor: "pointer",
                            border: "2px solid",
                            borderColor: selected ? opt.color : "#dde3ec",
                            bgcolor: selected ? opt.selectedBg : opt.bg,
                            borderRadius: 2,
                            transition: "all 0.18s ease",
                            userSelect: "none",
                            overflow: "hidden",
                            "&:hover": {
                              borderColor: opt.color,
                              bgcolor: opt.selectedBg,
                              boxShadow: `0 2px 12px ${opt.color}28`,
                            },
                          }}
                        >
                          <Icon sx={{ color: opt.color, fontSize: 26, flexShrink: 0 }} />
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            sx={{
                              flex: 1,
                              color: selected ? opt.color : "text.primary",
                              letterSpacing: 0.2,
                              pr: 1,
                              wordBreak: "break-word",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {opt.label}
                          </Typography>
                          {selected && (
                            <CheckCircleIcon sx={{ color: opt.color, fontSize: 22, flexShrink: 0 }} />
                          )}
                        </Paper>

                        {/* Secondary fields — shown only when this card is selected */}
                        {selected && (
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 1,
                              p: { xs: 2, md: 2.5 },
                              border: "1px solid",
                              borderColor: `${opt.color}44`,
                              borderTop: "none",
                              borderRadius: "0 0 8px 8px",
                              bgcolor: opt.selectedBg,
                            }}
                          >
                            {/* ─ PROBLEM ASSISTANCE ─ */}
                            {opt.value === "PROBLEM" && (
                              <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary"
                                  sx={{ display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                  Select your problem category *
                                </Typography>
                                <Grid container spacing={1}>
                                  {PROBLEM_CATEGORIES.map((cat) => (
                                    <Grid item xs={12} sm={6} key={cat}>
                                      <Paper
                                        elevation={0}
                                        onClick={() => setForm((prev) => ({ ...prev, problemCategory: cat }))}
                                        sx={{
                                          p: 1.5,
                                          border: "1.5px solid",
                                          borderColor: form.problemCategory === cat ? opt.color : "#dde3ec",
                                          bgcolor: form.problemCategory === cat ? "#fff0f0" : "#fff",
                                          borderRadius: 1.5,
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          "&:hover": { borderColor: opt.color },
                                        }}
                                      >
                                        {form.problemCategory === cat && (
                                          <CheckCircleIcon sx={{ color: opt.color, fontSize: 16 }} />
                                        )}
                                        <Typography variant="body2" fontWeight={form.problemCategory === cat ? 700 : 400}>
                                          {cat}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            )}

                            {/* ─ ICJ SERVICES ─ */}
                            {opt.value === "SERVICES" && (
                              <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary"
                                  sx={{ display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                  Select the ICJ service you need *
                                </Typography>
                                <Grid container spacing={1}>
                                  {SERVICE_CATEGORIES.map((cat) => (
                                    <Grid item xs={12} sm={6} key={cat}>
                                      <Paper
                                        elevation={0}
                                        onClick={() => setForm((prev) => ({ ...prev, serviceCategory: cat }))}
                                        sx={{
                                          p: 1.5,
                                          border: "1.5px solid",
                                          borderColor: form.serviceCategory === cat ? opt.color : "#dde3ec",
                                          bgcolor: form.serviceCategory === cat ? "#e8f0ff" : "#fff",
                                          borderRadius: 1.5,
                                          cursor: "pointer",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          "&:hover": { borderColor: opt.color },
                                        }}
                                      >
                                        {form.serviceCategory === cat && (
                                          <CheckCircleIcon sx={{ color: opt.color, fontSize: 16 }} />
                                        )}
                                        <Typography variant="body2" fontWeight={form.serviceCategory === cat ? 700 : 400}>
                                          {cat}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Box>
                            )}

                            {/* ─ FRANCHISE PARTNER ─ */}
                            {opt.value === "FRANCHISE" && (
                              <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary"
                                  sx={{ display: "block", mb: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                  Franchise Interest Details *
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth required
                                      label="Preferred City / Location *"
                                      name="franchiseCity"
                                      value={form.franchiseCity}
                                      onChange={handleChange}
                                      placeholder="City where you wish to operate..."
                                      error={Boolean(form.franchiseCity && form.franchiseCity.trim().length < 2)}
                                      helperText="Minimum 2 characters"
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="Background / Experience (Optional)"
                                      name="franchiseMsg"
                                      value={form.franchiseMsg}
                                      onChange={handleChange}
                                      placeholder="Brief professional background..."
                                      multiline
                                      rows={1}
                                    />
                                  </Grid>
                                </Grid>
                              </Box>
                            )}
                          </Paper>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              {/* ICJ Enterprise Tech & Security Showcase Banner */}
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "#0f172a", color: "#fff", borderRadius: 2, border: "1px solid #334155" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 0.5 }}>
                      <SecurityIcon fontSize="small" /> 🚀 Powered by ICJ Next-Gen Enterprise Tech Architecture
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      Zero-Trust DRM Aadhaar/PAN Security | AI Case Diagnosis | Legal Barter Token | Advocate Succession Safety
                    </Typography>
                  </Box>
                  <Button size="small" variant="contained" color="warning" onClick={() => setTechShowcaseOpen(true)} sx={{ fontWeight: "bold" }}>
                    EXPLORE TECH SHOWCASE & PRIVACY 🛡️
                  </Button>
                </Stack>
              </Paper>

              {/* Consent */}
              <FormControlLabel
                control={
                  <Checkbox
                    name="termsAccepted"
                    checked={form.termsAccepted}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the ICJ onboarding terms, <Button variant="text" size="small" onClick={() => setTechShowcaseOpen(true)} sx={{ p: 0, textTransform: "none", textDecoration: "underline" }}>DRM Privacy Policy &amp; IT Act Sec 79 Intermediary Terms</Button>, and verification process.
                  </Typography>
                }
              />

              <Button
                fullWidth size="large" variant="contained"
                onClick={handleContinueClick}
                disabled={!isFormValid}
                endIcon={<ArrowForwardIcon />}
                sx={{ py: 1.5, fontWeight: "bold", borderRadius: 2, fontSize: "1.05rem" }}
              >
                CONTINUE REGISTRATION
              </Button>

            </Stack>
          </Paper>
        )}

        {/* STAGE 2 : SUCCESS */}
        {stage === "SUCCESS" && createdMember && (
          <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <Box sx={{ color: "success.main", mb: 2 }}>
              <VerifiedUserIcon sx={{ fontSize: 64 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
              REGISTRATION & AUTHENTICATION SUCCESSFUL!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your member account has been registered and logged in. Below are your permanent credentials.
            </Typography>

            <Paper variant="outlined" sx={{
              p: 3, mb: 4, bgcolor: "#f0f7ff",
              borderColor: "primary.main", borderRadius: 3, maxWidth: 520, mx: "auto",
            }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary"
                display="block" sx={{ letterSpacing: 1.5, textTransform: "uppercase" }}>
                PERMANENT MASTER MEMBER ID
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary.dark" sx={{ my: 1, letterSpacing: 1, wordBreak: "break-all" }}>
                {createdMember.member_id || createdMember.memberId}
              </Typography>

              <Box sx={{ mt: 2, p: 1.5, bgcolor: "#ffffff", borderRadius: 2, border: "1px dashed #90caf9" }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  ACCOUNT PASSWORD (CREATED)
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.dark">
                  {createdMember.password ? "••••••••" : "Hashed & Secured"}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                <Chip
                  label="🟢 ACTIVE SESSION AUTHENTICATED"
                  color="success" size="small" sx={{ fontWeight: "bold" }}
                />
                <Chip
                  label="🎁 10 FREE DEMO TOKENS CREDITED!"
                  color="warning" size="small" sx={{ fontWeight: "bold" }}
                />
              </Stack>
            </Paper>

            <Grid container spacing={2} sx={{ maxWidth: 540, mx: "auto", textAlign: "left", mb: 4 }}>
              <Grid item xs={6}>
                <Typography color="text.secondary" variant="caption">Applicant Name</Typography>
                <Typography variant="body1" fontWeight="bold">{createdMember.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary" variant="caption">Applicant Type</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {createdMember.regType || createdMember.memberType}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary" variant="caption">Mobile</Typography>
                <Typography variant="body1">{createdMember.mobile}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary" variant="caption">Email</Typography>
                <Typography variant="body1">{createdMember.email}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color="text.secondary" variant="caption">Purpose</Typography>
                <Typography variant="body1" fontWeight="bold">{createdMember.purpose}</Typography>
              </Grid>
            </Grid>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
              <Button variant="outlined" color="primary" startIcon={<DownloadIcon />}
                onClick={handleDownloadReceipt}
                sx={{ py: 1.4, px: 3, fontWeight: "bold", borderRadius: 2 }}>
                DOWNLOAD RECEIPT
              </Button>
              <Button variant="contained" color="success" endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/")}
                sx={{ py: 1.4, px: 4, fontWeight: "bold", borderRadius: 2, fontSize: "1.05rem" }}>
                OPEN MY MEMBER AREA NOW 🔑
              </Button>
            </Stack>
          </Paper>
        )}

        {/* OTP MODAL */}
        <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
            🔒 Verify Onboarding Contact
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Alert severity="info" sx={{ fontSize: "0.85rem" }}>
                A 6-digit OTP has been dispatched to{" "}
                <strong>{form.mobileCountryCode} {form.mobile}</strong> and{" "}
                <strong>{form.email}</strong>.
              </Alert>
              <TextField
                select fullWidth label="OTP Dispatch Channel"
                value={otpChannel} onChange={(e) => setOtpChannel(e.target.value)}
              >
                <MenuItem value="SMS">📱 SMS Gateway</MenuItem>
                <MenuItem value="WhatsApp">💬 WhatsApp API</MenuItem>
                <MenuItem value="Email">📧 Email OTP</MenuItem>
              </TextField>
              <TextField
                fullWidth label="Enter 6-Digit OTP Code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputProps={{ maxLength: 6, style: { letterSpacing: 4, fontWeight: "bold", textAlign: "center" } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <Button onClick={() => setOtpModalOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleVerifyAndSubmit}
              disabled={submitting || otpCode.length !== 6}
              sx={{ fontWeight: "bold" }}>
              VERIFY &amp; GENERATE MEMBER ID
            </Button>
          </DialogActions>
        </Dialog>

        {/* TECH SHOWCASE & DRM PRIVACY POLICY MODAL */}
        <Dialog open={techShowcaseOpen} onClose={() => setTechShowcaseOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ backgroundColor: "#0f172a", color: "#fff", display: "flex", alignItems: "center", gap: 1 }}>
            <SecurityIcon color="warning" />
            🚀 ICJ Enterprise Tech Showcase &amp; DRM Privacy Policy
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <b>Welcome to ICJ Enterprise Platform:</b> India's first AI-powered, legal barter &amp; zero-trust DRM protected dispute resolution ecosystem.
              </Alert>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5, borderLeft: "4px solid #1976d2", backgroundColor: "#f8fafc" }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      🤖 AI Legal Diagnosis Engine ("आप क्या चाहते हैं?")
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Upload voice notes or text. AI parses IPC/BNS sections, sentence risk, bail prospects, and court duration in seconds.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5, borderLeft: "4px solid #ed6c02", backgroundColor: "#fff8f0" }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
                      🔒 Zero-Trust DRM &amp; Owner OTP Protection
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Personal documents (Aadhaar, PAN, Deeds) are protected from un-watermarked print/download. Requires Owner OTP.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5, borderLeft: "4px solid #2e7d32", backgroundColor: "#f5fff5" }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="success.dark">
                      🪙 Barter Token &amp; 20% Trust Contribution
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Indian Trusts Act 1882 compliant voluntary social credit. 20% charge funds 80G tax benefits &amp; legal aid.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5, borderLeft: "4px solid #9c27b0", backgroundColor: "#fcf4ff" }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="secondary">
                      📂 Immutable Vault &amp; Advocate Succession
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      All court orders &amp; filings are saved in digital vault. If advocate changes, case file remains 100% safe!
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                📜 Statutory IT Act 2000 &amp; Legal Protection Terms
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#f1f5f9", fontSize: "0.85rem" }}>
                <Typography variant="body2" paragraph>
                  <b>1. IT Act 2000 Sec 79 Intermediary Immunity:</b> ICJ Trust acts strictly as an independent digital Intermediary, Facilitator, Mediator &amp; Escrow Executor. Third-party transactions are strictly private matters between Client and Service Provider.
                </Typography>
                <Typography variant="body2" paragraph>
                  <b>2. Prosecution Bar &amp; Mandatory Arbitration:</b> No civil suit, criminal complaint, FIR, or police grievance shall be instituted against ICJ Trust, Trustees, or Staff. All disputes are subject exclusively to ICJ Trust Board Arbitration under Arbitration &amp; Conciliation Act 1996.
                </Typography>
                <Typography variant="body2">
                  <b>3. End-to-End Audit Trail:</b> Every entry, payment invoice, and token serial code is permanently recorded in the immutable digital ledger, fully compliant with Income Tax, GST, and Banking audit standards.
                </Typography>
              </Paper>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="contained" onClick={() => setTechShowcaseOpen(true)} color="primary">
              I Understand &amp; Agree
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}
