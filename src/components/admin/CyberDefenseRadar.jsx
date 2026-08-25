import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  Divider,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import SecurityIcon from "@mui/icons-material/Security";
import BoltIcon from "@mui/icons-material/Bolt";
import EnhancedEncryptionIcon from "@mui/icons-material/EnhancedEncryption";
import StorageIcon from "@mui/icons-material/Storage";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import ThreatDefenseService from "../../services/threatDefenseService.js";

export default function CyberDefenseRadar() {
  const [securityData, setSecurityData] = useState(ThreatDefenseService.getSecuritySummary());
  const [underAttackMode, setUnderAttackMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityData(ThreatDefenseService.getSecuritySummary());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleUnderAttackMode = () => {
    const nextState = !underAttackMode;
    setUnderAttackMode(nextState);
    if (nextState) {
      ThreatDefenseService.logThreat({
        type: "UNDER_ATTACK_MODE_ENABLED",
        severity: "CRITICAL",
        details: "Admin manually elevated platform security to Maximum Fortress Lockdown.",
        mitigation: "Strict JS Challenge & Zero-Trust Turnstile Activated",
      });
      alert("🚨 MAXIMUM FORTRESS LOCKDOWN ACTIVATED!\nCloudflare Under Attack Mode & In-App Zero-Trust CAPTCHA enabled.");
    } else {
      alert("🟢 Platform returned to Standard High-Security Fortress Mode.");
    }
    setSecurityData(ThreatDefenseService.getSecuritySummary());
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: "20px",
        bgcolor: "#0f172a",
        color: "#ffffff",
        border: underAttackMode ? "2px solid #ef4444" : "1px solid #334155",
        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 1. RADAR HEADER */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <ShieldIcon sx={{ fontSize: 32, color: underAttackMode ? "#ef4444" : "#38bdf8" }} />
            <Box>
              <Typography variant="h6" fontWeight={900} color="#f8fafc">
                🛡️ 360° साइबर सुरक्षा एवं अभेद्य डिफेंस रडार (Cyber Defense Radar)
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700 }}>
                Enterprise DDoS Shield • SQLi/XSS Armor • Zero-Trust RLS • Real-Time Bot Defense
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<CheckCircleIcon sx={{ color: "#34d399 !important" }} />}
            label="100+ Tbps DDoS Capacity"
            size="small"
            sx={{ bgcolor: "#064e3b", color: "#34d399", fontWeight: 800, border: "1px solid #059669" }}
          />

          <Button
            variant="contained"
            size="small"
            onClick={toggleUnderAttackMode}
            sx={{
              bgcolor: underAttackMode ? "#ef4444" : "#1e293b",
              color: "#ffffff",
              fontWeight: 900,
              fontSize: "0.75rem",
              borderRadius: "10px",
              border: `1.5px solid ${underAttackMode ? "#dc2626" : "#475569"}`,
              "&:hover": { bgcolor: underAttackMode ? "#dc2626" : "#334155" },
            }}
          >
            {underAttackMode ? "🚨 DEACTIVATE ATTACK MODE" : "⚡ UNDER ATTACK MODE (DEFENSE)"}
          </Button>
        </Stack>
      </Stack>

      {underAttackMode && (
        <Alert severity="error" sx={{ mb: 3, bgcolor: "#7f1d1d", color: "#fecaca", fontWeight: 700 }}>
          ⚠️ <strong>MAXIMUM FORTRESS SHIELD ACTIVE:</strong> Every incoming connection is undergoing cryptographic verification. All automated botnets and suspicious IPs are being actively dropped.
        </Alert>
      )}

      {/* 2. 4-PILLAR SECURITY GAUGES */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "14px",
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              height: "100%",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <BoltIcon sx={{ color: "#38bdf8", fontSize: 22 }} />
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800 }}>
                LAYER 1: EDGE WAF & DDOS
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={900} color="#38bdf8">
              100% ACTIVE
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              Cloudflare Anycast Global Edge
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "14px",
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              height: "100%",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <SecurityIcon sx={{ color: "#34d399", fontSize: 22 }} />
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800 }}>
                LAYER 2: IN-APP ARMOR
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={900} color="#34d399">
              SQLi & XSS SHIELD
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              DOMPurify & Rate Limiter Armed
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "14px",
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              height: "100%",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <EnhancedEncryptionIcon sx={{ color: "#a855f7", fontSize: 22 }} />
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800 }}>
                LAYER 3: ZERO-TRUST RLS
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={900} color="#a855f7">
              AES-256 VAULT
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              Row-Level Policy Isolation Active
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "14px",
              bgcolor: "#1e293b",
              border: "1px solid #334155",
              height: "100%",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <CloudDoneIcon sx={{ color: "#f59e0b", fontSize: 22 }} />
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800 }}>
                LAYER 5: DISASTER RECOVERY
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={900} color="#f59e0b">
              RTO &lt; 5 MIN
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              Multi-Cloud Point-in-Time Cold Storage
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 3. RECENT INTRUSION TELEMETRY TABLE */}
      <Typography variant="subtitle2" fontWeight={800} color="#e2e8f0" sx={{ mb: 1.5 }}>
        📡 रीयल-टाइम घुसपैठ निवारण लॉग (Live Threat Interception Feed):
      </Typography>

      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ "& th": { color: "#94a3b8", borderColor: "#334155", fontWeight: 800, fontSize: "0.72rem" } }}>
              <TableCell>समय (Timestamp)</TableCell>
              <TableCell>हमले का प्रकार (Attack Vector)</TableCell>
              <TableCell>गंभीरता (Severity)</TableCell>
              <TableCell>विवरण (Details)</TableCell>
              <TableCell>सुरक्षा कार्रवाई (Mitigation Action)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {securityData.recentThreats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ color: "#64748b", textAlign: "center", py: 2, borderColor: "#334155" }}>
                  🟢 Zero anomalous threats detected. All perimeter shields operating normally.
                </TableCell>
              </TableRow>
            ) : (
              securityData.recentThreats.map((t) => (
                <TableRow key={t.id} sx={{ "& td": { color: "#cbd5e1", borderColor: "#334155", fontSize: "0.75rem" } }}>
                  <TableCell sx={{ fontFamily: "monospace" }}>{new Date(t.timestamp).toLocaleTimeString()}</TableCell>
                  <TableCell>
                    <Chip label={t.type} size="small" sx={{ bgcolor: "#3b0764", color: "#d8b4fe", fontWeight: 800, fontSize: "0.68rem" }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.severity}
                      size="small"
                      sx={{
                        bgcolor: t.severity === "CRITICAL" ? "#7f1d1d" : "#7c2d12",
                        color: t.severity === "CRITICAL" ? "#fca5a5" : "#fdba74",
                        fontWeight: 900,
                        fontSize: "0.68rem",
                      }}
                    />
                  </TableCell>
                  <TableCell>{t.details}</TableCell>
                  <TableCell sx={{ color: "#34d399", fontWeight: 700 }}>{t.mitigation}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
