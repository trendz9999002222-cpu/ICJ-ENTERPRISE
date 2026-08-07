import { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Link,
  Alert,
} from "@mui/material";
import useAuth from "../hooks/useAuth";
import ForcePasswordChangeModal from "../components/ForcePasswordChangeModal";

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

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter both Username/Email and Password.");
      return;
    }

    setSubmitting(true);

    try {
      const user = await login(form);
      if (user.forcePasswordChange) {
        setPendingForceChangeUser(user);
      } else {
        navigate("/member-profile");
      }
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, background: "linear-gradient(135deg,#eef4ff,#f9fbff)" }}>
      <Paper sx={{ width: "100%", maxWidth: 460, p: 4, borderRadius: 3 }} component="form" onSubmit={onSubmit}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          International Consortium of Jurists (ICJ Enterprise Platform)
        </Typography>

        {initialMemberId && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration Successful! Member ID: <strong>{initialMemberId}</strong>. Sign in below to access your Member Dashboard.
          </Alert>
        )}

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <TextField fullWidth label="Username or Email Address" name="email" value={form.email} onChange={onChange} required sx={{ mb: 2 }} />
        <TextField fullWidth label="Password" name="password" type="password" value={form.password} onChange={onChange} required sx={{ mb: 2 }} />
        <TextField fullWidth select label="Role" name="role" value={form.role} onChange={onChange} sx={{ mb: 3 }}>
          <MenuItem value="member">Member</MenuItem>
          <MenuItem value="advocate">Advocate</MenuItem>
          <MenuItem value="client">Client</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="employee">Employee</MenuItem>
        </TextField>

        <Button fullWidth variant="contained" type="submit" size="large" disabled={submitting} sx={{ py: 1.5, fontWeight: "bold" }}>
          {submitting ? "Signing In..." : "Sign In to Member Dashboard"}
        </Button>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Typography variant="body2">
            New user? <Link component={RouterLink} to="/membership" underline="hover">Create account</Link>
          </Typography>
          <Typography variant="body2">
            <Link component={RouterLink} to="/recovery" underline="hover">Account recovery</Link>
          </Typography>
        </Box>
      </Paper>

      {/* First Login Force Password Change Modal */}
      {pendingForceChangeUser && (
        <ForcePasswordChangeModal
          open={Boolean(pendingForceChangeUser)}
          user={pendingForceChangeUser}
          onSuccess={() => {
            setPendingForceChangeUser(null);
            navigate("/member-profile");
          }}
        />
      )}
    </Box>
  );
}
