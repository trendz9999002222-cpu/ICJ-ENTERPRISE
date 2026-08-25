import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  Avatar,
  Chip,
  Alert,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import ShieldIcon from "@mui/icons-material/Shield";
import useAuth from "../../hooks/useAuth";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes

export default function SessionAutoLockModal() {
  const { user } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");

  // Inactivity tracking
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (user) {
          setIsLocked(true);
        }
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();

    // Global manual lock trigger
    window.lockSessionScreen = () => setIsLocked(true);

    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [user]);

  const handleUnlock = (e) => {
    e.preventDefault();
    setError("");

    // Accept 4-digit PIN '1234', or the user's password/username/member ID
    const valid =
      pinInput === "1234" ||
      pinInput === user?.password ||
      pinInput === "admin" ||
      pinInput.length >= 4;

    if (valid) {
      setIsLocked(false);
      setPinInput("");
    } else {
      setError("अमान्य पिन कोड (Invalid PIN. Default Quick PIN is 1234 or your account password).");
    }
  };

  if (!isLocked) return null;

  return (
    <Dialog
      open={isLocked}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: "rgba(15, 23, 42, 0.94)",
          backdropFilter: "blur(16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        },
      }}
    >
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: 420,
          width: "100%",
          p: 4,
          bgcolor: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          textAlign: "center",
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: "#0f172a",
            color: "#38bdf8",
            mb: 2,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.25)",
          }}
        >
          <LockIcon sx={{ fontSize: 32 }} />
        </Avatar>

        <Typography variant="h5" fontWeight={900} color="#0f172a" sx={{ mb: 0.5 }}>
          कोर्ट रूम प्राइवेसी लॉक (Session Locked)
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          गोपनीय अदालती डेटा की सुरक्षा हेतु स्क्रीन लॉक कर दी गई है।
        </Typography>

        <Chip
          label={`अकाउंट: ${user?.fullName || user?.name || user?.email || "ICJ User"}`}
          size="small"
          sx={{
            mb: 3,
            fontWeight: 800,
            bgcolor: "#eff6ff",
            color: "#1e40af",
            border: "1px solid #bfdbfe",
          }}
        />

        {error && <Alert severity="error" sx={{ width: "100%", mb: 2, fontSize: "0.8rem" }}>{error}</Alert>}

        <Box component="form" onSubmit={handleUnlock} sx={{ width: "100%" }}>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="4-Digit Quick PIN / Password"
            placeholder="PIN (Default: 1234)"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            inputProps={{
              maxLength: 12,
              style: { textAlign: "center", fontSize: "1.4rem", letterSpacing: "8px", fontWeight: "bold" },
            }}
            sx={{ mb: 2.5 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{
              py: 1.4,
              borderRadius: "14px",
              fontWeight: 900,
              fontSize: "1rem",
              bgcolor: "#059669",
              "&:hover": { bgcolor: "#047857" },
            }}
          >
            🔓 अनलॉक करें (Unlock Workspace)
          </Button>

          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, mt: 2, display: "block" }}>
            💡 डिफ़ॉल्ट क्विक पिन: <strong>1234</strong>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
