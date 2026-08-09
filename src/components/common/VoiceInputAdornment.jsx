import React, { useState, useEffect, useRef } from "react";
import { IconButton, Tooltip, InputAdornment } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

export default function VoiceInputAdornment({ onTranscript, value = "", lang = "hi-IN" }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Continuous listening — never stops on pauses!
    recognition.interimResults = false; // Disable raw predictive suggestions — ZERO TEXT ERASING!
    recognition.maxAlternatives = 1;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let newlyFinalizedText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const phrase = event.results[i][0].transcript.trim();
          if (phrase) {
            newlyFinalizedText += phrase + " ";
          }
        }
      }

      if (newlyFinalizedText && onTranscript) {
        onTranscript(newlyFinalizedText);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      // Auto-restart if user did not manually stop
      if (isListeningRef.current && event.error !== "not-allowed") {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognition.onend = () => {
      // Continuous Loop: Auto-restart if user did NOT click stop!
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, [lang, onTranscript]);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    } else {
      setIsListening(true);
      isListeningRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // In case it was already running
          setIsListening(true);
        }
      }
    }
  };

  return (
    <InputAdornment position="end">
      <Tooltip title={isListening ? "🔴 Voice Dictation ON (Click to STOP)" : "🎙️ Voice Dictation (Click to START)"}>
        <IconButton
          size="small"
          onClick={toggleListening}
          color={isListening ? "error" : "primary"}
          sx={{
            animation: isListening ? "pulse 1.5s infinite" : "none",
            "@keyframes pulse": {
              "0%": { transform: "scale(1)", opacity: 1 },
              "50%": { transform: "scale(1.2)", opacity: 0.8 },
              "100%": { transform: "scale(1)", opacity: 1 },
            },
          }}
        >
          {isListening ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </InputAdornment>
  );
}
