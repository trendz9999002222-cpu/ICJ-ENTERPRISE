"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";

import AdminPageShell from "@/components/features/admin/shared/AdminPageShell";
import {
  getOnboardingApiErrorMessage,
  professionalOnboardingService,
} from "@/services/admin/professionalOnboarding.service";

export default function RegistrationDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    professionalOnboardingService
      .getRegistration(id)
      .then(setData)
      .catch((err) => setError(getOnboardingApiErrorMessage(err, "Failed to load registration.")))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <AdminPageShell title="Registration detail" subtitle="Full application payload for review.">
      <Button component={Link} href="/admin/practice-areas/registrations" variant="outlined" size="small" sx={{ mb: 2 }}>
        Back to list
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
      {loading && (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {data && (
        <Stack spacing={2}>
          <Typography>
            <strong>Request ID:</strong> {String(data.reference_id ?? "")}
          </Typography>
          <Typography>
            <strong>Status:</strong> {String(data.status ?? "")}
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: "#f8fafc",
              borderRadius: 1,
              overflow: "auto",
              fontSize: "0.8rem",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </Box>
        </Stack>
      )}
    </AdminPageShell>
  );
}
