"use client";

import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

import EmptyState from "@/components/features/public/EmptyState";
import PageHeader from "@/components/features/public/PageHeader";
import Pagination from "@/components/features/public/Pagination";
import ProfessionalCard from "@/components/features/public/ProfessionalCard";
import { professionalService } from "@/services/public";
import type { PublicProfessional } from "@/types/public";

export default function ProfessionalsDirectoryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [professionals, setProfessionals] = useState<PublicProfessional[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [profession, setProfession] = useState("all");
  const [selectedState, setSelectedState] = useState("All States");
  const [verificationStatus, setVerificationStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [experience, setExperience] = useState("all");
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [availableCategories, setAvailableCategories] = useState<{label: string, value: string}[]>([{label: "All Categories", value: "all"}]);
  const [availableProfessions, setAvailableProfessions] = useState<{label: string, value: string}[]>([{label: "All Practitioners", value: "all"}]);
  const [availableStates, setAvailableStates] = useState<string[]>(["All States"]);
  const [availableCities, setAvailableCities] = useState<string[]>(["All Cities"]);

  const loadFilters = async () => {
    try {
      const filters = await professionalService.getProfessionalsFilters();
      if (filters.categories && filters.categories.length > 0) {
        setAvailableCategories(filters.categories);
      }
      if (filters.professions && filters.professions.length > 0) {
        setAvailableProfessions(filters.professions);
      }
      if (filters.states && filters.states.length > 0) {
        setAvailableStates(filters.states);
      }
      if (filters.cities && filters.cities.length > 0) {
        setAvailableCities(filters.cities);
      }
    } catch (error) {
      console.error("Failed to load filters", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      let is_verified = undefined;
      if (verificationStatus === "verified") is_verified = true;
      if (verificationStatus === "unverified") is_verified = false;
      
      const res = await professionalService.listProfessionals({
        page,
        pageSize: 8,
        search: search.trim() || undefined,
        category: category !== "all" ? category : undefined,
        profession: profession !== "all" ? profession : undefined,
        state: selectedState !== "All States" ? selectedState : undefined,
        city: selectedCity !== "All Cities" ? selectedCity : undefined,
        experienceMin: experience !== "all" ? parseInt(experience, 10) : undefined,
        is_verified,
      });
      setProfessionals(res.results);
      setTotalCount(res.count);
    } catch {
      setProfessionals([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, search, category, profession, selectedState, selectedCity, verificationStatus, experience]);

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", pb: 8 }}>
      <PageHeader
        badge="Institutional Directory"
        title="Find a Verified Professional"
        subtitle="Search and connect with empaneled advocates, chartered accountants, company secretaries, and accredited mediators across state jurisdictions."
        breadcrumbs={[{ label: "Professionals" }]}
        primaryAction={{ label: "Empanel as a Professional", href: "/membership" }}
        secondaryAction={{ label: "Seek Direct Assistance", href: "/assistance" }}
      />

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 4 }}>
        {/* Filter Controls Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "flex-start", alignItems: { xs: "stretch", md: "center" }, flexWrap: "wrap", gap: 1 }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5, width: '100%' }}>
              
              {/* Category Filter Dropdown */}
              <FormControl size="small" sx={{ minWidth: 150, display: { xs: "none", sm: "block" }, m: '0 !important' }}>
                <Select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  sx={{ borderRadius: 2, fontSize: "0.85rem", bgcolor: "#f8fafc" }}
                >
                  {availableCategories.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Profession Filter Dropdown */}
              <FormControl size="small" sx={{ minWidth: 150, display: { xs: "none", sm: "block" }, m: '0 !important' }}>
                <Select
                  value={profession}
                  onChange={(e) => {
                    setProfession(e.target.value);
                    setPage(1);
                  }}
                  sx={{ borderRadius: 2, fontSize: "0.85rem", bgcolor: "#f8fafc" }}
                >
                  {availableProfessions.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* State Filter Dropdown */}
              <FormControl size="small" sx={{ minWidth: 150, display: { xs: "none", sm: "block" }, m: '0 !important' }}>
                <Select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity("All Cities"); // Reset city when state changes
                    setPage(1);
                  }}
                  sx={{ borderRadius: 2, fontSize: "0.85rem", bgcolor: "#f8fafc" }}
                >
                  {availableStates.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* City Filter Dropdown */}
              <FormControl size="small" sx={{ minWidth: 150, display: { xs: "none", sm: "block" }, m: '0 !important' }}>
                <Select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setPage(1);
                  }}
                  sx={{ borderRadius: 2, fontSize: "0.85rem", bgcolor: "#f8fafc" }}
                >
                  {availableCities.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Verification Filter */}
              <FormControl size="small" sx={{ minWidth: 120, display: { xs: "none", sm: "block" }, m: '0 !important' }}>
                <Select
                  value={verificationStatus}
                  onChange={(e) => {
                    setVerificationStatus(e.target.value);
                    setPage(1);
                  }}
                  sx={{ borderRadius: 2, fontSize: "0.85rem", bgcolor: "#f8fafc" }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="unverified">Unverified</MenuItem>
                </Select>
              </FormControl>

              {/* Experience Filter */}
              <FormControl size="small" sx={{ minWidth: 120, display: { xs: "none", sm: "block" }, m: '0 !important' }}>
                <Select
                  value={experience}
                  onChange={(e) => {
                    setExperience(e.target.value);
                    setPage(1);
                  }}
                  sx={{ borderRadius: 2, fontSize: "0.85rem", bgcolor: "#f8fafc" }}
                >
                  <MenuItem value="all">Any Exp.</MenuItem>
                  <MenuItem value="1">1+ Years</MenuItem>
                  <MenuItem value="3">3+ Years</MenuItem>
                  <MenuItem value="5">5+ Years</MenuItem>
                  <MenuItem value="10">10+ Years</MenuItem>
                  <MenuItem value="15">15+ Years</MenuItem>
                </Select>
              </FormControl>

              {/* Search Bar */}
              <TextField
                size="small"
                placeholder="Search name, city, specialisation..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                sx={{ m: '0 !important' }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, fontSize: "0.85rem", minWidth: { xs: "100%", md: 240 }, flexGrow: 1 },
                  },
                }}
              />

              {/* Mobile Filter Button */}
              {isMobile && (
                <IconButton
                  onClick={() => setMobileFilterOpen(true)}
                  sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
                >
                  <FilterListIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Paper>

        {/* Results Grid */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : professionals.length === 0 ? (
          <EmptyState
            title="No practitioners found"
            description="Try changing your search parameters or clearing active location filters."
            actionLabel="View All Practitioners"
            onAction={() => {
              setSearch("");
              setProfession("all");
              setSelectedState("All States");
              setPage(1);
            }}
          />
        ) : (
          <>
            <Grid container spacing={3}>
              {professionals.map((prof) => (
                <Grid key={prof.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <ProfessionalCard professional={prof} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalItems={totalCount}
              pageSize={8}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </Container>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        slotProps={{ paper: { sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, p: 3 } } }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Filter Practitioners
        </Typography>

        <Stack spacing={2.5}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              {availableCategories.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Verification Status</InputLabel>
            <Select
              label="Verification Status"
              value={verificationStatus}
              onChange={(e) => {
                setVerificationStatus(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="unverified">Unverified</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>State Jurisdiction</InputLabel>
            <Select
              label="State Jurisdiction"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity("All Cities"); // Reset city when state changes
                setPage(1);
              }}
            >
              {availableStates.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>City</InputLabel>
            <Select
              label="City"
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setPage(1);
              }}
            >
              {availableCities.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Experience</InputLabel>
            <Select
              label="Experience"
              value={experience}
              onChange={(e) => {
                setExperience(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="all">Any Exp.</MenuItem>
              <MenuItem value="1">1+ Years</MenuItem>
              <MenuItem value="3">3+ Years</MenuItem>
              <MenuItem value="5">5+ Years</MenuItem>
              <MenuItem value="10">10+ Years</MenuItem>
              <MenuItem value="15">15+ Years</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            onClick={() => setMobileFilterOpen(false)}
            sx={{ bgcolor: "#2563eb", fontWeight: 700, py: 1.25, borderRadius: 2 }}
          >
            Apply Filters
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}
