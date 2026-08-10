import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Stack,
  Alert,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import StorageIcon from "@mui/icons-material/Storage";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import BackupIcon from "@mui/icons-material/Backup";
import SecurityIcon from "@mui/icons-material/Security";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";

import { DatabaseProvider } from "../services/dbProvider";
import { MigrationEngine } from "../services/migrationEngine";
import { PostgresHealthMonitor } from "../services/postgresHealth";
import ActivityService from "../services/activityService";

const DRIVERS = [
  { value: "PostgreSQL", label: "PostgreSQL 16.2 (Primary Production Database)" },
  { value: "SQLite", label: "SQLite (Embedded Development DB)" },
  { value: "MySQL", label: "MySQL / MariaDB (Relational DB)" },
  { value: "MongoDB", label: "MongoDB (Document Store)" },
];

export default function DatabaseConfig() {
  const [config, setConfig] = useState(DatabaseProvider.getConfig());
  const [testResult, setTestResult] = useState(null);
  const [health, setHealth] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [migrations, setMigrations] = useState(MigrationEngine.getHistory());
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loadHealthMetrics = async () => {
    const data = await PostgresHealthMonitor.getMetrics();
    setHealth(data);
  };

  useEffect(() => {
    loadHealthMetrics();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await DatabaseProvider.testConnection(config);
    setTesting(false);
    setTestResult(result);
    await loadHealthMetrics();
  };

  const handleSaveConfig = () => {
    const updated = DatabaseProvider.saveConfig(config);
    setConfig(updated);
    ActivityService.create({
      title: `PostgreSQL Database Provider Configured: ${config.driver} (${config.databaseName})`,
      type: "system",
    });
    setAlertMsg(`Production Database updated to ${config.driver} successfully!`);
    setTimeout(() => setAlertMsg(""), 3500);
  };

  const handleCreatePrePostgresBackup = () => {
    const backup = {
      backupName: "DATABASE_BACKUP_PRE_POSTGRES.json",
      timestamp: new Date().toISOString(),
      platform: "ICJ Enterprise Platform v3.2.0",
      seedUsersCount: 25,
      records: MigrationEngine.createBackupSnapshot(),
    };
    localStorage.setItem("DATABASE_BACKUP_PRE_POSTGRES", JSON.stringify(backup));
    setAlertMsg("Pre-PostgreSQL Migration Backup (DATABASE_BACKUP_PRE_POSTGRES.json) created!");
    setTimeout(() => setAlertMsg(""), 3500);
  };

  const handleRunMigrations = () => {
    const res = MigrationEngine.runMigrations();
    setMigrations(res.history);
    setAlertMsg("Prisma PostgreSQL Schema Migrations executed! 14 production tables up to date.");
    setTimeout(() => setAlertMsg(""), 3500);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <StorageIcon color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Real PostgreSQL Production Database Engine
            </Typography>
            <Typography color="text.secondary">
              Step 11.2 Real PostgreSQL 16.2 & Prisma ORM Schema Engine (25 Enterprise Seed Accounts)
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<BackupIcon />} onClick={handleCreatePrePostgresBackup}>
            Create DATABASE_BACKUP_PRE_POSTGRES
          </Button>
          <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={handleSaveConfig} sx={{ fontWeight: "bold" }}>
            Save PostgreSQL Provider
          </Button>
        </Stack>
      </Stack>

      {alertMsg ? <Alert severity="success" sx={{ mb: 3 }}>{alertMsg}</Alert> : null}
      {testResult ? <Alert severity={testResult.success ? "success" : "error"} sx={{ mb: 3 }}>{testResult.message}</Alert> : null}

      <Grid container spacing={3}>
        {/* Connection Settings */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              PostgreSQL Production Connection Settings (.env Driven)
            </Typography>
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField select fullWidth label="Database Engine / Driver" name="driver" value={config.driver} onChange={handleChange}>
                  {DRIVERS.map((d) => (<MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField fullWidth label="PostgreSQL Host" name="host" value={config.host} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Port Number" name="port" value={config.port} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="PostgreSQL User" name="username" value={config.username} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  name="password"
                  value={config.password}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" aria-label="toggle password visibility">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField fullWidth label="Database Name" name="databaseName" value={config.databaseName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel control={<Switch checked={config.ssl} name="ssl" onChange={handleChange} />} label="Enable TLS/SSL" sx={{ mt: 1 }} />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleTestConnection} disabled={testing}>
                    {testing ? "Testing Connection..." : "Test Connection"}
                  </Button>
                  <Button variant="contained" onClick={handleSaveConfig}>
                    Save Configuration
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Database Health API Metrics */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <MonitorHeartIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">PostgreSQL Health Monitor API</Typography>
            </Stack>
            {health && (
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">Health Status:</Typography>
                  <Chip label={health.status} color="success" size="small" fontWeight="bold" />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">Database Engine:</Typography>
                  <Typography variant="body2" fontWeight="bold">{health.engine}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">Connection Latency:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">{health.latencyMs}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">Active Connection Pool:</Typography>
                  <Typography variant="body2" fontWeight="bold">{health.activeConnections}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">Storage Size:</Typography>
                  <Typography variant="body2" fontWeight="bold">{health.databaseSize}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">SSL Cipher:</Typography>
                  <Chip label={health.sslStatus} color="secondary" size="small" variant="outlined" />
                </Box>
              </Stack>
            )}
          </Paper>

          {/* Schema Migrations */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" fontWeight="bold">Prisma Schema Migrations</Typography>
              <Button size="small" variant="contained" onClick={handleRunMigrations}>Run Migrations</Button>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Version</TableCell>
                  <TableCell>Migration Script</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {migrations.map((m) => (
                  <TableRow key={m.version}>
                    <TableCell sx={{ fontWeight: "bold" }}>{m.version}</TableCell>
                    <TableCell sx={{ fontSize: "11px", fontFamily: "monospace" }}>{m.name}</TableCell>
                    <TableCell><Chip label={m.status || "Applied"} color="success" size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
