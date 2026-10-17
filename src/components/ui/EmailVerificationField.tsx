"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import KeyIcon from "@mui/icons-material/VpnKey";
import { emailVerificationService } from "@/services/emailVerification.service";

interface EmailVerificationFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  applicantName?: string;
  themeColor?: string;
  inputSx?: any;
  onChange: (value: string) => void;
  onVerified?: (email: string) => void;
  isPreVerified?: boolean;
}

export default function EmailVerificationField({
  label = "Email Address",
  placeholder = "name@example.com",
  value = "",
  error,
  helperText,
  required = true,
  applicantName = "",
  themeColor = "#2563eb",
  inputSx,
  onChange,
  onVerified,
  isPreVerified = false,
}: EmailVerificationFieldProps) {
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    if (isPreVerified) return true;
    return emailVerificationService.isEmailVerified(value);
  });
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpValue, setOtpValue] = useState<string>("");
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const focusNextInput = (verifiedEmail: string) => {
    setTimeout(() => {
      try {
        const selector =
          'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])';
        const allInputs = Array.from(document.querySelectorAll(selector));
        const currentIdx = allInputs.findIndex(
          (el) => (el as HTMLInputElement).value === verifiedEmail
        );
        if (currentIdx >= 0 && currentIdx < allInputs.length - 1) {
          (allInputs[currentIdx + 1] as HTMLElement).focus();
        }
      } catch {
        // Ignore DOM focus errors
      }
    }, 150);
  };

  // Sync with pre-verified prop
  useEffect(() => {
    if (isPreVerified && value) {
      setIsVerified(true);
      emailVerificationService.markEmailVerified(value);
    }
  }, [isPreVerified, value]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resendCooldown]);

  const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  const handleInputChange = (newEmail: string) => {
    onChange(newEmail);
    // If email changes, reset verification and OTP state
    if (isVerified && newEmail.toLowerCase().trim() !== value.toLowerCase().trim()) {
      setIsVerified(false);
      setOtpSent(false);
      setOtpValue("");
      setOtpError("");
      emailVerificationService.clearEmailVerification(value);
    } else if (otpSent) {
      // If user edits email after sending OTP, reset OTP box
      setOtpSent(false);
      setOtpValue("");
      setOtpError("");
    }
  };

  const handleSendOtp = async () => {
    if (!isValidEmailFormat) {
      setOtpError("Please enter a valid email address first.");
      return;
    }

    setSendingOtp(true);
    setOtpError("");
    try {
      const res = await emailVerificationService.sendEmailOtp(value, applicantName);
      if (res.success) {
        setOtpSent(true);
        setOtpValue("");
        setResendCooldown(30);
        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 200);
      } else {
        setOtpError(res.error || "Failed to send verification code. Please try again.");
      }
    } catch (err: any) {
      setOtpError(err.message || "Failed to dispatch verification code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = (codeToVerify?: string) => {
    const code = (codeToVerify ?? otpValue).trim();
    if (!code || code.length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }

    setVerifyingOtp(true);
    setOtpError("");
    try {
      const res = emailVerificationService.verifyEmailOtp(value, code);
      if (res.success) {
        setIsVerified(true);
        setOtpSent(false);
        setOtpValue("");
        setOtpError("");
        if (onVerified) onVerified(value.trim().toLowerCase());
        focusNextInput(value);
      } else {
        setOtpError(res.error || "Invalid verification code. Please check and try again.");
      }
    } catch {
      setOtpError("An error occurred during verification. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpInputChange = (newVal: string) => {
    const clean = newVal.replace(/\D/g, "").slice(0, 6);
    setOtpValue(clean);
    setOtpError("");
    if (clean.length === 6) {
      handleVerifyOtp(clean);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Email Input Field */}
      <TextField
        fullWidth
        size="small"
        type="email"
        label={label + (required ? " *" : "")}
        placeholder={placeholder}
        value={value}
        disabled={isVerified}
        onChange={(e) => handleInputChange(e.target.value)}
        error={Boolean(error)}
        helperText={error ?? helperText}
        sx={{
          ...(inputSx || {}),
          "& .MuiOutlinedInput-root": {
            ...(inputSx?.["& .MuiOutlinedInput-root"] || {}),
            borderColor: isVerified ? "#10b981 !important" : undefined,
            bgcolor: isVerified ? "#f0fdf4" : undefined,
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ fontSize: 20, color: isVerified ? "#10b981" : "#94a3b8" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {isVerified ? (
                  <Chip
                    icon={
                      <CheckCircleIcon sx={{ fontSize: "16px !important", color: "#15803d !important" }} />
                    }
                    label="Verified"
                    size="small"
                    sx={{
                      height: 26,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      bgcolor: "#dcfce7",
                      color: "#15803d",
                      border: "1px solid #86efac",
                    }}
                  />
                ) : isValidEmailFormat ? (
                  <Button
                    size="small"
                    variant="contained"
                    disabled={sendingOtp}
                    onClick={handleSendOtp}
                    startIcon={
                      sendingOtp ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <SendIcon sx={{ fontSize: 14 }} />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      py: 0.4,
                      px: 1.6,
                      borderRadius: 1.5,
                      bgcolor: themeColor,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
                    }}
                  >
                    {sendingOtp ? "Sending OTP..." : otpSent ? "Resend OTP" : "Send OTP"}
                  </Button>
                ) : null}
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Verified feedback */}
      {isVerified && (
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#15803d",
            mt: 0.5,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 14 }} /> Email verified successfully. You may continue.
        </Typography>
      )}

      {/* OTP Input Card (Visible when OTP has been sent) */}
      {!isVerified && otpSent && (
        <Box
          sx={{
            mt: 1.25,
            p: 2,
            borderRadius: 2,
            bgcolor: "#f8fafc",
            border: "1.5px solid #cbd5e1",
            boxShadow: "0 2px 6px -1px rgba(0,0,0,0.05)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography sx={{ fontSize: "0.82rem", color: "#1e293b", fontWeight: 600, display: "flex", alignItems: "center", gap: 0.75 }}>
              <KeyIcon sx={{ fontSize: 16, color: "#2563eb" }} />
              Enter 6-digit OTP sent to <strong>{value}</strong>
            </Typography>
            <Button
              size="small"
              onClick={() => {
                setOtpSent(false);
                setOtpValue("");
                setOtpError("");
              }}
              startIcon={<EditIcon sx={{ fontSize: 12 }} />}
              sx={{
                textTransform: "none",
                fontSize: "0.74rem",
                color: "#64748b",
                p: 0,
                minWidth: 0,
                "&:hover": { color: "#2563eb", bgcolor: "transparent" },
              }}
            >
              Change Email
            </Button>
          </Box>

          {/* OTP Input and Verify Button */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TextField
              size="small"
              placeholder="0 0 0 0 0 0"
              value={otpValue}
              inputRef={otpInputRef}
              onChange={(e) => handleOtpInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && otpValue.length === 6) {
                  e.preventDefault();
                  handleVerifyOtp();
                }
              }}
              error={Boolean(otpError)}
              slotProps={{
                input: {
                  inputProps: {
                    maxLength: 6,
                    style: {
                      letterSpacing: "8px",
                      textAlign: "center",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      padding: "8px 14px",
                    },
                  },
                },
              }}
              sx={{
                maxWidth: 200,
                bgcolor: "#fff",
                borderRadius: 1.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
            />

            <Button
              variant="contained"
              size="small"
              disabled={otpValue.length !== 6 || verifyingOtp}
              onClick={() => handleVerifyOtp()}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.82rem",
                px: 2.5,
                py: 0.85,
                borderRadius: 1.5,
                bgcolor: "#2563eb",
                boxShadow: "none",
                "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
              }}
            >
              {verifyingOtp ? <CircularProgress size={16} color="inherit" /> : "Verify OTP"}
            </Button>
          </Box>

          {/* Error Message */}
          {otpError && (
            <Typography sx={{ fontSize: "0.78rem", color: "#dc2626", mt: 1, fontWeight: 500 }}>
              ⚠ {otpError}
            </Typography>
          )}

          {/* Resend Link */}
          <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
              Didn&apos;t receive code?
            </Typography>
            <Button
              size="small"
              disabled={resendCooldown > 0 || sendingOtp}
              onClick={handleSendOtp}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                color: resendCooldown > 0 ? "#94a3b8" : "#2563eb",
                fontWeight: 700,
                p: 0,
                minWidth: 0,
                "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
              }}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
            </Button>
          </Box>
        </Box>
      )}

      {/* Helper prompt when unverified and OTP not sent */}
      {!isVerified && isValidEmailFormat && !otpSent && !otpError && (
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#64748b",
            mt: 0.5,
            fontWeight: 500,
          }}
        >
          Click &quot;Send OTP&quot; to receive a 6-digit verification code in your email.
        </Typography>
      )}

      {/* Top level error message when sending fails */}
      {!isVerified && !otpSent && otpError && (
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#dc2626",
            mt: 0.5,
            fontWeight: 500,
          }}
        >
          ⚠ {otpError}
        </Typography>
      )}
    </Box>
  );
}
