import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Paper,
  Stack,
  Button,
  IconButton,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import ShieldIcon from "@mui/icons-material/Shield";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

/**
 * LegalPartyRepresentation — Enterprise Multi-Party Legal Representation Engine
 * 
 * Sourced from Indian Judicial Practice & eCourts Filing Standards:
 * 1. Forum-Aware Dynamic Nomenclature:
 *    - Civil / Commercial: Plaintiff(s) vs Defendant(s) (वादी बनाम प्रतिवादी)
 *    - Writ / Appellate / Tribunal: Petitioner(s) vs Respondent(s) (याचिकाकर्ता बनाम प्रत्यर्थी)
 *    - Criminal / 138 NI Act: Complainant(s) vs Accused/Opponent(s) (शिकायतकर्ता बनाम अभियुक्त)
 *    - Revenue / Tehsil: Applicant(s) vs Opposite Party(ies) (आवेदक बनाम गैर-सायल)
 * 2. Client Side Selector: Are we representing Side A or Side B?
 * 3. Dynamic Multi-Party Array (1 to 20+ Co-Parties with 1-click Add/Remove).
 * 4. Auto-Generated Legal Cause Title (बनाम / Versus).
 */

export default function LegalPartyRepresentation({
  forumTier = "DISTRICT_COURT",
  value = {},
  onChange = () => {},
  disabled = false,
}) {
  // Client Representation Side: 'SIDE_A' (Plaintiff/Petitioner) or 'SIDE_B' (Defendant/Respondent)
  const [clientSide, setClientSide] = useState(value.clientSide || "SIDE_A");

  // Side A Parties (Petitioners / Plaintiffs / Complainants)
  const [sideAParties, setSideAParties] = useState(
    Array.isArray(value.sideAParties) && value.sideAParties.length > 0
      ? value.sideAParties
      : [value.clientName || "Ramvir Jatav"]
  );

  // Side B Parties (Defendants / Respondents / Opposite Parties)
  const [sideBParties, setSideBParties] = useState(
    Array.isArray(value.sideBParties) && value.sideBParties.length > 0
      ? value.sideBParties
      : ["State of Uttar Pradesh & Ors."]
  );

  // Dynamic Forum-Specific Labels
  const partyLabels = useMemo(() => {
    switch (forumTier) {
      case "SUPREME_COURT":
      case "HIGH_COURT":
      case "SPECIAL_TRIBUNAL":
        return {
          sideAName: "Petitioner / Appellant",
          sideAHindi: "याचिकाकर्ता / अपीलार्थी (Side A)",
          sideBName: "Respondent / Non-Applicant",
          sideBHindi: "प्रत्यर्थी / विपक्षी (Side B)",
          roleA: "Petitioner",
          roleB: "Respondent",
        };
      case "TEHSIL_REVENUE":
        return {
          sideAName: "Applicant / First Party",
          sideAHindi: "आवेदक / प्रार्थी (Side A)",
          sideBName: "Opposite Party / Kaashtkar",
          sideBHindi: "गैर-सायल / विपक्षी काश्तकार (Side B)",
          roleA: "Applicant",
          roleB: "Opposite Party",
        };
      case "DISTRICT_COURT":
      default:
        return {
          sideAName: "Plaintiff / Complainant",
          sideAHindi: "वादी / परिवादी (Side A)",
          sideBName: "Defendant / Accused / Respondent",
          sideBHindi: "प्रतिवादी / मुद्दालेह / अभियुक्त (Side B)",
          roleA: "Plaintiff",
          roleB: "Defendant",
        };
    }
  }, [forumTier]);

  // Handlers for Side A Parties
  const handleSideAChange = (index, val) => {
    const updated = [...sideAParties];
    updated[index] = val;
    setSideAParties(updated);
  };

  const addSideAParty = () => {
    setSideAParties([...sideAParties, ""]);
  };

  const removeSideAParty = (index) => {
    if (sideAParties.length <= 1) return;
    setSideAParties(sideAParties.filter((_, i) => i !== index));
  };

  // Handlers for Side B Parties
  const handleSideBChange = (index, val) => {
    const updated = [...sideBParties];
    updated[index] = val;
    setSideBParties(updated);
  };

  const addSideBParty = () => {
    setSideBParties([...sideBParties, ""]);
  };

  const removeSideBParty = (index) => {
    if (sideBParties.length <= 1) return;
    setSideBParties(sideBParties.filter((_, i) => i !== index));
  };

  // Auto-Generated Formal Legal Cause Title
  const compiledCauseTitle = useMemo(() => {
    const p1 = sideAParties[0]?.trim() || "Party A";
    const pCount = sideAParties.filter((p) => p.trim()).length;
    const pSuffix = pCount > 1 ? ` & ${pCount - 1} Other${pCount > 2 ? "s" : ""}` : "";

    const d1 = sideBParties[0]?.trim() || "Party B";
    const dCount = sideBParties.filter((d) => d.trim()).length;
    const dSuffix = dCount > 1 ? ` & ${dCount - 1} Other${dCount > 2 ? "s" : ""}` : "";

    return `${p1}${pSuffix} vs. ${d1}${dSuffix}`;
  }, [sideAParties, sideBParties]);

  // Client's Legal Representation Label
  const representationBadge = useMemo(() => {
    if (clientSide === "SIDE_A") {
      const clientName = sideAParties[0]?.trim() || "Client";
      return `Advocate for ${partyLabels.roleA} #1 (${clientName})`;
    } else {
      const clientName = sideBParties[0]?.trim() || "Client";
      return `Advocate for ${partyLabels.roleB} #1 (${clientName})`;
    }
  }, [clientSide, sideAParties, sideBParties, partyLabels]);

  // Primary Client Name
  const primaryClientName = useMemo(() => {
    return clientSide === "SIDE_A"
      ? (sideAParties[0]?.trim() || "Client")
      : (sideBParties[0]?.trim() || "Client");
  }, [clientSide, sideAParties, sideBParties]);

  // Primary Opposing Party Name
  const primaryOpponentName = useMemo(() => {
    return clientSide === "SIDE_A"
      ? (sideBParties[0]?.trim() || "Opponent")
      : (sideAParties[0]?.trim() || "Opponent");
  }, [clientSide, sideAParties, sideBParties]);

  // Emit Structured State Upwards
  useEffect(() => {
    onChange({
      clientSide,
      clientRole: clientSide === "SIDE_A" ? partyLabels.roleA : partyLabels.roleB,
      opponentRole: clientSide === "SIDE_A" ? partyLabels.roleB : partyLabels.roleA,
      sideAParties: sideAParties.filter((p) => p.trim()),
      sideBParties: sideBParties.filter((p) => p.trim()),
      clientName: primaryClientName,
      opponentName: primaryOpponentName,
      causeTitle: compiledCauseTitle,
      representationBadge,
    });
  }, [
    clientSide,
    sideAParties,
    sideBParties,
    partyLabels,
    primaryClientName,
    primaryOpponentName,
    compiledCauseTitle,
    representationBadge,
  ]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: "#ffffff",
        borderColor: "#cbd5e1",
      }}
    >
      {/* 1. HEADER & CLIENT SIDE SELECTION */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="subtitle2" fontWeight={900} color="#0f172a">
          STEP 2: LEGAL PARTIES & OUR CLIENT REPRESENTATION (पक्षकार व हमारा पक्ष) *
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
          हम किसकी पैरवी कर रहे हैं और विपक्षी पार्टी कौन है?
        </Typography>

        {/* TOGGLE BUTTON: SIDE A VS SIDE B (Full-Width Responsive Bar) */}
        <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <Typography variant="caption" fontWeight={800} color="#334155" display="block" sx={{ mb: 1 }}>
            🎯 हमारा क्लाइंट किस पक्ष में है? (Whom are we representing?):
          </Typography>
          <ToggleButtonGroup
            value={clientSide}
            exclusive
            onChange={(_, val) => val && setClientSide(val)}
            size="medium"
            disabled={disabled}
            sx={{
              width: "100%",
              display: "flex",
              "& .MuiToggleButtonGroup-grouped": {
                flex: 1,
                py: 1,
              },
              "& .Mui-selected": {
                bgcolor: clientSide === "SIDE_A" ? "#1d4ed8 !important" : "#b91c1c !important",
                color: "#ffffff !important",
                fontWeight: "900 !important",
              },
            }}
          >
            <ToggleButton value="SIDE_A" sx={{ textTransform: "none", fontSize: "0.88rem", fontWeight: 700 }}>
              🛡️ {partyLabels.sideAName} ({partyLabels.sideAHindi})
            </ToggleButton>
            <ToggleButton value="SIDE_B" sx={{ textTransform: "none", fontSize: "0.88rem", fontWeight: 700 }}>
              ⚖️ {partyLabels.sideBName} ({partyLabels.sideBHindi})
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* 2. SIDE A & SIDE B PARTIES GRID */}
      <Grid container spacing={2.5} alignItems="flex-start">
        {/* SIDE A: PLAINTIFFS / PETITIONERS */}
        <Grid item xs={12} md={5.6}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: clientSide === "SIDE_A" ? "#eff6ff" : "#f8fafc",
              border: clientSide === "SIDE_A" ? "2px solid #3b82f6" : "1px solid #e2e8f0",
              height: "100%",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color={clientSide === "SIDE_A" ? "#1d4ed8" : "#1e293b"}>
                  {partyLabels.sideAName} (वादी / याचिकाकर्ता)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {partyLabels.sideAHindi}
                </Typography>
              </Box>

              {clientSide === "SIDE_A" && (
                <Chip
                  label="⭐ OUR CLIENT"
                  color="primary"
                  size="small"
                  icon={<ShieldIcon />}
                  sx={{ fontWeight: 800, fontSize: "0.68rem", height: 22 }}
                />
              )}
            </Stack>

            <Stack spacing={1.5}>
              {sideAParties.map((party, index) => (
                <Stack direction="row" spacing={1} key={`sideA-${index}`} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    label={`${partyLabels.roleA} ${index + 1} Name ${index === 0 && clientSide === "SIDE_A" ? "(Our Client *)" : "*"}`}
                    value={party}
                    onChange={(e) => handleSideAChange(index, e.target.value)}
                    disabled={disabled}
                    placeholder={`e.g. ${index === 0 ? "Ramvir Jatav" : "Co-Petitioner Name"}`}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 18 }} />,
                    }}
                  />
                  {sideAParties.length > 1 && (
                    <Tooltip title="Remove Co-Party">
                      <IconButton size="small" color="error" onClick={() => removeSideAParty(index)} disabled={disabled}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              ))}

              <Button
                variant="outlined"
                size="small"
                startIcon={<GroupAddIcon />}
                onClick={addSideAParty}
                disabled={disabled}
                sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700, borderColor: "#cbd5e1" }}
              >
                + Add Another {partyLabels.roleA} (सह-{partyLabels.roleA} जोड़ें)
              </Button>
            </Stack>
          </Box>
        </Grid>

        {/* VERSUS BADGE SEPARATOR */}
        <Grid item xs={12} md={0.8} sx={{ display: "flex", justifyContent: "center", alignItems: "center", alignSelf: "center" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f1f5f9",
              borderRadius: "50%",
              width: 44,
              height: 44,
              border: "1px solid #cbd5e1",
            }}
          >
            <CompareArrowsIcon sx={{ color: "#475569", fontSize: 20 }} />
            <Typography variant="caption" fontWeight={900} color="#0f172a" sx={{ fontSize: "0.62rem", lineHeight: 1 }}>
              VS
            </Typography>
          </Box>
        </Grid>

        {/* SIDE B: DEFENDANTS / RESPONDENTS */}
        <Grid item xs={12} md={5.6}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: clientSide === "SIDE_B" ? "#fef2f2" : "#f8fafc",
              border: clientSide === "SIDE_B" ? "2px solid #ef4444" : "1px solid #e2e8f0",
              height: "100%",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color={clientSide === "SIDE_B" ? "#b91c1c" : "#1e293b"}>
                  {partyLabels.sideBName} (प्रतिवादी / विपक्षी)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {partyLabels.sideBHindi}
                </Typography>
              </Box>

              {clientSide === "SIDE_B" && (
                <Chip
                  label="⭐ OUR CLIENT"
                  color="error"
                  size="small"
                  icon={<ShieldIcon />}
                  sx={{ fontWeight: 800, fontSize: "0.68rem", height: 22 }}
                />
              )}
            </Stack>

            <Stack spacing={1.5}>
              {sideBParties.map((party, index) => (
                <Stack direction="row" spacing={1} key={`sideB-${index}`} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    label={`${partyLabels.roleB} ${index + 1} Name ${index === 0 && clientSide === "SIDE_B" ? "(Our Client *)" : "*"}`}
                    value={party}
                    onChange={(e) => handleSideBChange(index, e.target.value)}
                    disabled={disabled}
                    placeholder={`e.g. ${index === 0 ? "State of UP / Ramesh Kumar" : "Co-Defendant Name"}`}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 18 }} />,
                    }}
                  />
                  {sideBParties.length > 1 && (
                    <Tooltip title="Remove Co-Party">
                      <IconButton size="small" color="error" onClick={() => removeSideBParty(index)} disabled={disabled}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              ))}

              <Button
                variant="outlined"
                size="small"
                startIcon={<GroupAddIcon />}
                onClick={addSideBParty}
                disabled={disabled}
                sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700, borderColor: "#cbd5e1" }}
              >
                + Add Another {partyLabels.roleB} (सह-{partyLabels.roleB} जोड़ें)
              </Button>
            </Stack>
          </Box>
        </Grid>

        {/* 3. AUTO-GENERATED CAUSE TITLE & REPRESENTATION SUMMARY BADGE */}
        <Grid item xs={12}>
          <Box
            sx={{
              p: 1.8,
              bgcolor: "#f8fafc",
              borderRadius: 2,
              border: "1px dashed #cbd5e1",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="body2" color="#0f172a" fontWeight={800}>
                📜 केस का आधिकारिक शीर्षक (Cause Title): {compiledCauseTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {sideAParties.length} {partyLabels.roleA}(s) बनाम {sideBParties.length} {partyLabels.roleB}(s)
              </Typography>
            </Box>

            <Chip
              label={representationBadge}
              size="small"
              color={clientSide === "SIDE_A" ? "primary" : "error"}
              sx={{ fontWeight: 800, fontSize: "0.72rem", height: 26 }}
              icon={<ShieldIcon />}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
