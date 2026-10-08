"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import GavelIcon from "@mui/icons-material/Gavel";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import { professionalCasesService } from "@/services/professional/professionalCases.service";

export default function ProfessionalCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [caseData, setCaseData] = useState<any>(null);
  const [takingCase, setTakingCase] = useState(false);

  useEffect(() => {
    if (!caseId) return;

    professionalCasesService
      .getCaseDetails(caseId)
      .then((res) => {
        setCaseData(res);
      })
      .catch((err) => {
        setError(err.message || "Failed to load case details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [caseId]);

  const handleTakeCase = async () => {
    setTakingCase(true);
    try {
      await professionalCasesService.takeCase(caseId);
      // Reload details to reflect new status
      const res = await professionalCasesService.getCaseDetails(caseId);
      setCaseData(res);
      alert("Case accepted successfully!");
    } catch (err: any) {
      alert("Failed to take case: " + (err.message || "Unknown error"));
    } finally {
      setTakingCase(false);
    }
  };

  if (loading) {
    return (
      <PortalPageShell title="Case Details">
        <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </PortalPageShell>
    );
  }

  if (error || !caseData) {
    return (
      <PortalPageShell title="Case Details">
        <Box sx={{ p: 4, textAlign: "center", color: "error.main" }}>
          <Typography>{error || "Case not found."}</Typography>
          <Button sx={{ mt: 2 }} onClick={() => router.push("/dashboard/professional")}>
            Go Back
          </Button>
        </Box>
      </PortalPageShell>
    );
  }

  const { assistance_request_details: client, status, budget } = caseData;
  const isAssignedToMe = status !== "open";

  return (
    <PortalPageShell
      title={`Case ${caseData.case_id}`}
      subtitle="Detailed view of the case and client request."
      actions={
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/professional")}
          variant="outlined"
          sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
        >
          Back to Dashboard
        </Button>
      }
    >
      <Stack spacing={3}>
        {/* Header Summary */}
        <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: "12px" }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    {caseData.case_id}
                  </Typography>
                  <Chip
                    label={status.replace("_", " ").toUpperCase()}
                    color={status === "open" ? "default" : status === "closed" ? "success" : "primary"}
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                  Category: <strong>{client?.category}</strong> • Urgency: <strong>{client?.urgency}</strong>
                </Typography>
              </Box>

              {!isAssignedToMe ? (
                <Button
                  variant="contained"
                  startIcon={<AssignmentTurnedInIcon />}
                  onClick={handleTakeCase}
                  disabled={takingCase}
                  sx={{
                    bgcolor: "#2563eb",
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 3,
                    py: 1,
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  {takingCase ? "Accepting..." : "Accept Case"}
                </Button>
              ) : (
                <Chip
                  icon={<GavelIcon />}
                  label="You are handling this case"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 700, borderRadius: "8px", px: 1, py: 2.5 }}
                />
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Request Details */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: "12px", height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}>
                  Problem Description
                </Typography>
                <Typography variant="body1" sx={{ color: "#334155", whiteSpace: "pre-wrap", mb: 4, bgcolor: "#f8fafc", p: 2, borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  {client?.problem_description}
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}>
                  Additional Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Financial Status</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {client?.financial_status || "Not provided"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Employment Status</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {client?.employment_status || "Not provided"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Vulnerable Group</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {client?.vulnerable_group || "None"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Approved Budget</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#16a34a" }}>
                      ₹{budget}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Client Info */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: "12px", height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}>
                  Client Information
                </Typography>

                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#eff6ff", display: "grid", placeItems: "center" }}>
                      <PersonIcon sx={{ color: "#2563eb" }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Full Name</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {client?.full_name}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#eff6ff", display: "grid", placeItems: "center" }}>
                      <PhoneIcon sx={{ color: "#2563eb" }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Mobile Number</Typography>
                      {isAssignedToMe ? (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                          {client?.mobile}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ fontStyle: "italic", color: "#94a3b8" }}>
                          Hidden until accepted
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  <Divider />

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#eff6ff", display: "grid", placeItems: "center" }}>
                      <EmailIcon sx={{ color: "#2563eb" }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email Address</Typography>
                      {isAssignedToMe ? (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", wordBreak: "break-all" }}>
                          {client?.email || "N/A"}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ fontStyle: "italic", color: "#94a3b8" }}>
                          Hidden until accepted
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  <Divider />

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 40, height: 40, borderRadius: "50%", bgcolor: "#eff6ff", display: "grid", placeItems: "center" }}>
                      <HomeIcon sx={{ color: "#2563eb" }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Location</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {client?.state}, {client?.district}
                      </Typography>
                    </Box>
                  </Stack>

                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </PortalPageShell>
  );
}
