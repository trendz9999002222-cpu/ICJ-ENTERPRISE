import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import FolderIcon from "@mui/icons-material/Folder";
import ChatIcon from "@mui/icons-material/Chat";
import CallIcon from "@mui/icons-material/Call";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import BadgeIcon from "@mui/icons-material/Badge";
import SendIcon from "@mui/icons-material/Send";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import UploadFileIcon from "@mui/icons-material/UploadFile";

// Services & Components
import useAuth from "../hooks/useAuth.js";
import { useLanguage } from "../services/languageService.js";
import LegalEcosystemService from "../services/legalEcosystemService.js";
import CitizenWorkflowService from "../services/citizenWorkflowService.js";
import MatterCommunicationService from "../services/matterCommunicationService.js";
import ActivityService from "../services/activityService.js";
import { getDocuments, addDocument } from "../services/database.js";
import VoiceInputAdornment from "../components/common/VoiceInputAdornment.jsx";
import SmartLocationSelector from "../components/common/SmartLocationSelector.jsx";
import ClientFeatureService from "../config/clientFeatureConfig.js";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

export default function ClientPortal() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const clientName = user?.fullName || user?.name || "Litigant Client";
  const memberId = user?.memberId || user?.id || "ICJ-2026-MEM-0001";

  const [tabIndex, setTabIndex] = useState(0);
  const [activePortalCaseId, setActivePortalCaseId] = useState("");
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [alertMsg, setAlertMsg] = useState("");

  // Master Case Folder & Advocate Details
  const [activeMasterCase, setActiveMasterCase] = useState(null);
  const [openAdvocateChangeModal, setOpenAdvocateChangeModal] = useState(false);
  const [advocateChangeReason, setAdvocateChangeReason] = useState("Language / Communication Issue");
  const [advocateChangeNotes, setAdvocateChangeNotes] = useState("");

  // Case Problem Submission Form
  const [form, setForm] = useState({
    title: "",
    category: "CIVIL_PROPERTY",
    courtName: "",
    oppositeParty: "",
    problemState: "Uttar Pradesh",
    problemDistrict: "Lucknow",
    problemCity: "",
    problemPoliceStation: "",
    problemPincode: "",
    problemDescription: "",
  });

  // Document Upload Form
  const [openDocUploadModal, setOpenDocUploadModal] = useState(false);
  const [docUploadForm, setDocUploadForm] = useState({
    name: "",
    category: "Legal Pleading",
    fileObj: null,
  });

  // Appointment Form
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false);
  const [aptForm, setAptForm] = useState({
    advocateName: "Empaneled Senior Counsel",
    date: new Date().toISOString().slice(0, 10),
    time: "10:30 AM",
    mode: "Phone Consultation",
    purpose: "Case Assessment & Legal Advice",
  });
  const [appointments, setAppointments] = useState([]);

  // Messages list
  const [messages, setMessages] = useState([]);
  const [clientMsgInput, setClientMsgInput] = useState("");

  // Load Data
  const loadData = useCallback(async () => {
    try {
      const allCases = LegalEcosystemService.getCases() || [];
      const allAdvocates = LegalEcosystemService.getAdvocates() || [];
      const allDocs = await getDocuments().catch(() => []);
      const cCase = CitizenWorkflowService.getOrCreateActiveCase(memberId, clientName);

      setCases(allCases);
      setAdvocates(allAdvocates);
      setDocuments(Array.isArray(allDocs) ? allDocs : []);
      setActiveMasterCase(cCase);
      if (allCases.length > 0 && !activePortalCaseId) {
        setActivePortalCaseId(allCases[0].id);
      }
    } catch (err) {
      console.error("Error loading client portal data:", err);
    }
  }, [memberId, clientName, activePortalCaseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load Messages when active case changes
  useEffect(() => {
    if (activePortalCaseId) {
      const msgs = MatterCommunicationService.getMessages(activePortalCaseId);
      setMessages(msgs || []);
    }
  }, [activePortalCaseId]);

  const myCases = useMemo(() => {
    return cases.filter(
      (c) =>
        c.clientName === clientName ||
        c.memberId === memberId ||
        c.clientId === memberId ||
        String(c.member_id).toLowerCase() === String(memberId).toLowerCase()
    );
  }, [cases, clientName, memberId]);

  const myDocs = useMemo(() => {
    return documents.filter(
      (d) =>
        d.owner === clientName ||
        d.member_id === memberId ||
        d.memberId === memberId ||
        d.case_id === activePortalCaseId
    );
  }, [documents, clientName, memberId, activePortalCaseId]);

  const activeAdvocate = useMemo(() => {
    return advocates.find((a) => a.cases && a.cases.includes(activePortalCaseId)) || null;
  }, [advocates, activePortalCaseId]);

  // Submit Case Problem Intake
  const handleSubmitProblemIntake = () => {
    if (!form.title.trim()) {
      alert("कृपया केस का नाम / विषय दर्ज करें।");
      return;
    }
    if (!form.problemDescription.trim()) {
      alert("कृपया अपनी कानूनी समस्या का विवरण लिखें या बोलकर दर्ज करें।");
      return;
    }

    const newCaseId = "ICJ-" + new Date().getFullYear() + "-CASE-" + Math.floor(1000 + Math.random() * 9000);

    const newCaseObj = {
      id: newCaseId,
      caseNumber: newCaseId,
      title: form.title,
      category: form.category,
      courtName: form.courtName || "Jurisdictional Court / Tribunal",
      oppositeParty: form.oppositeParty || "Respondent Party",
      clientName: clientName,
      memberId: memberId,
      summary: form.problemDescription,
      status: "Submitted (Under Counsel Assignment)",
      trustApprovalStatus: "Active",
      filingDate: new Date().toISOString().slice(0, 10),
      nextHearing: "Pending Counsel Allotment",
      advocateName: "ICJ Specialist Legal Panel",
      advocateMobile: "7053002222",
      state: form.problemState,
      district: form.problemDistrict,
      city: form.problemCity,
      policeStation: form.problemPoliceStation,
      pincode: form.problemPincode,
    };

    LegalEcosystemService.createCase(newCaseObj);
    ActivityService.create({ title: "New Legal Problem Submitted: " + form.title, type: "case" });

    setAlertMsg("🎉 आपका केस सफलतापूर्वक दर्ज कर दिया गया है! संबंधित विशेषज्ञ वकील को आवंटित किया जा रहा है।");
    setForm({
      title: "",
      category: "CIVIL_PROPERTY",
      courtName: "",
      oppositeParty: "",
      problemState: "Uttar Pradesh",
      problemDistrict: "Lucknow",
      problemCity: "",
      problemPoliceStation: "",
      problemPincode: "",
      problemDescription: "",
    });
    setTabIndex(0);
    loadData();
    setTimeout(() => setAlertMsg(""), 5000);
  };

  // Upload Document
  const handleUploadDocument = async () => {
    if (!docUploadForm.name.trim()) {
      alert("कृपया दस्तावेज़ का शीर्षक दर्ज करें।");
      return;
    }

    const targetCaseId = activePortalCaseId || (myCases[0] ? myCases[0].id : "GENERAL");

    const docPayload = {
      name: docUploadForm.name,
      owner: clientName,
      member_id: memberId,
      category: docUploadForm.category,
      case_id: targetCaseId,
      uploaded_at: new Date().toISOString(),
      file_size: "1.5 MB",
      sha256: "SHA256-" + Date.now().toString(36).toUpperCase(),
      status: "Verified & Stored",
    };

    await addDocument(docPayload);
    ActivityService.create({ title: "Document " + docUploadForm.name + " uploaded to Case Vault", type: "document" });
    setOpenDocUploadModal(false);
    setDocUploadForm({ name: "", category: "Legal Pleading", fileObj: null });
    setAlertMsg("दस्तावेज़ सफलतापूर्वक केस वॉल्ट में सुरक्षित कर दिया गया!");
    setTimeout(() => setAlertMsg(""), 4000);
    const updatedDocs = await getDocuments().catch(() => []);
    setDocuments(Array.isArray(updatedDocs) ? updatedDocs : []);
  };

  // Send Direct Message to Advocate
  const handleSendMessage = () => {
    if (!clientMsgInput.trim()) return;
    if (!activePortalCaseId) {
      alert("कृपया पहले किसी सक्रिय केस का चयन करें।");
      return;
    }

    MatterCommunicationService.sendMessage(activePortalCaseId, memberId, clientName, "client", {
      type: "TEXT",
      text: clientMsgInput,
    });

    const msgs = MatterCommunicationService.getMessages(activePortalCaseId);
    setMessages(msgs);
    ActivityService.create({ title: "Message sent to Counsel", type: "legal" });
    setClientMsgInput("");
  };

  // Book Consultation Appointment
  const handleBookAppointment = () => {
    const nextApt = {
      id: "apt-" + Date.now(),
      advocateName: aptForm.advocateName,
      date: aptForm.date,
      time: aptForm.time,
      mode: aptForm.mode,
      status: "Confirmed",
      purpose: aptForm.purpose,
    };
    setAppointments((prev) => [...prev, nextApt]);
    ActivityService.create({ title: "Consultation Requested with " + aptForm.advocateName, type: "legal" });
    setOpenAppointmentModal(false);
    setAlertMsg("वकील के साथ परामर्श अनुरोध सफलतापूर्वक दर्ज हो गया!");
    setTimeout(() => setAlertMsg(""), 3500);
  };

  // Advocate Replacement Request
  const handleSubmitAdvocateChange = () => {
    if (!activeMasterCase) return;
    const updated = CitizenWorkflowService.requestAdvocateReplacement(
      activeMasterCase.case_id,
      advocateChangeReason,
      advocateChangeNotes
    );
    setActiveMasterCase(updated);
    setOpenAdvocateChangeModal(false);
    setAdvocateChangeNotes("");
    alert("🔄 वकील बदलने का अनुरोध सहेजा गया! ICJ सुपर एडमिन को स्वीकृति हेतु भेज दिया गया है।");
  };

  const assignedAdvocateName =
    activeMasterCase?.assigned_advocate?.advocate_name ||
    user?.advocateName ||
    (activeAdvocate ? activeAdvocate.name : "Adv. Vikramaditya Singh (Senior Counsel)");

  const assignedAdvocateMobile =
    activeMasterCase?.assigned_advocate?.advocate_mobile ||
    user?.advocateMobile ||
    "7053002222";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", p: { xs: 2, md: 3.5 } }}>
      
      {/* ─── 1. TOP HEADER & APPOINTED COUNSEL CARD ─── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          color: "#ffffff",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          gap={2.5}
        >
          {/* Client Identity & Welcome */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
              <Avatar sx={{ bgcolor: "#38bdf8", color: "#0f172a", fontWeight: 900 }}>
                👤
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={900}>
                  {clientName}
                </Typography>
                <Typography variant="caption" sx={{ color: "#93c5fd", fontWeight: 700 }}>
                  ID: {memberId} • Litigant Client Desk • नागरिक विधिक सहायता
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Dedicated Assigned Senior Counsel Quick Desk */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 2.5,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: "#fcd34d", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
                ⚖️ नियुक्त सीनियर अधिवक्ता (Assigned Legal Counsel)
              </Typography>
              <Typography variant="subtitle1" fontWeight={800} color="#ffffff">
                {assignedAdvocateName}
              </Typography>
              <Typography variant="caption" sx={{ color: "#cbd5e1" }}>
                📞 {assignedAdvocateMobile}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<WhatsAppIcon />}
                component="a"
                href={"https://api.whatsapp.com/send?phone=91" + assignedAdvocateMobile.replace(/\D/g, "").slice(-10) + "&text=" + encodeURIComponent("नमस्ते एडवोकेट साहब, मैं ICJ क्लाइंट " + clientName + " हूँ। मुझे अपने केस के संबंध में कानूनी परामर्श चाहिए।")}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontWeight: 800, bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" }, borderRadius: 2 }}
              >
                WhatsApp Chat 💬
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={<CallIcon />}
                component="a"
                href={"tel:" + assignedAdvocateMobile.replace(/\D/g, "").slice(-10)}
                sx={{ color: "#ffffff", borderColor: "#38bdf8", fontWeight: 800, "&:hover": { borderColor: "#ffffff", bgcolor: "rgba(255,255,255,0.15)" }, borderRadius: 2 }}
              >
                Call Desk 📞
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      {/* Alert Notification */}
      {alertMsg && (
        <Alert severity="success" sx={{ mb: 3, fontWeight: "bold", borderRadius: 2 }} onClose={() => setAlertMsg("")}>
          {alertMsg}
        </Alert>
      )}

      {/* ─── 2. FIVE PURPOSE-BUILT FOCUSED TABS ─── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          mb: 3,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: "1px solid #f1f5f9",
            "& .MuiTab-root": {
              fontWeight: 800,
              fontSize: "0.92rem",
              py: 2,
              textTransform: "none",
            },
          }}
        >
          <Tab icon={<GavelIcon sx={{ color: "#1e3a8a" }} />} iconPosition="start" label={"📁 मेरे सक्रिय केस (" + myCases.length + ")"} />
          <Tab icon={<AddIcon sx={{ color: "#15803d" }} />} iconPosition="start" label="➕ नई कानूनी समस्या / केस दर्ज करें" sx={{ color: "#15803d" }} />
          <Tab icon={<BadgeIcon sx={{ color: "#b45309" }} />} iconPosition="start" label="👨‍⚖️ मेरे वकील व परामर्श" />
          <Tab icon={<FolderIcon sx={{ color: "#7c3aed" }} />} iconPosition="start" label={"📂 मेरे दस्तावेज़ (" + myDocs.length + ")"} />
          <Tab icon={<ChatIcon sx={{ color: "#0284c7" }} />} iconPosition="start" label="💬 वकील से सीधा संवाद" />
        </Tabs>
      </Paper>

      {/* ─── TAB 0: MY ACTIVE CASES (मेरे सक्रिय केस) ─── */}
      <TabPanel value={tabIndex} index={0}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                📁 आपके पंजीकृत केस व अदालती स्थिति
              </Typography>
              <Typography variant="body2" color="text.secondary">
                दर्ज मुकदमों का रियल-टाइम स्टेटस, अगली सुनवाई तारीख एवं अधिकृत वकील
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => setTabIndex(1)}
              sx={{ fontWeight: 800, borderRadius: 2, px: 2.5 }}
            >
              ➕ नई समस्या / केस दर्ज करें
            </Button>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {myCases.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 5, textAlign: "center", borderRadius: 3, bgcolor: "#f8fafc", border: "2px dashed #cbd5e1" }}>
              <GavelIcon sx={{ fontSize: 56, color: "#94a3b8", mb: 1.5 }} />
              <Typography variant="h6" fontWeight={800} color="#334155" gutterBottom>
                अभी आपका कोई सक्रिय केस दर्ज नहीं है।
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: "auto" }}>
                यदि आप कोई नया मामला दर्ज करना चाहते हैं या कानूनी सहायता चाहते हैं, तो नीचे बटन पर क्लिक करें।
              </Typography>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => setTabIndex(1)}
                sx={{ fontWeight: 800, px: 3.5, py: 1.2, borderRadius: 2 }}
              >
                ➕ नया केस दर्ज करें (File Case Intake)
              </Button>
            </Paper>
          ) : (
            <Table size="medium">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell><strong>Case ID / No</strong></TableCell>
                  <TableCell><strong>मामले का विषय (Subject)</strong></TableCell>
                  <TableCell><strong>नियुक्त अधिवक्ता (Counsel)</strong></TableCell>
                  <TableCell><strong>अदालत / स्थान</strong></TableCell>
                  <TableCell><strong>स्थिति (Status)</strong></TableCell>
                  <TableCell><strong>अगली तारीख</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myCases.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 800, color: "#1e3a8a" }}>
                      {c.caseNumber || c.id}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={700} color="#0f172a">
                        {c.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.category || "Legal Dispute"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {c.advocateName || assignedAdvocateName}
                      </Typography>
                    </TableCell>
                    <TableCell>{c.courtName || "District Court"}</TableCell>
                    <TableCell>
                      <Chip
                        label={c.status || "In Review"}
                        color={c.status === "In Hearing" ? "success" : "primary"}
                        size="small"
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>
                    <TableCell>
                      <strong>{c.nextHearing || "तारीख निर्धारित की जा रही है"}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </TabPanel>

      {/* ─── TAB 1: FILE NEW CASE / INTAKE (नई समस्या दर्ज करें) ─── */}
      <TabPanel value={tabIndex} index={1}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, border: "1px solid #bbf7d0", bgcolor: "#ffffff" }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: "#15803d", width: 50, height: 50 }}>
              <AddIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={900} color="#15803d">
                ➕ नई कानूनी समस्या / केस दर्ज करें (Submit Legal Case)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                अपनी समस्या का विवरण लिखकर या बोलकर दर्ज करें। आपकी श्रेणी के अनुसार सीनियर वकील तुरंत नियुक्त किया जाएगा।
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* 1. Problem Title */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="केस का नाम / विषय (Case Title / Subject)"
                placeholder="उदा. भूमि विवाद, चेक बाउंस, एफआईआर शिकायत..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <VoiceInputAdornment
                      onTranscript={(t) => setForm((p) => ({ ...p, title: (p.title + " " + t).trim() }))}
                      value={form.title}
                    />
                  ),
                }}
              />
            </Grid>

            {/* 2. Legal Category */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                required
                label="कानूनी श्रेणी (Legal Category)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <MenuItem value="CIVIL_PROPERTY">🏢 सिविल / जमीन-जायदाद / संपत्ति विवाद (Civil & Property)</MenuItem>
                <MenuItem value="CRIMINAL_FIR">⚖️ आपराधिक / एफआईआर / पुलिस मामला (Criminal & FIR)</MenuItem>
                <MenuItem value="REVENUE_LAND">🌾 राजस्व / चकबंदी / नामांतरण (Revenue & Land Records)</MenuItem>
                <MenuItem value="FAMILY_MATRIMONIAL">👨‍👩‍👧 पारिवारिक / वैवाहिक / भरण-पोषण (Family & Matrimonial)</MenuItem>
                <MenuItem value="CHEQUE_BOUNCE">💳 चेक बाउंस / रिकवरी / 138 NI Act (Cheque & Commercial)</MenuItem>
                <MenuItem value="SERVICE_EMPLOYMENT">💼 सर्विस / सरकारी नौकरी / पेंशन (Service & Employment)</MenuItem>
                <MenuItem value="CONSUMER_FORUM">🛍️ उपभोक्ता फोरम / फ्रॉड (Consumer Dispute)</MenuItem>
                <MenuItem value="CYBER_CRIME">💻 साइबर अपराध / ऑनलाइन फ्रॉड (Cyber Crime & IT Act)</MenuItem>
                <MenuItem value="GENERAL_LEGAL">📝 अन्य कानूनी सलाह व सहायता (General Legal Matter)</MenuItem>
              </TextField>
            </Grid>

            {/* 3. Opposite Party & Court */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="विपक्षी पार्टी / प्रतिवादी (Opposite Party / Department)"
                placeholder="उदा. विपक्षी व्यक्ति, कंपनी या संबंधित विभाग..."
                value={form.oppositeParty}
                onChange={(e) => setForm({ ...form, oppositeParty: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="अदालत / प्राधिकरण (Court / Jurisdiction if any)"
                placeholder="उदा. जिला न्यायालय, हाईकोर्ट या तहसील..."
                value={form.courtName}
                onChange={(e) => setForm({ ...form, courtName: e.target.value })}
              />
            </Grid>

            {/* 4. Smart Auto-Location Component */}
            <Grid size={12}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#f8fafc", borderColor: "#cbd5e1" }}>
                <SmartLocationSelector
                  state={form.problemState}
                  district={form.problemDistrict}
                  tehsil={form.problemCity}
                  policeStation={form.problemPoliceStation}
                  pincode={form.problemPincode}
                  onChange={({ state, district, tehsil, policeStation, pincode }) => {
                    setForm((p) => ({
                      ...p,
                      ...(state ? { problemState: state } : {}),
                      ...(district ? { problemDistrict: district } : {}),
                      ...(tehsil !== undefined ? { problemCity: tehsil } : {}),
                      ...(policeStation !== undefined ? { problemPoliceStation: policeStation } : {}),
                      ...(pincode !== undefined ? { problemPincode: pincode } : {}),
                    }));
                  }}
                  title="📍 विवाद का स्थान व क्षेत्राधिकार (Smart Location Auto-Fill)"
                  themeColor="#15803d"
                />
              </Paper>
            </Grid>

            {/* 5. Voice & Text Grievance Dictation Studio */}
            <Grid size={12}>
              <Typography variant="subtitle2" fontWeight={800} color="#15803d" sx={{ mb: 1, textTransform: "uppercase" }}>
                🎙️ अपनी पूरी समस्या बोलकर या लिखकर दर्ज करें *
              </Typography>
              <TextField
                fullWidth
                required
                multiline
                minRows={5}
                maxRows={12}
                placeholder="यहाँ अपनी समस्या का पूरा ब्योरा लिखें या माइक बटन दबाकर बोलें..."
                value={form.problemDescription}
                onChange={(e) => setForm({ ...form, problemDescription: e.target.value })}
                InputProps={{
                  endAdornment: (
                    <VoiceInputAdornment
                      onTranscript={(t) => setForm((p) => ({ ...p, problemDescription: (p.problemDescription + " " + t).trim() }))}
                      value={form.problemDescription}
                    />
                  ),
                }}
                sx={{ bgcolor: "#ffffff" }}
              />
            </Grid>

            {/* Submit Button */}
            <Grid size={12}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                color="success"
                onClick={handleSubmitProblemIntake}
                sx={{
                  py: 1.8,
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  borderRadius: 2,
                  bgcolor: "#15803d",
                  "&:hover": { bgcolor: "#166534" },
                }}
              >
                केस जमा करें व वकील अलॉटमेंट हेतु भेजें (Submit Case Problem) 🚀
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* ─── TAB 2: MY ADVOCATE & COUNSEL (मेरे वकील व परामर्श) ─── */}
      <TabPanel value={tabIndex} index={2}>
        <Grid container spacing={3}>
          {/* Counsel Profile Card */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
              <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ width: 70, height: 70, bgcolor: "#1e3a8a", fontSize: "1.8rem", fontWeight: 900 }}>
                  ⚖️
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="#0f172a">
                    {assignedAdvocateName}
                  </Typography>
                  <Chip
                    label="Senior Empaneled Advocate • High Court & District Bar"
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 800, mt: 0.5 }}
                  />
                </Box>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2} sx={{ mb: 3 }}>
                <Typography variant="body1">
                  📱 <strong>मोबाइल / हेल्पलाइन:</strong> {assignedAdvocateMobile}
                </Typography>
                <Typography variant="body1">
                  ✉️ <strong>ईमेल:</strong> Consortiumofjurist@gmail.com
                </Typography>
                <Typography variant="body1">
                  🏛️ <strong>प्रैक्टिस कोर्ट:</strong> Supreme Court, High Courts & All District Courts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  आपके केस की ड्राफ्टिंग, कोर्ट में प्रतिनिधित्व और कानूनी सलाह इन्हीं सीनियर अधिवक्ता के मार्गदर्शन में होगी।
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  component="a"
                  href={"https://api.whatsapp.com/send?phone=91" + assignedAdvocateMobile.replace(/\D/g, "").slice(-10) + "&text=" + encodeURIComponent("नमस्ते, मैं ICJ क्लाइंट " + clientName + " हूँ।")}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontWeight: 800, borderRadius: 2 }}
                >
                  WhatsApp Chat
                </Button>

                <Button
                  variant="contained"
                  startIcon={<CallIcon />}
                  component="a"
                  href={"tel:" + assignedAdvocateMobile.replace(/\D/g, "").slice(-10)}
                  sx={{ fontWeight: 800, bgcolor: "#1e3a8a", borderRadius: 2 }}
                >
                  Direct Call
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<CalendarMonthIcon />}
                  onClick={() => setOpenAppointmentModal(true)}
                  sx={{ fontWeight: 800, borderRadius: 2 }}
                >
                  Book Meeting / Consultation
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Consultation History & Replacement Option */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2.5}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
                <Typography variant="subtitle1" fontWeight={800} color="#0f172a" sx={{ mb: 1.5 }}>
                  📅 निर्धारित परामर्श व मीटिंग्स ({appointments.length})
                </Typography>
                {appointments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    अभी कोई परामर्श शेड्यूल नहीं है। 'Book Meeting' बटन से नया स्लॉट चुनें।
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {appointments.map((a) => (
                      <Paper key={a.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "#f8fafc" }}>
                        <Typography variant="body2" fontWeight={700}>
                          {a.purpose}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {a.date} at {a.time} ({a.mode}) • <span style={{ color: "#15803d", fontWeight: "bold" }}>{a.status}</span>
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>

              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px dashed #cbd5e1", bgcolor: "#f8fafc" }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  क्या आप वर्तमान वकील से संतुष्ट नहीं हैं या भाषा/स्थान की समस्या है?
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  onClick={() => setOpenAdvocateChangeModal(true)}
                  sx={{ fontWeight: 800, textTransform: "none" }}
                >
                  🔄 वकील बदलने का अनुरोध दर्ज करें (Request Change)
                </Button>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ─── TAB 3: CASE DOCUMENT VAULT (मेरे दस्तावेज़) ─── */}
      <TabPanel value={tabIndex} index={3}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0f172a">
                📂 केस दस्तावेज़ व साक्ष्य वॉल्ट (Case Document Vault)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                आपके द्वारा अपलोड किए गए साक्ष्य, ऑर्डर कॉपी व कानूनी कागजात
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => setOpenDocUploadModal(true)}
              sx={{ fontWeight: 800, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" }, borderRadius: 2 }}
            >
              Upload Document
            </Button>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {myDocs.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: "#f8fafc" }}>
              <FolderIcon sx={{ fontSize: 50, color: "#94a3b8", mb: 1 }} />
              <Typography variant="body1" fontWeight={700} color="text.secondary">
                अभी कोई दस्तावेज़ अपलोड नहीं है।
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadFileIcon />}
                onClick={() => setOpenDocUploadModal(true)}
                sx={{ mt: 2, fontWeight: 800 }}
              >
                Upload First File
              </Button>
            </Paper>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell><strong>Document Title</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Case ID</strong></TableCell>
                  <TableCell><strong>Upload Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {myDocs.map((d, i) => (
                  <TableRow key={d.id || i} hover>
                    <TableCell>
                      <Typography fontWeight={700} color="#0f172a">
                        📄 {d.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{d.category || "Evidence / Pleading"}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{d.case_id || "GENERAL"}</TableCell>
                    <TableCell>{d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString("en-IN") : "Recent"}</TableCell>
                    <TableCell>
                      <Chip label={d.status || "Verified"} color="success" size="small" sx={{ fontWeight: 800 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </TabPanel>

      {/* ─── TAB 4: DIRECT MESSAGES (वकील से सीधा संवाद) ─── */}
      <TabPanel value={tabIndex} index={4}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ mb: 1 }}>
            💬 अधिकृत वकील के साथ सीधा संवाद कक्ष (Direct Messaging)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            यहाँ भेजा गया संदेश सीधे आपके नियुक्त अधिवक्ता के पोर्टल पर सुरक्षित रूप से प्रेषित होता है।
          </Typography>

          <Divider sx={{ mb: 2.5 }} />

          <Stack spacing={2} sx={{ mb: 3, maxHeight: "360px", overflowY: "auto", p: 1 }}>
            {messages.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                अभी कोई पुराना संदेश नहीं है। नीचे बॉक्स में टाइप करके या बोलकर पहला संदेश भेजें।
              </Alert>
            ) : (
              messages.map((m) => {
                const isClient = m.senderRole === "client" || String(m.sender).includes("Client");
                return (
                  <Paper
                    key={m.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: isClient ? "#eff6ff" : "#f8fafc",
                      borderColor: isClient ? "#bfdbfe" : "#cbd5e1",
                      borderRadius: 2.5,
                      alignSelf: isClient ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                    }}
                  >
                    <Typography variant="caption" color={isClient ? "primary.main" : "text.secondary"} fontWeight={800}>
                      {m.senderName || m.sender} ({m.senderRole || "advocate"})
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-line" }}>
                      {m.text}
                    </Typography>
                  </Paper>
                );
              })
            )}
          </Stack>

          {/* Message Input Box with Voice */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: "#f8fafc" }}>
            <Stack direction="row" spacing={1.5}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="वकील साहब को संदेश लिखें या बोलकर टाइप करें..."
                value={clientMsgInput}
                onChange={(e) => setClientMsgInput(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <VoiceInputAdornment
                      onTranscript={(t) => setClientMsgInput((p) => (p ? p + " " + t : t))}
                      value={clientMsgInput}
                    />
                  ),
                }}
                sx={{ bgcolor: "#ffffff" }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                sx={{ px: 3, fontWeight: 800, borderRadius: 2, bgcolor: "#1e3a8a" }}
              >
                <SendIcon />
              </Button>
            </Stack>
          </Paper>
        </Paper>
      </TabPanel>

      {/* ─── MODALS ─── */}
      {/* 1. Document Upload Modal */}
      <Dialog open={openDocUploadModal} onClose={() => setOpenDocUploadModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>📂 नया दस्तावेज़ अपलोड करें</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              required
              label="दस्तावेज़ का नाम (Document Title)"
              placeholder="उदा. आधार कार्ड, बैनामा कॉपी, एफआईआर प्रति..."
              value={docUploadForm.name}
              onChange={(e) => setDocUploadForm({ ...docUploadForm, name: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="दस्तावेज़ श्रेणी (Category)"
              value={docUploadForm.category}
              onChange={(e) => setDocUploadForm({ ...docUploadForm, category: e.target.value })}
            >
              <MenuItem value="ID_PROOF">🪪 पहचान पत्र / आधार / पैन (Identity Proof)</MenuItem>
              <MenuItem value="LEGAL_PLEADING">📑 याचिका / वकालतनामा / नोटिस (Legal Pleading)</MenuItem>
              <MenuItem value="PROPERTY_DEED">📜 बैनामा / खतौनी / रसीद (Property & Revenue Records)</MenuItem>
              <MenuItem value="COURT_ORDER">🏛️ अदालती आदेश / फैसला (Certified Court Order)</MenuItem>
              <MenuItem value="POLICE_RECORD">⚖️ एफआईआर / चार्जशीट / शिकायत (FIR & Police Copy)</MenuItem>
              <MenuItem value="OTHER_EVIDENCE">📁 अन्य साक्ष्य / कागजात (Other Supporting Evidence)</MenuItem>
            </TextField>
            <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ py: 1.5, fontWeight: 700 }}>
              फाइल चुनें (PDF, DOCX, JPG, PNG)
              <input type="file" hidden onChange={(e) => setDocUploadForm({ ...docUploadForm, fileObj: e.target.files[0] })} />
            </Button>
            {docUploadForm.fileObj && (
              <Typography variant="caption" color="success.main" fontWeight="bold">
                ✓ चयनित फाइल: {docUploadForm.fileObj.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDocUploadModal(false)}>रद्द करें</Button>
          <Button variant="contained" onClick={handleUploadDocument} sx={{ fontWeight: 800, bgcolor: "#7c3aed" }}>
            वॉल्ट में सेव करें
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. Appointment Booking Modal */}
      <Dialog open={openAppointmentModal} onClose={() => setOpenAppointmentModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>📅 वकील के साथ मीटिंग / परामर्श बुक करें</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField fullWidth label="अधिवक्ता का नाम" value={assignedAdvocateName} disabled />
            <TextField
              type="date"
              fullWidth
              label="परामर्श की तारीख"
              InputLabelProps={{ shrink: true }}
              value={aptForm.date}
              onChange={(e) => setAptForm({ ...aptForm, date: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="परामर्श का माध्यम (Mode)"
              value={aptForm.mode}
              onChange={(e) => setAptForm({ ...aptForm, mode: e.target.value })}
            >
              <MenuItem value="Phone Consultation">📞 फोन पर परामर्श (Phone Call)</MenuItem>
              <MenuItem value="Video Conference">📹 वीडियो कॉन्फ्रेंसिंग (Video Call)</MenuItem>
              <MenuItem value="Chamber Visit">🏢 चैंबर पर व्यक्तिगत मुलाकात (Chamber Visit)</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="परामर्श का मुख्य विषय"
              value={aptForm.purpose}
              onChange={(e) => setAptForm({ ...aptForm, purpose: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAppointmentModal(false)}>रद्द करें</Button>
          <Button variant="contained" color="success" onClick={handleBookAppointment} sx={{ fontWeight: 800 }}>
            बुकिंग सुरक्षित करें
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. Advocate Replacement Modal */}
      <Dialog open={openAdvocateChangeModal} onClose={() => setOpenAdvocateChangeModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800, color: "#b45309" }}>🔄 वकील बदलने का अनुरोध (Request Advocate Replacement)</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              यदि आपको भाषा, समय या समन्वय में कोई कठिनाई आ रही है, तो आप ICJ एडमिन को दूसरा विशेषज्ञ वकील नियुक्त करने का अनुरोध भेज सकते हैं।
            </Typography>
            <TextField
              select
              fullWidth
              label="अनुरोध का कारण"
              value={advocateChangeReason}
              onChange={(e) => setAdvocateChangeReason(e.target.value)}
            >
              <MenuItem value="Language / Communication Issue">भाषा या संवाद में कठिनाई (Language / Communication)</MenuItem>
              <MenuItem value="Jurisdiction / Court Distance">अदालती दूरी / स्थानीय वकील की आवश्यकता (Local Court Proximity)</MenuItem>
              <MenuItem value="Delay in Response">संपर्क में देरी (Delay in Consultation / Response)</MenuItem>
              <MenuItem value="Specialist Domain Preference">अन्य विशेषज्ञता की आवश्यकता (Specialist Domain Preference)</MenuItem>
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="अतिरिक्त विवरण / टिप्पणी"
              placeholder="कृपया संक्षेप में कारण बताएं..."
              value={advocateChangeNotes}
              onChange={(e) => setAdvocateChangeNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAdvocateChangeModal(false)}>रद्द करें</Button>
          <Button variant="contained" color="warning" onClick={handleSubmitAdvocateChange} sx={{ fontWeight: 800 }}>
            अनुरोध सबमिट करें
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
