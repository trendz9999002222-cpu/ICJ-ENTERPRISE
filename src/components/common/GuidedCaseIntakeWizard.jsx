/**
 * GuidedCaseIntakeWizard — ICJ Enterprise Platform
 * 4-Step Guided Wizard Layout providing universal accessibility for all persona types
 * (Literate citizens, Advocates, Rural & Semi-literate litigants).
 * Step 1: 🗣️ समस्या दर्ज करें (Voice / Text Intake)
 * Step 2: 📂 कागजात लोड करें (Automatic Vault & Sorting)
 * Step 3: ⚖️ वकील आवंटन व AI निदान (AI Diagnosis & Counsel Allotment)
 * Step 4: 🏛️ लाइव कोर्ट स्थिति व 1-क्लिक एक्शन (Live Status & 1-Click Petitions)
 */

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Stack,
  Grid,
  Chip,
  TextField,
  MenuItem,
  Divider,
  Alert,
} from "@mui/material";

// Icons
import MicIcon from "@mui/icons-material/Mic";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import GavelIcon from "@mui/icons-material/Gavel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import VernacularVoiceAssistantService from "../../services/vernacularVoiceAssistantService.js";
import VoiceCommentaryStudio from "./VoiceCommentaryStudio.jsx";

const STEPS = [
  "Step 1: 🗣️ समस्या दर्ज करें (Intake)",
  "Step 2: 📂 कागजात अपलोड (Documents)",
  "Step 3: ⚖️ वकील व AI निदान (Counsel)",
  "Step 4: 🏛️ 1-क्लिक एक्शन (Action)",
];

