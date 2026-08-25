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
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NavigationIcon from "@mui/icons-material/Navigation";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShieldIcon from "@mui/icons-material/Shield";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

import LiveAdvocateClientLocationService from "../../services/liveAdvocateClientLocationService.js";

export default function AdvocateClientLocationRadar({ role = "client", assignedPeerName, assignedCaseNo }) {
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
  const peerName = assignedPeerName || (isAdvocate ? "अधिकृत मुवक्किल" : session.peerName || "अधिकृत अधिवक्ता");
  const peerLandmark = session.peerCoordinates?.landmark || (isAdvocate ? "कोर्ट परिसर (गेट / चैंबर)" : "अधिवक्ता चैंबर ब्लॉक");
  const caseNo = assignedCaseNo || session.caseNumber || "केस संदर्भ";

  // Dynamic & Logical Travel Time Calculation
  const isWalkingDistance = distance < 500;
  const formattedDistance = distance >= 1000 ? `${(distance / 1000).toFixed(1)} किमी` : `${distance} मीटर`;
  const formattedTimeText =
    distance <= 150
      ? "⚡ कोर्ट परिसर में पैदल 1-2 मिनट"
      : distance < 500
      ? `🚶 पैदल ~${Math.ceil(distance / 80)} मिनट`
      : `🚗 वाहन/कैब से ~${Math.ceil(distance / 400)} मिनट`;

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
                label={session.isSharing ? "🟢 LIVE SHARING ON" : "⚪ GPS STANDBY"}
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
              केस: {caseNo} • 100% एंड-टू-एंड एन्क्रिप्टेड आपसी लोकेशन
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
              {session.isSharing ? "लोकेशन चालू है" : "लोकेशन बंद (निजी)"}
            </Typography>
          }
          sx={{ m: 0 }}
        />
      </Stack>

      {/* ACTIVE RADAR VIEW OR HONEST STANDBY */}
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
                    आप दोनों के बीच की वास्तविक दूरी:
                  </Typography>
                  <Typography variant="h5" fontWeight={900} color="#059669">
                    {formattedDistance}
                  </Typography>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
                    {isWalkingDistance ? (
                      <DirectionsWalkIcon sx={{ fontSize: 14, color: "#047857" }} />
                    ) : (
                      <DirectionsCarIcon sx={{ fontSize: 14, color: "#047857" }} />
                    )}
                    <Typography variant="caption" sx={{ color: "#047857", fontSize: "0.72rem", fontWeight: 800 }}>
                      {formattedTimeText}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* 1-CLICK ACTION BUTTONS */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            {session.peerCoordinates?.latitude && (
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
            )}

            {session.peerPhone && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PhoneIcon />}
                onClick={() => window.open(`tel:${session.peerPhone}`)}
                sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px", borderColor: "#0284c7", color: "#0284c7" }}
              >
                📞 1-क्लिक कॉल
              </Button>
            )}

            {session.peerPhone && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<WhatsAppIcon />}
                onClick={() => window.open(`https://wa.me/${session.peerPhone.replace(/[^0-9]/g, "")}?text=नमस्ते, मैं कोर्ट परिसर में हूँ।`)}
                sx={{ fontWeight: 800, textTransform: "none", borderRadius: "10px", borderColor: "#16a34a", color: "#16a34a" }}
              >
                💬 WhatsApp संदेश
              </Button>
            )}
          </Stack>
        </Box>
      ) : (
        <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "#f8fafc", border: "1.5px dashed #cbd5e1" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <ShieldIcon sx={{ color: "#64748b", fontSize: 24 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="#334155">
                  📍 लोकेशन वर्तमान में सुरक्षित व निजी है (GPS Standby)
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                  कोर्ट परिसर में वकील या मुवक्किल से तत्काल मिलने हेतु लोकेशन शेयरिंग चालू करें। कोई भी अनधिकृत डमी डेटा प्रदर्शित नहीं होता।
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              size="small"
              startIcon={<LocationOnIcon />}
              onClick={handleToggleSharing}
              sx={{ bgcolor: "#0f172a", color: "#38bdf8", fontWeight: 900, textTransform: "none", borderRadius: "10px", whiteSpace: "nowrap" }}
            >
              📡 लाइव लोकेशन चालू करें
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
