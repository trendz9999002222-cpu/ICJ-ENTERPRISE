import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Stack,
  Alert,
  Chip,
  TextField,
  MenuItem,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import NotificationRoutingService from "../../services/notificationRoutingService.js";

function SOSLegalHotline({ currentUserId = "26ICJ08AA0001", currentUserName = "Litigant" }) {
  const [emergencyType, setEmergencyType] = useState("ARREST_BAIL");
  const [district, setDistrict] = useState("Lucknow District");
  const [phone, setPhone] = useState("9876543210");
  const [details, setDetails] = useState("");
  const [sosSent, setSosSent] = useState(false);
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);

  const handleTriggerSOS = () => {
    // 1. Dispatch Emergency Continuous Siren Alert
    NotificationRoutingService.dispatchNotification({
      title: `🚨 EMERGENCY SOS: ${emergencyType} (${district})`,
      message: `Emergency legal dispatch requested by ${currentUserName} (${currentUserId}). Contact Phone: ${phone}. Details: ${details || "Immediate legal counsel needed."}`,
      priority: "CRITICAL",
      targetAudience: "ALL_ADVOCATES",
      senderName: currentUserName,
      senderRole: "litigant",
    });

    setSosSent(true);
    setIsSirenPlaying(true);
  };

  const handleSilenceSiren = () => {
    NotificationRoutingService.silenceSiren();
    setIsSirenPlaying(false);
  };

  return (
    <Paper sx={{ p: 3, bgcolor: "#450a0a", border: "3px solid #ef4444", borderRadius: 3, color: "#ffffff" }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
        <WarningIcon sx={{ color: "#fca5a5", fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={800} color="#ffffff">
            🚨 1-Click Panic SOS Emergency Legal Hotline
          </Typography>
          <Typography variant="caption" color="#fecaca">
            Immediate 24/7 Legal Counsel Dispatch for Police Arrest, Midnight Bail & Injunctions
          </Typography>
        </Box>
      </Stack>

      {sosSent && (
        <Alert severity="warning" sx={{ mb: 2, bgcolor: "#7f1d1d", color: "#fca5a5", border: "1px solid #f87171" }}>
          🚨 <strong>EMERGENCY SOS DISPATCHED!</strong> Continuous Siren Ringing. Empaneled Lawyers & District Franchisee Notified!
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="Emergency Type"
            value={emergencyType}
            onChange={(e) => setEmergencyType(e.target.value)}
            sx={{
              select: { color: "#ffffff", fontWeight: 700 },
              label: { color: "#fca5a5", fontWeight: 800 },
              "& .MuiOutlinedInput-root": { bgcolor: "#1e293b", "& fieldset": { borderColor: "#ef4444" } },
            }}
          >
            <MenuItem value="ARREST_BAIL">🚨 Police Custody / Immediate Arrest / Bail</MenuItem>
            <MenuItem value="ILLEGAL_DETENTION">⚖️ Illegal Detention / Habeas Corpus</MenuItem>
            <MenuItem value="COURT_INJUNCTION">📜 Emergency Court Stay Order / Injunction</MenuItem>
            <MenuItem value="WOMEN_SAFETY">🛡️ Domestic Violence / Women Safety</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Emergency District / City Location"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            sx={{
              input: { color: "#ffffff", fontWeight: 700 },
              label: { color: "#fca5a5", fontWeight: 800 },
              "& .MuiOutlinedInput-root": { bgcolor: "#1e293b", "& fieldset": { borderColor: "#ef4444" } },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Callback Contact Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            sx={{
              input: { color: "#ffffff", fontWeight: 700 },
              label: { color: "#fca5a5", fontWeight: 800 },
              "& .MuiOutlinedInput-root": { bgcolor: "#1e293b", "& fieldset": { borderColor: "#ef4444" } },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Brief Situation Note (Optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            sx={{
              input: { color: "#ffffff", fontWeight: 600 },
              label: { color: "#fca5a5", fontWeight: 800 },
              "& .MuiOutlinedInput-root": { bgcolor: "#1e293b", "& fieldset": { borderColor: "#ef4444" } },
            }}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<PhoneInTalkIcon />}
          onClick={handleTriggerSOS}
          sx={{ fontWeight: 800, fontSize: "1rem", py: 1.2, flexGrow: 1, boxShadow: "0 0 15px rgba(239, 68, 68, 0.6)" }}
        >
          🚨 TRIGGER 1-CLICK PANIC SOS DISPATCH
        </Button>

        {isSirenPlaying && (
          <Button variant="contained" color="warning" onClick={handleSilenceSiren} sx={{ fontWeight: 800 }}>
            🔕 Silence Siren
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default SOSLegalHotline;
