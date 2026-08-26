import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import LockResetIcon from "@mui/icons-material/LockReset";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import BadgeIcon from "@mui/icons-material/Badge";

import AuthService from "../../services/authService.js";
import PasswordPolicyService from "../../services/passwordPolicyService.js";

export default function QuickPasswordResetWidget({ onResetComplete = () => {} }) {
  const [identifier, setIdentifier] = useState("");
  const [previewUser, setPreviewUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Search/Lookup Member by ID, Email or Mobile
  const handleLookup = (idVal = identifier) => {
    const val = String(idVal || "").trim();
    setErrorMsg("");
    setResult(null);

    if (!val) {
      setPreviewUser(null);
      return;
    }

    setSearching(true);
    try {
      const found = AuthService.findUserByIdentifier(val);
      if (found) {
        setPreviewUser(found);
        setErrorMsg("");
      } else {
        setPreviewUser(null);
        setErrorMsg(`⚠️ आईडी/ईमेल/मोबाइल "${val}" से कोई मेंबर नहीं मिला। कृपया सही Member ID दर्ज करें।`);
      }
    } catch (err) {
      setErrorMsg("मेंबर ढूंढने में समस्या आई।");
    } finally {
      setSearching(false);
    }
  };

  // Instant Reset Action
  const handleResetPassword = async () => {
    const term = identifier.trim() || (previewUser?.member_id || previewUser?.email);
    if (!term) {
      setErrorMsg("कृपया पहले Member ID, Mobile या Email दर्ज करें।");
      return;
    }

    setErrorMsg("");
    setResetting(true);
    setCopied(false);

    try {
      const res = await AuthService.adminResetMemberPassword(term);
      setResult(res);
      setPreviewUser(res.user);
      if (onResetComplete) onResetComplete(res);
    } catch (err) {
      setErrorMsg(err.message || "पासवर्ड रीसेट करने में त्रुटि हुई।");
    } finally {
      setResetting(false);
    }
  };

  const handleCopyPassword = () => {
    if (!result?.newPassword) return;
    navigator.clipboard.writeText(result.newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClear = () => {
    setIdentifier("");
    setPreviewUser(null);
    setResult(null);
    setErrorMsg("");
    setCopied(false);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: { xs: 2.5, md: 3 },
        bgcolor: "#1e293b",
        color: "#ffffff",
        borderRadius: 3,
        border: "1px solid #475569",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* HEADER */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5} sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              bgcolor: "rgba(56, 189, 248, 0.15)",
              p: 1,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <KeyIcon sx={{ color: "#38bdf8", fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#38bdf8">
              ⚡ Instant Member Password Reset (क्विक पासवर्ड रीसेट)
            </Typography>
            <Typography variant="caption" color="#94a3b8">
              बिना किसी लिस्ट के — सीधे Member ID / Mobile / Email डालें और 1-क्लिक में रीसेट करें
            </Typography>
          </Box>
        </Stack>

        <Chip
          label="फॉर्मूला: नाम के 3 अक्षर + 12345 (कुल 8 अक्षर)"
          size="small"
          sx={{ bgcolor: "#0f172a", color: "#fcd34d", fontWeight: 700, border: "1px solid #334155" }}
        />
      </Stack>

      {/* INPUT CONTROLS */}
      <Box sx={{ bgcolor: "#0f172a", p: 2.5, borderRadius: 2.5, border: "1px solid #334155" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            size="medium"
            placeholder="Member ID दर्ज करें (उदा: ICJ-ADV-001, ईमेल या मोबाइल)"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (!e.target.value) {
                setPreviewUser(null);
                setResult(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLookup();
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#1e293b",
                color: "#ffffff",
                borderRadius: 2,
                fontSize: "1rem",
                "& fieldset": { borderColor: "#475569" },
                "&:hover fieldset": { borderColor: "#38bdf8" },
                "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
              },
            }}
            InputProps={{
              startAdornment: <BadgeIcon sx={{ color: "#94a3b8", mr: 1 }} />,
            }}
          />

          <Button
            variant="outlined"
            size="large"
            startIcon={searching ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
            onClick={() => handleLookup()}
            disabled={!identifier.trim() || searching}
            sx={{
              minWidth: 140,
              py: 1.4,
              borderColor: "#38bdf8",
              color: "#38bdf8",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { borderColor: "#7dd3fc", bgcolor: "rgba(56, 189, 248, 0.1)" },
            }}
          >
            Check Member
          </Button>

          <Button
            variant="contained"
            size="large"
            color="warning"
            startIcon={resetting ? <CircularProgress size={18} color="inherit" /> : <LockResetIcon />}
            onClick={handleResetPassword}
            disabled={!identifier.trim() || resetting}
            sx={{
              minWidth: 170,
              py: 1.4,
              bgcolor: "#f59e0b",
              color: "#000000",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { bgcolor: "#d97706" },
            }}
          >
            {resetting ? "Resetting..." : "⚡ Reset Password"}
          </Button>

          {(identifier || previewUser || result) && (
            <IconButton onClick={handleClear} sx={{ color: "#94a3b8" }} title="क्लियर करें">
              <RefreshIcon />
            </IconButton>
          )}
        </Stack>

        {/* ERROR FEEDBACK */}
        {errorMsg && (
          <Alert severity="error" sx={{ mt: 2, bgcolor: "#450a0a", color: "#fca5a5", border: "1px solid #7f1d1d" }}>
            {errorMsg}
          </Alert>
        )}

        {/* PREVIEW MEMBER DETAILS (IF FOUND) */}
        {previewUser && !result && (
          <Paper sx={{ mt: 2, p: 2, bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <PersonIcon sx={{ color: "#38bdf8" }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={800} color="#ffffff">
                    {previewUser.fullName || previewUser.name || previewUser.username}
                  </Typography>
                  <Typography variant="caption" color="#cbd5e1">
                    ID: <strong>{previewUser.member_id || previewUser.id}</strong> | Email: {previewUser.email} {previewUser.mobile ? `| Mobile: ${previewUser.mobile}` : ""}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Chip
                  label={(previewUser.role || "Member").toUpperCase()}
                  size="small"
                  color={previewUser.role === "admin" ? "error" : "primary"}
                  sx={{ fontWeight: 800 }}
                />
                <Chip
                  label={`नया पासवर्ड बनेगा: ${PasswordPolicyService.generateMemberDefaultPassword(previewUser.fullName || previewUser.name)}`}
                  size="small"
                  sx={{ bgcolor: "#064e3b", color: "#6ee7b7", fontWeight: 800 }}
                />
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* SUCCESS RESULT CARD (AFTER RESET) */}
        {result && (
          <Paper
            sx={{
              mt: 2.5,
              p: 2.5,
              bgcolor: "#064e3b",
              border: "1px solid #059669",
              borderRadius: 2.5,
              boxShadow: "0 4px 16px rgba(5, 150, 105, 0.2)",
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <CheckCircleIcon sx={{ color: "#34d399", fontSize: 24 }} />
                  <Typography variant="h6" fontWeight={800} color="#6ee7b7">
                    पासवर्ड सफलतापूर्वक रीसेट हो गया!
                  </Typography>
                </Stack>

                <Typography variant="body2" color="#e2e8f0">
                  मेंबर: <strong>{result.memberName}</strong> (ID: <code>{result.memberId}</code>)
                </Typography>
                <Typography variant="caption" color="#a7f3d0">
                  यह पासवर्ड नाम के पहले 3 अक्षर + 12345 के आधार पर कुल 8 अक्षर का बनाया गया है।
                </Typography>
              </Box>

              {/* GENERATED PASSWORD DISPLAY & COPY */}
              <Box
                sx={{
                  bgcolor: "#022c22",
                  p: 1.5,
                  px: 2.5,
                  borderRadius: 2,
                  border: "1px dashed #34d399",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="#94a3b8" display="block">
                    New Default Password:
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    color="#fcd34d"
                    sx={{ letterSpacing: 2, fontFamily: "monospace" }}
                  >
                    {result.newPassword}
                  </Typography>
                </Box>

                <Tooltip title={copied ? "Copied to Clipboard!" : "Copy Password"}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                    onClick={handleCopyPassword}
                    color={copied ? "success" : "info"}
                    sx={{ fontWeight: 800, textTransform: "none", py: 1 }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </Tooltip>
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>
    </Paper>
  );
}
