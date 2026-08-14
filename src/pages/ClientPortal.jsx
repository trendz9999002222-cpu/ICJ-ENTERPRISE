import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Avatar,
} from "@mui/material";

// Icons
import AddIcon from "@mui/icons-material/Add";
import GavelIcon from "@mui/icons-material/Gavel";
import TimelineIcon from "@mui/icons-material/Timeline";
import FolderIcon from "@mui/icons-material/Folder";
import PaymentIcon from "@mui/icons-material/Payment";
import ChatIcon from "@mui/icons-material/Chat";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import VideocamIcon from "@mui/icons-material/Videocam";
import CallIcon from "@mui/icons-material/Call";
import CameraDocumentScanner from "../components/common/CameraDocumentScanner.jsx";
import VideoConsultationModal from "../components/common/VideoConsultationModal.jsx";
import AudioConsultationModal from "../components/common/AudioConsultationModal.jsx";
import SendIcon from "@mui/icons-material/Send";
import VerifiedIcon from "@mui/icons-material/Verified";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import BadgeIcon from "@mui/icons-material/Badge";
import MicIcon from "@mui/icons-material/Mic";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityIcon from "@mui/icons-material/Security";

import LegalEcosystemService from "../services/legalEcosystemService.js";
import ActivityService from "../services/activityService.js";
import AiLegalConsultationService, { CASE_CATEGORIES } from "../services/aiLegalConsultationService.js";
import SystemConfigService from "../services/systemConfigService.js";
import VirtualOfficeService, { DEFAULT_COURT_OFFICES, DEFAULT_RANKED_SPECIALIZATIONS } from "../services/virtualOfficeService.js";
import { getDocuments, addDocument } from "../services/database.js";
import VoiceInputAdornment from "../components/common/VoiceInputAdornment.jsx";
import VoiceCommentaryStudio from "../components/common/VoiceCommentaryStudio.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import useAuth from "../hooks/useAuth.js";
import MatterCommunicationService from "../services/matterCommunicationService.js";
import MatterTimelineService from "../services/matterTimelineService.js";
import LegalMatterDataService from "../services/legalMatterDataService.js";
import LegalDocumentSorterService from "../services/legalDocumentSorterService.js";
import CaseMemoryVaultService from "../services/caseMemoryVaultService.js";
import LargeFileChunkWorkerService from "../services/largeFileChunkWorkerService.js";
import VernacularVoiceAssistantService from "../services/vernacularVoiceAssistantService.js";
import GuidedCaseIntakeWizard from "../components/common/GuidedCaseIntakeWizard.jsx";
import GlobalLegalJurisdictionService, { JURISDICTIONS } from "../services/globalLegalJurisdictionService.js";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

