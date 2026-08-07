/**
 * ICJ Enterprise Platform
 * Profile Page
 * Version : 1.0.0
 */

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  TextField,
  Button,
  Chip,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import MainLayout from "../layouts/MainLayout";

export default function Profile() {
  const {
    profile,
    updateProfile,
    loading,
    getMySessions,
    revokeOwnSession,
    revokeOtherSessions,
    getMyTrustedDevices,
    revokeOwnTrustedDevice,
  } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    mobile: profile?.mobile || "",
    state: profile?.state || "",
    district: profile?.district || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [deviceBusy, setDeviceBusy] = useState(false);

  const loadMySessions = useCallback(async () => {
    try {
      const data = await getMySessions({ activeOnly: false });
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    }
  }, [getMySessions]);

  const loadMyTrustedDevices = useCallback(async () => {
    try {
      const data = await getMyTrustedDevices({ includeRevoked: true });
      setTrustedDevices(Array.isArray(data) ? data : []);
    } catch {
      setTrustedDevices([]);
    }
  }, [getMyTrustedDevices]);

  useEffect(() => {
    Promise.resolve().then(async () => {
      await Promise.all([loadMySessions(), loadMyTrustedDevices()]);
    });
  }, [loadMySessions, loadMyTrustedDevices]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      await updateProfile({ full_name: formData.full_name, mobile: formData.mobile, state: formData.state, district: formData.district });
      setSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      setError(err?.message || "Failed to update profile.");
    }
  };

  const handleLogoutSession = async (sessionReference) => {
    setError("");
    setSuccess("");
    setSessionBusy(true);
    try {
      await revokeOwnSession(sessionReference, "User logout from profile session inventory");
      setSuccess("Session revoked successfully.");
      await loadMySessions();
    } catch (err) {
      setError(err?.message || "Unable to revoke session.");
    } finally {
      setSessionBusy(false);
    }
  };

  const handleLogoutOtherDevices = async () => {
    setError("");
    setSuccess("");
    setSessionBusy(true);
    try {
      const result = await revokeOtherSessions("User logout all other devices from profile");
      setSuccess(`Logged out ${result?.affectedCount || 0} other active session(s).`);
      await loadMySessions();
    } catch (err) {
      setError(err?.message || "Unable to logout other devices.");
    } finally {
      setSessionBusy(false);
    }
  };

  const handleRevokeTrustedDevice = async (deviceReference) => {
    setError("");
    setSuccess("");
    setDeviceBusy(true);
    try {
      const result = await revokeOwnTrustedDevice(
        deviceReference,
        "Trusted device revoked by user from profile"
      );
      setSuccess(
        `Device revoked successfully. Affected active session(s): ${result?.affectedCount || 0}.`
      );
      await Promise.all([loadMySessions(), loadMyTrustedDevices()]);
    } catch (err) {
      setError(err?.message || "Unable to revoke trusted device.");
    } finally {
      setDeviceBusy(false);
    }
  };

  if (!profile) {
    return (
      <MainLayout>
        <Box sx={{ p: 3 }}><Typography>Loading profile...</Typography></Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>My Profile</Typography>
        <Typography color="text.secondary" mb={4}>View and manage your account information</Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
            <Avatar sx={{ width: 80, height: 80, fontSize: 32, bgcolor: "#0B5ED7" }}>
              {profile.full_name?.charAt(0) || profile.email?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">{profile.full_name || "User"}</Typography>
              <Typography color="text.secondary">{profile.email}</Typography>
            </Box>
          </Box>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <TextField label="Member ID" value={profile.member_id || "N/A"} fullWidth slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label="Referral Code" value={profile.referral_code || "N/A"} fullWidth slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} fullWidth disabled={!editMode} />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label="Email Address" value={profile.email || "N/A"} fullWidth slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} fullWidth disabled={!editMode} />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label="Member Type" value={profile.member_type || "Individual"} fullWidth slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label="State" name="state" value={formData.state} onChange={handleChange} fullWidth disabled={!editMode} />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label="District" name="district" value={formData.district} onChange={handleChange} fullWidth disabled={!editMode} />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label="Member Level" value={profile.member_level || "BASIC"} fullWidth slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField label="Verification Status" value={profile.verification_status || "Pending"} fullWidth slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid xs={12}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Chip label={profile.is_email_verified ? "Email Verified" : "Email Not Verified"} color={profile.is_email_verified ? "success" : "default"} />
                <Chip label={profile.is_mobile_verified ? "Mobile Verified" : "Mobile Not Verified"} color={profile.is_mobile_verified ? "success" : "default"} />
              </Box>
            </Grid>
            <Grid xs={12}>
              {editMode ? (
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="contained" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
                  <Button variant="outlined" onClick={() => { setEditMode(false); setFormData({ full_name: profile?.full_name || "", mobile: profile?.mobile || "", state: profile?.state || "", district: profile?.district || "" }); }}>Cancel</Button>
                </Box>
              ) : (
                <Button variant="contained" onClick={() => setEditMode(true)}>Edit Profile</Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Active Session Inventory
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Review your active sessions and revoke any device session.
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={loadMySessions} disabled={sessionBusy}>
              Refresh Sessions
            </Button>
            <Button variant="contained" color="warning" onClick={handleLogoutOtherDevices} disabled={sessionBusy}>
              Logout All Other Devices
            </Button>
          </Stack>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Session Ref</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Login Time</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Browser</TableCell>
                <TableCell>IP</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No sessions found.</TableCell>
                </TableRow>
              ) : (
                sessions.map((item) => (
                  <TableRow key={item.session_reference || item.id}>
                    <TableCell>{item.session_reference || "-"}</TableCell>
                    <TableCell>{item.status || "-"}</TableCell>
                    <TableCell>
                      {item.login_at ? new Date(item.login_at).toLocaleString("en-IN") : "-"}
                    </TableCell>
                    <TableCell>
                      {item.last_activity_at ? new Date(item.last_activity_at).toLocaleString("en-IN") : "-"}
                    </TableCell>
                    <TableCell>{item.device_type || "-"}</TableCell>
                    <TableCell>{item.browser_name || "-"}</TableCell>
                    <TableCell>{item.ip_address || "N/A"}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleLogoutSession(item.session_reference)}
                        disabled={sessionBusy || !item.session_reference || String(item.status).toUpperCase() !== "ACTIVE"}
                      >
                        Logout Session
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Trusted Device Registry
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Review registered devices and revoke trust for suspicious or old devices.
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={loadMyTrustedDevices} disabled={deviceBusy}>
              Refresh Devices
            </Button>
          </Stack>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Device Ref</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Trust</TableCell>
                <TableCell>Risk</TableCell>
                <TableCell>Last Activity</TableCell>
                <TableCell>Browser</TableCell>
                <TableCell>IP</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trustedDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No trusted devices found.</TableCell>
                </TableRow>
              ) : (
                trustedDevices.map((item) => (
                  <TableRow key={item.device_reference || item.id}>
                    <TableCell>{item.device_reference || "-"}</TableCell>
                    <TableCell>{item.device_name || item.device_type || "Unknown"}</TableCell>
                    <TableCell>{item.trust_status || "-"}</TableCell>
                    <TableCell>{item.risk_status || "LOW"}</TableCell>
                    <TableCell>
                      {item.last_activity_at ? new Date(item.last_activity_at).toLocaleString("en-IN") : "-"}
                    </TableCell>
                    <TableCell>{item.browser_name || "-"}</TableCell>
                    <TableCell>{item.ip_address || "N/A"}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        disabled={deviceBusy || String(item.trust_status || "").toUpperCase() === "REVOKED"}
                        onClick={() => handleRevokeTrustedDevice(item.device_reference)}
                      >
                        Revoke Device
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </MainLayout>
  );
}


