import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link as RouterLink, useSearchParams } from "react-router-dom";
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
  Stack,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
  InputAdornment,
  Card,
} from "@mui/material";

import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import HandshakeIcon from "@mui/icons-material/Handshake";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SecurityIcon from "@mui/icons-material/Security";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";

import AuthService from "../services/authService";
import PasswordPolicyService from "../services/passwordPolicyService";
import MasterCertificateModal from "../components/common/MasterCertificateModal.jsx";
import { PAN_INDIA_STATES, PAN_INDIA_DISTRICTS_MAP, DEFAULT_STATE, DEFAULT_DISTRICT } from "../data/panIndiaMaster.js";
import { LEGAL_TAXONOMY_CATEGORIES, EXPERIENCE_LEVELS } from "../data/legalTaxonomyMaster.js";

// UNIFIED HIGH-CONTRAST DARK THEME INPUT STYLING
const inputFieldSx = {
  "& .MuiInputLabel-root": {
    color: "#94a3b8",
    fontWeight: 700,
    fontSize: "0.92rem",
    "&.Mui-focused": { color: "#38bdf8" },
  },
  "& .MuiOutlinedInput-root": {
    bgcolor: "#0b1329",
    color: "#ffffff",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "0.95rem",
    "& fieldset": {
      borderColor: "#334155",
      borderWidth: "1.5px",
    },
    "&:hover fieldset": {
      borderColor: "#60a5fa",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#38bdf8",
      borderWidth: "2px",
      boxShadow: "0 0 12px rgba(56, 189, 248, 0.25)",
    },
    "& .MuiInputBase-input": {
      color: "#ffffff !important",
      "&::placeholder": {
        color: "#64748b",
        opacity: 1,
      },
      "&:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px #0b1329 inset !important",
        WebkitTextFillColor: "#ffffff !important",
      },
    },
    "& .MuiSelect-icon": {
      color: "#38bdf8",
    },
  },
  "& .MuiFormHelperText-root": {
    color: "#38bdf8",
    fontWeight: 600,
  },
};

const selectMenuProps = {
  PaperProps: {
    sx: {
      bgcolor: "#1e293b",
      color: "#ffffff",
      border: "1.5px solid #334155",
      borderRadius: "12px",
      boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
      "& .MuiMenuItem-root": {
        color: "#e2e8f0",
        fontWeight: 600,
        fontSize: "0.92rem",
        py: 1.2,
        "&:hover": {
          bgcolor: "rgba(56, 189, 248, 0.15)",
          color: "#38bdf8",
        },
        "&.Mui-selected": {
          bgcolor: "rgba(56, 189, 248, 0.25) !important",
          color: "#38bdf8",
          fontWeight: 800,
        },
      },
    },
  },
};


const PURPOSE_OPTIONS = [
  {
    value: "PROBLEM",
    label: "1. विधिक समस्या / केस दर्ज करें (Litigant Client)",
    shortTitle: "1. नागरिक विधिक सहायता (Litigant Client)",
    sublabel: "ज़मीन विवाद, क्रिमिनल बेल, चेक बाउंस, सर्विस मैटर, पारिवारिक व उपभोक्ता विवाद",
    targetRole: "member",
    icon: AssignmentLateIcon,
    color: "#10b981",
  },
  {
    value: "SERVICES",
    label: "2. अधिवक्ता व विशेषज्ञ पार्टनर (Advocates & Specialists)",
    shortTitle: "2. अधिवक्ता व विशेषज्ञ पैनल (Advocate Partner)",
    sublabel: "बार काउंसिल पंजीकृत अधिवक्ता, सीए, सीएस, फॉरेंसिक एक्सपर्ट व लीगल कंसल्टेंट",
    targetRole: "advocate",
    icon: MiscellaneousServicesIcon,
    color: "#38bdf8",
  },
  {
    value: "FRANCHISE",
    label: "3. ज़िला विधिक सहायता केंद्र (District Franchise Node)",
    shortTitle: "3. ज़िला फ्रेंचाइज़ी पार्टनर (District Franchise)",
    sublabel: "ज़िला स्तर पर विधिक सहायता केंद्र, ई-फाइलिंग डेस्क व कॉल सेंटर एजेंसी",
    targetRole: "franchise",
    icon: HandshakeIcon,
    color: "#f59e0b",
  },
];

