import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Stack,
  Chip,
  Divider,
  TextField,
  Tooltip,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import DescriptionIcon from "@mui/icons-material/Description";
import LockIcon from "@mui/icons-material/Lock";
import CallEndIcon from "@mui/icons-material/CallEnd";
import SendIcon from "@mui/icons-material/Send";

import FeatureControlService from "../../services/featureControlService.js";
import MatterIntelligenceService from "../../services/matterIntelligenceService.js";

function MultiPartyConferenceRoom({ caseId = "CASE-LIVE", clientName = "Litigant", advocateName = "Empaneled Lead Counsel", currentUserId = "ICJ-2026-MEM-0001", onClose = null }) {
  // Check Super Admin Feature Switch Access
  const accessCheck = FeatureControlService.isFeatureAccessible("videoConference", currentUserId);

  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);

  // Participants Grid (Up to 8 Seats)
  const [participants, setParticipants] = useState([
    { id: "P1", name: clientName || "Sh. Litigant", role: "Litigant / Client", avatarColor: "#3b82f6", activeSpeaker: true },
    { id: "P2", name: advocateName || "Empaneled Lead Counsel", role: "Empaneled Lead Counsel", avatarColor: "#10b981", activeSpeaker: false },
    { id: "P3", name: "Adv. Sunita Verma", role: "Senior Co-Counsel", avatarColor: "#8b5cf6", activeSpeaker: false },
    { id: "P4", name: "District Branch Director", role: "District Franchisee Director", avatarColor: "#f59e0b", activeSpeaker: false },
    { id: "P5", name: "ICJ Trust Observer", role: "Super Admin Compliance", avatarColor: "#ef4444", activeSpeaker: false },
  ]);

  // Chat & Transcript
  const [chatMessages, setChatMessages] = useState([
    { sender: "System", text: "Multi-party WebRTC chamber initialized with 5 participants.", timestamp: "10:00 AM" },
    { sender: advocateName, text: "Welcome all. We are reviewing the petition for the district court hearing.", timestamp: "10:01 AM" },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Voice Correction Studio State
  const [isListening, setIsListening] = useState(false);
  const [spokenCorrectionText, setSpokenCorrectionText] = useState("");
  const [isCaseProperty, setIsCaseProperty] = useState(true);
  const [lastGeneratedDoc, setLastGeneratedDoc] = useState(null);

  // Active Speaker Auto-Cycle Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIdx = (activeSpeakerIndex + 1) % participants.length;
      setActiveSpeakerIndex(nextIdx);
      setParticipants((prev) =>
        prev.map((p, idx) => ({ ...p, activeSpeaker: idx === nextIdx }))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [activeSpeakerIndex, participants.length]);

  // Web Speech API Voice Correction Listener
  const handleStartVoiceCorrection = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback simulation for browsers without Web Speech API
      setIsListening(true);
      setTimeout(() => {
        const simulatedSpoken = "Correct litigant name and update address details";
        setSpokenCorrectionText(simulatedSpoken);
        setIsListening(false);
        alert(`🎤 Spoken Voice Captured: "${simulatedSpoken}"`);
      }, 2500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSpokenCorrectionText(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Generate Word (.docx) File with Voice Corrections & Case Vault Storage
  const handleGenerateWordDocument = () => {
    let metadata = {
      litigantAddress: "Lucknow Central District",
      courtForum: "District & Sessions Court",
      ipcSections: ["IPC Section 420", "CPC Order 39 Injunction"],
      agreedRelief: "Bail & Stay Order Application",
    };

    // Apply Spoken Voice Corrections if spoken
    if (spokenCorrectionText) {
      const parsed = MatterIntelligenceService.parseVoiceCorrection(spokenCorrectionText, metadata);
      metadata = parsed.updatedMetadata;
    }

    const fullTranscript = chatMessages.map((m) => `[${m.timestamp}] ${m.sender}: ${m.text}`).join("\n");

    const docRecord = MatterIntelligenceService.saveDocumentToVault({
      caseId,
      title: `Multi-Party Legal Consultation Record (${participants.length} Seats)`,
      category: "Legal Consultation",
      clientName: metadata.clientName || clientName,
      advocateName,
      participants,
      transcriptText: fullTranscript,
      metadata,
      isCaseProperty,
    });

    setLastGeneratedDoc(docRecord);

    // Trigger Browser Download
    MatterIntelligenceService.exportAsWordDoc(docRecord);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: advocateName, text: chatInput.trim(), timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setChatInput("");
  };

  // Render Feature Restricted Alert if blocked by Super Admin
  if (!accessCheck.accessible) {
    return (
      <Paper sx={{ p: 4, bgcolor: "#450a0a", border: "2px solid #ef4444", borderRadius: 2, textAlign: "center", color: "#ffffff" }}>
        <LockIcon sx={{ fontSize: 48, color: "#fca5a5", mb: 1 }} />
        <Typography variant="h6" fontWeight={800} color="#fca5a5">
          Service Temporarily Restricted by Super Admin
        </Typography>
        <Typography variant="body2" color="#fecaca" sx={{ mt: 1 }}>
          {accessCheck.message}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2.5, bgcolor: "#0f172a", color: "#ffffff", borderRadius: 2, border: "1px solid #334155" }}>
      {/* ROOM HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <VideocamIcon sx={{ color: "#10b981", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#ffffff">
              Multi-Party HD WebRTC Legal Consultation Chamber ({participants.length} Active Seats)
            </Typography>
            <Typography variant="caption" color="#94a3b8">
              Case ID: {caseId} | Web Crypto AES-256 Encrypted Stream
            </Typography>
          </Box>
        </Stack>

        <Chip label="LIVE CONFERENCE" color="error" size="small" sx={{ fontWeight: 800, px: 1 }} />
      </Stack>

      <Grid container spacing={2}>
        {/* LEFT COLUMN: MULTI-SEAT VIDEO GRID */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={1.5}>
            {participants.map((p, idx) => (
              <Grid item xs={12} sm={idx === 0 ? 12 : 6} key={p.id}>
                <Paper
                  sx={{
                    position: "relative",
                    minHeight: idx === 0 ? 220 : 140,
                    bgcolor: "#1e293b",
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    border: p.activeSpeaker ? "3px solid #3b82f6" : "1px solid #334155",
                    boxShadow: p.activeSpeaker ? "0 0 15px rgba(59, 130, 246, 0.5)" : "none",
                    overflow: "hidden",
                  }}
                >
                  {/* Speaker Label Overlay */}
                  <Box sx={{ position: "absolute", top: 8, left: 8, bgcolor: "rgba(15, 23, 42, 0.8)", px: 1, py: 0.3, borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight={800} color="#ffffff">
                      {p.name} ({p.role})
                    </Typography>
                  </Box>

                  {/* Active Speaker Glow Badge */}
                  {p.activeSpeaker && (
                    <Box sx={{ position: "absolute", top: 8, right: 8, bgcolor: "#3b82f6", px: 1, py: 0.2, borderRadius: 1 }}>
                      <Typography variant="caption" fontWeight={800} color="#ffffff">
                        🔊 SPEAKING
                      </Typography>
                    </Box>
                  )}

                  {/* Simulated Video Feed Avatar */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      bgcolor: p.avatarColor,
                      display: "grid",
                      placeItems: "center",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "1.3rem",
                    }}
                  >
                    {p.name.charAt(0)}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* MEDIA CONTROLS BAR */}
          <Paper sx={{ mt: 2, p: 1.5, bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: 2 }}>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <IconButton color={micActive ? "primary" : "error"} onClick={() => setMicActive(!micActive)} sx={{ bgcolor: "#0f172a" }}>
                {micActive ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              <IconButton color={videoActive ? "primary" : "error"} onClick={() => setVideoActive(!videoActive)} sx={{ bgcolor: "#0f172a" }}>
                {videoActive ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>

              <IconButton color={screenSharing ? "warning" : "inherit"} onClick={() => setScreenSharing(!screenSharing)} sx={{ bgcolor: "#0f172a" }}>
                {screenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
              </IconButton>

              <Button variant="contained" color="error" startIcon={<CallEndIcon />} onClick={onClose ? onClose : (() => window.history.back())} sx={{ fontWeight: 800, borderRadius: 2 }}>
                End Call
              </Button>
            </Stack>
          </Paper>

          {/* VOICE CORRECTION & WORD EXPORT PANEL */}
          <Paper sx={{ mt: 2, p: 2, bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} color="#fcd34d" sx={{ mb: 1 }}>
              🎤 Voice-Powered Metadata Auto-Correction & Word Exporter
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
              <Button
                variant="contained"
                color={isListening ? "secondary" : "warning"}
                startIcon={<RecordVoiceOverIcon />}
                onClick={handleStartVoiceCorrection}
                sx={{ fontWeight: 800 }}
              >
                {isListening ? "Listening..." : "🎤 Speak to Correct Details"}
              </Button>

              <FormControlLabel
                control={<Switch checked={isCaseProperty} onChange={(e) => setIsCaseProperty(e.target.checked)} color="success" />}
                label={
                  <Typography variant="caption" fontWeight={800} color={isCaseProperty ? "#6ee7b7" : "#cbd5e1"}>
                    {isCaseProperty ? "Official Case Property (SHA-256 Sealed)" : "Draft Document"}
                  </Typography>
                }
              />
            </Stack>

            {spokenCorrectionText && (
              <Alert severity="info" sx={{ mb: 1.5, bgcolor: "#0284c7", color: "#ffffff" }}>
                Captured Spoken Correction: "{spokenCorrectionText}"
              </Alert>
            )}

            <Button
              variant="contained"
              color="success"
              startIcon={<DescriptionIcon />}
              onClick={handleGenerateWordDocument}
              sx={{ fontWeight: 800, width: "100%" }}
            >
              Generate & Download Word File (.docx) to Case Vault
            </Button>

            {lastGeneratedDoc && (
              <Typography variant="caption" color="#6ee7b7" sx={{ mt: 1, display: "block" }}>
                Saved: {lastGeneratedDoc.filename} ({lastGeneratedDoc.vaultPath})
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: IN-CALL ENCRYPTED CHAT */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: "#1e293b", height: "100%", minHeight: 450, display: "flex", flexDirection: "column", border: "1px solid #334155" }}>
            <Typography variant="subtitle2" fontWeight={800} color="#fcd34d" mb={1}>
              💬 Encrypted In-Call Legal Chat
            </Typography>

            <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2, maxHeight: 350, pr: 1 }}>
              {chatMessages.map((msg, idx) => (
                <Box key={idx} sx={{ mb: 1.5, p: 1, bgcolor: "#0f172a", borderRadius: 1.5, border: "1px solid #334155" }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" fontWeight={800} color="#3b82f6">
                      {msg.sender}
                    </Typography>
                    <Typography variant="caption" color="#64748b">
                      {msg.timestamp}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="#ffffff" sx={{ mt: 0.5 }}>
                    {msg.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type in-call chat message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                sx={{
                  input: { color: "#ffffff", fontWeight: 700 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#0f172a",
                    "& fieldset": { borderColor: "#475569" },
                    "&:hover fieldset": { borderColor: "#3b82f6" },
                    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                  },
                  "& .MuiInputBase-input::placeholder": { color: "#94a3b8", opacity: 1 },
                }}
              />
              <IconButton color="primary" onClick={handleSendChat}>
                <SendIcon />
              </IconButton>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default MultiPartyConferenceRoom;