export default function GuidedCaseIntakeWizard({ onCompleteCaseIntake, activeAdvocate }) {
  const [activeStep, setActiveStep] = useState(0);
  const [problemText, setProblemText] = useState("");
  const [caseCategory, setCaseCategory] = useState("civil");
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [alertMsg, setAlertMsg] = useState("");

  const handleNext = () => {
    if (activeStep === 0 && !problemText.trim()) {
      setAlertMsg("कृपया अपनी समस्या टाइप करें या माइक बटन दबाकर बोलें।");
      VernacularVoiceAssistantService.speakInHindi("कृपया अपनी समस्या टाइप करें या माइक बटन दबाकर बोलें।");
      return;
    }
    setAlertMsg("");
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      if (onCompleteCaseIntake) {
        onCompleteCaseIntake({ problemText, caseCategory, uploadedFilesCount });
      }
    }
  };

  const handleBack = () => {
    setAlertMsg("");
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <Paper elevation={3} className="bigtech-card glass-card" sx={{ p: 3, mb: 4, borderRadius: 3, borderLeft: "6px solid #1e3a8a" }}>
      {/* HEADER & VERNACULAR AUDIO GUIDE */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#1e3a8a" display="flex" alignItems="center" gap={1}>
            <AutoAwesomeIcon /> 🏛️ 4-चरणीय गाइडेड केस प्रोसेस (Universal 4-Step Guided Wizard)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            चाहे आप पढ़े-लिखे नागरिक हों, वकील हों या ग्रामीण क्षेत्र से हों — 1-2-3-4 क्रम में अपनी समस्या दर्ज करें।
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="success"
          size="small"
          startIcon={<MicIcon />}
          onClick={() => {
            const currentStepGuide =
              activeStep === 0
                ? "पहला चरण: अपनी कानूनी समस्या बोलकर या टाइप करके दर्ज करें।"
                : activeStep === 1
                ? "दूसरा चरण: अपने पुराने कोर्ट के कागजात अपलोड करें।"
                : activeStep === 2
                ? "तीसरा चरण: आपके लिए वकील साहब नियुक्त किए जा रहे हैं।"
                : "चौथा चरण: अपने केस की लाइव स्थिति देखें और 1-क्लिक बटन दबाएं।";
            VernacularVoiceAssistantService.speakInHindi(currentStepGuide);
          }}
          sx={{ fontWeight: "bold" }}
        >
          🔊 इस चरण का ऑडियो सुनें (Audio Guide)
        </Button>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* STEPPER HEADER */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map((label, index) => (
          <Step key={label}>
            <StepLabel>
              <Typography variant="caption" fontWeight={activeStep === index ? "bold" : "normal"} color={activeStep === index ? "primary" : "text.secondary"}>
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {alertMsg && <Alert severity="warning" sx={{ mb: 2 }}>{alertMsg}</Alert>}

      {/* STEP 1: INTAKE */}
      {activeStep === 0 && (
        <Box sx={{ bgcolor: "#f8fafc", p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0" }}>
          <Typography variant="subtitle2" fontWeight="bold" color="#0f172a" mb={1}>
            चरण 1: 🗣️ अपनी कानूनी समस्या दर्ज करें (Describe Your Legal Situation)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth size="small"
                label="मामले का प्रकार (Category)"
                value={caseCategory}
                onChange={(e) => setCaseCategory(e.target.value)}
              >
                <MenuItem value="civil">🏛️ सिविल विवाद (Civil Dispute)</MenuItem>
                <MenuItem value="criminal">⚖️ आपराधिक मामला (Criminal Matter)</MenuItem>
                <MenuItem value="family">👨‍👩‍👧 पारिवारिक विवाद (Family Court)</MenuItem>
                <MenuItem value="property">🏠 संपत्ति विवाद (Property Dispute)</MenuItem>
                <MenuItem value="cheque_bounce">💳 चेक बाउंस (Cheque Bounce)</MenuItem>
                <MenuItem value="consumer">🛒 उपभोक्ता शिकायत (Consumer Commission)</MenuItem>
                <MenuItem value="cat_ngt">🏢 CAT / NGT / ट्रिब्यूनल मामला</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={8}>
              <VoiceCommentaryStudio
                value={problemText}
                onChange={(txt) => setProblemText(txt)}
                label="समस्या का विवरण (बोलें या टाइप करें)"
                placeholder="यहाँ बोलकर या टाइप करके अपनी समस्या दर्ज करें..."
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* STEP 2: DOCUMENTS */}
      {activeStep === 1 && (
        <Box sx={{ bgcolor: "#f0fdf4", p: 2.5, borderRadius: 2.5, border: "1px solid #bbf7d0" }}>
          <Typography variant="subtitle2" fontWeight="bold" color="#065f46" mb={1}>
            चरण 2: 📂 पुराने कागजात लोड करें (Upload Legal Documents & Auto-Sorting)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            सिस्टम आपके कागजातों को कानूनी प्रक्रिया अनुसार (Plaint ➔ WS ➔ Orders) अपने आप क्रमबद्ध कर देगा।
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="contained" color="success" startIcon={<UploadFileIcon />} onClick={() => setUploadedFilesCount((prev) => prev + 1)}>
              ➕ कागज़ अपलोड करें (Upload Document)
            </Button>
            <Chip label={`अपलोड किए गए कागजात: ${uploadedFilesCount}`} color="success" fontWeight="bold" />
          </Stack>
        </Box>
      )}

      {/* STEP 3: COUNSEL */}
      {activeStep === 2 && (
        <Box sx={{ bgcolor: "#eff6ff", p: 2.5, borderRadius: 2.5, border: "1px solid #bfdbfe" }}>
          <Typography variant="subtitle2" fontWeight="bold" color="#1e40af" mb={1}>
            चरण 3: ⚖️ वकील आवंटन व AI निदान (Counsel Allotment & AI Diagnosis)
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#fff" }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                  आवंटित ICJ वकील: {activeAdvocate ? activeAdvocate.name : "Empaneled Legal Counsel (High Court)"}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  आपके केस का AI निदान और वकालत रणनीति तैयार है।
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} textAlign="right">
                <Chip icon={<CheckCircleIcon />} label="Counsel Verified & Active" color="primary" sx={{ fontWeight: "bold" }} />
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {/* STEP 4: ACTION */}
      {activeStep === 3 && (
        <Box sx={{ bgcolor: "#fffbeb", p: 2.5, borderRadius: 2.5, border: "1px solid #fde68a" }}>
          <Typography variant="subtitle2" fontWeight="bold" color="#92400e" mb={1}>
            चरण 4: 🏛️ लाइव कोर्ट स्थिति व 1-क्लिक एक्शन (Live Status & 1-Click Petitions)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            तारीख पेशी, हाजिरी माफी या नकल निकलवाने के लिए केवल 1-क्लिक बटन दबाएं।
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Button variant="contained" color="warning" size="small">📅 Adjournment Petition</Button>
            <Button variant="contained" color="info" size="small">🙋‍♂️ Exemption Application</Button>
            <Button variant="contained" color="primary" size="small">📜 Certified Copy</Button>
          </Stack>
        </Box>
      )}

      {/* FOOTER ACTIONS */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
        <Button disabled={activeStep === 0} onClick={handleBack} startIcon={<ArrowBackIcon />}>
          पीछे (Back)
        </Button>
        <Button variant="contained" color="primary" onClick={handleNext} endIcon={<ArrowForwardIcon />} sx={{ py: 1, px: 3, fontWeight: "bold" }}>
          {activeStep === STEPS.length - 1 ? "✅ केस प्रक्रिया पूरी करें (Complete)" : "आगे बढ़ें (Next Step)"}
        </Button>
      </Stack>
    </Paper>
  );
}
