import { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Grid, Table, TableHead, TableBody,
  TableRow, TableCell, Button, Chip, Switch, Stack, Alert,
  TextField, MenuItem, Divider, Tabs, Tab, Tooltip,
  FormControlLabel, Badge,
} from "@mui/material";

import SecurityIcon        from "@mui/icons-material/Security";
import AutoAwesomeIcon     from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon     from "@mui/icons-material/CheckCircle";
import TuneIcon            from "@mui/icons-material/Tune";
import MenuIcon            from "@mui/icons-material/Menu";
import SmartButtonIcon     from "@mui/icons-material/SmartButton";
import TextFieldsIcon      from "@mui/icons-material/TextFields";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FlagIcon            from "@mui/icons-material/Flag";
import DashboardIcon       from "@mui/icons-material/Dashboard";
import LockIcon            from "@mui/icons-material/Lock";
import HistoryIcon         from "@mui/icons-material/History";
import RefreshIcon         from "@mui/icons-material/Refresh";
import RestoreIcon         from "@mui/icons-material/Restore";
import WarningAmberIcon    from "@mui/icons-material/WarningAmber";

import {
  ModuleControl,
  MenuControl,
  ButtonControl,
  FieldControl,
  RoleMatrix,
  FeatureFlagEngine,
  DashboardControl,
  SecurityControl,
  GovernanceAudit,
  autoRegisterComponent,
  DEFAULT_MENU_CONFIG,
} from "../services/governanceEngine";
import { GovernanceRegistry } from "../services/governanceRegistry";
import ActivityService from "../services/activityService";

// ─── Helpers ────────────────────────────────────────────────
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

function StatusChip({ val }) {
  return (
    <Chip
      size="small"
      label={val ? "Active" : "Disabled"}
      color={val ? "success" : "default"}
    />
  );
}