const PROBLEM_CATEGORIES = [
  "Property & Land Disputes (ज़मीन व संपत्ति विवाद)",
  "Criminal Defense & Bail (आपराधिक व जमानत)",
  "Cheque Bounce (Sec 138) (चेक बाउंस)",
  "Matrimonial & Family Disputes (पारिवारिक व वैवाहिक)",
  "Civil Suits & Property Title (सिविल दीवानी वाद)",
  "Cyber Crime & Online Fraud (साइबर अपराध व फ्रॉड)",
  "Consumer Court & Service Claims (उपभोक्ता विवाद)",
  "Service & Labour Matters (नौकरी व सेवा विवाद)",
  "High Court Writ & Appeals (रिट व अपील)",
  "Other Legal Grievance (अन्य विधिक समस्या)",
];

export default function PublicOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleParam = (searchParams.get("role") || "").toLowerCase();
  let detectedPurpose = "";
  if (["advocate", "services", "professional", "lawyer"].includes(roleParam)) detectedPurpose = "SERVICES";
  else if (["problem", "litigant", "client", "citizen"].includes(roleParam)) detectedPurpose = "PROBLEM";
  else if (["franchise", "frz", "district"].includes(roleParam)) detectedPurpose = "FRANCHISE";

  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");

  const [form, setForm] = useState({
    purpose: detectedPurpose || "SERVICES",
    regType: "Individual",
    namePrefix: "Adv.",
    firstName: "",
    middleName: "",
    lastName: "",
    orgName: "",
    gender: "Male",
    birthYear: "1990",
    mobile: "",
    whatsapp: "",
    email: "",
    password: "",
    confirmPassword: "",
    professionalCategory: LEGAL_TAXONOMY_CATEGORIES[0]?.categoryName || "Supreme Court & High Court Practice",
    professionalSubCategory: LEGAL_TAXONOMY_CATEGORIES[0]?.subCategories[0]?.title || "Supreme Court Bar Advocate",
    professionalRegNo: "",
    professionalExperience: "Senior Professional (5 - 10 Years)",
    problemCategory: PROBLEM_CATEGORIES[0],
    problemSummary: "",
    franchiseBackground: "",
    state: DEFAULT_STATE,
    district: DEFAULT_DISTRICT,
    city: "",
    pincode: "",
    policeStation: "",
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("123456");
  const [submitting, setSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const availableDistricts = useMemo(() => {
    return PAN_INDIA_DISTRICTS_MAP[form.state] || [form.district || "Central Delhi"];
  }, [form.state]);

  const handleInputChange = (field, value) => {
    setStepError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleStateChange = (newState) => {
    const districts = PAN_INDIA_DISTRICTS_MAP[newState] || [];
    setForm((prev) => ({
      ...prev,
      state: newState,
      district: districts[0] || "",
    }));
  };

  const validateAndNext = () => {
    setStepError("");

    if (step === 1) {
      if (!form.purpose) {
        setStepError("कृपया अपनी भागीदारी का उद्देश्य/भूमिका चुनें।");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (form.regType === "Individual") {
        if (!form.firstName.trim()) {
          setStepError("कृपया अपना पहला नाम (First Name) दर्ज करें।");
          return;
        }
      } else {
        if (!form.orgName.trim()) {
          setStepError("कृपया संस्था/फर्म का नाम (Organisation Name) दर्ज करें।");
          return;
        }
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      const cleanMobile = form.mobile.replace(/\\D/g, "");
      if (cleanMobile.length < 10) {
        setStepError("कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।");
        return;
      }

      if (!form.email || !form.email.includes("@")) {
        setStepError("कृपया वैध ईमेल पता (e.g. advocate@gmail.com) दर्ज करें।");
        return;
      }

      if (!form.password || form.password.length < 8) {
        setStepError("पासवर्ड कम से कम 8 अक्षर (Minimum 8 Characters) का होना चाहिए।");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setStepError("पासवर्ड और कन्फर्म पासवर्ड एक जैसे नहीं हैं।");
        return;
      }

      setStep(4);
      return;
    }

    if (step === 4) {
      if (form.purpose === "SERVICES") {
        if (!form.professionalRegNo.trim()) {
          setStepError("कृपया अपना बार काउंसिल या प्रोफेशनल रजिस्ट्रेशन नंबर दर्ज करें (उदा. D/1234/2015)।");
          return;
        }
      } else if (form.purpose === "PROBLEM") {
        if (!form.problemCategory) {
          setStepError("कृपया अपनी विधिक समस्या की श्रेणी चुनें।");
          return;
        }
      }
      setStep(5);
      return;
    }

    if (step === 5) {
      if (!form.state || !form.district) {
        setStepError("कृपया अपना राज्य और ज़िला चुनें।");
        return;
      }

      const cleanPin = form.pincode.replace(/\\D/g, "");
      if (cleanPin.length !== 6) {
        setStepError("कृपया 6 अंकों का सही पिनकोड दर्ज करें।");
        return;
      }

      setStep(6);
      return;
    }

    if (step === 6) {
      if (!form.termsAccepted) {
        setStepError("कृपया नियम एवं शर्तें स्वीकार करने हेतु चेकबॉक्स को टिक करें।");
        return;
      }
      handleInitiateRegistration();
    }
  };

  const handlePrev = () => {
    setStepError("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleInitiateRegistration = async () => {
    setSubmitting(true);
    setStepError("");

    const targetRole = form.purpose === "SERVICES" ? "advocate" : form.purpose === "FRANCHISE" ? "franchise" : "member";
    const displayName = form.regType === "Organisation" ? form.orgName : `${form.namePrefix} ${form.firstName} ${form.lastName}`.trim();

    try {
      const payload = {
        fullName: displayName,
        name: displayName,
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
        whatsapp: form.whatsapp.trim() || form.mobile.trim(),
        password: form.password,
        role: targetRole,
        user_type: targetRole,
        gender: form.gender,
        birthYear: form.birthYear,
        state: form.state,
        district: form.district,
        city: form.city,
        pincode: form.pincode,
        policeStation: form.policeStation,
        professionalRegNo: form.professionalRegNo,
        professionalCategory: form.professionalCategory,
        professionalExperience: form.professionalExperience,
        problemCategory: form.problemCategory,
        problemSummary: form.problemSummary,
      };

      const newUser = await AuthService.register(payload);
      setCreatedUser(newUser);
      setOtpModalOpen(true);
    } catch (err) {
      setStepError(err.message || "रजिस्ट्रेशन में समस्या आई।");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode !== "123456" && otpCode.length !== 6) {
      setStepError("अमान्य OTP कोड। परीक्षण हेतु 123456 दर्ज करें।");
      return;
    }

    setOtpModalOpen(false);
    setCertModalOpen(true);
  };

  const selectedPurposeObj = PURPOSE_OPTIONS.find((p) => p.value === form.purpose) || PURPOSE_OPTIONS[1];


  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0f172a",
        color: "#ffffff",
      }}
    >
      {/* 1. TOP DOCK */}
      <Paper
        elevation={0}
        sx={{
          height: 60,
          minHeight: 60,
          maxHeight: 60,
          px: { xs: 2, md: 4 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#0f172a",
          borderBottom: "1.5px solid #1e293b",
          color: "#ffffff",
          zIndex: 10,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AccountBalanceIcon sx={{ color: "#38bdf8", fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={900} sx={{ color: "#ffffff", lineHeight: 1.1 }}>
              ICJ ENTERPRISE ONBOARDING
            </Typography>
            <Typography variant="caption" sx={{ color: "#cbd5e1", fontWeight: 600, display: { xs: "none", sm: "block" } }}>
              अखिल भारतीय विधिक सदस्यता एवं डिजिटल न्याय मंच
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            label={`Step ${step} of 6 : ${
              step === 1 ? "रोल चयन" :
              step === 2 ? "पहचान व नाम" :
              step === 3 ? "संपर्क व पासवर्ड" :
              step === 4 ? "विधिक योग्यता" :
              step === 5 ? "अधिकार क्षेत्र व पता" : "समीक्षा व OTP"
            }`}
            size="small"
            sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: 800, border: "1px solid #38bdf8", py: 1.8 }}
          />

          <Button
            component={RouterLink}
            to="/"
            size="small"
            variant="text"
            sx={{ color: "#cbd5e1", minWidth: 0, p: 0.5, "&:hover": { color: "#ffffff", bgcolor: "rgba(255,255,255,0.1)" } }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </Stack>
      </Paper>

      <LinearProgress
        variant="determinate"
        value={(step / 6) * 100}
        sx={{ height: 4, bgcolor: "#1e293b", "& .MuiLinearProgress-bar": { bgcolor: "#38bdf8" } }}
      />

      {/* 2. ACTIVE ZERO-SCROLL CANVAS */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: { xs: 2, md: 4 },
          bgcolor: "#0f172a",
        }}
      >
        <Container maxWidth="xl" sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {stepError && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: "#450a0a", color: "#fca5a5", border: "1.5px solid #ef4444", fontWeight: 700 }}>
              {stepError}
            </Alert>
          )}

          {/* STEP 1: 3-COLUMN CSS GRID */}
          {step === 1 && (
            <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography variant="h4" fontWeight={900} color="#ffffff" sx={{ fontSize: { xs: "1.4rem", md: "2rem" }, mb: 1 }}>
                  🎯 अपनी भूमिका एवं विधिक क्षमता का चयन करें
                </Typography>
                <Typography variant="body1" sx={{ color: "#cbd5e1", fontSize: "1.05rem", fontWeight: 600 }}>
                  Select your primary onboarding capacity on the ICJ Enterprise Legal Infrastructure
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  gap: 3,
                  alignItems: "stretch",
                }}
              >
                {PURPOSE_OPTIONS.map((opt) => {
                  const isSelected = form.purpose === opt.value;
                  const IconComp = opt.icon;
                  return (
                    <Card
                      key={opt.value}
                      onClick={() => {
                        setForm((p) => ({
                          ...p,
                          purpose: opt.value,
                          namePrefix: opt.value === "SERVICES" ? "Adv." : "Mr.",
                        }));
                      }}
                      sx={{
                        cursor: "pointer",
                        p: { xs: 2.5, md: 3.5 },
                        borderRadius: 4,
                        bgcolor: isSelected ? "#1e293b" : "#131d31",
                        border: isSelected ? `2.5px solid ${opt.color}` : "1.5px solid #334155",
                        boxShadow: isSelected ? `0 12px 30px ${opt.color}33` : "0 4px 12px rgba(0,0,0,0.3)",
                        transition: "all 0.25s ease-in-out",
                        "&:hover": { borderColor: opt.color, transform: "translateY(-4px)" },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 3,
                              bgcolor: isSelected ? opt.color : "rgba(255,255,255,0.08)",
                              color: isSelected ? "#ffffff" : opt.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconComp sx={{ fontSize: 32 }} />
                          </Box>

                          {isSelected && (
                            <Chip
                              label="चयनित (Selected) ✓"
                              size="small"
                              sx={{ bgcolor: opt.color, color: "#ffffff", fontWeight: 800 }}
                            />
                          )}
                        </Stack>

                        <Typography variant="h6" fontWeight={900} color="#ffffff" sx={{ mb: 1.5, lineHeight: 1.3 }}>
                          {opt.shortTitle}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#e2e8f0", fontSize: "0.95rem", lineHeight: 1.6, fontWeight: 500 }}>
                          {opt.sublabel}
                        </Typography>
                      </Box>

                      <Button
                        variant={isSelected ? "contained" : "outlined"}
                        fullWidth
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm((p) => ({
                            ...p,
                            purpose: opt.value,
                            namePrefix: opt.value === "SERVICES" ? "Adv." : "Mr.",
                          }));
                          setStep(2);
                        }}
                        sx={{
                          mt: 3,
                          py: 1.2,
                          fontWeight: 800,
                          fontSize: "0.92rem",
                          borderRadius: 2.5,
                          borderColor: opt.color,
                          bgcolor: isSelected ? opt.color : "transparent",
                          color: isSelected ? "#ffffff" : opt.color,
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: isSelected ? opt.color : `${opt.color}22`,
                            borderColor: opt.color,
                          },
                        }}
                      >
                        {isSelected ? "आगे बढ़ें (Proceed to Step 2) →" : "इसे चुनें (Select) →"}
                      </Button>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <Paper sx={{ maxWidth: 1000, mx: "auto", width: "100%", p: { xs: 3, md: 4 }, bgcolor: "#1e293b", borderRadius: 4, border: "1.5px solid #334155" }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", p: 1.2, borderRadius: 2.5, border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                  <SecurityIcon sx={{ color: "#38bdf8", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="#ffffff" sx={{ letterSpacing: 0.5 }}>
                    👤 1. आवेदक की पहचान एवं नाम (Applicant Identity)
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="#cbd5e1" fontWeight={600}>
                      चयनित भूमिका:
                    </Typography>
                    <Chip
                      label={selectedPurposeObj.shortTitle}
                      size="small"
                      sx={{
                        bgcolor: "rgba(56, 189, 248, 0.15)",
                        color: "#38bdf8",
                        fontWeight: 800,
                        border: "1px solid #38bdf8",
                        fontSize: "0.82rem",
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>

              {/* HIGH-CONTRAST DUAL-PILL REGISTRATION TYPE SELECTOR */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
                <Paper
                  onClick={() => setForm((p) => ({ ...p, regType: "Individual", namePrefix: p.purpose === "SERVICES" ? "Adv." : "Mr." }))}
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    bgcolor: form.regType === "Individual" ? "rgba(56, 189, 248, 0.15)" : "#0b1329",
                    border: form.regType === "Individual" ? "2px solid #38bdf8" : "1.5px solid #334155",
                    boxShadow: form.regType === "Individual" ? "0 0 16px rgba(56, 189, 248, 0.25)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    transition: "all 0.2s ease",
                    "&:hover": { borderColor: "#38bdf8" },
                  }}
                >
                  <Radio
                    checked={form.regType === "Individual"}
                    sx={{ color: "#38bdf8", p: 0, "&.Mui-checked": { color: "#38bdf8" } }}
                  />
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: form.regType === "Individual" ? "#ffffff" : "#e2e8f0" }}>
                    👤 Individual (व्यक्तिगत)
                  </Typography>
                </Paper>

                <Paper
                  onClick={() => setForm((p) => ({ ...p, regType: "Organisation", namePrefix: "Dr." }))}
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    bgcolor: form.regType === "Organisation" ? "rgba(56, 189, 248, 0.15)" : "#0b1329",
                    border: form.regType === "Organisation" ? "2px solid #38bdf8" : "1.5px solid #334155",
                    boxShadow: form.regType === "Organisation" ? "0 0 16px rgba(56, 189, 248, 0.25)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    transition: "all 0.2s ease",
                    "&:hover": { borderColor: "#38bdf8" },
                  }}
                >
                  <Radio
                    checked={form.regType === "Organisation"}
                    sx={{ color: "#38bdf8", p: 0, "&.Mui-checked": { color: "#38bdf8" } }}
                  />
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: form.regType === "Organisation" ? "#ffffff" : "#e2e8f0" }}>
                    🏢 Organisation / Firm (फर्म / संस्था)
                  </Typography>
                </Paper>
              </Stack>

              {form.regType === "Individual" ? (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2.5, mb: 3 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Prefix / उपाधि"
                    value={form.namePrefix}
                    onChange={(e) => handleInputChange("namePrefix", e.target.value)}
                    SelectProps={{ MenuProps: selectMenuProps }}
                    sx={inputFieldSx}
                  >
                    <MenuItem value="Adv.">Adv. (अधिवक्ता)</MenuItem>
                    <MenuItem value="Mr.">Mr. (श्री)</MenuItem>
                    <MenuItem value="Ms.">Ms. (सुश्री)</MenuItem>
                    <MenuItem value="Mrs.">Mrs. (श्रीमती)</MenuItem>
                    <MenuItem value="Dr.">Dr. (डॉक्टर)</MenuItem>
                    <MenuItem value="Prof.">Prof. (प्रोफेसर)</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    size="small"
                    label="First Name (पहला नाम) *"
                    value={form.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                    sx={inputFieldSx}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="Middle Name (मध्य नाम)"
                    value={form.middleName}
                    onChange={(e) => handleInputChange("middleName", e.target.value)}
                    sx={inputFieldSx}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="Last Name (उपनाम)"
                    value={form.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    sx={inputFieldSx}
                  />
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Organisation / Chamber / Firm Name (संस्था/फर्म का नाम) *"
                    value={form.orgName}
                    onChange={(e) => handleInputChange("orgName", e.target.value)}
                    required
                    sx={inputFieldSx}
                  />
                </Box>
              )}

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Gender (लिंग)"
                  value={form.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  SelectProps={{ MenuProps: selectMenuProps }}
                  sx={inputFieldSx}
                >
                  <MenuItem value="Male">Male (पुरुष)</MenuItem>
                  <MenuItem value="Female">Female (महिला)</MenuItem>
                  <MenuItem value="Other">Other (अन्य)</MenuItem>
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Year of Birth (जन्म वर्ष)"
                  value={form.birthYear}
                  onChange={(e) => handleInputChange("birthYear", e.target.value)}
                  SelectProps={{ MenuProps: selectMenuProps }}
                  sx={inputFieldSx}
                >
                  {Array.from({ length: 70 }, (_, i) => 2016 - i).map((yr) => (
                    <MenuItem key={yr} value={String(yr)}>
                      {yr}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Paper>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <Paper sx={{ maxWidth: 1000, mx: "auto", width: "100%", p: { xs: 3, md: 4 }, bgcolor: "#1e293b", borderRadius: 4, border: "1.5px solid #334155" }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", p: 1.2, borderRadius: 2.5, border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                  <LockIcon sx={{ color: "#38bdf8", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="#ffffff">
                    📞 2. संपर्क एवं सुरक्षा क्रेडेंशियल्स (Contact & Password)
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#cbd5e1", fontWeight: 600 }}>
                    नया पासवर्ड न्यूनतम 8 अक्षर का कोई भी अल्फ़ा/न्यूमेरिक हो सकता है
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Primary Mobile Number (10 डिजिट मोबाइल) *"
                  value={form.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  placeholder="9876543210"
                  required
                  sx={inputFieldSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Typography color="#38bdf8" fontWeight={800}>+91</Typography></InputAdornment>,
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="WhatsApp Number (वैकल्पिक)"
                  value={form.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                  placeholder="9876543210"
                  sx={inputFieldSx}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Typography color="#34d399" fontWeight={800}>+91</Typography></InputAdornment>,
                  }}
                />
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Official Email Address (ईमेल पता) *"
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="advocate@gmail.com"
                  required
                  sx={inputFieldSx}
                />
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? "text" : "password"}
                  label="Create Password (पासवर्ड बनाएं) *"
                  value={form.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  helperText="न्यूनतम 8 अक्षर (नंबर, अक्षर या अल्फ़ान्यूमेरिक)"
                  required
                  sx={inputFieldSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" sx={{ color: "#38bdf8" }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? "text" : "password"}
                  label="Confirm Password (पासवर्ड दोबारा दर्ज करें) *"
                  value={form.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  sx={inputFieldSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" sx={{ color: "#38bdf8" }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Paper>
          )}


          {/* STEP 4 */}
          {step === 4 && (
            <Paper sx={{ maxWidth: 1000, mx: "auto", width: "100%", p: { xs: 3, md: 4 }, bgcolor: "#1e293b", borderRadius: 4, border: "1.5px solid #334155" }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", p: 1.2, borderRadius: 2.5 }}>
                  <GavelIcon sx={{ color: "#38bdf8", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="#ffffff">
                    ⚖️ 3. विधिक प्रमाण एवं विशेषज्ञता (Professional Practice & Matter)
                  </Typography>
                  <Typography variant="body2" color="#94a3b8">
                    {form.purpose === "SERVICES" ? "अधिवक्ता बार काउंसिल पंजीकरण व विशेषज्ञता" : "विधिक सहायता विषय व समस्या की श्रेणी"}
                  </Typography>
                </Box>
              </Stack>

              {form.purpose === "SERVICES" ? (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Professional Category (श्रेणी)"
                    value={form.professionalCategory}
                    onChange={(e) => handleInputChange("professionalCategory", e.target.value)}
                    SelectProps={{ MenuProps: selectMenuProps }}
                    sx={inputFieldSx}
                  >
                    {LEGAL_TAXONOMY_CATEGORIES.map((cat) => (
                      <MenuItem key={cat.id} value={cat.categoryName}>
                        {cat.categoryName}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    size="small"
                    label="Bar Council / Professional Reg. No (रजिस्ट्रेशन नंबर) *"
                    value={form.professionalRegNo}
                    onChange={(e) => handleInputChange("professionalRegNo", e.target.value)}
                    placeholder="e.g. D/1234/2015"
                    required
                    sx={inputFieldSx}
                  />

                  <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Experience Level (विधिक अनुभव)"
                      value={form.professionalExperience}
                      onChange={(e) => handleInputChange("professionalExperience", e.target.value)}
                      SelectProps={{ MenuProps: selectMenuProps }}
                      sx={inputFieldSx}
                    >
                      {EXPERIENCE_LEVELS.map((exp) => (
                        <MenuItem key={exp} value={exp}>
                          {exp}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              ) : form.purpose === "PROBLEM" ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Legal Grievance Category (विधिक समस्या की श्रेणी) *"
                    value={form.problemCategory}
                    onChange={(e) => handleInputChange("problemCategory", e.target.value)}
                    SelectProps={{ MenuProps: selectMenuProps }}
                    sx={inputFieldSx}
                  >
                    {PROBLEM_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    label="Brief Matter Summary (समस्या का संक्षिप्त विवरण - 1 से 2 लाइन)"
                    value={form.problemSummary}
                    onChange={(e) => handleInputChange("problemSummary", e.target.value)}
                    placeholder="कृपया अपनी विधिक समस्या का मुख्य विषय लिखें..."
                    sx={inputFieldSx}
                  />
                </Box>
              ) : (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    label="Franchise Node Background (फ्रेंचाइज़ी केंद्र स्थापना का संक्षिप्त विवरण)"
                    value={form.franchiseBackground}
                    onChange={(e) => handleInputChange("franchiseBackground", e.target.value)}
                    placeholder="ज़िला विधिक केंद्र हेतु मौजूदा कार्यालय या कार्य अनुभव..."
                    sx={inputFieldSx}
                  />
                </Box>
              )}
            </Paper>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <Paper sx={{ maxWidth: 1000, mx: "auto", width: "100%", p: { xs: 3, md: 4 }, bgcolor: "#1e293b", borderRadius: 4, border: "1.5px solid #334155" }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", p: 1.2, borderRadius: 2.5 }}>
                  <AccountBalanceIcon sx={{ color: "#38bdf8", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="#ffffff">
                    📍 4. अधिकार क्षेत्र एवं पता (Jurisdiction & Address)
                  </Typography>
                  <Typography variant="body2" color="#94a3b8">
                    अखिल भारतीय 28 राज्य, 8 केंद्र शासित प्रदेश व 780+ ज़िला क्षेत्राधिकार
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 2.5 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="State / Union Territory (राज्य / यूटी) *"
                  value={form.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  SelectProps={{ MenuProps: selectMenuProps }}
                  sx={inputFieldSx}
                >
                  {PAN_INDIA_STATES.map((st) => (
                    <MenuItem key={st} value={st}>
                      {st}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="District (ज़िला) *"
                  value={form.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  SelectProps={{ MenuProps: selectMenuProps }}
                  sx={inputFieldSx}
                >
                  {availableDistricts.map((dst) => (
                    <MenuItem key={dst} value={dst}>
                      {dst}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="City / Tehsil (शहर / तहसील)"
                  value={form.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="e.g. New Delhi"
                  sx={inputFieldSx}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Pincode (पिनकोड) *"
                  value={form.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  placeholder="110001"
                  required
                  sx={inputFieldSx}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Police Station (थाना - वैकल्पिक)"
                  value={form.policeStation}
                  onChange={(e) => handleInputChange("policeStation", e.target.value)}
                  placeholder="e.g. Tilak Marg"
                  sx={inputFieldSx}
                />
              </Box>
            </Paper>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <Paper sx={{ maxWidth: 1000, mx: "auto", width: "100%", p: { xs: 3, md: 4 }, bgcolor: "#1e293b", borderRadius: 4, border: "1.5px solid #334155" }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
                <Box sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", p: 1.2, borderRadius: 2.5 }}>
                  <VerifiedUserIcon sx={{ color: "#34d399", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="#ffffff">
                    ✅ 5. अंतिम समीक्षा एवं OTP सत्यापन (Review & Verification)
                  </Typography>
                  <Typography variant="body2" color="#94a3b8">
                    कृपया अपने विवरण की समीक्षा करें (किसी भी विवरण को बदलने हेतु सीधे एडिट करें)
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 2.5 }}>
                <Paper sx={{ p: 2.5, bgcolor: "#0b1329", border: "1.5px solid #334155", borderRadius: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="#38bdf8" fontWeight={900}>
                      आवेदक व भूमिका
                    </Typography>
                    <IconButton size="small" onClick={() => setStep(2)} sx={{ color: "#38bdf8", p: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Typography variant="subtitle1" fontWeight={800} color="#ffffff">
                    {form.regType === "Organisation" ? form.orgName : `${form.namePrefix} ${form.firstName} ${form.lastName}`.trim()}
                  </Typography>
                  <Typography variant="body2" color="#cbd5e1">
                    भूमिका: <strong style={{ color: "#34d399" }}>{selectedPurposeObj.shortTitle}</strong> ({form.gender}, {form.birthYear})
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2.5, bgcolor: "#0b1329", border: "1.5px solid #334155", borderRadius: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="#38bdf8" fontWeight={900}>
                      संपर्क व अधिकार क्षेत्र
                    </Typography>
                    <IconButton size="small" onClick={() => setStep(3)} sx={{ color: "#38bdf8", p: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Typography variant="subtitle1" fontWeight={800} color="#ffffff">
                    +91 {form.mobile} | {form.email}
                  </Typography>
                  <Typography variant="body2" color="#cbd5e1">
                    क्षेत्र: {form.district}, {form.state} ({form.pincode})
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ bgcolor: "#0b1329", p: 2, borderRadius: 2.5, border: "1.5px solid #334155" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.termsAccepted}
                      onChange={(e) => handleInputChange("termsAccepted", e.target.checked)}
                      sx={{ color: "#34d399", "&.Mui-checked": { color: "#34d399" } }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="#e2e8f0" sx={{ fontSize: "0.9rem" }}>
                      मैं ICJ ऑनबोर्डिंग नियमों, बार काउंसिल ऑफ इंडिया रूल 36 एवं आईटी एक्ट धारा 79 इंटरमीडियरी सुरक्षा शर्तों को स्वीकार करता हूँ।
                    </Typography>
                  }
                />
              </Box>
            </Paper>
          )}
        </Container>
      </Box>

      {/* 3. BOTTOM FLUID NAVIGATION DOCK */}
      <Paper
        elevation={0}
        sx={{
          height: 65,
          minHeight: 65,
          maxHeight: 65,
          px: { xs: 2, md: 4 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#0f172a",
          borderTop: "1.5px solid #1e293b",
          color: "#ffffff",
          zIndex: 10,
        }}
      >
        <Box>
          {step > 1 && (
            <Button
              variant="outlined"
              size="medium"
              startIcon={<ArrowBackIcon />}
              onClick={handlePrev}
              sx={{
                color: "#94a3b8",
                borderColor: "#334155",
                fontWeight: 700,
                borderRadius: 2.5,
                px: 3,
                textTransform: "none",
                "&:hover": { borderColor: "#64748b", bgcolor: "#1e293b", color: "#ffffff" },
              }}
            >
              ← पीछे जाएं (Back)
            </Button>
          )}
        </Box>

        <Box>
          {step < 6 ? (
            <Button
              variant="contained"
              size="medium"
              endIcon={<ArrowForwardIcon />}
              onClick={validateAndNext}
              sx={{
                bgcolor: "#2563eb",
                fontWeight: 800,
                borderRadius: 2.5,
                px: 3.5,
                py: 1,
                fontSize: "0.95rem",
                textTransform: "none",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              आगे बढ़ें (Next) →
            </Button>
          ) : (
            <Button
              variant="contained"
              size="medium"
              color="success"
              disabled={submitting}
              startIcon={<CheckCircleIcon />}
              onClick={validateAndNext}
              sx={{
                bgcolor: "#059669",
                fontWeight: 900,
                borderRadius: 2.5,
                px: 4,
                py: 1,
                fontSize: "0.95rem",
                textTransform: "none",
                "&:hover": { bgcolor: "#047857" },
              }}
            >
              {submitting ? "प्रोसेस हो रहा है..." : "रजिस्ट्रेशन सबमिट करें (Submit & Verify OTP) →"}
            </Button>
          )}
        </Box>
      </Paper>

      {/* 4. OTP MODAL */}
      <Dialog
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: "#0f172a", color: "#ffffff", borderRadius: 3, border: "1.5px solid #334155" } }}
      >
        <DialogTitle sx={{ bgcolor: "#1e293b", color: "#ffffff", borderBottom: "1px solid #334155" }}>
          🔐 OTP सत्यापन (Instant Verification)
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="#cbd5e1" sx={{ mb: 2 }}>
            आपके ईमेल/मोबाइल <strong>{form.email}</strong> पर 6-अंक का सुरक्षा OTP भेजा गया है:
          </Typography>

          <TextField
            fullWidth
            size="medium"
            label="Enter 6-Digit OTP"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            sx={inputFieldSx}
          />
          <Typography variant="caption" color="#94a3b8" sx={{ mt: 1, display: "block" }}>
            (परीक्षण हेतु डिफ़ॉल्ट कोड: <strong>123456</strong>)
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#1e293b", borderTop: "1px solid #334155" }}>
          <Button variant="outlined" color="inherit" onClick={() => setOtpModalOpen(false)}>रद्द करें</Button>
          <Button variant="contained" color="success" onClick={handleVerifyOtp} sx={{ fontWeight: 800 }}>
            सत्यापित करें (Verify)
          </Button>
        </DialogActions>
      </Dialog>

      {/* 5. MASTER CERTIFICATE MODAL */}
      {certModalOpen && (
        <MasterCertificateModal
          open={certModalOpen}
          onClose={() => {
            setCertModalOpen(false);
            navigate(form.purpose === "SERVICES" ? "/advocate-dashboard" : "/personal-dashboard");
          }}
          user={createdUser || form}
        />
      )}
    </Box>
  );
}
