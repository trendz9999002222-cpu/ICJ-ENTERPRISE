import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Link,
} from "@mui/material";
import AuthService from "../services/authService";

const REQUEST_TYPES = {
  forgot_user_id: "FORGOT_USER_ID",
  forgot_password: "FORGOT_PASSWORD",
  account_recovery: "ACCOUNT_RECOVERY",
};

export default function AccountRecovery() {
  const [activeTab, setActiveTab] = useState("forgot_user_id");
  const [form, setForm] = useState({
    email: "",
    mobile: "",
    preferredChannel: "email",
    reason: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const heading = useMemo(() => {
    if (activeTab === "forgot_user_id") return "Forgot User ID";
    if (activeTab === "forgot_password") return "Forgot Password";
    return "Account Recovery";
  }, [activeTab]);

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
      const payload = {
        email: form.email,
        mobile: form.mobile,
        preferredChannel: form.preferredChannel,
        reason: form.reason,
      };

      let result = null;
      if (activeTab === "forgot_user_id") {
        result = await AuthService.forgotUserId(payload);
      } else if (activeTab === "forgot_password") {
        result = await AuthService.forgotPassword(payload);
      } else {
        result = await AuthService.requestAccountRecovery(payload);
      }

      const requestType = REQUEST_TYPES[activeTab];
      setSuccess(
        `${result?.message || "Recovery request submitted."} Request No: ${result?.requestNo || "N/A"} | Type: ${requestType}`
      );
    } catch (submitError) {
      setError(submitError?.message || "Unable to submit recovery request.");
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
        background: "radial-gradient(circle at 10% 20%, #f6f8ff 0, #f0f8ff 35%, #fff8f1 100%)",
      }}
    >
      <Paper sx={{ width: "100%", maxWidth: 640, p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Identity Recovery
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Secure recovery requests with audit tracking and admin review workflow.
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, value) => {
            setActiveTab(value);
            setError("");
            setSuccess("");
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          <Tab value="forgot_user_id" label="Forgot User ID" />
          <Tab value="forgot_password" label="Forgot Password" />
          <Tab value="account_recovery" label="Account Recovery" />
        </Tabs>

        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
          {heading}
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Registered Email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
            />
            <TextField
              fullWidth
              label="Registered Mobile"
              name="mobile"
              value={form.mobile}
              onChange={onChange}
              placeholder="9876543210"
            />
            <TextField
              fullWidth
              select
              label="Preferred OTP Channel"
              name="preferredChannel"
              value={form.preferredChannel}
              onChange={onChange}
              helperText="Providers are policy-gated and disabled right now. Selection is retained for future provider adapters."
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
            </TextField>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Reason"
              name="reason"
              value={form.reason}
              onChange={onChange}
              placeholder="Describe what access issue you are facing"
            />
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Return to <Link component={RouterLink} to="/login">Sign In</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
