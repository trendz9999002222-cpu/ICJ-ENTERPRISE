"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Card, Typography, Button, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { emailVerificationService } from "@/services/emailVerification.service";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const rawEmail = searchParams.get("email") || searchParams.get("verify_email") || "";
    const token = searchParams.get("token") || undefined;

    if (!rawEmail) {
      setStatus("error");
      setErrorMessage("No email specified in verification link.");
      return;
    }

    const normalized = rawEmail.trim().toLowerCase();
    setEmail(normalized);

    const success = emailVerificationService.verifyEmailWithToken(normalized, token);

    if (success) {
      setStatus("success");

      // Notify parent/opener window if opened as popup
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: "ICJ_EMAIL_VERIFIED", email: normalized }, "*");
        }
      } catch {}

      // Attempt auto-close after 1.5 seconds
      const timer = setTimeout(() => {
        try {
          window.close();
        } catch {}
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setStatus("error");
      setErrorMessage("Invalid or expired verification link. Please request a new link.");
    }
  }, [searchParams]);

  const handleClose = () => {
    try {
      window.close();
    } catch {}
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8fafc",
        p: 2,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: "100%",
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
          textAlign: "center",
        }}
      >
        {status === "verifying" && (
          <Box sx={{ py: 3 }}>
            <CircularProgress size={48} sx={{ color: "#2563eb", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
              Verifying your email...
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Please wait a moment while we confirm your verification link.
            </Typography>
          </Box>
        )}

        {status === "success" && (
          <Box sx={{ py: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2.5,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 38, color: "#16a34a" }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
              Email Verified Successfully!
            </Typography>

            <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6, mb: 1 }}>
              Your email <strong>{email}</strong> has been verified.
            </Typography>

            <Box
              sx={{
                p: 1.5,
                bgcolor: "#f0fdf4",
                borderRadius: 2,
                border: "1px solid #bbf7d0",
                my: 2.5,
              }}
            >
              <Typography sx={{ fontSize: "0.82rem", color: "#166534", fontWeight: 600 }}>
                ✓ Your application form tab has been updated automatically.
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#15803d", mt: 0.5 }}>
                You can now close this tab and continue filling out your application.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, justifyContent: "center", mt: 3 }}>
              <Button
                component={Link}
                href="/join-membership"
                variant="contained"
                startIcon={<ArrowBackIcon />}
                size="large"
                sx={{
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1.25,
                  borderRadius: 2,
                }}
              >
                Return to Application Form
              </Button>
              <Button
                variant="outlined"
                onClick={handleClose}
                startIcon={<CloseIcon />}
                size="large"
                sx={{
                  color: "#64748b",
                  borderColor: "#cbd5e1",
                  "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2.5,
                  py: 1.25,
                  borderRadius: 2,
                }}
              >
                Close Tab
              </Button>
            </Box>
          </Box>
        )}

        {status === "error" && (
          <Box sx={{ py: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2.5,
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 38, color: "#dc2626" }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: "#991b1b", mb: 1 }}>
              Verification Failed
            </Typography>

            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              {errorMessage}
            </Typography>

            <Button
              component={Link}
              href="/join-membership"
              variant="contained"
              sx={{
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                py: 1,
                borderRadius: 2,
              }}
            >
              Go to Application Form
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </Box>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
