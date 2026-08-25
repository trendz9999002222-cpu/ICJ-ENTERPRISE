import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Button,
  Chip,
  LinearProgress,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import VideocamIcon from "@mui/icons-material/Videocam";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StorageIcon from "@mui/icons-material/Storage";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import GavelIcon from "@mui/icons-material/Gavel";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import LegalHardwarePermissionsService from "../../services/legalHardwarePermissionsService.js";

const PERMISSION_ITEMS = [
  { icon: <MicIcon sx={{ color: "#0284c7" }} />, title: "🎙️ माइक्रोफ़ोन (Speech-to-Text)", desc: "हिंदी व क्षेत्रीय भाषा में बोलकर केस डायरी व याचिका ड्राफ्टिंग।" },
  { icon: <VideocamIcon sx={{ color: "#059669" }} />, title: "📹 कैमरा (Virtual Court & KYC)", desc: "ऑनलाइन कोर्ट पेशी, लाइव वीडियो कॉन्फ्रेंसिंग व e-KYC फेस वेरिफिकेशन।" },
  { icon: <LocationOnIcon sx={{ color: "#d97706" }} />, title: "📍 न्यायक्षेत्र सेंसर (Jurisdiction)", desc: "स्वतः राज्य, जिला व तहसील कोर्ट क्षेत्राधिकार पहचान व GPS शपथ-पत्र।" },
  { icon: <StorageIcon sx={{ color: "#7c3aed" }} />, title: "💾 500MB+ स्थायी वॉल्ट (Storage)", desc: "जीरो-नॉलेज फाइल सुरक्षा: ब्राउज़र आपकी केस फाइलों को कभी डिलीट नहीं करेगा।" },
  { icon: <VolumeUpIcon sx={{ color: "#0891b2" }} />, title: "🔊 स्पीकर (Voice Judgment)", desc: "अदालती आदेश व फैसले बोलकर सुनाना और अगली तारीख के अलर्ट्स।" },
  { icon: <ContentCopyIcon sx={{ color: "#e11d48" }} />, title: "📋 क्लिपबोर्ड व वेक-लॉक", desc: "1-क्लिक ड्राफ्ट कॉपी और लंबी अदालती बहस में स्क्रीन चालू रखना।" },
];

export default function UnifiedLegalPermissionGate() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show only if not already master granted
    if (!LegalHardwarePermissionsService.isMasterGranted()) {
      setOpen(true);
    }
  }, []);

  const handleGrantAll = async () => {
    setLoading(true);
    await LegalHardwarePermissionsService.requestAllPermissions();
    setLoading(false);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          bgcolor: "#ffffff",
          p: { xs: 1, sm: 2 },
          boxShadow: "0 25px 60px rgba(15, 23, 42, 0.35)",
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* HEADER */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "16px",
              bgcolor: "#0f172a",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GavelIcon sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={900} color="#0f172a">
              🏛️ ICJ विधिक उपकरण एवं सुरक्षा अनुमति केंद्र
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
              Sovereign Legal Hardware & Zero-Knowledge Workspace Activation (One-Time Setup)
            </Typography>
          </Box>
        </Stack>

        <Typography variant="body2" sx={{ color: "#334155", mb: 3, lineHeight: 1.6, fontWeight: 600 }}>
          140 करोड़ भारतीय नागरिकों, अधिवक्ताओं और 25 हाई कोर्ट्स के डिजिटल काम को <strong>Google-ग्रेड स्पीड व 60 FPS पर चलाने हेतु</strong> निम्नलिखित विधिक उपकरणों को 1-क्लिक में सक्रिय करें:
        </Typography>

        {/* 6 PERMISSIONS GRID */}
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          {PERMISSION_ITEMS.map((item, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "14px",
                  bgcolor: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                }}
              >
                <Box sx={{ mt: 0.5 }}>{item.icon}</Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={900} color="#0f172a">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5, lineHeight: 1.4 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: "4px" }} color="primary" />}

        {/* ACTION BUTTONS */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
          <Button
            variant="text"
            onClick={() => {
              LegalHardwarePermissionsService.setMasterGranted(true);
              setOpen(false);
            }}
            sx={{ fontWeight: 800, textTransform: "none", color: "#64748b" }}
          >
            बाद में पूछें (Skip for now)
          </Button>

          <Button
            variant="contained"
            disabled={loading}
            onClick={handleGrantAll}
            startIcon={<VerifiedUserIcon />}
            sx={{
              fontWeight: 900,
              textTransform: "none",
              borderRadius: "12px",
              bgcolor: "#059669",
              px: 3.5,
              py: 1.3,
              fontSize: "0.95rem",
              "&:hover": { bgcolor: "#047857" },
            }}
          >
            {loading ? "सक्रिय हो रहा है..." : "🏛️ सभी विधिक उपकरण सक्रिय करें (Grant All & Enter)"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
