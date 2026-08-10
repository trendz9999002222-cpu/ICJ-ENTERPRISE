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
  Autocomplete,
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

import VoiceInputAdornment from "../components/common/VoiceInputAdornment.jsx";
import FieldGovernanceService from "../services/fieldGovernanceService.js";
import MemberService, { generateMemberId } from "../services/memberService";
import AuthService from "../services/authService";
import PasswordPolicyService from "../services/passwordPolicyService";
import PhoneCodeSelect from "../components/common/PhoneCodeSelect";
import { validatePhoneNumber, getCountryByCodeOrIso } from "../data/internationalPhoneMaster";
import useAuth from "../hooks/useAuth";
import OTPService from "../services/otp/otpService.js";

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
  "Property / Real Estate / Land Dispute",
  "Consumer Complaint / Exploitation",
  "Labour / Employment Issue",
  "Family Law / Divorce / Matrimonial Dispute",
  "Cyber Crime / Online Fraud",
  "Cheque Bounce / Debt Recovery",
  "Human Rights / Public Interest Issue",
  "Accident Claims / Compensation",
  "Taxation & Revenue Disputes",
  "Other Legal Matter",
];

const SERVICE_CATEGORIES = [
  "Legal Consultation",
  "Arbitration / Mediation",
  "Contract Drafting & Review",
  "Documentation Services",
  "Legal Audit & Compliance",
  "Notarisation / Attestation",
  "Court Representation",
  "Property Title Verification",
  "Debt Recovery Assistance",
  "Cyber Security Legal Advisory",
  "Human Rights Protection Desk",
  "Other ICJ Service",
];

