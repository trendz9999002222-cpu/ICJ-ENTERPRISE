import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Stack,
  Divider,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";

// Icons
import GavelIcon from "@mui/icons-material/Gavel";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChatIcon from "@mui/icons-material/Chat";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import BadgeIcon from "@mui/icons-material/Badge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import LegalEcosystemService from "../services/legalEcosystemService.js";
import ActivityService from "../services/activityService.js";
import AiLegalConsultationService from "../services/aiLegalConsultationService.js";
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

const ADVOCATE_TABS = {
  ACTIVE_CASES: "ACTIVE_CASES",
  CLIENT_VOICE_INTAKE: "CLIENT_VOICE_INTAKE",
  ADVOCATE_PROFILE: "ADVOCATE_PROFILE",
  APPOINTMENTS: "APPOINTMENTS",
  COMMUNICATION: "COMMUNICATION",
  TASKS: "TASKS",
  CLIENT_LIST: "CLIENT_LIST",
  ACTIVE_CLIENTS: "ACTIVE_CLIENTS",
  EMPANELED_ADVOCATES: "EMPANELED_ADVOCATES",
};

export default function AdvocateDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(ADVOCATE_TABS.CLIENT_VOICE_INTAKE);
  const [cases, setCases] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [aiConsultations, setAiConsultations] = useState([]);
  const [search, setSearch] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  // Appointments state
  const [appointments, setAppointments] = useState([
    { id: "apt-1", clientName: "Green Earth Trust", advocateName: "Adv. Rajesh Sharma", date: "2026-08-12", time: "11:00 AM", mode: "Video Conference", status: "Approved", link: "https://meet.icj.org/room-legal-101" },
    { id: "apt-2", clientName: "Apex Technovations", advocateName: "Adv. Meera Sen", date: "2026-08-15", time: "02:30 PM", mode: "In-Person Chamber", status: "Pending", link: "" },
  ]);

  // Messages state
  const [messages, setMessages] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem("icj_client_messages") || "[]");
      return Array.isArray(local) && local.length > 0 ? local : [
        { id: "msg-1", sender: "Green Earth Trust", recipient: "Adv. Rajesh Sharma", text: "Please review the updated environmental audit report before the next hearing.", timestamp: new Date().toLocaleTimeString("en-IN") },
      ];
    } catch {
      return [];
    }
  });
  const [newMessageText, setNewMessageText] = useState("");

  // Tasks state
  const [tasks] = useState([
    { id: "t1", title: "Review Rejoinder for WP/2026/1042", status: "In Progress", dueDate: "Today" },
    { id: "t2", title: "Verify Bar Association Enrollment Certificate", status: "Completed", dueDate: "Today" },
    { id: "t3", title: "Prepare Cause List for Court Hall 3", status: "Pending", dueDate: "Tomorrow" },
  ]);

  useEffect(() => {
    let isMounted = true;
    async function loadRepo() {
      const allCases = LegalEcosystemService.getCases();
      const allAdvocates = LegalEcosystemService.getAdvocates();
      const allConsultations = AiLegalConsultationService.getConsultationsForAdvocate ? AiLegalConsultationService.getConsultationsForAdvocate("26ICJ08AA0001") : [];
      if (isMounted) {
        setCases(Array.isArray(allCases) ? allCases : []);
        setAdvocates(Array.isArray(allAdvocates) ? allAdvocates : []);
        setAiConsultations(Array.isArray(allConsultations) ? allConsultations : []);
      }
    }
    loadRepo();
    return () => {
      isMounted = false;
    };
  }, []);

  // Clients derived from Cases data provenance
  const clients = useMemo(() => {
    const map = new Map();
    cases.forEach((c, idx) => {
      if (c.clientName && !map.has(c.clientName)) {
        map.set(c.clientName, {
          id: `CL-REC-${idx + 101}`,
          name: c.clientName,
          type: c.courtName?.includes("High Court") ? "NGO / Trust" : "Corporate",
          status: "Active",
          mobile: "+91 98201 12345",
          email: `${c.clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}@client.icj.org`,
          region: c.courtName || "High Court Jurisdiction",
        });
      }
    });
    return Array.from(map.values());
  }, [cases]);

  // Multi-field search engine
  const filteredCases = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cases;
    return cases.filter((c) =>
      [c.id, c.caseNumber, c.title, c.clientName, c.advocateName, c.courtName, c.status]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [cases, search]);

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;
    const nextMsg = {
      id: `msg-${Date.now()}`,
      sender: "Adv. Rajesh Sharma (Empaneled Counsel)",
      recipient: "Client Portal",
      text: newMessageText,
      timestamp: new Date().toLocaleTimeString("en-IN"),
    };
    setMessages((prev) => [...prev, nextMsg]);
    ActivityService.create({ title: `Communication Note Sent: "${newMessageText.substring(0, 30)}..."`, type: "legal" });
    setNewMessageText("");
    setAlertMsg("Internal Message & Notification dispatched across Email/SMS/WhatsApp queues!");
    setTimeout(() => setAlertMsg(""), 3500);
  };

  const handleApproveAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Approved", link: `https://meet.icj.org/room-${id}` } : a))
    );
    ActivityService.create({ title: `Appointment Approved for ID ${id}`, type: "legal" });
    setAlertMsg("Appointment Approved and Video Meeting Link generated!");
    setTimeout(() => setAlertMsg(""), 3500);
  };

  // Real-time Dashboard Cards derived from System Repositories
  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === "Active").length;
    const totalAdvocates = advocates.length;
    const activeCasesCount = cases.length;
    const appointmentsCount = appointments.length;
    const pendingTasksCount = tasks.filter((t) => t.status !== "Completed").length;

    return { totalClients, activeClients, totalAdvocates, activeCasesCount, appointmentsCount, pendingTasksCount };
  }, [clients, advocates, cases, appointments, tasks]);

  const cards = [
    { title: "Total Clients", value: stats.totalClients, color: "#1976d2", icon: <PersonIcon />, targetTab: ADVOCATE_TABS.CLIENT_LIST },
    { title: "Active Clients", value: stats.activeClients, color: "#2e7d32", icon: <CheckCircleIcon />, targetTab: ADVOCATE_TABS.ACTIVE_CLIENTS },
    { title: "Empaneled Advocates", value: stats.totalAdvocates, color: "#9c27b0", icon: <BadgeIcon />, targetTab: ADVOCATE_TABS.EMPANELED_ADVOCATES },
    { title: "Active Cases", value: stats.activeCasesCount, color: "#ed6c02", icon: <GavelIcon />, targetTab: ADVOCATE_TABS.ACTIVE_CASES },
    { title: "Appointments", value: stats.appointmentsCount, color: "#0288d1", icon: <CalendarMonthIcon />, targetTab: ADVOCATE_TABS.APPOINTMENTS },
    { title: "Pending Tasks", value: stats.pendingTasksCount, color: "#d32f2f", icon: <AssignmentIcon />, targetTab: ADVOCATE_TABS.TASKS },
  ];

  const activeClientsList = useMemo(() => clients.filter((c) => c.status === "Active"), [clients]);
  const pendingTasksList = useMemo(() => tasks.filter((t) => t.status !== "Completed"), [tasks]);

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <GavelIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Enterprise Professional Command Centre
              </Typography>
              <Typography color="text.secondary">
                Legal Counsel Management, Client Appointments, Communication Queues & Case Calendar
              </Typography>
            </Box>
          </Stack>

          <TextField
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Professional, Client, Case, Mobile, Email, Enrollment..."
            sx={{ width: 380 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
            }}
          />
        </Stack>

        {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}

        {/* Real-time Dashboard Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {cards.map((item) => (
            <Grid item xs={12} sm={6} md={2} key={item.title}>
              <Paper
                variant="outlined"
                onClick={() => setActiveTab(item.targetTab)}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderLeft: `4px solid ${item.color}`,
                  cursor: "pointer",
                  transition: "0.2s",
                  bgcolor: activeTab === item.targetTab ? "action.selected" : "background.paper",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                }}
              >
                <Box sx={{ color: item.color }}>{item.icon}</Box>
                <Box>
                  <Typography color="text.secondary" variant="caption" fontWeight="bold" display="block">
                    {item.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {item.value}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Tabs for Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab icon={<GavelIcon />} iconPosition="start" label="Active Cases" value={ADVOCATE_TABS.ACTIVE_CASES} />
            <Tab icon={<MicIcon />} iconPosition="start" label="🎙️ Client Voice Intake & AI Pleading Desk" value={ADVOCATE_TABS.CLIENT_VOICE_INTAKE} />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Advocate Profile" value={ADVOCATE_TABS.ADVOCATE_PROFILE} />
            <Tab icon={<CalendarMonthIcon />} iconPosition="start" label="Appointments & Video Links" value={ADVOCATE_TABS.APPOINTMENTS} />
            <Tab icon={<ChatIcon />} iconPosition="start" label="Communication Engine" value={ADVOCATE_TABS.COMMUNICATION} />
            <Tab icon={<AssignmentIcon />} iconPosition="start" label="Pending Tasks" value={ADVOCATE_TABS.TASKS} />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Total Client Directory" value={ADVOCATE_TABS.CLIENT_LIST} />
            <Tab icon={<CheckCircleIcon />} iconPosition="start" label="Active Clients List" value={ADVOCATE_TABS.ACTIVE_CLIENTS} />
            <Tab icon={<BadgeIcon />} iconPosition="start" label="Empaneled Advocate Roster" value={ADVOCATE_TABS.EMPANELED_ADVOCATES} />
          </Tabs>
        </Box>

        {/* TAB: ACTIVE CASES */}
        <TabPanel value={activeTab} index={ADVOCATE_TABS.ACTIVE_CASES}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Assigned Legal Case Registry ({filteredCases.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>S.No.</strong></TableCell>
                  <TableCell><strong>Case Number</strong></TableCell>
                  <TableCell><strong>Title</strong></TableCell>
                  <TableCell><strong>Client Name</strong></TableCell>
                  <TableCell><strong>Court</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Next Hearing</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCases.map((c, idx) => (
                  <TableRow key={c.id} hover>
                    <TableCell><Typography variant="body2" color="text.secondary">{idx + 1}</Typography></TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{c.caseNumber}</TableCell>
                    <TableCell>{c.title}</TableCell>
                    <TableCell>{c.clientName}</TableCell>
                    <TableCell>{c.courtName}</TableCell>
                    <TableCell>
                      <Chip label={c.status} size="small" color={c.status === "In Hearing" ? "success" : "warning"} />
                    </TableCell>
                    <TableCell>{c.nextHearing}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>

        {/* TAB: CLIENT VOICE INTAKE & AI PLEADING DESK */}
        <TabPanel value={activeTab} index={ADVOCATE_TABS.CLIENT_VOICE_INTAKE}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#fff" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={2}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  🎙️ Client Spoken Voice Notes &amp; AI Pleading Console
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  क्लाइंट द्वारा रिकॉर्ड की गई सभी वास्तविक ऑडियो फ़ाइलें सुनें, लाइव टाइप हुआ टेक्स्ट देखें और 1-क्लिक में विधिक ड्राफ्ट अप्रूव करें।
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<MicIcon />}
                onClick={() => {
                  const consultations = JSON.parse(localStorage.getItem("icj_ai_legal_consultations") || "[]");
                  setAiConsultations(consultations);
                  setAlertMsg("🟢 Synced Real-Time Client Voice Notes & Consultations Repository!");
                  setTimeout(() => setAlertMsg(""), 3500);
                }}
                sx={{ fontWeight: "bold" }}
              >
                🔄 Sync Live Client Audio Session
              </Button>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            {(() => {
              const realAudioMessages = messages.filter((m) => m.audioUrl);
              const realConsultations = (() => {
                try { return JSON.parse(localStorage.getItem("icj_ai_legal_consultations") || "[]"); } catch { return []; }
              })();
              const activeConsultation = (realConsultations && realConsultations.length > 0) ? realConsultations[0] : {
                consultationId: "INTAKE-2026-LIVE",
                clientName: "Pooja Verma (Client)",
                caseCategory: "Property & Land Dispute",
                problemText: "पड़ोसी ने हमारी कृषि भूमि की सीमा (मेड़) को गलत तरीके से काट दिया है और कब्जा करने की धमकी दी है। हमने स्थानीय राजस्व अधिकारी को शिकायत दी थी। अतः हमें उप-जिलाधिकारी (SDM) राजस्व न्यायालय में सीमांकन याचिका (Section 24) और सिविल स्टे (Order 39 CPC) की आवश्यकता है।",
                diagnosis: {
                  legalStand: "आपकी स्थिति: संपत्ति व राजस्व विवाद (Civil & Revenue Jurisdiction)। आपके पास भूमि की खतौनी 2026 व रजिस्ट्री का मजबूत विधिक पक्ष है।",
                  sectionsApplicable: ["Land Revenue Code Sec 24", "Specific Relief Act Sec 38", "CPC Order 39 Rule 1 & 2"],
                },
              };

              return (
                <Grid container spacing={3}>
                  {/* Left Column: Real-Time Incoming Client Audio Files & Spoken Transcript */}
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "#f8fafc" }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="#0f172a" mb={1.5}>
                        📁 Incoming Client Audio Files &amp; Multi-Page Spoken Transcript
                      </Typography>

                      <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, border: "1px solid #e2e8f0", mb: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary">
                            Client: {activeConsultation?.clientName || "Pooja Verma (Client)"}
                          </Typography>
                          <Chip label={activeConsultation?.caseCategory || "Active Legal Intake"} size="small" color="secondary" variant="outlined" />
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                          Assigned Counsel: <strong>{user?.name || "Adv. Rohan Kumar Sharma"}</strong> • ID: {activeConsultation?.consultationId || "INTAKE-2026-LIVE"}
                        </Typography>

                        <Typography variant="caption" fontWeight="bold" color="#166534" display="block" mb={1}>
                          🎧 Real-Time Recorded Voice Files (माइक्रोफोन द्वारा रिकॉर्ड की गई असली आवाज़):
                        </Typography>

                        {realAudioMessages.length > 0 ? (
                          <Stack spacing={1} mb={2}>
                            {realAudioMessages.map((m, idx) => (
                              <Paper key={m.id || idx} variant="outlined" sx={{ p: 1.5, bgcolor: "#f0fdf4", borderColor: "#86efac", borderRadius: 2 }}>
                                <Typography variant="caption" fontWeight="bold" color="#0f172a" display="block">
                                  🎙️ {m.text} ({m.timestamp})
                                </Typography>
                                <audio controls src={m.audioUrl} style={{ width: "100%", height: 38, marginTop: 6 }} />
                              </Paper>
                            ))}
                          </Stack>
                        ) : (
                          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#fffbe6", borderColor: "#ffe58f", borderRadius: 2, textAlign: "center" }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="#b78103" gutterBottom>
                              🎙️ अभी तक इस सेशन में कोई नई माइक रिकॉर्डिंग प्राप्त नहीं हुई है
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                              अपनी खुद की वास्तविक आवाज़ बोलने, सुनने और टाइपिंग जाँचने के लिए क्लाइंट पोर्टल पर जाएं:
                            </Typography>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<MicIcon />}
                              onClick={() => (window.location.href = "/client-portal")}
                              sx={{ fontWeight: "bold" }}
                            >
                              🎙️ क्लाइंट पोर्टल पर अपनी असली आवाज़ रिकॉर्ड करें
                            </Button>
                          </Paper>
                        )}

                        <Typography variant="caption" fontWeight="bold" color="#1e3a8a" display="block" mb={0.5}>
                          📝 Client Verbatim Spoken Transcript (ऑटो-टाइप हुआ पूरा असली टेक्स्ट):
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={6}
                          placeholder="क्लाइंट पोर्टल पर आप जो भी बोलेंगे, वह पूरा टेक्स्ट यहाँ रियल-टाइम में स्वतः दिखेगा..."
                          value={activeConsultation?.problemText || ""}
                          onChange={(e) => {
                            if (activeConsultation) {
                              const updated = { ...activeConsultation, problemText: e.target.value };
                              localStorage.setItem("icj_ai_legal_consultations", JSON.stringify([updated]));
                              setAiConsultations([updated]);
                            }
                          }}
                          sx={{ bgcolor: "#fff", "& .MuiInputBase-input": { fontSize: "0.9rem", color: "#0f172a", lineHeight: 1.6 } }}
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Right Column: Dynamic AI Court Pleading & Advocate Signing */}
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "#faf5ff", borderColor: "#d8b4fe" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography variant="subtitle1" fontWeight="bold" color="#6b21a8" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <AutoAwesomeIcon /> AI Auto-Pleading &amp; Advocate Approval Console
                        </Typography>
                        <Chip label="BNS / CPC Section Mapped" color="purple" size="small" />
                      </Stack>

                      <Alert severity="info" sx={{ mb: 2, fontSize: "0.8rem" }}>
                        {activeConsultation?.diagnosis?.legalStand || "यह ड्राफ्ट क्लाइंट के स्पोकन ऑडियो के आधार पर तैयार किया गया है。"}
                      </Alert>

                      <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>
                        🏛️ Formatted Advocate Court Pleading (स्वीकृति हेतु विधिक ड्राफ्ट):
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={8}
                        value={`IN THE REVENUE / CIVIL COURT OF JUDICATURE
MATTER REFERENCE: ${activeConsultation?.consultationId || "INTAKE-2026"}

IN THE MATTER OF:
${activeConsultation?.clientName || "Pooja Verma (Client)"} ...PETITIONER
VERSUS
Opposite Party & Ors. ...RESPONDENTS

PETITION UNDER ${activeConsultation?.diagnosis?.sectionsApplicable ? activeConsultation.diagnosis.sectionsApplicable.join(", ") : "SECTION 24 LAND REVENUE CODE & ORDER 39 CPC"}

STATEMENT OF FACTS (BASED ON CLIENT SPOKEN AUDIO):
${activeConsultation?.problemText || "Client Spoken Statement"}

PRAYER:
Grant immediate relief, stay, and boundary demarcation as prayed for.`}
                        onChange={() => {}}
                        sx={{ mb: 2, bgcolor: "#fff" }}
                      />

                      <Stack direction="row" spacing={1.5}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => {
                            ActivityService.create({ title: `Advocate Approved & Signed Client Pleading ${activeConsultation?.consultationId || "INTAKE-2026"}`, type: "legal" });
                            setAlertMsg("🟢 Client Spoken Voice Note & AI Pleading approved and signed by Senior Counsel!");
                            setTimeout(() => setAlertMsg(""), 3500);
                          }}
                          sx={{ fontWeight: "bold" }}
                        >
                          🟢 APPROVE & SIGN PLEADING (स्वीकृत व हस्ताक्षरित)
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              );
            })()}
          </Paper>
        </TabPanel>

        {/* TAB: ADVOCATE PROFILE */}
        <TabPanel value={activeTab} index={ADVOCATE_TABS.ADVOCATE_PROFILE}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Empaneled Advocate Credentials & Profile
            </Typography>
            <Grid container spacing={2.5} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Empaneled Advocate Name" value="Adv. Rajesh Sharma" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Bar Council Enrollment No." value="MAH/12345/2012" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Bar Council Authority" value="Bar Council of Maharashtra & Goa" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Practice Specialization" value="Constitutional & Public Interest Law" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Legal Experience" value="14 Years Professional Standing" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Verification Status" value="🟢 Empaneled & Verified Senior Counsel" disabled />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Chamber & Office Address" value="Chamber No. 402, Lawyers Chambers Block, High Court Complex" disabled />
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* TAB: APPOINTMENTS */}
        <TabPanel value={activeTab} index={ADVOCATE_TABS.APPOINTMENTS}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Client Appointment Management & Video Links ({appointments.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>S.No.</strong></TableCell>
                  <TableCell><strong>Client Name</strong></TableCell>
                  <TableCell><strong>Date & Time</strong></TableCell>
                  <TableCell><strong>Meeting Mode</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Video Link / Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((a, idx) => (
                  <TableRow key={a.id}>
                    <TableCell><Typography variant="body2" color="text.secondary">{idx + 1}</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">{a.clientName}</Typography></TableCell>
                    <TableCell>{a.date} at {a.time}</TableCell>
                    <TableCell><Chip label={a.mode} variant="outlined" color="primary" size="small" /></TableCell>
                    <TableCell><Chip label={a.status} color={a.status === "Approved" ? "success" : "warning"} size="small" /></TableCell>
                    <TableCell>
                      {a.status === "Approved" ? (
                        <Button size="small" variant="contained" color="success" startIcon={<VideoCallIcon />} href={a.link} target="_blank">
                          Join Video Call
                        </Button>
                      ) : (
                        <Button size="small" variant="contained" color="primary" onClick={() => handleApproveAppointment(a.id)}>
                          Approve Appointment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>

        {/* TAB: COMMUNICATION ENGINE */}
        <TabPanel value={activeTab} index={ADVOCATE_TABS.COMMUNICATION}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Internal Communication Engine & Message Queues
            </Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              {messages.map((m) => (
                <Paper key={m.id} variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
                  <Typography variant="caption" color="primary" fontWeight="bold">{m.sender} • {m.timestamp}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{m.text}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip label="Email Queue: Sent" size="small" color="success" variant="outlined" />
                    <Chip label="SMS Queue: Sent" size="small" color="success" variant="outlined" />
                    <Chip label="WhatsApp Queue: Delivered" size="small" color="success" variant="outlined" />
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField fullWidth placeholder="Type internal note or message to client..." value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)} />
              <Button variant="contained" startIcon={<SendIcon />} onClick={handleSendMessage}>
                Dispatch
              </Button>
            </Stack>
          </Paper>
        </TabPanel>

        {/* TAB: TASKS */}
        <TabPanel value={activeTab} index={ADVOCATE_TABS.TASKS}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Pending Task List & Hearing Deadlines ({pendingTasksList.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>S.No.</strong></TableCell>
                  <TableCell><strong>Task Description</strong></TableCell>
                  <TableCell><strong>Due Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingTasksList.map((t, idx) => (
                  <TableRow key={t.id}>
                    <TableCell><Typography variant="body2" color="text.secondary">{idx + 1}</Typography></TableCell>
                    <TableCell>{t.title}</TableCell>
                    <TableCell>{t.dueDate}</TableCell>
                    <TableCell><Chip label={t.status} color="warning" size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>

        {/* TAB: CLIENT LIST */}
        <TabPanel value={activeTab} index={ADVOCATE_TABS.CLIENT_LIST}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Master Client Registry ({clients.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {clients.length === 0 ? (
              <Typography color="text.secondary">No registered clients found in case repository.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>S.No.</strong></TableCell>
                    <TableCell><strong>Client ID</strong></TableCell>
                    <TableCell><strong>Client Name</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Region / Court</strong></TableCell>
                    <TableCell><strong>Mobile / Email</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((c, idx) => (
                    <TableRow key={c.id} hover>
                      <TableCell><Typography variant="body2" color="text.secondary">{idx + 1}</Typography></TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{c.id}</TableCell>
                      <TableCell><Typography fontWeight="bold">{c.name}</Typography></TableCell>
                      <TableCell>{c.type}</TableCell>
                      <TableCell>{c.region}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{c.mobile}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={c.status} size="small" color={c.status === "Active" ? "success" : "warning"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </TabPanel>

        {/* TAB: ACTIVE CLIENTS */}
        <TabPanel value={activeTab} index={ADVOCATE_TABS.ACTIVE_CLIENTS}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Active Client Roster ({activeClientsList.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {activeClientsList.length === 0 ? (
              <Typography color="text.secondary">No active clients found.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>S.No.</strong></TableCell>
                    <TableCell><strong>Client ID</strong></TableCell>
                    <TableCell><strong>Client Name</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Region</strong></TableCell>
                    <TableCell><strong>Contact</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeClientsList.map((c, idx) => (
                    <TableRow key={c.id} hover>
                      <TableCell><Typography variant="body2" color="text.secondary">{idx + 1}</Typography></TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{c.id}</TableCell>
                      <TableCell><Typography fontWeight="bold">{c.name}</Typography></TableCell>
                      <TableCell>{c.type}</TableCell>
                      <TableCell>{c.region}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell><Chip label="Active" size="small" color="success" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </TabPanel>

        {/* TAB: EMPANELED ADVOCATES */}
        <TabPanel value={activeTab} index={ADVOCATE_TABS.EMPANELED_ADVOCATES}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Empaneled Advocate Roster ({advocates.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>S.No.</strong></TableCell>
                  <TableCell><strong>Enrollment / Bar ID</strong></TableCell>
                  <TableCell><strong>Advocate Name</strong></TableCell>
                  <TableCell><strong>Specialization</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {advocates.map((a, idx) => (
                  <TableRow key={a.id || idx} hover>
                    <TableCell><Typography variant="body2" color="text.secondary">{idx + 1}</Typography></TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{a.barId || a.id}</TableCell>
                    <TableCell><Typography fontWeight="bold">{a.name}</Typography></TableCell>
                    <TableCell>{a.specialization || "General Practice"}</TableCell>
                    <TableCell><Chip label={a.status || "Active"} size="small" color="success" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>
      </Box>
    </MainLayout>
  );
}
