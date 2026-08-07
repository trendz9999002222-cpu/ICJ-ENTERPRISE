import { useState, useEffect, useCallback } from "react";
import {
  Box, Paper, Typography, Grid, Button, Chip, TextField,
  Stack, Alert, Tabs, Tab, Table, TableHead, TableBody,
  TableRow, TableCell, LinearProgress, Stepper, Step,
  StepLabel, StepContent, Divider, Tooltip, IconButton,
  MenuItem, Switch, FormControlLabel, Accordion,
  AccordionSummary, AccordionDetails, Badge,
} from "@mui/material";

import SettingsInputAntennaIcon from "@mui/icons-material/SettingsInputAntenna";
import StorageIcon       from "@mui/icons-material/Storage";
import EmailIcon         from "@mui/icons-material/Email";
import SmsIcon           from "@mui/icons-material/Sms";
import PaymentIcon       from "@mui/icons-material/Payment";
import MapIcon           from "@mui/icons-material/Map";
import CloudUploadIcon   from "@mui/icons-material/CloudUpload";
import AutoAwesomeIcon   from "@mui/icons-material/AutoAwesome";
import BackupIcon        from "@mui/icons-material/Backup";
import SecurityIcon      from "@mui/icons-material/Security";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";
import ErrorIcon         from "@mui/icons-material/Error";
import WarningIcon       from "@mui/icons-material/Warning";
import HelpOutlineIcon   from "@mui/icons-material/Help";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import WifiIcon          from "@mui/icons-material/Wifi";
import WifiOffIcon       from "@mui/icons-material/WifiOff";
import ExpandMoreIcon    from "@mui/icons-material/ExpandMore";
import PlayArrowIcon     from "@mui/icons-material/PlayArrow";
import SaveIcon          from "@mui/icons-material/Save";
import RefreshIcon       from "@mui/icons-material/Refresh";
import TuneIcon          from "@mui/icons-material/Tune";
import MonitorHeartIcon  from "@mui/icons-material/MonitorHeart";
import LockIcon          from "@mui/icons-material/Lock";
import AssistantIcon     from "@mui/icons-material/Assistant";
import ListAltIcon       from "@mui/icons-material/ListAlt";

import InfraService, { PROVIDER_CATALOG, ENV_VARIABLE_CATALOG } from "../services/infrastructureService";
import EnvConfigManager from "../services/envConfigManager";
import APIKeyVault from "../services/apiKeyVault";

// ─── Icon map ────────────────────────────────────────────────
const ICON_MAP = {
  Storage:     <StorageIcon />,
  Email:       <EmailIcon />,
  Sms:         <SmsIcon />,
  WhatsApp:    <SmsIcon />,
  Payment:     <PaymentIcon />,
  Map:         <MapIcon />,
  Google:      <AutoAwesomeIcon />,
  CloudUpload: <CloudUploadIcon />,
  AutoAwesome: <AutoAwesomeIcon />,
  Backup:      <BackupIcon />,
};

// ─── Status chip ─────────────────────────────────────────────
function StatusChip({ status, size = "small" }) {
  const map = {
    configured:            { label: "Configured",            color: "success" },
    connected:             { label: "Connected",             color: "success" },
    partial:               { label: "Partial",               color: "warning" },
    not_configured:        { label: "Not Configured",        color: "default" },
    configuration_missing: { label: "Config Missing",        color: "warning" },
    error:                 { label: "Error",                 color: "error"   },
    pending:               { label: "Pending",               color: "info"    },
  };
  const c = map[status] || { label: status, color: "default" };
  return <Chip label={c.label} color={c.color} size={size} />;
}

// ─── Tab panel ───────────────────────────────────────────────
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

// ─── Provider icon ───────────────────────────────────────────
function ProviderIcon({ icon }) {
  return <Box sx={{ color: "primary.main", display: "flex" }}>{ICON_MAP[icon] || <StorageIcon />}</Box>;
}

// ─── Secret field ────────────────────────────────────────────
function SecretField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      fullWidth size="small" label={label}
      type={show ? "text" : "password"}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      InputProps={{
        endAdornment: (
          <IconButton size="small" onClick={() => setShow(!show)}>
            {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        ),
      }}
    />
  );
}

