import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Stack,
  Chip,
  InputAdornment,
  Alert,
} from "@mui/material";

import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import VerifiedIcon from "@mui/icons-material/Verified";

import LocationService from "../../services/locationService.js";
import JudiciaryMasterService from "../../services/judiciaryMasterService.js";

export default function CascadingCourtSelector({
  value = {},
  onChange = () => {},
  disabled = false,
  showCNR = true,
  defaultForum = "DISTRICT_COURT",
}) {
  const [forumTier, setForumTier] = useState(value.forumTier || defaultForum);
  const [stateCode, setStateCode] = useState(value.stateCode || "ST-09");
  const [highCourtCode, setHighCourtCode] = useState(value.highCourtCode || "HC-ALL");
  const [bench, setBench] = useState(value.bench || "Principal Seat");
  const [districtCode, setDistrictCode] = useState(value.districtCode || "DST-140");
  const [courtComplex, setCourtComplex] = useState(value.courtComplex || "Surajpur District Court Complex");
  const [establishmentType, setEstablishmentType] = useState(value.establishmentType || "DISTRICT_SESSIONS");
  const [caseTypeId, setCaseTypeId] = useState(value.caseTypeId || "");
  const [caseCategory, setCaseCategory] = useState(value.caseCategory || "");
  const [caseSubCategory, setCaseSubCategory] = useState(value.caseSubCategory || "");
  const [cnrNumber, setCnrNumber] = useState(value.cnrNumber || "");

  // Master Data Lists
  const states = useMemo(() => LocationService.getStates(), []);
  const highCourts = useMemo(() => JudiciaryMasterService.getHighCourts(), []);
  
  // Active State Record
  const selectedState = useMemo(() => {
    return states.find((s) => s.code === stateCode) || states[0] || {};
  }, [states, stateCode]);

  // Districts for Selected State
  const availableDistricts = useMemo(() => {
    const allDistricts = LocationService.getDistrictsByState(stateCode);
    if (allDistricts.length > 0) return allDistricts;
    return [{ code: `DST-${stateCode}-01`, stateCode, name: `${selectedState.name || 'District'} Central`, courtComplex: "District Court Complex" }];
  }, [stateCode, selectedState]);

  // High Courts associated with State
  const currentHighCourt = useMemo(() => {
    return highCourts.find((h) => h.code === highCourtCode || h.stateCode === stateCode) || highCourts[0];
  }, [highCourts, highCourtCode, stateCode]);

  // Court-Specific Case Types
  const availableCaseTypes = useMemo(() => {
    if (forumTier === "HIGH_COURT") {
      return JudiciaryMasterService.getCaseTypesForHighCourt(highCourtCode);
    }
    if (forumTier === "DISTRICT_COURT") {
      return JudiciaryMasterService.getCaseTypesForDistrictEstablishment(establishmentType);
    }
    if (forumTier === "SUPREME_COURT") {
      return [
        { id: "SLP_CIVIL", code: "SLP(C)", name: "Special Leave Petition (Civil) — Art. 136", category: "Constitutional & Civil Special Leave", subCategories: ["Civil Final Order Challenge", "High Court Judgment Appeal", "Tribunal Appeal"] },
        { id: "SLP_CRL", code: "SLP(CRL)", name: "Special Leave Petition (Criminal) — Art. 136", category: "Criminal Special Leave", subCategories: ["Bail Rejection Appeal", "Conviction Challenge", "Death Sentence Review"] },
        { id: "WP_CIVIL_SC", code: "W.P.(C)", name: "Writ Petition (Civil) — Art. 32 Fundamental Rights", category: "Constitutional Fundamental Rights", subCategories: ["Right to Life & Liberty (Art 21)", "Equality & Public Policy (Art 14)", "Federal Dispute"] },
        { id: "CIVIL_APPEAL_SC", code: "C.A.", name: "Civil Appeal (Statutory Appeal / Tax / NCLAT)", category: "Statutory Apex Appeals", subCategories: ["NCLAT Corporate Insolvency Appeal", "National Consumer Commission Appeal", "Customs & Tax Appeal"] },
      ];
    }
    // Tribunals
    return [
      { id: "TRIBUNAL_ORIGINAL", code: "OA", name: "Original Application (OA)", category: "Tribunal Dispute", subCategories: ["Dispute Petition", "Statutory Claim", "Service Grievance"] },
      { id: "TRIBUNAL_APPEAL", code: "TA", name: "Tribunal Appeal / Review", category: "Tribunal Appeal", subCategories: ["Order Appeal", "Interim Stay Application"] },
    ];
  }, [forumTier, highCourtCode, establishmentType]);

  // Auto-Select Case Type if none selected
  useEffect(() => {
    if (availableCaseTypes.length > 0 && !availableCaseTypes.some((c) => c.id === caseTypeId)) {
      setCaseTypeId(availableCaseTypes[0].id);
      setCaseCategory(availableCaseTypes[0].category);
      if (availableCaseTypes[0].subCategories?.length > 0) {
        setCaseSubCategory(availableCaseTypes[0].subCategories[0]);
      }
    }
  }, [availableCaseTypes, caseTypeId]);

  // Selected Case Type Record
  const selectedCaseType = useMemo(() => {
    return availableCaseTypes.find((c) => c.id === caseTypeId) || availableCaseTypes[0] || {};
  }, [availableCaseTypes, caseTypeId]);

  // Handle Case Type Change
  const handleCaseTypeChange = (newTypeId) => {
    setCaseTypeId(newTypeId);
    const ct = availableCaseTypes.find((c) => c.id === newTypeId);
    if (ct) {
      setCaseCategory(ct.category);
      setCaseSubCategory(ct.subCategories?.[0] || "");
    }
  };

  // CNR Validation
  const cnrValidation = useMemo(() => {
    if (!cnrNumber.trim()) return null;
    return JudiciaryMasterService.validateCNR(cnrNumber);
  }, [cnrNumber]);

  // Build Comprehensive Court Name
  const compiledCourtName = useMemo(() => {
    if (forumTier === "SUPREME_COURT") return "Supreme Court of India, Tilak Marg, New Delhi";
    if (forumTier === "HIGH_COURT") return `${currentHighCourt.name} (${bench})`;
    const dist = availableDistricts.find((d) => d.code === districtCode)?.name || "District";
    const estMap = {
      DISTRICT_SESSIONS: "District & Sessions Court",
      FAMILY_COURT: "Family Court",
      COMMERCIAL_COURT: "Commercial Court",
      POCSO_SPECIAL: "Special POCSO Court",
      CJM_MAGISTRATE: "Chief Judicial Magistrate (CJM) Court",
    };
    return `${estMap[establishmentType] || 'District Court'}, ${courtComplex}, ${dist} (${selectedState.name})`;
  }, [forumTier, currentHighCourt, bench, availableDistricts, districtCode, establishmentType, courtComplex, selectedState]);

  // Emit Structured State Upwards
  useEffect(() => {
    const distName = availableDistricts.find((d) => d.code === districtCode)?.name || "District";
    onChange({
      forumTier,
      stateCode,
      stateName: selectedState.name || "State",
      districtCode,
      districtName: distName,
      highCourtCode: currentHighCourt.code,
      highCourtName: currentHighCourt.name,
      bench,
      courtComplex,
      establishmentType,
      courtName: compiledCourtName,
      caseTypeId,
      caseTypeCode: selectedCaseType.code || "CS",
      caseTypeName: selectedCaseType.name || "Case",
      caseCategory,
      caseSubCategory,
      cnrNumber: cnrNumber.trim().toUpperCase(),
      isCNRValid: cnrValidation ? cnrValidation.valid : false,
    });
  }, [
    forumTier,
    stateCode,
    selectedState,
    districtCode,
    availableDistricts,
    highCourtCode,
    currentHighCourt,
    bench,
    courtComplex,
    establishmentType,
    compiledCourtName,
    caseTypeId,
    selectedCaseType,
    caseCategory,
    caseSubCategory,
    cnrNumber,
    cnrValidation,
  ]);

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#ffffff" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <AccountBalanceIcon sx={{ color: "#1e3a8a", fontSize: 24 }} />
        <Typography variant="subtitle2" fontWeight={900} color="#0f172a" letterSpacing={0.2}>
          🏛️ OFFICIAL INDIA COURT & CASE TYPE TAXONOMY HIERARCHY
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {/* LEVEL 1: FORUM TIER SELECTOR */}
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="1. Judicial Forum Tier *"
            value={forumTier}
            onChange={(e) => setForumTier(e.target.value)}
            disabled={disabled}
          >
            <MenuItem value="SUPREME_COURT">🏛️ Supreme Court of India</MenuItem>
            <MenuItem value="HIGH_COURT">⚖️ High Court of Judicature</MenuItem>
            <MenuItem value="DISTRICT_COURT">🏢 District & Subordinate Courts</MenuItem>
            <MenuItem value="TEHSIL_SDM">📜 Tehsil & SDM Revenue Court</MenuItem>
            <MenuItem value="TRIBUNAL">⚖️ Special Statutory Tribunal</MenuItem>
          </TextField>
        </Grid>

        {/* LEVEL 2: STATE / UT */}
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="2. State / Union Territory *"
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
            disabled={disabled || forumTier === "SUPREME_COURT"}
          >
            {states.map((s) => (
              <MenuItem key={s.code} value={s.code}>
                {s.name} ({s.type})
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* LEVEL 3 & 4 CONDITIONAL: HIGH COURT VS DISTRICT */}
        {forumTier === "HIGH_COURT" ? (
          <>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="3. High Court Registry *"
                value={currentHighCourt.code}
                onChange={(e) => setHighCourtCode(e.target.value)}
                disabled={disabled}
              >
                {highCourts.map((h) => (
                  <MenuItem key={h.code} value={h.code}>
                    {h.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="4. Designated Bench / Circuit *"
                value={bench}
                onChange={(e) => setBench(e.target.value)}
                disabled={disabled}
              >
                {currentHighCourt.benches.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </>
        ) : forumTier === "DISTRICT_COURT" ? (
          <>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="3. Judicial District *"
                value={districtCode}
                onChange={(e) => setDistrictCode(e.target.value)}
                disabled={disabled}
              >
                {availableDistricts.map((d) => (
                  <MenuItem key={d.code} value={d.code}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="4. Court Complex *"
                value={courtComplex}
                onChange={(e) => setCourtComplex(e.target.value)}
                disabled={disabled}
                placeholder="e.g. Tis Hazari / Surajpur / Saket"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="5. Court Establishment Type *"
                value={establishmentType}
                onChange={(e) => setEstablishmentType(e.target.value)}
                disabled={disabled}
              >
                <MenuItem value="DISTRICT_SESSIONS">District & Sessions Judge Court</MenuItem>
                <MenuItem value="COMMERCIAL_COURT">Commercial Court (Comm. Courts Act)</MenuItem>
                <MenuItem value="FAMILY_COURT">Family Court (Matrimonial/Custody)</MenuItem>
                <MenuItem value="POCSO_SPECIAL">Special POCSO / SC-ST Court</MenuItem>
                <MenuItem value="CJM_MAGISTRATE">Chief Judicial Magistrate (CJM)</MenuItem>
              </TextField>
            </Grid>
          </>
        ) : null}

        {/* COURT-SPECIFIC CASE TYPE */}
        <Grid item xs={12} sm={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Court Case Type (Official Code) *"
            value={caseTypeId}
            onChange={(e) => handleCaseTypeChange(e.target.value)}
            disabled={disabled}
            helperText={`${availableCaseTypes.length} official case type(s) available for this court.`}
          >
            {availableCaseTypes.map((ct) => (
              <MenuItem key={ct.id} value={ct.id}>
                <Typography variant="body2" fontWeight={800}>
                  [{ct.code}] {ct.name}
                </Typography>
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* CASE CATEGORY */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            label="Statutory Case Category"
            value={caseCategory}
            onChange={(e) => setCaseCategory(e.target.value)}
            disabled={disabled}
          />
        </Grid>

        {/* CASE SUB-CATEGORY */}
        <Grid item xs={12} sm={4}>
          {selectedCaseType.subCategories?.length > 0 ? (
            <TextField
              select
              fullWidth
              size="small"
              label="Subject Sub-Category"
              value={caseSubCategory}
              onChange={(e) => setCaseSubCategory(e.target.value)}
              disabled={disabled}
            >
              {selectedCaseType.subCategories.map((sub) => (
                <MenuItem key={sub} value={sub}>
                  {sub}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              fullWidth
              size="small"
              label="Subject Sub-Category"
              value={caseSubCategory}
              onChange={(e) => setCaseSubCategory(e.target.value)}
              disabled={disabled}
              placeholder="e.g. Contract Breach / Injunction"
            />
          )}
        </Grid>

        {/* 16-CHARACTER eCOURTS CNR NUMBER */}
        {showCNR && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="16-Character eCourts CNR Number (Optional)"
              value={cnrNumber}
              onChange={(e) => setCnrNumber(e.target.value.toUpperCase())}
              placeholder="e.g. UPGZ010012342026 / DLHC010043212026"
              InputProps={{
                endAdornment: cnrValidation ? (
                  <InputAdornment position="end">
                    {cnrValidation.valid ? (
                      <Chip label="Valid CNR" color="success" size="small" icon={<CheckCircleIcon />} sx={{ height: 20, fontSize: "0.68rem", fontWeight: 800 }} />
                    ) : (
                      <Chip label="Invalid Format" color="error" size="small" icon={<WarningIcon />} sx={{ height: 20, fontSize: "0.68rem", fontWeight: 800 }} />
                    )}
                  </InputAdornment>
                ) : null,
              }}
              helperText={
                cnrValidation
                  ? cnrValidation.message
                  : "National Case Record Number for real-time cause list & order sync."
              }
            />
          </Grid>
        )}

        {/* LIVE RESOLVED JURISDICTION BADGE */}
        <Grid item xs={12}>
          <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px dashed #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="caption" color="#1e293b">
              <strong>Resolved Official Forum:</strong> {compiledCourtName}
            </Typography>
            <Chip
              label={selectedCaseType.code ? `Type: [${selectedCaseType.code}] ${selectedCaseType.name}` : "Court Case"}
              size="small"
              color="primary"
              sx={{ fontWeight: 800, fontSize: "0.68rem", height: 20 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
