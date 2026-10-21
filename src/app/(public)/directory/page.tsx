"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  TextField,
  InputAdornment,
  Chip,
  Button,
  CircularProgress,
  Stack,
  Divider,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import PageHeader from "@/components/features/public/PageHeader";
import Pagination from "@/components/features/public/Pagination";
import EmptyState from "@/components/features/public/EmptyState";
import { maskPublicProfessional, publicProfessionalInitials } from "@/lib/privacy/maskPublicIdentity";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import { professionalService } from "@/services/public";
import type { PublicProfessional, PublicPaginatedResponse } from "@/types/public";
import Link from "next/link";

const PROFESSION_FILTERS = [
  { label: "All Professionals", value: "all" },
  { label: "Advocate", value: "Advocate" },
  { label: "Chartered Accountant", value: "Chartered Accountant" },
  { label: "Company Secretary", value: "Company Secretary" },
  { label: "Mediator", value: "Mediator" },
  { label: "Arbitrator", value: "Arbitrator" },
];

export default function DirectoryPage() {
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [profession, setProfession] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicPaginatedResponse<PublicProfessional> | null>(null);

  useEffect(() => {
    setLoading(true);
    professionalService
      .listProfessionals({ search, profession, page, pageSize: 12 })
      .then((res) => {
        setData(res);
        setLoading(false);
      });
  }, [search, profession, page]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    startTransition(() => {
      setSearch(val);
      setPage(1);
    });
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="ICJ Verified Practitioner Registry"
        subtitle="Publicly searchable directory of all ICJ-verified advocates, chartered accountants, company secretaries, mediators, and arbitrators."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Directory" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Filters */}
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
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                placeholder="Search by name, specialisation, city, or registration ID..."
                value={search}
                onChange={handleSearch}
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
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <FilterListIcon sx={{ color: "#94a3b8", flexShrink: 0 }} />
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  {PROFESSION_FILTERS.map((f) => (
                    <Chip
                      key={f.value}
                      label={f.label === "All Professionals" ? "All" : f.label.split(" ")[0]}
                      onClick={() => {
                        setProfession(f.value);
                        setPage(1);
                      }}
                      size="small"
                      sx={{
                        bgcolor: profession === f.value ? "#0f172a" : "#f1f5f9",
                        color: profession === f.value ? "#ffffff" : "#334155",
                        fontWeight: 700,
                        my: 0.3,
                        "&:hover": { bgcolor: profession === f.value ? "#1e293b" : "#e2e8f0" },
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Results Grid */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={40} />
          </Box>
        ) : !data || data.results.length === 0 ? (
          <EmptyState
            title="No Practitioners Found"
            description="Adjust your search or profession filters to find verified professionals."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearch("");
              setProfession("all");
              setPage(1);
            }}
          />
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Showing <strong>{data.results.length}</strong> of <strong>{data.count}</strong> registered professionals
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              {data.results.map((prof) => {
                const display = maskPublicProfessional(prof);
                return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={prof.id}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 2.5,
                      height: "100%",
                      bgcolor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 2.5,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#2563eb",
                        boxShadow: "0 6px 20px -5px rgba(37, 99, 235, 0.1)",
                      },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}>
                        <Avatar
                          src={resolveMediaUrl(prof.photoUrl) || undefined}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "#0f172a",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            flexShrink: 0,
                          }}
                        >
                          {publicProfessionalInitials(display.fullName)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                            <Typography sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                              {display.fullName}
                            </Typography>
                            {prof.isVerified && (
                              <VerifiedIcon sx={{ color: "#2563eb", fontSize: 16, flexShrink: 0 }} />
                            )}
                          </Box>
                          <Chip
                            label={prof.profession}
                            size="small"
                            sx={{
                              bgcolor: "#eff6ff",
                              color: "#1d4ed8",
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              height: 20,
                            }}
                          />
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1.5, borderColor: "#f1f5f9" }} />

                      <Stack spacing={0.8} sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <LocationOnIcon sx={{ color: "#94a3b8", fontSize: 14 }} />
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            {prof.city}, {prof.state}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <WorkIcon sx={{ color: "#94a3b8", fontSize: 14 }} />
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            {prof.experienceYears} yrs · {display.barOrRegNumber || "ICJ Verified"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                        {prof.specialisations.slice(0, 2).map((sp, i) => (
                          <Chip
                            key={i}
                            label={sp}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: "#e2e8f0", color: "#64748b", fontSize: "0.68rem", my: 0.2 }}
                          />
                        ))}
                        {prof.specialisations.length > 2 && (
                          <Chip
                            label={`+${prof.specialisations.length - 2}`}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: "#e2e8f0", color: "#94a3b8", fontSize: "0.68rem" }}
                          />
                        )}
                      </Stack>
                    </Box>

                    <Button
                      component={Link}
                      href={`/professionals/${prof.id}`}
                      variant="outlined"
                      fullWidth
                      size="small"
                      sx={{
                        mt: 2,
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: "#cbd5e1",
                        color: "#0f172a",
                        "&:hover": { borderColor: "#2563eb", color: "#2563eb" },
                      }}
                    >
                      View Profile
                    </Button>
                  </Card>
                </Grid>
                );
              })}
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Pagination
                currentPage={page}
                totalItems={data.count}
                pageSize={12}
                onPageChange={(newPage: number) => setPage(newPage)}
              />
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
