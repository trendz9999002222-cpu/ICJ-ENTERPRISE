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
import GavelIcon           from "@mui/icons-material/Gavel";
import AccountBalanceIcon  from "@mui/icons-material/AccountBalance";
import SecurityIcon        from "@mui/icons-material/Security";
import DescriptionIcon     from "@mui/icons-material/Description";
import VerifiedIcon        from "@mui/icons-material/Verified";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton     from "@mui/material/IconButton";
import Visibility     from "@mui/icons-material/Visibility";
import VisibilityOff  from "@mui/icons-material/VisibilityOff";
import LockIcon       from "@mui/icons-material/Lock";
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
import { PAN_INDIA_STATES, PAN_INDIA_DISTRICTS_MAP, DEFAULT_STATE, DEFAULT_DISTRICT } from "../data/panIndiaMaster.js";
import { LEGAL_TAXONOMY_CATEGORIES, EXPERIENCE_LEVELS } from "../data/legalTaxonomyMaster.js";

// ─── PURPOSE MASTER & CAPACITY OPTIONS (100% ENGLISH) ───────────────────────

const PURPOSE_OPTIONS = [
  {
    value: "PROBLEM",
    label: "1. Your Problem, Our Solution — Litigant Client Assistance",
    shortTitle: "Your Problem, Our Solution",
    sublabel: "Legal grievance assistance, case filing, notice handling, court litigation, or dispute resolution",
    roleBadge: "Role: Litigant Client | Allocated Serial: 26CLT08AA....",
    targetRole: "member",
    icon: AssignmentLateIcon,
    color: "#d32f2f",
    bg:    "#fff5f5",
    selectedBg: "#ffebee",
  },
  {
    value: "SERVICES",
    label: "2. ICJ, The Solution World — Professional Legal & Financial Partner",
    shortTitle: "ICJ, The Solution World",
    sublabel: "Join the ICJ network as an Advocate, CA, CS, CMA, Arbitrator, Notary, or Legal Specialist",
    roleBadge: "Role: ICJ Professional Partner | Allocated Serial: 26ICJ08AA....",
    targetRole: "advocate",
    icon: MiscellaneousServicesIcon,
    color: "#1565c0",
    bg:    "#f5f8ff",
    selectedBg: "#e3f2fd",
  },
  {
    value: "FRANCHISE",
    label: "3. Become an ICJ Franchisee Partner — District Legal Service Node",
    shortTitle: "Become an ICJ Franchisee Partner",
    sublabel: "Establish, manage, and operate an official ICJ District Legal Service & Tech Center",
    roleBadge: "Role: District Franchisee Node | Allocated Serial: 26FRZ08AA....",
    targetRole: "franchise",
    icon: HandshakeIcon,
    color: "#2e7d32",
    bg:    "#f5fff5",
    selectedBg: "#e8f5e9",
  },
];

const PROBLEM_CATEGORIES = [
  "Property & Real Estate Disputes",
  "Criminal Litigation & Defense",
  "Civil Suits & Contractual Disputes",
  "Cyber Crime & Online Financial Fraud",
  "Matrimonial, Divorce & Family Disputes",
  "Cheque Bounce (Sec 138) & Debt Recovery",
  "Consumer Forum & Service Deficiency Claims",
  "Labour, Industrial & Employment Matters",
  "Human Rights & Public Interest Grievances",
  "Taxation, GST & Revenue Adjudications",
  "Motor Accident Claims Tribunal (MACT)",
  "Banking, SARFAESI & DRT Proceedings",
  "Other Legal & Administrative Matter",
];

const SERVICE_OFFERINGS = [
  "Comprehensive Legal Consultation",
  "Arbitration & Dispute Mediation",
  "Contract & Legal Documentation Drafting",
  "Statutory Legal & Corporate Audit",
  "Notarisation & Attestation Services",
  "High Court & District Court Representation",
  "Property Title Search & 30-Year Search Report",
  "Banking & Corporate Debt Recovery",
  "Cyber Law Advisory & Compliance",
  "Human Rights Defense Desk",
  "Intellectual Property (IPR) Registration",
  "Other ICJ Collaborative Service",
];

