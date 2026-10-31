"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  Alert,
  keyframes,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicNoneIcon from "@mui/icons-material/MicNone";
import StopIcon from "@mui/icons-material/Stop";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import TranslateIcon from "@mui/icons-material/Translate";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

// ── Keyframe Animations for Visual Audio Feedback ─────────────────────────────

const pulseRadar = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(220, 38, 38, 0);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
    transform: scale(1);
  }
`;

const waveBounce = keyframes`
  0%, 100% { height: 6px; }
  50% { height: 26px; }
`;

// ── Supported Indian Regional & Official Languages ───────────────────────────

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  promptPlaceholder: string;
  greetingHint: string;
}

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  {
    code: "hi-IN",
    name: "Hindi",
    nativeName: "हिन्दी",
    promptPlaceholder: "बोलिए, हम आपकी कानूनी समस्या लिख रहे हैं...",
    greetingHint: "उदा. 'मुझे पैतृक संपत्ति विवाद के लिए कानूनी सलाह चाहिए...'",
  },
  {
    code: "en-IN",
    name: "English (India)",
    nativeName: "English (India)",
    promptPlaceholder: "Speak clearly, transcribing your statement in real-time...",
    greetingHint: "e.g., 'I need institutional legal aid regarding a civil property matter...'",
  },
  {
    code: "bn-IN",
    name: "Bengali",
    nativeName: "বাংলা",
    promptPlaceholder: "বলুন, আমরা আপনার আইনি অভিযোগ লিখছি...",
    greetingHint: "যেমন: 'আমার একটি পারিবারিক সম্পত্তির বিরোধ আছে...'",
  },
  {
    code: "mr-IN",
    name: "Marathi",
    nativeName: "मराठी",
    promptPlaceholder: "बोला, आम्ही तुमची कायदेशीर तक्रार लिहित आहोत...",
    greetingHint: "उदा: 'मला जमिनीच्या वादासाठी कायदेशीर मदतीची गरज आहे...'",
  },
  {
    code: "te-IN",
    name: "Telugu",
    nativeName: "తెలుగు",
    promptPlaceholder: "మాట్లాడండి, మీ చట్టపరమైన సమస్య వ్రాయబడుతోంది...",
    greetingHint: "ఉదా: 'నాకు సివిల్ కేసులో న్యాయ సహాయం కావాలి...'",
  },
  {
    code: "ta-IN",
    name: "Tamil",
    nativeName: "தமிழ்",
    promptPlaceholder: "பேசுங்கள், உங்கள் சட்டரீதியான புகார் எழுதப்படுகிறது...",
    greetingHint: "எ.கா: 'எனக்கு சொத்து தகராறில் சட்ட உதவி தேவை...'",
  },
  {
    code: "gu-IN",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    promptPlaceholder: "બોલો, તમારી કાનૂની ફરિયાદ લખાઈ રહી છે...",
    greetingHint: "દા.ત.: 'મને મિલકતના વિવાદમાં કાનૂની સહાય જોઈએ છે...'",
  },
  {
    code: "kn-IN",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    promptPlaceholder: "ಮಾತನಾಡಿ, ನಿಮ್ಮ ಕಾನೂನು ದೂರನ್ನು ಬರೆಯಲಾಗುತ್ತಿದೆ...",
    greetingHint: "ಉದಾ: 'ನನಗೆ ಆಸ್ತಿ ವಿವಾದದಲ್ಲಿ ಕಾನೂನು ನೆರವು ಬೇಕು...'",
  },
  {
    code: "ml-IN",
    name: "Malayalam",
    nativeName: "മലയാളം",
    promptPlaceholder: "സംസാരിക്കൂ, താങ്കളുടെ നിയമപരമായ പരാതി എഴുതുന്നു...",
    greetingHint: "ഉദാ: 'എനിക്ക് സിവിൽ കേസിൽ നിയമസഹായം ആവശ്യമുണ്ട്...'",
  },
  {
    code: "pa-IN",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    promptPlaceholder: "ਬੋਲੋ ਜੀ, ਤੁਹਾਡੀ ਕਾਨੂੰਨੀ ਸ਼ਿਕਾਇਤ ਲਿਖੀ ਜਾ ਰਹੀ ਹੈ...",
    greetingHint: "ਜਿਵੇਂ: 'ਮੈਨੂੰ ਜ਼ਮੀਨੀ ਵਿਵਾਦ ਸੰਬੰਧੀ ਕਾਨੂੰਨੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ...'",
  },
  {
    code: "ur-IN",
    name: "Urdu",
    nativeName: "اردو",
    promptPlaceholder: "بولئے، آپ کی قانونی شکایت تحریر کی جا رہی ہے...",
    greetingHint: "مثلاً: 'मुझे جائیداد کے تنازعے میں قانونی رہنمائی درکار ہے...'",
  },
  {
    code: "or-IN",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    promptPlaceholder: "କୁହନ୍ତୁ, ଆପଣଙ୍କ ଆଇନଗତ ଅଭିଯୋଗ ଲେଖାଯାଉଛି...",
    greetingHint: "ଯଥା: 'ମୋର ସମ୍ପତ୍ତି ବିବାଦରେ ଆଇନଗତ ସାହାଯ୍ୟ ଦରକାର...'",
  },
  {
    code: "as-IN",
    name: "Assamese",
    nativeName: "অসমীয়া",
    promptPlaceholder: "কওক, আপোনাৰ আইনী समस्या লিখা হৈছে...",
    greetingHint: "যেনে: 'মোক সম্পত্তিৰ বিবাদত আইনী সহায় লাগে...'",
  },
];

interface VoiceSpeechInputProps {
  /** Current value of the input/textarea to append speech to */
  value: string;
  /** Callback to update text in parent component */
  onChange: (newValue: string) => void;
  /** Optional custom button label */
  buttonLabel?: string;
  /** Target field name for accessibility */
  fieldName?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
}

export default function VoiceSpeechInput({
  value,
  onChange,
  buttonLabel = "Speak to Type",
  fieldName = "Grievance Statement",
  disabled = false,
}: VoiceSpeechInputProps) {
  const [selectedLang, setSelectedLang] = useState<string>("hi-IN");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcriptInterim, setTranscriptInterim] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // References to guarantee zero stale closures during asynchronous events
  const selectedLangRef = useRef<string>("hi-IN");
  const valueRef = useRef<string>(value);
  const isListeningRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Keep refs synchronized with active state/props
  useEffect(() => {
    selectedLangRef.current = selectedLang;
  }, [selectedLang]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Load preferred voice language from localStorage on initial render
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("icj_preferred_voice_lang");
      if (savedLang && INDIAN_LANGUAGES.some((l) => l.code === savedLang)) {
        setSelectedLang(savedLang);
        selectedLangRef.current = savedLang;
      }
    } catch {}
  }, []);

  const currentLangObj =
    INDIAN_LANGUAGES.find((l) => l.code === selectedLang) || INDIAN_LANGUAGES[0];

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    setTranscriptInterim("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  /**
   * Start or restart speech recognition ensuring recognition.lang is explicitly set
   * to the requested language without any stale closure.
   */
  const startListening = (langOverride?: string) => {
    if (typeof window === "undefined") return;

    setErrorMsg(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg(
        "Voice speech recognition is supported on Google Chrome, Microsoft Edge, and Android Chrome. Please open this page in Chrome or Edge."
      );
      setModalOpen(true);
      return;
    }

    // Safely abort any prior running instance first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    const langToUse = langOverride || selectedLangRef.current || selectedLang || "hi-IN";

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = langToUse;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setTranscriptInterim("");
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let interimText = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            finalChunk += trans + " ";
          } else {
            interimText += trans;
          }
        }

        setTranscriptInterim(interimText);

        if (finalChunk.trim()) {
          const cleanedChunk = finalChunk.trim();
          const current = (valueRef.current || "").trim();
          const updated = current ? `${current} ${cleanedChunk}` : cleanedChunk;
          onChange(updated);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[VoiceSpeechInput] recognition notice:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setErrorMsg(
            "Microphone permission was denied. Please allow microphone access in your browser site settings."
          );
        } else if (event.error === "no-speech") {
          // Normal pause in speech, do not throw error
          return;
        } else {
          setErrorMsg(`Voice input status: ${event.error}. Please tap the microphone and speak again.`);
        }
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
        setTranscriptInterim("");
      };

      recognitionRef.current = recognition;
      recognition.start();
      setModalOpen(true);
    } catch (err: any) {
      console.error("Failed to start voice recognition:", err);
      setErrorMsg(err?.message || "Could not start microphone.");
      isListeningRef.current = false;
      setIsListening(false);
      setModalOpen(true);
    }
  };

  /**
   * Directly switch language, persist preference, and immediately restart
   * recognition in that exact language if currently active.
   */
  const handleLanguageChange = (newLang: string) => {
    selectedLangRef.current = newLang;
    setSelectedLang(newLang);

    try {
      localStorage.setItem("icj_preferred_voice_lang", newLang);
    } catch {}

    if (isListeningRef.current || isListening) {
      stopListening();
      setTimeout(() => {
        startListening(newLang);
      }, 120);
    }
  };

  const handleClearField = () => {
    onChange("");
    setTranscriptInterim("");
  };

  return (
    <>
      {/* ── Trigger Controls: Language Picker & Mic Speak Button (Zero DOM Prop Leakage) ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        {/* Quick Language Selector directly on the page */}
        <Select
          size="small"
          value={selectedLang}
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={disabled}
          sx={{
            height: 32,
            fontSize: "0.76rem",
            fontWeight: 800,
            bgcolor: "#f8fafc",
            borderRadius: "20px",
            border: "1px solid #cbd5e1",
            color: "#0f2942",
            "& .MuiSelect-select": {
              py: 0.35,
              px: 1.1,
              display: "flex",
              alignItems: "center",
              gap: 0.6,
            },
            "&:hover": {
              bgcolor: "#f1f5f9",
              borderColor: "#2563eb",
            },
          }}
        >
          {INDIAN_LANGUAGES.map((lang) => (
            <MenuItem key={lang.code} value={lang.code} sx={{ fontSize: "0.82rem", py: 0.8 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <strong style={{ color: "#0f2942" }}>{lang.nativeName}</strong>
                <span style={{ color: "#64748b", fontSize: "0.74rem" }}>({lang.name})</span>
              </Box>
            </MenuItem>
          ))}
        </Select>

        {/* Speak Trigger Button */}
        <Tooltip
          title={`बोलकर लिखें / Speak in ${currentLangObj.name} (${currentLangObj.nativeName}) to auto-type`}
          arrow
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => startListening()}
            disabled={disabled}
            startIcon={
              isListening ? (
                <GraphicEqIcon
                  sx={{
                    color: "#dc2626",
                    animation: `${pulseRadar} 1.5s infinite`,
                  }}
                />
              ) : (
                <MicIcon sx={{ color: "#2563eb" }} />
              )
            }
            sx={{
              textTransform: "none",
              borderRadius: "20px",
              borderColor: isListening ? "#dc2626" : "#cbd5e1",
              bgcolor: isListening ? "rgba(254, 226, 226, 0.4)" : "#ffffff",
              color: isListening ? "#dc2626" : "#0f2942",
              fontSize: "0.76rem",
              fontWeight: 700,
              py: 0.4,
              px: 1.4,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "#2563eb",
                bgcolor: "rgba(37, 99, 235, 0.05)",
              },
            }}
          >
            {isListening ? `Listening (${currentLangObj.nativeName})...` : `${buttonLabel} (बोलकर लिखें)`}
          </Button>
        </Tooltip>
      </Box>

      {/* ── Real-Time Voice Typing Interactive Modal ── */}
      <Dialog
        open={modalOpen}
        onClose={() => {
          stopListening();
          setModalOpen(false);
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid #cbd5e1",
              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.2)",
            },
          },
        }}
      >
        {/* Header Ribbon */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #0f2942 0%, #1e3a8a 100%)",
            color: "#ffffff",
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                bgcolor: isListening ? "#dc2626" : "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: isListening ? `${pulseRadar} 1.6s infinite` : "none",
              }}
            >
              {isListening ? (
                <MicIcon sx={{ color: "#ffffff" }} />
              ) : (
                <MicNoneIcon sx={{ color: "#ffffff" }} />
              )}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "0.02em" }}>
                Voice Speech-to-Text Typing
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#93c5fd" }}>
                बोलकर लिखें — Typing for: {fieldName}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              stopListening();
              setModalOpen(false);
            }}
            sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "#ffffff" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: "#fafafa" }}>
          {errorMsg && (
            <Alert severity="warning" sx={{ mb: 2.5 }} onClose={() => setErrorMsg(null)}>
              {errorMsg}
            </Alert>
          )}

          {/* ── Active Language Selection Bar ── */}
          <Box
            sx={{
              p: 2,
              mb: 2.5,
              bgcolor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <TranslateIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f2942" }}>
                    Select Language (भाषा चुनें)
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: "0.72rem", color: "#64748b", mt: 0.3 }}>
                  Active Script: <strong style={{ color: "#2563eb" }}>{currentLangObj.nativeName} ({currentLangObj.name})</strong> — बोलें और तुरंत टाइप होगा
                </Typography>
              </Box>

              <Select
                size="small"
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                sx={{
                  minWidth: 190,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  bgcolor: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                {INDIAN_LANGUAGES.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code} sx={{ fontSize: "0.85rem", py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <strong style={{ color: "#0f2942" }}>{lang.nativeName}</strong>
                      <span style={{ color: "#64748b", fontSize: "0.75rem" }}>({lang.name})</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>

          {/* ── Visual Mic Recording Indicator ── */}
          <Box
            sx={{
              textAlign: "center",
              py: 2.5,
              px: 2,
              mb: 2.5,
              bgcolor: isListening ? "rgba(239, 68, 68, 0.04)" : "#ffffff",
              borderRadius: "14px",
              border: isListening ? "2px solid #ef4444" : "1.5px dashed #cbd5e1",
              transition: "all 0.25s ease-in-out",
            }}
          >
            {isListening ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                {/* Pulsing Mic Circle */}
                <Box
                  onClick={stopListening}
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    bgcolor: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    animation: `${pulseRadar} 1.6s infinite`,
                    boxShadow: "0 6px 20px rgba(220, 38, 38, 0.35)",
                  }}
                >
                  <StopIcon sx={{ fontSize: 36, color: "#ffffff" }} />
                </Box>

                {/* Animated Audio Equalizer Waveform */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, height: 28, my: 0.5 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => (
                    <Box
                      key={bar}
                      sx={{
                        width: 3.5,
                        bgcolor: "#dc2626",
                        borderRadius: "2px",
                        animation: `${waveBounce} 0.8s ease-in-out infinite alternate`,
                        animationDelay: `${bar * 0.08}s`,
                      }}
                    />
                  ))}
                </Box>

                <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "#dc2626" }}>
                  {currentLangObj.promptPlaceholder}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Speaking in <strong>{currentLangObj.nativeName}</strong>. Words are typed below automatically. Click red button to stop.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                <Box
                  onClick={() => startListening()}
                  sx={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    bgcolor: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(37, 99, 235, 0.3)",
                    transition: "transform 0.2s ease",
                    "&:hover": { transform: "scale(1.06)", bgcolor: "#1d4ed8" },
                  }}
                >
                  <MicIcon sx={{ fontSize: 34, color: "#ffffff" }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f2942" }}>
                  Tap Microphone to Speak in {currentLangObj.nativeName} ({currentLangObj.name})
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontStyle: "italic",
                    maxWidth: 420,
                  }}
                >
                  {currentLangObj.greetingHint}
                </Typography>
              </Box>
            )}
          </Box>

          {/* ── Live Transcribed Output Window ── */}
          <Box
            sx={{
              p: 2,
              bgcolor: "#ffffff",
              borderRadius: "12px",
              border: "1.5px solid #cbd5e1",
              minHeight: 120,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
                pb: 0.5,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "#475569",
                  textTransform: "uppercase",
                }}
              >
                Transcribed Text ({currentLangObj.nativeName} में लिखा गया विवरण)
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                {(value || "").length} characters
              </Typography>
            </Box>

            {value ? (
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  color: "#0f172a",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {value}
                {transcriptInterim && (
                  <span style={{ color: "#2563eb", fontStyle: "italic", fontWeight: 600 }}>
                    {" "}{transcriptInterim}
                  </span>
                )}
              </Typography>
            ) : transcriptInterim ? (
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  color: "#2563eb",
                  fontStyle: "italic",
                  fontWeight: 600,
                }}
              >
                {transcriptInterim}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>
                Your spoken statement in {currentLangObj.nativeName} ({currentLangObj.name}) will appear here in real-time as you speak...
              </Typography>
            )}
          </Box>
        </DialogContent>

        {/* Modal Actions */}
        <DialogActions
          sx={{
            p: 2.5,
            bgcolor: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearField}
            disabled={!value && !transcriptInterim}
            sx={{ textTransform: "none", fontSize: "0.82rem" }}
          >
            Clear Text
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isListening ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopIcon />}
                onClick={stopListening}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Stop Listening
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<MicIcon />}
                onClick={() => startListening()}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Speak More
              </Button>
            )}

            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={() => {
                stopListening();
                setModalOpen(false);
              }}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "#0f2942",
                "&:hover": { bgcolor: "#1e3a8a" },
              }}
            >
              Done &amp; Apply
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
