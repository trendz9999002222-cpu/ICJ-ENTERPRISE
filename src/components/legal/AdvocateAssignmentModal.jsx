import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Divider,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Paper,
  Chip,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import GavelIcon from "@mui/icons-material/Gavel";
import HeadsetIcon from "@mui/icons-material/Headset";
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditNoteIcon from "@mui/icons-material/EditNote";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import AdvocateAssignmentService from "../../services/advocateAssignmentService.js";

export default function AdvocateAssignmentModal({
  open = false,
  caseItem = null,
  member = null,
  onClose = () => {},
  onAssigned = () => {},
}) {
  const [advocates, setAdvocates] = useState([]);
  const [selectedAdvocateId, setSelectedAdvocateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Channels
  const [channels, setChannels] = useState({
    email: true,
    whatsapp: true,
    inApp: true,
  });

  // Template Editing
  const [templates, setTemplates] = useState(() => AdvocateAssignmentService.getTemplates());
  const [customSubject, setCustomSubject] = useState("");
  const [customEmailBody, setCustomEmailBody] = useState("");
  const [customWhatsApp, setCustomWhatsApp] = useState("");
  const [templateSavedMsg, setTemplateSavedMsg] = useState("");

  const targetClientName = caseItem?.clientName || caseItem?.client_name || member?.fullName || member?.name || "Client / Member";
  const targetEmail = caseItem?.clientEmail || caseItem?.client_email || member?.email || "";
  const targetMobile = caseItem?.clientPhone || caseItem?.client_phone || member?.mobile || "";
  const targetCaseId = caseItem?.caseId || caseItem?.id || caseItem?.case_id || (member ? `MEM-${member.member_id || member.id}` : "ICJ-REF-1001");
  const targetTitle = caseItem?.title || caseItem?.caseTitle || member?.purpose || (member?.problemCategories ? member.problemCategories.join(", ") : "Legal Assistance & Advisory");

  useEffect(() => {
    if (open) {
      setLoading(true);
      setErrorMsg("");
      setSuccessResult(null);

      const activeTemplates = AdvocateAssignmentService.getTemplates();
      setTemplates(activeTemplates);
      setCustomSubject(activeTemplates.emailSubject);
      setCustomEmailBody(activeTemplates.emailBodyHtml);
      setCustomWhatsApp(activeTemplates.whatsappMessage);

      AdvocateAssignmentService.getAvailableAdvocates()
        .then((list) => {
          setAdvocates(list);
          if (list.length > 0) {
            const existingId = caseItem?.assigned_advocate?.advocate_id || caseItem?.advocateId || member?.assigned_advocate?.advocate_id || member?.advocateId;
            const match = list.find((a) => (a.member_id || a.id) === existingId);
            setSelectedAdvocateId(match ? (match.member_id || match.id) : (list[0].member_id || list[0].id));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, caseItem, member]);

  const selectedAdvocate = useMemo(() => {
    return advocates.find((a) => (a.member_id || a.id) === selectedAdvocateId) || null;
  }, [advocates, selectedAdvocateId]);

  // Context for live preview
  const previewContext = useMemo(() => {
    const advName = selectedAdvocate?.fullName || selectedAdvocate?.name || "Customer Care Officer";
    const advId = selectedAdvocate?.member_id || selectedAdvocate?.id || "ICJ-CARE-01";
    const advMobile = selectedAdvocate?.mobile || "+91 7053002222";
    const advEmail = selectedAdvocate?.email || "Consortiumofjurist@gmail.com";
    const advBar = selectedAdvocate?.professionalRegNo || (selectedAdvocate?.isOfficialCare ? "ICJ Customer Care & Legal Helpline" : "Verified Bar Council Member");

    return {
      client_name: targetClientName,
      client_email: targetEmail,
      client_mobile: targetMobile,
      case_id: targetCaseId,
      case_title: targetTitle,
      advocate_name: advName,
      advocate_id: advId,
      advocate_mobile: advMobile,
      advocate_email: advEmail,
      advocate_bar_reg: advBar,
      assigned_date: new Date().toLocaleDateString("en-IN"),
      support_phone: "7053002222 / 9999002222",
    };
  }, [selectedAdvocate, targetClientName, targetEmail, targetMobile, targetCaseId, targetTitle]);

  // Live rendered preview text
  const renderedWhatsAppPreview = useMemo(() => {
    return AdvocateAssignmentService.renderTemplate(customWhatsApp || templates.whatsappMessage, previewContext);
  }, [customWhatsApp, templates, previewContext]);

  const handleSaveCustomTemplates = () => {
    const updated = {
      ...templates,
      emailSubject: customSubject,
      emailBodyHtml: customEmailBody,
      whatsappMessage: customWhatsApp,
    };
    AdvocateAssignmentService.saveTemplates(updated);
    setTemplates(updated);
    setTemplateSavedMsg("Template saved successfully! All future assignments will use this custom format.");
    setTimeout(() => setTemplateSavedMsg(""), 4000);
  };

  const handleResetTemplates = () => {
    const def = AdvocateAssignmentService.resetTemplatesToDefault();
    setTemplates(def);
    setCustomSubject(def.emailSubject);
    setCustomEmailBody(def.emailBodyHtml);
    setCustomWhatsApp(def.whatsappMessage);
    setTemplateSavedMsg("Template restored to official ICJ default.");
    setTimeout(() => setTemplateSavedMsg(""), 4000);
  };

  const handleConfirmAllocation = async () => {
    if (!selectedAdvocate) {
      setErrorMsg("Please select an advocate or customer care officer to allocate.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      let res;
      if (member) {
        res = await AdvocateAssignmentService.allocateAdvocateToMember({
          member,
          advocate: selectedAdvocate,
          customSubject,
          customEmailBody,
          customWhatsApp,
          channels,
          assignedBy: "ICJ Super Admin",
        });
      } else {
        res = await AdvocateAssignmentService.allocateAdvocateToCase({
          caseItem,
          advocate: selectedAdvocate,
          customSubject,
          customEmailBody,
          customWhatsApp,
          channels,
          assignedBy: "ICJ Super Admin",
        });
      }

      setSuccessResult(res);
      if (onAssigned) onAssigned(res.caseItem || res.member);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to allocate.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!caseItem && !member) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: "#0a192f", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.8 }}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <SupportAgentIcon sx={{ color: "#38bdf8", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={800} letterSpacing={0.3}>
            ⚖️ Legal Counsel & Customer Care Officer Allocation Center
          </Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#f8fafc" }}>
        {/* Case & Client Snapshot */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: "#ffffff" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">ALLOCATION TARGET</Typography>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main" sx={{ fontFamily: "monospace" }}>
                {targetCaseId}
              </Typography>
              <Chip label={member ? "👤 Direct Member Assistance" : "⚖️ Court Case Allocation"} size="small" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 800, mt: 0.3 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">CLIENT / PETITIONER</Typography>
              <Typography variant="subtitle2" fontWeight={800}>
                {targetClientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                📱 {targetMobile || "No Phone"} | ✉️ {targetEmail || "No Email"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography variant="caption" color="text.secondary">MATTER / PROBLEM DESCRIPTION</Typography>
              <Typography variant="body2" fontWeight={700} noWrap>
                {targetTitle}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {successResult ? (
          /* SUCCESS STATE */
          <Paper elevation={2} sx={{ p: 3, textAlign: "center", bgcolor: "#f0fdf4", border: "1px solid #86efac", borderRadius: 2 }}>
            <CheckCircleIcon sx={{ fontSize: 54, color: "#16a34a", mb: 1 }} />
            <Typography variant="h5" fontWeight={900} color="#15803d" gutterBottom>
              Officer / Advocate Successfully Appointed!
            </Typography>
            <Typography variant="body1" color="#166534" sx={{ mb: 2 }}>
              <strong>{selectedAdvocate?.fullName || selectedAdvocate?.name}</strong> (ID: {selectedAdvocate?.member_id || selectedAdvocate?.id}) is now assigned to assist <strong>{targetClientName}</strong>.
            </Typography>

            <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" sx={{ mt: 2 }}>
              {successResult.whatsappUrl && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  component="a"
                  href={successResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ fontWeight: 800, bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" } }}
                >
                  Open WhatsApp Chat with Client ➔
                </Button>
              )}

              <Button variant="outlined" onClick={onClose} sx={{ fontWeight: 800 }}>
                Close Allocation Center
              </Button>
            </Stack>
          </Paper>
        ) : (
          /* ALLOCATION FORM */
          <Stack spacing={2.5}>
            {/* 1. OFFICER / ADVOCATE SELECTOR */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#ffffff" }}>
              <Typography variant="subtitle2" fontWeight={800} color="#0f172a" gutterBottom>
                1. SELECT CUSTOMER CARE OFFICER OR ADVOCATE (अधिकारी या वकील चुनें) *
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedAdvocateId}
                onChange={(e) => setSelectedAdvocateId(e.target.value)}
                helperText={
                  advocates.length === 0
                    ? "Loading available officers..."
                    : `${advocates.length} official desks & empaneled advocates available.`
                }
              >
                {advocates.map((adv) => {
                  const id = adv.member_id || adv.memberId || adv.id;
                  const name = adv.fullName || adv.name;
                  const isCare = adv.isOfficialCare;
                  const courts = adv.practiceCourts ? ` | ${adv.practiceCourts}` : "";
                  return (
                    <MenuItem key={id} value={id}>
                      <Typography variant="body2" fontWeight={isCare ? 900 : 700} color={isCare ? "#1e3a8a" : "#0f172a"}>
                        {isCare ? "🎧 " : "⚖️ "}{name} ({id}){courts}
                      </Typography>
                    </MenuItem>
                  );
                })}
              </TextField>

              {selectedAdvocate && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: selectedAdvocate.isOfficialCare ? "#eff6ff" : "#f1f5f9", borderRadius: 1.5, display: "flex", gap: 2, alignItems: "center" }}>
                  <Typography variant="caption" color="#0f172a">
                    <strong>Selected Desk:</strong> {selectedAdvocate.fullName} | 📱 {selectedAdvocate.mobile} | ✉️ {selectedAdvocate.email}
                  </Typography>
                  <Chip
                    label={selectedAdvocate.isOfficialCare ? "Official ICJ Desk" : "Empaneled Counsel"}
                    size="small"
                    color={selectedAdvocate.isOfficialCare ? "primary" : "success"}
                    sx={{ height: 18, fontSize: "0.65rem", fontWeight: 800 }}
                  />
                </Box>
              )}
            </Paper>

            {/* 2. MULTI-CHANNEL DISPATCH PREFERENCES */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#ffffff" }}>
              <Typography variant="subtitle2" fontWeight={800} color="#0f172a" gutterBottom>
                2. CUSTOMER CARE DISPATCH CHANNELS (अलर्ट चैनल चुनें)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={channels.email}
                        onChange={(e) => setChannels((p) => ({ ...p, email: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.6}>
                        <EmailIcon fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={700}>Email (Brevo SMTP)</Typography>
                      </Stack>
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={channels.whatsapp}
                        onChange={(e) => setChannels((p) => ({ ...p, whatsapp: e.target.checked }))}
                        color="success"
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.6}>
                        <WhatsAppIcon fontSize="small" color="success" />
                        <Typography variant="body2" fontWeight={700}>WhatsApp Dispatch</Typography>
                      </Stack>
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={channels.inApp}
                        onChange={(e) => setChannels((p) => ({ ...p, inApp: e.target.checked }))}
                        color="warning"
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.6}>
                        <NotificationsActiveIcon fontSize="small" color="warning" />
                        <Typography variant="body2" fontWeight={700}>In-App & SMS Alert</Typography>
                      </Stack>
                    }
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* 3. LIVE MESSAGE PREVIEW */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#ffffff" }}>
              <Typography variant="subtitle2" fontWeight={800} color="#0f172a" gutterBottom>
                3. LIVE MESSAGE PREVIEW (कस्टमर केयर की तरफ से जाने वाला संदेश)
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderRadius: 2,
                  border: "1px dashed #94a3b8",
                  fontFamily: "monospace",
                  fontSize: "0.82rem",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  color: "#1e293b",
                }}
              >
                {renderedWhatsAppPreview}
              </Box>
            </Paper>

            {/* 4. CUSTOMIZE MESSAGE TEMPLATE (ACCORDION) */}
            <Accordion variant="outlined" sx={{ borderRadius: "8px !important", overflow: "hidden" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EditNoteIcon color="primary" />
                  <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                    ✍️ Customise Notification Template (मैसेज एडिट करें / जब मर्जी बदलें)
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: "#ffffff", p: 2.5 }}>
                {templateSavedMsg && (
                  <Alert severity="success" sx={{ mb: 2, fontWeight: 700 }}>
                    {templateSavedMsg}
                  </Alert>
                )}

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                  Available Placeholders: <code>{"{{client_name}}"}</code>, <code>{"{{advocate_name}}"}</code>, <code>{"{{advocate_id}}"}</code>, <code>{"{{advocate_mobile}}"}</code>, <code>{"{{case_id}}"}</code>, <code>{"{{case_title}}"}</code>, <code>{"{{support_phone}}"}</code>
                </Typography>

                <Stack spacing={2}>
                  <TextField
                    label="Email Subject Line"
                    size="small"
                    fullWidth
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />

                  <TextField
                    label="WhatsApp / SMS Text Template"
                    multiline
                    rows={6}
                    fullWidth
                    value={customWhatsApp}
                    onChange={(e) => setCustomWhatsApp(e.target.value)}
                  />

                  <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<RestartAltIcon />}
                      onClick={handleResetTemplates}
                      sx={{ fontWeight: 700 }}
                    >
                      Reset to Official Default
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleSaveCustomTemplates}
                      sx={{ fontWeight: 800 }}
                    >
                      Save Template Changes
                    </Button>
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#f1f5f9" }}>
        <Button variant="outlined" onClick={onClose} disabled={submitting} sx={{ fontWeight: 700 }}>
          Cancel
        </Button>
        {!successResult && (
          <Button
            variant="contained"
            color="primary"
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
            onClick={handleConfirmAllocation}
            disabled={submitting || !selectedAdvocate}
            sx={{ fontWeight: 900, px: 3 }}
          >
            Confirm & Dispatch Customer Care Alerts ➔
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
