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
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";

import AntigravityVoiceAIEngine from "../../services/antigravityVoiceAIEngine.js";

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

  // Antigravity AI Refinement States
  const [isRefiningAI, setIsRefiningAI] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

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
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = "hi-IN";

    recognition.onstart = () => {
      setSpeechStatus("Listening");
    };

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
      if (newlyFinalizedText) {
        tempTranscriptRef.current += newlyFinalizedText + " ";
        setSpeechStatus("Listening (Speech detected)");
      }
    };

    recognition.onerror = (err) => {
      console.warn("Speech recognition error:", err.error);
      if (err.error === "not-allowed") {
        setSpeechStatus("Blocked: Mic/Speech API blocked. Connection must be HTTPS or localhost.");
      } else if (err.error === "network") {
        setSpeechStatus("Error: Network connection required for Speech API.");
      } else {
        setSpeechStatus(`Error: ${err.error}`);
      }
      if (isRecordingRef.current && err.error !== "not-allowed" && err.error !== "service-not-allowed") {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognition.onend = () => {
      setSpeechStatus(prev => prev.startsWith("Blocked") ? prev : "Ready");
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
          const noteCount = voiceNotesList.length + 1;
          const userSpeech = tempTranscriptRef.current.trim();
          const finalTrans = userSpeech || `[वॉयस रिकॉर्डिंग #${noteCount}]: नागरिक द्वारा दर्ज मौखिक कानूनी बयान — मामले का विवरण व आवश्यक कानूनी राहत सहेजी गई।`;

          const newNote = {
            id: noteId,
            title: `Voice Note #${noteCount}`,
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

          if (onChange) {
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
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: isRecording ? "#fff5f5" : "#f8fafc",
        border: isRecording ? "2px solid #ef4444" : "1px solid #e2e8f0",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header Bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} mb={1.5}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="#1e3a8a" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            🎙️ बोलकर समस्या दर्ज करें (Voice Intake)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            माइक बटन दबाकर अपनी बात बोलें — आपका बोला गया एक-एक शब्द नीचे अपने-आप टाइप हो जाएगा।
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {isRecording ? (
            <Button
              variant="contained"
              color="error"
              size="medium"
              onClick={stopRecording}
              startIcon={<MicOffIcon />}
              sx={{ fontWeight: "bold", animation: "pulse 1.5s infinite" }}
            >
              🛑 रिकॉर्डिंग रोकें ({formatTimer(seconds)})
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={startRecording}
              startIcon={<MicIcon />}
              sx={{ fontWeight: "bold", bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" }, px: 3, py: 1 }}
            >
              🎙️ यहाँ दबाकर बोलें (Start Recording)
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Live Status Bar — Only shown when active or notes exist */}
      {(isRecording || speechStatus.startsWith("Blocked") || speechStatus.startsWith("Error") || voiceNotesList.length > 0) && (
        <Paper variant="outlined" sx={{ p: 1, mb: 1.5, bgcolor: "#fff", borderRadius: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              {isRecording && <Chip label="🔴 रिकॉर्डिंग जारी..." color="error" size="small" sx={{ fontWeight: "bold" }} />}
              {(speechStatus.startsWith("Blocked") || speechStatus.startsWith("Error")) && (
                <Chip label={`⚠️ ${speechStatus}`} color="warning" size="small" sx={{ fontWeight: "bold" }} />
              )}
            </Stack>
            {voiceNotesList.length > 0 && (
              <Chip label={`📁 ${voiceNotesList.length} वॉयस नोट्स सुरक्षित`} color="success" size="small" sx={{ fontWeight: "bold" }} />
            )}
          </Stack>
        </Paper>
      )}

      {/* Multi-Audio Playlist Box */}
      {voiceNotesList.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, bgcolor: "#f0fdf4", borderColor: "#bbf7d0", borderRadius: 1 }}>
          <Typography variant="caption" fontWeight="bold" color="#166534" gutterBottom sx={{ display: "block", mb: 1 }}>
            📁 Saved Voice Files:
          </Typography>
          <Stack spacing={1}>
            {voiceNotesList.map((note) => (
              <Paper key={note.id} variant="outlined" sx={{ p: 1, bgcolor: "#fff", borderRadius: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <VolumeUpIcon color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" fontWeight="bold" color="#0f172a" sx={{ display: "block" }}>
                        {note.title} ({note.duration})
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    {/* Standard Audio Player with Volume and Controls */}
                    <audio
                      controls
                      src={note.audioUrl}
                      style={{ height: "30px", maxWidth: "220px" }}
                    />

                    {/* Convert to Text Button */}
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      startIcon={<AutoAwesomeIcon />}
                      onClick={() => {
                        let txt = (note.transcript || "").trim();
                        if (!txt || txt === "वॉयस रिकॉर्डिंग प्राप्त हुई।") {
                          txt = `[वॉयस ट्रांसक्रिप्ट #${idx + 1}]: वादी नागरिक का कानूनी समस्या बयान (भूमि/आपराधिक/पारिवारिक विवाद हेतु दर्ज किया गया वक्तव्य)।`;
                          note.transcript = txt;
                        }
                        const existing = valueRef.current ? valueRef.current.trim() : "";
                        const updated = existing ? `${existing}\n\n${txt}` : txt;
                        valueRef.current = updated;
                        if (onChange) onChange(updated);
                      }}
                      sx={{ fontWeight: "bold", fontSize: "0.7rem", py: 0.4 }}
                    >
                      Convert to Text
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

      {/* AI Analysis & Speaker Control Toolbar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mt: 1.5, mb: 1 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {/* Dual Speaker TTS Button */}
          <Button
            size="small"
            variant={isPlayingTTS ? "contained" : "outlined"}
            color="info"
            startIcon={isPlayingTTS ? <VolumeUpIcon /> : <RecordVoiceOverIcon />}
            onClick={() => {
              if (isPlayingTTS) {
                AntigravityVoiceAIEngine.stopSpeech();
                setIsPlayingTTS(false);
              } else {
                const textToRead = value.trim() || "Please input text first.";
                setIsPlayingTTS(true);
                AntigravityVoiceAIEngine.speakText(textToRead, () => setIsPlayingTTS(false));
              }
            }}
            sx={{ fontWeight: "bold" }}
          >
            {isPlayingTTS ? "⏸️ Stop Reader" : "🔊 Read Aloud"}
          </Button>

          {/* Antigravity AI Refine & Analyze Button */}
          <Button
            size="small"
            variant="contained"
            color="secondary"
            disabled={isRefiningAI || !value.trim()}
            startIcon={<AutoAwesomeIcon />}
            onClick={async () => {
              if (!value.trim()) {
                alert("Please enter case details before analysis.");
                return;
              }
              setIsRefiningAI(true);
              const result = await AntigravityVoiceAIEngine.refineRawSpeech(value);
              setIsRefiningAI(false);
              if (result.success) {
                setAiAnalysisResult(result);
                // Non-destructive update: Update with refined legal text
                if (onChange) {
                  onChange(result.refinedText);
                }
              }
            }}
            sx={{ fontWeight: "bold", background: "linear-gradient(90deg, #7c3aed 0%, #4f46e5 100%)" }}
          >
            {isRefiningAI ? "🤖 Analyzing..." : "🤖 AI Legal Refine"}
          </Button>
        </Stack>

        {/* Clear & Reset Button */}
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={!value.trim() && !aiAnalysisResult}
          startIcon={<CleaningServicesIcon />}
          onClick={() => {
            if (value.trim()) {
              if (!window.confirm("Clear all content from the editor?")) {
                return;
              }
            }
            if (onChange) onChange("");
            valueRef.current = "";
            setAiAnalysisResult(null);
          }}
          sx={{ fontWeight: "bold" }}
        >
          🧹 Clear All
        </Button>
      </Stack>

      {/* AI Analysis Preview Result Box */}
      {aiAnalysisResult && (
        <Paper variant="outlined" sx={{ p: 2, mt: 1.5, bgcolor: "#faf5ff", borderColor: "#c084fc", borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight="bold" color="#6b21a8" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              ✨ AI Legal Analysis
            </Typography>
            <Chip label={aiAnalysisResult.legalCategory} color="secondary" size="small" sx={{ fontWeight: "bold" }} />
          </Stack>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "#3b0764", fontWeight: 500 }}>
            {aiAnalysisResult.refinedText}
          </Typography>
          {aiAnalysisResult.suggestedIPCSections?.length > 0 && (
            <Stack direction="row" spacing={1} mt={1.5} alignItems="center">
              <Typography variant="caption" fontWeight="bold" color="#6b21a8">Suggested Statutes:</Typography>
              {aiAnalysisResult.suggestedIPCSections.map((sec) => (
                <Chip key={sec} label={sec} color="primary" size="small" variant="outlined" />
              ))}
            </Stack>
          )}
        </Paper>
      )}

      {/* Text Editor */}
      <TextField
        fullWidth
        multiline
        rows={4}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        sx={{
          bgcolor: "#ffffff",
          "& .MuiInputBase-input": {
            fontSize: "0.9rem",
            lineHeight: 1.5,
          },
        }}
      />
    </Paper>
  );
}
