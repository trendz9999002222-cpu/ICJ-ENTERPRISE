"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import PaymentsIcon from "@mui/icons-material/Payments";
import { Alert, AlertTitle, Box } from "@mui/material";
import { useEffect, useState } from "react";

import { env } from "@/config/env";
import { readAccessTokenFromCookie } from "@/lib/api/client";
import type { UserMembershipInfo } from "@/types/api";

export default function MemberPendingApprovalAlert() {
  const [membership, setMembership] = useState<UserMembershipInfo | null>(null);

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
  }, []);

  if (!membership) return null;

  if (membership.is_approved || membership.status === "approved") {
    return (
      <Box sx={{ mb: 3 }}>
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ borderRadius: 2, border: "1px solid #bbf7d0" }}
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

  return (
    <Box sx={{ mb: 3 }}>
      <Alert
        severity="info"
        icon={<PaymentsIcon />}
        sx={{ borderRadius: 2, border: "1px solid #bfdbfe", mb: 2 }}
      >
        <AlertTitle sx={{ fontWeight: 800 }}>Payment successful</AlertTitle>
        Your membership fee is recorded. Application reference: <strong>{membership.reference_id}</strong>. Your
        official membership ID will be assigned after admin approval.
      </Alert>
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