// ─── WIZARD STEPS ─────────────────────────────────────────────
const WIZARD_STEPS = [
  { label: "Database",  providerId: "postgresql",   icon: <StorageIcon />,     desc: "Configure PostgreSQL connection" },
  { label: "Email",     providerId: "smtp",         icon: <EmailIcon />,       desc: "Configure SMTP email gateway" },
  { label: "SMS",       providerId: "sms",          icon: <SmsIcon />,         desc: "Configure SMS provider" },
  { label: "WhatsApp",  providerId: "whatsapp",     icon: <SmsIcon />,         desc: "Configure WhatsApp Business API" },
  { label: "Payment",   providerId: "payment",      icon: <PaymentIcon />,     desc: "Configure payment gateway" },
  { label: "Storage",   providerId: "cloud_storage",icon: <CloudUploadIcon />, desc: "Configure cloud storage" },
  { label: "AI",        providerId: "ai_provider",  icon: <AutoAwesomeIcon />, desc: "Configure AI provider" },
  { label: "Finish",    providerId: null,           icon: <CheckCircleIcon />, desc: "Review and complete setup" },
];

// ─────────────────────────────────────────────────────────────
export default function APIConfigCenter() {
  const [tab, setTab]             = useState(0);
  const [providers, setProviders] = useState([]);
  const [configs, setConfigs]     = useState({});
  const [testResults, setTestResults]   = useState({});
  const [testLoading, setTestLoading]   = useState({});
  const [saveLoading, setSaveLoading]   = useState({});
  const [alertMsg, setAlertMsg]   = useState("");
  const [alertSev, setAlertSev]   = useState("success");
  const [validation, setValidation] = useState(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardCompleted, setWizardCompleted] = useState([]);
  const [health, setHealth]       = useState([]);

  const refresh = useCallback(() => {
    const p = InfraService.getProviders();
    setProviders(p);

    // Initialise config forms with saved values
    const cfg = {};
    p.forEach(pr => { cfg[pr.id] = { ...pr.config }; });
    setConfigs(cfg);

    setHealth(InfraService.getHealthSummary());
    setValidation(InfraService.validateProductionReadiness());

    const ws = InfraService.getWizardState();
    setWizardStep(ws.step);
    setWizardCompleted(ws.completed);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const notify = (msg, sev = "success") => {
    setAlertMsg(msg); setAlertSev(sev);
    setTimeout(() => setAlertMsg(""), 4000);
  };

  // ── Save provider config ──────────────────────────────────
  const handleSave = async (providerId) => {
    setSaveLoading(prev => ({ ...prev, [providerId]: true }));
    await new Promise(r => setTimeout(r, 400));
    InfraService.saveProvider(providerId, configs[providerId] || {});
    setSaveLoading(prev => ({ ...prev, [providerId]: false }));
    refresh();
    notify(`${PROVIDER_CATALOG.find(p=>p.id===providerId)?.name} configuration saved.`);
  };

  // ── Test connection ───────────────────────────────────────
  const handleTest = async (providerId) => {
    setTestLoading(prev => ({ ...prev, [providerId]: true }));
    await new Promise(r => setTimeout(r, 800)); // Simulate latency
    const result = InfraService.testConnection(providerId);
    setTestResults(prev => ({ ...prev, [providerId]: result }));
    setTestLoading(prev => ({ ...prev, [providerId]: false }));
    refresh();
    notify(result.message, result.status === "connected" ? "success" : "warning");
  };

  // ── Toggle enable status ─────────────────────────────────
  const handleToggleEnable = (providerId) => {
    InfraService.toggleProviderEnabled(providerId);
    refresh();
    notify(`Provider status updated.`);
  };

  // ── Field change ─────────────────────────────────────────
  const handleFieldChange = (providerId, key, value) => {
    setConfigs(prev => ({
      ...prev,
      [providerId]: { ...prev[providerId], [key]: value },
    }));
  };

  // ── Wizard step complete ──────────────────────────────────
  const handleWizardNext = (step, providerId) => {
    if (providerId) {
      InfraService.saveProvider(providerId, configs[providerId] || {});
    }
    InfraService.completeWizardStep(step);
    setWizardCompleted(prev => [...new Set([...prev, step])]);
    setWizardStep(step + 1);
    refresh();
  };

  // ─── Render a provider configuration form ────────────────
  const renderProviderForm = (provider, compact = false) => {
    const cfg = configs[provider.id] || {};
    const saved = InfraService.getProviders().find(p => p.id === provider.id) || {};
    const lastTest = testResults[provider.id];

    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ProviderIcon icon={provider.icon} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">{provider.name}</Typography>
              <Typography variant="caption" color="text.secondary">{provider.description}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={saved.enabled !== false}
                  onChange={() => handleToggleEnable(provider.id)}
                  color="success"
                />
              }
              label={<Typography variant="caption" fontWeight="bold">{saved.enabled !== false ? "Enabled" : "Disabled"}</Typography>}
            />
            <StatusChip status={saved.status || "not_configured"} />
            {provider.required && <Chip label="Required" size="small" color="error" variant="outlined" />}
          </Stack>
        </Stack>

        {/* Env vars hint */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: "action.hover", borderRadius: 2 }}>
          <Typography variant="caption" fontWeight="bold" color="text.secondary">
            ENV VARIABLES: {provider.envVars.join("  •  ")}
          </Typography>
        </Paper>

        <Grid container spacing={2}>
          {provider.fields.map(field => (
            <Grid item xs={12} sm={compact ? 12 : 6} key={field.key}>
              {field.type === "password" ? (
                <SecretField
                  label={field.label}
                  value={cfg[field.key] || ""}
                  onChange={(v) => handleFieldChange(provider.id, field.key, v)}
                  placeholder={field.placeholder}
                />
              ) : field.type === "boolean" ? (
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={!!cfg[field.key]}
                      onChange={(e) => handleFieldChange(provider.id, field.key, e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">{field.label}</Typography>}
                />
              ) : field.type === "select" ? (
                <TextField
                  select fullWidth size="small" label={field.label}
                  value={cfg[field.key] || ""}
                  onChange={(e) => handleFieldChange(provider.id, field.key, e.target.value)}
                >
                  {(field.options || []).map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </TextField>
              ) : (
                <TextField
                  fullWidth size="small" label={field.label}
                  type={field.type}
                  value={cfg[field.key] || ""}
                  onChange={(e) => handleFieldChange(provider.id, field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </Grid>
          ))}
        </Grid>

        {/* Test result */}
        {lastTest && (
          <Alert
            severity={lastTest.status === "connected" ? "success" : "warning"}
            sx={{ mt: 2 }}
            icon={lastTest.status === "connected" ? <CheckCircleIcon /> : <WarningIcon />}
          >
            <strong>{lastTest.message}</strong>
            <Typography variant="caption" display="block" color="text.secondary">
              {lastTest.note} — Tested at: {lastTest.testedAt ? new Date(lastTest.testedAt).toLocaleString("en-IN") : "Never"}
            </Typography>
          </Alert>
        )}

        <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(provider.id)}
            disabled={!!saveLoading[provider.id]}
            size="small"
          >
            {saveLoading[provider.id] ? "Saving…" : "Save Configuration"}
          </Button>
          <Button
            variant="outlined"
            startIcon={testLoading[provider.id] ? null : <PlayArrowIcon />}
            onClick={() => handleTest(provider.id)}
            disabled={!!testLoading[provider.id]}
            size="small"
          >
            {testLoading[provider.id] ? "Testing…" : "Test Connection"}
          </Button>
        </Stack>

        {testLoading[provider.id] && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
      </Box>
    );
  };

  // ─── Computed stats ──────────────────────────────────────
  const configured = providers.filter(p => p.status === "configured").length;
  const partial     = providers.filter(p => p.status === "partial").length;
  const unconfigured = providers.filter(p => p.status === "not_configured").length;
  const validationScore = validation?.score || 0;

  // ─────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 3 }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <SettingsInputAntennaIcon color="primary" sx={{ fontSize: 42 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Enterprise API Configuration Center
            </Typography>
            <Typography color="text.secondary">
              Phase 13.0 — Production Infrastructure Preparation · No live connections required
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<SecurityIcon />}
            label="Secrets Encrypted"
            color="success"
            variant="outlined"
          />
          <Chip
            label={`${validationScore}% Ready`}
            color={validationScore >= 80 ? "success" : validationScore >= 50 ? "warning" : "error"}
          />
          <Button startIcon={<RefreshIcon />} onClick={refresh} variant="outlined" size="small">
            Refresh
          </Button>
        </Stack>
      </Stack>

      {alertMsg && <Alert severity={alertSev} sx={{ mb: 2 }}>{alertMsg}</Alert>}

      {/* ── Summary Cards ───────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Providers",  value: providers.length, color: "#1976d2" },
          { label: "Configured",       value: configured,        color: "#2e7d32" },
          { label: "Partial",          value: partial,           color: "#ed6c02" },
          { label: "Not Configured",   value: unconfigured,      color: "#9e9e9e" },
          { label: "Production Score", value: `${validationScore}%`, color: validationScore >= 80 ? "#2e7d32" : "#ed6c02" },
          { label: "Critical Errors",  value: validation?.errors?.length || 0, color: "#d32f2f" },
        ].map(c => (
          <Grid item xs={6} sm={4} md={2} key={c.label}>
            <Paper sx={{ p: 2, borderRadius: 3, borderLeft: `4px solid ${c.color}`, height: "100%" }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">{c.label}</Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ color: c.color }}>{c.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {[
            { label: "API Providers",      icon: <TuneIcon /> },
            { label: "Health Dashboard",   icon: <MonitorHeartIcon /> },
            { label: "Secret Manager",     icon: <LockIcon /> },
            { label: "Setup Wizard",       icon: <AssistantIcon /> },
            { label: "Production Validation", icon: <CheckCircleIcon /> },
            { label: "Env Guide",          icon: <ListAltIcon /> },
          ].map((t, i) => (
            <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} sx={{ minHeight: 52, fontSize: "12px" }} />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>

          {/* ── TAB 0: API PROVIDERS ──────────────────────────── */}
          <TabPanel value={tab} index={0}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              All API Providers — Configure & Test
            </Typography>
            <Stack spacing={2}>
              {providers.map(provider => (
                <Accordion key={provider.id} variant="outlined" sx={{ borderRadius: "12px !important", "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                      <ProviderIcon icon={provider.icon} />
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight="bold">{provider.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{provider.category}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
                        <StatusChip status={provider.status} />
                        {provider.required && <Chip label="Required" size="small" color="error" variant="outlined" />}
                        {provider.testedAt && <Chip label="Tested" size="small" color="info" variant="outlined" />}
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Divider sx={{ mb: 2 }} />
                    {renderProviderForm(provider)}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </TabPanel>

          {/* ── TAB 1: HEALTH DASHBOARD ───────────────────────── */}
          <TabPanel value={tab} index={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Infrastructure Health Dashboard
              </Typography>
              <Chip
                label={`${validationScore}% Production Ready`}
                color={validationScore >= 80 ? "success" : validationScore >= 50 ? "warning" : "error"}
                icon={validationScore >= 80 ? <CheckCircleIcon /> : <WarningIcon />}
              />
            </Stack>

            <LinearProgress
              variant="determinate"
              value={validationScore}
              sx={{ mb: 3, height: 10, borderRadius: 5 }}
              color={validationScore >= 80 ? "success" : validationScore >= 50 ? "warning" : "error"}
            />

            <Grid container spacing={2}>
              {health.map(h => (
                <Grid item xs={12} sm={6} md={4} key={h.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5, borderRadius: 2,
                      borderLeft: `4px solid ${
                        h.status === "configured" ? "#2e7d32" :
                        h.status === "partial"    ? "#ed6c02" : "#9e9e9e"
                      }`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ProviderIcon icon={PROVIDER_CATALOG.find(p=>p.id===h.id)?.icon || "Storage"} />
                        <Typography fontWeight="bold" variant="body2">{h.name}</Typography>
                      </Stack>
                      {h.status === "configured"
                        ? <WifiIcon color="success" />
                        : h.status === "partial"
                        ? <WarningIcon color="warning" />
                        : <WifiOffIcon color="disabled" />
                      }
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <StatusChip status={h.status} />
                      <Typography variant="caption" color="text.secondary">
                        {h.testedAt ? `Tested ${new Date(h.testedAt).toLocaleDateString("en-IN")}` : "Never tested"}
                      </Typography>
                    </Stack>
                    {h.required && (
                      <Chip label="Required" size="small" color="error" variant="outlined" sx={{ mt: 1 }} />
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* ── TAB 2: SECRET MANAGER ─────────────────────────── */}
          <TabPanel value={tab} index={2}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Secret Manager</Typography>
              <Chip icon={<LockIcon />} label="Secrets Masked" color="success" size="small" />
            </Stack>
            <Alert severity="info" sx={{ mb: 2 }}>
              All passwords and API keys are masked in this view. Raw values are stored in encrypted local storage
              and will be moved to environment variables before production deployment.
            </Alert>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Provider</TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Masked Value</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {PROVIDER_CATALOG.map(provider =>
                  provider.fields
                    .filter(f => f.secret)
                    .map(field => {
                      const maskedCfg = InfraService.getMaskedConfig(provider.id);
                      const val = maskedCfg[field.key];
                      return (
                        <TableRow key={`${provider.id}_${field.key}`} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <ProviderIcon icon={provider.icon} />
                              <Typography variant="body2" fontWeight="bold">{provider.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{field.label}</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "12px" }}>
                            {val && val.length > 0 ? val : <Typography color="text.disabled" variant="caption">Not set</Typography>}
                          </TableCell>
                          <TableCell><Chip label="SECRET" size="small" color="error" variant="outlined" sx={{ fontSize: "10px" }} /></TableCell>
                          <TableCell>
                            {val && val.length > 0
                              ? <Chip label="Set" size="small" color="success" />
                              : <Chip label="Missing" size="small" color="default" />
                            }
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TabPanel>

          {/* ── TAB 3: SETUP WIZARD ───────────────────────────── */}
          <TabPanel value={tab} index={3}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Enterprise Setup Wizard (8 Steps)</Typography>
              <Button size="small" variant="outlined" onClick={() => { InfraService.resetWizard(); refresh(); }}>
                Reset Wizard
              </Button>
            </Stack>
            <Stepper activeStep={wizardStep} orientation="vertical">
              {WIZARD_STEPS.map((step, index) => (
                <Step key={step.label} completed={wizardCompleted.includes(index)}>
                  <StepLabel icon={step.icon}>
                    <Typography fontWeight="bold">{`Step ${index + 1}: ${step.label}`}</Typography>
                    <Typography variant="caption" color="text.secondary">{step.desc}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      {step.providerId
                        ? renderProviderForm(
                            PROVIDER_CATALOG.find(p => p.id === step.providerId),
                            true
                          )
                        : (
                          <Box>
                            <Alert severity="success" sx={{ mb: 2 }}>
                              🎉 Setup wizard is complete! Review your configuration summary below.
                            </Alert>
                            <Grid container spacing={1.5}>
                              {health.map(h => (
                                <Grid item xs={12} sm={6} key={h.id}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center"
                                    sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                                    <Typography variant="body2" fontWeight="bold">{h.name}</Typography>
                                    <StatusChip status={h.status} />
                                  </Stack>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        )
                      }
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleWizardNext(index, step.providerId)}
                      >
                        {index === WIZARD_STEPS.length - 1 ? "Finish" : "Save & Continue"}
                      </Button>
                      {index > 0 && (
                        <Button size="small" onClick={() => setWizardStep(index - 1)}>Back</Button>
                      )}
                      {step.providerId && (
                        <Button size="small" color="inherit" onClick={() => handleWizardNext(index, null)}>
                          Skip
                        </Button>
                      )}
                    </Stack>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </TabPanel>

          {/* ── TAB 4: PRODUCTION VALIDATION ──────────────────── */}
          <TabPanel value={tab} index={4}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Production Readiness Validation</Typography>
              <Button size="small" onClick={refresh} startIcon={<RefreshIcon />} variant="outlined">Re-validate</Button>
            </Stack>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                  <Typography variant="h3" fontWeight="bold" color={validationScore >= 80 ? "success.main" : "warning.main"}>
                    {validationScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Production Score</Typography>
                  <LinearProgress
                    variant="determinate" value={validationScore}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    color={validationScore >= 80 ? "success" : "warning"}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={1.5}>
                  {[
                    { label: "Critical Errors", value: validation?.errors?.length || 0,   color: "error"   },
                    { label: "Warnings",         value: validation?.warnings?.length || 0, color: "warning" },
                    { label: "Configured",       value: validation?.configured || 0,       color: "success" },
                    { label: "Total Providers",  value: validation?.providers || 0,        color: "info"    },
                  ].map(c => (
                    <Grid item xs={6} key={c.label}>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, textAlign: "center" }}>
                        <Typography variant="h5" fontWeight="bold" color={`${c.color}.main`}>{c.value}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.label}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>

            {(validation?.errors || []).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="error" sx={{ mb: 1 }}>
                  Critical Errors (Must Fix Before Deployment)
                </Typography>
                {validation.errors.map((e, i) => (
                  <Alert key={i} severity="error" sx={{ mb: 1 }} icon={<ErrorIcon />}>
                    <strong>{e.provider}:</strong> {e.msg}
                  </Alert>
                ))}
              </Box>
            )}

            {(validation?.warnings || []).filter(w => w.type === "WARNING").length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="warning.main" sx={{ mb: 1 }}>
                  Warnings
                </Typography>
                {(validation?.warnings || []).filter(w => w.type === "WARNING").map((w, i) => (
                  <Alert key={i} severity="warning" sx={{ mb: 1 }} icon={<WarningIcon />}>
                    <strong>{w.provider}:</strong> {w.msg}
                  </Alert>
                ))}
              </Box>
            )}

            {(validation?.warnings || []).filter(w => w.type === "INFO").length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
                  Informational (Optional Services Not Configured)
                </Typography>
                {(validation?.warnings || []).filter(w => w.type === "INFO").map((w, i) => (
                  <Alert key={i} severity="info" sx={{ mb: 0.5 }} icon={<HelpOutlineIcon />}>
                    {w.msg}
                  </Alert>
                ))}
              </Box>
            )}

            {(validation?.errors || []).length === 0 && (validation?.warnings || []).filter(w=>w.type==="WARNING").length === 0 && (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                ✅ All required providers are configured. Platform is ready for production deployment.
              </Alert>
            )}
          </TabPanel>

          {/* ── TAB 5: ENV GUIDE ──────────────────────────────── */}
          <TabPanel value={tab} index={5}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Environment Variable Reference Guide
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Copy these variables into your <strong>.env</strong> file or configure them in your hosting provider's
              environment settings. Never commit secrets to Git.
            </Alert>
            {["Database","Email","SMS","WhatsApp","Payment","Google APIs","Storage","AI","Backup","Security","Application"].map(cat => {
              const vars = ENV_VARIABLE_CATALOG.filter(v => v.category === cat);
              if (!vars.length) return null;
              return (
                <Accordion key={cat} variant="outlined" sx={{ mb: 1, borderRadius: "8px !important", "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Typography fontWeight="bold">{cat}</Typography>
                      <Chip label={`${vars.length} vars`} size="small" />
                      {vars.some(v => v.required) && <Chip label="Has Required" size="small" color="error" variant="outlined" />}
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Variable Name</TableCell>
                          <TableCell>Required</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vars.map(v => (
                          <TableRow key={v.key} hover>
                            <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold", fontSize: "12px" }}>{v.key}</TableCell>
                            <TableCell>
                              <Chip label={v.required ? "Required" : "Optional"} size="small"
                                color={v.required ? "error" : "default"} variant="outlined" />
                            </TableCell>
                            <TableCell>{v.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </TabPanel>

        </Box>
      </Paper>
    </Box>
  );
}
