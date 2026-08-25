import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  LinearProgress,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NavigationIcon from "@mui/icons-material/Navigation";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ShieldIcon from "@mui/icons-material/Shield";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import LiveAdvocateClientLocationService from "../../services/liveAdvocateClientLocationService.js";

export default function AdvocateClientLocationRadar({ role = "client" }) {
  const [session, setSession] = useState(LiveAdvocateClientLocationService.getSession());
  const [distance, setDistance] = useState(LiveAdvocateClientLocationService.calculatePeerDistance());

  const refreshState = () => {
    const s = LiveAdvocateClientLocationService.getSession();
    setSession(s);
    setDistance(LiveAdvocateClientLocationService.calculatePeerDistance());
  };

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSharing = () => {
    if (session.isSharing) {
      LiveAdvocateClientLocationService.stopSharing();
    } else {
      LiveAdvocateClientLocationService.startSharing(60, role);
    }
    refreshState();
  };

  const isAdvocate = role === "advocate";
  const peerTitle = isAdvocate ? "मुवक्किल (Client)" : "आपके अधिकृत अधिवक्ता (Assigned Advocate)";
  const peerName = isAdvocate ? "श्री सुरेश कुमार (वादी)" : session.peerName;
  const peerLandmark = isAdvocate ? "मेन कोर्ट गेट नं 2 (पार्किंग के पास)" : session.peerCoordinates?.landmark || "चैंबर नं 42, ब्लॉक B";

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: "18px",
        bgcolor: session.isSharing ? "#f0fdf4" : "#ffffff",
        border: `2px solid ${session.isSharing ? "#10b981" : "#e2e8f0"}`,
        boxShadow: session.isSharing ? "0 8px 25px rgba(16, 185, 129, 0.15)" : "0 4px 14px rgba(0,0,0,0.04)",
        transition: "all 0.3s ease",
        mb: 3,
      }}
    >
      {/* HEADER WITH ON/OFF SWITCH */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              bgcolor: session.isSharing ? "#059669" : "#0f172a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LocationOnIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                📍 कोर्ट परिसर लाइव लोकेशन रडार (Court Rendezvous)
              </Typography>
              <Chip
                label={session.isSharing ? "🟢 LIVE SHARING ON" : "⚪ OFF (PRIVATE)"}
                size="small"
                sx={{
                  bgcolor: session.isSharing ? "#d1fae5" : "#f1f5f9",
                  color: session.isSharing ? "#065f46" : "#64748b",
                  fontWeight: 900,
                  fontSize: "0.68rem",
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
              केस नं: {session.caseNumber} • 100% एन्क्रिप्टेड आपसी लोकेशन
            </Typography>
          </Box>
        </Stack>

        <FormControlLabel
          control={
            <Switch
              checked={session.isSharing}
              onChange={handleToggleSharing}
              color="success"
            />
          }
          label={
            <Typography variant="caption" fontWeight={900} color={session.isSharing ? "#059669" : "#64748b"}>
              {session.isSharing ? "लोकेशन चालू है" : "लोकेशन बंद करें"}
            </Typography>
          }
          sx={{ m: 0 }}
        />
      </Stack>

      {/* ACTIVE RADAR VIEW */}
      {session.isSharing ? (
        <Box>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "14px",
              bgcolor: "#ffffff",
              border: "1.5px solid #a7f3d0",
              mb: 2,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={7}>
                <Typography variant="caption" sx={{ color: "#059669", fontWeight: 800, textTransform: "uppercase" }}>
                  🎯 {peerTitle}
                </Typography>
                <Typography variant="subtitle1" fontWeight={900} color="#0f172a">
                  {peerName}
                </Typography>
                <Typography variant="body2" sx={{ color: "#334155", fontWeight: 700, mt: 0.5 }}>
                  📍 वर्तमान स्थान: <strong>{peerLandmark}</strong>
                </Typography>
              </Grid>

              <Grid item xs={12} sm={5}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "10px",
                    bgcolor: "#ecfdf5",
                    border: "1px solid #10b981",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" fontWeight={800} color="#065f46" display="block">
                    आप दोनों के बीच की दूरी:
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color="#059669">
                    {distance} मीटर
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#047857", fontSize: "0.7rem", fontWeight: 700 }}>
                    ⚡ पैदल 1-2 मिनट की दूरी पर
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* 1-CLICK ACTION BUTTONS */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              size="small"
              startIcon={<NavigationIcon />}
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${session.peerCoordinates.latitude},${session.peerCoordinates.longitude}`,
                  "_blank"
                );
              }}
              sx={{
                bgcolor: "#059669",
                color: "#ffffff",
                fontWeight: 900,
                textTransform: "none",
                borderRadius: "10px",
                px: 2.5,
                py: 1,
                "&:hover": { bgcolor: "#047857" },
              }}
            >
              🗺️ दिशा देखें व नेविगेट करें (Get Directions)
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<PhoneIcon />}
              onClick={() => window.open(`tel:${session.peerPhone}`)}
              sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px", borderColor: "#0284c7", color: "#0284c7" }}
            >
              📞 1-क्लिक कॉल
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<WhatsAppIcon />}
              onClick={() => window.open(`https://wa.me/${session.peerPhone.replace(/[^0-9]/g, "")}?text=नमस्ते, मैं कोर्ट परिसर में हूँ।`)}
              sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px", borderColor: "#16a34a", color: "#16a34a" }}
            >
              💬 WhatsApp संदेश
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "#f8fafc", border: "1px dashed #cbd5e1" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ShieldIcon sx={{ color: "#64748b", fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
              आपकी लोकेशन अभी <strong>निजी (Private)</strong> है। कोर्ट परिसर में अपने {isAdvocate ? "मुवक्किल" : "वकील"} को ढूंढने के लिए ऊपर दिए गए स्विच को <strong>[लोकेशन चालू करें]</strong> पर टॉगल करें।
            </Typography>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
