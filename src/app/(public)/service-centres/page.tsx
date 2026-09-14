"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PageHeader from "@/components/features/public/PageHeader";
import Link from "next/link";

const SERVICE_CENTRES = [
  {
    id: "sc-1",
    name: "ICJ North Delhi Legal Aid Centre",
    type: "Legal Aid Clinic",
    address: "Room 12, District Courts Complex, Tis Hazari, Delhi — 110054",
    phone: "+91-11-2399-5001",
    email: "north.delhi@icj-india.org",
    hours: "Mon – Sat: 10:00 AM – 5:00 PM",
    services: ["Legal Literacy", "Pro Bono Consultation", "Form Filing Assistance"],
    state: "Delhi",
  },
  {
    id: "sc-2",
    name: "ICJ Mumbai Consumer Rights Clinic",
    type: "Consumer Rights Clinic",
    address: "102, Bharat Sadan, Fort, Mumbai — 400001",
    phone: "+91-22-2284-9002",
    email: "mumbai@icj-india.org",
    hours: "Mon – Fri: 9:30 AM – 5:30 PM",
    services: ["Consumer Complaints", "RERA Advisory", "E-Daakhil Filing"],
    state: "Maharashtra",
  },
  {
    id: "sc-3",
    name: "ICJ Bengaluru Women's Legal Empowerment Centre",
    type: "Women's Justice Centre",
    address: "No. 45, Brigade Road, Bengaluru — 560025",
    phone: "+91-80-4112-5003",
    email: "bengaluru@icj-india.org",
    hours: "Mon – Sat: 10:00 AM – 4:30 PM",
    services: ["Matrimonial Legal Aid", "POSH Advisory", "Maintenance Filing"],
    state: "Karnataka",
  },
  {
    id: "sc-4",
    name: "ICJ Kolkata Senior Citizens' Legal Clinic",
    type: "Senior Citizen Centre",
    address: "22 B.B.D. Bagh, Kolkata — 700001",
    phone: "+91-33-2248-9004",
    email: "kolkata@icj-india.org",
    hours: "Mon – Fri: 10:00 AM – 3:00 PM",
    services: ["Maintenance Tribunal Filing", "Property Advisory", "Will Validation"],
    state: "West Bengal",
  },
  {
    id: "sc-5",
    name: "ICJ Chennai Alternative Dispute Resolution Hub",
    type: "ADR & Mediation Centre",
    address: "Floor 3, Apex Chambers, Mount Road, Chennai — 600002",
    phone: "+91-44-4216-9005",
    email: "chennai@icj-india.org",
    hours: "Mon – Sat: 9:00 AM – 6:00 PM",
    services: ["Commercial Mediation", "Family Dispute Resolution", "Arbitration Registry"],
    state: "Tamil Nadu",
  },
  {
    id: "sc-6",
    name: "ICJ Ahmedabad MSME Legal Assistance Desk",
    type: "MSME & Business Legal Desk",
    address: "Wing C, Gujarat Chamber of Commerce, Ashram Road, Ahmedabad — 380009",
    phone: "+91-79-2658-8006",
    email: "ahmedabad@icj-india.org",
    hours: "Mon – Fri: 9:30 AM – 5:00 PM",
    services: ["GST Dispute Guidance", "Contract Drafting Review", "Labour Law Advisory"],
    state: "Gujarat",
  },
];

const STATES = ["All States", ...Array.from(new Set(SERVICE_CENTRES.map((sc) => sc.state))).sort()];
const TYPES = ["All Types", ...Array.from(new Set(SERVICE_CENTRES.map((sc) => sc.type))).sort()];

export default function ServiceCentresPage() {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedType, setSelectedType] = useState("All Types");

  const filtered = SERVICE_CENTRES.filter((sc) => {
    const matchSearch =
      !search ||
      sc.name.toLowerCase().includes(search.toLowerCase()) ||
      sc.address.toLowerCase().includes(search.toLowerCase());
    const matchState = selectedState === "All States" || sc.state === selectedState;
    const matchType = selectedType === "All Types" || sc.type === selectedType;
    return matchSearch && matchState && matchType;
  });

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="ICJ Authorised Service Centres & Legal Aid Clinics"
        subtitle="Locate the nearest ICJ authorised legal aid clinic, consumer rights desk, women's justice centre, or ADR hub in your city."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Service Centres" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Filter Bar */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 2.5,
            mb: 4,
          }}
        >
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Search by centre name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Filter by State"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                {STATES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Filter by Centre Type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Card>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Showing <strong>{filtered.length}</strong> service centre{filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 8 }}>
          {filtered.length === 0 ? (
            <Grid size={12}>
              <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8" }}>
                <LocationOnIcon sx={{ fontSize: 52, mb: 1 }} />
                <Typography sx={{ fontWeight: 700 }}>No Service Centres Found</Typography>
                <Typography variant="body2">Try a different state, centre type, or clear your search.</Typography>
              </Box>
            </Grid>
          ) : (
            filtered.map((sc) => (
              <Grid size={{ xs: 12, md: 6 }} key={sc.id}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3.5,
                    height: "100%",
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "#2563eb",
                      boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.08)",
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={sc.type}
                        size="small"
                        sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "0.75rem", mb: 1 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                        {sc.name}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={1.2} sx={{ mb: 2.5 }}>
                      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                        <LocationOnIcon sx={{ color: "#64748b", fontSize: 16, mt: 0.2 }} />
                        <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.5 }}>
                          {sc.address}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                        <PhoneIcon sx={{ color: "#64748b", fontSize: 16 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                          {sc.phone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                        <EmailIcon sx={{ color: "#64748b", fontSize: 16 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                          {sc.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                        <AccessTimeIcon sx={{ color: "#64748b", fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                          {sc.hours}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Services Offered:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mt: 1 }}>
                      {sc.services.map((svc, i) => (
                        <Chip
                          key={i}
                          label={svc}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: "#e2e8f0", color: "#475569", fontSize: "0.75rem", my: 0.3 }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Button
                    component={Link}
                    href="/assistance"
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 3,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: "#0f172a",
                      "&:hover": { bgcolor: "#1e293b" },
                    }}
                  >
                    Request Centre Appointment
                  </Button>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Application Banner */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            bgcolor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 3,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Apply to Open an ICJ Authorised Service Centre
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Bar associations, law schools, and civic institutions may apply for authorisation to operate legal aid clinics under the ICJ charter.
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/contact"
            variant="contained"
            sx={{
              bgcolor: "#2563eb",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1,
              whiteSpace: "nowrap",
            }}
          >
            Apply for Authorisation
          </Button>
        </Card>
      </Container>
    </Box>
  );
}
