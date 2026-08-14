/**
 * HelpdeskPortal — ICJ Enterprise Platform
 * 1-Click Enterprise Customer Care & Support Ticket Portal for Litigants & Advocates.
 */

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

// Icons
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import AddCommentIcon from "@mui/icons-material/AddComment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import MainLayout from "../layouts/MainLayout";
import useAuth from "../hooks/useAuth";
import HelpdeskSupportService from "../services/helpdeskSupportService";
import VernacularVoiceAssistantService from "../services/vernacularVoiceAssistantService";

export default function HelpdeskPortal() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [category, setCategory] = useState("LEGAL_COUNSEL_ASSIGNMENT");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const loadTickets = () => {
    const data = HelpdeskSupportService.getTickets();
    setTickets(data);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = () => {
    if (!subject.trim() || !description.trim()) {
      setAlertMsg("कृपया विषय और विवरण दर्ज करें।");
      return;
    }

    HelpdeskSupportService.createTicket({
      category,
      subject,
      description,
      submittedBy: user?.name || user?.username || "Litigant User",
      contactPhone: user?.mobile || "+91 9876543210",
      role: user?.role || "member",
    });

    setAlertMsg("🟢 आपकी सहायता अर्जी (Helpdesk Ticket) सफलतापूर्वक दर्ज कर ली गई है!");
    VernacularVoiceAssistantService.speakInHindi("आपकी सहायता अर्जी सफलतापूर्वक दर्ज कर ली गई है। हमारी कस्टमर केयर टीम जल्द संपर्क करेगी।");
    setOpenModal(false);
    setSubject("");
    setDescription("");
    loadTickets();
    setTimeout(() => setAlertMsg(""), 4000);
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* HEADER */}
        <Paper elevation={2} className="bigtech-card glass-card" sx={{ p: 3, mb: 3, borderRadius: 3, borderLeft: "6px solid #2563eb", bgcolor: "#eff6ff" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box className="bigtech-icon-container" sx={{ bgcolor: "#2563eb", color: "#fff", width: 48, height: 48 }}>
                <HeadsetMicIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="#1e40af">
                  📞 ICJ Enterprise कस्टमर केयर व सहायता पोर्टल (Helpdesk Support)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  वकीलों व नागरिकों के लिए 1-क्लिक सहायता डेस्क। किसी भी समस्या के लिए तुरंत अर्जी दर्ज करें।
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCommentIcon />}
              onClick={() => setOpenModal(true)}
              sx={{ fontWeight: "bold", py: 1, px: 2.5 }}
            >
              ➕ 1-क्लिक नई सहायता अर्जी दर्ज करें
            </Button>
          </Stack>
        </Paper>

        {alertMsg && <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert>}

        {/* SUMMARY STATS */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, borderLeft: "4px solid #ed6c02" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">कुल अर्ज़ियां (Total Tickets)</Typography>
                <Typography variant="h5" fontWeight="bold">{tickets.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, borderLeft: "4px solid #0284c7" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">प्रक्रियाधीन (In Progress)</Typography>
                <Typography variant="h5" fontWeight="bold">{tickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2.5, borderLeft: "4px solid #16a34a" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">निस्तारित अर्ज़ियां (Resolved)</Typography>
                <Typography variant="h5" fontWeight="bold">{tickets.filter(t => t.status === "RESOLVED").length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* TICKETS TABLE */}
        <Paper variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SupportAgentIcon color="primary" /> सहायता अर्ज़ियों की लाइव स्थिति (Live Helpdesk Telemetry)
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell fontWeight="bold">अर्जी संख्या</TableCell>
                  <TableCell fontWeight="bold">श्रेणी</TableCell>
                  <TableCell fontWeight="bold">विषय व विवरण</TableCell>
                  <TableCell fontWeight="bold">प्रस्तुतकर्ता</TableCell>
                  <TableCell fontWeight="bold">आवंटित डेस्क</TableCell>
                  <TableCell fontWeight="bold">स्थिति</TableCell>
                  <TableCell fontWeight="bold">निस्तारण नोट</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ fontWeight: "bold", color: "#1d4ed8" }}>{t.ticketNo}</TableCell>
                    <TableCell>
                      <Chip label={t.category} size="small" variant="outlined" color="primary" sx={{ fontSize: "0.65rem" }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{t.subject}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.description}</Typography>
                    </TableCell>
                    <TableCell>{t.submittedBy} ({t.contactPhone})</TableCell>
                    <TableCell>{t.assignedDesk}</TableCell>
                    <TableCell>
                      <Chip
                        icon={t.status === "RESOLVED" ? <CheckCircleIcon /> : <PendingActionsIcon />}
                        label={t.status}
                        color={t.status === "RESOLVED" ? "success" : "warning"}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#059669", fontSize: "0.75rem" }}>
                      {t.resolutionNotes || "कस्टमर केयर डेस्क द्वारा समीक्षाधीन..."}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* CREATE TICKET MODAL */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#eff6ff", color: "#1e40af" }}>
            ➕ 1-क्लिक नई सहायता अर्जी दर्ज करें (Submit Helpdesk Ticket)
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              select fullWidth size="small"
              label="सहायता की श्रेणी"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
            >
              <MenuItem value="LEGAL_COUNSEL_ASSIGNMENT">⚖️ वकील आवंटन व संपर्क सहायता</MenuItem>
              <MenuItem value="BILLING">💳 पेमेंट, फीस व जीएसटी रसीद सहायता</MenuItem>
              <MenuItem value="DOCUMENT_VERIFICATION">📜 केस कागजात सत्यापन सहायता</MenuItem>
              <MenuItem value="TECHNICAL_SUPPORT">💻 पोर्टल तकनीकी सहायता</MenuItem>
            </TextField>

            <TextField
              fullWidth size="small"
              label="अर्जी का विषय (Subject)"
              placeholder="उदा. वकील साहब से संपर्क नहीं हो पा रहा है..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth multiline rows={3} size="small"
              label="समस्या का विस्तृत विवरण (Description)"
              placeholder="अपनी समस्या का पूरा विवरण यहाँ दर्ज करें..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)}>रद्द करें</Button>
            <Button variant="contained" color="primary" onClick={handleCreateTicket} sx={{ fontWeight: "bold" }}>
              अर्जी जमा करें (Submit Ticket)
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}
