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
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import DeleteIcon from "@mui/icons-material/Delete";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const MAX_RECORDING_SECONDS = 60; // 60 seconds (1 minute) auto-stop limit

export default function VoiceCommentaryStudio({
  value = "",
  onChange,
  onSendVoiceToChat,
  onVoiceNotesChange,
  label = "🎙️ आपकी पूरी समस्या व केस विवरण (Long-Form Voice Commentary)",
  placeholder = "यहाँ क्लिक करके बोलना शुरू करें... आपका बोला गया एक-एक शब्द रिकॉर्डिंग बंद होने के बाद यहाँ टाइप होगा!",
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [voiceNotesList, setVoiceNotesList] = useState([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [speechStatus, setSpeechStatus] = useState("Ready"); // "Ready" | "Listening" | "Error" | "Blocked"

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioElementsRef = useRef({});
  const isRecordingRef = useRef(false);
  const valueRef = useRef(value);
  const tempTranscriptRef = useRef("");
  const detectedMimeTypeRef = useRef("");

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Speech Recognition Setup: Process text after recording stops
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = "hi-IN";

    recognition.onstart = () => {
      setSpeechStatus("Listening");
    };

    recognition.onresult = (event) => {
      let newlyFinalizedText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newlyFinalizedText += transcript.trim() + " ";
        } else {
          interimText += transcript;
        }
      }
      if (newlyFinalizedText) {
        tempTranscriptRef.current += newlyFinalizedText;
      }
      const fullText = tempTranscriptRef.current + interimText;
      if (onChange) {
        onChange(fullText);
      }
      setSpeechStatus(interimText ? `Typing: "${interimText}"` : "Listening...");
    };

    recognition.onerror = (err) => {
      console.warn("Speech recognition error:", err.error);
      if (err.error === "not-allowed") {
        setSpeechStatus("Blocked: Mic blocked.");
      } else if (err.error === "network") {
        setSpeechStatus("Error: Network required.");
      } else {
        setSpeechStatus(`Listening...`);
      }
      // Auto restart on minor errors/timeouts
      if (isRecordingRef.current && err.error !== "not-allowed") {
        setTimeout(() => {
          if (isRecordingRef.current) {
            try { recognition.start(); } catch { /* ignore */ }
          }
        }, 300);
      }
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch {
          // Retry setup
          setTimeout(() => {
            if (isRecordingRef.current) {
              try { recognition.start(); } catch { /* ignore */ }
            }
          }, 300);
        }
      } else {
        setSpeechStatus("Ready");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  // Timer logic with auto-stop at MAX_RECORDING_SECONDS
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s >= MAX_RECORDING_SECONDS - 1) {
            clearInterval(timerRef.current);
            stopRecording();
            return MAX_RECORDING_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Browser-compatible MIME type detection
      let options = {};
      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
        mimeType = "audio/ogg;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      }
      if (mimeType) {
        options = { mimeType };
      }
      detectedMimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, options);
      audioChunksRef.current = [];
      tempTranscriptRef.current = "";

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        // Wait 800ms for final SpeechRecognition results to finish processing from servers
        setTimeout(() => {
          const blobType = detectedMimeTypeRef.current || "audio/webm";
          const blob = new Blob(audioChunksRef.current, { type: blobType });

          // Validate recording data size and duration
          if (blob.size === 0) {
            console.warn("Recording produced an empty audio blob.");
            alert("रिकॉर्डिंग में कोई आवाज़ नहीं मिली। कृपया पुनः प्रयास करें।");
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          const url = URL.createObjectURL(blob);
          const noteId = `vn-${Date.now()}`;
          const finalTrans = tempTranscriptRef.current.trim();

          const newNote = {
            id: noteId,
            title: `Voice Note #${voiceNotesList.length + 1}`,
            audioUrl: url,
            blob,
            duration: formatTimer(seconds || MAX_RECORDING_SECONDS),
            timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            transcript: finalTrans,
          };

          setVoiceNotesList((prev) => {
            const updated = [...prev, newNote];
            if (onVoiceNotesChange) {
              onVoiceNotesChange(updated);
            }
            return updated;
          });

          if (finalTrans && onChange) {
            const existing = valueRef.current ? valueRef.current.trim() : "";
            const updated = existing ? `${existing}\n\n${finalTrans}` : finalTrans;
            valueRef.current = updated;
            onChange(updated);
          }

          if (onSendVoiceToChat) {
            onSendVoiceToChat(newNote);
          }

          stream.getTracks().forEach((track) => track.stop());
        }, 800);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // Fetch audio chunks every 250ms to prevent silent/empty recordings
      setIsRecording(true);
      isRecordingRef.current = true;
      setSeconds(0);

      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* ignore */ }
      }
    } catch (err) {
      console.error("Mic access error:", err);
      alert("Microphone access denied or not supported by this browser.");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }

    // Delay stopping of Speech Recognition to allow final async results to be received
    setTimeout(() => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    }, 800);
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
    setVoiceNotesList((prev) => {
      const updated = prev.filter((n) => n.id !== noteId);
      if (onVoiceNotesChange) {
        onVoiceNotesChange(updated);
      }
      return updated;
    });
    if (currentlyPlayingId === noteId) setCurrentlyPlayingId(null);
  };

  const wordCount = (value || "").trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = (value || "").length;

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        fullWidth
        multiline
        rows={4}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" sx={{ alignSelf: "flex-end", mb: 1 }}>
              <Tooltip title={isRecording ? "Stop Recording (रिकॉर्डिंग रोकें)" : "Start Recording (बोलना शुरू करें)"}>
                <IconButton
                  onClick={isRecording ? stopRecording : startRecording}
                  sx={{
                    bgcolor: isRecording ? "#ef4444" : "#7c3aed",
                    color: "#ffffff",
                    "&:hover": {
                      bgcolor: isRecording ? "#dc2626" : "#6d28d9",
                    },
                    width: 48,
                    height: 48,
                    boxShadow: isRecording ? "0 0 12px #ef4444" : "0 4px 6px -1px rgba(0,0,0,0.1)",
                    animation: isRecording ? "pulse 1.2s infinite" : "none",
                    "@keyframes pulse": {
                      "0%": { transform: "scale(1)" },
                      "50%": { transform: "scale(1.1)", boxShadow: "0 0 18px #ef4444" },
                      "100%": { transform: "scale(1)" },
                    }
                  }}
                >
                  {isRecording ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        sx={{
          bgcolor: isRecording ? "#fff5f5" : "#ffffff",
          borderRadius: 2,
          transition: "all 0.3s ease",
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            borderWidth: isRecording ? "2px" : "1px",
            borderColor: isRecording ? "#ef4444 !important" : "rgba(0,0,0,0.23)",
          },
          "& .MuiInputBase-input": {
            fontSize: "0.9rem",
            lineHeight: 1.5,
          },
        }}
      />

      {/* Subtle Telemetry chips underneath the input box */}
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 1, px: 0.5 }}>
        {isRecording && (
          <Chip
            label={`🔴 Recording: ${formatTimer(seconds)}`}
            color="error"
            size="small"
            sx={{ fontWeight: "bold", height: 22, fontSize: "0.75rem" }}
          />
        )}
        <Chip
          label={`📝 ${wordCount} Words`}
          variant="outlined"
          size="small"
          sx={{ fontWeight: "600", height: 22, fontSize: "0.75rem", borderColor: "#e2e8f0" }}
        />
        <Chip
          label={speechStatus}
          color={speechStatus.startsWith("Blocked") || speechStatus.startsWith("Error") ? "warning" : "primary"}
          variant={isRecording ? "filled" : "outlined"}
          size="small"
          sx={{ fontWeight: "500", height: 22, fontSize: "0.75rem" }}
        />
        {voiceNotesList.length > 0 && (
          <Chip
            label={`📁 ${voiceNotesList.length} Audio Clips Saved`}
            color="success"
            variant="outlined"
            size="small"
            sx={{ fontWeight: "600", height: 22, fontSize: "0.75rem" }}
          />
        )}
      </Stack>

      {/* Playlist Accordion/Box for audio playback (if files exist) */}
      {voiceNotesList.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1, mt: 1.5, bgcolor: "#f8fafc", borderRadius: 2, borderColor: "#e2e8f0" }}>
          <Stack spacing={1}>
            {voiceNotesList.map((note) => (
              <Box key={note.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, p: 0.8, bgcolor: "#fff", borderRadius: 1.5, border: "1px solid #f1f5f9" }}>
                <Typography variant="caption" fontWeight="bold" color="#334155">
                  {note.title} ({note.duration})
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <audio controls src={note.audioUrl} style={{ height: "26px", maxWidth: "160px" }} />
                  <IconButton size="small" color="error" onClick={() => deleteVoiceNote(note.id)}>
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

