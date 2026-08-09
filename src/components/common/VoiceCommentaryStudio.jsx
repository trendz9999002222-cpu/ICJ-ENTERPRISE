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
  Alert,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import DeleteIcon from "@mui/icons-material/Delete";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function VoiceCommentaryStudio({
  value = "",
  onChange,
  label = "🎙️ आपकी पूरी समस्या व केस विवरण (Long-Form Voice Commentary & Multi-Page Transcript)",
  placeholder = "यहाँ क्लिक करें और बोलना शुरू करें... आप 1 से 5 पेज की पूरी कहानी बोल सकते हैं। आपका बोला गया एक-एक शब्द यहाँ रियल-टाइम में टाइप होगा!",
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const baseTextRef = useRef(value);

  // Keep baseTextRef in sync when NOT recording
  useEffect(() => {
    if (!isRecording) {
      baseTextRef.current = value;
    }
  }, [value, isRecording]);

  // Speech Recognition & MediaRecorder Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "hi-IN";

    recognition.onresult = (event) => {
      let finalStr = "";
      let interimStr = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalStr += transcript + " ";
        } else {
          interimStr += transcript + " ";
        }
      }

      const combinedText = [baseTextRef.current, finalStr, interimStr]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ");

      if (onChange) {
        onChange(combinedText);
      }
    };

    recognition.onerror = (err) => {
      console.wrap ? console.warn("Dictation error:", err) : null;
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
  }, [onChange, value]);

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
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      isRecordingRef.current = true;

      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* ignore */ }
      }
    } catch (err) {
      console.error("Mic access failed:", err);
      // Fallback to Web Speech API if MediaRecorder stream fails
      setIsRecording(true);
      isRecordingRef.current = true;
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

  const clearAudio = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setSeconds(0);
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
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
      {/* Studio Header & Live Controls Bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} mb={2}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="#0f172a" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            🎙️ Long-Form Voice Commentary &amp; Live Studio
          </Typography>
          <Typography variant="caption" color="text.secondary">
            बोलकर 1 से 5 पेज का विवरण दर्ज करें — आपका बोला गया एक-एक शब्द रियल-टाइम में टाइप होगा।
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
              🎙️ START VOICE COMMENTARY
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Live Telemetry Bar */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={isRecording ? `🔴 LISTENING (${formatTimer(seconds)})` : "READY TO RECORD"}
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

          {audioUrl && (
            <Stack direction="row" spacing={1} alignItems="center">
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} style={{ display: "none" }} />
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                onClick={() => {
                  if (isPlaying) {
                    audioRef.current?.pause();
                    setIsPlaying(false);
                  } else {
                    audioRef.current?.play();
                    setIsPlaying(true);
                  }
                }}
                sx={{ fontWeight: "bold" }}
              >
                {isPlaying ? "Pause Audio" : "Play Recorded Audio 🔊"}
              </Button>
              <IconButton size="small" color="error" onClick={clearAudio}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Large Scrollable Multi-Page Text Area */}
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
