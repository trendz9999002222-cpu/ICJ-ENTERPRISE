"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import DashboardIcon from "@mui/icons-material/Dashboard";

import PageHeader from "@/components/features/public/PageHeader";

function PaymentFailureContent() {
  const searchParams = useSearchParams();

  const txnid = searchParams.get("txnid") || "";
  const errorMsg =
    searchParams.get("error_Message") ||
    searchParams.get("error_desc") ||
    searchParams.get("status") ||
    "Payment was declined or cancelled before authorization.";

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          border: "2px solid #ef4444",
          bgcolor: "#ffffff",
          textAlign: "center",
          boxShadow: "0 16px 40px rgba(239,68,68,0.12)",
        }}
      >
        <Box
          sx={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            bgcolor: "#fef2f2",
            border: "2px solid #fca5a5",
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 44, color: "#dc2626" }} />
        </Box>

        <Typography
          sx={{
            fontFamily: "Georgia, serif",
            fontSize: { xs: "1.4rem", sm: "1.8rem" },
            fontWeight: 900,
            color: "#991b1b",
            mb: 0.5,
          }}
        >
          Payment Authorization Incomplete
        </Typography>

        <Typography variant="body1" sx={{ color: "#475569", mb: 3 }}>
          Your payment attempt via the Easebuzz gateway was not completed or was cancelled.
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            border: "1px solid #fecaca",
            borderRadius: 2,
            bgcolor: "#fff5f5",
            textAlign: "left",
          }}
        >
          <Typography variant="caption" sx={{ color: "#991b1b", fontWeight: 700, display: "block", mb: 0.5 }}>
            GATEWAY DIAGNOSTIC FEEDBACK
          </Typography>
          <Typography variant="body2" sx={{ color: "#7f1d1d", fontWeight: 600 }}>
            {errorMsg}
          </Typography>
          {txnid && (
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 1, fontFamily: "monospace" }}>
              Transaction Reference: {txnid}
            </Typography>
          )}
        </Paper>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "center" }}>
          <Button
            component={Link}
            href="/join"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<RefreshIcon />}
            sx={{ textTransform: "none", fontWeight: 800, px: 3.5, bgcolor: "#0f2942" }}
          >
            Retry Membership Enrollment
          </Button>

          <Button
            component={Link}
            href="/dashboard/member"
            variant="outlined"
            size="large"
            startIcon={<DashboardIcon />}
            sx={{ textTransform: "none", fontWeight: 800, px: 3, borderColor: "#0f2942", color: "#0f2942" }}
          >
            Return to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default function MembershipPaymentFailurePage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 8 }}>
      <PageHeader
        badge="Security Notification"
        title="Payment Interrupted"
        subtitle="Gateway notification from International Consortium of Jurists."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Join ICJ", href: "/join" },
          { label: "Payment Status" },
        ]}
      />
      <Suspense fallback={null}>
        <PaymentFailureContent />
      </Suspense>
    </Box>
  );
}
