import { useState, useMemo } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  Divider,
} from "@mui/material";
import AssignmentLateIcon  from "@mui/icons-material/AssignmentLate";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import HandshakeIcon       from "@mui/icons-material/Handshake";
import VerifiedUserIcon    from "@mui/icons-material/VerifiedUser";
import DownloadIcon        from "@mui/icons-material/Download";
import ArrowForwardIcon    from "@mui/icons-material/ArrowForward";
import ArrowBackIcon       from "@mui/icons-material/ArrowBack";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton     from "@mui/material/IconButton";
import Visibility     from "@mui/icons-material/Visibility";
import VisibilityOff  from "@mui/icons-material/VisibilityOff";
import LockIcon       from "@mui/icons-material/Lock";
import SecurityIcon   from "@mui/icons-material/Security";
import PlatformLegalTermsModal from "../components/common/PlatformLegalTermsModal.jsx";

import VoiceInputAdornment from "../components/common/VoiceInputAdornment.jsx";
import VoiceCommentaryStudio from "../components/common/VoiceCommentaryStudio.jsx";
import FieldGovernanceService from "../services/fieldGovernanceService.js";
import MemberService, { generateMemberId } from "../services/memberService";
import AuthService, { persistLocalUser } from "../services/authService";
import PasswordPolicyService from "../services/passwordPolicyService";
import PhoneCodeSelect from "../components/common/PhoneCodeSelect";
import { validatePhoneNumber, getCountryByCodeOrIso } from "../data/internationalPhoneMaster";
import useAuth from "../hooks/useAuth";
import OTPService from "../services/otp/otpService.js";

// ─── PURPOSE MASTER & CAPACITY OPTIONS ──────────────────────────────────────

const PURPOSE_OPTIONS = [
  {
    value: "PROBLEM",
    label: "1. Your Problem, Our Solution — पीड़ित नागरिक / क्लाइंट (Litigant Client)",
    shortTitle: "Your Problem, Our Solution",
    sublabel: "कानूनी समस्या, केस फाइलिंग, नोटिस, कोर्ट केस या विवाद समाधान हेतु सहायता",
    roleBadge: "👤 Role: Litigant Client | Allocated ID: 26CLT08AA....",
    targetRole: "member",
    icon: AssignmentLateIcon,
    color: "#d32f2f",
    bg:    "#fff5f5",
    selectedBg: "#ffebee",
  },
  {
    value: "SERVICES",
    label: "2. ICJ, The Solution World — अधिवक्ता, CA, CS, CMA व लीगल प्रोफेशनल (Professional Partner)",
    shortTitle: "ICJ, The Solution World",
    sublabel: "ICJ नेटवर्क में वकील, CA, CS, आर्बिट्रेटर या कंसल्टेंट के रूप में शामिल हों व प्रैक्टिस करें",
    roleBadge: "⚖️ Role: ICJ Professional Partner | Allocated ID: 26ICJ08AA....",
    targetRole: "advocate",
    icon: MiscellaneousServicesIcon,
    color: "#1565c0",
    bg:    "#f5f8ff",
    selectedBg: "#e3f2fd",
  },
  {
    value: "FRANCHISE",
    label: "3. Become an ICJ Franchisee Partner — जिला फ्रेंचाइजी केंद्र (District Franchise Node)",
    shortTitle: "Become an ICJ Franchisee Partner",
    sublabel: "अपने जिले/तहसील में ICJ लीगल हब व सर्विस केंद्र स्थापित एवं संचालित करें",
    roleBadge: "🏢 Role: District Franchisee Node | Allocated ID: 26FRZ08AA....",
    targetRole: "franchise",
    icon: HandshakeIcon,
    color: "#2e7d32",
    bg:    "#f5fff5",
    selectedBg: "#e8f5e9",
  },
];

export const PROFESSIONAL_CATEGORIES = [
  "Advocate / Legal Counsel (Supreme Court, High Court & Tribunals)",
  "Chartered Accountant (CA) — Direct & Indirect Taxation, Audit & GST",
  "Company Secretary (CS) — Corporate Law, ROC & Governance",
  "Cost & Management Accountant (CMA)",
  "Patent, Trademark & Copyright Attorney (IPR)",
  "Empaneled Arbitrator / Dispute Mediator & Conciliator",
  "Corporate Legal Consultant / Auditor",
  "Other Legal / Corporate Professional",
];

