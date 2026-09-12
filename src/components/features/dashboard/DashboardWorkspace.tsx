"use client";

import { Alert, CircularProgress, Container, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import PageSection from "@/components/layout/PageSection";
import { ApiError, readAccessTokenFromCookie } from "@/lib/api/client";
import { authService } from "@/services/auth.service";
import type { User } from "@/types/api";

import AdvocateVerificationPanel from "./AdvocateVerificationPanel";

function isAdminRole(role: string) {
  return role === "admin" || role === "super_admin";
}

export default function DashboardWorkspace() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = readAccessTokenFromCookie();
    if (!token) {
      setError("Session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    authService
      .me(token)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          setError("Session expired. Please sign in again.");
        } else {
          setError("Unable to load your profile.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageSection>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Enterprise Workspace Dashboard
          </Typography>
          {loading && (
            <Stack sx={{ alignItems: "center", py: 4 }}>
              <CircularProgress />
            </Stack>
          )}
          {!loading && error && <Alert severity="error">{error}</Alert>}
          {!loading && user && (
            <Typography color="text.secondary">
              Signed in as <strong>{user.email}</strong> ({user.role})
            </Typography>
          )}
        </Paper>

        {!loading && user && isAdminRole(user.role) && <AdvocateVerificationPanel />}
        {!loading && user && !isAdminRole(user.role) && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography color="text.secondary">
              Admin verification tools are available to active admin accounts only.
            </Typography>
          </Paper>
        )}
      </Container>
    </PageSection>
  );
}
