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
  ListSubheader,
  Card,
  CardActionArea,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";

import LocationService from "../../services/locationService.js";
import JudiciaryMasterService, {
  JUDICIAL_TIERS,
} from "../../services/judiciaryMasterService.js";

export const TIER_COLOR_THEMES = {
  SUPREME_COURT: {
    primary: "#7c3aed",
    primaryDark: "#5b21b6",
    bgGlow: "#f5f3ff",
    borderLight: "#ddd6fe",
    borderActive: "#7c3aed",
    chipBg: "#ede9fe",
    chipText: "#5b21b6",
    accentBadge: "🟣 SUPREME COURT OF INDIA (सुप्रीम कोर्ट)",
    icon: "🏛️",
  },
  HIGH_COURT: {
    primary: "#1d4ed8",
    primaryDark: "#1e40af",
    bgGlow: "#eff6ff",
    borderLight: "#bfdbfe",
    borderActive: "#1d4ed8",
    chipBg: "#dbeafe",
    chipText: "#1e40af",
    accentBadge: "🔵 HIGH COURT OF JUDICATURE (उच्च न्यायालय)",
    icon: "⚖️",
  },
  DISTRICT_COURT: {
    primary: "#059669",
    primaryDark: "#065f46",
    bgGlow: "#ecfdf5",
    borderLight: "#a7f3d0",
    borderActive: "#059669",
    chipBg: "#d1fae5",
    chipText: "#065f46",
    accentBadge: "🟢 DISTRICT & SUBORDINATE COURTS (जिला व सत्र न्यायालय)",
    icon: "🏢",
  },
  TEHSIL_REVENUE: {
    primary: "#d97706",
    primaryDark: "#92400e",
    bgGlow: "#fffbeb",
    borderLight: "#fde68a",
    borderActive: "#d97706",
    chipBg: "#fef3c7",
    chipText: "#92400e",
    accentBadge: "🟡 TEHSIL & REVENUE DEPARTMENT (तहसील व राजस्व विभाग)",
    icon: "📜",
  },
  SPECIAL_TRIBUNAL: {
    primary: "#b91c1c",
    primaryDark: "#991b1b",
    bgGlow: "#fef2f2",
    borderLight: "#fecaca",
    borderActive: "#b91c1c",
    chipBg: "#fee2e2",
    chipText: "#991b1b",
    accentBadge: "🔴 SPECIAL STATUTORY TRIBUNALS (विशेष अधिकरण व आयोग)",
    icon: "💼",
  },
};

