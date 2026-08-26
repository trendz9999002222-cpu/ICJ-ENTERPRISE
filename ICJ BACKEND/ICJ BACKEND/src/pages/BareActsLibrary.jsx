import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  Button,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Alert,
} from "@mui/material";

// Icons
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SearchIcon from "@mui/icons-material/Search";
import GavelIcon from "@mui/icons-material/Gavel";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import StorageIcon from "@mui/icons-material/Storage";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import TranslateIcon from "@mui/icons-material/Translate";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import InteractiveBareActReader from "../components/legal-reader/InteractiveBareActReader";
import { CENTRAL_ACTS_MASTER_REGISTRY, ACT_STATUS, LEGAL_DOMAINS } from "../data/masters/centralActsMasterRegistry";
import { LEGAL_DEFINITIONS_MASTER } from "../data/masters/legalDefinitionsMaster";
import { REPEALED_ACT_PAIRS } from "../data/masters/repealedActsTransitionMap";
import BareActsSyncEngine from "../services/bareActsSyncEngine";

export default function BareActsLibrary() {
  const [currentTab, setCurrentTab] = useState(0);
  const [readerInitialAct, setReaderInitialAct] = useState("ACT_BNS_2023");
  const [readerInitialSec, setReaderInitialSec] = useState("103");

  // Registry Tab Filters
  const [regSearch, setRegSearch] = useState("");
  const [regDomain, setRegDomain] = useState("ALL");
  const [regStatus, setRegStatus] = useState("ALL");

  // Transition Tab Filter
  const [transitionPairIndex, setTransitionPairIndex] = useState(0);

  // Dictionary Tab Filter
  const [dictSearch, setDictSearch] = useState("");
  const [dictCategory, setDictCategory] = useState("ALL");

  // Storage Footprint Info
  const storageInfo = useMemo(() => BareActsSyncEngine.getStorageFootprint(), []);

  // Filtered Registry Acts
  const filteredRegistryActs = useMemo(() => {
    return BareActsSyncEngine.getAllActs({
      search: regSearch,
      domain: regDomain,
      status: regStatus,
    });
  }, [regSearch, regDomain, regStatus]);

  // Filtered Dictionary Terms
  const filteredDictTerms = useMemo(() => {
    let list = [...LEGAL_DEFINITIONS_MASTER];
    if (dictSearch) {
      const q = dictSearch.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.term_display_en.toLowerCase().includes(q) ||
          (t.term_display_hi && t.term_display_hi.includes(q)) ||
          t.definition_text_en.toLowerCase().includes(q) ||
          t.source_section.toLowerCase().includes(q)
      );
    }
    if (dictCategory !== "ALL") {
      list = list.filter((t) => t.category === dictCategory);
    }
    return list;
  }, [dictSearch, dictCategory]);

  const handleOpenInReader = (actId, secNo = "1") => {
    setReaderInitialAct(actId);
    setReaderInitialSec(secNo);
    setCurrentTab(0); // Jump to Interactive Reader Tab
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Top Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
          <GavelIcon sx={{ fontSize: 32, color: "#1e3a8a" }} />
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#0f172a" }}>
            Pan-India Bare Acts Legal Engine & Library
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: "#64748b" }}>
          Comprehensive Digital Statute Book (1836–2026) with Live Word Definitions, Cross-Section Referencing, Transition Mapping & Zero-Latency Offline Storage.
        </Typography>
      </Box>

      {/* Main Navigation Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", mb: 3, bgcolor: "#ffffff" }}>
        <Tabs
          value={currentTab}
          onChange={(_, v) => setCurrentTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              py: 2,
            },
          }}
        >
          <Tab icon={<AutoStoriesIcon />} iconPosition="start" label="Interactive Bare Act Reader" />
          <Tab icon={<MenuBookIcon />} iconPosition="start" label={`Central Acts Master Registry (${CENTRAL_ACTS_MASTER_REGISTRY.length})`} />
          <Tab icon={<CompareArrowsIcon />} iconPosition="start" label="Repealed vs Active Transition Map" />
          <Tab icon={<TranslateIcon />} iconPosition="start" label={`Statutory Legal Dictionary (${LEGAL_DEFINITIONS_MASTER.length})`} />
          <Tab icon={<StorageIcon />} iconPosition="start" label="Offline Storage & Sync Manager" />
        </Tabs>
      </Paper>

      {/* ========================================================================= */}
      {/* TAB 0: INTERACTIVE BARE ACT READER                                        */}
      {/* ========================================================================= */}
      {currentTab === 0 && (
        <InteractiveBareActReader
          initialActId={readerInitialAct}
          initialSection={readerInitialSec}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 1: CENTRAL ACTS MASTER REGISTRY                                       */}
      {/* ========================================================================= */}
      {currentTab === 1 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          {/* Filters Bar */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search Act by title, year, or keyword..."
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Legal Domain</InputLabel>
                <Select
                  value={regDomain}
                  label="Legal Domain"
                  onChange={(e) => setRegDomain(e.target.value)}
                >
                  <MenuItem value="ALL">All Legal Domains ({CENTRAL_ACTS_MASTER_REGISTRY.length})</MenuItem>
                  {LEGAL_DOMAINS.map((dom) => (
                    <MenuItem key={dom} value={dom}>{dom}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Statute Status</InputLabel>
                <Select
                  value={regStatus}
                  label="Statute Status"
                  onChange={(e) => setRegStatus(e.target.value)}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value={ACT_STATUS.ACTIVE}>Active Enactments</MenuItem>
                  <MenuItem value={ACT_STATUS.REPEALED}>Repealed / Historical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Acts Table */}
          <Box sx={{ overflowX: "auto" }}>
            <Table size="medium">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "#1e293b" }}>Act ID & Year</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#1e293b" }}>Short Title & English / Hindi Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#1e293b" }}>Domain & Ministry</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#1e293b" }}>Chapters / Sections</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#1e293b" }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: "#1e293b" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRegistryActs.map((act) => (
                  <TableRow key={act.act_id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: "#1e3a8a" }}>
                        {act.enactment_year}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Act #{act.act_number}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: "#0f172a" }}>
                        {act.short_title_en}
                      </Typography>
                      {act.short_title_hi && (
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                          {act.short_title_hi}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: 0.5 }}>
                        {act.description_en?.substring(0, 100)}...
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={act.legal_domain}
                        size="small"
                        sx={{ bgcolor: "#eff6ff", color: "#1e40af", fontWeight: 600, fontSize: "0.75rem", mb: 0.5 }}
                      />
                      <Typography variant="caption" sx={{ display: "block", color: "#64748b" }}>
                        {act.ministry}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {act.total_sections} Sections
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {act.total_chapters} Chapters
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {act.status === ACT_STATUS.ACTIVE ? (
                        <Chip label="ACTIVE" size="small" color="success" sx={{ fontWeight: 700 }} />
                      ) : (
                        <Box>
                          <Chip label="REPEALED" size="small" color="error" sx={{ fontWeight: 700 }} />
                          {act.repealed_by_act_id && (
                            <Typography variant="caption" sx={{ display: "block", color: "#ef4444", mt: 0.5 }}>
                              Replaced by {act.repealed_by_act_id.replace("ACT_", "").replace("_", " ")}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<OpenInNewIcon fontSize="small" />}
                        onClick={() => handleOpenInReader(act.act_id)}
                        sx={{ textTransform: "none", borderRadius: 2, bgcolor: "#1e3a8a", "&:hover": { bgcolor: "#1e40af" } }}
                      >
                        Read Act
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REPEALED VS ACTIVE TRANSITION CONCORDANCE                          */}
      {/* ========================================================================= */}
      {currentTab === 2 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          {/* Pair Selector Tabs */}
          <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
            {REPEALED_ACT_PAIRS.map((pair, idx) => (
              <Button
                key={pair.pair_id}
                variant={transitionPairIndex === idx ? "contained" : "outlined"}
                onClick={() => setTransitionPairIndex(idx)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2.5,
                  fontWeight: 600,
                  bgcolor: transitionPairIndex === idx ? "#0f766e" : "transparent",
                  "&:hover": { bgcolor: transitionPairIndex === idx ? "#115e59" : "#f0fdfa" },
                }}
              >
                {pair.old_act_name.split("(")[0]} ⟷ {pair.new_act_name}
              </Button>
            ))}
          </Stack>

          {/* Active Pair Detail */}
          {REPEALED_ACT_PAIRS[transitionPairIndex] && (
            <>
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Effective Date: {REPEALED_ACT_PAIRS[transitionPairIndex].effective_date}
                </Typography>
                <Typography variant="body2">
                  {REPEALED_ACT_PAIRS[transitionPairIndex].summary}
                </Typography>
              </Alert>

              <Table size="medium">
                <TableHead sx={{ bgcolor: "#f0fdfa" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", color: "#134e4a", width: "25%" }}>Old / Repealed Statute</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#134e4a", width: "25%" }}>Modern / In-Force Statute</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#134e4a", width: "35%" }}>Substantive & Procedural Changes</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#134e4a", width: "15%" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {REPEALED_ACT_PAIRS[transitionPairIndex].mappings.map((m, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Chip label={`Sec. ${m.old_section}`} color="error" variant="outlined" size="small" sx={{ fontWeight: 700, mb: 0.5 }} />
                        <Typography variant="body2" fontWeight="bold" sx={{ color: "#334155" }}>
                          {m.old_title}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip label={`Sec. ${m.new_section}`} color="success" size="small" sx={{ fontWeight: 700, mb: 0.5 }} />
                        <Typography variant="body2" fontWeight="bold" sx={{ color: "#0f766e" }}>
                          {m.new_title}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.5, fontSize: "0.85rem" }}>
                          {m.substantive_change}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenInReader(REPEALED_ACT_PAIRS[transitionPairIndex].new_act_id, m.new_section.split("(")[0])}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          View Section
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </Paper>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STATUTORY LEGAL DICTIONARY (SECTION 2/3 MASTER INDEX)               */}
      {/* ========================================================================= */}
      {currentTab === 3 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          {/* Dictionary Search */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search legal term (e.g. bailable, decree, public servant, anticipatory bail)..."
                value={dictSearch}
                onChange={(e) => setDictSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={dictCategory}
                  label="Category"
                  onChange={(e) => setDictCategory(e.target.value)}
                >
                  <MenuItem value="ALL">All Categories ({LEGAL_DEFINITIONS_MASTER.length})</MenuItem>
                  <MenuItem value="Criminal Procedure">Criminal Procedure</MenuItem>
                  <MenuItem value="Civil Procedure">Civil Procedure</MenuItem>
                  <MenuItem value="Criminal Law">Criminal Law</MenuItem>
                  <MenuItem value="Law of Evidence">Law of Evidence</MenuItem>
                  <MenuItem value="Contract Law">Contract Law</MenuItem>
                  <MenuItem value="Property Law">Property Law</MenuItem>
                  <MenuItem value="Constitutional Law">Constitutional Law</MenuItem>
                  <MenuItem value="Banking & Commercial">Banking & Commercial</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Terms Grid */}
          <Grid container spacing={2.5}>
            {filteredDictTerms.map((term) => (
              <Grid item xs={12} md={6} key={term.term_key}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.06)", borderColor: "#93c5fd" },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#1e3a8a", lineHeight: 1.2 }}>
                          {term.term_display_en}
                        </Typography>
                        {term.term_display_hi && (
                          <Typography variant="subtitle2" sx={{ color: "#64748b", fontWeight: 500 }}>
                            {term.term_display_hi}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={term.source_section}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                      />
                    </Stack>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        my: 1.5,
                        bgcolor: "#f8fafc",
                        borderRadius: 2,
                        borderLeft: "3px solid #2563eb",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "#1e293b", fontSize: "0.85rem", fontStyle: "italic", lineHeight: 1.6 }}>
                        "{term.definition_text_en}"
                      </Typography>
                    </Paper>

                    {term.plain_english_summary && (
                      <Box sx={{ p: 1.5, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
                        <Typography variant="caption" fontWeight="bold" sx={{ color: "#166534", textTransform: "uppercase" }}>
                          Advocate Takeaway:
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#14532d", fontSize: "0.8rem", mt: 0.2 }}>
                          {term.plain_english_summary}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ px: 2.5, pb: 2, pt: 0, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      variant="text"
                      endIcon={<OpenInNewIcon fontSize="small" />}
                      onClick={() => handleOpenInReader(term.source_act_id, term.source_section.replace(/[^0-9]/g, "") || "1")}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Read Section
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: OFFLINE STORAGE & DATA COMPRESSION MANAGER                         */}
      {/* ========================================================================= */}
      {currentTab === 4 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#0f172a", mb: 1 }}>
            Offline Statute Storage & High-Efficiency Data Architecture
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            How India's legal statute repository runs 100% offline in browser & mobile apps with minimal footprint.
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #2563eb", bgcolor: "#f8fafc" }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">TOTAL ACTS CATALOGED</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: "#1e3a8a", mt: 0.5 }}>
                  {storageInfo.total_acts_cataloged}
                </Typography>
                <Typography variant="caption" color="text.secondary">1836 to 2026 Enactments</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #16a34a", bgcolor: "#f8fafc" }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">RAW DATA MEMORY</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: "#15803d", mt: 0.5 }}>
                  {storageInfo.raw_kb} KB
                </Typography>
                <Typography variant="caption" color="text.secondary">Pure Digital UTF-8 JSON</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #0891b2", bgcolor: "#f8fafc" }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">BROTLI COMPRESSED SIZE</Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ color: "#0e7490", mt: 0.5 }}>
                  ~{storageInfo.compressed_kb} KB
                </Typography>
                <Typography variant="caption" color="text.secondary">Over-The-Wire Network Transfer</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2.5, borderRadius: 3, borderLeft: "4px solid #7c3aed", bgcolor: "#f8fafc" }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">OFFLINE STATUS</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ color: "#6d28d9", mt: 0.5 }}>
                  Active (0 ms)
                </Typography>
                <Typography variant="caption" color="text.secondary">IndexedDB + Memory Cache</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Technical Explanation Card */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#f0fdf4", borderColor: "#86efac" }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <CheckCircleIcon sx={{ color: "#16a34a" }} />
              <Typography variant="h6" fontWeight="bold" sx={{ color: "#14532d" }}>
                Why 500–1000 GB is Not Needed (Technical Data Verification)
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "#166534", lineHeight: 1.8 }}>
              • <strong>Uncompressed Government PDFs:</strong> Unindexed 300 DPI scanned images consume hundreds of gigabytes.<br />
              • <strong>Digital UTF-8 Bare Act Text:</strong> All 3,000+ Central and Historical Acts of India in raw text take only <strong>~150 MB to 350 MB</strong>.<br />
              • <strong>Brotli / SQLite WASM:</strong> When compressed, the entire national legal repository takes only <strong>~30 MB to 60 MB</strong>.<br />
              • <strong>Incremental Delta Sync:</strong> Whenever an amendment is passed by Parliament, only a 15 KB JSON patch is fetched in the background.
            </Typography>
          </Paper>
        </Paper>
      )}
    </Box>
  );
}
