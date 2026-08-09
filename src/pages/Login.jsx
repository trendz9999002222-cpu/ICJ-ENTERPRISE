import { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

import useAuth from "../hooks/useAuth.js";
import ForcePasswordChangeModal from "../components/ForcePasswordChangeModal.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const initialEmail = location.state?.email || "";
  const initialMemberId = location.state?.memberId || "";

  const [form, setForm] = useState({
    email: initialEmail,
    password: "",
    role: location.state?.role || "member",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingForceChangeUser, setPendingForceChangeUser] = useState(null);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getRoleDestination = (userObj) => {
    const r = String(userObj?.role || form.role || "member").toLowerCase();
    switch (r) {
      case "admin":
      case "super_admin":
        return "/super-admin-dashboard";
      case "advocate":
        return "/advocate-dashboard";
      case "client":
      case "member":
        return "/client-portal";
      case "employee":
        return "/member-directory";
      default:
        return "/client-portal";
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter both Username/Email and Password.");
      return;
    }

    setSubmitting(true);

    try {
      const userObj = await login(form);
      if (userObj.forcePasswordChange) {
        setPendingForceChangeUser(userObj);
      } else {
        const dest = getRoleDestination(userObj);
        navigate(dest);
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, background: "linear-gradient(135deg,#0B5ED7 0%,#052c65 100%)" }}>
      <Paper sx={{ width: "100%", maxWidth: 480, p: 4, borderRadius: 3, boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }} component="form" onSubmit={onSubmit}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <LockOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold">
            Sign In
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          International Consortium of Jurists (ICJ Enterprise Platform)
        </Typography>

        {initialMemberId && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration Successful! Member ID: <strong>{initialMemberId}</strong>. Sign in below to access your Portal.
          </Alert>
        )}

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <TextField fullWidth label="Username or Email Address" name="email" value={form.email} onChange={onChange} required sx={{ mb: 2 }} />
        <TextField fullWidth label="Password" name="password" type="password" value={form.password} onChange={onChange} required sx={{ mb: 2 }} />
        <TextField fullWidth select label="Role / Portal" name="role" value={form.role} onChange={onChange} sx={{ mb: 3 }}>
          <MenuItem value="member">Individual Member / Client</MenuItem>
          <MenuItem value="advocate">Empaneled Professional / Counsel</MenuItem>
          <MenuItem value="admin">Administrator / Super Admin</MenuItem>
          <MenuItem value="employee">Trust Staff / Employee</MenuItem>
        </TextField>

        <Button fullWidth variant="contained" type="submit" size="large" disabled={submitting} sx={{ py: 1.5, fontWeight: "bold" }}>
          {submitting ? "Signing In..." : "Sign In to Enterprise Workspace"}
        </Button>

        <Divider sx={{ my: 3 }} />

        {/* User Journey Links */}
        <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" sx={{ mb: 1.5, textTransform: "uppercase" }}>
          Onboarding & Account Services
        </Typography>

        <Stack spacing={1}>
          <Button
            component={RouterLink}
            to="/join"
            variant="outlined"
            color="primary"
            startIcon={<PersonAddIcon />}
            fullWidth
            sx={{ justifyContent: "flex-start" }}
          >
            Create New Account / Registration
          </Button>

          <Stack direction="row" spacing={1}>
            <Button
              component={RouterLink}
              to="/recovery"
              variant="text"
              color="inherit"
              startIcon={<VpnKeyIcon />}
              size="small"
              sx={{ textTransform: "none" }}
            >
              Account Recovery
            </Button>
            <Button
              component={RouterLink}
              to="/member-verification"
              variant="text"
              color="inherit"
              startIcon={<VerifiedUserIcon />}
              size="small"
              sx={{ textTransform: "none" }}
            >
              Verification Status
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* First Login Force Password Change Modal */}
      {pendingForceChangeUser && (
        <ForcePasswordChangeModal
          open={Boolean(pendingForceChangeUser)}
          user={pendingForceChangeUser}
          onSuccess={() => {
            const dest = getRoleDestination(pendingForceChangeUser);
            setPendingForceChangeUser(null);
            navigate(dest);
          }}
        />
      )}
    </Box>
  );
}
