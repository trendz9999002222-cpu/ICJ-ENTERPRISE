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


const PURPOSE_OPTIONS = [
  {
    value: "PROBLEM",
    label: "1. विधिक समस्या / केस दर्ज करें (Litigant Client)",
    shortTitle: "नागरिक विधिक सहायता (Litigant Client)",
    sublabel: "ज़मीन विवाद, क्रिमिनल बेल, चेक बाउंस, सर्विस मैटर, पारिवारिक व उपभोक्ता विवाद",
    targetRole: "member",
    icon: AssignmentLateIcon,
    color: "#059669",
  },
  {
    value: "SERVICES",
    label: "2. अधिवक्ता व विशेषज्ञ पार्टनर (Advocates & Specialists)",
    shortTitle: "अधिवक्ता व विशेषज्ञ पैनल (Advocate Partner)",
    sublabel: "बार काउंसिल पंजीकृत अधिवक्ता, सीए, सीएस, फॉरेंसिक एक्सपर्ट व लीगल कंसल्टेंट",
    targetRole: "advocate",
    icon: MiscellaneousServicesIcon,
    color: "#2563eb",
  },
  {
    value: "FRANCHISE",
    label: "3. ज़िला विधिक सहायता केंद्र (District Franchise Node)",
    shortTitle: "ज़िला फ्रेंचाइज़ी पार्टनर (District Franchise)",
    sublabel: "ज़िला स्तर पर विधिक सहायता केंद्र, ई-फाइलिंग डेस्क व कॉल सेंटर एजेंसी",
    targetRole: "franchise",
    icon: HandshakeIcon,
    color: "#d97706",
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
  let initialPurpose = "";
  if (["advocate", "services", "professional", "lawyer"].includes(roleParam)) initialPurpose = "SERVICES";
  else if (["problem", "litigant", "client", "citizen"].includes(roleParam)) initialPurpose = "PROBLEM";
  else if (["franchise", "frz", "district"].includes(roleParam)) initialPurpose = "FRANCHISE";

  const [step, setStep] = useState(initialPurpose ? 2 : 1);
  const [stepError, setStepError] = useState("");

  const [form, setForm] = useState({
    purpose: initialPurpose || "SERVICES",
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
      const cleanMobile = form.mobile.replace(/\D/g, "");
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

      const cleanPin = form.pincode.replace(/\D/g, "");
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
      {/* 1. TOP 1-INCH DOCK */}
      <Paper
        elevation={0}
        sx={{
          height: 60,
          minHeight: 60,
          maxHeight: 60,
          px: { xs: 2, md: 3 },
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
            <Typography variant="caption" sx={{ color: "#94a3b8", display: { xs: "none", sm: "block" } }}>
              अखिल भारतीय विधिक सदस्यता एवं डिजिटल न्याय मंच
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={`Step ${step} of 6 : ${
              step === 1 ? "रोल चयन" :
              step === 2 ? "पहचान व नाम" :
              step === 3 ? "संपर्क व पासवर्ड" :
              step === 4 ? "विधिक योग्यता" :
              step === 5 ? "अधिकार क्षेत्र व पता" : "समीक्षा व OTP"
            }`}
            size="small"
            sx={{ bgcolor: "#1e293b", color: "#38bdf8", fontWeight: 800, border: "1px solid #334155" }}
          />

          <Button
            component={RouterLink}
            to="/"
            size="small"
            variant="text"
            sx={{ color: "#94a3b8", minWidth: 0, p: 0.5, "&:hover": { color: "#ffffff" } }}
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

      {/* 2. ACTIVE CANVAS */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: { xs: 2, md: 3 },
          bgcolor: "#0f172a",
        }}
      >
        <Container maxWidth="lg" sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {stepError && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: "#450a0a", color: "#fca5a5", border: "1px solid #7f1d1d" }}>
              {stepError}
            </Alert>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <Box>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography variant="h5" fontWeight={900} color="#ffffff">
                  🎯 अपनी भूमिका एवं विधिक क्षमता का चयन करें
                </Typography>
                <Typography variant="body2" color="#94a3b8">
                  Select your primary onboarding capacity on the ICJ Enterprise Legal Infrastructure
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                {PURPOSE_OPTIONS.map((opt) => {
                  const isSelected = form.purpose === opt.value;
                  const IconComp = opt.icon;
                  return (
                    <Grid item xs={12} md={4} key={opt.value} sx={{ display: "flex" }}>
                      <Card
                        onClick={() => {
                          setForm((p) => ({
                            ...p,
                            purpose: opt.value,
                            namePrefix: opt.value === "SERVICES" ? "Adv." : "Mr.",
                          }));
                          setStep(2);
                        }}
                        sx={{
                          flex: 1,
                          cursor: "pointer",
                          p: 3,
                          borderRadius: 3.5,
                          bgcolor: isSelected ? "#1e293b" : "#0f172a",
                          border: isSelected ? `2.5px solid ${opt.color}` : "1.5px solid #334155",
                          boxShadow: isSelected ? `0 8px 24px ${opt.color}33` : "none",
                          transition: "all 0.2s ease",
                          "&:hover": { borderColor: opt.color, transform: "translateY(-3px)" },
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Box
                            sx={{
                              width: 52,
                              height: 52,
                              borderRadius: 2.5,
                              bgcolor: isSelected ? opt.color : "#1e293b",
                              color: isSelected ? "#ffffff" : opt.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: 2,
                            }}
                          >
                            <IconComp sx={{ fontSize: 30 }} />
                          </Box>
                          <Typography variant="h6" fontWeight={800} color="#ffffff" sx={{ mb: 1 }}>
                            {opt.shortTitle}
                          </Typography>
                          <Typography variant="body2" color="#94a3b8" sx={{ fontSize: "0.88rem", lineHeight: 1.5 }}>
                            {opt.sublabel}
                          </Typography>
                        </Box>

                        <Button
                          variant={isSelected ? "contained" : "outlined"}
                          fullWidth
                          size="small"
                          sx={{
                            mt: 3,
                            fontWeight: 800,
                            borderColor: opt.color,
                            bgcolor: isSelected ? opt.color : "transparent",
                            color: isSelected ? "#ffffff" : opt.color,
                            textTransform: "none",
                          }}
                        >
                          {isSelected ? "चयनित (Selected) ✓" : "इसे चुनें (Select) →"}
                        </Button>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <Paper sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: "#1e293b", borderRadius: 3.5, border: "1px solid #334155" }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <Box sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", p: 1, borderRadius: 2 }}>
                  <SecurityIcon sx={{ color: "#38bdf8", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#ffffff">
                    👤 1. आवेदक की पहचान एवं नाम (Applicant Identity)
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">
                    भूमिका: <strong>{selectedPurposeObj.shortTitle}</strong>
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <RadioGroup
                    row
                    value={form.regType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((p) => ({
                        ...p,
                        regType: val,
                        namePrefix: val === "Organisation" ? "Dr." : form.purpose === "SERVICES" ? "Adv." : "Mr.",
                      }));
                    }}
                  >
                    <FormControlLabel value="Individual" control={<Radio sx={{ color: "#38bdf8" }} />} label="Individual (व्यक्तिगत)" />
                    <FormControlLabel value="Organisation" control={<Radio sx={{ color: "#38bdf8" }} />} label="Organisation / Firm (फर्म / संस्था)" />
                  </RadioGroup>
                </Grid>

                {form.regType === "Individual" ? (
                  <>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Prefix / उपाधि"
                        value={form.namePrefix}
                        onChange={(e) => handleInputChange("namePrefix", e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                      >
                        <MenuItem value="Adv.">Adv. (अधिवक्ता)</MenuItem>
                        <MenuItem value="Mr.">Mr. (श्री)</MenuItem>
                        <MenuItem value="Ms.">Ms. (सुश्री)</MenuItem>
                        <MenuItem value="Mrs.">Mrs. (श्रीमती)</MenuItem>
                        <MenuItem value="Dr.">Dr. (डॉक्टर)</MenuItem>
                        <MenuItem value="Prof.">Prof. (प्रोफेसर)</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="First Name (पहला नाम) *"
                        value={form.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                        sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Middle Name (मध्य नाम)"
                        value={form.middleName}
                        onChange={(e) => handleInputChange("middleName", e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Last Name (उपनाम)"
                        value={form.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                      />
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Organisation / Chamber / Firm Name (संस्था/फर्म का नाम) *"
                      value={form.orgName}
                      onChange={(e) => handleInputChange("orgName", e.target.value)}
                      required
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Gender (लिंग)"
                    value={form.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                  >
                    <MenuItem value="Male">Male (पुरुष)</MenuItem>
                    <MenuItem value="Female">Female (महिला)</MenuItem>
                    <MenuItem value="Other">Other (अन्य)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Year of Birth (जन्म वर्ष)"
                    value={form.birthYear}
                    onChange={(e) => handleInputChange("birthYear", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                  >
                    {Array.from({ length: 70 }, (_, i) => 2016 - i).map((yr) => (
                      <MenuItem key={yr} value={String(yr)}>
                        {yr}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <Paper sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: "#1e293b", borderRadius: 3.5, border: "1px solid #334155" }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <Box sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", p: 1, borderRadius: 2 }}>
                  <LockIcon sx={{ color: "#38bdf8", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#ffffff">
                    📞 2. संपर्क एवं सुरक्षा क्रेडेंशियल्स (Contact & Password)
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">
                    नया पासवर्ड न्यूनतम 8 अक्षर का कोई भी अल्फ़ा/न्यूमेरिक हो सकता है
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Primary Mobile Number (10 डिजिट मोबाइल) *"
                    value={form.mobile}
                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                    placeholder="9876543210"
                    required
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Typography color="#38bdf8" fontWeight={700}>+91</Typography></InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="WhatsApp Number (वैकल्पिक)"
                    value={form.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    placeholder="9876543210"
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Typography color="#34d399" fontWeight={700}>+91</Typography></InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Official Email Address (ईमेल पता) *"
                    value={form.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="advocate@gmail.com"
                    required
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? "text" : "password"}
                    label="Create Password (पासवर्ड बनाएं) *"
                    value={form.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    helperText="न्यूनतम 8 अक्षर (नंबर, अक्षर या अल्फ़ान्यूमेरिक)"
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" },
                      "& .MuiFormHelperText-root": { color: "#38bdf8" },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" sx={{ color: "#94a3b8" }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? "text" : "password"}
                    label="Confirm Password (पासवर्ड दोबारा दर्ज करें) *"
                    value={form.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" sx={{ color: "#94a3b8" }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}


          {/* STEP 4 */}
          {step === 4 && (
            <Paper sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: "#1e293b", borderRadius: 3.5, border: "1px solid #334155" }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <Box sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", p: 1, borderRadius: 2 }}>
                  <GavelIcon sx={{ color: "#38bdf8", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#ffffff">
                    ⚖️ 3. विधिक प्रमाण एवं विशेषज्ञता (Professional Practice & Matter)
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">
                    {form.purpose === "SERVICES" ? "अधिवक्ता बार काउंसिल पंजीकरण व विशेषज्ञता" : "विधिक सहायता विषय व समस्या की श्रेणी"}
                  </Typography>
                </Box>
              </Stack>

              {form.purpose === "SERVICES" ? (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Professional Category (श्रेणी)"
                      value={form.professionalCategory}
                      onChange={(e) => handleInputChange("professionalCategory", e.target.value)}
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                    >
                      {LEGAL_TAXONOMY_CATEGORIES.map((cat) => (
                        <MenuItem key={cat.id} value={cat.categoryName}>
                          {cat.categoryName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Bar Council / Professional Reg. No (रजिस्ट्रेशन नंबर) *"
                      value={form.professionalRegNo}
                      onChange={(e) => handleInputChange("professionalRegNo", e.target.value)}
                      placeholder="e.g. D/1234/2015"
                      required
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Experience Level (विधिक अनुभव)"
                      value={form.professionalExperience}
                      onChange={(e) => handleInputChange("professionalExperience", e.target.value)}
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                    >
                      {EXPERIENCE_LEVELS.map((exp) => (
                        <MenuItem key={exp} value={exp}>
                          {exp}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              ) : form.purpose === "PROBLEM" ? (
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Legal Grievance Category (विधिक समस्या की श्रेणी) *"
                      value={form.problemCategory}
                      onChange={(e) => handleInputChange("problemCategory", e.target.value)}
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                    >
                      {PROBLEM_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      label="Brief Matter Summary (समस्या का संक्षिप्त विवरण - 1 से 2 लाइन)"
                      value={form.problemSummary}
                      onChange={(e) => handleInputChange("problemSummary", e.target.value)}
                      placeholder="कृपया अपनी विधिक समस्या का मुख्य विषय लिखें..."
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      label="Franchise Node Background (फ्रेंचाइज़ी केंद्र स्थापना का संक्षिप्त विवरण)"
                      value={form.franchiseBackground}
                      onChange={(e) => handleInputChange("franchiseBackground", e.target.value)}
                      placeholder="ज़िला विधिक केंद्र हेतु मौजूदा कार्यालय या कार्य अनुभव..."
                      sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                    />
                  </Grid>
                </Grid>
              )}
            </Paper>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <Paper sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: "#1e293b", borderRadius: 3.5, border: "1px solid #334155" }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                <Box sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", p: 1, borderRadius: 2 }}>
                  <AccountBalanceIcon sx={{ color: "#38bdf8", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#ffffff">
                    📍 4. अधिकार क्षेत्र एवं पता (Jurisdiction & Address)
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">
                    अखिल भारतीय 28 राज्य, 8 केंद्र शासित प्रदेश व 780+ ज़िला क्षेत्राधिकार
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="State / Union Territory (राज्य / यूटी) *"
                    value={form.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                  >
                    {PAN_INDIA_STATES.map((st) => (
                      <MenuItem key={st} value={st}>
                        {st}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="District (ज़िला) *"
                    value={form.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                  >
                    {availableDistricts.map((dst) => (
                      <MenuItem key={dst} value={dst}>
                        {dst}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="City / Tehsil (शहर / तहसील)"
                    value={form.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="e.g. New Delhi"
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Pincode (पिनकोड) *"
                    value={form.pincode}
                    onChange={(e) => handleInputChange("pincode", e.target.value)}
                    placeholder="110001"
                    required
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Police Station (थाना - वैकल्पिक)"
                    value={form.policeStation}
                    onChange={(e) => handleInputChange("policeStation", e.target.value)}
                    placeholder="e.g. Tilak Marg"
                    sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", color: "#ffffff" } }}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <Paper sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: "#1e293b", borderRadius: 3.5, border: "1px solid #334155" }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", p: 1, borderRadius: 2 }}>
                  <VerifiedUserIcon sx={{ color: "#34d399", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#ffffff">
                    ✅ 5. अंतिम समीक्षा एवं OTP सत्यापन (Review & Verification)
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">
                    कृपया अपने विवरण की समीक्षा करें (किसी भी विवरण को बदलने हेतु सीधे एडिट करें)
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: "#0f172a", border: "1px solid #334155", borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="caption" color="#38bdf8" fontWeight={800}>
                        आवेदक व भूमिका
                      </Typography>
                      <IconButton size="small" onClick={() => setStep(2)} sx={{ color: "#94a3b8", p: 0.2 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="subtitle2" fontWeight={800} color="#ffffff">
                      {form.regType === "Organisation" ? form.orgName : `${form.namePrefix} ${form.firstName} ${form.lastName}`.trim()}
                    </Typography>
                    <Typography variant="caption" color="#cbd5e1">
                      भूमिका: <strong>{selectedPurposeObj.shortTitle}</strong> ({form.gender}, {form.birthYear})
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: "#0f172a", border: "1px solid #334155", borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="caption" color="#38bdf8" fontWeight={800}>
                        संपर्क व अधिकार क्षेत्र
                      </Typography>
                      <IconButton size="small" onClick={() => setStep(3)} sx={{ color: "#94a3b8", p: 0.2 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="subtitle2" fontWeight={800} color="#ffffff">
                      +91 {form.mobile} | {form.email}
                    </Typography>
                    <Typography variant="caption" color="#cbd5e1">
                      क्षेत्र: {form.district}, {form.state} ({form.pincode})
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ bgcolor: "#0f172a", p: 2, borderRadius: 2, border: "1px solid #334155", mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.termsAccepted}
                      onChange={(e) => handleInputChange("termsAccepted", e.target.checked)}
                      sx={{ color: "#34d399", "&.Mui-checked": { color: "#34d399" } }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="#e2e8f0" sx={{ fontSize: "0.85rem" }}>
                      मैं ICJ ऑनबोर्डिंग नियमों, बार काउंसिल ऑफ इंडिया रूल 36 एवं आईटी एक्ट धारा 79 इंटरमीडियरी सुरक्षा शर्तों को स्वीकार करता हूँ।
                    </Typography>
                  }
                />
              </Box>
            </Paper>
          )}
        </Container>
      </Box>

      {/* 3. BOTTOM NAVIGATION DOCK */}
      <Paper
        elevation={0}
        sx={{
          height: 60,
          minHeight: 60,
          maxHeight: 60,
          px: { xs: 2, md: 3 },
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
                borderRadius: 2,
                px: 2.5,
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
                borderRadius: 2,
                px: 3,
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
                borderRadius: 2,
                px: 3.5,
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
        PaperProps={{ sx: { bgcolor: "#0f172a", color: "#ffffff", borderRadius: 3, border: "1px solid #334155" } }}
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
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#1e293b",
                color: "#ffffff",
                fontSize: "1.2rem",
                letterSpacing: 4,
                textAlign: "center",
              },
            }}
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
