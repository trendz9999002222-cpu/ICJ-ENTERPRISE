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
  Tabs,
  Tab,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PageHeader from "@/components/features/public/PageHeader";
import Pagination from "@/components/features/public/Pagination";
import EmptyState from "@/components/features/public/EmptyState";
import { knowledgeService } from "@/services/public";
import type { KnowledgeItem, PublicPaginatedResponse } from "@/types/public";

const CATEGORIES = [
  { label: "All Topics", value: "all" },
  { label: "Citizen FAQs", value: "Citizen FAQs" },
  { label: "Legal Forms & Checklists", value: "Legal Forms & Checklists" },
  { label: "Acts & Statutes", value: "Acts & Statutes" },
  { label: "Legal Articles", value: "Legal Articles" },
];

export default function KnowledgeCentrePage() {
  const [, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicPaginatedResponse<KnowledgeItem> | null>(null);

  // Read Modal
  const [activeItem, setActiveItem] = useState<KnowledgeItem | null>(null);

  useEffect(() => {
    setLoading(true);
    knowledgeService
      .listItems({
        category: selectedCategory,
        search: searchTerm,
        page,
        pageSize: 6,
      })
      .then((res) => {
        setData(res);
        setLoading(false);
      });
  }, [selectedCategory, searchTerm, page]);

  const handleCategoryChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    startTransition(() => {
      setSearchTerm(val);
      setPage(1);
    });
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="Citizen Knowledge Centre & Legal Digest"
        subtitle="Empowering citizens with actionable guides, procedural checklists, statutory simplifications, and constitutional rights walkthroughs."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Knowledge Centre" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Search and Category Filter */}
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
          <TextField
            fullWidth
            placeholder="Search guides, consumer FAQs, Acts (e.g. BNS, RERA, NALSA)..."
            value={searchTerm}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />

          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 44,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                minHeight: 44,
                px: 2,
              },
            }}
          >
            {CATEGORIES.map((cat) => (
              <Tab key={cat.value} label={cat.label} value={cat.value} />
            ))}
          </Tabs>
        </Card>

        {/* Knowledge Items Grid */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={40} />
          </Box>
        ) : !data || data.results.length === 0 ? (
          <EmptyState
            title="No Knowledge Guides Found"
            description="Try searching with a different term or browse across all topics."
            actionLabel="View All Guides"
            onAction={() => {
              setSelectedCategory("all");
              setSearchTerm("");
              setPage(1);
            }}
          />
        ) : (
          <>
            <Grid container spacing={3}>
              {data.results.map((item) => (
                <Grid size={{ xs: 12, md: 6 }} key={item.id}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3.5,
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
                        boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.08)",
                      },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{
                            bgcolor: "#eff6ff",
                            color: "#1d4ed8",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        />
                        <Chip
                          icon={<AccessTimeIcon sx={{ fontSize: "14px !important" }} />}
                          label={item.readingTime}
                          size="small"
                          variant="outlined"
                          sx={{ color: "#64748b", fontSize: "0.75rem" }}
                        />
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, lineHeight: 1.4 }}>
                        {item.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#475569",
                          lineHeight: 1.6,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 2.5,
                        }}
                      >
                        {item.summary}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}>
                        {item.tags.map((tag, i) => (
                          <Chip
                            key={i}
                            label={`#${tag}`}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: "#e2e8f0", color: "#64748b", fontSize: "0.7rem", my: 0.3 }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Box sx={{ pt: 2, borderTop: "1px solid #f1f5f9" }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<MenuBookIcon />}
                        onClick={() => setActiveItem(item)}
                        sx={{
                          py: 1.1,
                          textTransform: "none",
                          fontWeight: 700,
                          bgcolor: "#0f172a",
                          "&:hover": { bgcolor: "#1e293b" },
                        }}
                      >
                        Read Complete Citizen Guide
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Pagination
                currentPage={page}
                totalItems={data.count}
                pageSize={6}
                onPageChange={(newPage: number) => setPage(newPage)}
              />
            </Box>
          </>
        )}
      </Container>

      {/* Guide Read Modal */}
      <Dialog
        open={Boolean(activeItem)}
        onClose={() => setActiveItem(null)}
        maxWidth="md"
        fullWidth
      >
        {activeItem && (
          <>
            <DialogTitle sx={{ pb: 1, pt: 3, px: 3.5 }}>
              <Chip
                label={activeItem.category}
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, mb: 1 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                {activeItem.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5 }}>
                Estimated reading duration: {activeItem.readingTime} · Published by ICJ Citizen Literacy Desk
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ px: 3.5, py: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                Overview & Practical Summary:
              </Typography>
              <Typography variant="body1" sx={{ color: "#334155", lineHeight: 1.8, mb: 3 }}>
                {activeItem.summary}
              </Typography>

              <Box sx={{ bgcolor: "#f8fafc", p: 3, borderRadius: 2, border: "1px solid #e2e8f0", mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
                  Key Action Steps for Citizens:
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.7 }}>
                  1. Gather relevant documentary proof (invoices, receipts, correspondence).<br />
                  2. Verify the appropriate territorial and pecuniary jurisdiction.<br />
                  3. If you require legal aid representation, verify entitlement under Section 12 of NALSA Act or apply directly via our Citizen Assistance Portal.
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Associated Topic Tags:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mt: 1 }}>
                {activeItem.tags.map((t, i) => (
                  <Chip key={i} label={`#${t}`} size="small" variant="outlined" sx={{ my: 0.3 }} />
                ))}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3.5, pb: 3 }}>
              <Button
                variant="contained"
                onClick={() => setActiveItem(null)}
                sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#0f172a" }}
              >
                Close Guide
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
