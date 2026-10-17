"use client";

import { useEffect, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaymentsIcon from "@mui/icons-material/Payments";
import { Alert, AlertTitle, Box, Button, CircularProgress, Typography } from "@mui/material";

import { env } from "@/config/env";
import { readAccessTokenFromCookie } from "@/lib/api/client";
// Razorpay checkout (Commented out - switched to Easebuzz)
// import { loadRazorpayCheckout } from "@/lib/razorpay/loadRazorpay";
import { loadEasebuzzCheckout } from "@/lib/easebuzz/loadEasebuzz";
import { membershipOnboardingPublicService } from "@/services/public/membershipOnboardingPublic.service";
import type { UserMembershipInfo } from "@/types/api";

export default function MemberPendingApprovalAlert() {
  const [membership, setMembership] = useState<UserMembershipInfo | null>(null);
  const [feeAmountInr, setFeeAmountInr] = useState<number>(499);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    const token = readAccessTokenFromCookie();
    if (!token) return;

    fetch(`${env.apiUrl}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data ?? json;
        if (data?.membership) setMembership(data.membership as UserMembershipInfo);
      })
      .catch(() => {});

    membershipOnboardingPublicService
      .fetchPaymentSettings()
      .then((settings) => {
        if (settings?.amount_inr) setFeeAmountInr(settings.amount_inr);
      })
      .catch(() => {});
  }, []);

  const handlePayNow = async () => {
    if (!membership) return;
    setPaying(true);
    setPayError(null);
    try {
      // 1. Create payment order (calls Easebuzz initiateLink)
      const order = await membershipOnboardingPublicService.createPaymentOrder({
        application_id: membership.application_id,
      });

      // 2. Load Easebuzz Checkout SDK
      let easebuzzLoaded = false;
      try {
        await loadEasebuzzCheckout();
        easebuzzLoaded = typeof window !== "undefined" && Boolean(window.EasebuzzCheckout);
      } catch {
        easebuzzLoaded = false;
      }

      if (easebuzzLoaded && order.access_key) {
        // Open Easebuzz modal popup
        await new Promise<void>((resolve, reject) => {
          try {
            const easebuzz = new window.EasebuzzCheckout(order.key || "P2OTPKQ5X", order.env || "test");
            const options = {
              access_key: order.access_key,
              onResponse: async (response: any) => {
                try {
                  const statusStr = String(response?.status || "").toLowerCase();
                  if (statusStr === "success" || response?.status === 1) {
                    await membershipOnboardingPublicService.verifyPayment({
                      payment_id: order.payment_id,
                      txnid: response.txnid || order.txnid,
                      status: "success",
                      easepayid: response.easepayid || "",
                      hash: response.hash || "",
                      application_id: membership.application_id,
                    });
                    setMembership((prev) =>
                      prev
                        ? {
                            ...prev,
                            is_paid: true,
                            fee_payment_status: "paid",
                            payment_id: order.payment_id,
                          }
                        : null
                    );
                    resolve();
                  } else {
                    reject(new Error(response?.error_Message || response?.error_desc || "Payment was not successful."));
                  }
                } catch (e) {
                  reject(e);
                }
              },
            };
            easebuzz.initiatePayment(options);
          } catch (initErr) {
            if (order.payment_url) {
              window.location.href = order.payment_url;
            } else {
              reject(initErr);
            }
          }
        });
      } else if (order.payment_url) {
        // Fallback: Redirect to Easebuzz hosted checkout
        window.location.href = order.payment_url;
      } else {
        throw new Error("Payment gateway failed to load. Please try again.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment could not be completed.";
      setPayError(msg);
    } finally {
      setPaying(false);
    }
  };

  if (!membership) return null;

  if (membership.is_approved || membership.status === "approved") {
    return (
      <Box sx={{ mb: 3 }}>
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ borderRadius: 2, border: "1px solid #bbf7d0", bgcolor: "#f0fdf4" }}
        >
          <AlertTitle sx={{ fontWeight: 800 }}>Admin approved your account</AlertTitle>
          Your membership
          {membership.membership_id ? (
            <>
              {" "}
              (<strong>{membership.membership_id}</strong>)
            </>
          ) : null}{" "}
          is approved. Additional services will appear here as they are enabled on the platform.
        </Alert>
      </Box>
    );
  }

  if (!["pending", "under_review"].includes(membership.status)) {
    return null;
  }

  const isPaid = Boolean(membership.is_paid || membership.fee_payment_status === "paid");

  return (
    <Box sx={{ mb: 3 }}>
      {payError && (
        <Alert severity="error" onClose={() => setPayError(null)} sx={{ mb: 2 }}>
          {payError}
        </Alert>
      )}

      {isPaid ? (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ borderRadius: 2, border: "1px solid #bbf7d0", bgcolor: "#f0fdf4", mb: 2 }}
        >
          <AlertTitle sx={{ fontWeight: 800, color: "#166534" }}>Payment Successful</AlertTitle>
          <Typography variant="body2" sx={{ color: "#15803d" }}>
            Your membership fee is recorded. Application reference: <strong>{membership.reference_id}</strong>. Your
            official membership ID will be assigned after admin approval.
          </Typography>
        </Alert>
      ) : (
        <Alert
          severity="warning"
          icon={<PaymentsIcon />}
          sx={{
            borderRadius: 2,
            border: "1px solid #fed7aa",
            bgcolor: "#fffbeb",
            mb: 2,
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            flexWrap: "wrap",
            gap: 1.5,
          }}
          action={
            <Button
              size="small"
              variant="contained"
              disabled={paying}
              startIcon={paying ? <CircularProgress size={16} color="inherit" /> : <LockOutlinedIcon />}
              onClick={handlePayNow}
              sx={{
                bgcolor: "#d97706",
                "&:hover": { bgcolor: "#b45309" },
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 1.5,
                whiteSpace: "nowrap",
                px: 2,
              }}
            >
              {paying ? "Processing…" : `Pay Membership Fee (₹${feeAmountInr})`}
            </Button>
          }
        >
          <Box>
            <AlertTitle sx={{ fontWeight: 800, color: "#92400e" }}>Membership Fee Pending (Skipped)</AlertTitle>
            <Typography variant="body2" sx={{ color: "#78350f" }}>
              You chose to skip the membership fee during application. Application reference: <strong>{membership.reference_id}</strong>. You can pay the membership fee anytime to expedite your approval.
            </Typography>
          </Box>
        </Alert>
      )}

      <Alert
        severity="warning"
        icon={<HourglassTopIcon />}
        sx={{ borderRadius: 2, border: "1px solid #fde68a" }}
      >
        <AlertTitle sx={{ fontWeight: 800 }}>Your account is not approved yet</AlertTitle>
        An admin will review your application. Until then you can use this dashboard, update your profile, and change
        your password. Other member services will unlock after approval.
      </Alert>
    </Box>
  );
}
