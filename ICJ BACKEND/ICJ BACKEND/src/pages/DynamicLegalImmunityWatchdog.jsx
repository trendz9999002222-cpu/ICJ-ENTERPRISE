import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Stack,
  Chip,
  Button,
  TextField,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import GavelIcon from "@mui/icons-material/Gavel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import DynamicLegalComplianceEngine from "../services/dynamicLegalComplianceEngine.js";
import SecurityIncidentBroadcasterService from "../services/securityIncidentBroadcasterService.js";
import CircuitBreakerIsolationService from "../services/circuitBreakerIsolationService.js";
import WebPushNotificationService from "../services/webPushNotificationService.js";
import WebAudioSirenService from "../services/webAudioSirenService.js";
import LegalChangeAuditService from "../services/legalChangeAuditService.js";
import SystemTimeMachineRollbackConsole from "../components/admin/SystemTimeMachineRollbackConsole.jsx";
import PredictiveEarlyWarningConsole from "../components/admin/PredictiveEarlyWarningConsole.jsx";
import MainLayout from "../layouts/MainLayout.jsx";

export default function DynamicLegalImmunityWatchdog() {
  const [engineState, setEngineState] = useState(DynamicLegalComplianceEngine.getState());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newStatute, setNewStatute] = useState({
    actName: "",
    section: "",
    jurisdiction: "भारत (India)",
    legalBenefit: "",
  });

  const refreshState = () => {
    setEngineState(DynamicLegalComplianceEngine.getState());
  };

  useEffect(() => {
    refreshState();
  }, []);

  const handleTogglePillar = (pillarId, currentStatus) => {
    const nextStatus = !currentStatus;
    DynamicLegalComplianceEngine.togglePillar(
      pillarId,
      nextStatus,
      nextStatus ? "" : "सुरक्षा में संभावित विसंगति दर्ज की गई।"
    );
    refreshState();
  };

  const handleRestoreSecurity = (pillarId) => {
    DynamicLegalComplianceEngine.restorePillarSecurity(pillarId);
    refreshState();
    alert("🟢 सुरक्षा इंतज़ाम 100% बहाल कर दिया गया है! विधिक स्तंभ पुनः हरे (GREEN) रंग में प्रमाणित हो गया है।");
  };

  const handleAddCustomStatute = () => {
    if (!newStatute.actName || !newStatute.section) {
      alert("कृपया कानून का नाम और धारा भरें।");
      return;
    }
    DynamicLegalComplianceEngine.addCustomStatute(newStatute);
    setNewStatute({ actName: "", section: "", jurisdiction: "भारत (India)", legalBenefit: "" });
    setAddModalOpen(false);
    refreshState();
    alert("🎉 नई कानूनी धारा सफलतापूर्वक हरे रंग (GREEN) में लाइव व्हाइट पेपर में जोड़ दी गई है!");
  };

  const downloadLiveDoc = () => {
    const htmlContent = DynamicLegalComplianceEngine.generateLiveWhitePaperHTML();
    const blob = new Blob([htmlContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ICJ_DYNAMIC_LEGAL_WHITE_PAPER_${Date.now()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAllFortressSafe =
    engineState.unacknowledgedBreaches.length === 0 &&
    engineState.pillars.every((p) => p.active);

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3.5 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
        {/* TOP BREADCRUMB & HEADER */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: "#0f172a",
                  color: "#38bdf8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GavelIcon sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={900} color="#0f172a">
                  📜 डायनेमिक लीगल इम्युनिटी एवं वैधानिक वॉचडॉग केंद्र
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                  [CODE F7] Dynamic Self-Evolving Legal White Paper & Real-Time Statutory Immunity Engine
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddCircleIcon />}
              onClick={() => setAddModalOpen(true)}
              sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px", borderColor: "#059669", color: "#059669", bgcolor: "#ecfdf5" }}
            >
              ➕ नई धारा जोड़ें (Add Statute - Green)
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={downloadLiveDoc}
              sx={{ fontWeight: 900, textTransform: "none", borderRadius: "10px", bgcolor: "#0f172a" }}
            >
              📥 लाइव वर्ड फाइल (.doc) डाउनलोड
            </Button>
          </Stack>
        </Stack>

        {/* 🚨 1. BOLD RED PERMANENT ALERT BANNER (Stays strictly RED until security is restored) */}
        {engineState.unacknowledgedBreaches.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              bgcolor: "#fef2f2",
              border: "3px solid #ef4444",
              boxShadow: "0 8px 30px rgba(239, 68, 68, 0.25)",
              mb: 3.5,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
              <WarningAmberIcon sx={{ color: "#dc2626", fontSize: 32 }} />
              <Box>
                <Typography variant="h6" fontWeight={900} color="#991b1b">
                  🔴 महत्वपूर्ण वैधानिक व सुरक्षा चेतावनी (LOCKED RED ALERT)
                </Typography>
                <Typography variant="caption" sx={{ color: "#b91c1c", fontWeight: 800 }}>
                  जब तक इसका सिक्योरिटी इंतज़ाम ठीक नहीं कर दिया जाता, तब तक यह लाल ही रहेगा।
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={2} sx={{ mt: 2 }}>
              {engineState.unacknowledgedBreaches.map((breach) => {
                const solutionPkg = SecurityIncidentBroadcasterService.generateSolutionPackage(breach);
                return (
                  <Paper
                    key={breach.id}
                    sx={{
                      p: 2.5,
                      borderRadius: "12px",
                      bgcolor: "#ffffff",
                      border: "2px solid #ef4444",
                    }}
                  >
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 1.5 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={900} color="#7f1d1d">
                          ⚠️ {breach.pillarName} — {breach.statute}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#991b1b", fontWeight: 700 }}>
                          🛑 समस्या (Root Cause): {breach.reason} (दर्ज समय: {new Date(breach.timestamp).toLocaleTimeString()})
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleRestoreSecurity(breach.pillarId)}
                        sx={{
                          bgcolor: "#059669",
                          color: "#ffffff",
                          fontWeight: 900,
                          borderRadius: "8px",
                          textTransform: "none",
                          px: 2.5,
                          py: 1,
                          flexShrink: 0,
                          "&:hover": { bgcolor: "#047857" },
                        }}
                      >
                        🛡️ सुरक्षा बहाल करें व हरा करें (Restore Security)
                      </Button>
                    </Stack>

                    {/* SOLUTION SOP */}
                    <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#fff1f2", border: "1px dashed #fca5a5", mb: 1.5 }}>
                      <Typography variant="caption" fontWeight={900} color="#991b1b" sx={{ display: "block", mb: 0.5 }}>
                        💡 1-मिनट समाधान निर्देश (Solution SOP):
                      </Typography>
                      {solutionPkg.solutionSteps.map((step, idx) => (
                        <Typography key={idx} variant="caption" sx={{ color: "#7f1d1d", display: "block", fontWeight: 600 }}>
                          • {step}
                        </Typography>
                      ))}
                    </Box>

                    {/* 🤖 1-CLICK ANTIGRAVITY AI PROMPT */}
                    <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#0f172a", color: "#f8fafc" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={900} sx={{ color: "#38bdf8" }}>
                          🤖 एंटी-ग्रेविटी AI एजेंट प्रॉम्प्ट (Ready-to-Paste Antigravity Prompt):
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(solutionPkg.antigravityPrompt);
                            alert("📋 एंटी-ग्रेविटी AI प्रॉम्प्ट क्लिपबोर्ड पर कॉपी हो गया है! इसे सीधे चैट में पेस्ट करें।");
                          }}
                          sx={{ color: "#38bdf8", fontSize: "0.68rem", fontWeight: 900, textTransform: "none", p: 0 }}
                        >
                          📋 AI प्रॉम्प्ट कॉपी करें (Copy Prompt)
                        </Button>
                      </Stack>
                      <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#cbd5e1", display: "block" }}>
                        "{solutionPkg.antigravityPrompt}"
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </Paper>
        )}

        {/* 🔒 CIRCUIT BREAKER & EMERGENCY MULTI-CHANNEL DISPATCHER GRID */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {/* CARD 1: CIRCUIT BREAKER STATUS */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#ffffff", border: "1.5px solid #e2e8f0", height: "100%" }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                <ShieldIcon sx={{ color: CircuitBreakerIsolationService.getState().active ? "#ef4444" : "#059669", fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                    🛑 ऑटो-सर्किट ब्रेकर स्थिति (Compartmentalized Isolation)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                    रेड अलर्ट आने पर 3 हाई-रिस्क पोर्शन्स स्वतः लॉक हो जाते हैं।
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1.5, textAlign: "center", bgcolor: CircuitBreakerIsolationService.isSignupAllowed() ? "#ecfdf5" : "#fef2f2", border: `1px solid ${CircuitBreakerIsolationService.isSignupAllowed() ? "#10b981" : "#ef4444"}` }}>
                    <Typography variant="caption" fontWeight={900} display="block">ऑनबोर्डिंग (/join)</Typography>
                    <Chip label={CircuitBreakerIsolationService.isSignupAllowed() ? "🟢 OPEN" : "🛑 FROZEN"} size="small" sx={{ fontWeight: 900, fontSize: "0.62rem", mt: 0.5 }} />
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1.5, textAlign: "center", bgcolor: CircuitBreakerIsolationService.isFileUploadAllowed() ? "#ecfdf5" : "#fef2f2", border: `1px solid ${CircuitBreakerIsolationService.isFileUploadAllowed() ? "#10b981" : "#ef4444"}` }}>
                    <Typography variant="caption" fontWeight={900} display="block">अपलोड (/docs)</Typography>
                    <Chip label={CircuitBreakerIsolationService.isFileUploadAllowed() ? "🟢 OPEN" : "🛑 READ-ONLY"} size="small" sx={{ fontWeight: 900, fontSize: "0.62rem", mt: 0.5 }} />
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 1.5, textAlign: "center", bgcolor: CircuitBreakerIsolationService.isFinanceAllowed() ? "#ecfdf5" : "#fef2f2", border: `1px solid ${CircuitBreakerIsolationService.isFinanceAllowed() ? "#10b981" : "#ef4444"}` }}>
                    <Typography variant="caption" fontWeight={900} display="block">वॉलेट (/wallet)</Typography>
                    <Chip label={CircuitBreakerIsolationService.isFinanceAllowed() ? "🟢 OPEN" : "🛑 LOCKED"} size="small" sx={{ fontWeight: 900, fontSize: "0.62rem", mt: 0.5 }} />
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* CARD 2: EMERGENCY ALERT BROADCASTER (3-4 PHONES & 3-4 EMAILS) */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#ffffff", border: "1.5px solid #e2e8f0", height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                    🚨 सार्वभौमिक अलर्ट डायरेक्टरी (SMS / Email / WhatsApp)
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                    सभी प्रकार के अलर्ट्स 4 फोन नंबरों और 4 ईमेल्स पर तुरंत जाते हैं।
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    SecurityIncidentBroadcasterService.sendTestBroadcast();
                    alert("🧪 टेस्ट इमरजेंसी अलर्ट 4 फोन नंबरों (SMS/WA) और 4 ईमेल्स पर सफलतापूर्वक प्रेषित कर दिया गया है!");
                  }}
                  sx={{ fontWeight: 800, fontSize: "0.7rem", borderRadius: "8px", textTransform: "none", color: "#0284c7" }}
                >
                  🧪 टेस्ट SOS अलर्ट भेजें
                </Button>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={async () => {
                    const res = await WebPushNotificationService.pairCurrentDevice("admin_1");
                    if (res.success) alert("🔔 यह डिवाइस Admin 1 (CTO Desk) के रूप में सफलतापूर्वक पेयर हो गया है!");
                    refreshState();
                  }}
                  sx={{ bgcolor: "#0f172a", color: "#38bdf8", fontWeight: 800, fontSize: "0.72rem", textTransform: "none", borderRadius: "8px" }}
                >
                  🔔 इस डिवाइस को पेयर करें (Pair Current Device)
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    WebPushNotificationService.dispatchPushAndSiren(
                      "🚨 ICJ SOS TEST ALERT",
                      "यह 4 पेयर किए गए एडमिन ब्राउज़रों के लिए लाइव सायरन व पुश टेस्ट है!"
                    );
                  }}
                  sx={{ bgcolor: "#dc2626", color: "#ffffff", fontWeight: 900, fontSize: "0.72rem", textTransform: "none", borderRadius: "8px" }}
                >
                  🔊 टेस्ट सायरन व पुश बजाएं
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => WebAudioSirenService.stopEmergencySiren()}
                  sx={{ fontWeight: 800, fontSize: "0.72rem", textTransform: "none", borderRadius: "8px", borderColor: "#64748b", color: "#64748b" }}
                >
                  🔇 म्यूट सायरन
                </Button>
              </Stack>

              {/* 4 ADMIN PAIRED SLOTS LIST */}
              <Grid container spacing={1}>
                {WebPushNotificationService.getPairedDevices().map((slot) => (
                  <Grid item xs={6} key={slot.id}>
                    <Box sx={{ p: 1, borderRadius: "8px", bgcolor: "#f8fafc", border: `1px solid ${slot.isPaired ? "#86efac" : "#cbd5e1"}` }}>
                      <Typography variant="caption" fontWeight={900} color="#0f172a" display="block">
                        {slot.isPaired ? "🟢" : "⚪"} {slot.roleName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.65rem", display: "block" }}>
                        {slot.browser} • {slot.deviceName}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* 🟢 2. FORTRESS CERTIFICATION BADGE */}
        {isAllFortressSafe && (
          <Alert
            severity="success"
            icon={<VerifiedUserIcon fontSize="inherit" />}
            sx={{
              mb: 3.5,
              borderRadius: "14px",
              bgcolor: "#ecfdf5",
              color: "#065f46",
              border: "1.5px solid #10b981",
              fontWeight: 800,
            }}
          >
            🛡️ <strong>100% FORTRESS IMMUNE & CERTIFIED:</strong> सभी 8 कोर विधिक व सुरक्षा स्तंभ पूरी तरह सक्रिय हैं।
            IT Act Section 79, DPDPA 2023, BSA 2023, US Sec 230 CDA, और EU GDPR के तहत प्लेटफ़ॉर्म 100% सुरक्षित है।
          </Alert>
        )}

        {/* 3. 8 COMPLIANCE PILLARS MATRIX */}
        <Typography variant="h6" fontWeight={900} color="#0f172a" sx={{ mb: 2 }}>
          🏛️ 8 कोर वैधानिक स्तंभों की रीयल-टाइम स्थिति (Active Legal Pillars Matrix):
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {engineState.pillars.map((pillar) => (
            <Grid item xs={12} sm={6} md={3} key={pillar.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: "16px",
                  bgcolor: pillar.active ? "#ffffff" : "#fef2f2",
                  border: `2px solid ${pillar.active ? "#10b981" : "#ef4444"}`,
                  boxShadow: pillar.active
                    ? "0 4px 14px rgba(0,0,0,0.04)"
                    : "0 6px 20px rgba(239,68,68,0.2)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Chip
                      label={pillar.active ? "🟢 ACTIVE" : "🔴 DEGRADED"}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: "0.68rem",
                        bgcolor: pillar.active ? "#ecfdf5" : "#7f1d1d",
                        color: pillar.active ? "#059669" : "#fecaca",
                        border: `1px solid ${pillar.active ? "#10b981" : "#dc2626"}`,
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={pillar.active}
                          onChange={() => handleTogglePillar(pillar.id, pillar.active)}
                          color="success"
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                  </Stack>

                  <Typography variant="subtitle2" fontWeight={900} color="#0f172a" sx={{ mb: 0.5 }}>
                    {pillar.name}
                  </Typography>

                  <Typography variant="caption" sx={{ color: "#0284c7", fontWeight: 800, display: "block", mb: 1 }}>
                    ⚖️ {pillar.statute}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                    {pillar.description}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px dashed #cbd5e1" }}>
                  <Typography variant="caption" sx={{ color: "#334155", fontWeight: 700, fontSize: "0.7rem", display: "block" }}>
                    🛡️ {pillar.protectionType}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* 4. DYNAMIC INJECTED CUSTOM STATUTES LIST (Vibrant Emerald Green) */}
        {engineState.customStatutes.length > 0 && (
          <Paper elevation={0} sx={{ p: 3, borderRadius: "18px", bgcolor: "#ecfdf5", border: "2px solid #10b981", mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <CheckCircleIcon sx={{ color: "#059669", fontSize: 26 }} />
              <Typography variant="h6" fontWeight={900} color="#065f46">
                🟢 नव-संवर्धित विधिक सुरक्षा धाराएं (Newly Enhanced Legal Statutes - ACTIVE GREEN):
              </Typography>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 900, color: "#064e3b", borderColor: "#a7f3d0" } }}>
                  <TableCell>अधिनियम (Act Name)</TableCell>
                  <TableCell>धारा (Section)</TableCell>
                  <TableCell>क्षेत्राधिकार (Jurisdiction)</TableCell>
                  <TableCell>विधिक लाभ व सुरक्षा (Legal Immunity Benefit)</TableCell>
                  <TableCell>सुरक्षा स्थिति</TableCell>
                  <TableCell>जोड़ने का समय</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {engineState.customStatutes.map((cs) => (
                  <TableRow key={cs.id} sx={{ bgcolor: "#ffffff" }}>
                    <TableCell sx={{ fontWeight: 800, color: "#047857", borderColor: "#a7f3d0" }}>{cs.actName}</TableCell>
                    <TableCell sx={{ fontWeight: 900, borderColor: "#a7f3d0" }}>{cs.section}</TableCell>
                    <TableCell sx={{ borderColor: "#a7f3d0" }}>{cs.jurisdiction}</TableCell>
                    <TableCell sx={{ borderColor: "#a7f3d0", fontWeight: 700, color: "#065f46" }}>{cs.legalBenefit}</TableCell>
                    <TableCell sx={{ borderColor: "#a7f3d0" }}>
                      <Chip label="🟢 संवर्धित व सक्रिय" size="small" sx={{ bgcolor: "#d1fae5", color: "#047857", fontWeight: 900, fontSize: "0.68rem" }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "#64748b", borderColor: "#a7f3d0" }}>{new Date(cs.addedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* 5. CONTINUOUS LEGAL ASSURANCE & GREEN CHANGE AUDIT TRAIL */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: "18px", bgcolor: "#f0fdf4", border: "2px solid #10b981", mb: 4 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={1.5} sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <CheckCircleIcon sx={{ color: "#059669", fontSize: 30 }} />
              <Box>
                <Typography variant="h6" fontWeight={900} color="#065f46">
                  🟢 सतत विधिक परिवर्तन सत्यापन एवं हरित आश्वासन केंद्र (Continuous Legal Assurance)
                </Typography>
                <Typography variant="caption" sx={{ color: "#047857", fontWeight: 800 }}>
                  हर बदलाव पर स्वतः 3-सूत्रीय विधिक परीक्षण: <strong>"इस परिवर्तन से कोई कानूनी अड़चन या अनजानी गलती नहीं आई है।"</strong>
                </Typography>
              </Box>
            </Stack>

            <Chip
              label="🟢 100% LAWFUL & SAFE (विधिक रूप से पूर्णतः सुरक्षित)"
              size="small"
              sx={{ bgcolor: "#d1fae5", color: "#065f46", fontWeight: 900, border: "1px solid #10b981", fontSize: "0.72rem" }}
            />
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 900, color: "#064e3b", borderColor: "#a7f3d0" } }}>
                <TableCell>संशोधन / निर्णय (Decision)</TableCell>
                <TableCell>संबद्ध कानून व धाराएं (Statutes)</TableCell>
                <TableCell>विधिक परीक्षण व आश्वासन (Audit Certification)</TableCell>
                <TableCell>प्रमाणीकरण समय</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {LegalChangeAuditService.getAuditTrail().map((am) => (
                <TableRow key={am.id} sx={{ bgcolor: "#ffffff" }}>
                  <TableCell sx={{ fontWeight: 900, color: "#047857", borderColor: "#a7f3d0" }}>
                    {am.decisionTitle}
                  </TableCell>
                  <TableCell sx={{ borderColor: "#a7f3d0", fontSize: "0.8rem", fontWeight: 700 }}>
                    {am.statutes.join(", ")}
                  </TableCell>
                  <TableCell sx={{ borderColor: "#a7f3d0" }}>
                    <Typography variant="caption" sx={{ color: "#059669", fontWeight: 800, display: "block" }}>
                      🟢 {am.sanityStatus}: {am.auditNote}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", color: "#64748b", borderColor: "#a7f3d0" }}>
                    {new Date(am.certifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* 6. 🔮 PREDICTIVE EARLY-WARNING & PROACTIVE THRESHOLD HUB [CODE F9] */}
        <PredictiveEarlyWarningConsole />

        {/* 7. ⏱️ 8-DAY VISUAL TIME MACHINE & RESTORE POINT CONSOLE [CODE F8] */}
        <SystemTimeMachineRollbackConsole />

        {/* 8. LIVE SELF-EVOLVING WHITE PAPER PREVIEW CONTAINER */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: "20px",
            bgcolor: "#ffffff",
            border: "2px solid #cbd5e1",
            boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={900} color="#0f172a">
                📄 लाइव स्वतः विकसित होने वाला श्वेत-पत्र (Live Evolving Legal White Paper View)
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                सॉफ़्टवेयर में किसी भी बदलाव के साथ यह दस्तावेज़ रीयल-टाइम में अपने आप अपडेट होता रहता है।
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              sx={{ fontWeight: 800, borderRadius: "8px", textTransform: "none" }}
            >
              प्रिंट निकालें (Print)
            </Button>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Box
            sx={{
              p: 3,
              borderRadius: "12px",
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontFamily: "'Segoe UI', Roboto, sans-serif",
              maxHeight: 500,
              overflowY: "auto",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: DynamicLegalComplianceEngine.generateLiveWhitePaperHTML() }} />
          </Box>
        </Paper>

        {/* MODAL: ADD NEW CUSTOM STATUTE */}
        <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 900, color: "#0f172a" }}>
            ➕ नई कानूनी धारा जोड़ें (Inject New Legal Statute)
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="अधिनियम / कानून का नाम (Act Name, e.g. भारतीय साक्ष्य संहिता 2023)"
                fullWidth
                size="small"
                value={newStatute.actName}
                onChange={(e) => setNewStatute({ ...newStatute, actName: e.target.value })}
              />
              <TextField
                label="धारा / नियम (Section / Clause, e.g. धारा 65B या Article 21)"
                fullWidth
                size="small"
                value={newStatute.section}
                onChange={(e) => setNewStatute({ ...newStatute, section: e.target.value })}
              />
              <TextField
                label="क्षेत्राधिकार (Jurisdiction, e.g. भारत, सुप्रीम कोर्ट, यूएसए)"
                fullWidth
                size="small"
                value={newStatute.jurisdiction}
                onChange={(e) => setNewStatute({ ...newStatute, jurisdiction: e.target.value })}
              />
              <TextField
                label="सॉफ़्टवेयर के लिए विधिक लाभ व सुरक्षा (Immunity Benefit & Compliance Rule)"
                fullWidth
                multiline
                rows={3}
                size="small"
                value={newStatute.legalBenefit}
                onChange={(e) => setNewStatute({ ...newStatute, legalBenefit: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setAddModalOpen(false)} sx={{ fontWeight: 700 }}>
              रद्द करें
            </Button>
            <Button
              variant="contained"
              onClick={handleAddCustomStatute}
              sx={{ bgcolor: "#0f172a", fontWeight: 900 }}
            >
              सहेजें व लाइव जोड़ें (Save & Inject)
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}
