import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AuthService from "../../services/authService.js";

function EmailVerificationStudio({ user, onUpdateUser = () => {} }) {
  const [isEditing, setIsEditing] = useState(false);
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isVerified = Boolean(user?.emailVerified || user?.email_verified);

  const handleSendOTP = async () => {
    if (!emailInput.trim() || !emailInput.includes("@")) {
      setErrorMsg("Please enter a valid email address (e.g. user@domain.com).");
      return;
    }
    setErrorMsg("");

    try {
      await AuthService.sendEmailVerificationOTP({
        userId: user?.id || user?.member_id || "USER-001",
        newEmail: emailInput.trim(),
      });
      setOtpModalOpen(true);
      setStatusMsg(`Verification OTP sent to ${emailInput.trim()}`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send verification OTP.");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpInput.trim() || otpInput.trim().length < 4) {
      setErrorMsg("Please enter valid 6-digit OTP.");
      return;
    }
    setErrorMsg("");

    try {
      const res = await AuthService.verifyEmailOTP({
        userId: user?.id || user?.member_id || "USER-001",
        newEmail: emailInput.trim(),
        otp: otpInput.trim(),
      });

      if (res.success) {
        onUpdateUser({ ...user, email: emailInput.trim(), emailVerified: true });
        setOtpModalOpen(false);
        setIsEditing(false);
        setStatusMsg("🎉 Email Verified & Saved Successfully!");
        setTimeout(() => setStatusMsg(""), 3000);
      } else {
        setErrorMsg("Invalid OTP. Please enter 123456 for demo test.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Verification failed.");
    }
  };

  return (
    <Paper sx={{ p: 2.5, bgcolor: "#1e293b", color: "#ffffff", borderRadius: 2.5, border: "1px solid #334155" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <MarkEmailReadIcon sx={{ color: isVerified ? "#10b981" : "#f59e0b", fontSize: 28 }} />
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" fontWeight={800} color="#ffffff">
                Email Address & Verification
              </Typography>
              <Chip
                label={isVerified ? "🟢 VERIFIED" : "⚠️ UNVERIFIED (ईमेल अनवेरीफाइड)"}
                size="small"
                sx={{
                  bgcolor: isVerified ? "#059669" : "#d97706",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "0.68rem",
                }}
              />
            </Stack>
            <Typography variant="caption" color="#cbd5e1">
              Registered Email: <strong>{user?.email || "No email registered"}</strong>
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          color={isVerified ? "info" : "warning"}
          size="small"
          startIcon={<EditIcon />}
          onClick={() => setIsEditing(!isEditing)}
          sx={{ fontWeight: 800 }}
        >
          {isEditing ? "Cancel" : isVerified ? "Change Email" : "Edit & Verify Email"}
        </Button>
      </Stack>

      {statusMsg && <Alert severity="success" sx={{ mt: 2, bgcolor: "#064e3b", color: "#6ee7b7" }}>{statusMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mt: 2, bgcolor: "#450a0a", color: "#fca5a5" }}>{errorMsg}</Alert>}

      {isEditing && (
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #475569" }}>
          <Typography variant="caption" color="#fcd34d" mb={1} sx={{ display: "block", fontWeight: 700 }}>
            Enter your correct email address below to receive a 6-digit verification code:
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              fullWidth
              size="small"
              label="New / Correct Email Address"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              sx={{
                input: { color: "#ffffff", fontWeight: 700 },
                label: { color: "#fcd34d", fontWeight: 800 },
                "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", "& fieldset": { borderColor: "#475569" } },
              }}
            />
            <Button
              variant="contained"
              color="warning"
              startIcon={<SendIcon />}
              onClick={handleSendOTP}
              sx={{ fontWeight: 800, minWidth: 150 }}
            >
              Send OTP
            </Button>
          </Stack>
        </Box>
      )}

      {/* OTP VERIFICATION DIALOG */}
      <Dialog open={otpModalOpen} onClose={() => setOtpModalOpen(false)} maxWidth="xs" fullWidth paperProps={{ sx: { bgcolor: "#0f172a", color: "#ffffff", borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: "#1e293b", color: "#ffffff", borderBottom: "1px solid #334155" }}>
          🔒 Enter Email Verification OTP
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2, bgcolor: "#0284c7", color: "#ffffff" }}>
            A 6-digit OTP code has been dispatched to <strong>{emailInput}</strong>. (Enter <strong>123456</strong> for test)
          </Alert>
          <TextField
            fullWidth
            size="small"
            label="6-Digit Email Verification OTP"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            sx={{
              input: { color: "#ffffff", fontWeight: 800, letterSpacing: 3, textAlign: "center", fontSize: "1.2rem" },
              label: { color: "#fcd34d" },
              "& .MuiOutlinedInput-root": { bgcolor: "#1e293b", "& fieldset": { borderColor: "#38bdf8" } },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#1e293b", borderTop: "1px solid #334155" }}>
          <Button variant="outlined" color="inherit" onClick={() => setOtpModalOpen(false)} sx={{ color: "#94a3b8" }}>
            Cancel
          </Button>
          <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleVerifyOTP} sx={{ fontWeight: 800 }}>
            Verify & Save Email
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default EmailVerificationStudio;
