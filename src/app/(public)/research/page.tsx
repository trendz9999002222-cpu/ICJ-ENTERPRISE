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
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ArticleIcon from "@mui/icons-material/Article";
import PageHeader from "@/components/features/public/PageHeader";
import Pagination from "@/components/features/public/Pagination";
import EmptyState from "@/components/features/public/EmptyState";
import { researchService } from "@/services/public";
import type { ResearchPaper, PublicPaginatedResponse } from "@/types/public";
import Link from "next/link";

const CATEGORIES = [
  { label: "All Papers", value: "all" },
  { label: "Criminal Justice Reform", value: "Criminal Justice Reform" },
  { label: "Constitutional Law", value: "Constitutional Law" },
  { label: "Digital Courts & AI", value: "Digital Courts & AI" },
  { label: "Alternate Dispute Resolution", value: "Alternate Dispute Resolution" },
  { label: "Environmental Jurisprudence", value: "Environmental Jurisprudence" },
];

export default function ResearchPage() {
  const [, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicPaginatedResponse<ResearchPaper> | null>(null);

  // Read Manuscript Modal
  const [activePaper, setActivePaper] = useState<ResearchPaper | null>(null);
  const [copiedSnackbar, setCopiedSnackbar] = useState(false);

  useEffect(() => {
    setLoading(true);
    researchService
      .listPapers({
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

  const copyCitation = (paper: ResearchPaper) => {
    const citation = `${paper.authors.join(", ")} (${paper.publishedYear}). "${paper.title}". International Consortium of Jurists Research Series. DOI: 10.5555/icj.${paper.id}`;
    navigator.clipboard.writeText(citation);
    setCopiedSnackbar(true);
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      <PageHeader
        title="Judicial & Socio-Legal Research"
        subtitle="Authoritative peer-reviewed research papers, policy briefs, comparative legal analyses, and empirical studies on judicial modernization and citizen rights."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research Repository" },
        ]}
      />

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Search and Filters */}
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
            placeholder="Search papers by title, abstract, keyword, or author..."
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

        {/* Papers Grid */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={40} />
          </Box>
        ) : !data || data.results.length === 0 ? (
          <EmptyState
            title="No Research Papers Found"
            description="Try clearing your search query or selecting a different category."
            actionLabel="Reset Search"
            onAction={() => {
              setSelectedCategory("all");
              setSearchTerm("");
              setPage(1);
            }}
          />
        ) : (
          <>
            <Grid container spacing={3}>
              {data.results.map((paper) => (
                <Grid size={{ xs: 12, md: 6 }} key={paper.id}>
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
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                        <Chip
                          label={paper.category}
                          size="small"
                          sx={{
                            bgcolor: "#eff6ff",
                            color: "#1d4ed8",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        />
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                          Published: {paper.publishedYear}
                        </Typography>
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 1, lineHeight: 1.4 }}>
                        {paper.title}
                      </Typography>

                      <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 600, display: "block", mb: 2 }}>
                        By {paper.authors.join(", ")}
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
                        {paper.abstract}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}>
                        {paper.tags.map((kw, i) => (
                          <Chip
                            key={i}
                            label={kw}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: "#e2e8f0", color: "#64748b", fontSize: "0.7rem", my: 0.3 }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={1.5} sx={{ pt: 2, borderTop: "1px solid #f1f5f9" }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<MenuBookIcon />}
                        onClick={() => setActivePaper(paper)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          bgcolor: "#0f172a",
                          "&:hover": { bgcolor: "#1e293b" },
                        }}
                      >
                        Read Abstract & Digest
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copyCitation(paper)}
                        sx={{ textTransform: "none", fontWeight: 600, borderColor: "#cbd5e1" }}
                      >
                        Cite
                      </Button>
                    </Stack>
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

        {/* Call For Papers Banner */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            mt: 8,
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
          <Box sx={{ display: "flex", gap: 2.5, alignItems: "center" }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                bgcolor: "#eff6ff",
                color: "#2563eb",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ArticleIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                Call for Submissions: ICJ Journal of Law & Justice 2026
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                Submit original research manuscripts, case notes, and legislative commentaries for blind peer review.
              </Typography>
            </Box>
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
            Submit Manuscript
          </Button>
        </Card>
      </Container>

      {/* Manuscript Digest Dialog */}
      <Dialog
        open={Boolean(activePaper)}
        onClose={() => setActivePaper(null)}
        maxWidth="md"
        fullWidth
      >
        {activePaper && (
          <>
            <DialogTitle sx={{ pb: 1, pt: 3, px: 3.5 }}>
              <Chip
                label={activePaper.category}
                size="small"
                sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, mb: 1 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                {activePaper.title}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "#2563eb", mt: 0.5 }}>
                Authors: {activePaper.authors.join(", ")} · Published: {activePaper.publishedYear}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ px: 3.5, py: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                Executive Abstract:
              </Typography>
              <Typography variant="body1" sx={{ color: "#334155", lineHeight: 1.7, mb: 3 }}>
                {activePaper.abstract}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                Research Keywords & Ontologies:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 3 }}>
                {activePaper.tags.map((kw, i) => (
                  <Chip key={i} label={kw} size="small" variant="outlined" sx={{ my: 0.5 }} />
                ))}
              </Stack>

              <Alert severity="info" sx={{ bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                Full-text PDF repository manuscripts are open-access for educational and institutional research under Creative Commons CC-BY-NC 4.0.
              </Alert>
            </DialogContent>
            <DialogActions sx={{ px: 3.5, pb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => copyCitation(activePaper)}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Copy Citation
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={() => setActivePaper(null)}
                sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#0f172a" }}
              >
                Download PDF Preprint
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={copiedSnackbar}
        autoHideDuration={3000}
        onClose={() => setCopiedSnackbar(false)}
        message="Citation copied to clipboard!"
      />
    </Box>
  );
}
