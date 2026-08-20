import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
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

export default function Recovery() {
  const { requestRecovery } = useAuth();

  const [form, setForm] = useState({
    email: "",
    recoveryType: "forgot_password",
    channel: "Email",
    reason: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Configurable OTP / Notification channels (default: Email)
  // When availableChannels.length <= 1, channel selector is hidden per Requirement 4
  const availableChannels = ["Email"];

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email) {
      setError("Please enter your registered email.");
      return;
    }

    if (form.recoveryType === "manual" && !form.reason.trim()) {
      setError("Please specify the reason for account recovery.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await requestRecovery({
        email: form.email,
        type: form.recoveryType,
        channel: form.channel,
        reason: form.reason,
      });
      setSuccess(res.message || "Recovery request submitted successfully.");
    } catch (submitError) {
      setError(submitError.message || "Unable to submit recovery request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        background: "linear-gradient(135deg,#eef4ff,#f9fbff)",
      }}
    >
      <Paper
        sx={{ width: "100%", maxWidth: 460, p: 4, borderRadius: 3 }}
        component="form"
        onSubmit={onSubmit}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          Identity Recovery
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <TextField
          fullWidth
          select
          label="Recovery Option"
          name="recoveryType"
          value={form.recoveryType}
          onChange={onChange}
          sx={{ mb: 2 }}
        >
          <MenuItem value="forgot_password">Forgot Password</MenuItem>
          <MenuItem value="forgot_id">Forgot User ID</MenuItem>
          <MenuItem value="manual">Manual Account Recovery</MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Registered Email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
          sx={{ mb: 2 }}
        />

        {/* Hide channel selector when only one provider is available (Requirement 4) */}
        {availableChannels.length > 1 && (
          <TextField
            fullWidth
            select
            label="Verification Method"
            name="channel"
            value={form.channel}
            onChange={onChange}
            sx={{ mb: 2 }}
          >
            {availableChannels.map((ch) => (
              <MenuItem key={ch} value={ch}>
                {ch}
              </MenuItem>
            ))}
          </TextField>
        )}

        {/* Show Reason field ONLY for Manual Account Recovery (Requirement 5) */}
        {form.recoveryType === "manual" && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Recovery"
            name="reason"
            value={form.reason}
            onChange={onChange}
            required
            sx={{ mb: 3 }}
          />
        )}

        <Button
          fullWidth
          variant="contained"
          type="submit"
          size="large"
          disabled={submitting}
          sx={{ mt: form.recoveryType === "manual" ? 0 : 1 }}
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </Button>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2">
            <Link component={RouterLink} to="/login" underline="hover">
              Back to Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
