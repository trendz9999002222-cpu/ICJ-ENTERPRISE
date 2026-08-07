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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
} from "@mui/material";

// Icons
import GavelIcon from "@mui/icons-material/Gavel";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChatIcon from "@mui/icons-material/Chat";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import BadgeIcon from "@mui/icons-material/Badge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";

import LegalEcosystemService from "../services/legalEcosystemService";
import ActivityService from "../services/activityService";
import MainLayout from "../layouts/MainLayout";

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
  ADVOCATE_PROFILE: "ADVOCATE_PROFILE",
  APPOINTMENTS: "APPOINTMENTS",
  COMMUNICATION: "COMMUNICATION",
  TASKS: "TASKS",
  CLIENT_LIST: "CLIENT_LIST",
  ACTIVE_CLIENTS: "ACTIVE_CLIENTS",
  EMPANELED_ADVOCATES: "EMPANELED_ADVOCATES",
};

export default function AdvocateDashboard() {
  const [activeTab, setActiveTab] = useState(ADVOCATE_TABS.ACTIVE_CASES);
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [search, setSearch] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  // 18 Total Clients (15 Active, 3 Pending/Inactive)
  const [clients] = useState([
    { id: "cl-1", name: "Green Earth Trust", type: "NGO / Trust", status: "Active", mobile: "+91 9876543210", email: "contact@greenearth.org", region: "Mumbai" },
    { id: "cl-2", name: "Apex Technovations Ltd", type: "Corporate", status: "Active", mobile: "+91 9876543211", email: "legal@apextech.com", region: "Bengaluru" },
    { id: "cl-3", name: "Dr. Arvind Swamy", type: "Individual Practitioner", status: "Active", mobile: "+91 9876543212", email: "arvind.swamy@gmail.com", region: "Delhi NCR" },
    { id: "cl-4", name: "Himalaya Legal Consortium", type: "Law Firm", status: "Active", mobile: "+91 9876543213", email: "info@himalayalaw.in", region: "Shimla" },
    { id: "cl-5", name: "Vanguard Global Infra", type: "Enterprise", status: "Active", mobile: "+91 9876543214", email: "legal@vanguard.com", region: "Hyderabad" },
    { id: "cl-6", name: "Savitri Public Charitable Trust", type: "NGO", status: "Active", mobile: "+91 9876543215", email: "trust@savitri.org", region: "Pune" },
    { id: "cl-7", name: "Kaveri Maritime Logistics", type: "Corporate", status: "Active", mobile: "+91 9876543216", email: "ops@kaverimaritime.com", region: "Chennai" },
    { id: "cl-8", name: "Metro Bio-Pharma Solutions", type: "Corporate", status: "Active", mobile: "+91 9876543217", email: "compliance@metrobiopharma.in", region: "Ahmedabad" },
    { id: "cl-9", name: "Prof. Sunita Deshmukh", type: "Academic Scholar", status: "Active", mobile: "+91 9876543218", email: "sunita.d@nlsiu.ac.in", region: "Bengaluru" },
    { id: "cl-10", name: "National Farmers Welfare Forum", type: "NGO", status: "Active", mobile: "+91 9876543219", email: "help@farmersforum.org", region: "Chandigarh" },
    { id: "cl-11", name: "Surya Renewable Energies", type: "Corporate", status: "Active", mobile: "+91 9876543220", email: "legal@suryarenew.com", region: "Jaipur" },
    { id: "cl-12", name: "Justice Outreach Society", type: "Society", status: "Active", mobile: "+91 9876543221", email: "desk@justiceoutreach.in", region: "Kolkata" },
    { id: "cl-13", name: "Bharatiya Human Rights Legal Cell", type: "NGO", status: "Active", mobile: "+91 9876543222", email: "rights@bhrlc.org", region: "New Delhi" },
    { id: "cl-14", name: "Oceanic Trade Lines", type: "Corporate", status: "Active", mobile: "+91 9876543223", email: "legal@oceanictrade.com", region: "Kochi" },
    { id: "cl-15", name: "Vidarbha Legal Aid Society", type: "Society", status: "Active", mobile: "+91 9876543224", email: "aid@vidarbhalegal.org", region: "Nagpur" },
    { id: "cl-16", name: "Trident Power Corp", type: "Corporate", status: "Pending Verification", mobile: "+91 9876543225", email: "info@tridentpower.in", region: "Lucknow" },
    { id: "cl-17", name: "Shree Krishna Educational Trust", type: "Trust", status: "Pending Verification", mobile: "+91 9876543226", email: "admin@sket.edu.in", region: "Indore" },
    { id: "cl-18", name: "Zenith Cyber Security Advisory", type: "Consultancy", status: "Pending Verification", mobile: "+91 9876543227", email: "contact@zenithcyber.com", region: "Noida" },
  ]);

  // 12 Empaneled Advocates
  const [advocates] = useState([
    { id: "adv-1", name: "Adv. Rajesh Sharma", enrollment: "MAH/12345/2012", barAuthority: "Bar Council of Maharashtra & Goa", spec: "Constitutional & Public Interest", exp: "14 Years", status: "Empaneled Counsel" },
    { id: "adv-2", name: "Adv. Meera Sen", enrollment: "D/9876/2015", barAuthority: "Bar Council of Delhi", spec: "Corporate & Cyber Law", exp: "11 Years", status: "Empaneled Counsel" },
    { id: "adv-3", name: "Adv. Ananya Iyer", enrollment: "KAR/4321/2014", barAuthority: "Bar Council of Karnataka", spec: "Environmental & Land Revenue", exp: "12 Years", status: "Empaneled Counsel" },
    { id: "adv-4", name: "Adv. Vikramjit Singh", enrollment: "PH/5678/2010", barAuthority: "Bar Council of Punjab & Haryana", spec: "Criminal & Appellate Writs", exp: "16 Years", status: "Empaneled Counsel" },
    { id: "adv-5", name: "Adv. Priya Nair", enrollment: "KER/1122/2016", barAuthority: "Bar Council of Kerala", spec: "Maritime & International Arbitration", exp: "10 Years", status: "Empaneled Counsel" },
    { id: "adv-6", name: "Adv. Rameshwar Varma", enrollment: "UP/8899/2008", barAuthority: "Bar Council of Uttar Pradesh", spec: "Civil Suits & Revenue Disputes", exp: "18 Years", status: "Empaneled Counsel" },
    { id: "adv-7", name: "Adv. Kavita Deshmukh", enrollment: "MAH/3344/2013", barAuthority: "Bar Council of Maharashtra & Goa", spec: "Banking & Insolvency (IBC)", exp: "13 Years", status: "Empaneled Counsel" },
    { id: "adv-8", name: "Adv. Suresh H. Patel", enrollment: "GJ/7766/2011", barAuthority: "Bar Council of Gujarat", spec: "Taxation & Constitutional Appeals", exp: "15 Years", status: "Empaneled Counsel" },
    { id: "adv-9", name: "Adv. Tariq Ahmad Khan", enrollment: "JK/5544/2017", barAuthority: "Bar Council of J&K", spec: "Public Law & Human Rights", exp: "9 Years", status: "Empaneled Counsel" },
    { id: "adv-10", name: "Adv. Deepa Sundaram", enrollment: "TN/9900/2014", barAuthority: "Bar Council of Tamil Nadu", spec: "Intellectual Property & Patent Law", exp: "12 Years", status: "Empaneled Counsel" },
    { id: "adv-11", name: "Adv. Alok Kumar Roy", enrollment: "WB/2233/2009", barAuthority: "Bar Council of West Bengal", spec: "Labor & Industrial Relations", exp: "17 Years", status: "Empaneled Counsel" },
    { id: "adv-12", name: "Adv. Smita Joshi", enrollment: "MP/4455/2015", barAuthority: "Bar Council of Madhya Pradesh", spec: "Consumer Protection & Medical Law", exp: "11 Years", status: "Empaneled Counsel" },
  ]);

  // Appointments state (2 items)
  const [appointments, setAppointments] = useState([
    { id: "apt-1", clientName: "Green Earth Trust", advocateName: "Adv. Rajesh Sharma", date: "2026-08-12", time: "11:00 AM", mode: "Video Conference", status: "Approved", link: "https://meet.icj.org/room-legal-101" },
    { id: "apt-2", clientName: "Apex Technovations", advocateName: "Adv. Meera Sen", date: "2026-08-15", time: "02:30 PM", mode: "In-Person Chamber", status: "Pending", link: "" },
  ]);

  // Messages state
  const [messages, setMessages] = useState([
    { id: "msg-1", sender: "Green Earth Trust", recipient: "Adv. Rajesh Sharma", text: "Please review the updated environmental audit report before the next hearing.", timestamp: new Date().toLocaleTimeString("en-IN") },
  ]);
  const [newMessageText, setNewMessageText] = useState("");

  // Today's Tasks state (3 total, 2 pending)
  const [tasks] = useState([
    { id: "t1", title: "Review Rejoinder for WP/2026/1042", status: "In Progress", dueDate: "Today" },
    { id: "t2", title: "Verify Bar Association Enrollment Certificate", status: "Completed", dueDate: "Today" },
    { id: "t3", title: "Prepare Cause List for Court Hall 3", status: "Pending", dueDate: "Tomorrow" },
  ]);

  useEffect(() => {
    const allCases = LegalEcosystemService.getCases();
    setCases(allCases);
    const allHearings = LegalEcosystemService.getHearings();
    setHearings(allHearings);
  }, []);

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

  // Real-time Dashboard Cards
  const stats = useMemo(() => {
    const totalClients = clients.length; // 18
    const activeClients = clients.filter((c) => c.status === "Active").length; // 15
    const totalAdvocates = advocates.length; // 12
    const activeCasesCount = cases.length; // 2
    const appointmentsCount = appointments.length; // 2
    const pendingTasksCount = tasks.filter((t) => t.status !== "Completed").length; // 2

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
                Enterprise Advocate Command Centre
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
            placeholder="Search Advocate, Client, Case, Mobile, Email, Enrollment..."
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
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>S.No.</strong></TableCell>
                  <TableCell><strong>Client ID</strong></TableCell>
                  <TableCell><strong>Client Name</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Region</strong></TableCell>
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
          </Paper>
        </TabPanel>

        {/* TAB: ACTIVE CLIENTS */}
        <TabPanel value={activeTab} index={ADVOCATE_TABS.ACTIVE_CLIENTS}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Active Client Roster ({activeClientsList.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
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
                  <TableCell><strong>Enrollment No.</strong></TableCell>
                  <TableCell><strong>Advocate Name</strong></TableCell>
                  <TableCell><strong>Specialization</strong></TableCell>
                  <TableCell><strong>Bar Authority</strong></TableCell>
                  <TableCell><strong>Experience</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {advocates.map((a, idx) => (
                  <TableRow key={a.id} hover>
                    <TableCell><Typography variant="body2" color="text.secondary">{idx + 1}</Typography></TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{a.enrollment}</TableCell>
                    <TableCell><Typography fontWeight="bold">{a.name}</Typography></TableCell>
                    <TableCell>{a.spec}</TableCell>
                    <TableCell>{a.barAuthority}</TableCell>
                    <TableCell>{a.exp}</TableCell>
                    <TableCell><Chip label={a.status} size="small" color="success" /></TableCell>
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
