import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Stack,
  MenuItem,
  Alert,
  Chip,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import SendIcon from "@mui/icons-material/Send";
import SecurityIcon from "@mui/icons-material/Security";

import NotificationRoutingService from "../../services/notificationRoutingService.js";

function NotificationDispatcherModal({ open = false, onClose = () => {}, senderName = "Super Admin", senderRole = "super_admin" }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("CRITICAL"); // 'CRITICAL' | 'HIGH' | 'NORMAL'
  const [targetAudience, setTargetAudience] = useState("ALL_MEMBERS"); // 'ALL_MEMBERS' | 'ALL_ADVOCATES' | 'BRANCH' | 'INDIVIDUAL'
  const [targetUserId, setTargetUserId] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDispatch = () => {
    if (!title.trim() || !message.trim()) {
      setErrorMsg("Please enter notification title and message body.");
      return;
    }
    setErrorMsg("");

    try {
      NotificationRoutingService.dispatchNotification({
        title: title.trim(),
        message: message.trim(),
        priority,
        targetAudience,
        senderName,
        senderRole,
        targetUserId: targetUserId.trim() || null,
      });

      setStatusMsg(`✅ Broadcast Sent Successfully! Priority Bell: ${priority} | Audience: ${targetAudience}`);
      setTitle("");
      setMessage("");
      setTimeout(() => {
        setStatusMsg("");
        onClose();
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to dispatch notification.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth paperProps={{ sx: { bgcolor: "#0f172a", color: "#ffffff", borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: "#1e293b", color: "#ffffff", borderBottom: "1px solid #334155" }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <CampaignIcon sx={{ color: "#fcd34d", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#ffffff">
              Sender-Assigned Notification & Emergency Bell Dispatcher
            </Typography>
            <Typography variant="caption" color="#94a3b8">
              Assign bell priority sound (Continuous Siren vs Chime) and target audience
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {statusMsg && <Alert severity="success" sx={{ mb: 2, bgcolor: "#064e3b", color: "#6ee7b7" }}>{statusMsg}</Alert>}
        {errorMsg && <Alert severity="error" sx={{ mb: 2, bgcolor: "#450a0a", color: "#fca5a5" }}>{errorMsg}</Alert>}

        <Stack spacing= {2.5}>
          <TextField
            fullWidth
            size="small"
            label="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              input: { color: "#ffffff", fontWeight: 700 },
              label: { color: "#fcd34d", fontWeight: 800 },
              "& .MuiOutlinedInput-root": { bgcolor: "#1e293b", "& fieldset": { borderColor: "#475569" } },
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Message Body"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              textarea: { color: "#ffffff", fontWeight: 600 },
              label: { color: "#fcd34d", fontWeight: 800 },
              "& .MuiOutlinedInput-root": { bgcolor: "#1e293b", "& fieldset": { borderColor: "#475569" } },
            }}
          />

          {/* SENDER-ASSIGNED BELL PRIORITY SELECTOR */}
          <Paper sx={{ p: 2, bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: 2 }}>
            <Typography variant="caption" fontWeight={800} color="#fcd34d" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <VolumeUpIcon fontSize="small" /> 1. Select Assigned Bell Sound & Urgency Level
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              sx={{
                select: { color: "#ffffff", fontWeight: 700 },
                "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", "& fieldset": { borderColor: "#475569" } },
              }}
            >
              <MenuItem value="CRITICAL">🔴 CRITICAL EMERGENCY (Continuous Siren Ringing)</MenuItem>
              <MenuItem value="HIGH">🟠 URGENT MATTER (Double Beep Chime)</MenuItem>
              <MenuItem value="NORMAL">🟢 ROUTINE INFO (Gentle Single Chime)</MenuItem>
            </TextField>
          </Paper>

          {/* TARGET AUDIENCE SELECTOR */}
          <Paper sx={{ p: 2, bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: 2 }}>
            <Typography variant="caption" fontWeight={800} color="#fcd34d" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <SecurityIcon fontSize="small" /> 2. Select Target Recipient Audience
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              sx={{
                select: { color: "#ffffff", fontWeight: 700 },
                "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", "& fieldset": { borderColor: "#475569" } },
              }}
            >
              <MenuItem value="ALL_MEMBERS">📢 ALL MEMBERS (1-Click Platform Broadcast)</MenuItem>
              <MenuItem value="ALL_ADVOCATES">⚖️ ALL EMPANELED ADVOCATES</MenuItem>
              <MenuItem value="BRANCH">🏢 SPECIFIC DISTRICT FRANCHISEE / BRANCH</MenuItem>
              <MenuItem value="INDIVIDUAL">👤 INDIVIDUAL SPECIFIC MEMBER / CLIENT</MenuItem>
            </TextField>

            {targetAudience === "INDIVIDUAL" && (
              <TextField
                fullWidth
                size="small"
                label="Target User ID (e.g. ICJ-2026-MEM-0001)"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                sx={{
                  mt: 1.5,
                  input: { color: "#ffffff", fontWeight: 700 },
                  label: { color: "#6ee7b7" },
                  "& .MuiOutlinedInput-root": { bgcolor: "#0f172a", "& fieldset": { borderColor: "#475569" } },
                }}
              />
            )}
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#1e293b", borderTop: "1px solid #334155" }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ color: "#94a3b8" }}>
          Cancel
        </Button>
        <Button variant="contained" color="error" startIcon={<SendIcon />} onClick={handleDispatch} sx={{ fontWeight: 800, px: 3 }}>
          Dispatch Notification & Sound Bell
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NotificationDispatcherModal;
