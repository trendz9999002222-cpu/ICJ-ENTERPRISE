"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import PersonIcon from "@mui/icons-material/Person";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function ProfessionalApplicationPage() {
  const [loading, setLoading] = useState(true);
  const [professions, setProfessions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = readCookie("icj_access_token");
        const res = await fetch("http://127.0.0.1:8000/api/v1/auth/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setUser(data);
          setProfessions(data.professions || []);
        }
      } catch (err) {
        console.error("Error loading application data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  const STEPS = ["Application Submitted", "Documents Uploaded", "Admin Review & Verification", "Approved & Onboarded"];

  return (
    <PortalPageShell
      title="Application & Registration Status"
      subtitle="Track your professional onboarding status, review verified categories, and access submitted credentials."
      actions={
        <Button
          component={Link}
          href="/dashboard/profile"
          variant="contained"
          size="small"
          startIcon={<PersonIcon />}
          sx={{
            bgcolor: "#2563eb",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "8px",
            px: 2,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          View Full Profile
        </Button>
      }
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : (
        <Stack spacing={3}>
          {/* Status Tracker Card */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              bgcolor: "#ffffff",
              p: 3,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 3 }}>
              Onboarding & Approval Pipeline
            </Typography>
            <Stepper activeStep={3} alternativeLabel>
              {STEPS.map((label, i) => (
                <Step key={label} completed={true}>
                  <StepLabel
                    icon={
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: "#2563eb",
                          display: "grid",
                          placeItems: "center",
                          color: "#ffffff",
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                      </Box>
                    }
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#0f172a" }}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "#f0fdf4",
                borderRadius: "8px",
                border: "1px solid #bbf7d0",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: "#166534", fontWeight: 700 }}>
                Your registrations have been reviewed and approved by the ICJ Administration.
              </Typography>
            </Box>
          </Card>

          {/* Registrations List */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              bgcolor: "#ffffff",
              p: 3,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
              Submitted Professional Registrations ({professions.length})
            </Typography>

            {professions.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                No active registrations found.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {professions.map((p, idx) => (
                  <Box
                    key={p.registration_id || idx}
                    sx={{
                      p: 2.5,
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" } }}
                    >
                      <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: "10px",
                            bgcolor: "#eff6ff",
                            color: "#2563eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <WorkspacePremiumIcon />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>
                            {p.profession_name || "Registered Professional"}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.3 }}>
                            Category: <strong>{p.category_name}</strong> • Group: <strong>{p.group_name}</strong>
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 700, display: "block", mt: 0.5 }}>
                            Application Reference ID: {p.reference_id}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                        label={p.status?.toUpperCase() || "APPROVED"}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 800, height: 24, fontSize: "0.7rem" }}
                      />
                    </Stack>

                    {/* Files if any */}
                    {p.files && p.files.length > 0 && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e2e8f0" }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                          Uploaded Documents ({p.files.length})
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
                          {p.files.map((file: any) => (
                            <Chip
                              key={file.id}
                              icon={<DescriptionIcon sx={{ fontSize: "14px !important" }} />}
                              label={file.original_name || file.document_key}
                              component="a"
                              href={file.url || "#"}
                              target="_blank"
                              clickable
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: "#cbd5e1",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                "&:hover": { borderColor: "#2563eb", color: "#2563eb" },
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Card>
        </Stack>
      )}
    </PortalPageShell>
  );
}
