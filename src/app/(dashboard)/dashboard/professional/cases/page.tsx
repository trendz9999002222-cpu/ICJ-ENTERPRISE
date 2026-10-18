"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function AvailableCasesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/professional/leads");
  }, [router]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 2 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Redirecting to unified Lead Marketplace...
      </Typography>
    </Box>
  );
}
