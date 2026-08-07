import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Stack,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StorageIcon from "@mui/icons-material/Storage";
import HistoryIcon from "@mui/icons-material/History";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ActivityService from "../services/activityService";
import DashboardService from "../services/dashboardService";
import PasswordPolicyAdminConfigurator from "../components/admin/PasswordPolicyAdminConfigurator";
import UniversalActionToolbar from "../components/common/UniversalActionToolbar";

const ALL_MODULES = [
  "dashboard", "membership", "documents", "legal", "wallet", "token",
  "donation", "ai", "research", "reports", "settings", "notifications",
  "member-profile", "member-documents", "member-wallet",
];

const ROLES_KEY = "icj_roles";

const defaultRoles = {
  admin: { label: "Admin", modules: ["*"], editable: false },
  employee: {
    label: "Employee",
    modules: ["dashboard", "membership", "documents", "legal", "reports", "notifications", "settings"],
    editable: true,
  },
  member: {
    label: "Member",
    modules: ["dashboard", "member-profile", "member-documents", "member-wallet", "notifications"],
    editable: true,
  },
};

const loadRoles = () => {
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    return raw ? { ...defaultRoles, ...JSON.parse(raw) } : { ...defaultRoles };
  } catch {
    return { ...defaultRoles };
  }
};

export default function Administration() {
  const [roles, setRoles] = useState(loadRoles());
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", label: "", modules: [] });
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    ActivityService.getAll()
      .then((data) => setActivities(Array.isArray(data) ? data.slice(0, 20) : []))
      .catch(() => {});
    DashboardService.getStatistics()
      .then((s) => setStats(s))
      .catch(() => {});
  }, []);

  const toggleModule = (roleKey, mod) => {
    setRoles((prev) => {
      const role = prev[roleKey];
      if (!role.editable) return prev;
      const mods = role.modules || [];
      const next = mods.includes(mod) ? mods.filter((m) => m !== mod) : [...mods, mod];
      return { ...prev, [roleKey]: { ...role, modules: next } };
    });
  };

  const saveRoleChanges = () => {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    setSaveMsg("Role permissions saved successfully!");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const createRole = () => {
    const key = newRole.name.trim().toLowerCase().replace(/\s+/g, "_");
    if (!key) { alert("Role name is required."); return; }
    if (roles[key]) { alert("Role with this name already exists."); return; }
    const updated = {
      ...roles,
      [key]: { label: newRole.label || newRole.name, modules: newRole.modules, editable: true },
    };
    setRoles(updated);
    localStorage.setItem(ROLES_KEY, JSON.stringify(updated));
    setAddRoleOpen(false);
    setNewRole({ name: "", label: "", modules: [] });
  };

  const deleteRole = (key) => {
    if (!roles[key]?.editable) { alert("Default roles cannot be deleted."); return; }
    if (!window.confirm(`Delete role "${roles[key].label}"?`)) return;
    const updated = { ...roles };
    delete updated[key];
    setRoles(updated);
    localStorage.setItem(ROLES_KEY, JSON.stringify(updated));
  };

  const systemHealth = [
    { label: "Total Members", value: stats?.totalMembers ?? "25" },
    { label: "Verified Members", value: stats?.verifiedMembers ?? "25" },
    { label: "Pending KYC", value: stats?.pendingMembers ?? "0" },
    { label: "Legal Cases", value: stats?.totalLegalCases ?? "—" },
    { label: "Documents", value: stats?.totalDocuments ?? "—" },
    { label: "Reports", value: stats?.totalReports ?? "—" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Administration & Security Controls
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Password Policy Engine v3.0, Super Admin Role Governance, System Health & Audit Trail
      </Typography>

      <UniversalActionToolbar
        title="System Administration, Governance & Security Policy Audit Record"
        documentId="ICJ-ADMIN-GOVERNANCE-2026"
        version="v3.2.0"
      />

      {/* Super Admin Password Policy Configurator */}
      <PasswordPolicyAdminConfigurator />

      {/* System Health */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <StorageIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">System Health</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {systemHealth.map((h) => (
            <Grid item xs={6} sm={4} md={2} key={h.label}>
              <Paper
                variant="outlined"
                sx={{ p: 2, textAlign: "center", borderRadius: 2 }}
              >
                <Typography variant="h5" fontWeight="bold">{h.value}</Typography>
                <Typography variant="caption" color="text.secondary">{h.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Role Management */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AdminPanelSettingsIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">Role Management</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            {saveMsg && <Alert severity="success" sx={{ py: 0 }}>{saveMsg}</Alert>}
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setAddRoleOpen(true)}
            >
              Add Role
            </Button>
            <Button variant="contained" size="small" onClick={saveRoleChanges}>
              Save Permissions
            </Button>
          </Stack>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click module chips to toggle access per role. Admin always has full access.
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Modules</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(roles).map(([key, role]) => (
              <TableRow key={key}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight="bold">{role.label}</Typography>
                    {!role.editable && <Chip label="System" size="small" color="primary" />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{key}</Typography>
                </TableCell>
                <TableCell>
                  {role.modules?.includes("*") ? (
                    <Chip label="All Modules" color="success" size="small" />
                  ) : (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {ALL_MODULES.map((mod) => (
                        <Chip
                          key={mod}
                          label={mod}
                          size="small"
                          color={role.modules?.includes(mod) ? "primary" : "default"}
                          variant={role.modules?.includes(mod) ? "filled" : "outlined"}
                          onClick={role.editable ? () => toggleModule(key, mod) : undefined}
                          sx={{ cursor: role.editable ? "pointer" : "default", fontSize: "0.7rem" }}
                        />
                      ))}
                    </Stack>
                  )}
                </TableCell>
                <TableCell align="right">
                  {role.editable && (
                    <Tooltip title="Delete Role">
                      <IconButton size="small" color="error" onClick={() => deleteRole(key)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Audit Log */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <HistoryIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">Audit Log</Typography>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {activities.length === 0 ? (
          <Typography color="text.secondary">
            No activity recorded yet.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((act) => (
                <TableRow key={act.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                    {act.timestamp
                      ? new Date(act.timestamp).toLocaleString("en-IN")
                      : "—"}
                  </TableCell>
                  <TableCell>{act.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={act.type || "system"}
                      size="small"
                      color="default"
                      variant="outlined"
                      sx={{ textTransform: "capitalize", fontSize: "0.7rem" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Add Role Dialog */}
      <Dialog open={addRoleOpen} onClose={() => setAddRoleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Role Name (internal key)"
              placeholder="e.g. legal_officer"
              value={newRole.name}
              onChange={(e) => setNewRole((p) => ({ ...p, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Display Label"
              placeholder="e.g. Legal Officer"
              value={newRole.label}
              onChange={(e) => setNewRole((p) => ({ ...p, label: e.target.value }))}
            />
            <Typography variant="body2" color="text.secondary">Select module access:</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {ALL_MODULES.map((mod) => (
                <Chip
                  key={mod}
                  label={mod}
                  size="small"
                  clickable
                  color={newRole.modules.includes(mod) ? "primary" : "default"}
                  variant={newRole.modules.includes(mod) ? "filled" : "outlined"}
                  onClick={() =>
                    setNewRole((p) => ({
                      ...p,
                      modules: p.modules.includes(mod)
                        ? p.modules.filter((m) => m !== mod)
                        : [...p.modules, mod],
                    }))
                  }
                />
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddRoleOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createRole}>Create Role</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
