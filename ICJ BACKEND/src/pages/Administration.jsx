import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Stack,
  Button,
  Alert,
} from "@mui/material";
import useAuth from "../hooks/useAuth";
import MainLayout from "../layouts/MainLayout";
import AdminService from "../services/adminService";
import AuthService from "../services/authService";
import { getAssignableRoles, resolveRoleCode } from "../core/roles";

export default function Administration() {
  const { profile, user } = useAuth();
  const roleCode = resolveRoleCode(profile, user);
  const isSystemAdmin = roleCode === "system_admin";
  const [overview, setOverview] = useState({
    users: [],
    members: [],
    settings: {},
    auditLogs: [],
  });
  const [recoveryRequests, setRecoveryRequests] = useState([]);
  const [lockedAccounts, setLockedAccounts] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [recoveryStatusFilter, setRecoveryStatusFilter] = useState("ALL");
  const [recoveryAdminNotes, setRecoveryAdminNotes] = useState({});
  const [unlockAdminNotes, setUnlockAdminNotes] = useState({});
  const [sessionAdminNotes, setSessionAdminNotes] = useState({});
  const [deviceAdminNotes, setDeviceAdminNotes] = useState({});
  const [memberAdminNotes, setMemberAdminNotes] = useState({});
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const roleOptions = getAssignableRoles();

  const loadOverview = useCallback(async () => {
    const [data, requests, locked, sessions, devices] = await Promise.all([
      AdminService.getOverview(),
      AuthService.getRecoveryRequests({ status: recoveryStatusFilter }),
      AuthService.getLockedAccounts(),
      AuthService.getActiveSessionsForAdmin().catch(() => []),
      AuthService.getTrustedDevicesForAdmin({ includeRevoked: true }).catch(() => []),
    ]);
    setOverview(data || { users: [], members: [], settings: {}, auditLogs: [] });
    setRecoveryRequests(Array.isArray(requests) ? requests : []);
    setLockedAccounts(Array.isArray(locked) ? locked : []);
    setActiveSessions(Array.isArray(sessions) ? sessions : []);
    setTrustedDevices(Array.isArray(devices) ? devices : []);
  }, [recoveryStatusFilter]);

  useEffect(() => {
    Promise.resolve().then(() => loadOverview());
  }, [loadOverview]);

  const onRoleChange = async (member, role) => {
    const notes = String(memberAdminNotes[member.id || member.member_id] || "").trim();
    await AdminService.updateUserRole(member.id || member.member_id, role, notes);
    await loadOverview();
  };

  const onApproveMember = async (member) => {
    setAdminMessage("");
    setAdminError("");
    try {
      const notes = String(memberAdminNotes[member.id || member.member_id] || "").trim();
      await AdminService.approveMember(member.id || member.member_id, notes || "Approved from administration console");
      setAdminMessage(`Member ${member.name || member.email || member.member_id} approved.`);
      await loadOverview();
    } catch (error) {
      setAdminError(error?.message || "Unable to approve member.");
    }
  };

  const onRejectMember = async (member) => {
    setAdminMessage("");
    setAdminError("");
    try {
      const notes = String(memberAdminNotes[member.id || member.member_id] || "").trim();
      await AdminService.rejectMember(member.id || member.member_id, notes || "Rejected from administration console");
      setAdminMessage(`Member ${member.name || member.email || member.member_id} rejected.`);
      await loadOverview();
    } catch (error) {
      setAdminError(error?.message || "Unable to reject member.");
    }
  };

  const onSuspendMember = async (member) => {
    setAdminMessage("");
    setAdminError("");
    try {
      const notes = String(memberAdminNotes[member.id || member.member_id] || "").trim();
      await AdminService.suspendMember(member.id || member.member_id, notes || "Suspended from administration console");
      setAdminMessage(`Member ${member.name || member.email || member.member_id} suspended.`);
      await loadOverview();
    } catch (error) {
      setAdminError(error?.message || "Unable to suspend member.");
    }
  };

  const onRecoveryDecision = async (requestNo, decision) => {
    setAdminMessage("");
    setAdminError("");
    try {
      const notes = String(recoveryAdminNotes[requestNo] || "").trim();
      await AuthService.reviewRecoveryRequest(
        requestNo,
        decision,
        notes || `Reviewed in admin panel with decision ${decision}`
      );
      setAdminMessage(`Recovery request ${requestNo} marked as ${decision}.`);
      await loadOverview();
    } catch (error) {
      setAdminError(error?.message || "Unable to review recovery request.");
    }
  };

  const onUnlockAccount = async (lockItem) => {
    setAdminMessage("");
    setAdminError("");
    try {
      const notes = String(unlockAdminNotes[lockItem.identity_key] || "").trim();
      await AuthService.unlockLockedAccount(
        { email: lockItem.email || "", mobile: lockItem.mobile || "" },
        notes || "Unlocked from administration console"
      );
      setAdminMessage(`Unlocked account control for ${lockItem.email || lockItem.identity_key}.`);
      await loadOverview();
    } catch (error) {
      setAdminError(error?.message || "Unable to unlock account.");
    }
  };

  const onRevokeSession = async (sessionItem) => {
    setAdminMessage("");
    setAdminError("");
    try {
      const notes = String(sessionAdminNotes[sessionItem.session_reference] || "").trim();
      await AuthService.revokeSessionAsAdmin(
        sessionItem.session_reference,
        notes || "Revoked by administrator from session inventory"
      );
      setAdminMessage(`Session ${sessionItem.session_reference} revoked successfully.`);
      await loadOverview();
    } catch (error) {
      setAdminError(error?.message || "Unable to revoke session.");
    }
  };

  const onRevokeTrustedDevice = async (deviceItem) => {
    setAdminMessage("");
    setAdminError("");
    try {
      const notes = String(deviceAdminNotes[deviceItem.device_reference] || "").trim();
      const result = await AuthService.revokeTrustedDeviceAsAdmin(
        deviceItem.device_reference,
        notes || "Trusted device revoked from administration console"
      );
      setAdminMessage(
        `Trusted device ${deviceItem.device_reference} revoked. Affected active session(s): ${result?.affectedCount || 0}.`
      );
      await loadOverview();
    } catch (error) {
      setAdminError(error?.message || "Unable to revoke trusted device.");
    }
  };

  const stats = [
    { label: "Members", value: overview.members.length },
    { label: "Pending", value: overview.members.filter((member) => String(member.verification_status || member.status || "").toUpperCase() === "PENDING").length },
    { label: "Approved", value: overview.members.filter((member) => String(member.verification_status || member.status || "").toUpperCase() === "APPROVED").length },
    { label: "Audit Events", value: overview.auditLogs.length },
  ];

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Administration
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {stats.map((item) => (
            <Grid xs={12} md={3} key={item.label}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{item.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {adminMessage ? <Alert severity="success" sx={{ mb: 2 }}>{adminMessage}</Alert> : null}
        {adminError ? <Alert severity="error" sx={{ mb: 2 }}>{adminError}</Alert> : null}
        {!isSystemAdmin ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Approval and role changes are restricted to System Admin.
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid xs={12} md={7}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Member Approval & Role Management
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Member ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Current Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>New Role</TableCell>
                    <TableCell>Admin Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overview.members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">No members available.</TableCell>
                    </TableRow>
                  ) : (
                    overview.members.map((member) => (
                      <TableRow key={member.id || member.member_id || member.email}>
                        <TableCell>{member.member_id || member.id || "-"}</TableCell>
                        <TableCell>{member.name || member.full_name || "-"}</TableCell>
                        <TableCell>{member.email || "-"}</TableCell>
                        <TableCell>{member.role_code || member.role || "member"}</TableCell>
                        <TableCell>{member.verification_status || member.status || "Pending"}</TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={member.role_code || member.role || "member"}
                            onChange={(event) => onRoleChange(member, event.target.value)}
                            disabled={!isSystemAdmin}
                          >
                            {roleOptions.map((role) => (
                              <MenuItem key={role.code} value={role.code}>
                                {role.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={memberAdminNotes[member.id || member.member_id] || ""}
                            onChange={(event) =>
                              setMemberAdminNotes((prev) => ({
                                ...prev,
                                [member.id || member.member_id]: event.target.value,
                              }))
                            }
                            placeholder="Optional notes"
                            sx={{ minWidth: 220 }}
                            disabled={!isSystemAdmin}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ flexWrap: "wrap" }}>
                            <Button size="small" variant="outlined" disabled={!isSystemAdmin} onClick={() => onApproveMember(member)}>
                              Approve
                            </Button>
                            <Button size="small" color="error" variant="outlined" disabled={!isSystemAdmin} onClick={() => onRejectMember(member)}>
                              Reject
                            </Button>
                            <Button size="small" color="warning" variant="outlined" disabled={!isSystemAdmin} onClick={() => onSuspendMember(member)}>
                              Suspend
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid xs={12} md={5}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Audit Log
              </Typography>
              <Stack spacing={1}>
                {overview.auditLogs.length === 0 ? (
                  <Typography color="text.secondary">No audit events recorded.</Typography>
                ) : (
                  overview.auditLogs.slice(0, 15).map((log) => (
                    <Paper key={log.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Typography variant="body2">{log.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN") : "-"}
                      </Typography>
                    </Paper>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>

          <Grid xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Enterprise Session Inventory
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Session Ref</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Login Time</TableCell>
                    <TableCell>Last Activity</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>Browser</TableCell>
                    <TableCell>IP</TableCell>
                    <TableCell>Admin Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">No active sessions available.</TableCell>
                    </TableRow>
                  ) : (
                    activeSessions.map((item) => (
                      <TableRow key={item.session_reference || item.id}>
                        <TableCell>{item.session_reference || "-"}</TableCell>
                        <TableCell>{item.email || item.user_id || "-"}</TableCell>
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
                        <TableCell>
                          <TextField
                            size="small"
                            value={sessionAdminNotes[item.session_reference] || ""}
                            onChange={(event) =>
                              setSessionAdminNotes((prev) => ({
                                ...prev,
                                [item.session_reference]: event.target.value,
                              }))
                            }
                            placeholder="Revoke reason"
                            sx={{ minWidth: 220 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={String(item.status || "").toUpperCase() !== "ACTIVE"}
                            onClick={() => onRevokeSession(item)}
                          >
                            Revoke Session
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Trusted Device Registry Controls
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Device Ref</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>Trust</TableCell>
                    <TableCell>Risk</TableCell>
                    <TableCell>Last Activity</TableCell>
                    <TableCell>IP</TableCell>
                    <TableCell>Admin Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trustedDevices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">No trusted devices available.</TableCell>
                    </TableRow>
                  ) : (
                    trustedDevices.map((item) => (
                      <TableRow key={item.device_reference || item.id}>
                        <TableCell>{item.device_reference || "-"}</TableCell>
                        <TableCell>{item.email || item.user_id || "-"}</TableCell>
                        <TableCell>{item.device_name || item.device_type || "Unknown"}</TableCell>
                        <TableCell>{item.trust_status || "-"}</TableCell>
                        <TableCell>{item.risk_status || "LOW"}</TableCell>
                        <TableCell>
                          {item.last_activity_at ? new Date(item.last_activity_at).toLocaleString("en-IN") : "-"}
                        </TableCell>
                        <TableCell>{item.ip_address || "N/A"}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={deviceAdminNotes[item.device_reference] || ""}
                            onChange={(event) =>
                              setDeviceAdminNotes((prev) => ({
                                ...prev,
                                [item.device_reference]: event.target.value,
                              }))
                            }
                            placeholder="Revoke reason"
                            sx={{ minWidth: 220 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={String(item.trust_status || "").toUpperCase() === "REVOKED"}
                            onClick={() => onRevokeTrustedDevice(item)}
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
          </Grid>

          <Grid xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Account Recovery Controls
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                  select
                  label="Status Filter"
                  value={recoveryStatusFilter}
                  onChange={(event) => setRecoveryStatusFilter(event.target.value)}
                  sx={{ minWidth: 220 }}
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="REQUESTED">Requested</MenuItem>
                  <MenuItem value="IN_REVIEW">In Review</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </TextField>
              </Stack>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request No</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Channel</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Requested At</TableCell>
                    <TableCell>Admin Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recoveryRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">No recovery requests available.</TableCell>
                    </TableRow>
                  ) : (
                    recoveryRequests.map((request) => (
                      <TableRow key={request.request_no || request.id}>
                        <TableCell>{request.request_no || "-"}</TableCell>
                        <TableCell>{request.request_type || "-"}</TableCell>
                        <TableCell>{request.email || "-"}</TableCell>
                        <TableCell>{request.mobile || "-"}</TableCell>
                        <TableCell>{request.preferred_channel || "-"}</TableCell>
                        <TableCell>{request.status || "-"}</TableCell>
                        <TableCell>{request.otp_reference || "-"}</TableCell>
                        <TableCell>
                          {request.requested_at ? new Date(request.requested_at).toLocaleString("en-IN") : "-"}
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={recoveryAdminNotes[request.request_no] || request.admin_notes || ""}
                            onChange={(event) =>
                              setRecoveryAdminNotes((prev) => ({
                                ...prev,
                                [request.request_no]: event.target.value,
                              }))
                            }
                            placeholder="Add review notes"
                            sx={{ minWidth: 220 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => onRecoveryDecision(request.request_no, "IN_REVIEW")}
                              disabled={String(request.status || "").toUpperCase() === "IN_REVIEW"}
                            >
                              In Review
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => onRecoveryDecision(request.request_no, "APPROVED")}
                              disabled={String(request.status || "").toUpperCase() === "APPROVED"}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => onRecoveryDecision(request.request_no, "REJECTED")}
                              disabled={String(request.status || "").toUpperCase() === "REJECTED"}
                            >
                              Reject
                            </Button>
                            <Button
                              size="small"
                              color="success"
                              variant="outlined"
                              onClick={() => onRecoveryDecision(request.request_no, "COMPLETED")}
                              disabled={String(request.status || "").toUpperCase() === "COMPLETED"}
                            >
                              Complete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Anti-Abuse Lockout Controls
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Identity Key</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Failed Attempts</TableCell>
                    <TableCell>Lockout Until</TableCell>
                    <TableCell>Risk</TableCell>
                    <TableCell>Admin Notes</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lockedAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">No currently locked accounts.</TableCell>
                    </TableRow>
                  ) : (
                    lockedAccounts.map((lockItem) => (
                      <TableRow key={lockItem.identity_key}>
                        <TableCell>{lockItem.identity_key || "-"}</TableCell>
                        <TableCell>{lockItem.email || "-"}</TableCell>
                        <TableCell>{lockItem.mobile || "-"}</TableCell>
                        <TableCell>{lockItem.failed_login_attempt_count ?? 0}</TableCell>
                        <TableCell>
                          {lockItem.lockout_until
                            ? new Date(lockItem.lockout_until).toLocaleString("en-IN")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {`${lockItem.last_risk_level || "LOW"} (${lockItem.last_risk_score || 0})`}
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={unlockAdminNotes[lockItem.identity_key] || ""}
                            onChange={(event) =>
                              setUnlockAdminNotes((prev) => ({
                                ...prev,
                                [lockItem.identity_key]: event.target.value,
                              }))
                            }
                            placeholder="Unlock reason"
                            sx={{ minWidth: 220 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined" onClick={() => onUnlockAccount(lockItem)}>
                            Unlock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
}

