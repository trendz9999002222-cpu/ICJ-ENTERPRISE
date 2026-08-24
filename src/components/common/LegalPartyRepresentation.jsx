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

        {/* TOGGLE BUTTON: SIDE A VS SIDE B (Tactile Rounded-Pill Buttons) */}
        <Box sx={{ p: 1.8, bgcolor: "#f1f5f9", borderRadius: "16px", border: "1.5px solid #cbd5e1" }}>
          <Typography variant="caption" fontWeight={900} color="#1e293b" display="block" sx={{ mb: 1.2 }}>
            🎯 हमारा क्लाइंट किस पक्ष में है? (Whom are we representing? — नीचे दिए गए बटन दबाएँ):
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {/* SIDE A PILL BUTTON */}
            <Button
              fullWidth
              variant={clientSide === "SIDE_A" ? "contained" : "outlined"}
              onClick={() => setClientSide("SIDE_A")}
              disabled={disabled}
              startIcon={<ShieldIcon />}
              sx={{
                borderRadius: "30px",
                py: 1.2,
                px: 2.5,
                textTransform: "none",
                fontSize: "0.9rem",
                fontWeight: 900,
                transition: "all 0.25s ease-in-out",
                bgcolor: clientSide === "SIDE_A" ? "#1d4ed8" : "#eff6ff",
                color: clientSide === "SIDE_A" ? "#ffffff" : "#1d4ed8",
                border: clientSide === "SIDE_A" ? "2.5px solid #1e40af" : "2px solid #93c5fd",
                boxShadow: clientSide === "SIDE_A" ? "0 4px 16px rgba(29, 78, 216, 0.4)" : "0 2px 6px rgba(29, 78, 216, 0.1)",
                transform: clientSide === "SIDE_A" ? "scale(1.02)" : "scale(1)",
                "&:hover": {
                  bgcolor: clientSide === "SIDE_A" ? "#1e40af" : "#dbeafe",
                  border: "2px solid #1d4ed8",
                },
              }}
            >
              🛡️ {partyLabels.sideAName} ({partyLabels.sideAHindi})
              {clientSide === "SIDE_A" && " • [चयनित]"}
            </Button>

            {/* SIDE B PILL BUTTON */}
            <Button
              fullWidth
              variant={clientSide === "SIDE_B" ? "contained" : "outlined"}
              onClick={() => setClientSide("SIDE_B")}
              disabled={disabled}
              startIcon={<ShieldIcon />}
              sx={{
                borderRadius: "30px",
                py: 1.2,
                px: 2.5,
                textTransform: "none",
                fontSize: "0.9rem",
                fontWeight: 900,
                transition: "all 0.25s ease-in-out",
                bgcolor: clientSide === "SIDE_B" ? "#b91c1c" : "#fff1f2",
                color: clientSide === "SIDE_B" ? "#ffffff" : "#b91c1c",
                border: clientSide === "SIDE_B" ? "2.5px solid #991b1b" : "2px solid #fca5a5",
                boxShadow: clientSide === "SIDE_B" ? "0 4px 16px rgba(185, 28, 28, 0.4)" : "0 2px 6px rgba(185, 28, 28, 0.1)",
                transform: clientSide === "SIDE_B" ? "scale(1.02)" : "scale(1)",
                "&:hover": {
                  bgcolor: clientSide === "SIDE_B" ? "#991b1b" : "#fee2e2",
                  border: "2px solid #b91c1c",
                },
              }}
            >
              ⚖️ {partyLabels.sideBName} ({partyLabels.sideBHindi})
              {clientSide === "SIDE_B" && " • [चयनित]"}
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* 2. SIDE A & SIDE B PARTIES GRID */}
      <Grid container spacing={2.5} alignItems="flex-start">
        {/* SIDE A: PLAINTIFFS / PETITIONERS */}
        <Grid item xs={12} md={5.6}>
          <Box
            sx={{
              p: 2.2,
              borderRadius: "16px",
              bgcolor: clientSide === "SIDE_A" ? "#eff6ff" : "#f8fafc",
              border: clientSide === "SIDE_A" ? "2.5px solid #3b82f6" : "1.5px solid #cbd5e1",
              boxShadow: clientSide === "SIDE_A" ? "0 4px 14px rgba(59, 130, 246, 0.15)" : "none",
              height: "100%",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={900} color={clientSide === "SIDE_A" ? "#1d4ed8" : "#1e293b"}>
                  {partyLabels.sideAName} (वादी / याचिकाकर्ता)
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {partyLabels.sideAHindi}
                </Typography>
              </Box>

              {clientSide === "SIDE_A" && (
                <Chip
                  label="⭐ OUR CLIENT"
                  color="primary"
                  size="small"
                  icon={<ShieldIcon />}
                  sx={{ fontWeight: 900, fontSize: "0.7rem", height: 24, borderRadius: "14px" }}
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
                      startAdornment: <PersonIcon sx={{ color: clientSide === "SIDE_A" ? "#1d4ed8" : "#94a3b8", mr: 1, fontSize: 18 }} />,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                      },
                    }}
                  />
                  {sideAParties.length > 1 && (
                    <Tooltip title="Remove Co-Party">
                      <IconButton size="small" color="error" onClick={() => removeSideAParty(index)} disabled={disabled} sx={{ bgcolor: "#fee2e2", borderRadius: "12px" }}>
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
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  borderRadius: "24px",
                  bgcolor: "#dbeafe",
                  color: "#1e40af",
                  border: "1.5px solid #93c5fd",
                  "&:hover": { bgcolor: "#bfdbfe", border: "1.5px solid #3b82f6" },
                }}
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
              bgcolor: "#e2e8f0",
              borderRadius: "50%",
              width: 48,
              height: 48,
              border: "2px solid #cbd5e1",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            <CompareArrowsIcon sx={{ color: "#334155", fontSize: 22 }} />
            <Typography variant="caption" fontWeight={900} color="#0f172a" sx={{ fontSize: "0.65rem", lineHeight: 1 }}>
              VS
            </Typography>
          </Box>
        </Grid>

        {/* SIDE B: DEFENDANTS / RESPONDENTS */}
        <Grid item xs={12} md={5.6}>
          <Box
            sx={{
              p: 2.2,
              borderRadius: "16px",
              bgcolor: clientSide === "SIDE_B" ? "#fef2f2" : "#f8fafc",
              border: clientSide === "SIDE_B" ? "2.5px solid #ef4444" : "1.5px solid #cbd5e1",
              boxShadow: clientSide === "SIDE_B" ? "0 4px 14px rgba(239, 68, 68, 0.15)" : "none",
              height: "100%",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={900} color={clientSide === "SIDE_B" ? "#b91c1c" : "#1e293b"}>
                  {partyLabels.sideBName} (प्रतिवादी / विपक्षी)
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {partyLabels.sideBHindi}
                </Typography>
              </Box>

              {clientSide === "SIDE_B" && (
                <Chip
                  label="⭐ OUR CLIENT"
                  color="error"
                  size="small"
                  icon={<ShieldIcon />}
                  sx={{ fontWeight: 900, fontSize: "0.7rem", height: 24, borderRadius: "14px" }}
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
                      startAdornment: <PersonIcon sx={{ color: clientSide === "SIDE_B" ? "#b91c1c" : "#94a3b8", mr: 1, fontSize: 18 }} />,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                      },
                    }}
                  />
                  {sideBParties.length > 1 && (
                    <Tooltip title="Remove Co-Party">
                      <IconButton size="small" color="error" onClick={() => removeSideBParty(index)} disabled={disabled} sx={{ bgcolor: "#fee2e2", borderRadius: "12px" }}>
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
                sx={{
                  textTransform: "none",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  borderRadius: "24px",
                  bgcolor: "#fee2e2",
                  color: "#991b1b",
                  border: "1.5px solid #fca5a5",
                  "&:hover": { bgcolor: "#fecaca", border: "1.5px solid #ef4444" },
                }}
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
              p: 2,
              bgcolor: clientSide === "SIDE_A" ? "#eff6ff" : "#fef2f2",
              borderRadius: "16px",
              border: clientSide === "SIDE_A" ? "1.5px solid #93c5fd" : "1.5px solid #fca5a5",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Box>
              <Typography variant="body2" color="#0f172a" fontWeight={900}>
                📜 केस का आधिकारिक शीर्षक (Cause Title): {compiledCauseTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {sideAParties.length} {partyLabels.roleA}(s) बनाम {sideBParties.length} {partyLabels.roleB}(s)
              </Typography>
            </Box>

            <Chip
              label={representationBadge}
              size="small"
              color={clientSide === "SIDE_A" ? "primary" : "error"}
              sx={{ fontWeight: 900, fontSize: "0.75rem", height: 26, borderRadius: "14px" }}
              icon={<ShieldIcon />}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
