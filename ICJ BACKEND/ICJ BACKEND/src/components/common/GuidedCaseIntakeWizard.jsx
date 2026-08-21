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
  "Stage 0: 🔊 ऑडियो मार्गदर्शन (Welcome)",
  "Stage 1: 🗣️ समस्या दर्ज करें (Intake)",
  "Stage 2: 📂 कागजात अपलोड (Documents)",
  "Stage 3: 🤖 AI केस निदान (Diagnosis)",
  "Stage 4: ⚖️ वकील व 1-क्लिक एक्शन (Counsel & Action)",
];

export default function GuidedCaseIntakeWizard({ onCompleteCaseIntake, activeAdvocate, onRequestAdvocateChange }) {
  const [activeStep, setActiveStep] = useState(0);
  const [problemText, setProblemText] = useState("");
  const [caseCategory, setCaseCategory] = useState("civil");
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [alertMsg, setAlertMsg] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(true);

  const handleNext = () => {
    if (activeStep === 1 && !problemText.trim()) {
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
            <AutoAwesomeIcon /> 🏛️ 5-चरण नागरिक यात्रा (Citizen-First 5-Stage Guided Wizard)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            «“Citizen को system समझने की जरूरत न पड़े; system citizen को हर कदम पर समझाए और आगे ले जाए।”»
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
                ? "स्वागत है! पोर्टल कैसे काम करता है, कृपया ऑडियो सुनें।"
                : activeStep === 1
                ? "पहला चरण: अपनी कानूनी समस्या बोलकर या टाइप करके दर्ज करें।"
                : activeStep === 2
                ? "दूसरा चरण: अपने कोर्ट के कागजात या फोटो अपलोड करें।"
                : activeStep === 3
                ? "तीसरा चरण: आपकी समस्या की AI कानूनी रिपोर्ट तैयार की जा रही है।"
                : "चौथा चरण: वकील साहब नियुक्त हैं, 1-क्लिक एक्शन बटन का उपयोग करें।";
            VernacularVoiceAssistantService.speakInHindi(currentStepGuide);
          }}
          sx={{ fontWeight: "bold" }}
        >
          🔊 ऑडियो सुनें (Voice Guide)
        </Button>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* STEPPER HEADER (Clickable numbers to jump to any stage) */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map((label, index) => (
          <Step key={label} onClick={() => setActiveStep(index)} sx={{ cursor: "pointer" }}>
            <StepLabel>
              <Typography
                variant="caption"
                fontWeight={activeStep === index ? "bold" : "normal"}
                color={activeStep === index ? "primary" : "text.secondary"}
                sx={{ cursor: "pointer" }}
              >
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {alertMsg && <Alert severity="warning" sx={{ mb: 2 }}>{alertMsg}</Alert>}

      {/* STAGE 0: WELCOME & VERNACULAR AUDIO GUIDANCE */}
      {activeStep === 0 && (
        <Box sx={{ bgcolor: "#f0fdf4", p: 3, borderRadius: 2.5, border: "2px solid #059669" }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <MicIcon sx={{ fontSize: 40, color: "#059669" }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#065f46">
                STAGE 0: 🗣️ स्वागत व ऑडियो मार्गदर्शन (Vernacular Voice Welcome & Guidance)
              </Typography>
              <Typography variant="body2" color="#047857">
                यहाँ आपको कानूनी प्रक्रिया समझने या टाइप करने की आवश्यकता नहीं है। नीचे दिया गया ऑडियो बटन दबाकर अपनी भाषा में दिशा-निर्देश सुनें।
              </Typography>
            </Box>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, mb: 2.5, bgcolor: "#fff", borderColor: "#a7f3d0", borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="#065f46" mb={1}>
              📌 इस पोर्टल पर काम कैसे होगा?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              1. <strong>माइक से बोलें:</strong> आपकी बोली हुई बात तुरंत सुरक्षित केस रिकॉर्ड में टाइप होगी।<br />
              2. <strong>कागजात लोड करें:</strong> कोर्ट फाइल की फोटो या PDF अपलोड करें।<br />
              3. <strong>वकील व AI सहायता:</strong> ICJ लीगल पैनल का वकील आपकी सहायता हेतु नियुक्त रहेगा।
            </Typography>
          </Paper>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              color="success"
              startIcon={<MicIcon />}
              onClick={() => VernacularVoiceAssistantService.speakInHindi(VernacularVoiceAssistantService.prompts.WELCOME)}
              sx={{ fontWeight: "bold" }}
            >
              🔊 ऑडियो मार्गदर्शन चालू करें (Play Guidance)
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              sx={{ fontWeight: "bold", px: 3 }}
            >
              मैं समझ गया — आगे बढ़ें ➔
            </Button>
          </Stack>
        </Box>
      )}

      {/* STAGE 1: INTAKE */}
      {activeStep === 1 && (
        <Box sx={{ bgcolor: "#f8fafc", p: 2.5, borderRadius: 2.5, border: "1px solid #e2e8f0" }}>
          <Typography variant="subtitle2" fontWeight="bold" color="#0f172a" mb={1}>
            STAGE 1: 🗣️ अपनी कानूनी समस्या दर्ज करें (Describe Your Legal Situation)
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
                placeholder="यहाँ बोलकर या टाइप करके अपनी समस्या दर्ज करें... आपका बोला गया शब्द मास्टर केस रिकॉर्ड में सुरक्षित होगा।"
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* STAGE 2: DOCUMENTS */}
      {activeStep === 2 && (
        <Box sx={{ bgcolor: "#f0fdf4", p: 2.5, borderRadius: 2.5, border: "1px solid #bbf7d0" }}>
          <Typography variant="subtitle2" fontWeight="bold" color="#065f46" mb={1}>
            STAGE 2: 📂 पुराने कागजात लोड करें (Upload Legal Documents & Auto-Sorting)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            सिस्टम आपके कागजातों को कानूनी प्रक्रिया अनुसार (Plaint ➔ WS ➔ Orders) अपने आप क्रमबद्ध कर देगा।
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="contained" color="success" startIcon={<UploadFileIcon />} onClick={() => setUploadedFilesCount((prev) => prev + 1)}>
              ➕ कागज़ अपलोड करें (Upload Document)
            </Button>
            <Chip label={`अपलोड किए गए कागजात: ${uploadedFilesCount}`} color="success" sx={{ fontWeight: "bold" }} />
          </Stack>
        </Box>
      )}

      {/* STAGE 3: AI DIAGNOSIS */}
      {activeStep === 3 && (
        <Box sx={{ bgcolor: "#faf5ff", p: 2.5, borderRadius: 2.5, border: "1px solid #e9d5ff" }}>
          <Typography variant="subtitle2" fontWeight="bold" color="#6b21a8" mb={1}>
            STAGE 3: 🤖 AI केस निदान व धारा समीक्षा (AI Legal Risk & Section Diagnosis)
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#fff", borderColor: "#d8b4fe" }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              आपके द्वारा दर्ज वॉयस ट्रांसक्रिप्ट और अपलोड कागजात के आधार पर कानूनी धाराओं व रणनीति का विश्लेषण तैयार है:
            </Typography>
            <Chip label="✅ BNS / BNSS / CPC कानूनी धाराएं विश्लेषित" color="secondary" sx={{ fontWeight: "bold", mb: 1 }} />
            <Typography variant="caption" color="text.secondary" display="block">
              यह विश्लेषण स्वचालित रूप से आपके Master Case Folder (`CASE-XXXXXXXX`) में सहेजा जा चुका है।
            </Typography>
          </Paper>
        </Box>
      )}

      {/* STAGE 4: COUNSEL & ACTION */}
      {activeStep === 4 && (
        <Box sx={{ bgcolor: "#eff6ff", p: 2.5, borderRadius: 2.5, border: "1px solid #bfdbfe" }}>
          <Typography variant="subtitle2" fontWeight="bold" color="#1e40af" mb={1}>
            STAGE 4: ⚖️ नियुक्त वकील व 1-क्लिक एक्शन (Assigned Counsel & Action Controls)
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#fff", mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={7}>
                <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                  👨‍⚖️ नियुक्त एडवोकेट: {activeAdvocate ? activeAdvocate.name : "Adv. Vikramaditya Singh"}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  पद: {activeAdvocate ? activeAdvocate.specialization : "ICJ Central Senior Legal Panel Lead"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={5} textAlign="right">
                <Stack direction="column" spacing={1} alignItems="flex-end">
                  <Chip icon={<CheckCircleIcon />} label="ICJ Empaneled Counsel Active" color="primary" sx={{ fontWeight: "bold" }} />
                  {onRequestAdvocateChange && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={onRequestAdvocateChange}
                      sx={{ fontWeight: "bold", textTransform: "none", fontSize: "0.75rem" }}
                    >
                      🔄 वकील बदलवाने का अनुरोध करें (Change Counsel)
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>

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
          {activeStep === STEPS.length - 1 ? "✅ संपूर्ण केस यात्रा पूर्ण करें (Complete Case)" : "आगे बढ़ें (Next Step)"}
        </Button>
      </Stack>
    </Paper>
  );
}
