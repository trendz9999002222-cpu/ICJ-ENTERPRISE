"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function CasesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/leads");
  }, [router]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 2 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Redirecting to unified Leads & Legal Matters Management...
      </Typography>
    </Box>
  );
}
