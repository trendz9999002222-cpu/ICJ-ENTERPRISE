"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function AdminSubscriptionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/lead-plans?tab=membership-fee");
  }, [router]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 2 }}>
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        Redirecting to ICJ Plans (Membership Fee &amp; Gateway Settings)...
      </Typography>
    </Box>
  );
}
