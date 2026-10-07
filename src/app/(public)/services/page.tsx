"use client";

import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import EmptyState from "@/components/features/public/EmptyState";
import PageHeader from "@/components/features/public/PageHeader";
import Pagination from "@/components/features/public/Pagination";
import ServiceCard from "@/components/features/public/ServiceCard";
import { serviceService } from "@/services/public";
import type { JusticeService } from "@/types/public";

export default function ServicesCatalogPage() {
  const [services, setServices] = useState<JusticeService[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([
    { label: "All Services", value: "all" },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await serviceService.listServices({
        page,
        pageSize: 9,
        search: search.trim() || undefined,
        category: selectedCategory,
      });
      setServices(res.results);
      setTotalCount(res.count);
    } catch {
      setServices([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    serviceService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    loadData();
  }, [page, search, selectedCategory]);

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", pb: 8 }}>
      <PageHeader
        badge="Citizen & Institutional Catalog"
        title="Justice & Legal Services"
        subtitle="Explore structured legal information, specialized legal guidance, alternative dispute resolution, and public welfare assistance across 18+ domains."
        breadcrumbs={[{ label: "Justice Services" }]}
        primaryAction={{ label: "Seek Direct Assistance", href: "/assistance" }}
        secondaryAction={{ label: "Find a Professional", href: "/professionals" }}
      />

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 4 }}>
        {/* Search & Filter Bar */}
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
            {/* Category Tabs */}
            <Tabs
              value={selectedCategory}
              onChange={(_, v) => {
                setSelectedCategory(v);
                setPage(1);
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  minHeight: 42,
                  px: 2,
                },
              }}
            >
              {categories.map((c) => (
                <Tab key={c.value} label={c.label} value={c.value} />
              ))}
            </Tabs>

            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search services (e.g. property, consumer, tax)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2, minWidth: { xs: "100%", md: 280 }, fontSize: "0.875rem" },
                },
              }}
            />
          </Stack>
        </Paper>

        {/* Results Grid */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : services.length === 0 ? (
          <EmptyState
            title="No matching services found"
            description="Try changing your search keywords or choosing a different service category."
            actionLabel="View All Services"
            onAction={() => {
              setSearch("");
              setSelectedCategory("all");
              setPage(1);
            }}
          />
        ) : (
          <>
            <Grid container spacing={3}>
              {services.map((service) => (
                <Grid key={service.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ServiceCard service={service} />
                </Grid>
              ))}
            </Grid>

            {/* Reusable Responsive Pagination */}
            <Pagination
              currentPage={page}
              totalItems={totalCount}
              pageSize={9}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </Container>
    </Box>
  );
}
