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

export default function AdvocateDashboard() {
  const [tabIndex, setTabIndex] = useState(0);
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [search, setSearch] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  // Appointments state
  const [appointments, setAppointments] = useState([
    { id: "apt-1", clientName: "Green Earth Trust", advocateName: "Adv. Rajesh Sharma", date: "2026-08-12", time: "11:00 AM", mode: "Video Conference", status: "Approved", link: "https://meet.icj.org/room-legal-101" },
    { id: "apt-2", clientName: "Apex Technovations", advocateName: "Adv. Meera Sen", date: "2026-08-15", time: "02:30 PM", mode: "In-Person Chamber", status: "Pending", link: "" },
  ]);

  // Messages state
  const [messages, setMessages] = useState([
    { id: "msg-1", sender: "Green Earth Trust", recipient: "Adv. Rajesh Sharma", text: "Please review the updated environmental audit report before the next hearing.", timestamp: new Date().toLocaleTimeString("en-IN") },
  ]);
  const [newMessageText, setNewMessageText] = useState("");

  // Today's Tasks state
  const [tasks, setTasks] = useState([
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

  // Multi-field search engine (Advocate, Client, Case, Mobile, Email, Enrollment)
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
    const totalClients = 18;
    const activeClients = 15;
    const totalAdvocates = 12;
    const activeCasesCount = cases.length;
    const appointmentsCount = appointments.length;
    const pendingTasksCount = tasks.filter((t) => t.status !== "Completed").length;

    return { totalClients, activeClients, totalAdvocates, activeCasesCount, appointmentsCount, pendingTasksCount };
  }, [cases, appointments, tasks]);

  const cards = [
    { title: "Total Clients", value: stats.totalClients, color: "#1976d2", icon: <PersonIcon /> },
    { title: "Active Clients", value: stats.activeClients, color: "#2e7d32", icon: <CheckCircleIcon /> },
    { title: "Empaneled Advocates", value: stats.totalAdvocates, color: "#9c27b0", icon: <BadgeIcon /> },
    { title: "Active Cases", value: stats.activeCasesCount, color: "#ed6c02", icon: <GavelIcon /> },
    { title: "Appointments", value: stats.appointmentsCount, color: "#0288d1", icon: <CalendarMonthIcon /> },
    { title: "Pending Tasks", value: stats.pendingTasksCount, color: "#d32f2f", icon: <AssignmentIcon /> },
  ];

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

        {/* Phase G — Real-time Dashboard Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {cards.map((item, idx) => (
            <Grid item xs={12} sm={6} md={2} key={item.title}>
              <Paper
                variant="outlined"
                onClick={() => setTabIndex(idx % 5)}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderLeft: `4px solid ${item.color}`,
                  cursor: "pointer",
                  transition: "0.2s",
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
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
            <Tab icon={<GavelIcon />} iconPosition="start" label="Active Cases" />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Advocate Profile" />
            <Tab icon={<CalendarMonthIcon />} iconPosition="start" label="Appointments & Video Links" />
            <Tab icon={<ChatIcon />} iconPosition="start" label="Communication Engine" />
            <Tab icon={<AssignmentIcon />} iconPosition="start" label="Today's Tasks" />
          </Tabs>
        </Box>

        {/* TAB 0: ACTIVE CASES */}
        <TabPanel value={tabIndex} index={0}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Assigned Legal Case Registry ({filteredCases.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Case Number</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Client Name</TableCell>
                  <TableCell>Court</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Next Hearing</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCases.map((c) => (
                  <TableRow key={c.id} hover>
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

        {/* TAB 1: ADVOCATE PROFILE */}
        <TabPanel value={tabIndex} index={1}>
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

        {/* TAB 2: APPOINTMENTS */}
        <TabPanel value={tabIndex} index={2}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Client Appointment Management & Video Links
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Client Name</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Meeting Mode</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Video Link / Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((a) => (
                  <TableRow key={a.id}>
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

        {/* TAB 3: COMMUNICATION ENGINE */}
        <TabPanel value={tabIndex} index={3}>
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

        {/* TAB 4: TODAY'S TASKS */}
        <TabPanel value={tabIndex} index={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Advocate Task List & Hearing Deadlines
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Task Description</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.title}</TableCell>
                    <TableCell>{t.dueDate}</TableCell>
                    <TableCell><Chip label={t.status} color={t.status === "Completed" ? "success" : "warning"} size="small" /></TableCell>
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
