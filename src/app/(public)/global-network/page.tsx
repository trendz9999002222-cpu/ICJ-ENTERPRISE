"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Chip,
  Stack,
  CircularProgress,
  Divider,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GavelIcon from "@mui/icons-material/Gavel";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from "@mui/icons-material/Public";
import PageHeader from "@/components/features/public/PageHeader";
import { chapterService } from "@/services/public";
import type { ChapterInfo } from "@/types/public";
import Link from "next/link";

export default function GlobalNetworkPage() {
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    chapterService.listChapters().then((data) => {
      setChapters(data);
      setLoading(false);
    });
  }, []);

  const filtered = search
    ? chapters.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.regionOrState.toLowerCase().includes(search.toLowerCase()) ||
          c.focusJurisdiction.toLowerCase().includes(search.toLowerCase())
      )
    : chapters;

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="Global & National Chapter Network"
        subtitle="A federated institutional presence across all major High Court jurisdictions in India, with affiliate chapters spanning international legal corridors."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Global Network" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {/* Stats Banner */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            { icon: <PublicIcon sx={{ color: "#2563eb", fontSize: 32 }} />, value: "12+", label: "Active Chapters" },
            { icon: <GavelIcon sx={{ color: "#059669", fontSize: 32 }} />, value: "18", label: "High Courts Covered" },
            { icon: <PersonIcon sx={{ color: "#7c3aed", fontSize: 32 }} />, value: "3,400+", label: "Enrolled Members" },
            { icon: <LocationOnIcon sx={{ color: "#d97706", fontSize: 32 }} />, value: "28", label: "States & UTs" },
          ].map((stat, idx) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={idx}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2.5,
                }}
              >
                <Box sx={{ mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            bgcolor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 2.5,
            mb: 4,
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by chapter name, state, or High Court jurisdiction..."
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
        </Card>

        {/* Chapters List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {filtered.map((chapter) => (
              <Grid size={{ xs: 12, md: 6 }} key={chapter.id}>
                <Card
                  elevation={0}
                  sx={{
                    p: 3.5,
                    height: "100%",
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 3,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "#2563eb",
                      boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.08)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                      <Chip
                        label={chapter.type}
                        size="small"
                        sx={{
                          bgcolor: chapter.type === "National Chapter" ? "#eff6ff" : "#f0fdf4",
                          color: chapter.type === "National Chapter" ? "#1d4ed8" : "#15803d",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          mb: 1,
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                        {chapter.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: "#f1f5f9" }} />

                  <Stack spacing={1.5}>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <LocationOnIcon sx={{ color: "#64748b", fontSize: 18, mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                          Region / States Covered
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                          {chapter.regionOrState}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <GavelIcon sx={{ color: "#64748b", fontSize: 18, mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                          Jurisdictions
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                          {chapter.focusJurisdiction}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                      <PersonIcon sx={{ color: "#64748b", fontSize: 18, mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                          Lead Coordinator
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                          {chapter.leadCoordinator}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Affiliate Chapter Application */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            bgcolor: "#0f172a",
            color: "#ffffff",
            borderRadius: 3,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <Box>
            <Chip
              label="CHAPTER FORMATION"
              size="small"
              sx={{ bgcolor: "rgba(37, 99, 235, 0.3)", color: "#93c5fd", fontWeight: 700, mb: 1.5 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Apply to Establish an ICJ Chapter
            </Typography>
            <Typography variant="body1" sx={{ color: "#94a3b8", maxWidth: 540, lineHeight: 1.6 }}>
              Institutions, bar councils, law schools, and practitioners may apply to establish an authorised ICJ chapter in their jurisdiction.
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
              px: 3.5,
              py: 1.3,
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            Contact Chapter Desk
          </Button>
        </Card>
      </Container>
    </Box>
  );
}
