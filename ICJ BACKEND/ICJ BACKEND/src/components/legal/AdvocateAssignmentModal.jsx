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
  ListSubheader,
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
import BusinessIcon from "@mui/icons-material/Business";
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
  const [categorized, setCategorized] = useState({ franchisees: [], customerCare: [], advocates: [], allFlat: [] });
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
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

  // Template State
  const [templates, setTemplates] = useState(() => AdvocateAssignmentService.getTemplates());
  const [customSubject, setCustomSubject] = useState("");
  const [customWhatsApp, setCustomWhatsApp] = useState("");
  const [templateSavedMsg, setTemplateSavedMsg] = useState("");

  const targetClientId = member?.member_id || member?.memberId || member?.id || caseItem?.caseId || caseItem?.id || "26CLT08AA0001";
  const targetClientName = member?.fullName || member?.name || caseItem?.clientName || caseItem?.client_name || "Valued Client";
  const targetEmail = member?.email || caseItem?.clientEmail || caseItem?.client_email || "";
  const targetMobile = member?.mobile || caseItem?.clientPhone || caseItem?.client_phone || "";
  const targetTitle = "नागरिक विधिक सहायता एवं समस्या निवारण (Litigant Legal Grievance)";

  useEffect(() => {
    if (open) {
      setLoading(true);
      setErrorMsg("");
      setSuccessResult(null);

      const activeTemplates = AdvocateAssignmentService.getTemplates();
      setTemplates(activeTemplates);

      AdvocateAssignmentService.getCategorizedAssignees(targetClientId)
        .then((res) => {
          setCategorized(res);
          if (res.allFlat.length > 0) {
            // Default to first Franchise Agency if available, else Care Desk, else Advocate
            const defaultChoice = res.franchisees[0] || res.customerCare[0] || res.advocates[0];
            const chosenId = defaultChoice ? (defaultChoice.member_id || defaultChoice.id) : "";
            setSelectedAssigneeId(chosenId);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, targetClientId]);

  const selectedAssignee = useMemo(() => {
    return categorized.allFlat.find((a) => (a.member_id || a.id) === selectedAssigneeId) || null;
  }, [categorized, selectedAssigneeId]);

  // Context for live preview
  const previewContext = useMemo(() => {
    const name = selectedAssignee?.fullName || selectedAssignee?.name || "Representative";
    const id = selectedAssignee?.member_id || selectedAssignee?.id || "REP-01";
    const mob = selectedAssignee?.mobile || "+91 7053002222";
    const email = selectedAssignee?.email || "Consortiumofjurist@gmail.com";
    const bar = selectedAssignee?.professionalRegNo || (selectedAssignee?.category === "franchise" ? "District Parent Agency" : "ICJ Helpdesk");
    const jurisdiction = selectedAssignee?.jurisdiction || selectedAssignee?.practiceCourts || "Pan-India";

    return {
      client_id: targetClientId,
      client_name: targetClientName,
      client_email: targetEmail,
      client_mobile: targetMobile,
      assignee_name: name,
      assignee_id: id,
      assignee_mobile: mob,
      assignee_email: email,
      assignee_bar_reg: bar,
      assignee_jurisdiction: jurisdiction,
      assigned_date: new Date().toLocaleDateString("en-IN"),
      support_phone: "7053002222 / 9999002222",
    };
  }, [selectedAssignee, targetClientId, targetClientName, targetEmail, targetMobile]);

  // Auto-switch template based on category
  const activeTemplateForCategory = useMemo(() => {
    const cat = selectedAssignee?.category || selectedAssignee?.role || (selectedAssignee?.isOfficialCare ? "customer_care" : "advocate");
    if (cat === "franchise") {
      return {
        subject: templates.franchiseSubject,
        whatsapp: templates.franchiseWhatsApp,
      };
    }
    if (cat === "customer_care") {
      return {
        subject: templates.careSubject,
        whatsapp: templates.careWhatsApp,
      };
    }
    return {
      subject: templates.advocateSubject,
      whatsapp: templates.advocateWhatsApp,
    };
  }, [selectedAssignee, templates]);

  useEffect(() => {
    if (activeTemplateForCategory) {
      setCustomSubject(activeTemplateForCategory.subject);
      setCustomWhatsApp(activeTemplateForCategory.whatsapp);
    }
  }, [activeTemplateForCategory]);

  // Live rendered preview text
  const renderedWhatsAppPreview = useMemo(() => {
    return AdvocateAssignmentService.renderTemplate(customWhatsApp || activeTemplateForCategory.whatsapp, previewContext);
  }, [customWhatsApp, activeTemplateForCategory, previewContext]);

  const handleSaveCustomTemplates = () => {
    const updated = {
      ...templates,
      franchiseWhatsApp: selectedAssignee?.category === "franchise" ? customWhatsApp : templates.franchiseWhatsApp,
      careWhatsApp: selectedAssignee?.category === "customer_care" ? customWhatsApp : templates.careWhatsApp,
      advocateWhatsApp: selectedAssignee?.category === "advocate" ? customWhatsApp : templates.advocateWhatsApp,
    };
    AdvocateAssignmentService.saveTemplates(updated);
    setTemplates(updated);
    setTemplateSavedMsg("Custom template saved successfully!");
    setTimeout(() => setTemplateSavedMsg(""), 4000);
  };

  const handleResetTemplates = () => {
    const def = AdvocateAssignmentService.resetTemplatesToDefault();
    setTemplates(def);
    setCustomSubject(activeTemplateForCategory.subject);
    setCustomWhatsApp(activeTemplateForCategory.whatsapp);
    setTemplateSavedMsg("Template restored to official ICJ default.");
    setTimeout(() => setTemplateSavedMsg(""), 4000);
  };

  const handleConfirmAllocation = async () => {
    if (!selectedAssignee) {
      setErrorMsg("Please select an agency, desk, or advocate to allocate.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await AdvocateAssignmentService.allocate({
        targetMember: member,
        targetCase: caseItem,
        assignee: selectedAssignee,
        customSubject,
        customWhatsApp,
        channels,
        assignedBy: "ICJ Super Admin",
      });

      setSuccessResult(res);
      if (onAssigned) onAssigned(res.allocationRecord);
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
            🏢 3-Tier Client Allocation & Call Center Dispatch Center
          </Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: "#94a3b8", "&:hover": { color: "#fff" } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#f8fafc" }}>
        {/* Client Snapshot */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: "#ffffff" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">CLIENT MEMBER ID</Typography>
              <Typography variant="subtitle2" fontWeight={900} color="primary.main" sx={{ fontFamily: "monospace" }}>
                {targetClientId}
              </Typography>
              <Chip label="👤 Registered Litigant Client" size="small" color="primary" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 800, mt: 0.3 }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">CLIENT NAME & CONTACT</Typography>
              <Typography variant="subtitle2" fontWeight={800}>
                {targetClientName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                📱 {targetMobile || "No Phone"} | ✉️ {targetEmail || "No Email"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Typography variant="caption" color="text.secondary">SERVICE CATEGORY</Typography>
              <Typography variant="body2" fontWeight={700} color="#1e3a8a">
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
              Client Successfully Allocated!
            </Typography>
            <Typography variant="body1" color="#166534" sx={{ mb: 2 }}>
              <strong>{selectedAssignee?.fullName}</strong> ({selectedAssignee?.id}) is now assigned to manage and assist <strong>{targetClientName}</strong>.
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
            {/* 1. 3-TIER ASSIGNEE SELECTOR */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#ffffff" }}>
              <Typography variant="subtitle2" fontWeight={800} color="#0f172a" gutterBottom>
                1. SELECT ALLOCATION DESK / AGENCY / ADVOCATE (एजेंसी, हेल्पडेस्क या वकील चुनें) *
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                helperText="Select a District Franchise Parent Call Center, Central Care Desk, or Empaneled Advocate."
              >
                {/* 🏢 GROUP 1: DISTRICT FRANCHISE AGENCIES */}
                <ListSubheader sx={{ fontWeight: 900, color: "#1e3a8a", bgcolor: "#eff6ff", lineHeight: "32px" }}>
                  🏢 DISTRICT FRANCHISE AGENCIES (पैरेंट एजेंसी व स्थानीय कॉल सेंटर) ({categorized.franchisees.length})
                </ListSubheader>
                {categorized.franchisees.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    <Typography variant="body2" fontWeight={800} color="#1e3a8a">
                      🏢 {f.fullName} ({f.id}) — {f.jurisdiction} ({f.state})
                    </Typography>
                  </MenuItem>
                ))}

                {/* 🎧 GROUP 2: ICJ CENTRAL CARE DESKS */}
                <ListSubheader sx={{ fontWeight: 900, color: "#047857", bgcolor: "#ecfdf5", lineHeight: "32px" }}>
                  🎧 ICJ CENTRAL CUSTOMER CARE & HELPDESK (मुख्यालय सहायता डेस्क) ({categorized.customerCare.length})
                </ListSubheader>
                {categorized.customerCare.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Typography variant="body2" fontWeight={800} color="#047857">
                      🎧 {c.fullName} ({c.id}) — {c.mobile}
                    </Typography>
                  </MenuItem>
                ))}

                {/* ⚖️ GROUP 3: EMPANELED ADVOCATES */}
                <ListSubheader sx={{ fontWeight: 900, color: "#7c2d12", bgcolor: "#fff7ed", lineHeight: "32px" }}>
                  ⚖️ EMPANELED ADVOCATES (मान्यता प्राप्त अधिवक्ता) ({categorized.advocates.length})
                </ListSubheader>
                {categorized.advocates.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    <Typography variant="body2" fontWeight={800} color="#7c2d12">
                      ⚖️ {a.fullName} ({a.id}) — {a.practiceCourts}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>

              {selectedAssignee && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    bgcolor: selectedAssignee.category === "franchise" ? "#eff6ff" : selectedAssignee.category === "customer_care" ? "#ecfdf5" : "#fff7ed",
                    borderRadius: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="#0f172a">
                    <strong>Selected:</strong> {selectedAssignee.fullName} | 📱 {selectedAssignee.mobile} | ✉️ {selectedAssignee.email}
                  </Typography>
                  <Chip
                    label={
                      selectedAssignee.category === "franchise"
                        ? "🏢 District Franchise Call Center"
                        : selectedAssignee.category === "customer_care"
                        ? "🎧 HQ Customer Care Desk"
                        : "⚖️ Empaneled Advocate"
                    }
                    size="small"
                    color={selectedAssignee.category === "franchise" ? "primary" : selectedAssignee.category === "customer_care" ? "success" : "warning"}
                    sx={{ height: 20, fontSize: "0.68rem", fontWeight: 900 }}
                  />
                </Box>
              )}
            </Paper>

            {/* 2. MULTI-CHANNEL DISPATCH CHANNELS */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#ffffff" }}>
              <Typography variant="subtitle2" fontWeight={800} color="#0f172a" gutterBottom>
                2. CUSTOMER CARE DISPATCH CHANNELS (अलर्ट चैनल चुनें)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={<Checkbox checked={channels.email} onChange={(e) => setChannels((p) => ({ ...p, email: e.target.checked }))} color="primary" />}
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
                    control={<Checkbox checked={channels.whatsapp} onChange={(e) => setChannels((p) => ({ ...p, whatsapp: e.target.checked }))} color="success" />}
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
                    control={<Checkbox checked={channels.inApp} onChange={(e) => setChannels((p) => ({ ...p, inApp: e.target.checked }))} color="warning" />}
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.6}>
                        <NotificationsActiveIcon fontSize="small" color="warning" />
                        <Typography variant="body2" fontWeight={700}>In-App SMS Alert</Typography>
                      </Stack>
                    }
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* 3. LIVE ROLE-AWARE MESSAGE PREVIEW */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#ffffff" }}>
              <Typography variant="subtitle2" fontWeight={800} color="#0f172a" gutterBottom>
                3. LIVE ROLE-AWARE MESSAGE PREVIEW (क्लाइंट को जाने वाला संदेश)
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

            {/* 4. CUSTOMIZE MESSAGE TEMPLATE */}
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
                  Available Placeholders: <code>{"{{client_id}}"}</code>, <code>{"{{client_name}}"}</code>, <code>{"{{assignee_name}}"}</code>, <code>{"{{assignee_id}}"}</code>, <code>{"{{assignee_mobile}}"}</code>, <code>{"{{assignee_jurisdiction}}"}</code>, <code>{"{{support_phone}}"}</code>
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
                    <Button size="small" variant="outlined" startIcon={<RestartAltIcon />} onClick={handleResetTemplates} sx={{ fontWeight: 700 }}>
                      Reset to Official Default
                    </Button>
                    <Button size="small" variant="contained" onClick={handleSaveCustomTemplates} sx={{ fontWeight: 800 }}>
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
            disabled={submitting || !selectedAssignee}
            sx={{ fontWeight: 900, px: 3 }}
          >
            Confirm Allocation & Dispatch Tri-Channel Alerts ➔
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
