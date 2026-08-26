import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Stack,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SyncDispatcher, { SYNC_EVENTS } from "../../utils/syncDispatcher.js";
import AppBootSanitizer from "../../services/appBootSanitizer.js";

export default function SandboxAndResetCenter() {
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [presentationMode, setPresentationMode] = useState(() => {
    return localStorage.getItem("icj_dev_presentation_mode") === "true";
  });

  const handleTogglePresentation = (e) => {
    const enabled = e.target.checked;
    setPresentationMode(enabled);
    localStorage.setItem("icj_dev_presentation_mode", enabled ? "true" : "false");
    setAlertType(enabled ? "info" : "warning");
    setAlertMsg(
      enabled
        ? "🛡️ Presentation / Testing Mode ON: 15-minute idle timeout lock disabled."
        : "🔒 Presentation Mode OFF: Standard 15-minute session security lock restored."
    );
    setTimeout(() => setAlertMsg(""), 4000);
  };

  const handleInjectDemoData = () => {
    try {
      // 1. Inject sample advocate
      const sampleAdvocate = {
        id: "26ICJ08AA0002",
        member_id: "26ICJ08AA0002",
        name: "Senior Advocate PAWAN GUPTA",
        fullName: "Senior Advocate PAWAN GUPTA",
        email: "advocate.pawan@icj.org",
        phone: "+91 9999002222",
        enrollment_number: "D/1042/1998",
        jurisdiction: "Supreme Court of India, Allahabad High Court & Delhi High Court",
        specialization: ["Civil Disputes", "Property & Land Title", "Constitutional Writs"],
        status: "ACTIVE",
        user_type: "advocate",
        role: "advocate",
      };

      // 2. Inject sample client
      const sampleClient = {
        id: "26CLT08AA0004",
        member_id: "26CLT08AA0004",
        name: "Ramvir Jatav",
        fullName: "Ramvir Jatav",
        email: "ramvir.jatav@example.com",
        phone: "+91 8700974739",
        status: "ACTIVE",
        user_type: "client",
        role: "client",
      };

      // 3. Inject sample case
      const sampleCase = {
        id: "ICJ/2026/CS/101",
        caseNumber: "ICJ/2026/CS/101",
        title: "Land Boundary & Agricultural Title Dispute",
        clientName: "Ramvir Jatav",
        member_id: "26CLT08AA0004",
        advocateName: "Senior Advocate PAWAN GUPTA",
        advocate_id: "26ICJ08AA0002",
        courtName: "Hon'ble High Court of Judicature",
        court: "Hon'ble High Court of Judicature",
        category: "CIVIL_PROPERTY",
        status: "Counsel Assigned",
        trustApprovalStatus: "Trust Approved",
        feeAmount: 35000,
        paidAmount: 35000,
        nextHearing: "2026-09-15",
        summary: "Title declaration and permanent injunction suit regarding ancestral agricultural plot boundary demarcation.",
        filedAt: new Date().toISOString(),
      };

      // Save to localStorage
      const existingMembers = JSON.parse(localStorage.getItem("icj_members") || "[]");
      const filteredMembers = existingMembers.filter(
        (m) => m.member_id !== sampleAdvocate.member_id && m.member_id !== sampleClient.member_id
      );
      filteredMembers.push(sampleAdvocate, sampleClient);
      localStorage.setItem("icj_members", JSON.stringify(filteredMembers));

      const existingCases = JSON.parse(localStorage.getItem("icj_legal_cases_v2") || "[]");
      const filteredCases = existingCases.filter((c) => c.id !== sampleCase.id);
      filteredCases.push(sampleCase);
      localStorage.setItem("icj_legal_cases_v2", JSON.stringify(filteredCases));
      localStorage.setItem("icj_legal_cases", JSON.stringify(filteredCases));

      // Broadcast event across all open tabs
      SyncDispatcher.dispatch(SYNC_EVENTS.CASE_UPDATED, sampleCase);
      SyncDispatcher.dispatch(SYNC_EVENTS.DEMO_DATA_LOADED);

      setAlertType("success");
      setAlertMsg("🟢 Demo Dataset Injected Successfully! 1 Advocate, 1 Client, and 1 Active Case loaded across all tabs.");
      setTimeout(() => setAlertMsg(""), 5000);
    } catch (err) {
      console.error("Demo data injection error:", err);
      setAlertType("error");
      setAlertMsg("Error injecting demo data.");
    }
  };

  const handleFactoryResetVirgin = () => {
    if (
      !window.confirm(
        "⚠️ क्या आप 100% वर्जिन स्टेट फैक्ट्री रीसेट करना चाहते हैं?\nसभी डेमो केसेस, डमी डेटा व कैश पूरी तरह साफ़ हो जाएंगे और केवल 1 सुपर एडमिन खाता सुरक्षित रहेगा।"
      )
    ) {
      return;
    }

    try {
      localStorage.removeItem("icj_purge_version");
      AppBootSanitizer.run();
      SyncDispatcher.dispatch(SYNC_EVENTS.VIRGIN_RESET_TRIGGERED);

      setAlertType("success");
      setAlertMsg("🔴 100% Factory Reset to Virgin State Complete! System is pristine.");
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error("Factory reset error:", err);
    }
  };

  return (
    <Box sx={{ color: "#ffffff" }}>
      {alertMsg && (
        <Alert severity={alertType} sx={{ mb: 3, fontWeight: "bold" }}>
          {alertMsg}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* PRESENTATION MODE TOGGLE */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: "#1e293b", borderRadius: 3, border: "1px solid #334155" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <SecurityIcon sx={{ color: "#38bdf8", fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={800} color="#ffffff">
                    🛡️ Presentation & Developer Mode (डेवलपमेंट व टेस्टिंग मोड)
                  </Typography>
                </Stack>
                <Typography variant="body2" color="#94a3b8" sx={{ mt: 0.5 }}>
                  इस मोड को चालू रखने पर 15-मिनट की निष्क्रियता (Idle Timeout) के कारण स्क्रीन कभी लॉक नहीं होगी।
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={presentationMode}
                    onChange={handleTogglePresentation}
                    color="primary"
                    sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#38bdf8" } }}
                  />
                }
                label={
                  <Chip
                    label={presentationMode ? "🟢 PRESENTATION MODE ACTIVE" : "⚪ STANDARD SECURITY MODE"}
                    sx={{
                      fontWeight: 800,
                      bgcolor: presentationMode ? "#0284c7" : "#334155",
                      color: "#ffffff",
                    }}
                  />
                }
              />
            </Stack>
          </Paper>
        </Grid>

        {/* 1-CLICK DEMO INJECTOR */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "#1e293b", borderRadius: 3, border: "1px solid #10b981", height: "100%" }}>
            <CardContent sx={{ p: 3.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                <PlayCircleFilledWhiteIcon sx={{ color: "#10b981", fontSize: 32 }} />
                <Typography variant="h6" fontWeight={800} color="#ffffff">
                  🟢 Load Realistic Demo Sandbox
                </Typography>
              </Stack>

              <Typography variant="body2" color="#94a3b8" mb={2.5}>
                जब आप किसी क्लाइंट, वकील या ट्रस्टी को सॉफ्टवेयर का <strong>लाइव डेमो / प्रेजेंटेशन</strong> दिखाना चाहते हैं,
                तो यह 1-क्लिक में 1 वकील, 1 क्लाइंट व 1 एक्टिव केस इंजेक्ट कर देगा।
              </Typography>

              <Paper sx={{ p: 2, bgcolor: "#0f172a", borderRadius: 2, mb: 3, border: "1px solid #334155" }}>
                <Typography variant="caption" color="#cbd5e1" display="block">
                  • <b>Advocate:</b> Senior Advocate PAWAN GUPTA (26ICJ08AA0002)
                </Typography>
                <Typography variant="caption" color="#cbd5e1" display="block">
                  • <b>Client:</b> Ramvir Jatav (26CLT08AA0004)
                </Typography>
                <Typography variant="caption" color="#cbd5e1" display="block">
                  • <b>Case:</b> Land Title & Boundary Dispute (ICJ/2026/CS/101)
                </Typography>
              </Paper>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<PlayCircleFilledWhiteIcon />}
                onClick={handleInjectDemoData}
                sx={{
                  bgcolor: "#10b981",
                  "&:hover": { bgcolor: "#059669" },
                  fontWeight: 800,
                  py: 1.4,
                  borderRadius: 2,
                }}
              >
                डेमो डेटा लोड करें (Inject Demo Sandbox)
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 1-CLICK FACTORY RESET TO VIRGIN */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "#1e293b", borderRadius: 3, border: "1px solid #ef4444", height: "100%" }}>
            <CardContent sx={{ p: 3.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                <RestartAltIcon sx={{ color: "#ef4444", fontSize: 32 }} />
                <Typography variant="h6" fontWeight={800} color="#ffffff">
                  🔴 100% Factory Reset to Virgin State
                </Typography>
              </Stack>

              <Typography variant="body2" color="#94a3b8" mb={2.5}>
                डेमो पूरा होने के बाद या प्रोडक्शन में जाने से पहले, 1-क्लिक में पूरा सिस्टम वापस शुद्ध <strong>0 डेटा (Clean Slate)</strong> पर रीसेट करें।
              </Typography>

              <Paper sx={{ p: 2, bgcolor: "#0f172a", borderRadius: 2, mb: 3, border: "1px solid #334155" }}>
                <Typography variant="caption" color="#fca5a5" display="block">
                  • सभी डेमो केसेस व डॉक्यूमेंट्स स्थायी रूप से साफ़ होंगे।
                </Typography>
                <Typography variant="caption" color="#fca5a5" display="block">
                  • सभी वॉलेट व लेजर ₹0.00 पर रीसेट होंगे।
                </Typography>
                <Typography variant="caption" color="#fca5a5" display="block">
                  • केवल 1 सुपर एडमिन खाता (<code>ICJSuperAdmin1234</code>) सुरक्षित रहेगा।
                </Typography>
              </Paper>

              <Button
                fullWidth
                variant="contained"
                size="large"
                color="error"
                startIcon={<RestartAltIcon />}
                onClick={handleFactoryResetVirgin}
                sx={{
                  fontWeight: 800,
                  py: 1.4,
                  borderRadius: 2,
                  bgcolor: "#ef4444",
                  "&:hover": { bgcolor: "#dc2626" },
                }}
              >
                फैक्ट्री रीसेट करें (100% Clean Virgin Reset)
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