export default function CascadingCourtSelector({
  value = {},
  onChange = () => {},
  disabled = false,
  showCNR = true,
  defaultForum = "SUPREME_COURT",
}) {
  const [forumTier, setForumTier] = useState(value.forumTier || defaultForum);

  // Synchronized Active Theme
  const activeTheme = useMemo(() => {
    return TIER_COLOR_THEMES[forumTier] || TIER_COLOR_THEMES.SUPREME_COURT;
  }, [forumTier]);

  const [stateCode, setStateCode] = useState(value.stateCode || "ST-09");
  const [highCourtCode, setHighCourtCode] = useState(value.highCourtCode || "HC-ALL");
  const [bench, setBench] = useState(value.bench || "Prayagraj Principal Seat");
  const [districtCode, setDistrictCode] = useState(value.districtCode || "DST-140");
  const [courtComplex, setCourtComplex] = useState(value.courtComplex || "Surajpur District Court Complex");
  const [establishmentType, setEstablishmentType] = useState(value.establishmentType || "DISTRICT_SESSIONS");
  
  // Revenue & Tehsil Specifics
  const [revenueLevel, setRevenueLevel] = useState(value.revenueLevel || "TEHSILDAR_COURT");
  const [tehsilName, setTehsilName] = useState(value.tehsilName || "Sadar Tehsil");

  // Tribunal Specifics
  const [tribunalId, setTribunalId] = useState(value.tribunalId || "NCLT");
  const [tribunalBench, setTribunalBench] = useState(value.tribunalBench || "Principal Bench (New Delhi)");

  // Case Type, Category, Sub-Category & CNR
  const [caseTypeId, setCaseTypeId] = useState(value.caseTypeId || "");
  const [caseCategory, setCaseCategory] = useState(value.caseCategory || "");
  const [caseSubCategory, setCaseSubCategory] = useState(value.caseSubCategory || "");
  const [cnrNumber, setCnrNumber] = useState(value.cnrNumber || "");

  // Master Data Catalogs
  const states = useMemo(() => LocationService.getStates(), []);
  const highCourts = useMemo(() => JudiciaryMasterService.getHighCourts(), []);
  const revenueLevels = useMemo(() => JudiciaryMasterService.getRevenueLevels(), []);
  const specialTribunals = useMemo(() => JudiciaryMasterService.getSpecialTribunals(), []);

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

  // Selected District Object (Guaranteed Valid Match)
  const selectedDistrict = useMemo(() => {
    return availableDistricts.find((d) => d.code === districtCode) || availableDistricts[0] || {};
  }, [availableDistricts, districtCode]);

  // High Courts associated with State
  const currentHighCourt = useMemo(() => {
    return highCourts.find((h) => h.code === highCourtCode) || highCourts[0];
  }, [highCourts, highCourtCode]);

  // Active Special Tribunal Record
  const selectedTribunal = useMemo(() => {
    return specialTribunals.find((t) => t.id === tribunalId) || specialTribunals[0];
  }, [specialTribunals, tribunalId]);

  // ─── SYNCHRONIZATION HANDLERS ────────────────────────────────────────────

  // Handle State Change -> Auto-Sync High Court, Benches & Districts
  const handleStateChange = (newStateCode) => {
    setStateCode(newStateCode);
    const targetState = states.find((s) => s.code === newStateCode);

    // 1. Match High Court
    let matchedHC = highCourts.find((h) => h.stateCode === newStateCode);
    if (!matchedHC && targetState?.highCourt) {
      matchedHC = highCourts.find((h) => h.name.toLowerCase().includes(targetState.highCourt.toLowerCase()));
    }
    if (!matchedHC) matchedHC = highCourts[0];

    setHighCourtCode(matchedHC.code);
    setBench(matchedHC.benches?.[0] || "Principal Seat");

    // 2. Reset Districts
    const newDists = LocationService.getDistrictsByState(newStateCode);
    if (newDists.length > 0) {
      setDistrictCode(newDists[0].code);
      setCourtComplex(newDists[0].courtComplex || "District Court Complex");
    } else {
      setDistrictCode(`DST-${newStateCode}-01`);
      setCourtComplex("District Court Complex");
    }
  };

  // Handle Direct High Court Registry Change
  const handleHighCourtChange = (newHCCode) => {
    setHighCourtCode(newHCCode);
    const hc = highCourts.find((h) => h.code === newHCCode);
    if (hc) {
      setBench(hc.benches?.[0] || "Principal Seat");
      if (hc.stateCode && hc.stateCode !== stateCode) {
        setStateCode(hc.stateCode);
      }
    }
  };

  // Handle District Change
  const handleDistrictChange = (newDistCode) => {
    setDistrictCode(newDistCode);
    const d = availableDistricts.find((item) => item.code === newDistCode);
    if (d?.courtComplex) setCourtComplex(d.courtComplex);
  };

  // Court-Specific Case Types Resolution
  const availableCaseTypes = useMemo(() => {
    if (forumTier === "SUPREME_COURT") {
      return JudiciaryMasterService.getSupremeCourtCaseTypes();
    }
    if (forumTier === "HIGH_COURT") {
      return JudiciaryMasterService.getAllIndiaHighCourtCaseTypes();
    }
    if (forumTier === "DISTRICT_COURT") {
      return JudiciaryMasterService.getCaseTypesForDistrictEstablishment(establishmentType);
    }
    if (forumTier === "TEHSIL_REVENUE") {
      return JudiciaryMasterService.getRevenueCaseTypes();
    }
    if (forumTier === "SPECIAL_TRIBUNAL") {
      return selectedTribunal.caseTypes || [];
    }
    return [];
  }, [forumTier, establishmentType, selectedTribunal]);

  // Auto-Select Case Type if none selected
  useEffect(() => {
    if (availableCaseTypes.length > 0 && !availableCaseTypes.some((c) => c.id === caseTypeId)) {
      setCaseTypeId(availableCaseTypes[0].id);
      setCaseCategory(availableCaseTypes[0].category || "");
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
      setCaseCategory(ct.category || "");
      setCaseSubCategory(ct.subCategories?.[0] || "");
    }
  };

  // CNR Validation
  const cnrValidation = useMemo(() => {
    if (!cnrNumber.trim()) return null;
    return JudiciaryMasterService.validateCNR(cnrNumber);
  }, [cnrNumber]);

  // Build Comprehensive Court Jurisdiction String
  const compiledCourtName = useMemo(() => {
    if (forumTier === "SUPREME_COURT") return "Supreme Court of India, Tilak Marg, New Delhi";
    if (forumTier === "HIGH_COURT") return `${currentHighCourt.name} (${bench})`;
    if (forumTier === "TEHSIL_REVENUE") {
      const dist = selectedDistrict.name || "District";
      const rev = revenueLevels.find((r) => r.id === revenueLevel)?.name || "Revenue Court";
      return `${rev}, ${tehsilName}, ${dist} (${selectedState.name})`;
    }
    if (forumTier === "SPECIAL_TRIBUNAL") {
      return `${selectedTribunal.name} — ${tribunalBench}`;
    }
    const dist = selectedDistrict.name || "District";
    const estMap = {
      DISTRICT_SESSIONS: "District & Sessions Court",
      FAMILY_COURT: "Family Court",
      COMMERCIAL_COURT: "Commercial Court",
      POCSO_SPECIAL: "Special POCSO / SC-ST Court",
      CJM_MAGISTRATE: "Chief Judicial Magistrate (CJM) Court",
    };
    return `${estMap[establishmentType] || 'District Court'}, ${courtComplex}, ${dist} (${selectedState.name})`;
  }, [
    forumTier,
    currentHighCourt,
    bench,
    revenueLevels,
    revenueLevel,
    tehsilName,
    selectedDistrict,
    selectedState,
    selectedTribunal,
    tribunalBench,
    establishmentType,
    courtComplex,
  ]);

  // Emit Structured State Upwards
  useEffect(() => {
    const distName = availableDistricts.find((d) => d.code === districtCode)?.name || "District";
    onChange({
      forumTier,
      stateCode: forumTier === "SUPREME_COURT" ? "NATIONAL" : stateCode,
      stateName: forumTier === "SUPREME_COURT" ? "India (National)" : (selectedState.name || "State"),
      districtCode: (forumTier === "DISTRICT_COURT" || forumTier === "TEHSIL_REVENUE") ? districtCode : "",
      districtName: (forumTier === "DISTRICT_COURT" || forumTier === "TEHSIL_REVENUE") ? distName : "",
      highCourtCode: forumTier === "HIGH_COURT" ? currentHighCourt.code : "",
      highCourtName: forumTier === "HIGH_COURT" ? currentHighCourt.name : "",
      bench: forumTier === "HIGH_COURT" ? bench : (forumTier === "SPECIAL_TRIBUNAL" ? tribunalBench : "Main"),
      courtComplex: forumTier === "DISTRICT_COURT" ? courtComplex : "",
      establishmentType: forumTier === "DISTRICT_COURT" ? establishmentType : (forumTier === "TEHSIL_REVENUE" ? revenueLevel : forumTier),
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
    revenueLevel,
    tehsilName,
    tribunalId,
    selectedTribunal,
    tribunalBench,
    compiledCourtName,
    caseTypeId,
    selectedCaseType,
    caseCategory,
    caseSubCategory,
    cnrNumber,
    cnrValidation,
  ]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        bgcolor: "#ffffff",
        borderColor: activeTheme.borderLight,
        borderWidth: 1.5,
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* 1. TOP-LEVEL 5 VISUAL TOUCH CARDS WITH DYNAMIC COLOR HIGHLIGHTING */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={900} color="#0f172a">
          STEP 1: SELECT JUDICIAL FORUM / COURT JURISDICTION (अदालत का स्तर चुनें) *
        </Typography>
        <Chip
          label={activeTheme.accentBadge}
          size="small"
          sx={{
            fontWeight: 900,
            fontSize: "0.72rem",
            bgcolor: activeTheme.bgGlow,
            color: activeTheme.primaryDark,
            border: `1px solid ${activeTheme.borderActive}`,
          }}
        />
      </Stack>

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {JUDICIAL_TIERS.map((tier) => {
          const isSelected = forumTier === tier.id;
          const tierTheme = TIER_COLOR_THEMES[tier.id] || TIER_COLOR_THEMES.SUPREME_COURT;

          return (
            <Grid item xs={12} sm={6} md={2.4} key={tier.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: "16px",
                  borderColor: isSelected ? tierTheme.primary : tierTheme.borderLight,
                  bgcolor: isSelected ? tierTheme.bgGlow : `${tierTheme.bgGlow}88`,
                  borderWidth: isSelected ? 2.5 : 1.5,
                  boxShadow: isSelected
                    ? `0 6px 20px ${tierTheme.primary}45`
                    : "0 2px 8px rgba(0,0,0,0.04)",
                  transform: isSelected ? "translateY(-3px) scale(1.02)" : "none",
                  transition: "all 0.25s ease-in-out",
                  height: "100%",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: tierTheme.primary,
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 14px ${tierTheme.primary}25`,
                  },
                }}
              >
                <CardActionArea onClick={() => setForumTier(tier.id)} sx={{ p: 1.5, height: "100%" }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Typography variant="h6">{tier.icon}</Typography>
                    <Typography variant="body2" fontWeight={900} color={isSelected ? tierTheme.primary : "#1e293b"}>
                      {tier.label}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    color={isSelected ? tierTheme.primaryDark : "#475569"}
                    display="block"
                    sx={{ lineHeight: 1.2, fontWeight: isSelected ? 800 : 600 }}
                  >
                    {tier.hindiLabel}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 2. DYNAMIC PROGRESSIVE FORM FIELDS WITH COLOR-MATCHED BORDERS */}
      <Box
        sx={{
          p: 2.2,
          borderRadius: "16px",
          bgcolor: activeTheme.bgGlow,
          border: `1.5px solid ${activeTheme.borderLight}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          mb: 2,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Grid container spacing={2}>
        {/* CASE A: SUPREME COURT OF INDIA */}
        {forumTier === "SUPREME_COURT" && (
          <>
            <Grid item xs={12} md={7}>
              <TextField
                select
                fullWidth
                size="small"
                label="Supreme Court Case Remedy / Classification *"
                value={caseTypeId}
                onChange={(e) => handleCaseTypeChange(e.target.value)}
                disabled={disabled}
              >
                <ListSubheader sx={{ fontWeight: 900, color: "#b91c1c", bgcolor: "#fee2e2" }}>
                  🚀 DIRECT TO SUPREME COURT (बिना हाई कोर्ट: Art 32 / Transfer Petitions / Original Suits)
                </ListSubheader>
                {availableCaseTypes
                  .filter((c) => c.group?.includes("Direct"))
                  .map((ct) => (
                    <MenuItem key={ct.id} value={ct.id}>
                      <Typography variant="body2" fontWeight={800}>
                        [{ct.code}] {ct.name}
                      </Typography>
                    </MenuItem>
                  ))}

                <ListSubheader sx={{ fontWeight: 900, color: "#1d4ed8", bgcolor: "#dbeafe" }}>
                  ⚖️ APPELLATE & APEX REMEDIES (हाई कोर्ट के बाद: SLP / Review / Curative)
                </ListSubheader>
                {availableCaseTypes
                  .filter((c) => c.group?.includes("Appellate"))
                  .map((ct) => (
                    <MenuItem key={ct.id} value={ct.id}>
                      <Typography variant="body2" fontWeight={800}>
                        [{ct.code}] {ct.name}
                      </Typography>
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                label="Constitutional / Statutory Subject Category"
                value={caseCategory}
                onChange={(e) => setCaseCategory(e.target.value)}
                disabled={disabled}
              />
            </Grid>
          </>
        )}

        {/* CASE B: HIGH COURT OF JUDICATURE */}
        {forumTier === "HIGH_COURT" && (
          <>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="1. State / Union Territory *"
                value={stateCode}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={disabled}
              >
                {states.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.name} ({s.type})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="2. High Court Registry *"
                value={currentHighCourt.code}
                onChange={(e) => handleHighCourtChange(e.target.value)}
                disabled={disabled}
              >
                {highCourts.map((h) => (
                  <MenuItem key={h.code} value={h.code}>
                    {h.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="3. Designated Bench / Circuit *"
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

            <Grid item xs={12} md={7}>
              <TextField
                select
                fullWidth
                size="small"
                label="4. High Court Case Type (All-India Master) *"
                value={caseTypeId}
                onChange={(e) => handleCaseTypeChange(e.target.value)}
                disabled={disabled}
              >
                {["1. Constitutional & Writs (Art. 226/227)", "2. Criminal Law (CrPC / BNSS)", "3. Civil & Appellate (CPC)", "4. Commercial, IPR & Arbitration", "5. Taxation & Revenue", "6. Contempt, Transfer & Review"].map((groupName) => (
                  [
                    <ListSubheader key={groupName} sx={{ fontWeight: 900, color: "#1e3a8a", bgcolor: "#f1f5f9" }}>
                      {groupName}
                    </ListSubheader>,
                    ...availableCaseTypes
                      .filter((c) => c.group === groupName)
                      .map((ct) => (
                        <MenuItem key={ct.id} value={ct.id}>
                          <Typography variant="body2" fontWeight={800}>
                            [{ct.code}] {ct.name}
                          </Typography>
                        </MenuItem>
                      )),
                  ]
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                label="5. High Court Subject Category"
                value={caseCategory}
                onChange={(e) => setCaseCategory(e.target.value)}
                disabled={disabled}
              />
            </Grid>
          </>
        )}

        {/* CASE C: DISTRICT & SUBORDINATE COURTS */}
        {forumTier === "DISTRICT_COURT" && (
          <>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="1. State / Union Territory *"
                value={stateCode}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={disabled}
              >
                {states.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.name} ({s.type})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="2. Judicial District *"
                value={selectedDistrict.code || districtCode}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={disabled}
              >
                {availableDistricts.map((d) => (
                  <MenuItem key={d.code} value={d.code}>
                    {d.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="3. Court Complex *"
                value={courtComplex}
                onChange={(e) => setCourtComplex(e.target.value)}
                disabled={disabled}
                placeholder="e.g. Tis Hazari / Surajpur / Saket"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="4. Court Establishment Type *"
                value={establishmentType}
                onChange={(e) => setEstablishmentType(e.target.value)}
                disabled={disabled}
              >
                <MenuItem value="DISTRICT_SESSIONS">🏢 District & Sessions Judge Court</MenuItem>
                <MenuItem value="COMMERCIAL_COURT">💼 Commercial Court (Comm. Courts Act 2015)</MenuItem>
                <MenuItem value="FAMILY_COURT">👨‍👩‍👧 Family Court (Matrimonial / Custody)</MenuItem>
                <MenuItem value="POCSO_SPECIAL">🛡️ Special POCSO / SC-ST Court</MenuItem>
                <MenuItem value="CJM_MAGISTRATE">⚖️ Chief Judicial Magistrate (CJM / NI 138)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="5. District Case Type *"
                value={caseTypeId}
                onChange={(e) => handleCaseTypeChange(e.target.value)}
                disabled={disabled}
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
          </>
        )}

        {/* CASE D: TEHSIL & REVENUE DEPARTMENT */}
        {forumTier === "TEHSIL_REVENUE" && (
          <>
            {/* ROW 1: STATE, DISTRICT & TEHSIL (3 Equal Spacious Columns) */}
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="1. State *"
                value={stateCode}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={disabled}
              >
                {states.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="2. District *"
                value={selectedDistrict.code || districtCode}
                onChange={(e) => handleDistrictChange(e.target.value)}
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
                label="3. Tehsil Name *"
                value={tehsilName}
                onChange={(e) => setTehsilName(e.target.value)}
                disabled={disabled}
                placeholder="e.g. Sadar Tehsil / दादरी"
              />
            </Grid>

            {/* ROW 2: REVENUE COURT LEVEL & CASE ACTION (2 Spacious Columns) */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="4. Revenue Court Level *"
                value={revenueLevel}
                onChange={(e) => setRevenueLevel(e.target.value)}
                disabled={disabled}
              >
                {revenueLevels.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="5. Revenue Case Type (दाखिल-खारिज / बंटवारा / पैमाइश) *"
                value={caseTypeId}
                onChange={(e) => handleCaseTypeChange(e.target.value)}
                disabled={disabled}
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
          </>
        )}

        {/* CASE E: SPECIAL STATUTORY TRIBUNALS */}
        {forumTier === "SPECIAL_TRIBUNAL" && (
          <>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="1. Statutory Tribunal / Commission *"
                value={tribunalId}
                onChange={(e) => {
                  setTribunalId(e.target.value);
                  const found = specialTribunals.find((t) => t.id === e.target.value);
                  if (found?.benches?.length > 0) setTribunalBench(found.benches[0]);
                }}
                disabled={disabled}
              >
                {specialTribunals.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="2. Tribunal Zonal Bench *"
                value={tribunalBench}
                onChange={(e) => setTribunalBench(e.target.value)}
                disabled={disabled}
              >
                {selectedTribunal.benches.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="3. Tribunal Petition / Appeal Type *"
                value={caseTypeId}
                onChange={(e) => handleCaseTypeChange(e.target.value)}
                disabled={disabled}
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
          </>
        )}

        {/* SUB-CATEGORY (IF APPLICABLE) */}
        {selectedCaseType.subCategories?.length > 0 && (
          <Grid item xs={12} md={6}>
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
          </Grid>
        )}

        {/* 16-CHARACTER eCOURTS CNR NUMBER */}
        {showCNR && (
          <Grid item xs={12} md={6}>
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

        </Grid>
      </Box>

      {/* 3. LIVE REAL-TIME JURISDICTION SUMMARY BADGE (Synchronized Glow) */}
      <Box
        sx={{
          p: 1.8,
          bgcolor: activeTheme.bgGlow,
          borderRadius: 2,
          border: `1.5px solid ${activeTheme.borderActive}`,
          boxShadow: `0 2px 8px ${activeTheme.primary}20`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Box>
          <Typography variant="body2" color={activeTheme.primaryDark} fontWeight={900}>
            🏛️ {compiledCourtName}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {selectedCaseType.category ? `Category: ${selectedCaseType.category}` : "All-India Legal Hierarchy"}
            {caseSubCategory ? ` • Sub: ${caseSubCategory}` : ""}
          </Typography>
        </Box>

        <Chip
          label={selectedCaseType.code ? `[${selectedCaseType.code}] ${selectedCaseType.name}` : "Selected Forum"}
          size="small"
          sx={{
            fontWeight: 900,
            fontSize: "0.75rem",
            height: 26,
            bgcolor: activeTheme.primary,
            color: "#ffffff",
          }}
        />
      </Box>
    </Paper>
  );
}