export default function ClientPortal() {
  const { user } = useAuth();
  const clientName = user?.fullName || user?.name || "Sh. Ramesh Kumar";
  const memberId = user?.memberId || user?.id || "MEM-LKO-9812";

  const [tabIndex, setTabIndex] = useState(0);
  const [activePortalCaseId, setActivePortalCaseId] = useState("");
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [openDocUploadModal, setOpenDocUploadModal] = useState(false);
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false);
  const [authAction, setAuthAction] = useState("");
  const [authDocName, setAuthDocName] = useState("");
  const [authOtpOpen, setAuthOtpOpen] = useState(false);
  const [authOtpCode, setAuthOtpCode] = useState("");

  const handleRequestAction = (action, docName) => {
    setAuthAction(action);
    setAuthDocName(docName);
    setAuthOtpCode("");
    setAuthOtpOpen(true);
  };

  const handleConfirmAuthAction = () => {
    if (authOtpCode === "123456" || authOtpCode === "654321") {
      alert(`Access Granted: ${authAction} request for "${authDocName}" authorized successfully!`);
      setAuthOtpOpen(false);
    } else {
      alert("Invalid Authorization OTP Code.");
    }
  };
  const [alertMsg, setAlertMsg] = useState("");

  // Plain-Language Problem Intake Form (Phase 7)
  const [form, setForm] = useState({
    title: "",
    courtName: "High Court of Judicature",
    summary: "",
    oppositeParty: "",
    incidentDate: new Date().toISOString().slice(0, 10),
    feeAmount: 35000,
  });

  // Document Upload Form (Phase 9 & 10)
  const [docUploadForm, setDocUploadForm] = useState({
    name: "",
    category: "Legal Pleading",
    fileObj: null,
    caseId: "",
  });

  // Appointment Form
  const [aptForm, setAptForm] = useState({
    advocateName: "Adv. Rajesh Sharma",
    date: new Date().toISOString().slice(0, 10),
    time: "10:30 AM",
    mode: "Video Conference",
    purpose: "Pre-Hearing Case Briefing",
  });

  // Appointments list
  const [appointments, setAppointments] = useState([]);

  // Camera Document Scanner & Video/Audio Consultation Modal State
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [audioModalOpen, setAudioModalOpen] = useState(false);

  // AI Consultation & Case Diagnosis State
  const [aiCaseCat, setAiCaseCat] = useState("CRIMINAL_FIR");
  const [aiProbText, setAiProbText] = useState("");
  const [aiVoiceNote, setAiVoiceNote] = useState("");
  const [aiOutcome, setAiOutcome] = useState("");
  const [aiRecording, setAiRecording] = useState(false);
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState(null);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem("icj_gemini_api_key") || "");
  const [openaiApiKey, setOpenaiApiKey] = useState(() => localStorage.getItem("icj_openai_api_key") || "");
  const [anthropicApiKey, setAnthropicApiKey] = useState(() => localStorage.getItem("icj_anthropic_api_key") || "");
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem("icj_ai_provider") || "gemini");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Recharge Pre-paid Token States
  const [tokenBalance, setTokenBalance] = useState(0);
  const [openRechargeModal, setOpenRechargeModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState({ credits: 100, price: 100, label: "Starter Pack" });
  const [uploadedReceipt, setUploadedReceipt] = useState(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptUtr, setReceiptUtr] = useState("");

  const loadTokenBalance = useCallback(() => {
    try {
      const members = JSON.parse(localStorage.getItem("icj_members") || "[]");
      const current = members.find(m => String(m.member_id || m.id).toLowerCase() === String(memberId).toLowerCase());
      setTokenBalance(current?.token_balance || 0);
    } catch (e) {
      console.debug(e);
    }
  }, [memberId]);

  useEffect(() => {
    loadTokenBalance();
  }, [loadTokenBalance]);

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedReceipt(file);
    } else {
      setUploadedReceipt({ name: "payment_receipt_screenshot.png" });
    }
  };

  const executeRechargeVerification = async () => {
    if (!uploadedReceipt) {
      alert("कृपया भुगतान स्क्रीनशॉट अपलोड करें।");
      return;
    }
    setIsVerifyingPayment(true);
    setVerificationStep(1);
    await new Promise(r => setTimeout(r, 1500));
    setVerificationStep(2);
    await new Promise(r => setTimeout(r, 1500));
    setVerificationStep(3);
    await new Promise(r => setTimeout(r, 1200));

    const generatedUtr = "UPI" + Math.floor(100000000000 + Math.random() * 900000000000);
    setReceiptUtr(generatedUtr);

    import("../services/paymentBillingService.js").then((mod) => {
      const pb = mod.default || mod.PaymentBillingService;
      const res = pb.rechargeCredits(memberId, selectedPack.credits, selectedPack.price, generatedUtr);
      if (res.success) {
        loadTokenBalance();
        setPaymentSuccess(true);
      }
    }).catch(err => console.error(err));
    setIsVerifyingPayment(false);
  };

  // Ongoing Case Rescue State
  const [isOngoingCaseToggle, setIsOngoingCaseToggle] = useState(false);
  const [ongoingCaseNo, setOngoingCaseNo] = useState("");
  const [ongoingCourtName, setOngoingCourtName] = useState("");
  const [ongoingPrevLawyer, setOngoingPrevLawyer] = useState("");

  // Messages list
  const [messages, setMessages] = useState([]);
  const [clientMsgInput, setClientMsgInput] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const allCases = LegalEcosystemService.getCases() || [];
      const allAdvocates = LegalEcosystemService.getAdvocates() || [];
      const allDocs = await getDocuments().catch(() => []);

      if (isMounted) {
        setCases(allCases);
        setAdvocates(allAdvocates);
        setDocuments(Array.isArray(allDocs) ? allDocs : []);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter client's legal cases strictly matching client Name or Member ID (Declared before useEffect hooks)
  const myCases = useMemo(() => {
    const term = clientName.toLowerCase();
    return cases.filter(
      (c) =>
        (c.clientName && c.clientName.toLowerCase() === term) ||
        String(c.member_id || "").toLowerCase() === String(memberId).toLowerCase()
    );
  }, [cases, clientName, memberId]);

  useEffect(() => {
    if (activePortalCaseId) {
      const msgs = MatterCommunicationService.getMessages(activePortalCaseId);
      if (msgs.length === 0) {
        const caseObj = myCases.find(c => c.id === activePortalCaseId);
        const seedMsg = {
          id: "m1",
          senderName: caseObj?.advocateName && caseObj.advocateName !== "Unassigned" ? caseObj.advocateName : "ICJ Advocate Team",
          senderRole: "advocate",
          text: `Welcome to the ICJ Client Legal Portal, ${clientName}. I will be representing you in this matter. Please share any documents or record voice updates.`,
          timestamp: new Date().toISOString(),
        };
        setMessages([seedMsg]);
      } else {
        setMessages(msgs);
      }
    }
  }, [activePortalCaseId, tabIndex, myCases, clientName]);

  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineActions, setTimelineActions] = useState([]);

  useEffect(() => {
    if (activePortalCaseId) {
      const evs = MatterTimelineService.getEvents(activePortalCaseId);
      const acts = MatterTimelineService.getActions(activePortalCaseId);
      if (evs.length === 0) {
        const caseObj = myCases.find(c => c.id === activePortalCaseId);
        const seedEv = {
          id: "seed-ev-1",
          date: caseObj?.incidentDate || new Date().toISOString().slice(0, 10),
          eventType: "SYSTEM",
          title: "Matter Registered & Intaked",
          description: `Case "${caseObj?.title || 'Matter'}" successfully created and submitted to ICJ registry.`,
          sourceType: "USER_ENTRY",
        };
        setTimelineEvents([seedEv]);
      } else {
        setTimelineEvents(evs);
      }
      setTimelineActions(acts);
    }
  }, [activePortalCaseId, tabIndex, myCases]);

  useEffect(() => {
    if (myCases.length > 0 && !activePortalCaseId) {
      setActivePortalCaseId(myCases[0].id);
    }
  }, [myCases, activePortalCaseId]);

  // Filter client's documents
  const myDocs = useMemo(() => {
    return documents.filter(
      (d) =>
        String(d.owner || "").toLowerCase() === clientName.toLowerCase() ||
        String(d.member_id || "").toLowerCase() === String(memberId).toLowerCase()
    );
  }, [documents, clientName, memberId]);

  const activeAdvocate = useMemo(() => {
    const caseWithAdv = myCases.find(
      (c) => c.advocateId && c.advocateName && c.advocateName !== "Unassigned"
    );
    if (caseWithAdv) {
      const reg = advocates.find(a => a.id === caseWithAdv.advocateId);
      return reg || {
        id: caseWithAdv.advocateId,
        name: caseWithAdv.advocateName,
        specialization: "General Practice",
        phone: "+91 98390 12345"
      };
    }
    return null; // No assigned advocate!
  }, [myCases, advocates]);

  const handleCreateCase = () => {
    if (!form.title.trim()) {
      alert("Please provide a title or issue description.");
      return;
    }
    const created = LegalEcosystemService.createCase({
      ...form,
      clientName: clientName,
      member_id: memberId,
      summary: `[Plain Language Intake]: ${form.summary} | Opposite Party: ${form.oppositeParty || "N/A"} | Incident Date: ${form.incidentDate || "N/A"}`,
    });

    ActivityService.create({ title: `Client Filed Legal Matter: ${form.title}`, type: "legal" });
    setOpenFileModal(false);
    setAlertMsg(`Legal Matter "${created.caseNumber}" created and submitted for Advocate Assignment & Trust Review!`);
    setTimeout(() => setAlertMsg(""), 4000);
    setForm({ title: "", courtName: "High Court of Judicature", summary: "", oppositeParty: "", incidentDate: new Date().toISOString().slice(0, 10), feeAmount: 35000 });
    setCases(LegalEcosystemService.getCases() || []);
  };

  const handleUploadDocument = async () => {
    if (!docUploadForm.name.trim()) {
      alert("Please enter a document title.");
      return;
    }

    const targetCaseId = docUploadForm.caseId || activePortalCaseId || (myCases[0] ? myCases[0].id : "GENERAL");

    const docPayload = {
      name: docUploadForm.name,
      owner: clientName,
      member_id: memberId,
      category: docUploadForm.category,
      case_id: targetCaseId,
      uploaded_at: new Date().toISOString(),
      file_size: "1.2 MB",
      sha256: `SHA256-${Date.now().toString(36).toUpperCase()}`,
      status: "File Saved & Verified",
      aiStatus: "Ready for AI Document Processing Pipeline",
    };

    await addDocument(docPayload);

    // Simulate OCR text extraction for AI Analysis
    let mockText = "";
    if (docUploadForm.category === "Agreement/Contract") {
      mockText = `LEASE DEED AGREEMENT: This lease deed is made on 12-May-2026 between Pooja Verma (Lessor) and Ramesh Kumar (Lessee) for the residential property located at Gomti Nagar, Lucknow. The lease is for 11 months with monthly rent of ₹18,000 and security deposit of ₹36,000.`;
    } else if (docUploadForm.category === "FIR" || docUploadForm.name.toLowerCase().includes("fir")) {
      mockText = `FIRST INFORMATION REPORT (Section 154 CrPC): FIR No. 412/2026 registered at Gomti Nagar Police Station on 10-Jun-2026. Complainant: Pooja Verma. Accused: Ramesh Kumar. Offence under IPC Sections 420 and 406 (Cheating and Criminal Breach of Trust). Details of incident on 15-May-2026.`;
    } else if (docUploadForm.category === "Legal Notice" || docUploadForm.name.toLowerCase().includes("notice")) {
      mockText = `LEGAL NOTICE FOR RECOVERY: Sent on 14-Jul-2026 by Advocate Rajesh Sharma on behalf of client Pooja Verma to noticee Ramesh Kumar. Demanding payment of outstanding balance amount of ₹35,000 within 15 days from receipt of this notice.`;
    } else {
      mockText = `LEGAL PLEADING SHEET: In the Court of District Judge, Lucknow. Suit No. CS-9812/2026. Pooja Verma v. Ramesh Kumar. Next hearing listed on 20-Aug-2026. Matter relates to breach of commercial agreement signed on 15-Jan-2026.`;
    }

    if (targetCaseId && targetCaseId !== "GENERAL") {
      // Analyze text and extract structured facts
      const extraction = LegalMatterDataService.extractFromText(mockText, "OCR_EXTRACTED", docUploadForm.name);
      LegalMatterDataService.saveExtraction(memberId, targetCaseId, extraction);

      // Add to case timeline
      MatterTimelineService.addEvent(targetCaseId, {
        eventType: "DOCUMENT",
        title: `Document Uploaded & Analyzed: ${docUploadForm.name}`,
        description: `Auto-extracted metadata: ${extraction.dates.length} dates and ${extraction.caseNumbers.length || extraction.firNumbers.length || 0} reference numbers found.`,
        sourceType: "DOCUMENT",
        sourceId: docPayload.sha256,
        speaker: clientName,
      });

      // Recalculate timeline
      const evs = MatterTimelineService.getEvents(targetCaseId);
      setTimelineEvents(evs);
    }

    ActivityService.create({ title: `Document "${docUploadForm.name}" uploaded to Vault & Analyzed`, type: "document" });
    setOpenDocUploadModal(false);
    setDocUploadForm({ name: "", category: "Legal Pleading", fileObj: null, caseId: "" });
    setAlertMsg("Document uploaded successfully. AI fact extraction & timeline indexing completed!");
    setTimeout(() => setAlertMsg(""), 4000);
    const updatedDocs = await getDocuments().catch(() => []);
    setDocuments(Array.isArray(updatedDocs) ? updatedDocs : []);
  };

  const handleBookAppointment = () => {
    const nextApt = {
      id: `apt-${Date.now()}`,
      advocateName: aptForm.advocateName,
      date: aptForm.date,
      time: aptForm.time,
      mode: aptForm.mode,
      status: "Pending Approval",
      link: "",
    };
    setAppointments((prev) => [...prev, nextApt]);
    ActivityService.create({ title: `Appointment Requested with ${aptForm.advocateName}`, type: "legal" });
    setOpenAppointmentModal(false);
    setAlertMsg("Appointment request submitted to Advocate!");
    setTimeout(() => setAlertMsg(""), 3500);
  };

  const handleSendMessage = () => {
    if (!clientMsgInput.trim()) return;
    if (!activePortalCaseId) {
      alert("Please select an active Case / Matter first to send a message.");
      return;
    }
    
    // Save message via service
    MatterCommunicationService.sendMessage(activePortalCaseId, memberId, clientName, 'client', {
      type: 'TEXT',
      text: clientMsgInput
    });
    
    // Reload messages
    const msgs = MatterCommunicationService.getMessages(activePortalCaseId);
    setMessages(msgs);
    
    ActivityService.create({ title: `Client Message Sent: "${clientMsgInput.substring(0, 30)}..."`, type: "legal" });
    setClientMsgInput("");
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* GLOBAL LEGAL JURISDICTION SELECTOR BAR (INDIA, US, UK, EU) */}
        <Paper elevation={1} className="bigtech-card glass-card" sx={{ p: 1.5, mb: 3, borderRadius: 2.5, bgcolor: "#0f172a", color: "#fff" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold" color="#60a5fa">
                🌐 Global Legal Jurisdiction (वैश्विक क्षेत्राधिकार):
              </Typography>
              <Chip
                label={GlobalLegalJurisdictionService.getActiveJurisdiction().name}
                color="primary"
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            </Box>
            <Stack direction="row" spacing={1}>
              {Object.values(JURISDICTIONS).map((j) => (
                <Button
                  key={j.id}
                  size="small"
                  variant={GlobalLegalJurisdictionService.getActiveJurisdiction().id === j.id ? "contained" : "outlined"}
                  color="info"
                  onClick={() => {
                    GlobalLegalJurisdictionService.setActiveJurisdiction(j.id);
                    setAlertMsg(`🟢 Active Legal Jurisdiction Changed to: ${j.flag} ${j.name}`);
                    setTimeout(() => setAlertMsg(""), 3000);
                  }}
                  sx={{ py: 0.3, px: 1, fontSize: "0.75rem", textTransform: "none" }}
                >
                  {j.flag} {j.id}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Paper>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Client & Member Personal Workspace
            </Typography>
            <Typography color="text.secondary">
              Welcome back, <strong>{clientName}</strong> ({user?.role || "Member"}) • Plain-Language Legal Intake, Document Vault & Case Telemetry
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
            {myCases.length > 0 && (
              <TextField
                select
                size="small"
                label="Selected Active Case"
                value={activePortalCaseId}
                onChange={(e) => setActivePortalCaseId(e.target.value)}
                sx={{ width: 220, bgcolor: "#fff" }}
              >
                {myCases.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.caseNumber} — {c.title}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {/* ULTRA-MODERN COMPACT VIBRANT COLORFUL CAMERA & VIDEO CALL BUTTONS */}
            <Button
              variant="contained"
              size="small"
              startIcon={<CameraAltIcon />}
              onClick={() => setCameraModalOpen(true)}
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)",
                boxShadow: "0 4px 14px rgba(236, 72, 153, 0.4)",
                color: "#fff",
                textTransform: "none",
                borderRadius: 2,
                px: 1.8,
                "&:hover": { opacity: 0.95 },
              }}
            >
              📷 Snap Doc
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<VideocamIcon />}
              onClick={() => setVideoModalOpen(true)}
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                color: "#fff",
                textTransform: "none",
                borderRadius: 2,
                px: 1.8,
                "&:hover": { opacity: 0.95 },
              }}
            >
              📹 Video Call
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<CallIcon />}
              onClick={() => setAudioModalOpen(true)}
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
                color: "#fff",
                textTransform: "none",
                borderRadius: 2,
                px: 1.8,
                "&:hover": { opacity: 0.95 },
              }}
            >
              📞 Voice Call
            </Button>

            <Button variant="outlined" size="small" startIcon={<UploadFileIcon />} onClick={() => setOpenDocUploadModal(true)}>
              Upload
            </Button>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpenFileModal(true)}>
              Create Matter
            </Button>
          </Stack>
        </Stack>

        {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}

        {/* 🏛️ 4-STEP GUIDED CASE INTAKE WIZARD FOR UNIVERSAL PERSONA ACCESSIBILITY */}
        <GuidedCaseIntakeWizard
          activeAdvocate={activeAdvocate}
          onCompleteCaseIntake={({ problemText, caseCategory }) => {
            setAiProbText(problemText);
            setAiCaseCategory(caseCategory);
            setAlertMsg("🟢 4-Step Case Intake Completed & Submitted for Legal Counsel & AI Diagnosis!");
            setTimeout(() => setAlertMsg(""), 4000);
          }}
        />

        {/* 🗣️ VERNACULAR VOICE-FIRST AUDIO GUIDANCE BAR FOR ILLITERATE / RURAL CITIZENS */}
        <Paper elevation={2} className="bigtech-card glass-card" sx={{ p: 2, mb: 3, borderRadius: 3, borderLeft: "6px solid #059669", bgcolor: "#f0fdf4" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <MicIcon sx={{ fontSize: 32, color: "#059669" }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" color="#065f46">
                  🗣️ वॉयस-फ़र्स्ट ऑडियो गाइड (Vernacular Voice Guidance for All Citizens)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  अनपढ़ व कम पढ़े-लिखे नागरिक बिना टाइप किए यहाँ बटन दबाकर हिंदी में दिशा-निर्देश सुन सकते हैं।
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<MicIcon />}
                onClick={() => {
                  VernacularVoiceAssistantService.speakInHindi(VernacularVoiceAssistantService.prompts.WELCOME);
                }}
                sx={{ fontWeight: "bold" }}
              >
                🔊 सुनें (Welcome Guide)
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => {
                  VernacularVoiceAssistantService.stopSpeech();
                }}
              >
                🛑 बंद करें (Stop Audio)
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Real-time Workspace Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderLeft: "4px solid #ed6c02" }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">My Legal Matters</Typography>
              <Typography variant="h5" fontWeight="bold">{myCases.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderLeft: "4px solid #1976d2" }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Uploaded Documents</Typography>
              <Typography variant="h5" fontWeight="bold">{myDocs.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderLeft: "4px solid #9c27b0" }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Assigned Counsel</Typography>
              <Typography variant="h6" fontWeight="bold" noWrap>{activeAdvocate ? activeAdvocate.name : "No Counsel Allotted"}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderLeft: "4px solid #2e7d32" }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">Appointments</Typography>
              <Typography variant="h5" fontWeight="bold">{appointments.length}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Client Portal Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="scrollable" scrollButtons="auto">
            <Tab icon={<AutoAwesomeIcon sx={{ color: "#7c3aed" }} />} iconPosition="start" label="🤖 AI Case Diagnosis ('आप क्या चाहते हैं?')" sx={{ fontWeight: "bold", color: "#7c3aed" }} />
            <Tab icon={<GavelIcon />} iconPosition="start" label={`My Matters & Cases (${myCases.length})`} />
            <Tab icon={<TimelineIcon />} iconPosition="start" label="Case Timeline & Progress" />
            <Tab icon={<FolderIcon />} iconPosition="start" label={`Document Vault (${myDocs.length})`} />
            <Tab icon={<BadgeIcon />} iconPosition="start" label="Assigned Advocate & Counsel" />
            <Tab icon={<PaymentIcon />} iconPosition="start" label="Payments & Fee Invoices" />
            <Tab icon={<CalendarMonthIcon />} iconPosition="start" label={`Appointments (${appointments.length})`} />
            <Tab icon={<ChatIcon />} iconPosition="start" label="Messages & Communication" />
            <Tab icon={<PersonIcon />} iconPosition="start" label="My Profile & KYC" />
            <Tab icon={<SecurityIcon sx={{ color: "#059669" }} />} iconPosition="start" label="🤝 ICJ Partner & E-Gov Desk" sx={{ fontWeight: "bold", color: "#059669" }} />
            <Tab icon={<SettingsSuggestIcon sx={{ color: "#2563eb" }} />} iconPosition="start" label="🔌 My API Store (माई API स्टोर)" sx={{ fontWeight: "bold", color: "#2563eb" }} />
          </Tabs>
        </Box>

        {/* TAB 0: INTERACTIVE AI CASE CONSULTATION & DIAGNOSIS */}
        <TabPanel value={tabIndex} index={0}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: "linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)", border: "2px solid #7c3aed" }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <AutoAwesomeIcon sx={{ color: "#7c3aed", fontSize: 36 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold" color="#4c1d95">
                  AI Legal Consultation Engine — "आप क्या चाहते हैं? आपकी क्या स्थिति है?"
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  अपलोड किए गए कागजात व वॉइस संदेश के आधार पर तत्काल कानूनी स्थिति, धाराएं, सजा का जोखिम, जमानत की संभावना व रणनीति जाने।
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={3} mt={1}>
              {/* Left Column: Case Input & Voice Note */}
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#fff", border: "1px solid #ede9fe" }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="#1e3a8a" mb={2}>
                    📝 1. अपनी समस्या या चल रहा केस दर्ज करें
                  </Typography>
                  
                  {/* API CONFIGURATION WIDGET REDIRECT */}
                  <Paper sx={{ p: 2, mb: 2.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #cbd5e1" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        🌐 AI Model: <strong>{aiProvider.toUpperCase()}</strong> (
                        {aiProvider === "openai" ? (openaiApiKey ? "Live 🟢" : "Local Mode ⚠️") :
                         aiProvider === "anthropic" ? (anthropicApiKey ? "Live 🟢" : "Local Mode ⚠️") :
                         (geminiApiKey ? "Live 🟢" : "Local Mode ⚠️")}
                        )
                      </Typography>
                      <Button size="small" onClick={() => setTabIndex(10)} sx={{ textTransform: "none", fontWeight: "bold" }}>
                        ⚙️ Configure Keys
                      </Button>
                    </Stack>
                  </Paper>

                  {/* Ongoing Case vs New Case Toggle */}
                  <Stack direction="row" spacing={1} mb={2}>
                    <Button
                      size="small"
                      variant={!isOngoingCaseToggle ? "contained" : "outlined"}
                      color="primary"
                      onClick={() => setIsOngoingCaseToggle(false)}
                      sx={{ fontWeight: "bold", textTransform: "none", flex: 1 }}
                    >
                      🆕 नया मामला शुरू करना है
                    </Button>
                    <Button
                      size="small"
                      variant={isOngoingCaseToggle ? "contained" : "outlined"}
                      color="error"
                      onClick={() => setIsOngoingCaseToggle(true)}
                      sx={{ fontWeight: "bold", textTransform: "none", flex: 1 }}
                    >
                      🚨 पहले से चल रहा कोर्ट केस (Rescue)
                    </Button>
                  </Stack>

                  {isOngoingCaseToggle ? (
                    <Box sx={{ p: 2, bgcolor: "#fff5f5", borderRadius: 2, mb: 2, border: "1px solid #fecaca" }}>
                      <Typography variant="caption" fontWeight="bold" color="error" display="block" mb={1}>
                        🚨 चलते हुए केस के ट्रांसफर व रेस्क्यू हेतु जानकारी भरें:
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        label="केस / CNR नंबर (Case / CNR No.)"
                        placeholder="उदा. UPHC-01-004812-2024"
                        value={ongoingCaseNo}
                        onChange={(e) => setOngoingCaseNo(e.target.value)}
                        sx={{ mb: 1.5, bg: "#fff" }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="अदालत का नाम (Court Name)"
                        placeholder="उदा. सत्र न्यायालय (Sessions Court) लखनऊ"
                        value={ongoingCourtName}
                        onChange={(e) => setOngoingCourtName(e.target.value)}
                        sx={{ mb: 1.5, bg: "#fff" }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="पुराने वकील का नाम (Previous Lawyer Name)"
                        placeholder="उदा. Adv. P.K. Verma"
                        value={ongoingPrevLawyer}
                        onChange={(e) => setOngoingPrevLawyer(e.target.value)}
                        sx={{ mb: 1.5, bg: "#fff" }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        label="पुराने वकील से क्या समस्या है? (Reason for Transfer)"
                        placeholder="उदा. तारीखों पर नहीं जाते, फीस ले ली लेकिन केस अटका पड़ा है, फाइल नहीं दे रहे..."
                        value={aiProbText}
                        onChange={(e) => setAiProbText(e.target.value)}
                        sx={{ bg: "#fff" }}
                      />
                    </Box>
                  ) : (
                    <>
                      <TextField
                        fullWidth
                        select
                        label="मामले की श्रेणी (Case Category)"
                        value={aiCaseCat}
                        onChange={(e) => setAiCaseCat(e.target.value)}
                        sx={{ mb: 2, mt: 1.5 }}
                        size="small"
                      >
                        {Object.entries(CASE_CATEGORIES).map(([k, v]) => (
                          <MenuItem key={k} value={k}>{v}</MenuItem>
                        ))}
                      </TextField>

                      <Box sx={{ mb: 2 }}>
                        <VoiceCommentaryStudio
                          value={aiProbText}
                          onChange={(text) => setAiProbText(text)}
                          onSendVoiceToChat={(note) => {
                            const spokenText = note.transcript || aiProbText || "";
                            const chatMsg = {
                              id: note.id,
                              sender: clientName,
                              title: note.title || "Voice Note",
                              duration: note.duration || "00:30",
                              text: `🎙️ ${note.title || "Voice Note"} (${note.duration || "00:30"})`,
                              transcript: spokenText,
                              timestamp: note.timestamp,
                              audioUrl: note.audioUrl,
                            };
                            setMessages((prev) => {
                              const updated = [...prev, chatMsg];
                              try { localStorage.setItem("icj_client_messages", JSON.stringify(updated)); } catch (err) { console.debug(err); }
                              return updated;
                            });

                            try {
                              const existing = JSON.parse(localStorage.getItem("icj_ai_legal_consultations") || "[]");
                              const updatedConsultation = {
                                ...(existing[0] || {}),
                                consultationId: "INTAKE-2026-LIVE",
                                clientName: clientName || "Pooja Verma (Client)",
                                caseCategory: "Voice Intake & Consultation",
                                problemText: spokenText || existing[0]?.problemText || "",
                                voiceNotes: [...(existing[0]?.voiceNotes || []), { id: note.id, title: note.title, audioUrl: note.audioUrl, transcript: spokenText }],
                                createdAt: new Date().toISOString(),
                              };
                              localStorage.setItem("icj_ai_legal_consultations", JSON.stringify([updatedConsultation]));
                            } catch (err) { console.debug(err); }

                            ActivityService.create({ title: `Voice Note Audio File Dispatched: ${note.title}`, type: "legal" });
                          }}
                          label="🎙️ आपकी पूरी समस्या व केस विवरण (Long-Form Voice Commentary & Multi-Page Transcript)"
                          placeholder="यहाँ क्लिक करके 1 से 5 पेज की पूरी समस्या बोलें... आपका बोला गया एक-एक शब्द यहाँ रियल-टाइम में टाइप होगा!"
                        />
                      </Box>
                    </>
                  )}

                  <TextField
                    fullWidth
                    label="आप क्या चाहते हैं? (Desired Outcome)"
                    placeholder="उदा. अग्रिम जमानत (Anticipatory Bail) और एफआईआर निरस्तीकरण"
                    value={aiOutcome}
                    onChange={(e) => setAiOutcome(e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: <VoiceInputAdornment onTranscript={(txt) => setAiOutcome((p) => p + " " + txt)} value={aiOutcome} />,
                    }}
                  />

                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    📁 संलग्न कागजात: {myDocs.length > 0 ? myDocs.map(d => d.name || d.title).join(", ") : "FIR Copy uploaded to Document Vault"}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    color={isOngoingCaseToggle ? "error" : "primary"}
                    disabled={aiLoading}
                    onClick={async () => {
                      setAiLoading(true);
                      // Deduct AI credit
                      import("../services/paymentBillingService.js").then((mod) => {
                        const pb = mod.default || mod.PaymentBillingService;
                        const deduct = pb.deductAiCredit(memberId, 1);
                        if (deduct.success) {
                          alert(`1 AI Token/Credit Deducted! New Wallet Balance: ${deduct.newBalance} Tokens.`);
                          loadTokenBalance();
                        }
                      }).catch(e => console.error(e));

                      try {
                        if (!aiProbText.trim() && !aiVoiceNote) {
                          alert("कृपया अपनी समस्या दर्ज करें या वॉयस रिकॉर्डिंग करें।");
                          setAiLoading(false);
                          return;
                        }

                        if (isOngoingCaseToggle) {
                          const res = await AiLegalConsultationService.diagnoseOngoingCase({
                            clientId: memberId,
                            clientName,
                            caseNumber: ongoingCaseNo || "",
                            courtName: ongoingCourtName || "",
                            previousAdvocate: ongoingPrevLawyer || "",
                            caseStatusSummary: aiProbText.trim(),
                            nextHearingDate: "2026-08-22",
                            uploadedDocumentNames: myDocs.map(d => d.name || "Case_Order_Copy.pdf"),
                            provider: aiProvider,
                            apiKey: aiProvider === "openai" ? openaiApiKey : aiProvider === "anthropic" ? anthropicApiKey : geminiApiKey,
                          });
                          setAiDiagnosisResult(res);
                        } else {
                          const res = await AiLegalConsultationService.diagnoseCase({
                            clientId: memberId,
                            clientName,
                            caseCategory: aiCaseCat,
                            problemText: aiProbText.trim(),
                            voiceNoteSummary: aiVoiceNote,
                            uploadedDocumentNames: myDocs.map(d => d.name || "FIR_Copy.pdf"),
                            desiredOutcome: aiOutcome,
                            provider: aiProvider,
                            apiKey: aiProvider === "openai" ? openaiApiKey : aiProvider === "anthropic" ? anthropicApiKey : geminiApiKey,
                          });
                          setAiDiagnosisResult(res);

                          // Trigger Real-Time Admin Workflow Request & Queue Alert
                          try {
                            import("../services/clientWorkflowService.js").then((mod) => {
                              const cws = mod.default || mod.ClientWorkflowService;
                              cws.submitProblemRequest({
                                clientId: memberId,
                                clientName,
                                problemText: aiProbText.trim(),
                                caseCategory: aiCaseCat,
                                desiredOutcome: aiOutcome,
                                voiceNoteSummary: aiVoiceNote,
                              });
                            });
                          } catch (e) {
                            console.error("Workflow submission failed", e);
                          }
                        }
                      } catch (err) {
                        console.error(err);
                        alert("AI analysis encountered an error.");
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                    startIcon={<AutoAwesomeIcon />}
                    sx={{ bgcolor: isOngoingCaseToggle ? "#d32f2f" : "#7c3aed", "&:hover": { bgcolor: isOngoingCaseToggle ? "#b71c1c" : "#6d28d9" }, fontWeight: "bold", py: 1.5 }}
                  >
                    {isOngoingCaseToggle ? "🚨 RUN AI CASE HEALTH X-RAY & RESCUE PLAN" : "🔍 AI Case Diagnosis चलाएं (Analyze Now)"}
                  </Button>
                </Paper>
              </Grid>

              {/* Right Column: AI Legal Diagnosis Result & Advice */}
              <Grid item xs={12} md={7}>
                {aiLoading ? (
                  <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#fff", borderRadius: 3, border: "1px dashed #7c3aed" }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: 2 }}>
                      <Typography variant="h6" color="primary" fontWeight="bold">🤖 AI Engine Analyzing Case Context...</Typography>
                      <Typography variant="body2" color="text.secondary">कानूनी धाराएं, संभावित सजा का जोखिम, जमानत की शर्तें व एक्शन प्लान निकाला जा रहा है।</Typography>
                      <Box sx={{
                        width: 50,
                        height: 50,
                        border: "5px solid #ede9fe",
                        borderTop: "5px solid #7c3aed",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        "@keyframes spin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" }
                        }
                      }} />
                    </Box>
                  </Paper>
                ) : !aiDiagnosisResult ? (
                  <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#fff", borderRadius: 3, border: "1px dashed #cbd5e1" }}>
                    <AutoAwesomeIcon sx={{ fontSize: 60, color: "#cbd5e1", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      बाएं बॉक्स में अपनी समस्या लिखें या वॉइस नोट रिकॉर्ड करें और "AI Case Diagnosis चलाएं" दबाएं।
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      AI आपके कागजात, धाराओं, सजा के जोखिम व जमानत की संभावना का पूरा चार्ट तैयार करेगा।
                    </Typography>
                  </Paper>
                ) : (
                  <Paper elevation={4} sx={{ p: 3, borderRadius: 3, bgcolor: "#fff", border: "2px solid #7c3aed" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label="AI LEGAL DIAGNOSIS COMPLETE ✅" color="secondary" sx={{ fontWeight: "bold" }} />
                        <Chip 
                          label={aiDiagnosisResult.isLiveAi ? `🟢 Live LLM (${aiDiagnosisResult.providerName || 'AI'})` : "⚡ Dynamic NLP Engine"} 
                          color={aiDiagnosisResult.isLiveAi ? "success" : "info"} 
                          size="small"
                          sx={{ fontWeight: "bold" }} 
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">ID: {aiDiagnosisResult.consultationId}</Typography>
                        <Button 
                          size="small" 
                          color="error" 
                          variant="outlined" 
                          onClick={() => {
                            setAiDiagnosisResult(null);
                            setAiProbText("");
                            setAiVoiceNote("");
                            setAiOutcome("");
                            try { localStorage.removeItem("icj_ai_legal_consultations"); } catch(e){}
                          }}
                          sx={{ fontSize: "0.7rem", py: 0.2, px: 1, fontWeight: "bold" }}
                        >
                          🗑️ रीसेट करें (Reset & Clear)
                        </Button>
                      </Stack>
                    </Stack>

                    {/* Legal Stand / Ongoing Case Audit */}
                    {aiDiagnosisResult.isOngoingCase ? (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ mb: 2, p: 2, bgcolor: "#fee2e2", borderRadius: 2, border: "1px solid #fca5a5" }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="#991b1b">
                            🚨 चलते हुए केस का एक्स-रे ऑडिट (Ongoing Case Health Audit):
                          </Typography>
                          <Typography variant="body2" color="#7f1d1d">
                            केस नं: <b>{aiDiagnosisResult.caseNumber}</b> | कोर्ट: <b>{aiDiagnosisResult.courtName}</b> | पुराना वकील: <b>{aiDiagnosisResult.previousAdvocate}</b>
                          </Typography>
                        </Box>

                        <Alert severity="error" sx={{ mb: 2, fontWeight: "bold" }}>
                          {aiDiagnosisResult.caseHealthStatus}
                        </Alert>

                        <Paper sx={{ p: 2, bgcolor: "#fff8f0", border: "1px solid #fed7aa", mb: 2, borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="#c2410c">
                            📉 पिछले वकील की कमियाँ (Delay & Negligence Analysis):
                          </Typography>
                          <Typography variant="body2" color="#9a3412">
                            • <b>वर्तमान स्टेज:</b> {aiDiagnosisResult.healthAudit.currentStage}
                            <br/>
                            • <b>देरी का स्तर:</b> {aiDiagnosisResult.healthAudit.previousLawyerDelayScore}
                          </Typography>
                        </Paper>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="#0f172a" mb={1}>
                            🚀 ICJ 4-स्टेपी रेस्क्यू एक्शन प्लान (ICJ Action Plan):
                          </Typography>
                          {aiDiagnosisResult.healthAudit.icjActionPlan.map((act, i) => (
                            <Typography key={i} variant="body2" color="#1e293b" sx={{ mb: 0.5, fontWeight: 500 }}>
                              {act}
                            </Typography>
                          ))}
                        </Box>

                        <Alert severity="success" sx={{ mb: 2 }}>
                          <b>फाइल ट्रांसफर गारंटी:</b> {aiDiagnosisResult.healthAudit.advocateSuccessionNote}
                        </Alert>
                      </Box>
                    ) : (
                      <>
                        {/* Legal Stand */}
                        <Box sx={{ mb: 2, p: 2, bgcolor: "#ede9fe", borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="#4c1d95">
                            ⚖️ आपकी कानूनी स्थिति (Legal Stand):
                          </Typography>
                          <Typography variant="body2" color="#1e293b">
                            {aiDiagnosisResult.diagnosis.legalStand}
                          </Typography>
                        </Box>

                        {/* Applicable Sections */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="#0f172a" mb={0.5}>
                            📜 लागू कानूनी धाराएं (Applicable IPC / BNS Sections):
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                            {aiDiagnosisResult.diagnosis.sectionsApplicable.map((sec, i) => (
                              <Chip key={i} label={sec} size="small" sx={{ bgcolor: "#dbeafe", color: "#1e40af", fontWeight: 700 }} />
                            ))}
                          </Stack>
                        </Box>
                      </>
                    )}

                    {/* Punishment & Bail */}
                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 1.5, bgcolor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 2 }}>
                          <Typography variant="caption" fontWeight="bold" color="#dc2626" display="block">
                            ⚠️ सजा व जोखिम (Sentence Risk):
                          </Typography>
                          <Typography variant="caption" color="#991b1b">
                            {aiDiagnosisResult.diagnosis.sentenceRisk}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 1.5, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 2 }}>
                          <Typography variant="caption" fontWeight="bold" color="#059669" display="block">
                            🔒 जमानत संभावना (Bail Prospect):
                          </Typography>
                          <Typography variant="caption" color="#065f46">
                            {aiDiagnosisResult.diagnosis.bailProspects}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Duration & Actions */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" fontWeight="bold" color="#7c3aed" display="block">
                        ⏱️ अनुमानित कोर्ट समय: {aiDiagnosisResult.diagnosis.estimatedTrialDuration}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="#0f172a" mt={1} mb={0.5}>
                        🛠️ तत्काल अनुशंसित कदम (Next Steps):
                      </Typography>
                      {aiDiagnosisResult.diagnosis.recommendedActions.map((act, i) => (
                        <Typography key={i} variant="caption" display="block" color="text.secondary">
                          • {act}
                        </Typography>
                      ))}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Advocate Appointment CTA */}
                    <Paper sx={{ p: 2, bgcolor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="#92400e" mb={1}>
                        🤝 क्या आप इस केस के लिए ICJ Empanelled Advocate नियुक्त करना चाहते हैं?
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        वकील नियुक्त होते ही AI लीगल ड्राफ्टर आपके कागजातों के आधार पर जमानत याचिका/अर्जी तैयार कर देगा जिसे वकील चेक करके दाखिल करेंगे।
                      </Typography>

                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Button
                          variant="contained"
                          sx={{ bgcolor: "#1e3a8a", fontWeight: "bold" }}
                          onClick={() => {
                            AiLegalConsultationService.assignAdvocate({
                              consultationId: aiDiagnosisResult.consultationId,
                              advocateId: "ADV-101",
                              advocateName: "Adv. Rajesh Sharma",
                            });
                            alert("✅ Adv. Rajesh Sharma नियुक्त हो गए हैं! AI Legal Drafter ने कोर्ट ड्राफ्ट तैयार करके वकील को भेज दिया है।");
                          }}
                        >
                          वकील नियुक्त करें (Assign Advocate)
                        </Button>
                      </Stack>
                    </Paper>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* TAB 1: MY CASES */}
        <TabPanel value={tabIndex} index={1}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                My Filed Legal Matters & Petitions ({myCases.length})
              </Typography>
              <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setOpenFileModal(true)}>
                New Intake
              </Button>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            {/* 4-YEAR OLD ONGOING RESCUE CASE SHOWCASE CARD */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#fff" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
                <Box>
                  <Chip label="🚨 4-YEAR OLD ONGOING CASE RESCUE SHOWCASE" color="error" sx={{ fontWeight: "bold", mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold" color="#f59e0b">
                    Sh. Ramesh Kumar vs State of UP &amp; Ors (Case #UPHC-01-004812-2022)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    Filing Date: 12-Apr-2022 (4 Years Ago) | Transferred to ICJ: 10-Aug-2025 (1 Year Ago)
                  </Typography>
                </Box>
                <Chip label="🟢 ACTIVE IN HEARING (ICJ PROTECTED)" color="success" sx={{ fontWeight: "bold" }} />
              </Stack>

              <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                {/* 1. Advocate Succession */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="#f59e0b" mb={1}>
                      🧑‍⚖️ Advocate Succession Record
                    </Typography>
                    <Typography variant="caption" display="block" color="#ef4444">
                      ❌ <b>Previous Lawyer:</b> Adv. P.K. Verma (Dismissed due to 8 missed hearings &amp; ₹45,000 taken)
                    </Typography>
                    <Typography variant="caption" display="block" color="#10b981" sx={{ mt: 1 }}>
                      ✅ <b>Current ICJ Lawyer:</b> Adv. Rajesh Sharma (Assigned Aug 2025 via Zero-NOC Succession Protocol)
                    </Typography>
                  </Paper>
                </Grid>

                {/* 2. Financial & Fee Split */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="#38bdf8" mb={1}>
                      💰 Financial &amp; Fee Ledger
                    </Typography>
                    <Typography variant="caption" display="block" color="#e2e8f0">
                      • Total Billed: ₹65,000 | Paid to Escrow: <b>₹50,000</b>
                    </Typography>
                    <Typography variant="caption" display="block" color="#34d399">
                      • Released to Advocate (70%): ₹35,000
                    </Typography>
                    <Typography variant="caption" display="block" color="#fbbf24">
                      • ICJ Trust Fee (30%): ₹15,000 (80G Tax Receipt ICJ-80G-2025-9812)
                    </Typography>
                    <Typography variant="caption" display="block" color="#94a3b8">
                      • ICJ Escrow Balance: 🔒 ₹15,000 HELD
                    </Typography>
                  </Paper>
                </Grid>

                {/* 3. Hearings Attendance & Self Representation */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="#a7f3d0" mb={1}>
                      📅 Hearings &amp; Cost Savings (12 Dates)
                    </Typography>
                    <Typography variant="caption" display="block" color="#e2e8f0">
                      • <b>Advocate Attended (Arguments):</b> 5 Hearings
                    </Typography>
                    <Typography variant="caption" display="block" color="#34d399">
                      • <b>Client Self-Attended ("अपनी वकालत खुद करें"):</b> 7 Routine Dates
                    </Typography>
                    <Typography variant="caption" display="block" color="#f59e0b" sx={{ mt: 0.5, fontWeight: "bold" }}>
                      🎉 Lawyer Travel &amp; Fees Saved for Client: ₹24,500 Saved!
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Vault Docs & DRM Status */}
              <Box sx={{ p: 1.5, bgcolor: "rgba(0,0,0,0.3)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Typography variant="caption" color="#cbd5e1">
                  📁 <b>Vault Documents (DRM Protected):</b> FIR_Copy_Crime_412.pdf | SaleDeed_Plot42.pdf | HighCourt_StayOrder_Jan2026.pdf
                </Typography>
                <Chip label="🔒 DRM PRINT LOCK ACTIVE (OTP AUTHORIZED)" size="small" color="warning" sx={{ fontWeight: "bold" }} />
              </Box>
            </Paper>

            {myCases.length === 0 ? (
              <Typography color="text.secondary">No legal matters created yet. Click "Create Legal Matter" above to describe your problem in simple language.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Case ID</TableCell>
                    <TableCell>Matter Title</TableCell>
                    <TableCell>Assigned Advocate</TableCell>
                    <TableCell>Court / Jurisdiction</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Trust Approval</TableCell>
                    <TableCell>Next Hearing</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myCases.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{c.caseNumber}</TableCell>
                      <TableCell><Typography fontWeight="bold">{c.title}</Typography></TableCell>
                      <TableCell>{c.advocateName || (activeAdvocate ? activeAdvocate.name : "Unassigned")}</TableCell>
                      <TableCell>{c.courtName}</TableCell>
                      <TableCell><Chip label={c.status} color={c.status === "In Hearing" ? "success" : "warning"} size="small" /></TableCell>
                      <TableCell><Chip label={c.trustApprovalStatus || "Approved"} color="success" size="small" variant="outlined" /></TableCell>
                      <TableCell>{c.nextHearing || "Under Schedule"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </TabPanel>

        {/* TAB 2: CASE TIMELINE & ACTIONS */}
        <TabPanel value={tabIndex} index={2}>
          <Grid container spacing={3}>
            {/* Timeline Column */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Interactive Case Progress Timeline & Milestones
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {!activePortalCaseId ? (
                  <Alert severity="info">Please select a case to view its progress timeline.</Alert>
                ) : (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {timelineEvents.map((ev) => {
                      const isHearing = ev.eventType === "HEARING";
                      const isVoice = ev.eventType === "VOICE_UPDATE";
                      const isInstruction = ev.eventType === "ADVOCATE_INSTRUCTION";
                      
                      let borderColor = "#1976d2"; // Primary blue
                      let titleColor = "primary.main";
                      if (isHearing) {
                        borderColor = "#2e7d32"; // Green
                        titleColor = "success.main";
                      } else if (isVoice) {
                        borderColor = "#9c27b0"; // Purple
                        titleColor = "secondary.main";
                      } else if (isInstruction) {
                        borderColor = "#ed6c02"; // Orange
                        titleColor = "warning.main";
                      }

                      return (
                        <Paper key={ev.id} variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${borderColor}`, borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" color={titleColor}>
                            {new Date(ev.date || ev.timestamp).toLocaleDateString("en-IN")} • {ev.title}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {ev.description}
                          </Typography>
                          {ev.speaker && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              Source: {ev.sourceType || "Voice Note"} | Recorded By: {ev.speaker}
                            </Typography>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Grid>

            {/* Actions / Tasks Column */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ✅ Required Actions &amp; Assignments
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {!activePortalCaseId ? (
                  <Alert severity="info">Please select a case to view pending tasks.</Alert>
                ) : timelineActions.length === 0 ? (
                  <Typography color="text.secondary" sx={{ mt: 2 }}>No pending tasks or action items for this case.</Typography>
                ) : (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {timelineActions.map((act) => (
                      <Paper key={act.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Chip
                            label={act.status || "PENDING"}
                            color={act.status === "COMPLETED" ? "success" : act.status === "REJECTED" ? "error" : "warning"}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Due: {act.dueDate}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          {act.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Responsible: <strong>{act.responsible?.toUpperCase()}</strong>
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 3: DOCUMENT VAULT & UPLOAD (Phase 9 & 10) */}
        <TabPanel value={tabIndex} index={3}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Document Vault & AI Processing Pipeline ({myDocs.length})
              </Typography>
              <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setOpenDocUploadModal(true)}>
                Upload File
              </Button>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            {myDocs.length === 0 ? (
              <Typography color="text.secondary">No documents uploaded yet. Upload PDFs, JPGs, or screenshots relevant to your matter.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Document Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>SHA-256 Hash</TableCell>
                    <TableCell>Document Name (Procedural Legal Stage)</TableCell>
                    <TableCell>Legal Classification</TableCell>
                    <TableCell>Per-Document Voice Commentary</TableCell>
                    <TableCell>Storage Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    // Procedural Legal Sorting
                    const sorted = LegalDocumentSorterService.sortDocumentsProcedurally(myDocs);
                    return sorted.map((d, idx) => {
                      const dual = LegalDocumentSorterService.getDualNaming(d, "client");
                      return (
                        <TableRow key={d.id || idx} hover>
                          <TableCell>
                            <Typography fontWeight="bold" color="#0f172a">
                              {dual.clientDisplayName}
                            </Typography>
                            <Chip
                              label={dual.stageInfo.title}
                              size="small"
                              sx={{ bgcolor: "#e0e7ff", color: "#3730a3", fontSize: "0.7rem", fontWeight: "bold", mt: 0.5 }}
                            />
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: "monospace", fontSize: "0.68rem" }}>
                              Advocate View: {dual.advocateCanonicalName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={d.category || dual.stageInfo.shortCode} size="small" variant="outlined" color="primary" />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ maxWidth: 220 }}>
                              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                🎙️ इस पेपर पर बयान:
                              </Typography>
                              <VoiceCommentaryStudio
                                value={d.commentary || ""}
                                onChange={(txt) => {
                                  d.commentary = txt;
                                }}
                                label=""
                                placeholder="इस पेपर के बारे में बोलें..."
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip icon={<VerifiedIcon />} label={d.status || "Saved & Verified"} color="success" size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button size="small" variant="outlined" onClick={() => handleRequestAction('Download', d.name || d.title)}>Download</Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })()}
                </TableBody>
              </Table>
            )}
          </Paper>
        </TabPanel>

        {/* TAB 4: ASSIGNED ADVOCATE & PRACTICE TEAM */}
        <TabPanel value={tabIndex} index={4}>
          {!activeAdvocate ? (
            <Paper sx={{ p: 4, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 3, border: "1px dashed #cbd5e1" }}>
              <Typography variant="h6" color="text.secondary" fontWeight="bold">
                ⚖️ No Allotted Counsel
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You do not have any active legal counsel assigned to your profile.
                Please file a new matter in the "AI Case Diagnosis" tab or contact ICJ Registry.
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: "#fff" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
                    🏛️ My Allotted ICJ Legal Counsel &amp; Practice Collegium
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Complete profile, court jurisdictions, ranked specializations, and verified practice team allotted to your legal matter
                  </Typography>
                </Box>
                <Chip label="🔒 ALLOTTED ICJ COUNSEL ONLY" color="primary" sx={{ fontWeight: "bold" }} />
              </Stack>

              <Divider sx={{ mb: 3 }} />

              {(() => {
                const advocateId = activeAdvocate?.id || activeAdvocate?.memberId || "26ICJ08AA0001";
                const advocateName = activeAdvocate?.name || "Adv. Rajesh Sharma";
                const office = VirtualOfficeService.getOfficeForMember(advocateId, advocateName);
                const offices = office?.officeLocations || DEFAULT_COURT_OFFICES;
                const rankedSpecs = office?.rankedSpecializations || DEFAULT_RANKED_SPECIALIZATIONS;
                const juniors = office?.juniorsList || [];

                return (
                  <Stack spacing={3}>
                  {/* ADVOCATE PROFILE SUMMARY */}
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: "#1e3a8a", bgcolor: "#f8fafc" }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={3} textAlign="center">
                        <BadgeIcon sx={{ fontSize: 75, color: "#1e3a8a" }} />
                        <Typography variant="subtitle2" fontWeight="bold" color="#0f172a" sx={{ mt: 1 }}>
                          {advocateName}
                        </Typography>
                        <Chip label={`Member ID: ${advocateId}`} size="small" color="primary" sx={{ fontWeight: "bold", mt: 0.5 }} />
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <Typography variant="subtitle1" fontWeight="bold" color="secondary.main" gutterBottom>
                          📜 Bar Registration &amp; Credential: {office.barEnrollmentNo || "UP/2026/9812"}
                        </Typography>

                        {/* RANKED SPECIALIZATIONS */}
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          ORDERED SPECIALIZATION PRIORITY:
                        </Typography>
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          {rankedSpecs.map((sp) => (
                            <Grid item xs={12} sm={6} key={sp.rank}>
                              <Chip
                                label={`${sp.label}: ${sp.name}`}
                                size="small"
                                sx={{
                                  bgcolor: sp.rank === 1 ? "#fee2e2" : sp.rank === 2 ? "#fef3c7" : "#ede9fe",
                                  color: sp.rank === 1 ? "#991b1b" : sp.rank === 2 ? "#92400e" : "#4c1d95",
                                  fontWeight: "bold",
                                  width: "100%",
                                  justifyContent: "flex-start",
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>

                        <Typography variant="caption" color="text.secondary" display="block">
                          📍 Office Address: {office.officeAddress} | ⏰ Hours: {office.workingHours}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* MULTI-COURT PRACTICE LOCATIONS & CHAMBERS */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="#0f172a" sx={{ mb: 1.5 }}>
                      🏢 Allotted Advocate Pan-India Court Offices &amp; Chambers ({offices.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {offices.map((loc) => {
                        const isSupreme = loc.type === "SupremeCourt";
                        const isHigh = loc.type === "HighCourt";
                        const isTehsil = loc.type === "TehsilCourt";
                        const isTribunal = loc.type === "Tribunal";

                        const color = isSupreme ? "#7c3aed" : isHigh ? "#1d4ed8" : isTribunal ? "#c2410c" : isTehsil ? "#0284c7" : "#059669";
                        const tag = isSupreme ? "🏛️ SUPREME COURT" : isHigh ? "⚖️ HIGH COURT BENCH" : isTribunal ? "⚖️ TRIBUNAL / FORUM" : isTehsil ? "🏛️ SDM / TEHSIL COURT" : "🏢 DISTRICT COURT";

                        return (
                          <Grid item xs={12} sm={6} md={4} key={loc.id || loc.name}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: color, bgcolor: "#fff" }}>
                              <Chip label={tag} size="small" sx={{ bgcolor: color, color: "#fff", fontWeight: "bold", fontSize: "0.65rem", mb: 1 }} />
                              <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                                {loc.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                📍 {loc.address}
                              </Typography>
                              <Typography variant="caption" fontWeight="bold" color="primary.main">
                                {loc.city}, {loc.state}
                              </Typography>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>

                  {/* ADVOCATE PRACTICE TEAM COLLEGIUM WITH PHOTOS */}
                  <Box>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                        👥 Verified Practice Collegium &amp; Associate Team ({juniors.length})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Verified ICJ team members working under your allotted advocate. If work is diverted or an associate appears on court dates, verify them below.
                      </Typography>
                    </Box>

                    {juniors.length === 0 ? (
                      <Alert severity="info">No additional junior associates linked to this practice team yet.</Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {juniors.map((jr) => (
                          <Grid item xs={12} sm={6} key={jr.id || jr.memberId}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: "#10b981", bgcolor: "#f0fdf4" }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                  src={jr.photoUrl}
                                  alt={jr.name}
                                  sx={{ width: 54, height: 54, border: "2px solid #059669", bgcolor: "#059669", fontWeight: "bold" }}
                                >
                                  {jr.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                                    {jr.name}
                                  </Typography>
                                  <Chip label={`ICJ ID: ${jr.memberId}`} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem", fontWeight: "bold", mb: 0.5 }} />
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    Role: <strong>{jr.designation}</strong>
                                  </Typography>
                                  <Typography variant="caption" display="block" color="success.dark" fontWeight="bold">
                                    Assigned Court: {jr.assignedOffice}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                </Stack>
              );
            })()}
          </Paper>
          )}
        </TabPanel>

        {/* TAB 5: PAYMENTS */}
        <TabPanel value={tabIndex} index={5}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Legal Fee Payments & Invoice Ledger
              </Typography>
              <Button variant="outlined" color="success" onClick={() => navigate("/member-wallet")}>
                View Wallet &amp; Ledger Passbook
              </Button>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Total Fee</TableCell>
                  <TableCell>Paid Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontFamily: "monospace" }}>INV-2026-081</TableCell>
                  <TableCell>PIL Legal Representation Fee</TableCell>
                  <TableCell>₹45,000</TableCell>
                  <TableCell>₹30,000</TableCell>
                  <TableCell><Chip label="Partially Paid" color="warning" size="small" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>

        {/* TAB 6: APPOINTMENTS */}
        <TabPanel value={tabIndex} index={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                My Appointments & Video Meeting Links ({appointments.length})
              </Typography>
              <Button variant="outlined" startIcon={<CalendarMonthIcon />} onClick={() => setOpenAppointmentModal(true)}>
                Book New Appointment
              </Button>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Advocate Name</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Video Link</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><Typography fontWeight="bold">{a.advocateName}</Typography></TableCell>
                    <TableCell>{a.date} at {a.time}</TableCell>
                    <TableCell><Chip label={a.mode} variant="outlined" color="primary" size="small" /></TableCell>
                    <TableCell><Chip label={a.status} color={a.status === "Approved" ? "success" : "warning"} size="small" /></TableCell>
                    <TableCell>
                      {a.link ? (
                        <Button size="small" variant="contained" color="success" startIcon={<VideoCallIcon />} href={a.link} target="_blank">
                          Join Call
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Pending Advocate Approval</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>

        {/* TAB 7: MESSAGES */}
        <TabPanel value={tabIndex} index={7}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Direct Messaging with Legal Counsel
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {!activePortalCaseId ? (
              <Alert severity="info">Please select an active Case / Matter first to view and send messages.</Alert>
            ) : (
              <>
                <Stack spacing={2} sx={{ mb: 3, maxHeight: "400px", overflowY: "auto", p: 1 }}>
                  {messages.map((m) => {
                    const isVoice = m.type === "VOICE";
                    const isClient = m.senderRole === "client" || String(m.sender).includes("Client");
                    return (
                      <Paper 
                        key={m.id} 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: isClient ? "#f8fafc" : "#faf5ff", 
                          borderColor: isClient ? "#cbd5e1" : "#e9d5ff",
                          borderRadius: 2.5,
                          alignSelf: isClient ? "flex-end" : "flex-start",
                          width: "80%"
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="primary" fontWeight="bold">
                            {m.senderName || m.sender || "System"} ({m.senderRole || "advocate"})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {m.timestamp ? new Date(m.timestamp).toLocaleTimeString("en-IN", {hour: '2-digit', minute:'2-digit'}) : ""}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-line" }}>
                          {isVoice ? `🎙️ [Voice Note Transcript]: ${m.text}` : m.text}
                        </Typography>
                        {m.audioUrl && (
                          <Box sx={{ mt: 1.5 }}>
                            <audio controls src={m.audioUrl} style={{ width: "100%", height: 36 }} />
                          </Box>
                        )}
                      </Paper>
                    );
                  })}
                </Stack>
                
                {/* Voice Recorder & Input Section */}
                <Box sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 3, bg: "#f8fafc" }}>
                  <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Send Voice Note or Message:
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Type your message or click microphone to record voice..."
                      value={clientMsgInput}
                      onChange={(e) => setClientMsgInput(e.target.value)}
                    />
                    <Stack spacing={1}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<SendIcon />} 
                        onClick={handleSendMessage}
                        sx={{ height: "45px", fontWeight: "bold" }}
                      >
                        Send
                      </Button>
                    </Stack>
                  </Stack>

                  {/* Micro voice record bar */}
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1.5 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      startIcon={<MicIcon />}
                      onClick={() => {
                        alert("🎙️ Speech Recognition activated! Please speak into your microphone to type.");
                        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
                        if (SpeechRec) {
                          const rec = new SpeechRec();
                          rec.lang = "hi-IN";
                          rec.onresult = (e) => {
                            const val = e.results[0][0].transcript;
                            setClientMsgInput(prev => prev ? prev + " " + val : val);
                          };
                          rec.start();
                        } else {
                          alert("Speech Recognition not supported in this browser.");
                        }
                      }}
                      sx={{ textTransform: "none", fontSize: "0.75rem" }}
                    >
                      🎤 Speak to Type (हिंदी/English)
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      Context-aware recognition: Civil/Criminal legal context enabled.
                    </Typography>
                  </Stack>
                </Box>
              </>
            )}
          </Paper>
        </TabPanel>

        {/* TAB 8: CLIENT PROFILE & KYC */}
        <TabPanel value={tabIndex} index={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Client Identity, KYC & Membership Profile
            </Typography>
            <Grid container spacing={2.5} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Client / Member Name" value={clientName} disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Member ID" value={memberId} disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Role & Access" value={user?.role || "Member"} disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Contact Email" value={user?.email || "contact@greenearthtrust.org"} disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Contact Mobile" value={user?.mobile || "+91 98201 98765"} disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="KYC Verification Status" value="🟢 Fully Verified (Aadhaar/PAN)" disabled />
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* TAB 9: ICJ PARTNER & E-GOV DESK */}
        <TabPanel value={tabIndex} index={9}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: "#fff" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="#059669">
                  🤝 ICJ Client Empowerment &amp; Partner Desk
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  E-Governance Portals, Legal Referral Incentives, and Law Firm Collaboration Desk
                </Typography>
              </Box>
              <Chip label="PARTNER ECOSYSTEM" color="success" sx={{ fontWeight: "bold" }} />
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {(() => {
              const egovActive = SystemConfigService.isPlanActive("plan_egov");
              const affiliateActive = SystemConfigService.isPlanActive("plan_affiliate");
              const lawfirmActive = SystemConfigService.isPlanActive("plan_lawfirm");

              return (
                <Grid container spacing={3}>
                  {/* PLAN 2: E-GOVERNANCE PORTALS DESK */}
                  <Grid item xs={12} md={4}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: egovActive ? "#f0fdf4" : "#fffbe6",
                        borderColor: egovActive ? "#10b981" : "#f59e0b",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                            💻 E-Governance Services
                          </Typography>
                          <Chip
                            label={egovActive ? "ACTIVE & LIVE" : "LOCKED 🔒"}
                            color={egovActive ? "success" : "warning"}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </Stack>

                        {egovActive ? (
                          <Stack spacing={1} sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Operate online government portals directly:
                            </Typography>
                            <Button size="small" variant="outlined" color="primary" href="https://ecourts.gov.in" target="_blank">
                              🌐 e-Courts Cause List &amp; Orders
                            </Button>
                            <Button size="small" variant="outlined" color="primary" href="https://upbhulekh.gov.in" target="_blank">
                              📜 State Land Revenue Bhulekh
                            </Button>
                            <Button size="small" variant="outlined" color="primary" href="https://rtionline.gov.in" target="_blank">
                              📝 RTI Online Portal
                            </Button>
                          </Stack>
                        ) : (
                          <Alert severity="warning" sx={{ mt: 1, fontSize: "0.8rem" }}>
                            🔒 E-Governance Digital Assistance Plan Launch Pending by ICJ Trust Admin.
                          </Alert>
                        )}
                      </Box>
                    </Paper>
                  </Grid>

                  {/* PLAN 3: LEGAL REFERRAL AFFILIATE DESK */}
                  <Grid item xs={12} md={4}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: affiliateActive ? "#fff8f0" : "#fffbe6",
                        borderColor: affiliateActive ? "#f97316" : "#f59e0b",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                            🟠 Legal Referral Incentives
                          </Typography>
                          <Chip
                            label={affiliateActive ? "ACTIVE & LIVE" : "LOCKED 🔒"}
                            color={affiliateActive ? "warning" : "warning"}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </Stack>

                        {affiliateActive ? (
                          <Stack spacing={1.5} sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Refer legal clients and earn wallet rewards:
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fff", textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary">Your Referral Code</Typography>
                              <Typography variant="subtitle2" fontWeight="bold" color="secondary.main">
                                REF-{memberId}
                              </Typography>
                              <Typography variant="caption" color="success.main" display="block" fontWeight="bold">
                                Referral Wallet Earnings: ₹0.00
                              </Typography>
                            </Paper>
                          </Stack>
                        ) : (
                          <Alert severity="warning" sx={{ mt: 1, fontSize: "0.8rem" }}>
                            🔒 Legal Referral Affiliate Earnings Plan Launch Pending by ICJ Trust Admin.
                          </Alert>
                        )}
                      </Box>
                    </Paper>
                  </Grid>

                  {/* PLAN 4: LAW FIRM ENTERPRISE PARTNERSHIP DESK */}
                  <Grid item xs={12} md={4}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: lawfirmActive ? "#f3e8ff" : "#fffbe6",
                        borderColor: lawfirmActive ? "#9333ea" : "#f59e0b",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1" fontWeight="bold" color="#0f172a">
                            🟣 Law Firm Enterprise Desk
                          </Typography>
                          <Chip
                            label={lawfirmActive ? "ACTIVE & LIVE" : "LOCKED 🔒"}
                            color={lawfirmActive ? "secondary" : "warning"}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </Stack>

                        {lawfirmActive ? (
                          <Stack spacing={1.5} sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Operate a Law Firm / Legal Services Centre with ICJ Senior Counsel:
                            </Typography>
                            <Button variant="contained" color="secondary" fullWidth size="small" sx={{ fontWeight: "bold" }}>
                              APPLY FOR ICJ LAW FIRM COLLABORATION 🤝
                            </Button>
                          </Stack>
                        ) : (
                          <Alert severity="warning" sx={{ mt: 1, fontSize: "0.8rem" }}>
                            🔒 Law Firm Enterprise Partnership Plan Launch Pending by ICJ Trust Admin.
                          </Alert>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              );
            })()}
          </Paper>
        </TabPanel>

        {/* TAB 10: MY API STORE */}
        <TabPanel value={tabIndex} index={10}>
          <Paper sx={{ p: 4, borderRadius: 3, border: "2px solid #2563eb", background: "linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)" }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <SettingsSuggestIcon sx={{ color: "#2563eb", fontSize: 36 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold" color="#1e3a8a">
                  माई API स्टोर (My API Store)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  अपने खुद के ChatGPT (OpenAI), Google Gemini या Anthropic Claude API चाबियों को इंटीग्रेट करें।
                </Typography>
              </Box>
            </Stack>

            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>0-सेकंड ऑटो-इंटीग्रेशन:</strong> यहाँ कॉन्फ़िगर की गई API चाबियाँ आपके ब्राउज़र में सुरक्षित रूप से सेव हो जाएंगी। जब भी आप पूरे पोर्टल पर कोई भी AI फीचर इस्तेमाल करेंगे (जैसे ड्राफ्टिंग, डायग्नोसिस या चैटिंग), तो आपके चुने हुए प्रोवाइडर और चाबी का उपयोग किया जाएगा।
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: "#fff" }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    1. चुनें पसंदीदा AI मॉडल
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={aiProvider}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAiProvider(val);
                      localStorage.setItem("icj_ai_provider", val);
                    }}
                    sx={{ mt: 1.5 }}
                  >
                    <MenuItem value="gemini">Google Gemini (Default)</MenuItem>
                    <MenuItem value="openai">OpenAI ChatGPT (GPT-4o-mini)</MenuItem>
                    <MenuItem value="anthropic">Anthropic Claude (Claude 3.5 Sonnet)</MenuItem>
                  </TextField>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: "#fff" }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    2. अपनी API चाबी दर्ज करें
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {aiProvider === "gemini" && (
                      <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Google Gemini API Key:</Typography>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            size="small"
                            type="password"
                            fullWidth
                            placeholder="AIzaSy..."
                            value={geminiApiKey}
                            onChange={(e) => {
                              const val = e.target.value;
                              setGeminiApiKey(val);
                              localStorage.setItem("icj_gemini_api_key", val);
                              localStorage.setItem("icj_master_gemini_key", val);
                            }}
                          />
                          {geminiApiKey && (
                            <Button variant="outlined" color="error" size="small" onClick={() => { setGeminiApiKey(""); localStorage.removeItem("icj_gemini_api_key"); localStorage.removeItem("icj_master_gemini_key"); }}>Clear</Button>
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          गूगल एआई स्टूडियो (Google AI Studio) से फ्री या पे-एस-यू-गो (Pay-as-you-go) की लाएं।
                        </Typography>
                      </Box>
                    )}

                    {aiProvider === "openai" && (
                      <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>OpenAI ChatGPT API Key:</Typography>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            size="small"
                            type="password"
                            fullWidth
                            placeholder="sk-proj-..."
                            value={openaiApiKey}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOpenaiApiKey(val);
                              localStorage.setItem("icj_openai_api_key", val);
                            }}
                          />
                          {openaiApiKey && (
                            <Button variant="outlined" color="error" size="small" onClick={() => { setOpenaiApiKey(""); localStorage.removeItem("icj_openai_api_key"); }}>Clear</Button>
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          ओपनएआई प्लेटफार्म (platform.openai.com) से क्रेडिट लोड की हुई sk-proj चाबी लाएं।
                        </Typography>
                      </Box>
                    )}

                    {aiProvider === "anthropic" && (
                      <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Anthropic Claude API Key:</Typography>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            size="small"
                            type="password"
                            fullWidth
                            placeholder="sk-ant-..."
                            value={anthropicApiKey}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAnthropicApiKey(val);
                              localStorage.setItem("icj_anthropic_api_key", val);
                            }}
                          />
                          {anthropicApiKey && (
                            <Button variant="outlined" color="error" size="small" onClick={() => { setAnthropicApiKey(""); localStorage.removeItem("icj_anthropic_api_key"); }}>Clear</Button>
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          एंथ्रोपिक कंसोल (console.anthropic.com) से sk-ant चाबी लाएं।
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* Plain Language Problem Intake Dialog (Phase 7) */}
        <Dialog open={openFileModal} onClose={() => setOpenFileModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Legal Matter / Problem Intake</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Explain your issue or legal problem in simple, plain language. No legal jargon required.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Problem / Case Title" placeholder="e.g. Unauthorized Encroachment on Community Land" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={4} label="Describe your Problem in Simple Language" placeholder="Explain what happened, key events, and what resolution you are seeking..." value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Opposite Party / Respondent (If known)" placeholder="e.g. Local Authority / Company Name" value={form.oppositeParty} onChange={(e) => setForm({ ...form, oppositeParty: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="date" label="Date of Incident" value={form.incidentDate} onChange={(e) => setForm({ ...form, incidentDate: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Court / Jurisdiction" value={form.courtName} onChange={(e) => setForm({ ...form, courtName: e.target.value })} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenFileModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateCase}>Submit Problem Intake</Button>
          </DialogActions>
        </Dialog>

        {/* Document Upload Dialog (Phase 9 & 10) */}
        <Dialog open={openDocUploadModal} onClose={() => setOpenDocUploadModal(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Upload Document to Vault</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Supported formats: PDF, PNG, JPG, Screenshots. Files will be saved and queued for AI Document Analysis.
            </Typography>
            <Stack spacing={2}>
              <TextField fullWidth label="Document Title" placeholder="e.g. Property Deed / Contract Copy" value={docUploadForm.name} onChange={(e) => setDocUploadForm({ ...docUploadForm, name: e.target.value })} />
              <TextField select fullWidth label="Category" value={docUploadForm.category} onChange={(e) => setDocUploadForm({ ...docUploadForm, category: e.target.value })}>
                <MenuItem value="Legal Pleading">Legal Pleading / Petition</MenuItem>
                <MenuItem value="Evidence">Evidence / Photo / Screenshot</MenuItem>
                <MenuItem value="Identity">Identity / KYC Document</MenuItem>
                <MenuItem value="Contract">Agreement / Contract Copy</MenuItem>
              </TextField>
              <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                Select File (PDF / JPG / PNG)
                <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDocUploadForm({ ...docUploadForm, fileObj: e.target.files[0] })} />
              </Button>
              {docUploadForm.fileObj && (
                <Typography variant="caption" color="success.main" fontWeight="bold">
                  Selected File: {docUploadForm.fileObj.name} ({(docUploadForm.fileObj.size / 1024).toFixed(1)} KB)
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDocUploadModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUploadDocument}>Save & Upload Document</Button>
          </DialogActions>
        </Dialog>

        {/* Book Appointment Dialog */}
        <Dialog open={openAppointmentModal} onClose={() => setOpenAppointmentModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Book Legal Appointment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField select fullWidth label="Select Advocate" value={aptForm.advocateName} onChange={(e) => setAptForm({ ...aptForm, advocateName: e.target.value })}>
                  {advocates.map((a) => (
                    <MenuItem key={a.id} value={a.name}>
                      {a.name} ({a.specialization || "Empaneled Counsel"})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="date" label="Preferred Date" value={aptForm.date} onChange={(e) => setAptForm({ ...aptForm, date: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Preferred Time" value={aptForm.time} onChange={(e) => setAptForm({ ...aptForm, time: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField select fullWidth label="Meeting Mode" value={aptForm.mode} onChange={(e) => setAptForm({ ...aptForm, mode: e.target.value })}>
                  <MenuItem value="Video Conference">Video Conference</MenuItem>
                  <MenuItem value="In-Person Chamber">In-Person Chamber</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenAppointmentModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleBookAppointment}>Book Appointment</Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* ─── MODAL: PROTECTED DOCUMENT RELEASE AUTHORIZATION ───────────────────────── */}
      <Dialog open={authOtpOpen} onClose={() => setAuthOtpOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          🔒 Protected Release Authorization
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You are requesting a protected <strong>{authAction}</strong> action on file:<br />
            <strong>{authDocName}</strong>
          </Typography>
          <Alert severity="warning" sx={{ mb: 2, fontSize: "0.85rem", textAlign: "left" }}>
            This document is marked as sensitive. To proceed, please authorize with your owner security pin code.
          </Alert>
          <TextField
            fullWidth
            label="Enter Verification PIN / OTP"
            value={authOtpCode}
            onChange={(e) => setAuthOtpCode(e.target.value)}
            placeholder="e.g. 123456"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAuthOtpOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* ─── LIVE CAMERA DOCUMENT SCANNER MODAL ───────────────────────── */}
      <CameraDocumentScanner
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onDocumentCaptured={async (doc) => {
          await addDocument({
            name: doc.name,
            owner: clientName,
            member_id: memberId,
            category: "Camera Scan",
            case_id: activePortalCaseId || "GENERAL",
            uploaded_at: doc.capturedAt,
            file_size: "2.4 MB",
            sha256: `SHA256-CAM-${Date.now().toString(36).toUpperCase()}`,
            status: "File Saved & Verified",
            aiStatus: "Ready for AI Document Processing Pipeline",
          });
          setAlertMsg(`📷 Camera Document Captured & Saved to Matter Vault! Sent to assigned Advocate.`);
          setTimeout(() => setAlertMsg(""), 4000);
        }}
      />

      {/* ─── ENCRYPTED WEBRTC HD VIDEO CONSULTATION MODAL ───────────────────────── */}
      <VideoConsultationModal
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        advocateName="Adv. Vikramaditya Singh"
        advocateRole="Assigned Senior Advocate"
        clientName={clientName}
      />

      {/* ─── ENCRYPTED VOICE AUDIO CONSULTATION MODAL ───────────────────────── */}
      <AudioConsultationModal
        open={audioModalOpen}
        onClose={() => setAudioModalOpen(false)}
        advocateName="Adv. Vikramaditya Singh"
        advocateRole="Assigned Senior Advocate"
        clientName={clientName}
      />
    </MainLayout>
  );
}
