"use client";

import { Suspense } from "react";
import { CircularProgress, Box } from "@mui/material";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import ChangePasswordForm from "@/app/(public)/login/change-password/ChangePasswordForm";

export default function DashboardChangePasswordPage() {
  return (
    <PortalPageShell
      title="Change Password"
      subtitle="Update your account password."
    >
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        }
      >
        <ChangePasswordForm />
      </Suspense>
    </PortalPageShell>
  );
}