export const EXPERIENCE_OPTIONS = [
  "Entry Level (0 - 2 Years)",
  "Mid Level (2 - 5 Years)",
  "Senior Professional (5 - 10 Years)",
  "Veteran / Expert (10+ Years)",
  "Distinguished Counsel / Senior Partner (15+ Years)",
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
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  // ─── Form State ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    regType:           "Individual",
    namePrefix:        "Mr.",
    firstName:         "",
    middleName:        "",
    lastName:          "",
    orgName:           "",
    repFirstName:      "",
    repMiddleName:     "",
    repLastName:       "",
    gender:            "Male",
    birthYear:         String(2000 + (new Date().getFullYear() - 2026)),
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
    problemDescription: "",
    problemVoiceFiles: [],
    solutionServices:  [],           // Multi-select solution services
    professionalCategory: "Advocate / Legal Counsel (Supreme Court, High Court & Tribunals)",
    professionalRegNo: "",
    professionalExperience: "Senior Professional (5 - 10 Years)",
    practiceCourts: "Supreme Court, High Court & District Courts",
    specializations: "Civil, Criminal, Constitutional Writs & Corporate Law",
    franchiseState:    "Delhi",
    franchiseDistrict: "",
    franchiseCity:     "",
    franchisePincode:  "",
    franchiseBackground: "",
    termsAccepted:     false,
  });

  // ─── UI State: "GATEWAY" -> "FORM" -> "OTP" -> "SUCCESS" ─────────────────
  const [stage,        setStage]        = useState("GATEWAY");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [certOpen,     setCertOpen]     = useState(false);
  const [otpCode,      setOtpCode]      = useState("123456");
  const [otpChannel,   setOtpChannel]   = useState("SMS");
  const [createdMember,setCreatedMember]= useState(null);
  const [submitting,   setSubmitting]   = useState(false);  
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");

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
      regType: e.target.value,
      namePrefix: e.target.value === "Individual" ? "Mr." : "Dr.",
    }));
  };

  const handlePurposeSelect = (val) => {
    setForm((prev) => ({
      ...prev,
      purpose: val,
      problemCategories: val === "PROBLEM" ? prev.problemCategories : [],
      solutionServices: val === "SERVICES" ? prev.solutionServices : [],
    }));
    setError("");
  };

  const handleGatewayProceed = () => {
    if (!form.purpose) {
      setError("कृपया आगे बढ़ने के लिए ऊपर दिए गए 3 विकल्पों में से एक चुनें (Please select one capacity option to proceed).");
      return;
    }
    setError("");
    setStage("FORM");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleCategory = (cat) => {
    setForm((prev) => {
      const exists = prev.problemCategories.includes(cat);
      const next = exists
        ? prev.problemCategories.filter((c) => c !== cat)
        : [...prev.problemCategories, cat];
      return { ...prev, problemCategories: next };
    });
  };

  const handleToggleService = (srv) => {
    setForm((prev) => {
      const exists = prev.solutionServices.includes(srv);
      const next = exists
        ? prev.solutionServices.filter((s) => s !== srv)
        : [...prev.solutionServices, srv];
      return { ...prev, solutionServices: next };
    });
  };

  // ─── Validations ─────────────────────────────────────────────────────────
  const isMobileValid = useMemo(() => {
    const raw = form.mobile.replace(/\D/g, "");
    return validatePhoneNumber(form.mobileCountryCode, raw);
  }, [form.mobile, form.mobileCountryCode]);

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  }, [form.email]);

  const isPasswordValid = useMemo(() => {
    return PasswordPolicyService.validate(form.password).isValid;
  }, [form.password]);

  const doPasswordsMatch = useMemo(() => {
    return form.password && form.confirmPassword && form.password === form.confirmPassword;
  }, [form.password, form.confirmPassword]);

  const isNameValid = useMemo(() => {
    if (form.regType === "Organisation") {
      return (
        Boolean(form.orgName?.trim()) &&
        Boolean(form.repFirstName?.trim()) &&
        Boolean(form.repLastName?.trim())
      );
    }
    return Boolean(form.firstName?.trim()) && Boolean(form.lastName?.trim());
  }, [form.regType, form.orgName, form.repFirstName, form.repLastName, form.firstName, form.lastName]);

  const isBirthYearValid = useMemo(() => {
    if (!form.birthYear) return false;
    const y = Number(form.birthYear);
    return !isNaN(y) && y >= minBirthYear && y <= maxBirthYear;
  }, [form.birthYear, minBirthYear, maxBirthYear]);

  const isFormValid = useMemo(() => {
    if (!isNameValid) return false;
    if (!isMobileValid) return false;
    if (!isEmailValid) return false;
    if (!isPasswordValid) return false;
    if (!doPasswordsMatch) return false;
    if (!isBirthYearValid) return false;
    if (!form.purpose) return false;
    if (!form.termsAccepted) return false;
    return true;
  }, [isNameValid, isMobileValid, isEmailValid, isPasswordValid, doPasswordsMatch, isBirthYearValid, form.purpose, form.termsAccepted]);

  // ─── Submit Flow ─────────────────────────────────────────────────────────
  const handleContinueClick = async () => {
    setError("");

    if (!isNameValid) {
      setError("Please provide applicant first and last name (or organisation name and representative).");
      return;
    }
    if (!isMobileValid) {
      setError(`Please enter a valid mobile number for ${mobCfg.name} (${mobCfg.dial_code}).`);
      return;
    }
    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isPasswordValid) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols.");
      return;
    }
    if (!doPasswordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.termsAccepted) {
      setError("Please accept the ICJ terms and conditions to proceed.");
      return;
    }

    setSubmitting(true);
    try {
      const email = form.email.trim();
      const mobile = `${form.mobileCountryCode} ${form.mobile.trim()}`;

      const res = await OTPService.requestOTP(email, "email");
      if (!res.success) {
        throw new Error(res.message || "Failed to dispatch verification code.");
      }

      setOtpCode("");
      setOtpModalOpen(true);
    } catch (err) {
      setError(err.message || "Unable to proceed with registration.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpVerify = async () => {
    setSubmitting(true);
    try {
      const verifyRes = await OTPService.verifyOTP(form.email.trim(), otpCode.trim());
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

      // Dynamic Role Determination based on chosen Purpose
      let assignedRole = "member";
      let assignedLevel = "BASIC";

      if (form.purpose === "SERVICES") {
        assignedRole = "advocate";
        assignedLevel = "PRO";
      } else if (form.purpose === "FRANCHISE") {
        assignedRole = "franchise";
        assignedLevel = "EXECUTIVE";
      }

      const permanentMemberId = generateMemberId(existingList, assignedRole);

      const purposeObj = PURPOSE_OPTIONS.find((p) => p.value === form.purpose);
      const purposeLabel = purposeObj?.label || form.purpose;

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
        role: assignedRole, user_type: assignedRole, member_level: assignedLevel,
        professionalCategory: form.professionalCategory,
        professionalRegNo: form.professionalRegNo,
        professionalExperience: form.professionalExperience,
        practiceCourts: form.practiceCourts,
        specializations: form.specializations,
        purpose:    purposeLabel,
        purposeCode: form.purpose,
        problemCategories: form.problemCategories,
        solutionServices: form.solutionServices,
        franchiseState: form.franchiseState,
        franchiseDistrict: form.franchiseDistrict,
        franchiseCity: form.franchiseCity,
        franchiseBackground: form.franchiseBackground,
        education: form.education || (form.purpose === "SERVICES" ? "LL.B / CA / CS Professional" : "Graduate"),
        profession: form.purpose === "SERVICES" ? (form.professionalCategory || "Advocate / Legal Counsel") : (form.profession || "Business / Professional"),
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
      
      // Dual-sync into AuthService enterprise user storage for seamless login
      try {
        await AuthService.register(payload);
      } catch (e) {
        console.log("AuthService sync notice:", e.message);
      }

      // Dispatch Background Web Push Notification & Audio Sound Chime to Super Admin
      try {
        import("../services/pushNotificationService.js").then((mod) => {
          const pns = mod.default || mod.PushNotificationService;
          pns.sendBackgroundPush({
            title: "🔔 New Member Registered!",
            body: `Applicant ${finalMember.fullName} (ID: ${finalMember.member_id || finalMember.id}) registered — Assign Advocate Now (15m SLA)`,
            url: "/super-admin-dashboard",
          });
        });
      } catch (e) {}

      // Auto-authenticate newly onboarded member session into local storage and auth context
      persistLocalUser(finalMember);
      if (setSessionUser) {
        setSessionUser(finalMember);
      }
      setCreatedMember(finalMember);
      setOtpModalOpen(false);
      setStage("SUCCESS");
    } catch (err) {
      console.error("Public onboarding creation failed", err);
      alert("Registration failed: " + (err.message || "Unknown error"));
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

  const selectedPurposeObj = PURPOSE_OPTIONS.find((p) => p.value === form.purpose);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f8", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">

        {/* BRANDING HEADER */}
        <Paper elevation={0} sx={{
          p: { xs: 2.5, sm: 3, md: 4 }, mb: 3, bgcolor: "#002855", color: "#fff",
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
            ICJ Enterprise Platform — Official Public Applicant Onboarding Gateway
          </Typography>
        </Paper>

        {/* ========================================================================= */}
        {/* STEP 2 & 3 : DEDICATED CATEGORY SELECTION GATEWAY ("WHAT BRINGS YOU TO ICJ?") */}
        {/* ========================================================================= */}
        {stage === "GATEWAY" && (
          <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Chip label="STEP 1 OF 2 — CHOOSE YOUR JOINING CAPACITY" color="primary" sx={{ fontWeight: 800, mb: 1.5 }} />
              <Typography variant="h5" fontWeight={800} color="text.primary">
                WHAT BRINGS YOU TO ICJ?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 550, mx: "auto" }}>
                कृपया आगे बढ़ने के लिए नीचे दिए गए 3 विकल्पों में से अपनी उपयुक्त भूमिका चुनें:
              </Typography>
            </Box>

            {error && (
              <Alert severity="warning" sx={{ mb: 3, fontWeight: "bold" }}>
                {error}
              </Alert>
            )}

            {/* 3 Prominent Capacity Options */}
            <Stack spacing={2.5} sx={{ mb: 4 }}>
              {PURPOSE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = form.purpose === opt.value;
                return (
                  <Paper
                    key={opt.value}
                    elevation={isSelected ? 4 : 0}
                    onClick={() => handlePurposeSelect(opt.value)}
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: 2.5,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor: isSelected ? opt.color : "#dde3ec",
                      bgcolor: isSelected ? opt.selectedBg : opt.bg,
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      "&:hover": {
                        borderColor: opt.color,
                        bgcolor: opt.selectedBg,
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 16px ${opt.color}25`,
                      },
                    }}
                  >
                    <Box sx={{
                      width: 52, height: 52, borderRadius: "50%",
                      bgcolor: isSelected ? opt.color : "#ffffff",
                      color: isSelected ? "#ffffff" : opt.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      flexShrink: 0
                    }}>
                      <Icon sx={{ fontSize: 28 }} />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={800} color={isSelected ? opt.color : "text.primary"}>
                        {opt.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                        {opt.sublabel}
                      </Typography>
                      {opt.roleBadge && (
                        <Chip
                          label={opt.roleBadge}
                          size="small"
                          sx={{
                            mt: 1,
                            fontWeight: 800,
                            fontSize: "0.74rem",
                            bgcolor: isSelected ? opt.color : "#e2e8f0",
                            color: isSelected ? "#ffffff" : "#334155",
                          }}
                        />
                      )}
                    </Box>

                    {isSelected ? (
                      <CheckCircleIcon sx={{ color: opt.color, fontSize: 28, flexShrink: 0 }} />
                    ) : (
                      <Box sx={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #cbd5e1", flexShrink: 0 }} />
                    )}
                  </Paper>
                );
              })}
            </Stack>

            {/* Action Buttons */}
            <Stack spacing={2} alignItems="center">
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={handleGatewayProceed}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.6,
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  borderRadius: 2,
                  bgcolor: selectedPurposeObj?.color || "#002855",
                  "&:hover": { bgcolor: selectedPurposeObj?.color || "#001a38" },
                }}
              >
                CONTINUE / PROCEED TO REGISTRATION ➔
              </Button>

              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                color="inherit"
                sx={{ textTransform: "none", fontWeight: "bold" }}
              >
                Already have an account? Sign In / पहले से खाता है? लॉगिन करें
              </Button>
            </Stack>
          </Paper>
        )}

        {/* ========================================================================= */}
        {/* STEP 4 & 5 : RELEVANT TAILORED REGISTRATION FORM */}
        {/* ========================================================================= */}
        {stage === "FORM" && (
          <Paper component="form" onSubmit={(e) => { e.preventDefault(); if (isFormValid) handleContinueClick(); }} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            
            {/* Top Navigation & Category Summary Banner */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => setStage("GATEWAY")}
                variant="outlined"
                size="small"
                sx={{ fontWeight: "bold", textTransform: "none" }}
              >
                ← Back to Category Selection
              </Button>

              {selectedPurposeObj && (
                <Chip
                  label={selectedPurposeObj.roleBadge}
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    bgcolor: selectedPurposeObj.color,
                    color: "#ffffff",
                  }}
                />
              )}
            </Stack>

            {/* Banner of Active Form */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                bgcolor: selectedPurposeObj?.selectedBg || "#f8fafc",
                borderColor: selectedPurposeObj?.color || "#cbd5e1",
                borderLeft: `6px solid ${selectedPurposeObj?.color || "#002855"}`,
              }}
            >
              <Typography variant="subtitle1" fontWeight={800} color={selectedPurposeObj?.color || "text.primary"}>
                {selectedPurposeObj?.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                कृपया नीचे दिए गए फ़ॉर्म में अपनी सही जानकारी दर्ज करें:
              </Typography>
            </Paper>

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
                  1. Name & Demographics (व्यक्तिगत विवरण)
                </Typography>
                {form.regType === "Individual" ? (
                  <Stack spacing={2}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          select fullWidth
                          label="Title"
                          name="namePrefix"
                          value={form.namePrefix}
                          onChange={handleChange}
                          SelectProps={{ style: { fontWeight: "bold" } }}
                          sx={{ minWidth: 110 }}
                        >
                          <MenuItem value="Mr.">Mr.</MenuItem>
                          <MenuItem value="Mrs.">Mrs.</MenuItem>
                          <MenuItem value="Ms.">Ms.</MenuItem>
                          <MenuItem value="Dr.">Dr.</MenuItem>
                          <MenuItem value="Adv.">Adv.</MenuItem>
                          <MenuItem value="Prof.">Prof.</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth required label="First Name *" name="firstName"
                          value={form.firstName} onChange={handleChange} placeholder="First Name..."
                          InputProps={{
                            endAdornment: <VoiceInputAdornment onTranscript={(txt) => setForm((p) => ({ ...p, firstName: (p.firstName + " " + txt).trim() }))} value={form.firstName} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField fullWidth label="Middle Name" name="middleName"
                          value={form.middleName} onChange={handleChange} placeholder="Middle Name (optional)"
                          InputProps={{
                            endAdornment: <VoiceInputAdornment onTranscript={(txt) => setForm((p) => ({ ...p, middleName: (p.middleName + " " + txt).trim() }))} value={form.middleName} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
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
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select fullWidth
                          label="Gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          SelectProps={{ style: { fontWeight: "bold", fontSize: "1rem" } }}
                          sx={{ "& .MuiSelect-select": { fontWeight: "bold" }, minWidth: 140 }}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
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

                    {/* Contact Person details for Organisation */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, fontWeight: "bold", textTransform: "uppercase" }}>
                      CONTACT PERSON NAME *
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          select fullWidth
                          label="Title"
                          name="namePrefix"
                          value={form.namePrefix}
                          onChange={handleChange}
                          SelectProps={{ style: { fontWeight: "bold" } }}
                          sx={{ minWidth: 110 }}
                        >
                          <MenuItem value="Mr.">Mr.</MenuItem>
                          <MenuItem value="Mrs.">Mrs.</MenuItem>
                          <MenuItem value="Ms.">Ms.</MenuItem>
                          <MenuItem value="Dr.">Dr.</MenuItem>
                          <MenuItem value="Adv.">Adv.</MenuItem>
                          <MenuItem value="Prof.">Prof.</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth required
                          label="First Name *" name="repFirstName"
                          value={form.repFirstName} onChange={handleChange}
                          placeholder="First Name..."
                          error={Boolean(form.repFirstName && form.repFirstName.trim().length < 1)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField fullWidth
                          label="Middle Name" name="repMiddleName"
                          value={form.repMiddleName} onChange={handleChange}
                          placeholder="Middle Name..."
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField fullWidth required
                          label="Last Name *" name="repLastName"
                          value={form.repLastName} onChange={handleChange}
                          placeholder="Last Name..."
                          error={Boolean(form.repLastName && form.repLastName.trim().length < 1)}
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                )}
              </Box>

              {/* ROW 2 — CONTACT & SECURITY CREDENTIALS */}
              <Box>
                <Typography variant="caption" color="text.secondary"
                  sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, mb: 1, display: "block" }}>
                  2. Contact & Secret Login Credentials (संपर्क व गुप्त पासवर्ड)
                </Typography>
                <Grid container spacing={2}>
                  {/* Primary Mobile */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth required
                      label="Primary Mobile Number *"
                      name="mobile"
                      value={form.mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d\s-]/g, "").slice(0, mobCfg.maxDigits + 4);
                        setForm((p) => ({ ...p, mobile: val }));
                      }}
                      placeholder={`e.g. ${mobCfg.example}`}
                      error={Boolean(form.mobile && !isMobileValid)}
                      helperText={
                        form.mobile
                          ? isMobileValid
                            ? `✓ Valid ${mobCfg.name} number`
                            : `Invalid: Enter valid digits for ${mobCfg.name}`
                          : `Required for OTP verification`
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneCodeSelect
                              value={form.mobileCountryCode}
                              onChange={(code) => setForm((p) => ({ ...p, mobileCountryCode: code }))}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* WhatsApp */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="WhatsApp Number (Optional)"
                      name="whatsapp"
                      value={form.whatsapp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d\s-]/g, "").slice(0, waCfg.maxDigits + 4);
                        setForm((p) => ({ ...p, whatsapp: val }));
                      }}
                      placeholder={`e.g. ${waCfg.example}`}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneCodeSelect
                              value={form.waCountryCode}
                              onChange={(code) => setForm((p) => ({ ...p, waCountryCode: code }))}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth required
                      type="email"
                      label="Email Address *"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@domain.com"
                      error={Boolean(form.email && !isEmailValid)}
                      helperText={
                        form.email
                          ? isEmailValid
                            ? "✓ Valid email format"
                            : "सही ईमेल पता दर्ज करें"
                          : "Used for login and notifications"
                      }
                    />
                  </Grid>

                  {/* Password */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth required
                      type={showPassword ? "text" : "password"}
                      label="Secret Password *"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Choose strong password..."
                      error={Boolean(form.password && !isPasswordValid)}
                      autoComplete="new-password"
                      helperText={
                        form.password
                          ? isPasswordValid
                            ? "✓ Strong Password"
                            : "Min 8 chars: Upper, Lower, Number & Symbol"
                          : "Must include Upper, Lower, Number & Symbol"
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

                  {/* Confirm Password */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth required
                      type={showPassword ? "text" : "password"}
                      label="Confirm Password *"
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
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* ========================================================================= */}
              {/* CATEGORY-SPECIFIC TAILORED FORM FIELDS */}
              {/* ========================================================================= */}

              {/* ─ 1. IF OPTION 1: PROBLEM ASSISTANCE (CITIZEN / LITIGANT CLIENT) ─ */}
              {form.purpose === "PROBLEM" && (
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5, bgcolor: "#fff5f5", borderColor: "#fca5a5" }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#b91c1c" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <AssignmentLateIcon /> 3. Legal Problem & Dispute Details / कानूनी समस्या विवरण *
                  </Typography>

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
                              borderColor: isSelected ? "#d32f2f" : "#dde3ec",
                              bgcolor: isSelected ? "#fff" : "#fff",
                              borderRadius: 1.5,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              "&:hover": { borderColor: "#d32f2f" },
                            }}
                          >
                            {isSelected && (
                              <CheckCircleIcon sx={{ color: "#d32f2f", fontSize: 16 }} />
                            )}
                            <Typography variant="body2" fontWeight={isSelected ? 700 : 400}>
                              {cat}
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Problem Location details */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: "1px dashed #cbd5e1" }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary"
                      sx={{ display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
                      Problem Location Details (Optional / वैकल्पिक)
                    </Typography>
                    <Grid container spacing={1.5}>
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
                              problemDistrict: "",
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

                      <Grid item xs={12} sm={6}>
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
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
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

                  {/* Voice commentary mic dictation studio */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: "1px dashed #cbd5e1" }}>
                    <VoiceCommentaryStudio
                      value={form.problemDescription}
                      onChange={(newValue) => setForm(p => ({ ...p, problemDescription: newValue }))}
                      onVoiceNotesChange={(updatedNotes) => setForm(p => ({ ...p, problemVoiceFiles: updatedNotes }))}
                      label="🎙️ Describe your problem / अपनी समस्या विस्तार से बताएं (Optional)"
                      placeholder="यहाँ क्लिक करें और अपनी पूरी समस्या बोलें या टाइप करें..."
                    />
                  </Box>
                </Paper>
              )}

              {/* ─ 2. IF OPTION 2: ICJ THE SOLUTION WORLD (PROFESSIONAL PARTNER) ─ */}
              {form.purpose === "SERVICES" && (
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5, bgcolor: "#f5f8ff", borderColor: "#93c5fd" }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#1d4ed8" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <MiscellaneousServicesIcon /> 3. Professional Credentials & Practice Details / व्यावसायिक विवरण *
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2.5 }}>
                    {/* Professional Category */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        required
                        size="small"
                        label="Professional Category / व्यावसायिक श्रेणी *"
                        name="professionalCategory"
                        value={form.professionalCategory}
                        onChange={handleChange}
                        helperText="वकील, CA, CS, CMA या अन्य विशेषज्ञ श्रेणी चुनें"
                      >
                        {PROFESSIONAL_CATEGORIES.map((cat) => (
                          <MenuItem key={cat} value={cat}>
                            {cat}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Council Enrollment / Membership No */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Bar / ICAI / ICSI Reg No. (Optional)"
                        name="professionalRegNo"
                        value={form.professionalRegNo}
                        onChange={handleChange}
                        placeholder="e.g. UP/2026/1170, ICAI-098234, FCS-8812"
                        helperText="काउंसिल/संस्थान एनरोलमेंट नंबर (यदि उपलब्ध हो)"
                      />
                    </Grid>

                    {/* Experience */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Years of Experience / कार्य अनुभव"
                        name="professionalExperience"
                        value={form.professionalExperience}
                        onChange={handleChange}
                      >
                        {EXPERIENCE_OPTIONS.map((exp) => (
                          <MenuItem key={exp} value={exp}>
                            {exp}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Practice Courts / Jurisdictions */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Practice Courts / Jurisdictions"
                        name="practiceCourts"
                        value={form.practiceCourts}
                        onChange={handleChange}
                        placeholder="e.g. Supreme Court, High Court, NCLT, Tehsil"
                        helperText="न्यायालय या कार्यक्षेत्र जहाँ आप प्रैक्टिस करते हैं"
                      />
                    </Grid>

                    {/* Key Specializations */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Key Specializations / आपकी प्रमुख विशेषताएँ"
                        name="specializations"
                        value={form.specializations}
                        onChange={handleChange}
                        placeholder="e.g. Corporate Tax, GST, NCLT, Criminal Trials, Cyber Law, Arbitration"
                        helperText="अपनी विशेषताएँ लिखें (इन्हें बाद में प्रोफ़ाइल में कभी भी एडिट किया जा सकता है)"
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="caption" fontWeight="bold" color="text.secondary"
                    sx={{ display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Select the ICJ services you can offer or collaborate on *
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
                              borderColor: isSelected ? "#1565c0" : "#dde3ec",
                              bgcolor: isSelected ? "#fff" : "#fff",
                              borderRadius: 1.5,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              "&:hover": { borderColor: "#1565c0" },
                            }}
                          >
                            {isSelected && (
                              <CheckCircleIcon sx={{ color: "#1565c0", fontSize: 16 }} />
                            )}
                            <Typography variant="body2" fontWeight={isSelected ? 700 : 400}>
                              {cat}
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              )}

              {/* ─ 3. IF OPTION 3: FRANCHISE PARTNER ─ */}
              {form.purpose === "FRANCHISE" && (
                <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5, bgcolor: "#f5fff5", borderColor: "#86efac" }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#15803d" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <HandshakeIcon /> 3. Franchise Center Location & Premises / केंद्र विवरण *
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
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

                    <Grid item xs={12} sm={6}>
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

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth required size="small"
                        label="City / शहर *"
                        name="franchiseCity"
                        value={form.franchiseCity}
                        onChange={handleChange}
                        placeholder="City name..."
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
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
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth required
                        label="Background / Office Premises Details *"
                        name="franchiseBackground"
                        value={form.franchiseBackground}
                        onChange={handleChange}
                        placeholder="Detail your commercial premises, team, or legal background..."
                        multiline
                        rows={4}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* ICJ Enterprise Tech & Security Showcase Banner */}
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "#0f172a", color: "#fff", borderRadius: 2, border: "1px solid #334155" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 0.5 }}>
                      <SecurityIcon fontSize="small" /> 🚀 Powered by ICJ Next-Gen Enterprise Tech Architecture
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      Zero-Trust DRM Security | Multi-Party Encrypted Chamber | Direct Role Routing
                    </Typography>
                  </Box>
                  <Button size="small" variant="contained" color="warning" onClick={() => setTechShowcaseOpen(true)} sx={{ fontWeight: "bold" }}>
                    EXPLORE TECH SHOWCASE 🛡️
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
                    I agree to the ICJ onboarding terms, <Button variant="text" size="small" onClick={() => setLegalModalOpen(true)} sx={{ p: 0, textTransform: "none", textDecoration: "underline", fontWeight: "bold" }}>IT Act Sec 79 Intermediary Immunity, DPDP Act 2023 & Push Alert Consent</Button>, and verification process.
                  </Typography>
                }
              />

              <PlatformLegalTermsModal
                open={legalModalOpen}
                onClose={() => setLegalModalOpen(false)}
                onAccept={() => setForm(p => ({ ...p, termsAccepted: true }))}
                mode="litigant"
                userName={`${form.firstName} ${form.lastName}`}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              <Button
                fullWidth size="large" variant="contained"
                onClick={handleContinueClick}
                disabled={submitting}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.6,
                  fontWeight: 800,
                  borderRadius: 2,
                  fontSize: "1.1rem",
                  bgcolor: selectedPurposeObj?.color || "#002855",
                  "&:hover": { bgcolor: selectedPurposeObj?.color || "#001a38" },
                }}
              >
                SUBMIT REGISTRATION & VERIFY OTP ➔
              </Button>

            </Stack>
          </Paper>
        )}

        {/* ========================================================================= */}
        {/* SUCCESS STAGE */}
        {/* ========================================================================= */}
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

            <Paper variant="outlined" sx={{ p: 3, mb: 4, textAlign: "left", bgcolor: "#f8fafc", borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">PERMANENT MEMBER ID</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontFamily: "monospace" }}>
                    {createdMember.member_id || createdMember.memberId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">APPLICANT NAME</Typography>
                  <Typography variant="subtitle1" fontWeight="bold">{createdMember.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">REGISTERED EMAIL</Typography>
                  <Typography variant="body2" fontWeight="bold">{createdMember.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">MOBILE NUMBER</Typography>
                  <Typography variant="body2" fontWeight="bold">{createdMember.mobile}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">ASSIGNED ROLE & PORTAL</Typography>
                  <Typography variant="body2" fontWeight="bold" color="secondary.main">
                    {createdMember.role === "advocate" ? "⚖️ ICJ Professional Chambers" : createdMember.role === "franchise" ? "🏢 District Franchise Desk" : "👤 Litigant Client Portal"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">VERIFICATION STATUS</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    🟢 {createdMember.verification_status || "Approved & Active"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadReceipt}
                sx={{ fontWeight: "bold" }}
              >
                Download Registration Receipt (.TXT)
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (createdMember.role === "advocate") navigate("/advocate-dashboard");
                  else if (createdMember.role === "franchise") navigate("/franchise-dashboard");
                  else navigate("/client-portal");
                }}
                sx={{ fontWeight: "bold", px: 4 }}
              >
                Enter Your Dashboard ➔
              </Button>
            </Stack>
          </Paper>
        )}

      </Container>

      {/* OTP Verification Modal */}
      <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          🔒 Enter Verification OTP
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
            A 6-digit verification code has been sent to <strong>{form.email}</strong>.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            label="6-Digit OTP Code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            inputProps={{ style: { textAlign: "center", fontSize: "1.4rem", letterSpacing: 4 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: "center" }}>
          <Button onClick={() => setOtpModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleOtpVerify} disabled={submitting || otpCode.length < 4}>
            Verify & Activate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
