import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Chip,
  Stack,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GavelIcon from "@mui/icons-material/Gavel";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import FilterListIcon from "@mui/icons-material/FilterList";

import PrecedentSearchService from "../services/precedentSearchService";
import HighCourtPrecedentService from "../services/highCourtPrecedentService";
import { SUPREME_COURT_JUDGMENTS_MASTER, PRECEDENT_STATUS } from "../data/masters/supremeCourtJudgmentsMaster";
import { ALL_INDIA_25_HIGH_COURTS } from "../data/masters/highCourtsMasterRegistry";
import { CENTRAL_ACTS_MASTER_REGISTRY } from "../data/masters/centralActsMasterRegistry";
import CaseLawPeekDrawer from "../components/legal-reader/CaseLawPeekDrawer";

export default function PrecedentsLibrary() {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [benchFilter, setBenchFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("");

  // 25 High Courts Tab States
  const [hcSelectedCode, setHcSelectedCode] = useState("ALL");
  const [hcSearchQuery, setHcSearchQuery] = useState("");
  const [hcDomainFilter, setHcDomainFilter] = useState("ALL");

  // Section-wise Precedent Search Tab
  const [selectedActId, setSelectedActId] = useState("ACT_BNSS_2023");
  const [selectedSecNo, setSelectedSecNo] = useState("482");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filtered Judgments
  const filteredJudgments = useMemo(() => {
    return PrecedentSearchService.searchJudgments({
      search: searchQuery,
      domain: domainFilter,
      bench: benchFilter,
      year: yearFilter,
    });
  }, [searchQuery, domainFilter, benchFilter, yearFilter]);

  // Constitution Bench Rulings
  const constitutionBenchJudgments = useMemo(() => {
    return SUPREME_COURT_JUDGMENTS_MASTER.filter(
      (j) => j.precedent_status === PRECEDENT_STATUS.CONSTITUTION_BENCH
    );
  }, []);

  // Section specific judgments
  const sectionJudgments = useMemo(() => {
    return PrecedentSearchService.getJudgmentsForSection(selectedActId, selectedSecNo);
  }, [selectedActId, selectedSecNo]);

  // 25 High Courts Filtered Judgments
  const filteredHighCourtJudgments = useMemo(() => {
    return HighCourtPrecedentService.searchHighCourtJudgments({
      hc_code: hcSelectedCode,
      search: hcSearchQuery,
      domain: hcDomainFilter,
    });
  }, [hcSelectedCode, hcSearchQuery, hcDomainFilter]);

  const handleOpenPeek = (caseItem) => {
    setSelectedCase(caseItem);
    setDrawerOpen(true);
  };

  const handleCopyCitationOnly = (caseItem) => {
    const text = PrecedentSearchService.formatCourtCitation(caseItem);
    navigator.clipboard.writeText(text);
    setCopiedId(caseItem.case_id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Top Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <AccountBalanceIcon sx={{ fontSize: 32, color: "#a5b4fc" }} />
            <Typography variant="h4" fontWeight="bold" sx={{ color: "#ffffff" }}>
              Supreme Court 1950–2026 e-SCR Case Law & Precedent Engine
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "#c7d2fe" }}>
            Official Electronic Citations (INSC, SCR, SCC, AIR) • Legal Ratio Decidendi • AI Headnotes • Bidirectional Bare Act Section Linking
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: "16px !important", color: "#86efac !important" }} />}
            label="e-SCR Public Domain Sync"
            size="small"
            sx={{ bgcolor: "rgba(34, 197, 94, 0.2)", color: "#86efac", fontWeight: 600 }}
          />
          <Chip
            label={`${SUPREME_COURT_JUDGMENTS_MASTER.length} Landmark Precedents`}
            size="small"
            sx={{ bgcolor: "rgba(255, 255, 255, 0.15)", color: "#ffffff", fontWeight: 600 }}
          />
        </Stack>
      </Paper>

      {/* Main Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", mb: 3, bgcolor: "#ffffff" }}>
        <Tabs
          value={currentTab}
          onChange={(_, v) => setCurrentTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem", py: 2 },
          }}
        >
          <Tab icon={<LibraryBooksIcon />} iconPosition="start" label={`Supreme Court Precedents (${filteredJudgments.length})`} />
          <Tab icon={<GavelIcon />} iconPosition="start" label={`25 State High Courts (${ALL_INDIA_25_HIGH_COURTS.length} HCs • ${filteredHighCourtJudgments.length})`} />
          <Tab icon={<AccountBalanceIcon />} iconPosition="start" label={`Constitution Bench Decisions (${constitutionBenchJudgments.length})`} />
          <Tab icon={<SearchIcon />} iconPosition="start" label="Search Precedents by Statutory Section" />
        </Tabs>
      </Paper>

      {/* ========================================================================= */}
      {/* TAB 0: ALL PRECEDENTS SEARCH                                              */}
      {/* ========================================================================= */}
      {currentTab === 0 && (
        <Box>
          {/* Search & Filter Controls */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by party name, citation (e.g. 2022 INSC 690), keyword, or legal ratio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Legal Domain</InputLabel>
                  <Select
                    value={domainFilter}
                    label="Legal Domain"
                    onChange={(e) => setDomainFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Legal Domains</MenuItem>
                    <MenuItem value="Criminal Law & Procedure">Criminal Law & Procedure</MenuItem>
                    <MenuItem value="Constitutional & Administrative Law">Constitutional & Administrative</MenuItem>
                    <MenuItem value="Banking, Negotiable Instruments & Finance">Banking & Section 138 NI Act</MenuItem>
                    <MenuItem value="Civil Law & Procedure">Civil Law & Procedure</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Bench Strength</InputLabel>
                  <Select
                    value={benchFilter}
                    label="Bench Strength"
                    onChange={(e) => setBenchFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Benches</MenuItem>
                    <MenuItem value="Constitution">Constitution Bench</MenuItem>
                    <MenuItem value="Three-Judge">3-Judge Bench</MenuItem>
                    <MenuItem value="Division">Division Bench (2 Judges)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Year (e.g. 2022)"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Judgment Cards Grid */}
          <Grid container spacing={3}>
            {filteredJudgments.map((caseItem) => (
              <Grid item xs={12} md={6} key={caseItem.case_id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderColor: "#e2e8f0",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(49, 46, 129, 0.08)",
                      borderColor: "#a5b4fc",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Box sx={{ maxWidth: "75%" }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#1e1b4b", lineHeight: 1.3 }}>
                          {caseItem.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.3 }}>
                          {caseItem.cause_title}
                        </Typography>
                      </Box>
                      <Chip
                        label={caseItem.official_citation}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ my: 1.5 }} flexWrap="wrap" useFlexGap>
                      {caseItem.parallel_citations?.slice(0, 2).map((cite) => (
                        <Chip
                          key={cite}
                          label={cite}
                          size="small"
                          variant="outlined"
                          sx={{ bgcolor: "#f8fafc", borderColor: "#cbd5e1", fontSize: "0.7rem" }}
                        />
                      ))}
                      <Chip
                        label={caseItem.bench_strength}
                        size="small"
                        sx={{ bgcolor: "#fdf4ff", color: "#86198f", fontSize: "0.7rem", fontWeight: 600 }}
                      />
                    </Stack>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        my: 1.5,
                        bgcolor: "#f8fafc",
                        borderLeft: "3px solid #312e81",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                        Ratio Decidendi:
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#1e293b", fontSize: "0.85rem", lineHeight: 1.6, mt: 0.3 }}>
                        {caseItem.ratio_decidendi_en?.substring(0, 180)}...
                      </Typography>
                    </Paper>

                    {/* Linked Sections Badges */}
                    {caseItem.linked_sections?.length > 0 && (
                      <Stack direction="row" spacing={0.8} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                        {caseItem.linked_sections.slice(0, 4).map((sec, idx) => (
                          <Chip
                            key={idx}
                            label={`Sec. ${sec.section_number} (${sec.act_id.replace("ACT_", "")})`}
                            size="small"
                            sx={{ bgcolor: "#eff6ff", color: "#1e40af", fontSize: "0.7rem", fontWeight: 600 }}
                          />
                        ))}
                      </Stack>
                    )}
                  </CardContent>

                  <Divider />

                  <Box sx={{ p: 2, bgcolor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Button
                      size="small"
                      startIcon={copiedId === caseItem.case_id ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                      onClick={() => handleCopyCitationOnly(caseItem)}
                      sx={{ textTransform: "none", fontSize: "0.75rem", color: "#475569" }}
                    >
                      {copiedId === caseItem.case_id ? "Copied!" : "Copy Citation"}
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      onClick={() => handleOpenPeek(caseItem)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        bgcolor: "#312e81",
                        "&:hover": { bgcolor: "#1e1b4b" },
                      }}
                    >
                      View Ratio & Precedent
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: 25 STATE HIGH COURTS JURISPRUDENCE                                 */}
      {/* ========================================================================= */}
      {currentTab === 1 && (
        <Box>
          {/* High Courts Filter Bar */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select High Court (All 25 States)</InputLabel>
                  <Select
                    value={hcSelectedCode}
                    label="Select High Court (All 25 States)"
                    onChange={(e) => setHcSelectedCode(e.target.value)}
                  >
                    <MenuItem value="ALL">All 25 High Courts of India ({ALL_INDIA_25_HIGH_COURTS.length})</MenuItem>
                    {ALL_INDIA_25_HIGH_COURTS.map((hc) => (
                      <MenuItem key={hc.hc_code} value={hc.hc_code}>
                        [{hc.hc_code}] {hc.name_en} ({hc.principal_bench})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Neutral Citation (e.g. 2024:DHC:1520), party, or keyword..."
                  value={hcSearchQuery}
                  onChange={(e) => setHcSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Legal Domain</InputLabel>
                  <Select
                    value={hcDomainFilter}
                    label="Legal Domain"
                    onChange={(e) => setHcDomainFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Legal Domains</MenuItem>
                    <MenuItem value="Criminal Law & Procedure">Criminal Law & Procedure</MenuItem>
                    <MenuItem value="Civil Law & Procedure">Civil Law & Procedure</MenuItem>
                    <MenuItem value="Constitutional & Administrative Law">Constitutional & Administrative</MenuItem>
                    <MenuItem value="Banking, Negotiable Instruments & Finance">Banking & Section 138</MenuItem>
                    <MenuItem value="Arbitration & Alternative Dispute Resolution (ADR)">Arbitration & ADR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* High Court Judgments Grid */}
          <Grid container spacing={3}>
            {filteredHighCourtJudgments.map((caseItem) => (
              <Grid item xs={12} md={6} key={caseItem.case_id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderColor: "#e2e8f0",
                    "&:hover": { boxShadow: "0 8px 24px rgba(5, 150, 105, 0.08)", borderColor: "#6ee7b7" },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Box sx={{ maxWidth: "75%" }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#064e3b", lineHeight: 1.3 }}>
                          {caseItem.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.3 }}>
                          {caseItem.court_name} ({caseItem.bench_location}) • {caseItem.case_number}
                        </Typography>
                      </Box>
                      <Chip
                        label={caseItem.neutral_citation}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ my: 1.5 }} flexWrap="wrap" useFlexGap>
                      <Chip
                        label={caseItem.legal_domain}
                        size="small"
                        sx={{ bgcolor: "#ecfdf5", color: "#047857", fontWeight: 600, fontSize: "0.7rem" }}
                      />
                      <Chip
                        label={caseItem.disposal_nature}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", borderColor: "#a7f3d0", color: "#065f46", fontWeight: 600 }}
                      />
                    </Stack>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        my: 1.5,
                        bgcolor: "#f8fafc",
                        borderLeft: "3px solid #059669",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                        Ratio Decidendi:
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#1e293b", fontSize: "0.85rem", lineHeight: 1.6, mt: 0.3 }}>
                        {caseItem.ratio_decidendi_en}
                      </Typography>
                    </Paper>

                    {/* Linked Sections */}
                    {caseItem.linked_sections?.length > 0 && (
                      <Stack direction="row" spacing={0.8} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                        {caseItem.linked_sections.map((sec, idx) => (
                          <Chip
                            key={idx}
                            label={`Sec. ${sec.section_number} (${sec.act_id.replace("ACT_", "")})`}
                            size="small"
                            sx={{ bgcolor: "#eff6ff", color: "#1e40af", fontSize: "0.7rem", fontWeight: 600 }}
                          />
                        ))}
                      </Stack>
                    )}
                  </CardContent>

                  <Divider />

                  <Box sx={{ p: 2, bgcolor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Button
                      size="small"
                      startIcon={copiedId === caseItem.case_id ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                      onClick={() => {
                        const citation = HighCourtPrecedentService.formatHighCourtCitation(caseItem);
                        navigator.clipboard.writeText(citation);
                        setCopiedId(caseItem.case_id);
                        setTimeout(() => setCopiedId(null), 2500);
                      }}
                      sx={{ textTransform: "none", fontSize: "0.75rem", color: "#475569" }}
                    >
                      {copiedId === caseItem.case_id ? "Copied!" : "Copy Neutral Citation"}
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      onClick={() => handleOpenPeek({
                        ...caseItem,
                        official_citation: caseItem.neutral_citation,
                        bench_strength: `${caseItem.court_name} (${caseItem.bench_location})`,
                      })}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        bgcolor: "#064e3b",
                        "&:hover": { bgcolor: "#065f46" },
                      }}
                    >
                      View HC Ruling
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONSTITUTION BENCH DECISIONS                                       */}
      {/* ========================================================================= */}
      {currentTab === 2 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Constitution Benches of the Supreme Court of India (5, 7, 9, 13 Judges)
            </Typography>
            <Typography variant="body2">
              Authoritative interpretations of the Constitution of India and binding legal doctrines under Article 141.
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {constitutionBenchJudgments.map((caseItem) => (
              <Grid item xs={12} key={caseItem.case_id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    borderColor: "#d8b4fe",
                    borderLeft: "4px solid #7e22ce",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: "#4c1d95" }}>
                        {caseItem.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#71717a" }}>
                        {caseItem.cause_title} • Decided on {caseItem.judgment_date}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Chip label={caseItem.official_citation} color="secondary" size="small" sx={{ fontWeight: 700 }} />
                      <Chip label={caseItem.bench_strength} size="small" sx={{ bgcolor: "#f3e8ff", color: "#6b21a8", fontWeight: 600 }} />
                    </Stack>
                  </Stack>

                  <Paper variant="outlined" sx={{ p: 2, my: 2, bgcolor: "#faf5ff", borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: "#6b21a8", textTransform: "uppercase" }}>
                      Constitutional Principle & Ratio Decidendi:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#1e293b", mt: 0.5, lineHeight: 1.8 }}>
                      {caseItem.ratio_decidendi_en}
                    </Typography>
                    {caseItem.ratio_decidendi_hi && (
                      <Typography variant="body2" sx={{ color: "#581c87", mt: 1, fontWeight: 500 }}>
                        {caseItem.ratio_decidendi_hi}
                      </Typography>
                    )}
                  </Paper>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="caption" sx={{ color: "#475569" }}>
                      Coram: {caseItem.coram.join(" • ")}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenPeek(caseItem)}
                      sx={{ textTransform: "none", borderRadius: 2, bgcolor: "#7e22ce", "&:hover": { bgcolor: "#6b21a8" } }}
                    >
                      Read Full Precedent
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SEARCH PRECEDENTS BY STATUTORY SECTION                             */}
      {/* ========================================================================= */}
      {currentTab === 3 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#0f172a", mb: 1 }}>
            Find Authoritative Supreme Court Judgments on any Specific Section
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select any Act and enter the Section Number to immediately retrieve leading rulings on that provision.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Statute / Act</InputLabel>
                <Select
                  value={selectedActId}
                  label="Select Statute / Act"
                  onChange={(e) => setSelectedActId(e.target.value)}
                >
                  {CENTRAL_ACTS_MASTER_REGISTRY.map((act) => (
                    <MenuItem key={act.act_id} value={act.act_id}>
                      {act.short_title_en}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Section Number (e.g. 482, 138, 21)"
                value={selectedSecNo}
                onChange={(e) => setSelectedSecNo(e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Results on selected section */}
          {sectionJudgments.length > 0 ? (
            <Stack spacing={2}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#1e3a8a" }}>
                Found {sectionJudgments.length} Landmark Supreme Court Rulings on Section {selectedSecNo} [{selectedActId}]:
              </Typography>

              {sectionJudgments.map((caseItem) => (
                <Paper
                  key={caseItem.case_id}
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    borderLeft: "4px solid #2563eb",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#1e3a8a" }}>
                        {caseItem.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {caseItem.official_citation} • {caseItem.bench_strength}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenPeek(caseItem)}
                      sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                      View Precedent
                    </Button>
                  </Stack>

                  <Typography variant="body2" sx={{ color: "#334155", mt: 1.5, lineHeight: 1.7 }}>
                    {caseItem.ratio_decidendi_en}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                No direct landmark rulings indexed for Section {selectedSecNo} in {selectedActId}. Try searching for <strong>482</strong> (Bail), <strong>138</strong> (Cheque), <strong>103</strong> (Murder), or <strong>21</strong> (Constitution).
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Case Law Peek Drawer */}
      <CaseLawPeekDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        caseData={selectedCase}
      />
    </Box>
  );
}
