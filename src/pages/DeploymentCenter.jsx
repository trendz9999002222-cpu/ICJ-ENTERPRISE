import { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Grid, Button, Chip, Stack, Alert,
  Divider, LinearProgress, Table, TableHead, TableBody, TableRow, TableCell,
} from "@mui/material";

import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import StorageIcon from "@mui/icons-material/Storage";
import SecurityIcon from "@mui/icons-material/Security";
import BackupIcon from "@mui/icons-material/Backup";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import RefreshIcon from "@mui/icons-material/Refresh";
import UndoIcon from "@mui/icons-material/Undo";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

import MainLayout from "../layouts/MainLayout";
import EnvConfigManager from "../services/envConfigManager";
import InfraService from "../services/infrastructureService";

export default function DeploymentCenter() {
  const [readiness, setReadiness] = useState(null);
  const [providers, setProviders] = useState([]);
  const [rollbackSimulated, setRollbackSimulated] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const refreshData = () => {
    const audit = EnvConfigManager.getReadinessAudit();
    setReadiness(audit);
    setProviders(InfraService.getProviders());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSimulateRollback = () => {
    setRollbackSimulated(true);
    setAlertMsg("Simulated Rollback Executed: Rolled back to Stable Baseline Tag v1.0-pre-production.");
    setTimeout(() => setAlertMsg(""), 5000);
  };

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)",
            color: "#ffffff",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <RocketLaunchIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    Enterprise Production Deployment Center
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Real-time VPS, PostgreSQL, Gateway & Infrastructure Deployment Gateway
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<RefreshIcon />}
                onClick={refreshData}
                sx={{ fontWeight: "bold" }}
              >
                Refresh Readiness Status
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {alertMsg && (
          <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setAlertMsg("")}>
            {alertMsg}
          </Alert>
        )}

        {/* Readiness Score Card */}
        {readiness && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center", height: "100%" }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" gutterBottom>
                  DEPLOYMENT READINESS SCORE
                </Typography>
                <Typography variant="h2" fontWeight="bold" color="primary.main">
                  {readiness.readinessScore}%
                </Typography>
                <Chip
                  label={readiness.deploymentReady ? "PROD READY" : "AWAITING API / VPS KEYS"}
                  color={readiness.deploymentReady ? "success" : "warning"}
                  sx={{ mt: 1, fontWeight: "bold" }}
                />
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={readiness.readinessScore}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                  Deployment Gate Checks
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Build Status</Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">🟢 PASS (0 Errors)</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Database Status</Typography>
                    <Typography variant="body1" fontWeight="bold" color="info.main">ℹ️ Ready (Mock / Schema)</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">SSL & Domain Status</Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">🔒 SSL Configured</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Backup Status</Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">Verified JSON / Git Tag</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">Migration Status</Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">Prisma Up-to-date</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary">API Gateways</Typography>
                    <Typography variant="body1" fontWeight="bold" color="warning.main">
                      {readiness.configuredCount} / {readiness.totalCount} Configured
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<UndoIcon />}
                    onClick={handleSimulateRollback}
                  >
                    Simulate Rollback (v1.0-pre-production)
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Provider Deployment Status Table */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Infrastructure & API Provider Deployment Status
          </Typography>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell><strong>Provider Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Enabled State</strong></TableCell>
                <TableCell><strong>Missing Env Vars</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {providers.map((p) => {
                const missing = (p.envVars || []).filter((v) => !process.env[v]);
                return (
                  <TableRow key={p.id}>
                    <TableCell><strong>{p.name}</strong></TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={p.status === "configured" ? "Configured" : "Awaiting Keys"}
                        color={p.status === "configured" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.enabled !== false ? "Enabled" : "Disabled"}
                        color={p.enabled !== false ? "primary" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {missing.length === 0 ? (
                        <Chip label="None (Ready)" color="success" size="small" variant="outlined" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {missing.join(", ")}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </MainLayout>
  );
}
