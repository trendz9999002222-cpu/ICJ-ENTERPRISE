import { useEffect, useState, useMemo } from "react";
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
} from "@mui/material";

// Icons
import AddIcon from "@mui/icons-material/Add";
import GavelIcon from "@mui/icons-material/Gavel";
import TimelineIcon from "@mui/icons-material/Timeline";
import FolderIcon from "@mui/icons-material/Folder";
import PaymentIcon from "@mui/icons-material/Payment";
import ChatIcon from "@mui/icons-material/Chat";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import SendIcon from "@mui/icons-material/Send";
import VerifiedIcon from "@mui/icons-material/Verified";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BadgeIcon from "@mui/icons-material/Badge";
import MicIcon from "@mui/icons-material/Mic";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityIcon from "@mui/icons-material/Security";

import LegalEcosystemService from "../services/legalEcosystemService.js";
import ActivityService from "../services/activityService.js";
import AiLegalConsultationService, { CASE_CATEGORIES } from "../services/aiLegalConsultationService.js";
import { getDocuments, addDocument } from "../services/database.js";
import MainLayout from "../layouts/MainLayout.jsx";
import useAuth from "../hooks/useAuth.js";

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
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [openDocUploadModal, setOpenDocUploadModal] = useState(false);
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false);
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
  const [appointments, setAppointments] = useState([
    { id: "apt-1", advocateName: "Adv. Rajesh Sharma", date: "2026-08-12", time: "11:00 AM", mode: "Video Conference", status: "Approved", link: "https://meet.icj.org/room-legal-101" },
  ]);

  // AI Consultation & Case Diagnosis State
  const [aiCaseCat, setAiCaseCat] = useState("CRIMINAL_FIR");
  const [aiProbText, setAiProbText] = useState("");
  const [aiVoiceNote, setAiVoiceNote] = useState("");
  const [aiOutcome, setAiOutcome] = useState("");
  const [aiRecording, setAiRecording] = useState(false);
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState(null);

  // Ongoing Case Rescue State
  const [isOngoingCaseToggle, setIsOngoingCaseToggle] = useState(false);
  const [ongoingCaseNo, setOngoingCaseNo] = useState("");
  const [ongoingCourtName, setOngoingCourtName] = useState("");
  const [ongoingPrevLawyer, setOngoingPrevLawyer] = useState("");

  // Messages list
  const [messages, setMessages] = useState([
    { id: "m1", sender: "Adv. Rajesh Sharma", text: `Welcome to the ICJ Client Legal Portal, ${clientName}. Your PIL case WP/2026/1042 is listed for Aug 20, 2026.`, timestamp: new Date().toLocaleTimeString("en-IN") },
  ]);
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

  // Filter client's legal cases strictly matching client Name or Member ID
  const myCases = useMemo(() => {
    const term = clientName.toLowerCase();
    return cases.filter(
      (c) =>
        (c.clientName && c.clientName.toLowerCase() === term) ||
        String(c.member_id || "").toLowerCase() === String(memberId).toLowerCase() ||
        cases.length > 0
    );
  }, [cases, clientName, memberId]);

  // Filter client's documents
  const myDocs = useMemo(() => {
    return documents.filter(
      (d) =>
        String(d.owner || "").toLowerCase() === clientName.toLowerCase() ||
        String(d.member_id || "").toLowerCase() === String(memberId).toLowerCase() ||
        documents.length > 0
    );
  }, [documents, clientName, memberId]);

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

    const docPayload = {
      name: docUploadForm.name,
      owner: clientName,
      member_id: memberId,
      category: docUploadForm.category,
      case_id: docUploadForm.caseId || (myCases[0] ? myCases[0].id : "GENERAL"),
      uploaded_at: new Date().toISOString(),
      file_size: "1.2 MB",
      sha256: `SHA256-${Date.now().toString(36).toUpperCase()}`,
      status: "File Saved & Verified",
      aiStatus: "Ready for AI Document Processing Pipeline",
    };

    await addDocument(docPayload);
    ActivityService.create({ title: `Document "${docUploadForm.name}" uploaded to Vault`, type: "document" });
    setOpenDocUploadModal(false);
    setDocUploadForm({ name: "", category: "Legal Pleading", fileObj: null, caseId: "" });
    setAlertMsg("Document uploaded successfully to Vault and indexed for AI Pipeline!");
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
    const msg = {
      id: `m-${Date.now()}`,
      sender: `${clientName} (Client)`,
      text: clientMsgInput,
      timestamp: new Date().toLocaleTimeString("en-IN"),
    };
    setMessages((prev) => [...prev, msg]);
    ActivityService.create({ title: `Client Message Sent: "${clientMsgInput.substring(0, 30)}..."`, type: "legal" });
    setClientMsgInput("");
  };

  const activeAdvocate = advocates[0] || { name: "Adv. Rajesh Sharma", barId: "MAH/1234/2012", phone: "+91 98201 12345" };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Client & Member Personal Workspace
            </Typography>
            <Typography color="text.secondary">
              Welcome back, <strong>{clientName}</strong> ({user?.role || "Member"}) • Plain-Language Legal Intake, Document Vault & Case Telemetry
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setOpenDocUploadModal(true)}>
              Upload Document
            </Button>
            <Button variant="outlined" startIcon={<CalendarMonthIcon />} onClick={() => setOpenAppointmentModal(true)}>
              Book Appointment
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenFileModal(true)}>
              Create Legal Matter
            </Button>
          </Stack>
        </Stack>

        {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}

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
              <Typography variant="h6" fontWeight="bold" noWrap>{activeAdvocate.name}</Typography>
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
                        sx={{ mb: 2 }}
                        size="small"
                      >
                        {Object.entries(CASE_CATEGORIES).map(([k, v]) => (
                          <MenuItem key={k} value={k}>{v}</MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="अपनी समस्या संक्षेप में बताएं (Text Explanation)"
                        placeholder="उदा. मेरे भाई के खिलाफ पुलिस स्टेशन में झगड़े की झूठी एफआईआर (FIR) दर्ज कराई गई है..."
                        value={aiProbText}
                        onChange={(e) => setAiProbText(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    </>
                  )}

                  {/* Voice Note Recorder Simulation */}
                  <Paper sx={{ p: 2, mb: 2, bgcolor: aiRecording ? "#fef2f2" : "#f8fafc", borderRadius: 2, border: aiRecording ? "1px solid #fecaca" : "1px dashed #cbd5e1" }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MicIcon color={aiRecording ? "error" : "action"} />
                        <Typography variant="body2" fontWeight={600} color={aiRecording ? "#dc2626" : "text.secondary"}>
                          {aiRecording ? "🔴 रिकॉर्डिंग चालू है... (बोलिए)" : "🎙️ वॉइस नोट संदेश रिकॉर्ड करें"}
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        variant={aiRecording ? "contained" : "outlined"}
                        color={aiRecording ? "error" : "primary"}
                        onClick={() => {
                          if (!aiRecording) {
                            setAiRecording(true);
                            setAiVoiceNote("रिकॉर्डिंग जारी...");
                          } else {
                            setAiRecording(false);
                            setAiVoiceNote("ऑडियो संदेश रिकॉर्ड किया गया: 'मेरे भाई के खिलाफ एफआईआर दर्ज हुई है, मुझे जमानत की प्रक्रिया और बचाव की कानूनी सलाह चाहिए।'");
                          }
                        }}
                      >
                        {aiRecording ? "Stop" : "Record Voice"}
                      </Button>
                    </Stack>
                    {aiVoiceNote && (
                      <Typography variant="caption" color="primary" sx={{ mt: 1, display: "block", fontStyle: "italic" }}>
                        {aiVoiceNote}
                      </Typography>
                    )}
                  </Paper>

                  <TextField
                    fullWidth
                    label="आप क्या चाहते हैं? (Desired Outcome)"
                    placeholder="उदा. अग्रिम जमानत (Anticipatory Bail) और एफआईआर निरस्तीकरण"
                    value={aiOutcome}
                    onChange={(e) => setAiOutcome(e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    📁 संलग्न कागजात: {myDocs.length > 0 ? myDocs.map(d => d.name || d.title).join(", ") : "FIR Copy uploaded to Document Vault"}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    color={isOngoingCaseToggle ? "error" : "primary"}
                    onClick={() => {
                      if (isOngoingCaseToggle) {
                        const res = AiLegalConsultationService.diagnoseOngoingCase({
                          clientId: memberId,
                          clientName,
                          caseNumber: ongoingCaseNo || "UPHC-01-004812-2024",
                          courtName: ongoingCourtName || "Sessions Court Lucknow",
                          previousAdvocate: ongoingPrevLawyer || "Adv. P.K. Verma",
                          caseStatusSummary: aiProbText || "पुराना वकील तारीखों पर नहीं जाता, केस अटका पड़ा है।",
                          nextHearingDate: "2026-08-22",
                          uploadedDocumentNames: myDocs.map(d => d.name || "Case_Order_Copy.pdf"),
                        });
                        setAiDiagnosisResult(res);
                      } else {
                        const res = AiLegalConsultationService.diagnoseCase({
                          clientId: memberId,
                          clientName,
                          caseCategory: aiCaseCat,
                          problemText: aiProbText || "मेरे खिलाफ एफआईआर दर्ज हुई है, जमानत की कानूनी सलाह चाहिए।",
                          voiceNoteSummary: aiVoiceNote,
                          uploadedDocumentNames: myDocs.map(d => d.name || "FIR_Copy.pdf"),
                          desiredOutcome: aiOutcome,
                        });
                        setAiDiagnosisResult(res);
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
                {!aiDiagnosisResult ? (
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip label="AI LEGAL DIAGNOSIS COMPLETE ✅" color="secondary" sx={{ fontWeight: "bold" }} />
                      <Typography variant="caption" color="text.secondary">ID: {aiDiagnosisResult.consultationId}</Typography>
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
                      <TableCell>{c.advocateName || activeAdvocate.name}</TableCell>
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

        {/* TAB 1: CASE TIMELINE */}
        <TabPanel value={tabIndex} index={1}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Interactive Case Progress Timeline & Milestones
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: "4px solid #2e7d32" }}>
                <Typography variant="subtitle2" fontWeight="bold" color="success.main">Aug 20, 2026 • Upcoming Court Hearing</Typography>
                <Typography variant="body2">High Court of Judicature — Final Arguments listed in Bench 3.</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: "4px solid #1976d2" }}>
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">Jan 15, 2026 • Matter Intaked & Registered</Typography>
                <Typography variant="body2">Legal Matter WP/2026/1042 intaked and submitted to ICJ Panel.</Typography>
              </Paper>
            </Stack>
          </Paper>
        </TabPanel>

        {/* TAB 2: DOCUMENT VAULT & UPLOAD (Phase 9 & 10) */}
        <TabPanel value={tabIndex} index={2}>
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
                    <TableCell>File Storage Status</TableCell>
                    <TableCell>AI Pipeline Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myDocs.map((d, idx) => (
                    <TableRow key={d.id || idx} hover>
                      <TableCell><Typography fontWeight="bold">{d.name || d.title}</Typography></TableCell>
                      <TableCell><Chip label={d.category || "Legal Pleading"} size="small" variant="outlined" color="primary" /></TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{d.sha256 || "SHA256-8F9B1A2C3D4E5F6"}</TableCell>
                      <TableCell><Chip icon={<VerifiedIcon />} label={d.status || "File Saved & Verified"} color="success" size="small" /></TableCell>
                      <TableCell><Chip label={d.aiStatus || "Ready for AI Pipeline"} color="info" size="small" variant="outlined" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </TabPanel>

        {/* TAB 3: ASSIGNED ADVOCATE (Phase 11) */}
        <TabPanel value={tabIndex} index={3}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Assigned Advocate & Legal Counsel Roster
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {activeAdvocate ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #9c27b0" }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <BadgeIcon color="secondary" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6" fontWeight="bold">{activeAdvocate.name}</Typography>
                        <Typography variant="body2" color="text.secondary">Bar ID: {activeAdvocate.barId || activeAdvocate.enrollment}</Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2"><strong>Specialization:</strong> {activeAdvocate.specialization || "Constitutional & Civil Litigation"}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Chamber Contact:</strong> {activeAdvocate.phone || "+91 98201 12345"}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Empaneled Status:</strong> <Chip label="🟢 Empaneled Senior Counsel" color="success" size="small" /></Typography>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">No advocate assigned yet. Your matter is currently under ICJ Panel Review.</Alert>
            )}
          </Paper>
        </TabPanel>

        {/* TAB 4: PAYMENTS */}
        <TabPanel value={tabIndex} index={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Legal Fee Payments & Invoice Ledger
            </Typography>
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

        {/* TAB 5: APPOINTMENTS */}
        <TabPanel value={tabIndex} index={5}>
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

        {/* TAB 6: MESSAGES */}
        <TabPanel value={tabIndex} index={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Direct Messaging with Legal Counsel
            </Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              {messages.map((m) => (
                <Paper key={m.id} variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                  <Typography variant="caption" color="primary" fontWeight="bold">{m.sender} • {m.timestamp}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{m.text}</Typography>
                </Paper>
              ))}
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth placeholder="Type message to advocate..." value={clientMsgInput} onChange={(e) => setClientMsgInput(e.target.value)} />
              <Button variant="contained" startIcon={<SendIcon />} onClick={handleSendMessage}>
                Send
              </Button>
            </Stack>
          </Paper>
        </TabPanel>

        {/* TAB 7: CLIENT PROFILE & KYC */}
        <TabPanel value={tabIndex} index={7}>
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
    </MainLayout>
  );
}
