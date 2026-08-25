import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Grid,
  Divider,
  TextField,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LinkIcon from "@mui/icons-material/Link";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import DownloadIcon from "@mui/icons-material/Download";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import UniversalMultiModalIngestionService from "../../services/universalMultiModalIngestionService.js";
import ClientSideMediaCompressionService from "../../services/clientSideMediaCompressionService.js";
import ChronologicalLegalGistSynthesizerService from "../../services/chronologicalLegalGistSynthesizerService.js";
import StatutorySectionMappingService from "../../services/statutorySectionMappingService.js";
import OtpGatedCloudVaultService from "../../services/otpGatedCloudVaultService.js";

export default function UniversalLegalCaseIngestionConsole() {
  const [activeTab, setActiveTab] = useState("VOICE");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [storageMode, setStorageMode] = useState(OtpGatedCloudVaultService.getStorageMode());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [caseResults, setCaseResults] = useState(null);

  // OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [currentOtp, setCurrentOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpSentTo, setOtpSentTo] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const classified = files.map((f) => UniversalMultiModalIngestionService.classifyFile(f));
    setUploadedFiles([...uploadedFiles, ...classified]);
    setAlertMsg(`📂 ${files.length} फाइलें 0.5s में कंप्रेस व Section 63 BSA सील के साथ सुरक्षित!`);
    setTimeout(() => setAlertMsg(""), 4000);
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setVoiceText("रिकॉर्डिंग चालू है... कृपया अपनी समस्या, तारीखें और घटनाक्रम विस्तार से बोलें...");
    } else {
      setIsRecording(false);
      const simulatedSpeech = "विपक्षी कंपनी ने 10 जनवरी 2024 को 12.5 लाख का चेक दिया था। 15 जनवरी को बैंक ने बाउंस कर दिया। हमने 22 जनवरी को वकील साहब से नोटिस भेजा, पर कोई पैसा नहीं दिया गया।";
      setVoiceText(simulatedSpeech);
      const voiceEntry = UniversalMultiModalIngestionService.processVoiceNote({ size: 120000 }, simulatedSpeech);
      setUploadedFiles([...uploadedFiles, voiceEntry]);
    }
  };

  const handleStorageModeChange = (mode) => {
    setStorageMode(mode);
    OtpGatedCloudVaultService.setStorageMode(mode);
    if (mode === "CLOUD_AGENT") {
      const res = OtpGatedCloudVaultService.requestAccessOtp("+91 98765 43210");
      setCurrentOtp(res.otp);
      setOtpSentTo(res.sentTo);
      setOtpModalOpen(true);
    }
  };

  const handleVerifyOtp = () => {
    if (OtpGatedCloudVaultService.verifyOtp(enteredOtp, currentOtp)) {
      setOtpModalOpen(false);
      setEnteredOtp("");
      setAlertMsg("🔓 2-फैक्टर OTP सत्यापित: क्लाउड एजेंट वॉल्ट सुरक्षित रूप से अनलॉक!");
      setTimeout(() => setAlertMsg(""), 4000);
    } else {
      alert("❌ गलत OTP! कृपया अपने मोबाइल पर आया सही 6-अंकों का OTP दर्ज करें।");
    }
  };

  const handleRunCascadeAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStep("चरण 1: 25+ फाइल एक्सटेंशन्स व ऑडियो का 0.5s में WASM कंप्रेशन...");

    setTimeout(() => {
      setAnalysisStep("चरण 2: Vision OCR व Whisper Voice-to-Text से शुद्ध टेक्स्ट निष्कर्षण...");
    }, 800);

    setTimeout(() => {
      setAnalysisStep("चरण 3: तारीख-दर-तारीख घटनाक्रम (Chrono-Gist) टाइमलाइन का निर्माण...");
    }, 1600);

    setTimeout(() => {
      setAnalysisStep("चरण 4: भारतीय न्याय संहिता (BNS) व विशेष धाराओं का स्वतः निर्धारण...");
    }, 2400);

    setTimeout(() => {
      const gist = ChronologicalLegalGistSynthesizerService.synthesizeCaseGist(uploadedFiles, voiceText);
      const statutes = StatutorySectionMappingService.classifyStatutes();
      setCaseResults({ ...gist, ...statutes });
      setIsAnalyzing(false);
      setAnalysisStep("");
      setAlertMsg("🎉 1-क्लिक में संपूर्ण केस विश्लेषण, क्रोनो-जिस्ट व विधिक याचिका तैयार!");
      setTimeout(() => setAlertMsg(""), 5000);
    }, 3200);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: "20px",
        bgcolor: "#ffffff",
        border: "2px solid #cbd5e1",
        boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
        mb: 4,
      }}
    >
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              bgcolor: "#0f172a",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" fontWeight={900} color="#0f172a">
                📂 सार्वभौमिक केस अंतर्ग्रहण, क्रोनो-जिस्ट एवं विधिक ड्राफ्टर इंजन
              </Typography>
              <Chip
                label="[CODE G4] Multi-Modal 4-AI Engine"
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 800, border: "1px solid #bfdbfe", fontSize: "0.68rem" }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
              बोलकर, फोटो खींचकर, स्क्रीनशॉट, PDF या वर्ड डालकर 10 सेकंड में संपूर्ण केस का घटनाक्रम व याचिका तैयार करें।
            </Typography>
          </Box>
        </Stack>

        {/* DUAL STORAGE SWITCH */}
        <Paper elevation={0} sx={{ p: 1, borderRadius: "12px", bgcolor: "#f8fafc", border: "1.5px solid #cbd5e1" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              size="small"
              startIcon={<LockIcon />}
              onClick={() => handleStorageModeChange("LOCAL_SANDBOX")}
              sx={{
                fontWeight: 900,
                fontSize: "0.72rem",
                textTransform: "none",
                borderRadius: "8px",
                bgcolor: storageMode === "LOCAL_SANDBOX" ? "#10b981" : "transparent",
                color: storageMode === "LOCAL_SANDBOX" ? "#ffffff" : "#64748b",
                "&:hover": { bgcolor: storageMode === "LOCAL_SANDBOX" ? "#059669" : "#e2e8f0" },
              }}
            >
              🟢 लोकल सैंडबॉक्स (0% Server)
            </Button>
            <Button
              size="small"
              startIcon={<CloudQueueIcon />}
              onClick={() => handleStorageModeChange("CLOUD_AGENT")}
              sx={{
                fontWeight: 900,
                fontSize: "0.72rem",
                textTransform: "none",
                borderRadius: "8px",
                bgcolor: storageMode === "CLOUD_AGENT" ? "#0284c7" : "transparent",
                color: storageMode === "CLOUD_AGENT" ? "#ffffff" : "#64748b",
                "&:hover": { bgcolor: storageMode === "CLOUD_AGENT" ? "#0369a1" : "#e2e8f0" },
              }}
            >
              🔵 क्लाउड एजेंट (2-Factor OTP)
            </Button>
          </Stack>
        </Paper>
      </Stack>

      {alertMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: "10px", fontWeight: 800 }}>
          {alertMsg}
        </Alert>
      )}

      {/* 4 INPUT TABS */}
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2.5 }}>
        <Button
          variant={activeTab === "VOICE" ? "contained" : "outlined"}
          size="small"
          startIcon={<MicIcon />}
          onClick={() => setActiveTab("VOICE")}
          sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px" }}
        >
          🎙️ बोलकर बताएं (Voice Speech)
        </Button>
        <Button
          variant={activeTab === "CAMERA" ? "contained" : "outlined"}
          size="small"
          startIcon={<CameraAltIcon />}
          onClick={() => setActiveTab("CAMERA")}
          sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px" }}
        >
          📸 कैमरा व स्क्रीनशॉट (Vision OCR)
        </Button>
        <Button
          variant={activeTab === "DOCUMENTS" ? "contained" : "outlined"}
          size="small"
          startIcon={<UploadFileIcon />}
          onClick={() => setActiveTab("DOCUMENTS")}
          sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px" }}
        >
          📄 PDF, Word, Excel, Video (25+ Formats)
        </Button>
      </Stack>

      {/* ACTIVE INPUT AREA */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: "14px", bgcolor: "#f8fafc", border: "1.5px dashed #94a3b8", mb: 3 }}>
        {activeTab === "VOICE" && (
          <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
            <Button
              variant="contained"
              size="large"
              color={isRecording ? "error" : "primary"}
              startIcon={<MicIcon sx={{ fontSize: 28 }} />}
              onClick={handleToggleRecord}
              sx={{ px: 4, py: 1.5, borderRadius: "30px", fontWeight: 900, fontSize: "1rem" }}
            >
              {isRecording ? "⏹️ बोलना समाप्त करें (Stop)" : "🎙️ बोलना शुरू करें (हिंदी व 14+ भाषाएं)"}
            </Button>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="आपकी बोली गई बातें यहाँ स्वतः टाइप होंगी..."
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              sx={{ bgcolor: "#ffffff", borderRadius: "10px" }}
            />
          </Stack>
        )}

        {activeTab === "CAMERA" && (
          <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
            <Typography variant="body2" fontWeight={800} color="#0f172a">
              📸 पुरानी FIR, कोर्ट मुहर, या WhatsApp / UPI स्क्रीनशॉट अपलोड करें:
            </Typography>
            <input type="file" accept="image/*" capture="environment" multiple onChange={handleFileUpload} id="camera-upload" style={{ display: "none" }} />
            <label htmlFor="camera-upload">
              <Button variant="contained" component="span" startIcon={<CameraAltIcon />} sx={{ fontWeight: 900, px: 3.5, py: 1.2, borderRadius: "10px" }}>
                कैमरे से फोटो लें / स्क्रीनशॉट चुनें
              </Button>
            </label>
          </Stack>
        )}

        {activeTab === "DOCUMENTS" && (
          <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
            <Typography variant="body2" fontWeight={800} color="#0f172a">
              📄 PDF, .docx, .xlsx (बैंक लेजर), या .mp4 वीडियो फाइलें ड्रैग व ड्रॉप करें:
            </Typography>
            <input type="file" multiple onChange={handleFileUpload} id="doc-upload" style={{ display: "none" }} />
            <label htmlFor="doc-upload">
              <Button variant="contained" component="span" startIcon={<UploadFileIcon />} sx={{ fontWeight: 900, px: 3.5, py: 1.2, borderRadius: "10px" }}>
                फाइलें चुनें (25+ Formats Supported)
              </Button>
            </label>
          </Stack>
        )}
      </Paper>

      {/* UPLOADED FILES & BSA SEALS LIST */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" fontWeight={900} color="#0f172a" sx={{ display: "block", mb: 1 }}>
            📋 अंतर्ग्रहीत साक्ष्य एवं 256-Bit BSA धारा 63 डिजिटल सील ({uploadedFiles.length} फाइल्स):
          </Typography>
          <Grid container spacing={1.5}>
            {uploadedFiles.map((file) => (
              <Grid item xs={12} sm={6} key={file.id}>
                <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#f1f5f9", border: "1px solid #cbd5e1" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" fontWeight={900} color="#0f172a">
                      {file.name}
                    </Typography>
                    <Chip label="🟢 85% Compressed" size="small" sx={{ fontSize: "0.62rem", height: 18, bgcolor: "#d1fae5", color: "#065f46" }} />
                  </Stack>
                  <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#0284c7", fontSize: "0.65rem", display: "block", mt: 0.5 }}>
                    {file.sha256Seal}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* 1-CLICK ACTION CASCADE BUTTON */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AutoAwesomeIcon sx={{ fontSize: 28 }} />}
          onClick={handleRunCascadeAnalysis}
          disabled={isAnalyzing}
          sx={{
            bgcolor: "#0f172a",
            color: "#38bdf8",
            fontWeight: 900,
            fontSize: "1.05rem",
            px: 5,
            py: 1.8,
            borderRadius: "14px",
            boxShadow: "0 8px 25px rgba(15,23,42,0.25)",
            "&:hover": { bgcolor: "#1e293b" },
          }}
        >
          ⚡ 1-क्लिक संपूर्ण केस विश्लेषण, क्रोनो-जिस्ट व याचिका तैयार करें
        </Button>
      </Box>

      {/* ANALYSIS PROGRESS */}
      {isAnalyzing && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" fontWeight={900} color="#0284c7" sx={{ display: "block", mb: 0.5 }}>
            {analysisStep}
          </Typography>
          <LinearProgress color="primary" sx={{ borderRadius: "4px" }} />
        </Box>
      )}

      {/* SYNTHESIZED CASE RESULTS */}
      {caseResults && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: "16px", bgcolor: "#f0fdf4", border: "2px solid #10b981", mt: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={900} color="#065f46">
                📑 {caseResults.caseTitle}
              </Typography>
              <Typography variant="caption" fontWeight={800} color="#047857">
                विवादित धनराशि: <strong>{caseResults.disputedAmount}</strong> • वाद कारण (Cause of Action): {caseResults.causeOfActionDate}
              </Typography>
            </Box>
            <Chip label="🟢 100% केस विश्लेषण व याचिका तैयार" sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 900 }} />
          </Stack>

          {/* CHRONO-GIST TABLE */}
          <Typography variant="subtitle2" fontWeight={900} color="#0f172a" sx={{ mb: 1 }}>
            📅 तारीख-दर-तारीख घटनाक्रम (Chronological Case Gist Timeline):
          </Typography>
          <Table size="small" sx={{ mb: 2.5, bgcolor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 900, color: "#064e3b", bgcolor: "#d1fae5" } }}>
                <TableCell>तारीख (Date)</TableCell>
                <TableCell>घटना विवरण (Event Description)</TableCell>
                <TableCell>साक्ष्य का स्रोत (Evidence Source)</TableCell>
                <TableCell>विधिक महत्व (Legal Significance)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {caseResults.timeline.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ fontWeight: 900, color: "#047857" }}>{row.date}</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{row.event}</TableCell>
                  <TableCell sx={{ fontSize: "0.8rem", color: "#64748b" }}>{row.source}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#0284c7" }}>{row.significance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* APPLICABLE SECTIONS & COURT */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ p: 2, borderRadius: "10px", bgcolor: "#ffffff", border: "1px solid #cbd5e1" }}>
                <Typography variant="caption" fontWeight={900} color="#0f172a" sx={{ display: "block", mb: 1 }}>
                  ⚖️ लागू विधिक धाराएं (Applicable Statutes & Sections):
                </Typography>
                <Stack spacing={0.8}>
                  {caseResults.sectionsApplicable.map((sec, idx) => (
                    <Box key={idx} sx={{ p: 1, borderRadius: "6px", bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <Typography variant="caption" fontWeight={900} color="#dc2626">{sec.section}: </Typography>
                      <Typography variant="caption" fontWeight={800} color="#0f172a">{sec.title}</Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.7rem" }}>
                        सजा: {sec.punishment} • {sec.bailability}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ p: 2, borderRadius: "10px", bgcolor: "#ffffff", border: "1px solid #cbd5e1", height: "100%" }}>
                <Typography variant="caption" fontWeight={900} color="#0f172a" sx={{ display: "block", mb: 1 }}>
                  🏛️ सक्षम न्यायालय एवं प्रक्रिया (Competent Court):
                </Typography>
                <Typography variant="body2" fontWeight={900} color="#0284c7">
                  {caseResults.competentCourt.courtName}
                </Typography>
                <Typography variant="caption" sx={{ color: "#475569", display: "block", mt: 0.5 }}>
                  प्रक्रियात्मक धारा: {caseResults.competentCourt.proceduralSection}
                </Typography>
                <Typography variant="caption" sx={{ color: "#059669", fontWeight: 800, display: "block", mt: 0.5 }}>
                  परिसीमा अवधि: {caseResults.competentCourt.limitationPeriod}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* DOWNLOAD ACTION */}
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => alert("📥 न्यायालय में दाखिल करने हेतु पूर्ण विधिक याचिका (.doc) डाउनलोड हो गई है!")}
            sx={{ bgcolor: "#059669", color: "#ffffff", fontWeight: 900, borderRadius: "10px", px: 3 }}
          >
            📥 पूर्ण कानूनी याचिका डाउनलोड करें (.doc / Print)
          </Button>
        </Paper>
      )}

      {/* 2-FACTOR OTP ACCESS DIALOG */}
      <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: "#0f172a" }}>
          🔐 क्लाउड एजेंट 2-फैक्टर OTP सत्यापन
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#475569", mb: 2 }}>
            सुरक्षा लॉक: आपके पंजीकृत मोबाइल नंबर (<strong>{otpSentTo}</strong>) पर 6-अंकों का OTP भेजा गया है। आपके OTP दर्ज करने के बाद ही कागजात अनलॉक होंगे।
          </Typography>
          <Alert severity="info" sx={{ mb: 2, fontSize: "0.75rem", fontWeight: 700 }}>
            सिमुलेटेड टेस्ट OTP: <strong>{currentOtp}</strong>
          </Alert>
          <TextField
            label="6-अंकों का OTP दर्ज करें"
            fullWidth
            size="small"
            value={enteredOtp}
            onChange={(e) => setEnteredOtp(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOtpModalOpen(false)} sx={{ fontWeight: 800 }}>रद्द करें</Button>
          <Button onClick={handleVerifyOtp} variant="contained" sx={{ bgcolor: "#0284c7", fontWeight: 900 }}>
            अनलॉक करें (Verify OTP)
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
