"use client";

import { env } from "@/config/env";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import {
  Alert,
  Box,
  Button,
  Collapse,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MissingField {
  label: string;
  step_url: string;
}

interface ProfileCompletion {
  completion_percentage: number;
  missing_fields: MissingField[];
}

export default function ProfileCompletionBanner() {
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Attempt to fetch profile completion from API
    const token =
      typeof document !== "undefined"
        ? document.cookie.match(/icj_access_token=([^;]+)/)?.[1]
        : null;
    if (!token) return;

    fetch(`${env.apiUrl}/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const data = json?.data ?? json;
        // Build a lightweight completion object from the profile data
        const missing: MissingField[] = [];
        if (!data?.first_name) missing.push({ label: "First Name", step_url: "/dashboard/profile" });
        if (!data?.last_name) missing.push({ label: "Last Name", step_url: "/dashboard/profile" });
        if (!data?.mobile_number && !data?.phone) missing.push({ label: "Mobile Number", step_url: "/dashboard/profile" });
        if (!data?.profile_picture_url) missing.push({ label: "Profile Photo", step_url: "/dashboard/profile" });
        const pct = Math.round(((4 - missing.length) / 4) * 100);
        setCompletion({ completion_percentage: pct, missing_fields: missing });
      })
      .catch(() => {});
  }, []);

  if (!completion || completion.completion_percentage >= 100 || dismissed) return null;

  const pct = completion.completion_percentage;

  return (
    <Collapse in>
      <Alert
        severity="warning"
        icon={<InfoIcon />}
        onClose={() => setDismissed(true)}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: "1px solid #fcd34d",
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Complete your profile — {pct}% done
            </Typography>
            <Chip
              label={`${completion.missing_fields.length} item${completion.missing_fields.length !== 1 ? "s" : ""} remaining`}
              size="small"
              color="warning"
            />
          </Stack>

          <Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{ borderRadius: 4, height: 6, bgcolor: "#fef3c7", "& .MuiLinearProgress-bar": { bgcolor: "#d97706" } }}
            />
          </Box>

          {completion.missing_fields.length > 0 && (
            <Stack direction="row" spacing={1} sx={{flexWrap: "wrap" }}>
              {completion.missing_fields.map((f) => (
                <Button
                  key={f.label}
                  component={Link}
                  href={f.step_url}
                  size="small"
                  variant="outlined"
                  startIcon={<CheckCircleIcon fontSize="small" />}
                  sx={{ fontSize: "0.75rem", textTransform: "none", borderColor: "#d97706", color: "#92400e" }}
                >
                  Add {f.label}
                </Button>
              ))}
            </Stack>
          )}
        </Stack>
      </Alert>
    </Collapse>
  );
}
