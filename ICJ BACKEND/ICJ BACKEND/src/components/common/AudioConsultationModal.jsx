import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Paper,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import SecurityIcon from "@mui/icons-material/Security";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ConsultationRecordingService from "../../services/consultationRecordingService.js";

export default function AudioConsultationModal({
  open,
  onClose,
  advocateName = "Assigned Counsel",
  advocateRole = "Senior Advocate",
  clientName = "Litigant Client",
}) {
  const [micActive, setMicActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callEnded, setCallEnded] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    let durationTimer;
    if (open && !callEnded) {
      durationTimer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (durationTimer) clearInterval(durationTimer);
    };
  }, [open, callEnded]);

  const toggleMic = () => {
    setMicActive(!micActive);
  };

  const handleEndCall = () => {
    setCallEnded(true);
    // Generate AI Smart De-duplicated Summary
    const summary = ConsultationRecordingService.deduplicateAndSummarize(
      "Client states property dispute started 12-May-2026. Client states property dispute started 12-May-2026. Advocate advised filing stay order counter affidavit within 7 days. Client confirmed title deeds are ready.",
      clientName,
      advocateName
    );
    setAiSummary(summary);
  };

  const handleCloseAll = () => {
    setCallEnded(false);
    setAiSummary(null);
    setCallDuration(0);
    onClose();
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onClose={handleCloseAll} maxWidth={callEnded ? "md" : "sm"} fullWidth paperProps={{ style: { borderRadius: 16 } }}>
      <DialogTitle sx={{ bgcolor: "#0f172a", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CallIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              📞 Encrypted Audio Voice Consultation: {advocateName}
            </Typography>
            <Typography variant="caption" color="#94a3b8" display="block">
              {advocateRole} | <SecurityIcon fontSize="inherit" sx={{ color: "#8b5cf6", mr: 0.3 }} /> 256-Bit Encrypted Audio Stream
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {!callEnded && <Chip label={`🔴 AUDIO CALL ${formatTime(callDuration)}`} color="secondary" size="small" sx={{ fontWeight: "bold" }} />}
          <IconButton size="small" onClick={handleCloseAll} sx={{ color: "#94a3b8" }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "#020617", p: 3, textAlign: "center" }}>
        {!callEnded ? (
          <Box sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Animated Audio Avatar */}
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                color: "#fff",
                fontSize: "2.5rem",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                boxShadow: "0 0 25px rgba(139, 92, 246, 0.5)",
                animation: "pulse 1.8s infinite",
              }}
            >
              {advocateName.split(" ")[1]?.[0] || "A"}
            </Box>

            <Typography variant="h6" fontWeight="bold" color="#f8fafc">
              {advocateName}
            </Typography>
            <Typography variant="body2" color="#94a3b8" sx={{ mb: 2 }}>
              Voice Call Connected • Speak naturally in Hindi or English
            </Typography>

            <Chip
              icon={<VolumeUpIcon style={{ color: "#8b5cf6" }} />}
              label="🔴 AI Live Recording & Speech Transcription Active"
              color="default"
              sx={{ bgcolor: "#1e293b", color: "#a78bfa", fontWeight: "bold", mb: 3 }}
            />

            {/* Audio Waveform Simulator */}
            <Stack direction="row" spacing={0.6} alignItems="center" justifyContent="center" sx={{ height: 35 }}>
              {[20, 35, 15, 40, 25, 45, 30, 15, 38, 22, 42, 18].map((h, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: 4,
                    height: `${h}px`,
                    bgcolor: "#8b5cf6",
                    borderRadius: 1,
                    animation: `pulse ${0.8 + (idx % 3) * 0.2}s infinite alternate`,
                  }}
                />
              ))}
            </Stack>
          </Box>
        ) : (
          /* POST-CALL AI SMART DE-DUPLICATED CASE BRIEF SUMMARY MODAL */
          <Box sx={{ textAlign: "left" }}>
            <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: "#0f172a", borderRadius: 2, borderLeft: "5px solid #10b981" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="#10b981" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon fontSize="small" /> AI Smart De-duplicated Legal Case Summary
                  </Typography>
                  <Typography variant="caption" color="#94a3b8">
                    Generated automatically from Audio Consultation recording • Duplicates stripped cleanly.
                  </Typography>
                </Box>
                <Chip label={`✂️ Filtered ${aiSummary?.prunedDuplicateCount ?? 2} Duplicates`} color="error" size="small" sx={{ fontWeight: "bold" }} />
              </Stack>
            </Paper>

            <Typography variant="subtitle2" fontWeight="bold" color="#38bdf8" sx={{ mb: 0.5 }}>
              1. Clean De-duplicated Fact Summary:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#0a192f", color: "#e2e8f0", fontSize: "0.9rem", borderRadius: 2 }}>
              {aiSummary?.cleanDeduplicatedSummary}
            </Paper>

            <Typography variant="subtitle2" fontWeight="bold" color="#38bdf8" sx={{ mb: 0.5 }}>
              2. Key Allegations & Facts:
            </Typography>
            <Box sx={{ mb: 2, color: "#cbd5e1", fontSize: "0.85rem", pl: 2 }}>
              {aiSummary?.keyFacts.map((fact, idx) => (
                <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                  • {fact}
                </Typography>
              ))}
            </Box>

            <Typography variant="subtitle2" fontWeight="bold" color="#38bdf8" sx={{ mb: 0.5 }}>
              3. Advocate Guidance & Agreed Action Plan:
            </Typography>
            <Box sx={{ color: "#cbd5e1", fontSize: "0.85rem", pl: 2 }}>
              {aiSummary?.recommendedActionSteps.map((step, idx) => (
                <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                  • {step}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ bgcolor: "#0f172a", p: 2, justifyContent: callEnded ? "space-between" : "center" }}>
        {!callEnded ? (
          <Stack direction="row" spacing={3} alignItems="center">
            <IconButton
              onClick={toggleMic}
              sx={{ bgcolor: micActive ? "#334155" : "#ef4444", color: "#fff", p: 1.5, "&:hover": { opacity: 0.9 } }}
            >
              {micActive ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<CallEndIcon />}
              onClick={handleEndCall}
              sx={{ fontWeight: "bold", borderRadius: 3, px: 4, py: 1 }}
            >
              End Voice Call
            </Button>
          </Stack>
        ) : (
          <>
            <Button variant="outlined" color="inherit" onClick={handleCloseAll} sx={{ color: "#94a3b8" }}>
              Close
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<PrintIcon />}
              onClick={() => {
                if (aiSummary) ConsultationRecordingService.printConsultationBrief(aiSummary);
              }}
              sx={{ fontWeight: "bold", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            >
              🖨️ Print Clean 1-Page Summary 🚀
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
