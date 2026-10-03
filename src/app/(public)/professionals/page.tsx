"use client";

import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
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
  Tab,
  Tabs,
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
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [availableProfessions, setAvailableProfessions] = useState<{label: string, value: string}[]>([{label: "All Practitioners", value: "all"}]);
  const [availableStates, setAvailableStates] = useState<string[]>(["All States"]);

  const loadFilters = async () => {
    try {
      const filters = await professionalService.getProfessionalsFilters();
      if (filters.professions && filters.professions.length > 0) {
        setAvailableProfessions(filters.professions);
      }
      if (filters.states && filters.states.length > 0) {
        setAvailableStates(filters.states);
      }
    } catch (error) {
      console.error("Failed to load filters", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await professionalService.listProfessionals({
        page,
        pageSize: 8,
        search: search.trim() || undefined,
        profession: profession !== "all" ? profession : undefined,
        state: selectedState !== "All States" ? selectedState : undefined,
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
  }, [page, search, profession, selectedState]);

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
            sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" } }}
          >
            {/* Desktop Profession Tabs */}
            <Tabs
              value={profession}
              onChange={(_, v) => {
                setProfession(v);
                setPage(1);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  minHeight: 40,
                  px: 1.75,
                },
              }}
            >
              {availableProfessions.map((p) => (
                <Tab key={p.value} label={p.label} value={p.value} />
              ))}
            </Tabs>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              {/* State Filter Dropdown */}
              <FormControl size="small" sx={{ minWidth: 150, display: { xs: "none", sm: "block" } }}>
                <Select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
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

              {/* Search Bar */}
              <TextField
                size="small"
                placeholder="Search name, city, specialisation..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, fontSize: "0.85rem", minWidth: { xs: "100%", md: 240 } },
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
            <InputLabel>State Jurisdiction</InputLabel>
            <Select
              label="State Jurisdiction"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
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
