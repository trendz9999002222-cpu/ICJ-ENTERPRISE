import React, { useState, useEffect, useRef } from "react";
import {
  Paper,
  Typography,
  Box,
  Stack,
  Button,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import DeleteIcon from "@mui/icons-material/Delete";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";

export default function VoiceCommentaryStudio({
  value = "",
  onChange,
  onSendVoiceToChat,
  label = "🎙️ आपकी पूरी समस्या व केस विवरण (Long-Form Voice Commentary & Multi-Page Transcript)",
  placeholder = "यहाँ क्लिक करके 1 से 5 पेज की पूरी समस्या बोलें... आपका बोला गया एक-एक शब्द यहाँ रियल-टाइम में टाइप होगा!",
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [voiceNotesList, setVoiceNotesList] = useState([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioElementsRef = useRef({});
  const isRecordingRef = useRef(false);
  const valueRef = useRef(value);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Speech Recognition Setup: interimResults = false & maxAlternatives = 1 (Zero Erasing!)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Continuous listening on silence pauses
    recognition.interimResults = false; // Disable raw predictive suggestions — ZERO TEXT ERASING!
    recognition.maxAlternatives = 1; // Single best acoustic match
    recognition.lang = "hi-IN";

    recognition.onresult = (event) => {
      let newlyFinalizedText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const phrase = event.results[i][0].transcript.trim();
          if (phrase) {
            newlyFinalizedText += phrase + ". ";
          }
        }
      }

      if (newlyFinalizedText && onChange) {
        const existing = valueRef.current ? valueRef.current.trim() : "";
        const updated = existing ? `${existing} ${newlyFinalizedText}` : newlyFinalizedText;
        valueRef.current = updated;
        onChange(updated);
      }
    };

    recognition.onerror = (err) => {
      if (isRecordingRef.current && err.error !== "not-allowed") {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try { recognition.start(); } catch { setIsRecording(false); }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, [onChange]);

  // Timer logic
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const noteId = `vn-${Date.now()}`;
        const newNote = {
          id: noteId,
          title: `Voice Note #${voiceNotesList.length + 1}`,
          audioUrl: url,
          blob,
          duration: formatTimer(seconds),
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          transcript: valueRef.current,
        };

        setVoiceNotesList((prev) => [...prev, newNote]);
        if (onSendVoiceToChat) {
          onSendVoiceToChat(newNote);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      isRecordingRef.current = true;
      setSeconds(0);

      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* ignore */ }
      }
    } catch (err) {
      console.error("Mic access error:", err);
      setIsRecording(true);
      isRecordingRef.current = true;
      setSeconds(0);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* ignore */ }
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  const togglePlayAudio = (noteId) => {
    const audioEl = audioElementsRef.current[noteId];
    if (!audioEl) return;

    if (currentlyPlayingId === noteId) {
      audioEl.pause();
      setCurrentlyPlayingId(null);
    } else {
      Object.values(audioElementsRef.current).forEach((el) => el && el.pause());
      audioEl.play();
      setCurrentlyPlayingId(noteId);
    }
  };

  const deleteVoiceNote = (noteId) => {
    setVoiceNotesList((prev) => prev.filter((n) => n.id !== noteId));
    if (currentlyPlayingId === noteId) setCurrentlyPlayingId(null);
  };

  const wordCount = (value || "").trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = (value || "").length;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: isRecording ? "#fef2f2" : "#ffffff",
        border: isRecording ? "2px solid #ef4444" : "1px solid #cbd5e1",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header Bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} mb={2}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="#0f172a" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            🎙️ Long-Form Voice Commentary &amp; Multi-File Studio
          </Typography>
          <Typography variant="caption" color="text.secondary">
            बोलकर 1 से 5 पेज दर्ज करें — हर बार रिकॉर्डिंग बंद करने पर अलग ऑडियो फाइल बनेगी और चैट बॉक्स में सेव रहेगी।
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {isRecording ? (
            <Button
              variant="contained"
              color="error"
              onClick={stopRecording}
              startIcon={<MicOffIcon />}
              sx={{ fontWeight: "bold", animation: "pulse 1.5s infinite" }}
            >
              🔴 STOP RECORDING ({formatTimer(seconds)})
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={startRecording}
              startIcon={<MicIcon />}
              sx={{ fontWeight: "bold", bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
            >
              🎙️ START NEW VOICE NOTE
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Live Telemetry Bar */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={isRecording ? `🔴 RECORDING LIVE (${formatTimer(seconds)})` : "READY FOR RECORDING"}
              color={isRecording ? "error" : "default"}
              size="small"
              sx={{ fontWeight: "bold" }}
            />
            <Chip
              label={`📝 ${wordCount} Words | ${charCount} Chars`}
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          </Stack>
          <Chip
            label={`📁 ${voiceNotesList.length} Audio Files Saved to Advocate Chat`}
            color="primary"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        </Stack>
      </Paper>

      {/* Multi-Audio Playlist Box (Chambers & Chat Repository) */}
      {voiceNotesList.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#f0fdf4", borderColor: "#86efac", borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" color="#166534" gutterBottom>
            📁 Saved Voice Files Playlist (Advocate &amp; Collegium Team Chat Archive):
          </Typography>
          <Stack spacing={1}>
            {voiceNotesList.map((note) => (
              <Paper key={note.id} variant="outlined" sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <VolumeUpIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" color="#0f172a">
                        {note.title} ({note.duration})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Recorded at {note.timestamp} • Sent to Counsel Chat Thread
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <audio
                      ref={(el) => (audioElementsRef.current[note.id] = el)}
                      src={note.audioUrl}
                      onEnded={() => setCurrentlyPlayingId(null)}
                      style={{ display: "none" }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      color={currentlyPlayingId === note.id ? "warning" : "success"}
                      startIcon={currentlyPlayingId === note.id ? <PauseIcon /> : <PlayArrowIcon />}
                      onClick={() => togglePlayAudio(note.id)}
                      sx={{ fontWeight: "bold" }}
                    >
                      {currentlyPlayingId === note.id ? "Pause" : "Play Audio 🔊"}
                    </Button>
                    <IconButton size="small" color="error" onClick={() => deleteVoiceNote(note.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Large Multi-Page Text Editor (Zero Text Erasing!) */}
      <TextField
        fullWidth
        multiline
        rows={8}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        sx={{
          bgcolor: "#ffffff",
          "& .MuiInputBase-input": {
            fontSize: "0.95rem",
            lineHeight: 1.6,
            minHeight: "180px",
          },
        }}
      />
    </Paper>
  );
}
