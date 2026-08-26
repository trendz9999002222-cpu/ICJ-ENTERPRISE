import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Tooltip,
  Alert,
  Chip,
} from "@mui/material";

// Icons
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";

export default function FullCanvasVoiceStudio({
  value = "",
  onChange,
  onSaveFile,
  placeholder = "यहाँ माइक दबाकर बिना रुके अपनी पूरी बात बोलें या सीधे टाइप करें...",
  title = "🎙️ अनलिमिटेड वॉइस एवं ड्राफ्टिंग कैनवस (Continuous Voice Studio)",
}) {
  const [text, setText] = useState(value);
  const [isRecording, setIsRecording] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Default large readable font
  const [wordCount, setWordCount] = useState(0);

  const recognitionRef = useRef(null);
  const isManuallyStoppedRef = useRef(false);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [text]);

  // Continuous Unlimited Speech Recognition Engine
  const startContinuousSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("आपके ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है। कृपया Google Chrome या Edge का उपयोग करें।");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Continuous listening
      recognition.interimResults = true; // Show live interim words
      recognition.lang = "hi-IN"; // Default Hindi / Indian English mixed

      recognition.onstart = () => {
        setIsRecording(true);
        isManuallyStoppedRef.current = false;
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }

        if (finalTranscript) {
          setText((prev) => {
            const updated = (prev ? prev.trim() + " " : "") + finalTranscript.trim();
            if (onChange) onChange(updated);
            return updated;
          });
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed") {
          setIsRecording(false);
          isManuallyStoppedRef.current = true;
          alert("कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।");
        }
      };

      // Auto-restart loop when speech pauses, removing the 1-minute timeout limit!
      recognition.onend = () => {
        if (!isManuallyStoppedRef.current) {
          try {
            recognition.start();
          } catch {
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Speech Recognition initialization error:", e);
      setIsRecording(false);
    }
  };

  const stopContinuousSpeech = () => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Stop error:", e);
      }
    }
    setIsRecording(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    if (!text.trim()) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ICJ_Legal_Voice_Draft_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveDraft = () => {
    if (onSaveFile) {
      onSaveFile(text);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClear = () => {
    if (window.confirm("क्या आप इस पूरे टेक्स्ट को साफ़ (Clear) करना चाहते हैं?")) {
      setText("");
      if (onChange) onChange("");
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#ffffff", borderRadius: 3 }}>
      {/* 1. TOP TOOLBAR (Font Zoom, Status, Word Count) */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          bgcolor: isRecording ? "#fef2f2" : "#f8fafc",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {isRecording ? (
            <Chip
              icon={<GraphicEqIcon sx={{ color: "#ef4444 !important", animation: "pulse 1s infinite" }} />}
              label="🔴 लाइव वॉइस रिकॉर्डिंग जारी है (Continuous Dictation Active - No Timeout)"
              color="error"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          ) : (
            <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#1e3a8a" }}>
              {title}
            </Typography>
          )}
          <Chip label={`${wordCount} शब्द (Words)`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="फ़ॉन्ट छोटा करें">
            <IconButton size="small" onClick={() => setFontSize((f) => Math.max(14, f - 2))}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "#64748b" }}>
            {fontSize}px
          </Typography>
          <Tooltip title="फ़ॉन्ट बड़ा करें">
            <IconButton size="small" onClick={() => setFontSize((f) => Math.min(28, f + 2))}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* 2. CENTER 90% EXPANSIVE TEXT CANVAS */}
      <Box sx={{ flex: 1, p: 2.5, display: "flex", flexDirection: "column" }}>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          placeholder={placeholder}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: `${fontSize}px`,
            lineHeight: 1.8,
            fontFamily: "inherit",
            color: "#1e293b",
            backgroundColor: "transparent",
          }}
        />
      </Box>

      {/* 3. BOTTOM CONTROL DOCK (Mic & Instant File Saving Options) */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          bgcolor: "#f8fafc",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        {/* Main Microphone Button */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {isRecording ? (
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<StopIcon />}
              onClick={stopContinuousSpeech}
              sx={{ textTransform: "none", borderRadius: 2, px: 3, fontWeight: 700 }}
            >
              माइक बंद करें (Stop Recording)
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<MicIcon />}
              onClick={startContinuousSpeech}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                fontWeight: 700,
                bgcolor: "#16a34a",
                "&:hover": { bgcolor: "#15803d" },
              }}
            >
              माइक चालू करें (Start Voice Typing)
            </Button>
          )}

          {text && (
            <IconButton color="error" size="small" onClick={handleClear} title="टेक्स्ट क्लियर करें">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        {/* Instant File Saving & Export Options */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            size="medium"
            startIcon={copied ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
            onClick={handleCopyText}
            disabled={!text.trim()}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
          >
            {copied ? "कॉपी हो गया!" : "टेक्स्ट कॉपी करें"}
          </Button>

          <Button
            variant="outlined"
            size="medium"
            startIcon={<FileDownloadIcon />}
            onClick={handleDownloadFile}
            disabled={!text.trim()}
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
          >
            फाइल डाउनलोड करें (.txt)
          </Button>

          <Button
            variant="contained"
            size="medium"
            startIcon={savedSuccess ? <CheckCircleIcon /> : <SaveIcon />}
            onClick={handleSaveDraft}
            disabled={!text.trim()}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              fontWeight: 700,
              bgcolor: savedSuccess ? "#16a34a" : "#1e40af",
              "&:hover": { bgcolor: savedSuccess ? "#15803d" : "#1e3a8a" },
            }}
          >
            {savedSuccess ? "फाइल सेव हो गई!" : "💾 केस फाइल में सेव करें"}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
