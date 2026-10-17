"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  Alert,
  Paper,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";

import PortalPageShell from "@/components/features/dashboard/layout/PortalPageShell";
import SectionCard from "@/components/ui/SectionCard";
import { leadMarketplaceService } from "@/services/professional/leadMarketplace.service";
import type { DetailedLead } from "@/types/lead";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<DetailedLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!leadId) return;
    setLoading(true);
    leadMarketplaceService
      .getLeadDetail(leadId)
      .then((data) => setLead(data))
      .catch((err) => setError(err?.message || "Failed to load lead details."))
      .finally(() => setLoading(false));
  }, [leadId]);

  if (loading) {
    return (
      <PortalPageShell title="Lead Details" subtitle="Loading inquiry...">
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      </PortalPageShell>
    );
  }

  if (error || !lead) {
    return (
      <PortalPageShell title="Lead Details" subtitle="Error loading lead">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Lead not found."}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/dashboard/professional/leads">
          Back to Marketplace
        </Button>
      </PortalPageShell>
    );
  }

  const isAccepted = Boolean(lead.client_name);

  return (
    <PortalPageShell
      title={`Lead: ${lead.lead_id}`}
      subtitle={`${lead.category} • ${lead.city_name}, ${lead.state_name}`}
    >
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          component={Link}
          href="/dashboard/professional/leads"
          sx={{ textTransform: "none", color: "#64748b" }}
        >
          Back to Lead Marketplace
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 3, alignItems: "start" }}>
        {/* Left Column: Matter Details & Client Info */}
        <Stack spacing={3}>
          {/* Confidential Client Contact Details (Unlocked if accepted) */}
          {isAccepted ? (
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2.5,
                bgcolor: "#f0fdf4",
                borderColor: "#86efac",
                p: 1,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
                  <LockOpenIcon sx={{ color: "#16a34a" }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#15803d" }}>
                      Client Contact Details (Unlocked)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Authorized contact information for this matter inquiry.
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <PersonIcon sx={{ color: "#64748b", fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">CLIENT NAME</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{lead.client_name}</Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <PhoneIcon sx={{ color: "#64748b", fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">PHONE NUMBER</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{lead.client_mobile || "Not Provided"}</Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <EmailIcon sx={{ color: "#64748b", fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">EMAIL ADDRESS</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{lead.client_email || "Not Provided"}</Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <ContactPhoneIcon sx={{ color: "#64748b", fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">PREFERRED CONTACT</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{lead.client_preferred_contact || "Phone"}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2.5,
                bgcolor: "#f8fafc",
                borderColor: "#e2e8f0",
                p: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <LockOutlinedIcon sx={{ color: "#94a3b8" }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155" }}>
                    Confidential Client Contact Information
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Client name, phone number, email, and exact location are protected by ICJ confidentiality policies.
                    They become immediately accessible once you accept this lead.
                  </Typography>
                </Box>
              </Stack>
            </Card>
          )}

          {/* Matter Description */}
          <SectionCard title="Legal Matter Description" subtitle="Problem statement submitted by client">
            <Typography variant="body1" sx={{ lineHeight: 1.7, color: "#1e293b", whiteSpace: "pre-line" }}>
              {lead.full_description || lead.anonymized_summary}
            </Typography>
          </SectionCard>
        </Stack>

        {/* Right Column: Lead Summary & Actions */}
        <SectionCard title="Lead Summary" noPadding>
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  LEAD ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "#2563eb" }}>
                  {lead.lead_id}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  CATEGORY
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                  {lead.category}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  URGENCY
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={lead.urgency}
                    size="small"
                    color={lead.urgency.toLowerCase() === "high" || lead.urgency.toLowerCase() === "critical" ? "error" : "warning"}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  LOCATION
                </Typography>
                <Typography variant="body2" sx={{ color: "#334155" }}>
                  {lead.city_name}, {lead.state_name}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  LEAD PRICE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  ₹{lead.price_inr.toLocaleString("en-IN")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inclusive of applicable GST / platform handling
                </Typography>
              </Box>

              <Divider />

              {isAccepted ? (
                <Alert severity="success" sx={{ fontSize: "0.8rem" }}>
                  You have accepted this lead. Receipt: <strong>{lead.acceptance_info?.receipt_reference}</strong>
                </Alert>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => router.push("/dashboard/professional/leads")}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Accept Lead in Marketplace
                </Button>
              )}
            </Stack>
          </Box>
        </SectionCard>
      </Box>
    </PortalPageShell>
  );
}
