import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import PredictiveEarlyWarningService from "../../services/predictiveEarlyWarningService.js";

export default function PredictiveEarlyWarningConsole() {
  const [rules, setRules] = useState(PredictiveEarlyWarningService.getRules());
  const [modalOpen, setModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", thresholdLimit: "", warningTiming: "" });
  const [alertMsg, setAlertMsg] = useState("");

  const refreshState = () => {
    setRules(PredictiveEarlyWarningService.getRules());
  };

  const handleAddRule = () => {
    if (!newRule.name || !newRule.thresholdLimit) {
      alert("कृपया नियम का नाम और थ्रेशोल्ड सीमा भरें।");
      return;
    }
    PredictiveEarlyWarningService.addCustomRule(newRule);
    setNewRule({ name: "", thresholdLimit: "", warningTiming: "" });
    setModalOpen(false);
    refreshState();
    setAlertMsg("🎉 नया अग्रिम चेतावनी नियम सफलतापूर्वक जोड़ दिया गया है!");
    setTimeout(() => setAlertMsg(""), 4000);
  };

  const handleTestAlert = (rule) => {
    PredictiveEarlyWarningService.sendTestEarlyWarning(rule);
    setAlertMsg(`🔮 अग्रिम तैयारी अलर्ट 4 फोन नंबरों व 4 ईमेल्स पर प्रेषित: ${rule.name}`);
    setTimeout(() => setAlertMsg(""), 4000);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: "20px",
        bgcolor: "#ffffff",
        border: "2px solid #cbd5e1",
        boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
        mb: 4,
      }}
    >
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              bgcolor: "#0f172a",
              color: "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BoltIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" fontWeight={900} color="#0f172a">
                🔮 भविष्यसूचक पूर्व-चेतावनी एवं अग्रिम तैयारी केंद्र (Predictive Early-Warning Hub)
              </Typography>
              <Chip
                label="[CODE F9] Proactive SRE Radar"
                size="small"
                sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 800, border: "1px solid #fde68a", fontSize: "0.68rem" }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
              समस्या या सीमा आने से 48 घंटे पहले ही अलर्ट, तैयारी चेकलिस्ट और 1-क्लिक AI ऑटो-स्केल प्रॉम्प्ट्स।
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddCircleIcon />}
          onClick={() => setModalOpen(true)}
          sx={{
            bgcolor: "#059669",
            color: "#ffffff",
            fontWeight: 900,
            borderRadius: "10px",
            textTransform: "none",
            px: 2.5,
            py: 1,
            "&:hover": { bgcolor: "#047857" },
          }}
        >
          ➕ नया अग्रिम नियम जोड़ें (Add Rule)
        </Button>
      </Stack>

      {alertMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: "10px", fontWeight: 800 }}>
          {alertMsg}
        </Alert>
      )}

      {/* 6 PROACTIVE RADAR CARDS */}
      <Grid container spacing={2}>
        {rules.map((rule) => (
          <Grid item xs={12} md={6} key={rule.id}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "14px",
                bgcolor: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={900} color="#0f172a">
                    {rule.name}
                  </Typography>
                  <Chip
                    label="🟢 100% HEALTHY"
                    size="small"
                    sx={{ bgcolor: "#ecfdf5", color: "#059669", fontWeight: 900, fontSize: "0.65rem", border: "1px solid #10b981" }}
                  />
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">वर्तमान स्थिति:</Typography>
                    <Typography variant="caption" fontWeight={900} color="#0284c7">{rule.currentValue}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">अलर्ट थ्रेशोल्ड:</Typography>
                    <Typography variant="caption" fontWeight={900} color="#d97706">{rule.thresholdLimit}</Typography>
                  </Box>
                </Stack>

                {/* READINESS CHECKLIST */}
                <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#ffffff", border: "1px dashed #cbd5e1", mb: 1.5 }}>
                  <Typography variant="caption" fontWeight={900} color="#0f172a" sx={{ display: "block", mb: 0.5 }}>
                    💡 क्या तैयारी करनी है (Readiness Checklist):
                  </Typography>
                  {rule.readinessChecklist.map((step, idx) => (
                    <Typography key={idx} variant="caption" sx={{ color: "#334155", display: "block", fontSize: "0.72rem" }}>
                      • {step}
                    </Typography>
                  ))}
                </Box>

                {/* AI AUTO-SCALE PROMPT */}
                <Box sx={{ p: 1, borderRadius: "6px", bgcolor: "#0f172a", color: "#f8fafc" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" sx={{ color: "#38bdf8", fontSize: "0.68rem", fontWeight: 800 }}>
                      🤖 AI ऑटो-स्केल प्रॉम्प्ट:
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(rule.antigravityPrompt);
                        alert("📋 AI प्रॉम्प्ट कॉपी हो गया है!");
                      }}
                      sx={{ color: "#38bdf8", fontSize: "0.62rem", textTransform: "none", p: 0 }}
                    >
                      📋 कॉपी
                    </Button>
                  </Stack>
                </Box>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<NotificationsActiveIcon />}
                onClick={() => handleTestAlert(rule)}
                sx={{ mt: 2, fontWeight: 800, textTransform: "none", borderRadius: "8px", borderColor: "#0284c7", color: "#0284c7" }}
              >
                🧪 टेस्ट अग्रिम चेतावनी भेजें
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ADD CUSTOM RULE MODAL */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: "#0f172a" }}>
          ➕ नया अग्रिम चेतावनी नियम जोड़ें (Add Proactive Rule)
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="नियम का नाम (उदा. टोकन वॉल्यूम 10 लाख पार)"
              fullWidth
              size="small"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            />
            <TextField
              label="थ्रेशोल्ड सीमा (उदा. 10 लाख टोकन)"
              fullWidth
              size="small"
              value={newRule.thresholdLimit}
              onChange={(e) => setNewRule({ ...newRule, thresholdLimit: e.target.value })}
            />
            <TextField
              label="चेतावनी समय (उदा. सीमा तक पहुँचने से 24 घंटे पहले)"
              fullWidth
              size="small"
              value={newRule.warningTiming}
              onChange={(e) => setNewRule({ ...newRule, warningTiming: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)} sx={{ fontWeight: 800 }}>रद्द करें</Button>
          <Button onClick={handleAddRule} variant="contained" sx={{ bgcolor: "#059669", fontWeight: 900 }}>
            सहेजें (Save Rule)
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
