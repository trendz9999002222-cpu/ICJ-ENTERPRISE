import React, { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GavelIcon from "@mui/icons-material/Gavel";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TranslateIcon from "@mui/icons-material/Translate";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import BareActsSyncEngine from "../../services/bareActsSyncEngine";
import PrecedentSearchService from "../../services/precedentSearchService";
import { CENTRAL_ACTS_MASTER_REGISTRY, ACT_STATUS } from "../../data/masters/centralActsMasterRegistry";
import { findTransitionForSection } from "../../data/masters/repealedActsTransitionMap";
import LegalTermPopover from "./LegalTermPopover";
import CrossSectionPeekDrawer from "./CrossSectionPeekDrawer";
import CaseLawPeekDrawer from "./CaseLawPeekDrawer";

export default function InteractiveBareActReader({ initialActId = "ACT_BNS_2023", initialSection = "103" }) {
  const [selectedActId, setSelectedActId] = useState(initialActId);
  const [selectedSectionNo, setSelectedSectionNo] = useState(initialSection);
  const [actSearch, setActSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [fontSize, setFontSize] = useState(17); // Default reading size in px
  const [isSerif, setIsSerif] = useState(true);
  const [isHindiMode, setIsHindiMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Popover state for word definitions
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [activeTermData, setActiveTermData] = useState(null);

  // Drawer state for cross-section peeks
  const [peekDrawerOpen, setPeekDrawerOpen] = useState(false);
  const [peekActId, setPeekActId] = useState(null);
  const [peekSectionNo, setPeekSectionNo] = useState(null);

  // Drawer state for Supreme Court Precedents
  const [caseDrawerOpen, setCaseDrawerOpen] = useState(false);
  const [activeCaseData, setActiveCaseData] = useState(null);

  // Filtered Acts List for selector
  const actsList = useMemo(() => {
    return BareActsSyncEngine.getAllActs({ search: actSearch });
  }, [actSearch]);

  // Current Act Full Detail
  const currentAct = useMemo(() => {
    return BareActsSyncEngine.getActFullDetail(selectedActId);
  }, [selectedActId]);

  // Flattened sections for quick navigation
  const allSectionsInCurrentAct = useMemo(() => {
    if (!currentAct || !currentAct.chapters) return [];
    const list = [];
    currentAct.chapters.forEach((chap) => {
      chap.sections?.forEach((sec) => {
        list.push({
          chapter_number: chap.chapter_number,
          chapter_title: chap.chapter_title,
          ...sec,
        });
      });
    });
    return list;
  }, [currentAct]);

  // Filtered sections by sectionFilter input
  const filteredSections = useMemo(() => {
    if (!sectionFilter) return allSectionsInCurrentAct;
    const q = sectionFilter.toLowerCase().trim();
    return allSectionsInCurrentAct.filter(
      (s) =>
        String(s.section_number).toLowerCase().includes(q) ||
        s.section_title.toLowerCase().includes(q) ||
        (s.section_body && s.section_body.toLowerCase().includes(q))
    );
  }, [allSectionsInCurrentAct, sectionFilter]);

  // Current active section
  const currentSection = useMemo(() => {
    const found = allSectionsInCurrentAct.find(
      (s) => String(s.section_number).toLowerCase() === String(selectedSectionNo).toLowerCase()
    );
    return found || allSectionsInCurrentAct[0] || null;
  }, [allSectionsInCurrentAct, selectedSectionNo]);

  // Old vs New Transition info for current section
  const transitionInfo = useMemo(() => {
    if (!selectedActId || !currentSection) return null;
    return findTransitionForSection(selectedActId, currentSection.section_number);
  }, [selectedActId, currentSection]);

  // Supreme Court Landmark Precedents linked to this section
  const landmarkJudgmentsOnSection = useMemo(() => {
    if (!selectedActId || !currentSection) return [];
    return PrecedentSearchService.getJudgmentsForSection(selectedActId, currentSection.section_number);
  }, [selectedActId, currentSection]);

  // Handle legal word click/tap
  const handleTermClick = (event, termDef) => {
    setPopoverAnchor(event.currentTarget);
    setActiveTermData(termDef);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setActiveTermData(null);
  };

  // Handle cross-reference click
  const handleCrossReferenceClick = (targetActId, targetSecNo) => {
    setPeekActId(targetActId);
    setPeekSectionNo(targetSecNo);
    setPeekDrawerOpen(true);
  };

  // Switch full view from peek drawer or transition bar
  const handleSwitchFullView = (targetActId, targetSecNo) => {
    setSelectedActId(targetActId);
    setSelectedSectionNo(targetSecNo);
    setPeekDrawerOpen(false);
  };

  // Copy Formatted Advocate Citation
  const handleCopyCitation = () => {
    if (!currentAct || !currentSection) return;
    const citation = BareActsSyncEngine.formatAdvocateCitation(selectedActId, currentSection.section_number);
    const fullText = `${citation}\n\n${currentSection.section_body}`;
    navigator.clipboard.writeText(fullText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Tokenize the section body text into plain text vs interactive legal terms
  const tokenizedBody = useMemo(() => {
    if (!currentSection || !currentSection.section_body) return [];
    return BareActsSyncEngine.tokenizeTextWithDefinitions(currentSection.section_body);
  }, [currentSection]);

  return (
    <Box sx={{ width: "100%", bgcolor: "#f8fafc", minHeight: "85vh" }}>
      {/* Top Banner & Offline Readiness Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          color: "#ffffff",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <MenuBookIcon sx={{ color: "#38bdf8", fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: "#ffffff" }}>
                ICJ Pan-India Interactive Bare Acts Reader
              </Typography>
              <Typography variant="caption" sx={{ color: "#bfdbfe" }}>
                Live Statutory Definition Popover Engine • Cross-Section Jump • 100% Offline Fast Storage
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Chip
            icon={<CloudDoneIcon sx={{ fontSize: "16px !important", color: "#86efac !important" }} />}
            label="Offline Synced (0 ms Latency)"
            size="small"
            sx={{ bgcolor: "rgba(34, 197, 94, 0.2)", color: "#86efac", fontWeight: 600, border: "1px solid #15803d" }}
          />
          <Chip
            label="Brotli Compressed ~38 MB Pack"
            size="small"
            sx={{ bgcolor: "rgba(255, 255, 255, 0.12)", color: "#ffffff", fontWeight: 600 }}
          />
        </Stack>
      </Paper>

      {/* Main Grid: Left TOC Sidebar + Right Interactive Reader */}
      <Grid container spacing={3}>
        {/* ========================================================= */}
        {/* LEFT COLUMN: ACT SELECTOR & TABLE OF CONTENTS (TOC)       */}
        {/* ========================================================= */}
        <Grid item xs={12} md={4} lg={3.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 220px)",
              position: { md: "sticky" },
              top: 24,
            }}
          >
            {/* Act Selector Dropdown */}
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>
              Select Bare Act / Statute:
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <Select
                value={selectedActId}
                onChange={(e) => {
                  setSelectedActId(e.target.value);
                  setSelectedSectionNo("1");
                }}
                sx={{ borderRadius: 2, fontWeight: 600, fontSize: "0.9rem" }}
              >
                {CENTRAL_ACTS_MASTER_REGISTRY.map((act) => (
                  <MenuItem key={act.act_id} value={act.act_id}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: "100%", justifyContent: "space-between" }}>
                      <Typography variant="body2" fontWeight="bold" noWrap sx={{ maxWidth: 220 }}>
                        {act.short_title_en}
                      </Typography>
                      <Chip
                        label={act.status}
                        size="small"
                        color={act.status === ACT_STATUS.ACTIVE ? "success" : "default"}
                        sx={{ fontSize: "0.65rem", height: 18 }}
                      />
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Quick Section Filter */}
            <TextField
              size="small"
              placeholder="Search section no. or title..."
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            <Divider sx={{ mb: 1 }} />

            {/* Table of Contents List */}
            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, px: 0.5 }}>
              TABLE OF CONTENTS ({filteredSections.length} Sections)
            </Typography>

            <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
              <List dense disablePadding>
                {filteredSections.map((sec) => {
                  const isSelected = String(sec.section_number) === String(currentSection?.section_number);
                  return (
                    <ListItem key={sec.section_number} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => setSelectedSectionNo(sec.section_number)}
                        sx={{
                          borderRadius: 2,
                          py: 0.75,
                          px: 1.5,
                          "&.Mui-selected": {
                            bgcolor: "#eff6ff",
                            borderLeft: "3px solid #2563eb",
                            color: "#1e40af",
                            fontWeight: "bold",
                            "&:hover": { bgcolor: "#dbeafe" },
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={isSelected ? "bold" : 500} noWrap>
                              Sec. {sec.section_number}: {sec.section_title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {sec.chapter_number}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Paper>
        </Grid>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE SECTION READER & TOOLBAR        */}
        {/* ========================================================= */}
        <Grid item xs={12} md={8} lg={8.5}>
          {currentSection ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 4 },
                borderRadius: 3,
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
              }}
            >
              {/* Act Header & Status Bar */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={currentAct?.legal_domain || "Central Act"}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      label={`Act No. ${currentAct?.act_number || "-"} of ${currentAct?.enactment_year || "-"}`}
                      size="small"
                      variant="outlined"
                    />
                    {currentAct?.status === ACT_STATUS.REPEALED && (
                      <Chip label="REPEALED STATUTE" size="small" color="error" sx={{ fontWeight: 700 }} />
                    )}
                  </Stack>

                  {/* Typography & View Controls */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Toggle English / Hindi Diglot">
                      <IconButton
                        size="small"
                        onClick={() => setIsHindiMode(!isHindiMode)}
                        color={isHindiMode ? "primary" : "default"}
                        sx={{ border: "1px solid #cbd5e1", borderRadius: 2 }}
                      >
                        <TranslateIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Font (Serif Legal / Sans)">
                      <IconButton
                        size="small"
                        onClick={() => setIsSerif(!isSerif)}
                        sx={{ border: "1px solid #cbd5e1", borderRadius: 2 }}
                      >
                        <FormatSizeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Decrease font size">
                      <IconButton
                        size="small"
                        onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                        sx={{ border: "1px solid #cbd5e1", borderRadius: 2 }}
                      >
                        <ZoomOutIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="caption" sx={{ fontWeight: 700, px: 0.5, color: "#64748b" }}>
                      {fontSize}px
                    </Typography>
                    <Tooltip title="Increase font size">
                      <IconButton
                        size="small"
                        onClick={() => setFontSize((s) => Math.min(26, s + 1))}
                        sx={{ border: "1px solid #cbd5e1", borderRadius: 2 }}
                      >
                        <ZoomInIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                <Typography variant="h5" fontWeight="bold" sx={{ color: "#0f172a", mt: 2 }}>
                  {isHindiMode && currentAct?.short_title_hi ? currentAct.short_title_hi : currentAct?.short_title_en}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: "#64748b", fontWeight: 500 }}>
                  {currentSection.chapter_number}: {currentSection.chapter_title}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Old vs New Act Transition Card (If applicable) */}
              {transitionInfo && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2.5,
                    bgcolor: "#f0fdfa",
                    borderColor: "#5eead4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <CompareArrowsIcon sx={{ color: "#0f766e", fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" fontWeight="bold" sx={{ color: "#0f766e", textTransform: "uppercase" }}>
                        Statute Concordance & Transition:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: "#134e4a" }}>
                        {transitionInfo.type === "OLD_TO_NEW" ? (
                          <>Old IPC/CrPC Sec. {transitionInfo.match.old_section} ⟷ <strong>Now Section {transitionInfo.target_section} ({transitionInfo.target_act_name})</strong></>
                        ) : (
                          <>Section {currentSection.section_number} {currentAct.short_title_en} ⟷ <strong>Corresponds to Old Section {transitionInfo.target_section} ({transitionInfo.target_act_name})</strong></>
                        )}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#115e59", display: "block", mt: 0.2 }}>
                        {transitionInfo.note}
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    onClick={() => handleSwitchFullView(transitionInfo.target_act_id, transitionInfo.target_section)}
                    sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                  >
                    View Old/New Section
                  </Button>
                </Paper>
              )}

              {/* Section Header */}
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <GavelIcon sx={{ color: "#2563eb", fontSize: 22 }} />
                  <Typography variant="h5" fontWeight="bold" sx={{ color: "#1e3a8a" }}>
                    Section {currentSection.section_number}. {currentSection.section_title}
                  </Typography>
                </Stack>
              </Box>

              {/* Interactive Legal Text Reader with Dynamic Word Definition Popovers */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  lineHeight: 1.9,
                  color: "#1e293b",
                  fontFamily: isSerif ? "'Georgia', 'Times New Roman', serif" : "'Inter', 'Roboto', sans-serif",
                  fontSize: `${fontSize}px`,
                  whiteSpace: "pre-line",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                {tokenizedBody.map((token, index) => {
                  if (token.type === "legal_term" && token.definition) {
                    return (
                      <Box
                        key={index}
                        component="span"
                        onClick={(e) => handleTermClick(e, token.definition)}
                        sx={{
                          color: "#1e40af",
                          fontWeight: 600,
                          borderBottom: "2px dotted #3b82f6",
                          bgcolor: "#eff6ff",
                          px: 0.6,
                          py: 0.2,
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "#dbeafe",
                            color: "#1d4ed8",
                            borderBottom: "2px solid #1d4ed8",
                          },
                        }}
                      >
                        {token.content}
                      </Box>
                    );
                  }
                  return <span key={index}>{token.content}</span>;
                })}
              </Paper>

              {/* Cross-References Bar (Clickable Chips) */}
              {/* Cross-References Bar (Clickable Chips) */}
              {currentSection.cross_references?.length > 0 && (
                <Box sx={{ mb: 3, p: 2, bgcolor: "#f1f5f9", borderRadius: 2.5 }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Cross-Statutory References & Linked Provisions (Click to Preview):
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                    {currentSection.cross_references.map((ref, idx) => (
                      <Chip
                        key={idx}
                        icon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
                        label={ref.label}
                        onClick={() => handleCrossReferenceClick(ref.target_act_id, ref.section_number)}
                        clickable
                        color="primary"
                        variant="outlined"
                        sx={{
                          bgcolor: "#ffffff",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          "&:hover": { bgcolor: "#eff6ff" },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Supreme Court Landmark Precedents on this Section */}
              {landmarkJudgmentsOnSection?.length > 0 && (
                <Paper
                  variant="outlined"
                  sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: "#faf5ff",
                    borderColor: "#d8b4fe",
                    borderLeft: "4px solid #7e22ce",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <AccountBalanceIcon sx={{ color: "#7e22ce", fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "#581c87", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      🏛️ Supreme Court Landmark Precedents & Judgments on this Section ({landmarkJudgmentsOnSection.length}):
                    </Typography>
                  </Stack>

                  <Stack spacing={1.5}>
                    {landmarkJudgmentsOnSection.map((caseItem) => (
                      <Paper
                        key={caseItem.case_id}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "#ffffff",
                          border: "1px solid #e9d5ff",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1,
                          "&:hover": { borderColor: "#c084fc", bgcolor: "#fdf4ff" },
                        }}
                      >
                        <Box sx={{ maxWidth: "78%" }}>
                          <Typography variant="body2" fontWeight="bold" sx={{ color: "#4c1d95" }}>
                            {caseItem.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#6b21a8", fontWeight: 600, mr: 1 }}>
                            {caseItem.official_citation}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#71717a" }}>
                            ({caseItem.bench_strength} • {caseItem.judgment_date})
                          </Typography>
                        </Box>

                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setActiveCaseData(caseItem);
                            setCaseDrawerOpen(true);
                          }}
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            borderColor: "#a855f7",
                            color: "#7e22ce",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            "&:hover": { bgcolor: "#f3e8ff", borderColor: "#7e22ce" },
                          }}
                        >
                          View Ratio & Precedent
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              )}

              {/* Bottom Action Toolbar */}
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                <Button
                  variant="outlined"
                  startIcon={copySuccess ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                  onClick={handleCopyCitation}
                  sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
                >
                  {copySuccess ? "Citation & Section Copied!" : "Copy Advocate Citation & Text"}
                </Button>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="text"
                    disabled={filteredSections.indexOf(currentSection) <= 0}
                    onClick={() => {
                      const idx = filteredSections.indexOf(currentSection);
                      if (idx > 0) setSelectedSectionNo(filteredSections[idx - 1].section_number);
                    }}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    ← Previous Section
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    disabled={filteredSections.indexOf(currentSection) >= filteredSections.length - 1}
                    onClick={() => {
                      const idx = filteredSections.indexOf(currentSection);
                      if (idx < filteredSections.length - 1) setSelectedSectionNo(filteredSections[idx + 1].section_number);
                    }}
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Next Section →
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : (
            <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary">
                Select an Act and Section from the left sidebar to start reading.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Dynamic Popover for Word Definitions */}
      <LegalTermPopover
        anchorEl={popoverAnchor}
        termData={activeTermData}
        onClose={handlePopoverClose}
        onJumpToSection={(targetActId, targetSecNo) => {
          setSelectedActId(targetActId);
          setSelectedSectionNo(targetSecNo);
        }}
      />

      {/* Slide-over Side Drawer for Cross-Section Previews */}
      <CrossSectionPeekDrawer
        open={peekDrawerOpen}
        onClose={() => setPeekDrawerOpen(false)}
        targetActId={peekActId}
        targetSectionNumber={peekSectionNo}
        onSwitchFullView={handleSwitchFullView}
      />

      {/* Slide-over Side Drawer for Supreme Court Case Law Precedents */}
      <CaseLawPeekDrawer
        open={caseDrawerOpen}
        onClose={() => setCaseDrawerOpen(false)}
        caseData={activeCaseData}
        onOpenSection={handleSwitchFullView}
      />
    </Box>
  );
}