// Helper to map category icons
const CATEGORY_ICON_MAP = {
  Gavel: GavelIcon,
  AccountBalance: AccountBalanceIcon,
  Handshake: HandshakeIcon,
  Verified: VerifiedIcon,
  Security: SecurityIcon,
  Description: DescriptionIcon,
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function PublicOnboarding() {
  const navigate = useNavigate();
  const { setSessionUser } = useAuth();

  // Tech Showcase & Privacy Modal State
  const [techShowcaseOpen, setTechShowcaseOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  // ─── Two-Tier Taxonomy State ─────────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState(LEGAL_TAXONOMY_CATEGORIES[0].id);

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
    
    // Client Problem Assistance Fields
    problemCategories: [],
    problemState:      DEFAULT_STATE,
    problemDistrict:   DEFAULT_DISTRICT,
    problemCity:       "",
    problemPincode:    "",
    problemPoliceStation: "",
    problemDescription: "",
    problemVoiceFiles: [],

    // Professional Partner Two-Tier Fields
    professionalCategory: LEGAL_TAXONOMY_CATEGORIES[0].categoryName,
    professionalSubCategory: LEGAL_TAXONOMY_CATEGORIES[0].subCategories[0].title,
    professionalRegNo: "",
    professionalExperience: EXPERIENCE_LEVELS[2], // "Senior Professional (5 - 10 Years)"
    practiceState: DEFAULT_STATE,
    practiceDistrict: DEFAULT_DISTRICT,
    practiceCourts: "Supreme Court of India, High Court & District Courts",
    specializations: LEGAL_TAXONOMY_CATEGORIES[0].subCategories[0].defaultSpecialization,
    solutionServices:  [],

    // Franchise Partner Fields
    franchiseState:    DEFAULT_STATE,
    franchiseDistrict: DEFAULT_DISTRICT,
    franchiseCity:     "",
    franchisePincode:  "",
    franchiseBackground: "",
    termsAccepted:     false,
  });

  // ─── UI State: "GATEWAY" -> "FORM" -> "SUCCESS" ──────────────────────────
  const [stage,        setStage]        = useState("GATEWAY");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode,      setOtpCode]      = useState("123456");
  const [otpChannel,   setOtpChannel]   = useState("Email");
  const [createdMember,setCreatedMember]= useState(null);
  const [submitting,   setSubmitting]   = useState(false);  
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");

  // ─── Phone config ────────────────────────────────────────────────────────
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
      setError("Please select one of the 3 joining capacities to continue.");
      return;
    }
    setError("");
    setStage("FORM");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategoryId(category.id);
    setForm((prev) => ({
      ...prev,
      professionalCategory: category.categoryName,
      professionalSubCategory: category.subCategories[0]?.title || "",
      specializations: category.subCategories[0]?.defaultSpecialization || prev.specializations,
    }));
  };

  const handleSubCategorySelect = (subCat) => {
    setForm((prev) => ({
      ...prev,
      professionalSubCategory: subCat.title,
      specializations: subCat.defaultSpecialization || prev.specializations,
    }));
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
      setError("Please provide applicant first and last name (or registered organisation name).");
      return;
    }
    if (!isMobileValid) {
      setError(`Please enter a valid mobile number for ${mobCfg.name} (${mobCfg.dial_code}).`);
      return;
    }
    if (!isEmailValid) {
      setError("Please enter a valid corporate or personal email address.");
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
      setError("Please accept the ICJ enterprise platform terms and conditions to proceed.");
      return;
    }

    setSubmitting(true);
    try {
      const email = form.email.trim();
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
        alert(verifyRes.message || "Invalid OTP verification code.");
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
        professionalSubCategory: form.professionalSubCategory,
        professionalRegNo: form.professionalRegNo,
        professionalExperience: form.professionalExperience,
        practiceState: form.practiceState,
        practiceDistrict: form.practiceDistrict,
        practiceCourts: form.practiceCourts,
        specializations: form.specializations,
        purpose:    purposeLabel,
        purposeCode: form.purpose,
        problemCategories: form.problemCategories,
        problemState: form.problemState,
        problemDistrict: form.problemDistrict,
        problemCity: form.problemCity,
        problemPincode: form.problemPincode,
        problemPoliceStation: form.problemPoliceStation,
        solutionServices: form.solutionServices,
        franchiseState: form.franchiseState,
        franchiseDistrict: form.franchiseDistrict,
        franchiseCity: form.franchiseCity,
        franchisePincode: form.franchisePincode,
        franchiseBackground: form.franchiseBackground,
        education: form.purpose === "SERVICES" ? "Professional Degree / Certified Council" : "Graduate / Professional",
        profession: form.purpose === "SERVICES" ? form.professionalSubCategory : (form.profession || "Individual / Corporate Client"),
        areaOfInterest: "Enterprise Legal Ecosystem",
        eGovPortals: ["e-Courts Cause List & Orders", "District Land & Revenue Records"],
        engagementIntent: "Verified Legal Ecosystem Onboarding",
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
      
      // Dual-sync into AuthService enterprise user storage
      try {
        await AuthService.register(payload);
      } catch (e) {
        console.log("AuthService sync notice:", e.message);
      }

      // Background notification
      try {
        import("../services/pushNotificationService.js").then((mod) => {
          const pns = mod.default || mod.PushNotificationService;
          pns.sendBackgroundPush({
            title: "🔔 New Member Registered!",
            body: `Applicant ${finalMember.fullName} (ID: ${finalMember.member_id || finalMember.id}) registered — Assigned Role: ${finalMember.role}`,
            url: "/super-admin-dashboard",
          });
        });
      } catch (e) {}

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
OFFICIAL MEMBER REGISTRATION ACKNOWLEDGEMENT
--------------------------------------------------
PERMANENT MEMBER ID : ${createdMember.member_id || createdMember.memberId}
APPLICANT NAME      : ${createdMember.name}
APPLICANT TYPE      : ${createdMember.regType || createdMember.memberType}
ASSIGNED ROLE       : ${createdMember.role}
DESIGNATION         : ${createdMember.profession || createdMember.professionalSubCategory || "Member"}
PRIMARY EMAIL       : ${createdMember.email}
MOBILE NUMBER       : ${createdMember.mobile}
PURPOSE             : ${createdMember.purpose}
REGISTRATION DATE   : ${new Date(createdMember.created_at).toLocaleString()}
VERIFICATION STATUS : ${createdMember.verification_status || "Approved & Active"}
--------------------------------------------------
Thank you for joining the ICJ Enterprise Ecosystem.
`;
    const el = document.createElement("a");
    el.href  = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    el.download = `ICJ_REGISTRATION_${createdMember.member_id || "RECEIPT"}.txt`;
    document.body.appendChild(el); el.click(); document.body.removeChild(el);
  };

  const selectedPurposeObj = PURPOSE_OPTIONS.find((p) => p.value === form.purpose);
  const activeTaxonomyCategory = LEGAL_TAXONOMY_CATEGORIES.find((c) => c.id === selectedCategoryId) || LEGAL_TAXONOMY_CATEGORIES[0];

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="lg">

        {/* BRANDING HEADER */}
        <Paper elevation={0} sx={{
          p: { xs: 2.5, sm: 3, md: 4 }, mb: 3.5, bgcolor: "#0f172a", color: "#fff",
          borderRadius: 3, textAlign: "center",
          boxShadow: "0 8px 32px rgba(15,23,42,0.15)",
        }}>
          <Typography variant="overline" sx={{ letterSpacing: 2.5, color: "#38bdf8", fontWeight: 800 }}>
            INTERNATIONAL CONSORTIUM OF JURISTS
          </Typography>
          <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5, mb: 1, letterSpacing: -0.5 }}>
            ENTERPRISE APPLICANT ONBOARDING GATEWAY
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.85, maxWidth: 650, mx: "auto", fontSize: "0.95rem" }}>
            Secure Digital Identity, Professional Empanelment & Legal Infrastructure Gateway
          </Typography>
        </Paper>

        {/* ========================================================================= */}
        {/* STEP 2 & 3 : DEDICATED CATEGORY SELECTION GATEWAY */}
        {/* ========================================================================= */}
        {stage === "GATEWAY" && (
          <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Chip label="STEP 1 OF 2 — CHOOSE YOUR JOINING CAPACITY" color="primary" sx={{ fontWeight: 800, mb: 1.5, px: 1 }} />
              <Typography variant="h4" fontWeight={900} color="text.primary" sx={{ letterSpacing: -0.5 }}>
                WHAT BRINGS YOU TO ICJ?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 620, mx: "auto" }}>
                Please select your primary operational capacity to proceed with customized registration:
              </Typography>
            </Box>

            {error && (
              <Alert severity="warning" sx={{ mb: 3, fontWeight: "bold" }}>
                {error}
              </Alert>
            )}

            {/* 3 Prominent Capacity Options (Full Width, Zero Truncation) */}
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
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: 2.5,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor: isSelected ? opt.color : "#e2e8f0",
                      bgcolor: isSelected ? opt.selectedBg : opt.bg,
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 2.5,
                      "&:hover": {
                        borderColor: opt.color,
                        bgcolor: opt.selectedBg,
                        transform: "translateY(-2px)",
                        boxShadow: `0 6px 20px ${opt.color}25`,
                      },
                    }}
                  >
                    <Box sx={{
                      width: 56, height: 56, borderRadius: "50%",
                      bgcolor: isSelected ? opt.color : "#ffffff",
                      color: isSelected ? "#ffffff" : opt.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                      flexShrink: 0
                    }}>
                      <Icon sx={{ fontSize: 32 }} />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h6" fontWeight={800} color={isSelected ? opt.color : "text.primary"}>
                        {opt.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                        {opt.sublabel}
                      </Typography>
                      {opt.roleBadge && (
                        <Chip
                          label={opt.roleBadge}
                          size="small"
                          sx={{
                            mt: 1.2,
                            fontWeight: 800,
                            fontSize: "0.78rem",
                            bgcolor: isSelected ? opt.color : "#e2e8f0",
                            color: isSelected ? "#ffffff" : "#334155",
                          }}
                        />
                      )}
                    </Box>

                    {isSelected ? (
                      <CheckCircleIcon sx={{ color: opt.color, fontSize: 32, flexShrink: 0 }} />
                    ) : (
                      <Box sx={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid #cbd5e1", flexShrink: 0 }} />
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
                  py: 1.8,
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  borderRadius: 2,
                  bgcolor: selectedPurposeObj?.color || "#0f172a",
                  "&:hover": { bgcolor: selectedPurposeObj?.color || "#020617" },
                }}
              >
                CONTINUE TO APPLICATION FORM ➔
              </Button>

              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                color="inherit"
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Already have an ICJ account? Sign In
              </Button>
            </Stack>
          </Paper>
        )}

        {/* ========================================================================= */}
        {/* STEP 4 & 5 : RELEVANT TAILORED REGISTRATION FORM */}
        {/* ========================================================================= */}
        {stage === "FORM" && (
          <Paper component="form" onSubmit={(e) => { e.preventDefault(); if (isFormValid) handleContinueClick(); }} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
            
            {/* Top Navigation & Category Summary Banner */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => setStage("GATEWAY")}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 800, textTransform: "none" }}
              >
                ← Back to Category Selection
              </Button>

              {selectedPurposeObj && (
                <Chip
                  label={selectedPurposeObj.roleBadge}
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    bgcolor: selectedPurposeObj.color,
                    color: "#ffffff",
                    px: 1,
                  }}
                />
              )}
            </Stack>

            {/* Banner of Active Form */}
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                mb: 4,
                borderRadius: 2,
                bgcolor: selectedPurposeObj?.selectedBg || "#f8fafc",
                borderColor: selectedPurposeObj?.color || "#cbd5e1",
                borderLeft: `6px solid ${selectedPurposeObj?.color || "#0f172a"}`,
              }}
            >
              <Typography variant="h6" fontWeight={800} color={selectedPurposeObj?.color || "text.primary"}>
                {selectedPurposeObj?.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Please provide accurate verified details to complete your enterprise registration.
              </Typography>
            </Paper>

            <Stack spacing={4}>

              {/* Applicant Type */}
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 800, fontSize: "0.95rem", mb: 0.5, color: "text.primary" }}>
                  Applicant Entity Type *
                </FormLabel>
                <RadioGroup row name="regType" value={form.regType} onChange={handleRegTypeChange}>
                  <FormControlLabel value="Individual"   control={<Radio color="primary"   />} label={FieldGovernanceService.getWording("onboarding_ind_label", "Individual Applicant / Professional")} />
                  <FormControlLabel value="Organisation" control={<Radio color="secondary" />} label={FieldGovernanceService.getWording("onboarding_org_label", "Organisation / Firm / Corporate Entity")} />
                </RadioGroup>
              </FormControl>

              {/* SECTION 1 — NAME & DEMOGRAPHICS */}
              <Box>
                <Typography variant="subtitle2" color="primary.main"
                  sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, mb: 2 }}>
                  1. Applicant Identification & Demographics
                </Typography>
                {form.regType === "Individual" ? (
                  <Stack spacing={2.5}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          select fullWidth
                          label="Title"
                          name="namePrefix"
                          value={form.namePrefix}
                          onChange={handleChange}
                          SelectProps={{ style: { fontWeight: "bold" } }}
                        >
                          <MenuItem value="Mr.">Mr.</MenuItem>
                          <MenuItem value="Mrs.">Mrs.</MenuItem>
                          <MenuItem value="Ms.">Ms.</MenuItem>
                          <MenuItem value="Dr.">Dr.</MenuItem>
                          <MenuItem value="Adv.">Adv.</MenuItem>
                          <MenuItem value="Prof.">Prof.</MenuItem>
                          <MenuItem value="CA">CA</MenuItem>
                          <MenuItem value="CS">CS</MenuItem>
                          <MenuItem value="CMA">CMA</MenuItem>
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

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select fullWidth
                          label="Gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
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
                                ? `Valid (Approx Age: ${currentYear - Number(form.birthYear)} years)`
                                : `Must be between ${minBirthYear} and ${maxBirthYear}`
                              : "Select year of birth"
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
                  <Stack spacing={2.5}>
                    <TextField fullWidth required
                      label="Registered Corporate / Entity / Firm Name *" name="orgName"
                      value={form.orgName} onChange={handleChange}
                      placeholder="Official registered company, partnership or LLP name..."
                      helperText="Full legal name as registered with MCA / Registrar of Firms"
                    />

                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 800, textTransform: "uppercase" }}>
                      Authorized Signatory / Representative Name *
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          select fullWidth
                          label="Title"
                          name="namePrefix"
                          value={form.namePrefix}
                          onChange={handleChange}
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
                          label="Representative First Name *" name="repFirstName"
                          value={form.repFirstName} onChange={handleChange}
                          placeholder="First Name..."
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
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                )}
              </Box>

              {/* SECTION 2 — CONTACT & SECURITY CREDENTIALS */}
              <Box>
                <Typography variant="subtitle2" color="primary.main"
                  sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, mb: 2 }}>
                  2. Contact & Secret Login Credentials
                </Typography>
                <Grid container spacing={2.5}>
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
                            ? `Valid mobile number`
                            : `Invalid digits for ${mobCfg.name}`
                          : `Used for OTP authentication`
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
                      helperText="Official email used for account security and case notifications"
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
                      placeholder="Enter strong password..."
                      error={Boolean(form.password && !isPasswordValid)}
                      autoComplete="new-password"
                      helperText="Must be 8+ chars with uppercase, lowercase, number & symbol"
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
                            ? "Passwords match"
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

              {/* ========================================================================= */}
              {/* CATEGORY-SPECIFIC TAILORED FORM FIELDS */}
              {/* ========================================================================= */}

              {/* ─ 1. IF OPTION 1: LITIGANT CLIENT ASSISTANCE ─ */}
              {form.purpose === "PROBLEM" && (
                <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 2.5, bgcolor: "#fff5f5", borderColor: "#fca5a5" }}>
                  <Typography variant="h6" fontWeight={800} color="#b91c1c" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <AssignmentLateIcon /> 3. Legal Dispute & Case Particulars
                  </Typography>

                  <Typography variant="caption" fontWeight={800} color="text.secondary"
                    sx={{ display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Select Problem Classification * (Select Multiple)
                  </Typography>
                  <Grid container spacing={1.5} sx={{ mb: 3 }}>
                    {PROBLEM_CATEGORIES.map((cat) => {
                      const isSelected = (form.problemCategories || []).includes(cat);
                      return (
                        <Grid item xs={12} sm={6} key={cat}>
                          <Paper
                            elevation={0}
                            onClick={() => handleToggleCategory(cat)}
                            sx={{
                              p: 1.8,
                              border: "2px solid",
                              borderColor: isSelected ? "#d32f2f" : "#e2e8f0",
                              bgcolor: isSelected ? "#ffffff" : "#ffffff",
                              borderRadius: 2,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 1.2,
                              "&:hover": { borderColor: "#d32f2f" },
                            }}
                          >
                            {isSelected && (
                              <CheckCircleIcon sx={{ color: "#d32f2f", fontSize: 18 }} />
                            )}
                            <Typography variant="body2" fontWeight={isSelected ? 800 : 500}>
                              {cat}
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Complete Pan-India Problem Location */}
                  <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px dashed #cbd5e1" }}>
                    <Typography variant="caption" fontWeight={800} color="text.secondary"
                      sx={{ display: "block", mb: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>
                      Dispute Jurisdiction & Location Details (Pan-India)
                    </Typography>
                    <Grid container spacing={2}>
                      {/* State Dropdown (All 28 States + 8 UTs) */}
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          disableClearable
                          options={PAN_INDIA_STATES}
                          value={form.problemState}
                          onChange={(_, newValue) => {
                            setForm(p => ({
                              ...p,
                              problemState: newValue,
                              problemDistrict: PAN_INDIA_DISTRICTS_MAP[newValue]?.[0] || "",
                            }));
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="State / Union Territory *"
                              name="problemState"
                            />
                          )}
                        />
                      </Grid>

                      {/* District Dropdown (All Districts of Selected State) */}
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          disableClearable
                          options={PAN_INDIA_DISTRICTS_MAP[form.problemState] || []}
                          value={form.problemDistrict}
                          onChange={(_, newValue) => {
                            setForm(p => ({
                              ...p,
                              problemDistrict: newValue,
                            }));
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="District *"
                              name="problemDistrict"
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="City / Tehsil"
                          name="problemCity"
                          value={form.problemCity}
                          onChange={handleChange}
                          placeholder="City or Tehsil name..."
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Pincode"
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

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Police Station (Thana)"
                          name="problemPoliceStation"
                          value={form.problemPoliceStation}
                          onChange={handleChange}
                          placeholder="Jurisdictional police station..."
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Voice commentary studio */}
                  <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px dashed #cbd5e1" }}>
                    <VoiceCommentaryStudio
                      value={form.problemDescription}
                      onChange={(newValue) => setForm(p => ({ ...p, problemDescription: newValue }))}
                      onVoiceNotesChange={(updatedNotes) => setForm(p => ({ ...p, problemVoiceFiles: updatedNotes }))}
                      label="🎙️ Spoken Grievance Dictation & Voice Notes (Optional)"
                      placeholder="Click mic to record your case details or type your problem..."
                    />
                  </Box>
                </Paper>
              )}

              {/* ─ 2. IF OPTION 2: TWO-TIER HIERARCHICAL PROFESSIONAL SELECTOR ─ */}
              {form.purpose === "SERVICES" && (
                <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 2.5, bgcolor: "#f0fdf4", borderColor: "#86efac" }}>
                  <Typography variant="h6" fontWeight={800} color="#166534" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <MiscellaneousServicesIcon /> 3. Professional Empanelment & Practice Hierarchy
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select your primary professional vertical (Tier 1) and exact designation / practice discipline (Tier 2):
                  </Typography>

                  {/* TIER 1: PRIMARY CATEGORIES */}
                  <Typography variant="subtitle2" fontWeight={800} color="text.primary" sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Tier 1: Select Professional Vertical *
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {LEGAL_TAXONOMY_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategoryId === cat.id;
                      const IconComp = CATEGORY_ICON_MAP[cat.icon] || GavelIcon;
                      return (
                        <Grid item xs={12} sm={6} md={4} key={cat.id}>
                          <Paper
                            elevation={isSelected ? 3 : 0}
                            onClick={() => handleCategoryChange(cat)}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              cursor: "pointer",
                              border: "2px solid",
                              borderColor: isSelected ? cat.color : "#e2e8f0",
                              bgcolor: isSelected ? cat.bg : "#ffffff",
                              transition: "all 0.18s ease",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                              minHeight: 90,
                              "&:hover": {
                                borderColor: cat.color,
                                bgcolor: cat.bg,
                              },
                            }}
                          >
                            <Box sx={{
                              width: 38, height: 38, borderRadius: "50%",
                              bgcolor: isSelected ? cat.color : "#f1f5f9",
                              color: isSelected ? "#ffffff" : cat.color,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0
                            }}>
                              <IconComp fontSize="small" />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" fontWeight={800} color={isSelected ? cat.color : "text.primary"}>
                                {cat.categoryName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3, lineHeight: 1.3 }}>
                                {cat.description}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* TIER 2: SUB-CATEGORIES FOR SELECTED VERTICAL (Full Width, Zero Truncation) */}
                  <Paper sx={{ p: 2.5, mb: 3.5, bgcolor: "#ffffff", borderRadius: 2, border: `1.5px solid ${activeTaxonomyCategory.color}40` }}>
                    <Typography variant="subtitle2" fontWeight={800} color={activeTaxonomyCategory.color} sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
                      Tier 2: Select Specific Designation / Practice Role in {activeTaxonomyCategory.categoryName} *
                    </Typography>
                    <Grid container spacing={1.5}>
                      {activeTaxonomyCategory.subCategories.map((subCat) => {
                        const isSubSelected = form.professionalSubCategory === subCat.title;
                        return (
                          <Grid item xs={12} key={subCat.id}>
                            <Paper
                              elevation={0}
                              onClick={() => handleSubCategorySelect(subCat)}
                              sx={{
                                p: 1.8,
                                border: "2px solid",
                                borderColor: isSubSelected ? activeTaxonomyCategory.color : "#e2e8f0",
                                bgcolor: isSubSelected ? activeTaxonomyCategory.bg : "#ffffff",
                                borderRadius: 1.5,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1.5,
                                "&:hover": {
                                  borderColor: activeTaxonomyCategory.color,
                                },
                              }}
                            >
                              <Typography variant="body1" fontWeight={isSubSelected ? 800 : 500} color={isSubSelected ? activeTaxonomyCategory.color : "text.primary"}>
                                {subCat.title}
                              </Typography>
                              {isSubSelected ? (
                                <CheckCircleIcon sx={{ color: activeTaxonomyCategory.color, fontSize: 22 }} />
                              ) : (
                                <Box sx={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #cbd5e1" }} />
                              )}
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>

                  {/* Dynamic Registration Number & Practice Jurisdictions */}
                  <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={activeTaxonomyCategory.regFieldLabel}
                        name="professionalRegNo"
                        value={form.professionalRegNo}
                        onChange={handleChange}
                        placeholder="e.g. D/1234/2020, ICAI-098234, FCS-8812, License No."
                        helperText="Official council, bar, institute, or government registration identifier"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        select fullWidth
                        label="Years of Professional Experience *"
                        name="professionalExperience"
                        value={form.professionalExperience}
                        onChange={handleChange}
                      >
                        {EXPERIENCE_LEVELS.map((exp) => (
                          <MenuItem key={exp} value={exp}>
                            {exp}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Primary Practice State (Pan-India Master) */}
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        disableClearable
                        options={PAN_INDIA_STATES}
                        value={form.practiceState}
                        onChange={(_, newValue) => {
                          setForm(p => ({
                            ...p,
                            practiceState: newValue,
                            practiceDistrict: PAN_INDIA_DISTRICTS_MAP[newValue]?.[0] || "",
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            label="Primary Practice State / Union Territory *"
                            name="practiceState"
                          />
                        )}
                      />
                    </Grid>

                    {/* Primary Practice District */}
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        disableClearable
                        options={PAN_INDIA_DISTRICTS_MAP[form.practiceState] || []}
                        value={form.practiceDistrict}
                        onChange={(_, newValue) => {
                          setForm(p => ({
                            ...p,
                            practiceDistrict: newValue,
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            label="Primary Practice District *"
                            name="practiceDistrict"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Practice Courts, Tribunals & Jurisdictions"
                        name="practiceCourts"
                        value={form.practiceCourts}
                        onChange={handleChange}
                        placeholder="e.g. Supreme Court of India, Delhi High Court, NCLT Principal Bench, District Courts"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Key Areas of Expertise & Specializations"
                        name="specializations"
                        value={form.specializations}
                        onChange={handleChange}
                        placeholder="e.g. Corporate Tax, GST, NCLT Insolvency, Criminal Appeals, Arbitration, IPR"
                        helperText="You can update and expand your specializations anytime from your profile desk"
                      />
                    </Grid>
                  </Grid>

                  {/* Collaborative Services */}
                  <Typography variant="caption" fontWeight={800} color="text.secondary"
                    sx={{ display: "block", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Select ICJ Services you can offer or collaborate on:
                  </Typography>
                  <Grid container spacing={1.5}>
                    {SERVICE_OFFERINGS.map((cat) => {
                      const isSelected = (form.solutionServices || []).includes(cat);
                      return (
                        <Grid item xs={12} sm={6} key={cat}>
                          <Paper
                            elevation={0}
                            onClick={() => handleToggleService(cat)}
                            sx={{
                              p: 1.8,
                              border: "1.5px solid",
                              borderColor: isSelected ? "#1565c0" : "#e2e8f0",
                              bgcolor: isSelected ? "#eff6ff" : "#ffffff",
                              borderRadius: 1.5,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 1.2,
                              "&:hover": { borderColor: "#1565c0" },
                            }}
                          >
                            {isSelected && (
                              <CheckCircleIcon sx={{ color: "#1565c0", fontSize: 18 }} />
                            )}
                            <Typography variant="body2" fontWeight={isSelected ? 800 : 500}>
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
                <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 2.5, bgcolor: "#f5fff5", borderColor: "#86efac" }}>
                  <Typography variant="h6" fontWeight={800} color="#15803d" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <HandshakeIcon /> 3. District Franchise Node & Infrastructure Particulars
                  </Typography>

                  <Grid container spacing={2.5}>
                    {/* Pan-India State Master */}
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        disableClearable
                        options={PAN_INDIA_STATES}
                        value={form.franchiseState}
                        onChange={(_, newValue) => {
                          setForm(p => ({
                            ...p,
                            franchiseState: newValue,
                            franchiseDistrict: PAN_INDIA_DISTRICTS_MAP[newValue]?.[0] || "",
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            required
                            label="Target State / Union Territory *"
                            name="franchiseState"
                          />
                        )}
                      />
                    </Grid>

                    {/* Pan-India District Master */}
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        disableClearable
                        options={PAN_INDIA_DISTRICTS_MAP[form.franchiseState] || []}
                        value={form.franchiseDistrict}
                        onChange={(_, newValue) => {
                          setForm(p => ({
                            ...p,
                            franchiseDistrict: newValue,
                          }));
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            required
                            label="Target District *"
                            name="franchiseDistrict"
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth required
                        label="City / Center Location *"
                        name="franchiseCity"
                        value={form.franchiseCity}
                        onChange={handleChange}
                        placeholder="City or Tehsil name..."
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth required
                        label="Pincode *"
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
                        label="Commercial Infrastructure, Office Premises & Background Details *"
                        name="franchiseBackground"
                        value={form.franchiseBackground}
                        onChange={handleChange}
                        placeholder="Detail your commercial office space, IT infrastructure, legal/business experience, and operational readiness..."
                        multiline
                        rows={4}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* ICJ Enterprise Tech & Security Showcase Banner */}
              <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "#0f172a", color: "#fff", borderRadius: 2, border: "1px solid #334155" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 0.8 }}>
                      <SecurityIcon fontSize="small" /> Powered by ICJ Next-Gen Enterprise Legal-Tech Architecture
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      Zero-Trust DRM Security | End-to-End Encryption | Instant Dynamic Role-Based Routing
                    </Typography>
                  </Box>
                  <Button size="small" variant="contained" color="warning" onClick={() => setTechShowcaseOpen(true)} sx={{ fontWeight: 800 }}>
                    EXPLORE TECH ARCHITECTURE 🛡️
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
                    I agree to the ICJ onboarding terms, <Button variant="text" size="small" onClick={() => setLegalModalOpen(true)} sx={{ p: 0, textTransform: "none", textDecoration: "underline", fontWeight: "bold" }}>IT Act Section 79 Intermediary Immunity, DPDP Act 2023 & Push Alert Consent</Button>, and digital verification process.
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
                  py: 1.8,
                  fontWeight: 900,
                  borderRadius: 2,
                  fontSize: "1.1rem",
                  bgcolor: selectedPurposeObj?.color || "#0f172a",
                  "&:hover": { bgcolor: selectedPurposeObj?.color || "#020617" },
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
            <Typography variant="h4" fontWeight={900} color="primary.main" gutterBottom>
              REGISTRATION & ACTIVATION SUCCESSFUL!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your permanent member account has been registered and verified. Below are your official credentials.
            </Typography>

            <Paper variant="outlined" sx={{ p: 3, mb: 4, textAlign: "left", bgcolor: "#f8fafc", borderRadius: 2 }}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">PERMANENT SERIAL ID</Typography>
                  <Typography variant="h6" fontWeight={900} color="primary.main" sx={{ fontFamily: "monospace" }}>
                    {createdMember.member_id || createdMember.memberId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">APPLICANT NAME</Typography>
                  <Typography variant="subtitle1" fontWeight={800}>{createdMember.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">REGISTERED EMAIL</Typography>
                  <Typography variant="body2" fontWeight={700}>{createdMember.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">PRIMARY MOBILE</Typography>
                  <Typography variant="body2" fontWeight={700}>{createdMember.mobile}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">ASSIGNED ROLE & PORTAL</Typography>
                  <Typography variant="body2" fontWeight={800} color="secondary.main">
                    {createdMember.role === "advocate" ? "ICJ Professional Chambers" : createdMember.role === "franchise" ? "District Franchise Desk" : "Litigant Client Portal"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">VERIFICATION STATUS</Typography>
                  <Typography variant="body2" fontWeight={800} color="success.main">
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
                sx={{ fontWeight: 800 }}
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
                sx={{ fontWeight: 900, px: 4 }}
              >
                Enter Your Dashboard ➔
              </Button>
            </Stack>
          </Paper>
        )}

      </Container>

      {/* OTP Verification Modal */}
      <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, textAlign: "center" }}>
          🔒 Enter Verification OTP
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
            A 6-digit verification code has been dispatched to <strong>{form.email}</strong>.
          </Typography>
          <TextField
            fullWidth
            autoFocus
            label="6-Digit Verification Code"
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