// ─────────────────────────────────────────────────────────────
export default function GovernanceCenter() {
  const [tab, setTab]               = useState(0);
  const [alertMsg, setAlertMsg]     = useState("");
  const [alertSev, setAlertSev]     = useState("success");

  // Phase A
  const [modules, setModules]       = useState({});
  // Phase B
  const [menus, setMenus]           = useState([]);
  // Phase C
  const [buttons, setButtons]       = useState([]);
  // Phase D
  const [fields, setFields]         = useState([]);
  // Phase E
  const [roleMatrix, setRoleMatrix] = useState({});
  // Phase F
  const [flags, setFlags]           = useState([]);
  // Phase G
  const [cards, setCards]           = useState([]);
  // Phase H
  const [security, setSecurity]     = useState({});
  // Phase I
  const [auditLog, setAuditLog]     = useState([]);
  // Phase J auto-register form
  const [newComp, setNewComp]       = useState({ name: "", route: "", category: "Core" });

  const refresh = () => {
    setModules(ModuleControl.getAll());
    setMenus(MenuControl.getAll());
    setButtons(ButtonControl.getAll());
    setFields(FieldControl.getAll());
    setRoleMatrix(RoleMatrix.getMatrix());
    setFlags(FeatureFlagEngine.getAll());
    setCards(DashboardControl.getAll());
    setSecurity(SecurityControl.get());
    setAuditLog(GovernanceAudit.getAll());
  };

  useEffect(() => { refresh(); }, []);

  const notify = (msg, sev = "success") => {
    setAlertMsg(msg); setAlertSev(sev);
    setTimeout(() => setAlertMsg(""), 3000);
    ActivityService.create({ title: `Governance: ${msg}`, type: "system" });
  };

  // ── Phase A actions ────────────────────────────────────────
  const toggleModule = (id, field) => {
    ModuleControl.toggle(id, field);
    setModules(ModuleControl.getAll());
    notify(`Module ${id} → ${field} toggled`);
  };

  // ── Phase B actions ────────────────────────────────────────
  const toggleMenu = (id, field) => {
    MenuControl.toggle(id, field);
    setMenus(MenuControl.getAll());
    notify(`Menu ${id} → ${field} toggled`);
  };

  // ── Phase C actions ────────────────────────────────────────
  const toggleButton = (id, field) => {
    ButtonControl.toggle(id, field);
    setButtons(ButtonControl.getAll());
    notify(`Button ${id} → ${field} toggled`);
  };

  // ── Phase D actions ────────────────────────────────────────
  const toggleField = (id, field) => {
    const fields_ = FieldControl.getAll();
    const idx = fields_.findIndex(f => f.id === id);
    if (idx === -1) return;
    const old = fields_[idx][field];
    FieldControl.update(id, { [field]: !old });
    setFields(FieldControl.getAll());
    notify(`Field ${id} → ${field} toggled`);
  };

  // ── Phase E actions ────────────────────────────────────────
  const toggleRole = (role, perm) => {
    RoleMatrix.toggle(role, perm);
    setRoleMatrix(RoleMatrix.getMatrix());
    notify(`Role Matrix: ${role} → ${perm} toggled`);
  };

  // ── Phase F actions ────────────────────────────────────────
  const toggleFlag = (id) => {
    FeatureFlagEngine.toggle(id);
    setFlags(FeatureFlagEngine.getAll());
    notify(`Feature Flag ${id} toggled`);
  };

  // ── Phase G actions ────────────────────────────────────────
  const toggleCard = (id, field) => {
    DashboardControl.toggle(id, field);
    setCards(DashboardControl.getAll());
    notify(`Dashboard card ${id} → ${field} toggled`);
  };

  // ── Phase H actions ────────────────────────────────────────
  const toggleSecurity = (field) => {
    SecurityControl.toggle(field);
    setSecurity(SecurityControl.get());
    notify(`Security: ${field} toggled`, "warning");
  };

  const updateTimeout = (val) => {
    SecurityControl.update({ sessionTimeoutMin: Number(val) });
    setSecurity(SecurityControl.get());
    notify(`Session timeout set to ${val} minutes`);
  };

  // ── Phase I rollback ───────────────────────────────────────
  const handleRollback = (auditId) => {
    GovernanceAudit.rollback(auditId);
    setAuditLog(GovernanceAudit.getAll());
    notify("Audit entry rolled back (marked). Reload page to fully apply.", "info");
  };

  // ── Phase J auto-register ──────────────────────────────────
  const handleAutoRegister = () => {
    if (!newComp.name.trim() || !newComp.route.trim()) {
      notify("Name and route are required.", "error"); return;
    }
    autoRegisterComponent({
      id: `mod_${newComp.name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
      name: newComp.name,
      route: newComp.route,
      category: newComp.category,
    });
    setNewComp({ name: "", route: "", category: "Core" });
    refresh();
    notify(`"${newComp.name}" auto-registered with full governance!`);
  };

  // ─── Counts for header badges ──────────────────────────────
  const modArr    = Object.values(modules);
  const activeFlags = flags.filter(f => f.enabled).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <SecurityIcon color="primary" sx={{ fontSize: 42 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Dynamic Enterprise Governance Engine
            </Typography>
            <Typography color="text.secondary">
              Phase 12.2 — Permanent No-Code Control Platform (Modules · Menus · Buttons · Fields · Roles · Flags · Dashboard · Security · Audit)
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Chip
          icon={<AutoAwesomeIcon />}
          label={`Auto-Discovery ACTIVE`}
          color="success"
          sx={{ fontWeight: "bold" }}
        />
          <Button startIcon={<RefreshIcon />} onClick={refresh} variant="outlined" size="small">Refresh</Button>
        </Stack>
      </Stack>

      {alertMsg && <Alert severity={alertSev} sx={{ mb: 2.5 }}>{alertMsg}</Alert>}

      {/* ── Summary Cards ───────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Registered Modules",  value: modArr.length,                 color: "#1976d2" },
          { label: "Active Feature Flags", value: `${activeFlags} / ${flags.length}`, color: "#2e7d32" },
          { label: "Role Permissions",     value: `${RoleMatrix.ROLES.length} × ${RoleMatrix.PERMISSIONS.length}`, color: "#9c27b0" },
          { label: "Audit Entries",        value: auditLog.length,               color: "#ed6c02" },
          { label: "Dashboard Cards",      value: cards.filter(c => c.visible).length, color: "#0288d1" },
          { label: "Menus Visible",        value: menus.filter(m => m.visible).length, color: "#388e3c" },
        ].map(c => (
          <Grid item xs={12} sm={6} md={2} key={c.label}>
            <Paper sx={{ p: 2, borderRadius: 3, borderLeft: `4px solid ${c.color}`, height: "100%" }}>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">{c.label}</Typography>
              <Typography variant="h5" fontWeight="bold">{c.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── Tab Navigator ───────────────────────────────────── */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
        >
          {[
            { label: "A · Modules",    icon: <TuneIcon /> },
            { label: "B · Menus",      icon: <MenuIcon /> },
            { label: "C · Buttons",    icon: <SmartButtonIcon /> },
            { label: "D · Fields",     icon: <TextFieldsIcon /> },
            { label: "E · Role Matrix",icon: <AdminPanelSettingsIcon /> },
            { label: "F · Flags",      icon: <FlagIcon /> },
            { label: "G · Dashboard",  icon: <DashboardIcon /> },
            { label: "H · Security",   icon: <LockIcon /> },
            { label: "I · Audit",      icon: <HistoryIcon /> },
            { label: "J · Auto-Reg",   icon: <AutoAwesomeIcon /> },
          ].map((t, i) => (
            <Tab key={i} iconPosition="start" icon={t.icon} label={t.label} sx={{ minHeight: 52, fontSize: "12px" }} />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>

          {/* ── PHASE A: MODULE CONTROL ─────────────────────── */}
          <TabPanel value={tab} index={0}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Module Control — Enable · Disable · Hide · Maintenance
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Module Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell align="center">Enabled</TableCell>
                  <TableCell align="center">Visible</TableCell>
                  <TableCell align="center">Locked</TableCell>
                  <TableCell align="center">Maintenance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modArr.map(m => (
                  <TableRow key={m.id} hover>
                    <TableCell><Typography fontWeight="bold" variant="body2">{m.name}</Typography></TableCell>
                    <TableCell><Chip label={m.category} size="small" variant="outlined" /></TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "11px" }}>{m.route}</TableCell>
                    <TableCell align="center"><Switch size="small" checked={!!m.enabled} onChange={() => toggleModule(m.id, "enabled")} /></TableCell>
                    <TableCell align="center"><Switch size="small" checked={!!m.visible} onChange={() => toggleModule(m.id, "visible")} /></TableCell>
                    <TableCell align="center"><Switch size="small" checked={!!m.locked} onChange={() => toggleModule(m.id, "locked")} /></TableCell>
                    <TableCell align="center">
                      <Switch size="small" checked={!!m.maintenance} onChange={() => toggleModule(m.id, "maintenance")}
                        sx={{ "& .MuiSwitch-thumb": { bgcolor: m.maintenance ? "#ff9800" : undefined } }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabPanel>

          {/* ── PHASE B: MENU CONTROL ───────────────────────── */}
          <TabPanel value={tab} index={1}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Menu Control — Sidebar / Top / Context / Quick Action
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Menu Label</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Role Scope</TableCell>
                  <TableCell align="center">Visible</TableCell>
                  <TableCell align="center">Enabled</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menus.map(m => (
                  <TableRow key={m.id} hover>
                    <TableCell><Typography fontWeight="bold" variant="body2">{m.label}</Typography></TableCell>
                    <TableCell><Chip label={m.location} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {m.roles.map(r => <Chip key={r} label={r} size="small" sx={{ fontSize: "10px" }} />)}
                      </Stack>
                    </TableCell>
                    <TableCell align="center"><Switch size="small" checked={!!m.visible} onChange={() => toggleMenu(m.id, "visible")} /></TableCell>
                    <TableCell align="center"><Switch size="small" checked={!!m.enabled} onChange={() => toggleMenu(m.id, "enabled")} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabPanel>

          {/* ── PHASE C: BUTTON CONTROL ─────────────────────── */}
          <TabPanel value={tab} index={2}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Button Control — Add · Edit · Delete · Save · Print · Export · AI · Payment…
            </Typography>
            <Grid container spacing={2}>
              {buttons.map(b => (
                <Grid item xs={12} sm={6} md={4} key={b.id}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography fontWeight="bold" variant="body2" sx={{ mb: 1 }}>{b.label}</Typography>
                    <Stack direction="row" spacing={2}>
                      <FormControlLabel
                        control={<Switch size="small" checked={!!b.visible} onChange={() => toggleButton(b.id, "visible")} />}
                        label={<Typography variant="caption">Visible</Typography>}
                      />
                      <FormControlLabel
                        control={<Switch size="small" checked={!!b.enabled} onChange={() => toggleButton(b.id, "enabled")} />}
                        label={<Typography variant="caption">Enabled</Typography>}
                      />
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* ── PHASE D: FIELD GOVERNANCE ───────────────────── */}
          <TabPanel value={tab} index={3}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Field Governance — Visible · Editable · Mandatory · Read-Only
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Field Name</TableCell>
                  <TableCell align="center">Visible</TableCell>
                  <TableCell align="center">Editable</TableCell>
                  <TableCell align="center">Mandatory</TableCell>
                  <TableCell align="center">Read-Only</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map(f => (
                  <TableRow key={f.id} hover>
                    <TableCell><Typography fontWeight="bold" variant="body2">{f.label}</Typography></TableCell>
                    <TableCell align="center"><Switch size="small" checked={!!f.visible}   onChange={() => toggleField(f.id, "visible")} /></TableCell>
                    <TableCell align="center"><Switch size="small" checked={!!f.editable}  onChange={() => toggleField(f.id, "editable")} /></TableCell>
                    <TableCell align="center"><Switch size="small" checked={!!f.mandatory} onChange={() => toggleField(f.id, "mandatory")} /></TableCell>
                    <TableCell align="center"><Switch size="small" checked={!!f.readOnly}  onChange={() => toggleField(f.id, "readOnly")} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabPanel>

          {/* ── PHASE E: ROLE MATRIX ────────────────────────── */}
          <TabPanel value={tab} index={4}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Enterprise Permission Matrix — 9 Roles × 12 Permissions
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", minWidth: 130 }}>Role</TableCell>
                    {RoleMatrix.PERMISSIONS.map(p => (
                      <TableCell key={p} align="center" sx={{ fontWeight: "bold", fontSize: "11px", textTransform: "capitalize" }}>
                        {p}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {RoleMatrix.ROLES.map(role => (
                    <TableRow key={role} hover>
                      <TableCell>
                        <Chip label={role.replace(/_/g, " ")} size="small"
                          color={role === "super_admin" || role === "admin" ? "primary" : "default"}
                          sx={{ fontWeight: "bold", textTransform: "capitalize" }} />
                      </TableCell>
                      {RoleMatrix.PERMISSIONS.map(perm => {
                        const allowed = roleMatrix[role]?.[perm];
                        return (
                          <TableCell key={perm} align="center">
                            <Switch
                              size="small"
                              checked={!!allowed}
                              onChange={() => toggleRole(role, perm)}
                              disabled={role === "super_admin"}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </TabPanel>

          {/* ── PHASE F: FEATURE FLAGS ──────────────────────── */}
          <TabPanel value={tab} index={5}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Enterprise Feature Flag Engine — Real-time Module Toggle
            </Typography>
            <Grid container spacing={2}>
              {["AI", "Finance", "Legal", "Communication", "Infrastructure", "Analytics", "Core"].map(cat => {
                const catFlags = flags.filter(f => f.category === cat);
                if (!catFlags.length) return null;
                return (
                  <Grid item xs={12} md={6} key={cat}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1.5 }}>{cat}</Typography>
                      {catFlags.map(f => (
                        <Stack key={f.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography variant="body2">{f.label}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <StatusChip val={f.enabled} />
                            <Switch size="small" checked={!!f.enabled} onChange={() => toggleFlag(f.id)} />
                          </Stack>
                        </Stack>
                      ))}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </TabPanel>

          {/* ── PHASE G: DASHBOARD CONTROL ──────────────────── */}
          <TabPanel value={tab} index={6}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Dashboard Card & Chart Control
            </Typography>
            <Grid container spacing={2}>
              {cards.map(c => (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, opacity: c.visible ? 1 : 0.45 }}>
                    <Typography fontWeight="bold" variant="body2" sx={{ mb: 1 }}>{c.label}</Typography>
                    <Stack direction="row" spacing={2}>
                      <FormControlLabel
                        control={<Switch size="small" checked={!!c.visible} onChange={() => toggleCard(c.id, "visible")} />}
                        label={<Typography variant="caption">Card Visible</Typography>}
                      />
                      <FormControlLabel
                        control={<Switch size="small" checked={!!c.showChart} onChange={() => toggleCard(c.id, "showChart")} />}
                        label={<Typography variant="caption">Show Chart</Typography>}
                      />
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* ── PHASE H: SYSTEM SECURITY ────────────────────── */}
          <TabPanel value={tab} index={7}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              System Security Controls
            </Typography>
            {security.maintenanceMode && (
              <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
                ⚠️ MAINTENANCE MODE is currently ACTIVE. Users will see a maintenance notice.
              </Alert>
            )}
            <Grid container spacing={3}>
              {/* Toggle controls */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Access Controls</Typography>
                  {[
                    { key: "maintenanceMode",   label: "Maintenance Mode (Platform-wide)" },
                    { key: "readOnlyMode",       label: "Read-Only Mode (No writes)" },
                    { key: "copyRestriction",    label: "Copy Restriction" },
                    { key: "printRestriction",   label: "Print Restriction" },
                    { key: "exportRestriction",  label: "Export Restriction" },
                    { key: "ipRestriction",      label: "IP Restriction (Allowlist)" },
                    { key: "deviceRestriction",  label: "Device Restriction" },
                  ].map(item => (
                    <Stack key={item.key} direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                      <Typography variant="body2">{item.label}</Typography>
                      <Switch
                        size="small"
                        checked={!!security[item.key]}
                        onChange={() => toggleSecurity(item.key)}
                        color={["maintenanceMode","readOnlyMode"].includes(item.key) ? "warning" : "primary"}
                      />
                    </Stack>
                  ))}
                </Paper>
              </Grid>

              {/* Session Timeout */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Session & Network</Typography>
                  <TextField
                    fullWidth
                    type="number"
                    label="Session Timeout (minutes)"
                    value={security.sessionTimeoutMin ?? 60}
                    onChange={(e) => updateTimeout(e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                    inputProps={{ min: 5, max: 480 }}
                  />
                  <TextField
                    fullWidth
                    label="Allowed IPs (comma-separated)"
                    value={security.allowedIPs ?? ""}
                    onChange={(e) => { SecurityControl.update({ allowedIPs: e.target.value }); setSecurity(SecurityControl.get()); }}
                    size="small"
                    placeholder="192.168.1.0/24, 10.0.0.1"
                    disabled={!security.ipRestriction}
                  />
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* ── PHASE I: AUDIT LOG ──────────────────────────── */}
          <TabPanel value={tab} index={8}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Governance Audit Trail ({auditLog.length} entries)
              </Typography>
              <Chip label="SHA-256 Secured" color="success" size="small" icon={<CheckCircleIcon />} />
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Old Value</TableCell>
                  <TableCell>New Value</TableCell>
                  <TableCell>Rollback</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLog.slice(0, 50).map(entry => (
                  <TableRow key={entry.id} hover sx={{ opacity: entry.rolledBack ? 0.5 : 1 }}>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "11px", whiteSpace: "nowrap" }}>
                      {new Date(entry.timestamp).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell><Chip label={entry.action} size="small" color="primary" variant="outlined" sx={{ fontSize: "10px" }} /></TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "11px" }}>{entry.target}</TableCell>
                    <TableCell>{entry.user}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "10px", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>{entry.oldValue}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "10px", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>{entry.newValue}</TableCell>
                    <TableCell>
                      {!entry.rolledBack ? (
                        <Button size="small" startIcon={<RestoreIcon />} onClick={() => handleRollback(entry.id)}>
                          Rollback
                        </Button>
                      ) : (
                        <Chip label="Rolled Back" size="small" color="warning" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {auditLog.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary" variant="body2">No governance changes recorded yet.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabPanel>

          {/* ── PHASE J: AUTO REGISTRATION ──────────────────── */}
          <TabPanel value={tab} index={9}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
              Auto Self-Registration — Zero Code Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Any new module, page, menu, button, field, widget, report, or dashboard card registered here
              automatically receives governance, role permissions, feature flags, audit logging, and search indexing.
            </Typography>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>Register New Component</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" label="Component / Module Name" value={newComp.name} onChange={(e) => setNewComp({ ...newComp, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" label="Route Path (e.g. /my-module)" value={newComp.route} onChange={(e) => setNewComp({ ...newComp, route: e.target.value })} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField select fullWidth size="small" label="Category" value={newComp.category} onChange={(e) => setNewComp({ ...newComp, category: e.target.value })}>
                    {["Core","Legal","Finance","Membership","Vault","AI","Analytics","Custom"].map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button fullWidth variant="contained" startIcon={<AutoAwesomeIcon />} onClick={handleAutoRegister} sx={{ fontWeight: "bold" }}>
                    Auto Register
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Currently registered modules list */}
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
              Currently Registered Modules ({Object.values(modules).length})
            </Typography>
            <Grid container spacing={1.5}>
              {Object.values(modules).map(m => (
                <Grid item xs={12} sm={6} md={4} key={m.id}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">{m.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.route}</Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Chip label={m.category} size="small" variant="outlined" />
                      <Chip label={m.enabled ? "Active" : "Off"} size="small" color={m.enabled ? "success" : "default"} />
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

        </Box>
      </Paper>
    </Box>
  );
}
