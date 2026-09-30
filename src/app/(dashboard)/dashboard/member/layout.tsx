"use client";

import { Box } from "@mui/material";
import type { ReactNode } from "react";

import MemberPendingApprovalAlert from "@/components/features/dashboard/member/MemberPendingApprovalAlert";

export default function MemberDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Box>
      <MemberPendingApprovalAlert />
      {children}
    </Box>
  );
}
