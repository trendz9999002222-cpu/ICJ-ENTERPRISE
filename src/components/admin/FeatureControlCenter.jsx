import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  Button,
  TextField,
  Divider,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SecurityIcon from "@mui/icons-material/Security";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import HistoryIcon from "@mui/icons-material/History";

import FeatureControlService from "../../services/featureControlService.js";

function FeatureControlCenter() {
  const [globalFlags, setGlobalFlags] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchUserId, setSearchUserId] = useState("");
  const [targetUserName, setTargetUserName] = useState("");
  const [userOverrides, setUserOverrides] = useState({});
  const [statusMsg, setStatusMsg] = useState("");

  const refreshData = () => {
    setGlobalFlags(FeatureControlService.getGlobalFlags());
    setAuditLogs(FeatureControlService.getAuditLogs());
    setUserOverrides(FeatureControlService.getUserOverrides());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleGlobalToggle = (featureId, currentVal) => {
    FeatureControlService.toggleGlobalFeature(featureId, !currentVal, "Super Admin");
    refreshData();
    setStatusMsg(`Global feature ${featureId} toggled to ${!currentVal ? "ENABLED" : "DISABLED"}`);
  };

  const handleUserBlockToggle = (featureId, isBlocked) => {
    if (!searchUserId.trim()) {
      alert("Please enter a Member or Advocate ID first!");
      return;
    }
    FeatureControlService.setUserFeatureOverride(
      searchUserId.trim(),
      targetUserName.trim() || "User " + searchUserId,
      featureId,
      isBlocked, // false = blocked, true = enabled
      "Super Admin"
    );
    refreshData();
    setStatusMsg(`Individual service ${featureId} set to ${isBlocked ? "ENABLED" : "BLOCKED"} for user ${searchUserId}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3, bgcolor: "#0f172a", color: "#ffffff", borderRadius: 2, border: "1px solid #334155" }}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
          <SecurityIcon sx={{ color: "#3b82f6", fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#ffffff">
              Super Admin Phased Launch & Feature Control Center
            </Typography>
            <Typography variant="caption" color="#94a3b8">
              Toggle global platform services for phased rollout or block individual user access in real time.
            </Typography>
          </Box>
        </Stack>

        {statusMsg && (
          <Alert severity="success" sx={{ mb: 2, bgcolor: "#064e3b", color: "#6ee7b7" }} onClose={() => setStatusMsg("")}>
            {statusMsg}
          </Alert>
        )}

        {/* 1. GLOBAL FEATURE SWITCHBOARD */}
        <Typography variant="subtitle2" fontWeight={800} color="#fcd34d" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <ToggleOnIcon /> 1. Global Platform Feature Switches (सबके लिए बंद / चालू)
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Object.values(globalFlags).map((flag) => (
            <Grid item xs={12} sm={6} md={4} key={flag.id}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: flag.enabled ? "#1e293b" : "#450a0a",
                  border: flag.enabled ? "1px solid #3b82f6" : "1px solid #ef4444",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={800} color="#ffffff">
                    {flag.name}
                  </Typography>
                  <Chip
                    label={flag.enabled ? "GLOBAL ON" : "GLOBAL OFF"}
                    size="small"
                    sx={{
                      bgcolor: flag.enabled ? "#10b981" : "#ef4444",
                      color: "#ffffff",
                      fontWeight: 800,
                      fontSize: "0.65rem",
                    }}
                  />
                </Stack>

                <Typography variant="caption" color="#94a3b8" sx={{ display: "block", mt: 1, minHeight: 36 }}>
                  {flag.description}
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(flag.enabled)}
                      onChange={() => handleGlobalToggle(flag.id, flag.enabled)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="caption" fontWeight={700} color={flag.enabled ? "#6ee7b7" : "#fca5a5"}>
                      {flag.enabled ? "Service Active" : "Service Disabled"}
                    </Typography>
                  }
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3, borderColor: "#334155" }} />

        {/* 2. INDIVIDUAL USER SERVICE BLOCKING */}
        <Typography variant="subtitle2" fontWeight={800} color="#fcd34d" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <PersonOffIcon /> 2. Individual User Service Control (किसी खास यूजर की सर्विस ब्लॉक/चालू करें)
        </Typography>

        <Paper sx={{ p: 2, bgcolor: "#1e293b", border: "1px solid #334155", borderRadius: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Target User ID (e.g. 26ICJ08AA0001)"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                sx={{
                  input: { color: "#ffffff", fontWeight: 700 },
                  label: { color: "#fcd34d", fontWeight: 800 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#0f172a",
                    "& fieldset": { borderColor: "#64748b" },
                    "&:hover fieldset": { borderColor: "#fcd34d" },
                    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#fcd34d" },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="User Full Name"
                value={targetUserName}
                onChange={(e) => setTargetUserName(e.target.value)}
                sx={{
                  input: { color: "#ffffff", fontWeight: 700 },
                  label: { color: "#fcd34d", fontWeight: 800 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#0f172a",
                    "& fieldset": { borderColor: "#64748b" },
                    "&:hover fieldset": { borderColor: "#fcd34d" },
                    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#fcd34d" },
                }}
              />
            </Grid>
          </Grid>

          {searchUserId.trim() && (
            <Box>
              <Typography variant="caption" color="#cbd5e1" sx={{ mb: 1, display: "block" }}>
                Toggle service access specifically for User <strong>{searchUserId}</strong>:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {Object.values(globalFlags).map((flag) => {
                  const userKey = searchUserId.trim().toLowerCase();
                  const isUserBlocked = userOverrides[userKey] && userOverrides[userKey][flag.id] === false;

                  return (
                    <Button
                      key={flag.id}
                      variant="contained"
                      size="small"
                      color={isUserBlocked ? "error" : "success"}
                      onClick={() => handleUserBlockToggle(flag.id, isUserBlocked ? true : false)}
                      sx={{ fontSize: "0.72rem", fontWeight: 800 }}
                    >
                      {flag.name}: {isUserBlocked ? "BLOCKED ❌" : "ACTIVE 🟢"}
                    </Button>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* 3. IMMUTABLE AUDIT LOGS */}
        <Accordion sx={{ bgcolor: "#1e293b", color: "#ffffff", border: "1px solid #334155" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#ffffff" }} />}>
            <Typography variant="subtitle2" fontWeight={800} color="#fcd34d" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <HistoryIcon /> 3. Immutable Security Audit Log History ({auditLogs.length} Events)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { color: "#fcd34d", fontWeight: 800 } }}>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id} sx={{ "& td": { color: "#cbd5e1" } }}>
                    <TableCell>{new Date(log.timestamp).toLocaleString("en-IN")}</TableCell>
                    <TableCell>{log.adminUsername}</TableCell>
                    <TableCell>
                      <Chip label={log.action} size="small" color="primary" sx={{ fontSize: "0.65rem" }} />
                    </TableCell>
                    <TableCell>{log.target}</TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
}

export default FeatureControlCenter;
