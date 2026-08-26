import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LockResetIcon from "@mui/icons-material/LockReset";
import GavelIcon from "@mui/icons-material/Gavel";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import AuthService from "../../services/authService.js";
import LegalGovernanceService from "../../services/legalGovernanceService.js";
import SeedEcosystemService from "../../services/seedEcosystemService.js";
import QuickPasswordResetWidget from "./QuickPasswordResetWidget.jsx";

export default function SystemSecurityCompliance() {
  const [users, setUsers] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    role: "admin",
  });

  const [resetForm, setResetForm] = useState({
    currentPassword: "admin",
    newPassword: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const list = AuthService.getSeedUsers();
      setUsers(list || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAdmin = async () => {
    if (!createForm.email || !createForm.password || !createForm.fullName) {
      setErrorMsg("Full Name, Email, and Password are required.");
      return;
    }
    setErrorMsg("");

    try {
      await AuthService.register(createForm);
      setStatusMsg(`🎉 Successfully created new ${createForm.role.toUpperCase()} account for ${createForm.fullName}`);
      setCreateOpen(false);
      loadUsers();
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to create admin.");
    }
  };

  const handleResetPassword = async () => {
    if (!resetForm.newPassword || resetForm.newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    setErrorMsg("");

    try {
      await AuthService.changePassword({
        userId: selectedUser?.id || selectedUser?.email,
        currentPassword: resetForm.currentPassword,
        newPassword: resetForm.newPassword,
      });
      setStatusMsg(`🎉 Password updated successfully for ${selectedUser?.fullName || selectedUser?.name || selectedUser?.email}`);
      setResetOpen(false);
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to reset password.");
    }
  };

  const consentLogs = LegalGovernanceService.getConsentLogs();

  return (
    <Box sx={{ p: 3, bgcolor: "#0f172a", minHeight: "100vh", color: "#ffffff" }}>
      {/* HEADER */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: "#1e293b", color: "#ffffff", borderRadius: 3, border: "1px solid #334155" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <SecurityIcon sx={{ color: "#38bdf8", fontSize: 36 }} />
            <Box>
              <Typography variant="h5" fontWeight={800} color="#ffffff">
                🛡️ System Security, Access Control & Compliance Center
              </Typography>
              <Typography variant="body2" color="#94a3b8">
                Create Admins | Role Assignment | Password Policy Engine v3.0 | IT Act Sec 79 & DPDP Act 2023 Consent Audit Logs
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => {
                if (window.confirm("Execute Master Reset & Re-hydrate 26 Core Master Members? (Temporary data will clear, 26 Core Members remain 100% intact)")) {
                  SeedEcosystemService.resetAndHydrate26CoreMembers();
                  setStatusMsg("⚡ Successfully Executed Master Reset & Re-hydrated 26 Core Ecosystem Members!");
                  loadUsers();
                  setTimeout(() => setStatusMsg(""), 4000);
                }
              }}
              sx={{ fontWeight: 800, py: 1.2, px: 2 }}
            >
              🔄 Reset & Auto-Hydrate 26 Core Members
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ fontWeight: 800, py: 1.2, px: 2.5 }}
            >
              ➕ Create New Admin / Role
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {statusMsg && <Alert severity="success" sx={{ mb: 3, bgcolor: "#064e3b", color: "#6ee7b7" }}>{statusMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 3, bgcolor: "#450a0a", color: "#fca5a5" }}>{errorMsg}</Alert>}

      {/* DEDICATED QUICK PASSWORD RESET MODULE (NO LIST NEEDED) */}
      <Box sx={{ mb: 3 }}>
        <QuickPasswordResetWidget onResetComplete={loadUsers} />
      </Box>

      <Grid container spacing={3}>
        {/* USER SECURITY & ROLE MANAGEMENT TABLE */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2.5, bgcolor: "#1e293b", borderRadius: 3, border: "1px solid #334155" }}>
            <Typography variant="h6" fontWeight={800} color="#fcd34d" mb={2}>
              👥 User Access Control & Role Management
            </Typography>

            <Table size="small">
              <TableHead sx={{ bgcolor: "#0f172a" }}>
                <TableRow>
                  <TableCell sx={{ color: "#38bdf8", fontWeight: 800 }}>User / Admin</TableCell>
                  <TableCell sx={{ color: "#38bdf8", fontWeight: 800 }}>Email</TableCell>
                  <TableCell sx={{ color: "#38bdf8", fontWeight: 800 }}>Assigned Role</TableCell>
                  <TableCell align="right" sx={{ color: "#38bdf8", fontWeight: 800 }}>Security Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u, idx) => (
                  <TableRow key={idx} hover sx={{ "&:hover": { bgcolor: "#334155" } }}>
                    <TableCell sx={{ color: "#ffffff", fontWeight: 700 }}>{u.fullName || u.name || u.email}</TableCell>
                    <TableCell sx={{ color: "#cbd5e1" }}>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={(u.role || "member").toUpperCase()}
                        size="small"
                        color={u.role === "admin" || u.role === "super_admin" ? "error" : "primary"}
                        sx={{ fontWeight: 800 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        startIcon={<LockResetIcon />}
                        onClick={() => {
                          setSelectedUser(u);
                          setResetOpen(true);
                        }}
                        sx={{ fontWeight: 800 }}
                      >
                        Reset Password
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* DPDP ACT 2023 & IT ACT COMPLIANCE AUDIT LOGS */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2.5, bgcolor: "#1e293b", borderRadius: 3, border: "1px solid #334155" }}>
            <Typography variant="h6" fontWeight={800} color="#6ee7b7" mb={2}>
              ⚖️ DPDP Act 2023 Digital Consent Audit Trail
            </Typography>

            <Stack spacing={1.5} sx={{ maxHeight: 420, overflowY: "auto" }}>
              {consentLogs.map((log) => (
                <Paper key={log.id} sx={{ p: 1.5, bgcolor: "#0f172a", border: "1px solid #334155", borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={800} color="#38bdf8">
                      {log.userName} ({log.role})
                    </Typography>
                    <Chip label="🟢 VERIFIED CONSENT" size="small" color="success" sx={{ fontSize: "0.65rem", fontWeight: 800 }} />
                  </Stack>
                  <Typography variant="caption" color="#cbd5e1" display="block">
                    Consent Type: <strong>{log.consentType}</strong>
                  </Typography>
                  <Typography variant="caption" color="#94a3b8" display="block">
                    Timestamp: {new Date(log.timestamp).toLocaleString()} | IP: {log.ipAddress}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* CREATE ADMIN MODAL */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth paperProps={{ sx: { bgcolor: "#0f172a", color: "#ffffff", borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: "#1e293b", color: "#ffffff", borderBottom: "1px solid #334155" }}>
          ➕ Create New Admin / Assign Role
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Full Name"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              sx={{ input: { color: "#ffffff" }, label: { color: "#fcd34d" }, "& .MuiOutlinedInput-root": { bgcolor: "#1e293b" } }}
            />
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              sx={{ input: { color: "#ffffff" }, label: { color: "#fcd34d" }, "& .MuiOutlinedInput-root": { bgcolor: "#1e293b" } }}
            />
            <TextField
              fullWidth
              size="small"
              type="password"
              label="Set Password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              sx={{ input: { color: "#ffffff" }, label: { color: "#fcd34d" }, "& .MuiOutlinedInput-root": { bgcolor: "#1e293b" } }}
            />
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: "#fcd34d" }}>Role</InputLabel>
              <Select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                sx={{ color: "#ffffff", bgcolor: "#1e293b" }}
              >
                <MenuItem value="admin">Super Admin / System Administrator</MenuItem>
                <MenuItem value="advocate">Empaneled Advocate</MenuItem>
                <MenuItem value="employee">Staff / Branch Director</MenuItem>
                <MenuItem value="member">General Member</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#1e293b", borderTop: "1px solid #334155" }}>
          <Button variant="outlined" color="inherit" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleCreateAdmin} sx={{ fontWeight: 800 }}>
            Create Admin / Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* RESET PASSWORD MODAL */}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth paperProps={{ sx: { bgcolor: "#0f172a", color: "#ffffff", borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: "#1e293b", color: "#ffffff", borderBottom: "1px solid #334155" }}>
          🔑 Reset Password — {selectedUser?.fullName || selectedUser?.email}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            type="password"
            label="New Password (Min 8 Characters)"
            value={resetForm.newPassword}
            onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
            sx={{ input: { color: "#ffffff" }, label: { color: "#fcd34d" }, "& .MuiOutlinedInput-root": { bgcolor: "#1e293b" } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#1e293b", borderTop: "1px solid #334155" }}>
          <Button variant="outlined" color="inherit" onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleResetPassword} sx={{ fontWeight: 800 }}>
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
