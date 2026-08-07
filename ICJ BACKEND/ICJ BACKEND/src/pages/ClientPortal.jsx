import { useEffect, useState } from "react";
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

export default function ClientPortal() {
  const [tabIndex, setTabIndex] = useState(0);
  const [cases, setCases] = useState([]);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  // Petition Form
  const [form, setForm] = useState({
    title: "",
    clientName: "Green Earth Trust",
    courtName: "High Court of Judicature",
    summary: "",
    feeAmount: 45000,
  });

  // Appointment Form
  const [aptForm, setAptForm] = useState({
    advocateName: "Adv. Rajesh Sharma",
    date: "2026-08-18",
    time: "10:30 AM",
    mode: "Video Conference",
    purpose: "Pre-Hearing Case Briefing",
  });

  // Client Appointments list
  const [appointments, setAppointments] = useState([
    { id: "apt-1", advocateName: "Adv. Rajesh Sharma", date: "2026-08-12", time: "11:00 AM", mode: "Video Conference", status: "Approved", link: "https://meet.icj.org/room-legal-101" },
  ]);

  // Messages list
  const [messages, setMessages] = useState([
    { id: "m1", sender: "Adv. Rajesh Sharma", text: "Welcome to the ICJ Client Legal Portal. Your PIL case WP/2026/1042 is listed for Aug 20, 2026.", timestamp: new Date().toLocaleTimeString("en-IN") },
  ]);
  const [clientMsgInput, setClientMsgInput] = useState("");

  const loadCases = () => {
    setCases(LegalEcosystemService.getCases());
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleCreateCase = () => {
    if (!form.title.trim()) {
      alert("Please provide a case title.");
      return;
    }
    LegalEcosystemService.createCase(form);
    ActivityService.create({ title: `Client Filed New Case: ${form.title}`, type: "legal" });
    setOpenFileModal(false);
    setAlertMsg("New Case Petition filed successfully and submitted for Trust Approval!");
    setTimeout(() => setAlertMsg(""), 3500);
    setForm({ title: "", clientName: "Green Earth Trust", courtName: "High Court of Judicature", summary: "", feeAmount: 45000 });
    loadCases();
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
      sender: "Green Earth Trust (Client)",
      text: clientMsgInput,
      timestamp: new Date().toLocaleTimeString("en-IN"),
    };
    setMessages((prev) => [...prev, msg]);
    ActivityService.create({ title: `Client Message Sent: "${clientMsgInput.substring(0, 30)}..."`, type: "legal" });
    setClientMsgInput("");
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Client Legal Command Portal
            </Typography>
            <Typography color="text.secondary">
              File Petitions, Track Case Timeline, Documents, Payments & Book Appointments
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<CalendarMonthIcon />} onClick={() => setOpenAppointmentModal(true)}>
              Book Appointment
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenFileModal(true)}>
              File New Case
            </Button>
          </Stack>
        </Stack>

        {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}

        {/* Client Portal Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
            <Tab icon={<GavelIcon />} iconPosition="start" label="My Cases" />
            <Tab icon={<TimelineIcon />} iconPosition="start" label="Case Timeline" />
            <Tab icon={<FolderIcon />} iconPosition="start" label="Document Vault" />
            <Tab icon={<PaymentIcon />} iconPosition="start" label="Payments & Invoices" />
            <Tab icon={<CalendarMonthIcon />} iconPosition="start" label="Appointments & Video Calls" />
            <Tab icon={<ChatIcon />} iconPosition="start" label="Messages" />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Client Profile & KYC" />
          </Tabs>
        </Box>

        {/* TAB 0: MY CASES */}
        <TabPanel value={tabIndex} index={0}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              My Filed Petitions & Case Registry
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Case ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Assigned Advocate</TableCell>
                  <TableCell>Court Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Trust Approval</TableCell>
                  <TableCell>Next Hearing</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{c.caseNumber}</TableCell>
                    <TableCell>{c.title}</TableCell>
                    <TableCell>{c.advocateName || "Adv. Rajesh Sharma"}</TableCell>
                    <TableCell>{c.courtName}</TableCell>
                    <TableCell><Chip label={c.status} color={c.status === "In Hearing" ? "success" : "warning"} size="small" /></TableCell>
                    <TableCell><Chip label={c.trustApprovalStatus || "Approved"} color="success" size="small" variant="outlined" /></TableCell>
                    <TableCell>{c.nextHearing}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>

        {/* TAB 1: CASE TIMELINE */}
        <TabPanel value={tabIndex} index={1}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Interactive Case Progress Timeline
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: "4px solid #2e7d32" }}>
                <Typography variant="subtitle2" fontWeight="bold" color="success.main">Aug 20, 2026 • Upcoming Court Hearing</Typography>
                <Typography variant="body2">High Court of Judicature - Final Arguments scheduled in Bench 3.</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2, borderLeft: "4px solid #1976d2" }}>
                <Typography variant="subtitle2" fontWeight="bold" color="primary.main">Jan 15, 2026 • Case Petition Filed</Typography>
                <Typography variant="body2">Writ Petition WP/2026/1042 filed by Green Earth Trust.</Typography>
              </Paper>
            </Stack>
          </Paper>
        </TabPanel>

        {/* TAB 2: DOCUMENTS */}
        <TabPanel value={tabIndex} index={2}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Case Documents Vault & SHA-256 Digital Verification
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Document Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>SHA-256 Hash</TableCell>
                  <TableCell>Verification</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Writ Petition Pleadings.pdf</TableCell>
                  <TableCell>PDF</TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>SHA256-8F9B1A2C3D4E5F6</TableCell>
                  <TableCell><Chip icon={<VerifiedIcon />} label="SHA-256 Verified" color="success" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Environmental Impact Assessment.xlsx</TableCell>
                  <TableCell>Excel</TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>SHA256-1A2B3C4D5E6F7A8</TableCell>
                  <TableCell><Chip icon={<VerifiedIcon />} label="SHA-256 Verified" color="success" size="small" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>

        {/* TAB 3: PAYMENTS */}
        <TabPanel value={tabIndex} index={3}>
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
                  <TableCell>PIL Representation Fee</TableCell>
                  <TableCell>₹45,000</TableCell>
                  <TableCell>₹30,000</TableCell>
                  <TableCell><Chip label="Partially Paid" color="warning" size="small" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </TabPanel>

        {/* TAB 4: APPOINTMENTS */}
        <TabPanel value={tabIndex} index={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              My Appointments & Video Meeting Links
            </Typography>
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

        {/* TAB 5: MESSAGES */}
        <TabPanel value={tabIndex} index={5}>
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

        {/* TAB 6: CLIENT PROFILE & KYC */}
        <TabPanel value={tabIndex} index={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Client Identity, KYC & Membership Profile
            </Typography>
            <Grid container spacing={2.5} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Client / Entity Name" value="Green Earth Trust" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Membership Level" value="Enterprise Tier" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="KYC Verification Status" value="🟢 Fully Verified (Aadhaar/PAN/GST)" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Contact Email" value="contact@greenearthtrust.org" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Contact Mobile" value="+91 98201 98765" disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Registration State / City" value="Maharashtra / Mumbai" disabled />
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        {/* File Case Dialog */}
        <Dialog open={openFileModal} onClose={() => setOpenFileModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>File New Legal Case / Petition</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField fullWidth label="Petition / Case Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Court Name" value={form.courtName} onChange={(e) => setForm({ ...form, courtName: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Brief Summary of Case" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenFileModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateCase}>Submit Petition</Button>
          </DialogActions>
        </Dialog>

        {/* Book Appointment Dialog */}
        <Dialog open={openAppointmentModal} onClose={() => setOpenAppointmentModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Book Legal Appointment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField select fullWidth label="Select Advocate" value={aptForm.advocateName} onChange={(e) => setAptForm({ ...aptForm, advocateName: e.target.value })}>
                  <MenuItem value="Adv. Rajesh Sharma">Adv. Rajesh Sharma (Constitutional)</MenuItem>
                  <MenuItem value="Adv. Meera Sen">Adv. Meera Sen (Corporate/Finance)</MenuItem>
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
