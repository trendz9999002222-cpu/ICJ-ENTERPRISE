import { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
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
import OTPService from "../services/otp/otpService.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const initialEmail    = location.state?.email    || "";
  const initialMemberId = location.state?.memberId || "";

  const [form, setForm] = useState({
    email:    initialEmail,
    password: "",
  });
  const [error,                  setError]                  = useState("");
  const [submitting,             setSubmitting]             = useState(false);
  const [pendingForceChangeUser, setPendingForceChangeUser] = useState(null);

  // MFA Challenge State
  const [mfaPendingUser,         setMfaPendingUser]         = useState(null);
  const [mfaOtpInput,            setMfaOtpInput]            = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Smart Redirect — database की actual role + user_type के हिसाब से।
   * user_type को role से पहले check किया जाता है क्योंकि
   * advocates का role="member" होता है लेकिन user_type="advocate"।
   */
  const getRoleDestination = (userObj) => {
    const role     = String(userObj?.role     || "member").toLowerCase();
    const userType = String(userObj?.user_type || "").toLowerCase();

    // 1. Admin / Super Admin — सबसे पहले
    if (role === "admin" || role === "super_admin") {
      return "/super-admin-dashboard";
    }

    // 2. Employee / Staff
    if (role === "employee" || userType === "staff") {
      return "/member-directory";
    }

    // 3. Advocate — user_type से check (role "member" हो सकता है)
    if (userType === "advocate") {
      return "/advocate-dashboard";
    }

    // 4. Client / Litigant
    if (role === "client" || userType === "client") {
      return "/client-portal";
    }

    // 5. बाकी सब Member → Personal Dashboard
    return "/";
  };

  const getMfaConfig = () => {
    try {
      const raw = localStorage.getItem("icj_otp_governance_config");
      return raw ? JSON.parse(raw) : { mfaEnabled: false, mfaRoles: {} };
    } catch {
      return { mfaEnabled: false, mfaRoles: {} };
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
        setSubmitting(false);
        return;
      }

      // Check if MFA is governed & required for this user's role
      const mfaConfig = getMfaConfig();
      const userRole = String(userObj.role || "member").toLowerCase();

      // Super Admin check: Never force MFA automatically on super_admin
      const isSuperAdmin = userRole === "super_admin" || (userRole === "admin" && String(userObj.email).includes("superadmin"));

      if (mfaConfig.mfaEnabled && mfaConfig.mfaRoles?.[userRole] && !isSuperAdmin) {
        // Trigger MFA flow
        const requestRes = await OTPService.requestOTP(userObj.email, "email");
        if (requestRes.success) {
          setMfaPendingUser(userObj);
        } else {
          setError(requestRes.message || "MFA Code delivery failed.");
        }
      } else {
        navigate(getRoleDestination(userObj));
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyMFA = async (event) => {
    event.preventDefault();
    setError("");

    if (!mfaOtpInput) {
      setError("Please enter the verification code.");
      return;
    }

    setSubmitting(true);
    try {
      const verifyRes = await OTPService.verifyOTP(mfaPendingUser.email, mfaOtpInput);
      if (verifyRes.success) {
        const dest = getRoleDestination(mfaPendingUser);
        setMfaPendingUser(null);
        navigate(dest);
      } else {
        setError(verifyRes.message || "Invalid OTP code.");
      }
    } catch (err) {
      setError(err.message || "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, background: "linear-gradient(135deg,#0B5ED7 0%,#052c65 100%)" }}>
      <Paper
        sx={{ width: "100%", maxWidth: 480, p: 4, borderRadius: 3, boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}
        component="form"
        onSubmit={mfaPendingUser ? onVerifyMFA : onSubmit}
      >
        {/* Header */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <LockOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold">
            {mfaPendingUser ? "Security Verification" : "Sign In"}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          International Consortium of Jurists (ICJ Enterprise Platform)
        </Typography>

        {/* Post-registration success message */}
        {initialMemberId && !mfaPendingUser && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration Successful! Member ID: <strong>{initialMemberId}</strong>. Sign in below to access your Portal.
          </Alert>
        )}

        {/* Error */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {mfaPendingUser ? (
          // MFA OTP Verification Mode
          <Stack spacing={2.5}>
            <Alert severity="info">
              A 6-digit security code was dispatched to <strong>{mfaPendingUser.email}</strong>. Please verify your identity.
            </Alert>
            <TextField
              fullWidth
              label="Verification Code (OTP)"
              value={mfaOtpInput}
              onChange={(e) => setMfaOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              placeholder="123456"
              inputProps={{ maxLength: 6, style: { fontSize: "1.3rem", letterSpacing: "8px", textAlign: "center", fontWeight: "bold" } }}
              helperText="Generic generic generic: OTP request processed."
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              disabled={submitting}
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              {submitting ? "Verifying..." : "Verify & Sign In"}
            </Button>
            <Button
              fullWidth
              variant="text"
              color="inherit"
              onClick={() => {
                setMfaPendingUser(null);
                setMfaOtpInput("");
                setError("");
              }}
            >
              Back to Sign In
            </Button>
          </Stack>
        ) : (
          // Standard Sign In Fields
          <>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
              placeholder="yourname@gmail.com"
              sx={{ mb: 2 }}
              helperText="वही Email डालें जो Registration के समय दी थी"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              size="large"
              disabled={submitting}
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              {submitting ? "Signing In..." : "Sign In to Enterprise Workspace"}
            </Button>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Quick Links */}
        <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" sx={{ mb: 1.5, textTransform: "uppercase" }}>
          Onboarding &amp; Account Services
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

      {/* Force Password Change Modal (first-time login) */}
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
