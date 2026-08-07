import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
} from "@mui/material";
import PasswordField from "../components/auth/PasswordField";
import useAuth from "../hooks/useAuth";
import {
  getPostLoginRoute,
  resolveRoleCode,
} from "../core/roles";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    loginId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const result = await login(form);
      navigate(getPostLoginRoute(resolveRoleCode(result?.profile, result?.user)));
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, background: "linear-gradient(135deg,#eef4ff,#f9fbff)" }}>
      <Paper sx={{ width: "100%", maxWidth: 560, p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Sign In
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Access ICJ Enterprise Platform
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Box component="form" onSubmit={onSubmit}>
          <TextField
            fullWidth
            label="Email / Mobile / Member ID"
            name="loginId"
            value={form.loginId}
            onChange={onChange}
            sx={{ mb: 2 }}
          />
          <PasswordField fullWidth label="Password" name="password" value={form.password} onChange={onChange} sx={{ mb: 2 }} />
          <Box sx={{ mb: 1 }} />

          <Button fullWidth variant="contained" type="submit" disabled={submitting}>
            {submitting ? "Signing In..." : "Sign In"}
          </Button>
        </Box>

        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Forgot password or Member ID? <Link component={RouterLink} to="/account-recovery">Open Recovery Center</Link>
          </Typography>
          <Typography variant="body2">
            New member? <Link component={RouterLink} to="/register">Create account</Link>
          </Typography>
        </Box>

        {success ? <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert> : null}
      </Paper>
    </Box>
  );
}

