"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function MyCasesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/professional/my-leads");
  }, [router]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 2 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Redirecting to unified My Leads & Cases...
      </Typography>
    </Box>
  );
}
