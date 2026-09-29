"use client";

import {
  Check,
  ContentCopy,
  Key,
  Person,
  Security,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

export interface CredentialsData {
  user_id?: number;
  email: string;
  role: string;
  temp_password?: string | null;
  is_new_user?: boolean;
  password_change_required?: boolean;
  name?: string;
  reference_id?: string;
  profession_name?: string;
  category_name?: string;
}

interface CredentialsDialogProps {
  open: boolean;
  onClose: () => void;
  credentials: CredentialsData | null;
  title?: string;
}

export default function CredentialsDialog({
  open,
  onClose,
  credentials,
  title = "User Credentials Generated",
}: CredentialsDialogProps) {
  const [showPassword, setShowPassword] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!credentials) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const copyAllCredentials = () => {
    const text = `--- ICJ PLATFORM LOGIN CREDENTIALS ---
Name: ${credentials.name || "N/A"}
Email / Username: ${credentials.email}
Role: ${credentials.role}
${credentials.profession_name ? `Profession: ${credentials.profession_name}\n` : ""}${credentials.category_name ? `Category: ${credentials.category_name}\n` : ""}Temporary Password: ${credentials.temp_password || "N/A"}
Login URL: ${typeof window !== "undefined" ? window.location.origin : ""}/login
Note: You will be prompted to change this password on your first login.
--------------------------------------`;
    copyToClipboard(text, "all");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              bgcolor: "#dcfce7",
              color: "#16a34a",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Key />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              {credentials.reference_id ? `Ref: ${credentials.reference_id}` : "Account provisioned successfully"}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        <Alert severity="success" icon={<Security fontSize="inherit" />} sx={{ mb: 2.5, borderRadius: 2 }}>
          {credentials.is_new_user
            ? "New user account has been created. Share these temporary credentials with the user."
            : "User account updated. Share these login details with the user."}
        </Alert>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 2.5,
            mb: 2.5,
          }}
        >
          <Stack spacing={2}>
            {/* Email / Username */}
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                Login Email
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.5 }}>
                <OutlinedInput
                  value={credentials.email}
                  readOnly
                  size="small"
                  fullWidth
                  sx={{ bgcolor: "#fff", fontFamily: "monospace", fontWeight: 600 }}
                  endAdornment={
                    <InputAdornment position="end">
                      <Tooltip title={copiedField === "email" ? "Copied!" : "Copy Email"}>
                        <IconButton size="small" onClick={() => copyToClipboard(credentials.email, "email")}>
                          {copiedField === "email" ? <Check color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  }
                />
              </Stack>
            </Box>

            {/* Temp Password */}
            {credentials.temp_password && (
              <Box>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                  Temporary Password
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.5 }}>
                  <OutlinedInput
                    type={showPassword ? "text" : "password"}
                    value={credentials.temp_password}
                    readOnly
                    size="small"
                    fullWidth
                    sx={{
                      bgcolor: "#fff",
                      fontFamily: "monospace",
                      fontWeight: 800,
                      fontSize: "1.05rem",
                      color: "#1e3a8a",
                      letterSpacing: showPassword ? "1px" : "3px",
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                        <Tooltip title={copiedField === "pwd" ? "Copied!" : "Copy Password"}>
                          <IconButton size="small" onClick={() => copyToClipboard(credentials.temp_password!, "pwd")}>
                            {copiedField === "pwd" ? <Check color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    }
                  />
                </Stack>
              </Box>
            )}

            {/* Role & Details */}
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, pt: 0.5 }}>
              <Chip
                label={`Role: ${credentials.role.toUpperCase()}`}
                color="primary"
                size="small"
                sx={{ fontWeight: 700 }}
              />
              {credentials.profession_name && (
                <Chip
                  label={credentials.profession_name}
                  color="secondary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
              {credentials.category_name && (
                <Chip
                  label={credentials.category_name}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              )}
            </Stack>
          </Stack>
        </Paper>

        <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
          * Security Notice: The user is required to change this temporary password upon their first login before accessing their dashboard.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          variant="outlined"
          startIcon={copiedField === "all" ? <Check /> : <ContentCopy />}
          onClick={copyAllCredentials}
          color={copiedField === "all" ? "success" : "inherit"}
          sx={{ fontWeight: 700 }}
        >
          {copiedField === "all" ? "Copied All Details!" : "Copy Full Details"}
        </Button>
        <Button variant="contained" onClick={onClose} sx={{ fontWeight: 700, px: 3 }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