const STATE_DISTRICTS_MAP = {
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "North West Delhi", "South West Delhi"],
  "Uttar Pradesh": ["Noida / Gautam Buddha Nagar", "Ghaziabad", "Lucknow", "Kanpur", "Meerut", "Prayagraj", "Varanasi", "Agra"],
  "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Sonipat", "Rohtak"],
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function PublicOnboarding() {
  const navigate = useNavigate();
  const { setSessionUser } = useAuth();

  // Tech Showcase & Privacy Modal State
  const [techShowcaseOpen, setTechShowcaseOpen] = useState(false);

  // ─── Form State ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    regType:           "Individual",
    namePrefix:        "",
    firstName:         "",
    middleName:        "",
    lastName:          "",
    orgName:           "",
    repFirstName:      "",
    repMiddleName:     "",
    repLastName:       "",
    gender:            "",
    birthYear:         String(2000 + (new Date().getFullYear() - 2026)),           // Default Birth Year rule
    mobile:            "",
    mobileCountryCode: "+91",
    whatsapp:          "",
    waCountryCode:     "+91",
    email:             "",
    password:          "",
    confirmPassword:   "",
    purpose:           "",           // "PROBLEM" | "SERVICES" | "FRANCHISE"
    problemCategories: [],           // Multi-select problem categories
    problemState:      "Delhi",
    problemDistrict:   "",
    problemCity:       "",
    problemPincode:    "",
    problemPoliceStation: "",
    solutionServices:  [],           // Multi-select solution services
    franchiseState:    "Delhi",
    franchiseDistrict: "",
    franchiseCity:     "",
    franchisePincode:  "",
    franchiseBackground: "",
    termsAccepted:     false,
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

  // Birth Year validation rules
  const currentYear = new Date().getFullYear();
  const minBirthYear = 1925 + (currentYear - 2026);
  const defaultBirthYear = 2000 + (currentYear - 2026);
  const maxBirthYear = currentYear - 10;

  const birthYearsList = useMemo(() => {
    const list = [];
    for (let y = maxBirthYear; y >= minBirthYear; y--) {
      list.push(y);
    }
    return list;
  }, [minBirthYear, maxBirthYear]);

  const handleRegTypeChange = (e) => {
    setForm((prev) => ({
      ...prev,
      regType:    e.target.value,
      namePrefix: "", firstName: "", middleName: "", lastName: "", orgName: "",
      repFirstName: "", repMiddleName: "", repLastName: "",
      gender: "", birthYear: String(2000 + (new Date().getFullYear() - 2026)),
      mobile: "", whatsapp: "", password: "", confirmPassword: "",
      problemState: "Delhi",
      problemDistrict: "",
      problemCity: "",
      problemPincode: "",
      problemPoliceStation: "",
      franchiseState: "Delhi",
      franchiseDistrict: "",
      franchiseCity: "",
      franchisePincode: "",
      franchiseBackground: "",
    }));
  };

  // Phone input: India = max 10 digits, बाकी countries = max 15 (ITU standard)
  const handlePhoneInput = (e, fieldName, countryCode) => {
    const maxLen = countryCode === "+91" ? 10 : 15;
    const digits = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    setForm((prev) => ({ ...prev, [fieldName]: digits }));
  };

  const handlePurposeSelect = (value) => {
    setForm((prev) => ({
      ...prev,
      purpose:             value,
      problemCategories:   [],
      solutionServices:    [],
      franchiseState:      "",
      franchiseDistrict:   "",
      franchiseCity:       "",
      franchiseBackground: "",
    }));
  };

  const handleToggleCategory = (cat) => {
    setForm((prev) => {
      const list = prev.problemCategories || [];
      const updated = list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat];
      return { ...prev, problemCategories: updated };
    });
  };

  const handleToggleService = (cat) => {
    setForm((prev) => {
      const list = prev.solutionServices || [];
      const updated = list.includes(cat) ? list.filter((c) => c !== cat) : [...list, cat];
      return { ...prev, solutionServices: updated };
    });
  };

  // ─── Validation ──────────────────────────────────────────────────────────
  const isNameValid = useMemo(() => {
    if (form.regType === "Individual") {
      return (form.firstName || "").trim().length >= 1 &&
             (form.lastName  || "").trim().length >= 1;
    }
    return (form.orgName || "").trim().length >= 2 &&
           (form.repFirstName || "").trim().length >= 1 &&
           (form.repLastName || "").trim().length >= 1;
  }, [form.regType, form.firstName, form.lastName, form.orgName, form.repFirstName, form.repLastName]);

  const isAgeValid = useMemo(() => {
    if (form.regType !== "Individual") return true;
    const yr = Number(form.birthYear);
    if (!yr || yr < minBirthYear || yr > maxBirthYear) return false;
    return true;
  }, [form.regType, form.birthYear, minBirthYear, maxBirthYear]);

  const isEmailValid = useMemo(() =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test((form.email || "").trim()),
    [form.email]
  );

  const isMobileValid = useMemo(() => {
    const digits = (form.mobile || "").replace(/\D/g, "");
    if (form.mobileCountryCode === "+91" ? digits.length === 10 : digits.length >= 1) return true;
    return false;
  }, [form.mobile, form.mobileCountryCode]);

  const isWaValid = useMemo(() => {
    const digits = (form.whatsapp || "").replace(/\D/g, "");
    if (!digits) return true; // optional field
    if (form.waCountryCode === "+91" ? digits.length === 10 : digits.length >= 1) return true;
    return false;
  }, [form.whatsapp, form.waCountryCode]);

  const isPasswordValid = useMemo(() => {
    return PasswordPolicyService.validatePassword(form.password).valid;
  }, [form.password]);

  const doPasswordsMatch = useMemo(
    () => Boolean(form.password && form.password === form.confirmPassword),
    [form.password, form.confirmPassword]
  );

  const isPurposeValid = useMemo(() => {
    if (!form.purpose) return false;
    if (form.purpose === "PROBLEM")   return (form.problemCategories || []).length >= 1;
    if (form.purpose === "SERVICES")  return (form.solutionServices || []).length >= 1;
    if (form.purpose === "FRANCHISE") {
      return (form.franchiseState || "").trim().length >= 1 &&
             (form.franchiseDistrict || "").trim().length >= 1 &&
             (form.franchiseCity || "").trim().length >= 2 &&
             (form.franchisePincode || "").trim().length === 6;
    }
    return false;
  }, [form.purpose, form.problemCategories, form.solutionServices, form.franchiseState, form.franchiseDistrict, form.franchiseCity, form.franchisePincode]);

  const isFormValid =
    isNameValid && isAgeValid && isEmailValid && isMobileValid && isWaValid &&
    isPasswordValid && doPasswordsMatch && isPurposeValid && form.termsAccepted;




  // ─── Submission ──────────────────────────────────────────────────────────
  const handleContinueClick = async () => {
    if (isFormValid && !submitting) {
      setSubmitting(true);
      setError("");
      try {
        const channel = otpChannel.toLowerCase() === "whatsapp" ? "whatsapp" : otpChannel.toLowerCase() === "sms" ? "sms" : "email";
        const res = await OTPService.requestOTP(form.email, channel);
        if (res.success) {
          setOtpModalOpen(true);
          setOtpCode(""); // Clear default input
        } else {
          setError(res.message || "Failed to dispatch OTP verification code.");
        }
      } catch (err) {
        setError(err.message || "OTP Request Error.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleVerifyOtpAndRegister = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode) return;
    setSubmitting(true);
    try {
      const verifyRes = await OTPService.verifyOTP(form.email, otpCode);
      if (verifyRes.success) {
        await handleVerifyAndSubmit();
      } else {
        alert(verifyRes.message || "Invalid OTP code.");
      }
    } catch (err) {
      alert(err.message || "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

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
        name: form.regType === "Organisation" ? form.orgName : fullName,
        fullName: form.regType === "Organisation" ? form.orgName : fullName,
        firstName: form.firstName, middleName: form.middleName, lastName: form.lastName,
        orgName: form.orgName,
        repFirstName: form.repFirstName, repMiddleName: form.repMiddleName, repLastName: form.repLastName,
        gender:     form.gender,
        birthYear:  form.birthYear,
        birth_year: form.birthYear,
        email:      form.email.trim(),
        mobile:   `${form.mobileCountryCode} ${form.mobile.trim()}`,
        whatsapp: form.whatsapp ? `${form.waCountryCode} ${form.whatsapp.trim()}` : "",
        memberType: form.regType.toLowerCase(), regType: form.regType,
        role: "member", user_type: "member", member_level: "BASIC",
        purpose:    purposeLabel,
        purposeCode: form.purpose,
        problemCategories: form.problemCategories,
        solutionServices: form.solutionServices,
        franchiseState: form.franchiseState,
        franchiseDistrict: form.franchiseDistrict,
        franchiseCity: form.franchiseCity,
        franchiseBackground: form.franchiseBackground,
        education: form.education || "Graduate",
        profession: form.profession || "Business / Professional",
        areaOfInterest: form.areaOfInterest || "Digital Legal Rights",
        eGovPortals: form.eGovPortals || ["e-Courts Cause List & Orders", "Tehsil Bhulekh"],
        engagementIntent: form.engagementIntent || "Standard Legal Aid Assistance",
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
      // Auto-authenticate newly onboarded member session into local storage and auth context
      AuthService.persistLocalUser(finalMember);
      if (setSessionUser) {
        setSessionUser(finalMember);
      }
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
          <Paper component="form" onSubmit={(e) => { e.preventDefault(); if (isFormValid) handleContinueClick(); }} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <Stack direction="row" alignItems="center" sx={{ borderBottom: "2px solid", borderColor: "primary.main", pb: 1, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                Applicant Basic Details
              </Typography>
            </Stack>

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
                          value={form.firstName} onChange={handleChange} placeholder="First Name..."
                          InputProps={{
                            endAdornment: <VoiceInputAdornment onTranscript={(txt) => setForm((p) => ({ ...p, firstName: (p.firstName + " " + txt).trim() }))} value={form.firstName} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3.1}>
                        <TextField fullWidth label="Middle Name" name="middleName"
                          value={form.middleName} onChange={handleChange} placeholder="Middle Name (optional)"
                          InputProps={{
                            endAdornment: <VoiceInputAdornment onTranscript={(txt) => setForm((p) => ({ ...p, middleName: (p.middleName + " " + txt).trim() }))} value={form.middleName} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3.3}>
                        <TextField fullWidth required label="Last Name *" name="lastName"
                          value={form.lastName} onChange={handleChange} placeholder="Last Name..."
                          InputProps={{
                            endAdornment: <VoiceInputAdornment onTranscript={(txt) => setForm((p) => ({ ...p, lastName: (p.lastName + " " + txt).trim() }))} value={form.lastName} />,
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* DEMOGRAPHICS: GENDER + BIRTH YEAR */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select fullWidth
                          label="Gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          SelectProps={{ style: { fontWeight: "bold", fontSize: "1rem" } }}
                          sx={{ "& .MuiSelect-select": { fontWeight: "bold" } }}
                        >
                          <MenuItem value="">-- Select Gender --</MenuItem>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select fullWidth required
                          label="Birth Year *"
                          name="birthYear"
                          value={form.birthYear}
                          onChange={handleChange}
                          error={Boolean(
                            form.birthYear &&
                            (Number(form.birthYear) < minBirthYear || Number(form.birthYear) > maxBirthYear)
                          )}
                          helperText={
                            form.birthYear
                              ? Number(form.birthYear) >= minBirthYear && Number(form.birthYear) <= maxBirthYear
                                ? `✓ Valid (Age ~${currentYear - Number(form.birthYear)} yrs)`
                                : `${minBirthYear} से ${maxBirthYear} के बीच होना चाहिए`
                              : "केवल जन्म का साल"
                          }
                        >
                          <MenuItem value="">-- Select Birth Year --</MenuItem>
                          {birthYearsList.map((y) => (
                            <MenuItem key={y} value={String(y)}>
                              {y}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <TextField fullWidth required
                      label="Organisation / Entity / Legal Name *" name="orgName"
                      value={form.orgName} onChange={handleChange}
                      placeholder="Registered legal entity name..."
                      helperText="Official registered firm, institution or entity name"
                      error={Boolean(form.orgName && form.orgName.trim().length < 2)}
                    />

                    {/* Representative details for Organisation */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                      Representative / Contact Person Name *
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth required
                          label="Rep First Name *" name="repFirstName"
                          value={form.repFirstName} onChange={handleChange}
                          placeholder="First Name..."
                          error={Boolean(form.repFirstName && form.repFirstName.trim().length < 1)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth
                          label="Rep Middle Name" name="repMiddleName"
                          value={form.repMiddleName} onChange={handleChange}
                          placeholder="Middle Name (optional)..."
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth required
                          label="Rep Last Name *" name="repLastName"
                          value={form.repLastName} onChange={handleChange}
                          placeholder="Last Name..."
                          error={Boolean(form.repLastName && form.repLastName.trim().length < 1)}
                        />
                      </Grid>
                    </Grid>

                    {/* Gender — Organisation representative का gender */}
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select fullWidth
                          label="Representative Gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          SelectProps={{ style: { fontWeight: "bold", fontSize: "1rem" } }}
                          sx={{ "& .MuiSelect-select": { fontWeight: "bold" } }}
                          helperText="संस्था के प्रतिनिधि का Gender"
                        >
                          <MenuItem value="">-- Select Gender --</MenuItem>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Stack>
                )}
              </Box>

              {/* ROW 2 — CONTACT: MOBILE & WHATSAPP (50%-50% SPLIT WITH EQUAL-WIDTH ISD), EMAIL FULL-WIDTH */}
              <Box>
                <Typography variant="caption" color="text.secondary"
                  sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, mb: 1, display: "block" }}>
                  Contact Information
                </Typography>
                <Grid container spacing={2}>

                  {/* Mobile: [Country Code 50%] [Mobile Number 50%] — equal size, max 10 digits */}
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={1} alignItems="flex-start">
                      <Grid item xs={6}>
                        <PhoneCodeSelect
                          label="Country Code *"
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
                          onChange={(e) => handlePhoneInput(e, "mobile", form.mobileCountryCode)}
                          placeholder={form.mobileCountryCode === "+91" ? "10-digit number" : "Phone number"}
                          error={Boolean(form.mobile && !isMobileValid)}
                          helperText={
                            form.mobileCountryCode === "+91"
                              ? form.mobile
                                ? isMobileValid ? "✓ Valid" : "10 अंक होने चाहिए"
                                : "10 अंक (India)"
                              : form.mobile
                              ? isMobileValid ? "✓ Valid" : "कम से कम 1 अंक"
                              : "Phone number"
                          }
                          inputProps={{
                            maxLength: form.mobileCountryCode === "+91" ? 10 : 15,
                            inputMode: "numeric",
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* WhatsApp: [Country Code 50%] [WhatsApp Number 50%] — equal size, max 10 digits */}
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={1} alignItems="flex-start">
                      <Grid item xs={6}>
                        <PhoneCodeSelect
                          label="Country Code"
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
                          onChange={(e) => handlePhoneInput(e, "whatsapp", form.waCountryCode)}
                          placeholder={form.waCountryCode === "+91" ? "10-digit number" : "Phone number"}
                          error={Boolean(form.whatsapp && !isWaValid)}
                          helperText={
                            form.waCountryCode === "+91"
                              ? form.whatsapp
                                ? isWaValid ? "✓ Valid" : "10 अंक होने चाहिए"
                                : "Optional (10 अंक)"
                              : form.whatsapp
                              ? isWaValid ? "✓ Valid" : "कम से कम 1 अंक"
                              : "Optional"
                          }
                          inputProps={{
                            maxLength: form.waCountryCode === "+91" ? 10 : 15,
                            inputMode: "numeric",
                          }}
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
                      autoComplete="off"
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
                  sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, mb: 0.5, display: "block" }}>
                  Member Portal Security (Set Secret Password for Member Area Login)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                  * Password must be minimum 8 characters, containing at least 1 letter, 1 number, and 1 special character (no starting/ending spaces).
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
                      placeholder="e.g. Abc@12345"
                      error={Boolean(form.password && !isPasswordValid)}
                      autoComplete="new-password"
                      helperText={
                        form.password
                          ? isPasswordValid
                            ? "✓ Password meets requirements"
                            : "अमान्य प्रारूप (न्यूनतम 8 कैरेक्टर, 1 अक्षर, 1 नंबर, 1 स्पेशल)"
                          : "Min 8 chars, 1 letter, 1 number, 1 special char"
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="primary" fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="toggle password visibility">
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
                      autoComplete="new-password"
                      helperText={
                        form.confirmPassword
                          ? doPasswordsMatch
                            ? "✓ Passwords Match"
                            : "पासवर्ड मेल नहीं खा रहे हैं"
                          : "Must match secret password above"
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="primary" fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="toggle password visibility">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
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
                                  Select your problem category * (Select Multiple)
                                </Typography>
                                <Grid container spacing={1}>
                                  {PROBLEM_CATEGORIES.map((cat) => {
                                    const isSelected = (form.problemCategories || []).includes(cat);
                                    return (
                                      <Grid item xs={12} sm={6} key={cat}>
                                        <Paper
                                          elevation={0}
                                          onClick={() => handleToggleCategory(cat)}
                                          sx={{
                                            p: 1.5,
                                            border: "1.5px solid",
                                            borderColor: isSelected ? opt.color : "#dde3ec",
                                            bgcolor: isSelected ? "#fff0f0" : "#fff",
                                            borderRadius: 1.5,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            "&:hover": { borderColor: opt.color },
                                          }}
                                        >
                                          {isSelected && (
                                            <CheckCircleIcon sx={{ color: opt.color, fontSize: 16 }} />
                                          )}
                                          <Typography variant="body2" fontWeight={isSelected ? 700 : 400}>
                                            {cat}
                                          </Typography>
                                        </Paper>
                                      </Grid>
                                    );
                                  })}
                                </Grid>

                                {/* Problem Location details (Optional) */}
                                <Box sx={{ mt: 3, pt: 2, borderTop: "1px dashed #cbd5e1" }}>
                                  <Typography variant="caption" fontWeight="bold" color="text.secondary"
                                    sx={{ display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                    Problem Location Details (Optional / वैकल्पिक)
                                  </Typography>
                                  <Grid container spacing={1.5}>
                                    {/* State Input with freeSolo Autocomplete */}
                                    <Grid item xs={12} sm={4} sx={{ minWidth: 260 }}>
                                      <Autocomplete
                                        freeSolo
                                        disableClearable
                                        size="small"
                                        options={["Delhi", "Uttar Pradesh", "Punjab", "Haryana"]}
                                        value={form.problemState}
                                        onInputChange={(_, newValue) => {
                                          setForm(p => ({
                                            ...p,
                                            problemState: newValue,
                                            problemDistrict: "", // Reset district when state changes
                                          }));
                                        }}
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            label="State / राज्य"
                                            name="problemState"
                                            placeholder="Select or type..."
                                          />
                                        )}
                                      />
                                    </Grid>

                                    {/* District Input with freeSolo Autocomplete */}
                                    <Grid item xs={12} sm={4} sx={{ minWidth: 260 }}>
                                      <Autocomplete
                                        freeSolo
                                        disableClearable
                                        size="small"
                                        options={STATE_DISTRICTS_MAP[form.problemState] || []}
                                        value={form.problemDistrict}
                                        onInputChange={(_, newValue) => {
                                          setForm(p => ({
                                            ...p,
                                            problemDistrict: newValue,
                                          }));
                                        }}
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            label="District / जिला"
                                            name="problemDistrict"
                                            placeholder="Select or type..."
                                          />
                                        )}
                                      />
                                    </Grid>

                                    {/* City Input */}
                                    <Grid item xs={12} sm={4}>
                                      <TextField
                                        fullWidth size="small"
                                        label="City / शहर"
                                        name="problemCity"
                                        value={form.problemCity}
                                        onChange={handleChange}
                                        placeholder="City name..."
                                      />
                                    </Grid>

                                    {/* Pincode Input */}
                                    <Grid item xs={12} sm={4}>
                                      <TextField
                                        fullWidth size="small"
                                        label="Pincode / पिन कोड"
                                        name="problemPincode"
                                        value={form.problemPincode}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                          setForm(p => ({ ...p, problemPincode: val }));
                                        }}
                                        placeholder="6-digit pincode"
                                        inputProps={{ maxLength: 6, inputMode: "numeric" }}
                                        error={Boolean(form.problemPincode && form.problemPincode.length !== 6)}
                                      />
                                    </Grid>

                                    {/* Police Station Input */}
                                    <Grid item xs={12} sm={4}>
                                      <TextField
                                        fullWidth size="small"
                                        label="Police Station / थाना"
                                        name="problemPoliceStation"
                                        value={form.problemPoliceStation}
                                        onChange={handleChange}
                                        placeholder="Police station name..."
                                      />
                                    </Grid>
                                  </Grid>
                                </Box>
                              </Box>
                            )}

                            {/* ─ ICJ SERVICES ─ */}
                            {opt.value === "SERVICES" && (
                              <Box>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary"
                                  sx={{ display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
                                  Select the ICJ service you need * (Select Multiple)
                                </Typography>
                                <Grid container spacing={1}>
                                  {SERVICE_CATEGORIES.map((cat) => {
                                    const isSelected = (form.solutionServices || []).includes(cat);
                                    return (
                                      <Grid item xs={12} sm={6} key={cat}>
                                        <Paper
                                          elevation={0}
                                          onClick={() => handleToggleService(cat)}
                                          sx={{
                                            p: 1.5,
                                            border: "1.5px solid",
                                            borderColor: isSelected ? opt.color : "#dde3ec",
                                            bgcolor: isSelected ? "#e8f0ff" : "#fff",
                                            borderRadius: 1.5,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            "&:hover": { borderColor: opt.color },
                                          }}
                                        >
                                          {isSelected && (
                                            <CheckCircleIcon sx={{ color: opt.color, fontSize: 16 }} />
                                          )}
                                          <Typography variant="body2" fontWeight={isSelected ? 700 : 400}>
                                            {cat}
                                          </Typography>
                                        </Paper>
                                      </Grid>
                                    );
                                  })}
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
                                  {/* State Autocomplete freeSolo */}
                                  <Grid item xs={12} sx={{ minWidth: 260 }}>
                                    <Autocomplete
                                      freeSolo
                                      disableClearable
                                      size="small"
                                      options={["Delhi", "Uttar Pradesh", "Punjab", "Haryana"]}
                                      value={form.franchiseState}
                                      onInputChange={(_, newValue) => {
                                        setForm(p => ({
                                          ...p,
                                          franchiseState: newValue,
                                          franchiseDistrict: "",
                                        }));
                                      }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          required
                                          label="State / राज्य *"
                                          name="franchiseState"
                                          placeholder="Select or type state..."
                                        />
                                      )}
                                    />
                                  </Grid>

                                  {/* District Autocomplete freeSolo */}
                                  <Grid item xs={12} sx={{ minWidth: 260 }}>
                                    <Autocomplete
                                      freeSolo
                                      disableClearable
                                      size="small"
                                      options={STATE_DISTRICTS_MAP[form.franchiseState] || []}
                                      value={form.franchiseDistrict}
                                      onInputChange={(_, newValue) => {
                                        setForm(p => ({
                                          ...p,
                                          franchiseDistrict: newValue,
                                        }));
                                      }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          required
                                          label="District / जिला *"
                                          name="franchiseDistrict"
                                          placeholder="Select or type district..."
                                        />
                                      )}
                                    />
                                  </Grid>

                                  {/* City */}
                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth required size="small"
                                      label="City / शहर *"
                                      name="franchiseCity"
                                      value={form.franchiseCity}
                                      onChange={handleChange}
                                      placeholder="City name..."
                                      error={Boolean(form.franchiseCity && form.franchiseCity.trim().length < 2)}
                                    />
                                  </Grid>

                                  {/* Pincode */}
                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth required size="small"
                                      label="Pincode / पिन कोड *"
                                      name="franchisePincode"
                                      value={form.franchisePincode}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                        setForm(p => ({ ...p, franchisePincode: val }));
                                      }}
                                      placeholder="6-digit pincode"
                                      inputProps={{ maxLength: 6, inputMode: "numeric" }}
                                      error={Boolean(form.franchisePincode && form.franchisePincode.length !== 6)}
                                    />
                                  </Grid>

                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth required
                                      label="Background / Experience / Capability *"
                                      name="franchiseBackground"
                                      value={form.franchiseBackground}
                                      onChange={handleChange}
                                      placeholder="Detail your professional capability and background..."
                                      multiline
                                      rows={6}
                                      error={Boolean(form.franchiseBackground && form.franchiseBackground.trim().length < 5)}
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
                onClick={() => {
                  if (setSessionUser && createdMember) setSessionUser(createdMember);
                  navigate("/");
                }}
                sx={{ py: 1.4, px: 4, fontWeight: "bold", borderRadius: 2, fontSize: "1.05rem" }}>
                OPEN MY MEMBER AREA NOW 🔑
              </Button>
            </Stack>
          </Paper>
        )}

        {/* OTP MODAL */}
        <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)} maxWidth="xs" fullWidth>
          <Box component="form" onSubmit={handleVerifyOtpAndRegister}>
            <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
              🔒 Verify Onboarding Contact
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2} sx={{ pt: 1 }}>
                <Alert severity="info" sx={{ fontSize: "0.85rem" }}>
                  A 6-digit OTP has been dispatched to{" "}
                  <strong>{form.mobileCountryCode} {form.mobile}</strong> and{" "}
                  <strong>{form.email}</strong>.
                  <br />
                  <Typography variant="caption" sx={{ color: "#1565c0", fontWeight: "bold", display: "block", mt: 0.5 }}>
                    🔒 Security: OTP request processed.
                  </Typography>
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
                  helperText={
                    localStorage.getItem("icj_otp_mode") === "mock"
                      ? `Mock Mode Code: ${OTPService.getTestOTP(form.email) || "Generate New"}`
                      : "Enter OTP received on registered channel"
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
              <Button onClick={() => setOtpModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained"
                disabled={submitting || otpCode.length < 6}
                sx={{ fontWeight: "bold" }}>
                VERIFY &amp; GENERATE MEMBER ID
              </Button>
            </DialogActions>
          </Box>
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
            <Button
              variant="contained"
              onClick={() => {
                setForm((prev) => ({ ...prev, termsAccepted: true }));
                setTechShowcaseOpen(false);
              }}
              color="primary"
            >
              I Understand &amp; Agree
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}
