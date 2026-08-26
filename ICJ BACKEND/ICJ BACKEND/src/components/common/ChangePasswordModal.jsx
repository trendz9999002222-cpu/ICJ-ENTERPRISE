import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Stack,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyIcon from "@mui/icons-material/Key";

import AuthService from "../../services/authService.js";
import PasswordPolicyService from "../../services/passwordPolicyService.js";

export default function ChangePasswordModal({ open = false, onClose = () => {}, user = null, onSuccess = () => {} }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleResetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setSubmitting(false);
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("कृपया अपना पुराना पासवर्ड (Old Password) दर्ज करें।");
      return;
    }

    if (!newPassword) {
      setError("कृपया नया पासवर्ड दर्ज करें।");
      return;
    }

    if (newPassword.length < 8) {
      setError("नया पासवर्ड कम से कम 8 अक्षर (Minimum 8 Characters) का होना चाहिए।");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("नया पासवर्ड और कन्फर्म पासवर्ड एक जैसे नहीं हैं। कृपया दोबारा जांचें।");
      return;
    }

    const targetUserId = user?.id || user?.member_id || user?.username || user?.email;
    if (!targetUserId) {
      setError("उपयोगकर्ता खाता नहीं मिला। कृपया पुनः लॉगिन करें।");
      return;
    }

    setSubmitting(true);
    try {
      const res = await AuthService.changePassword({
        userId: targetUserId,
        currentPassword,
        newPassword,
      });

      setSuccess("🎉 आपका पासवर्ड सफलतापूर्वक बदल दिया गया है!");
      setTimeout(() => {
        if (onSuccess) onSuccess(res.user);
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "पासवर्ड बदलने में समस्या आई।");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "#0f172a",
          color: "#ffffff",
          border: "1px solid #334155",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: "#1e293b", color: "#ffffff", borderBottom: "1px solid #334155", py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ bgcolor: "rgba(56, 189, 248, 0.15)", p: 1, borderRadius: 2 }}>
            <KeyIcon sx={{ color: "#38bdf8", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#ffffff">
              🔒 Change Password (पासवर्ड बदलें)
            </Typography>
            <Typography variant="caption" color="#94a3b8">
              खाता: {user?.fullName || user?.name || user?.email || "User"}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: "#450a0a", color: "#fca5a5", border: "1px solid #7f1d1d" }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, bgcolor: "#064e3b", color: "#6ee7b7", border: "1px solid #059669" }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Stack spacing={2.5}>
            {/* OLD PASSWORD */}
            <TextField
              fullWidth
              type={showCurrent ? "text" : "password"}
              label="Old / Current Password (पुराना पासवर्ड)"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={submitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#1e293b",
                  color: "#ffffff",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "#475569" },
                  "&:hover fieldset": { borderColor: "#38bdf8" },
                  "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#38bdf8" },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrent((v) => !v)} edge="end" sx={{ color: "#94a3b8" }}>
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* NEW PASSWORD */}
            <TextField
              fullWidth
              type={showNew ? "text" : "password"}
              label="New Password (नया पासवर्ड)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={submitting}
              helperText="न्यूनतम 8 अक्षर (चाहे सिर्फ नंबर, सिर्फ अक्षर या मिक्स्ड हो)"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#1e293b",
                  color: "#ffffff",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "#475569" },
                  "&:hover fieldset": { borderColor: "#38bdf8" },
                  "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#38bdf8" },
                "& .MuiFormHelperText-root": { color: "#38bdf8", fontWeight: 500 },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew((v) => !v)} edge="end" sx={{ color: "#94a3b8" }}>
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* CONFIRM NEW PASSWORD */}
            <TextField
              fullWidth
              type={showConfirm ? "text" : "password"}
              label="Confirm New Password (नया पासवर्ड दोबारा दर्ज करें)"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={submitting}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#1e293b",
                  color: "#ffffff",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "#475569" },
                  "&:hover fieldset": { borderColor: "#38bdf8" },
                  "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#38bdf8" },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" sx={{ color: "#94a3b8" }}>
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#1e293b", borderTop: "1px solid #334155" }}>
        <Button variant="outlined" color="inherit" onClick={handleClose} disabled={submitting} sx={{ color: "#94a3b8" }}>
          रद्द करें (Cancel)
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
          sx={{ fontWeight: 800, px: 3, bgcolor: "#0284c7", "&:hover": { bgcolor: "#0369a1" } }}
        >
          {submitting ? "अपडेट हो रहा है..." : "पासवर्ड बदलें (Save Password)"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
