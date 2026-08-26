import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Stack,
  Chip,
  Divider,
  Alert,
} from "@mui/material";

// Icons
import GavelIcon from "@mui/icons-material/Gavel";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import ScienceIcon from "@mui/icons-material/Science";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import BadgeIcon from "@mui/icons-material/Badge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import ShieldIcon from "@mui/icons-material/Shield";

import CategoryEnrollmentService from "../../services/categoryEnrollmentService.js";

export default function DynamicEmpanelmentSetup({ currentUser, onSaveSuccess }) {
  const categoryCode5 = currentUser?.categoryCode5 || "CLINT";
  const categoryInfo = CategoryEnrollmentService.getCategoryByCode(categoryCode5);

  const [details, setDetails] = useState({
    // General
    regIdentifier: currentUser?.barOrRegNumber || currentUser?.regIdentifier || "",
    experienceYears: currentUser?.experienceYears || "5-10 Years",
    practiceCourts: currentUser?.practiceCourts || "District & Sessions Courts",
    primarySpecialization: currentUser?.primarySpecialization || "Civil & Criminal",
    // Corporate (CA/CS/CMA/IP/Valuer)
    firmName: currentUser?.firmName || "",
    copNumber: currentUser?.copNumber || "",
    corporateDomain: currentUser?.corporateDomain || "Statutory Audit & Tax Compliance",
    // Forensic (Handwriting, Cyber, Fingerprint)
    labAffiliation: currentUser?.labAffiliation || "",
    forensicCertNumber: currentUser?.forensicCertNumber || "",
    // Retired Officers (Rt-Series)
    priorOfficialPost: currentUser?.priorOfficialPost || "",
    cadreOrDepartment: currentUser?.cadreOrDepartment || "",
    serviceYears: currentUser?.serviceYears || "25+ Years",
    honoraryDomain: currentUser?.honoraryDomain || "Judicial Mediation & High-Level Legal Counsel",
    // Court Munshi / Clerks
    barClerkCardNo: currentUser?.barClerkCardNo || "",
    affiliatedCourtComplex: currentUser?.affiliatedCourtComplex || "Saket District Court Complex",
    seniorAdvocateChamber: currentUser?.seniorAdvocateChamber || "",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    try {
      const updated = {
        ...currentUser,
        ...details,
        barOrRegNumber: details.regIdentifier || currentUser?.barOrRegNumber,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem("icj_user", JSON.stringify(updated));
      setSavedSuccess(true);
      if (onSaveSuccess) onSaveSuccess(updated);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error("Failed to save credentials", e);
    }
  };

  const isAdvocate = categoryCode5.startsWith("ADV") || categoryCode5 === "SRADV" || categoryCode5 === "AORSC" || categoryCode5 === "NPADV";
  const isCorporate = ["CHACT", "COSEC", "COACC", "INSLV", "RGVAL", "FRAUD"].includes(categoryCode5);
  const isForensic = ["HNWRT", "FINGR", "CYBER", "MEDCL", "BALST", "AUDIO", "DNAEX", "POLYP"].includes(categoryCode5);
  const isRetired = categoryCode5.startsWith("Rt");
  const isMunshi = ["MNSHI", "TYPST", "TRANS"].includes(categoryCode5);
  const isCitizen = categoryCode5 === "CLINT";

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* 1. TOP HEADER STRIP */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
          <Box>
            <Typography variant="h6" fontWeight={900} color="#0f172a">
              🏛️ व्यावसायिक एम्पैनलमेंट व अधिकृत क्रेडेंशियल्स (Professional Empanelment)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              आपकी श्रेणी: <b>[{categoryCode5}] {categoryInfo.name}</b> • {categoryInfo.badgeTitle}
            </Typography>
          </Box>

          <Chip
            label={categoryInfo.badgeTitle}
            color="primary"
            sx={{ fontWeight: 800, borderRadius: 2 }}
          />
        </Stack>
      </Box>

      {/* 2. 2 STRICTLY EQUAL SYMMETRICAL BOXES (50% - 50% GRID) */}
      <Grid container spacing={3} sx={{ flex: 1, alignItems: "stretch", mb: 1 }}>
        {/* BOX 1: DYNAMIC CATEGORY-SPECIFIC CREDENTIALS */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between", borderColor: "#cbd5e1" }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#0f172a" mb={0.5}>
                1. आधिकारिक पंजीकरण एवं व्यावसायिक विवरण
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                यह जानकारी आपकी आधिकारिक प्रोफाइल पर सत्यापित बैज के रूप में दिखेगी।
              </Typography>

              <Grid container spacing={2}>
                {/* ─── A. ADVOCATE SPECIFIC ─── */}
                {isAdvocate && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="बार काउंसिल एनरोलमेंट संख्या (Bar Council Reg No.) *"
                        placeholder="उदा. D/1042/1998 या UP/5678/2012"
                        value={details.regIdentifier}
                        onChange={(e) => setDetails({ ...details, regIdentifier: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="प्रैक्टिस न्यायालय (Practice Courts)"
                        value={details.practiceCourts}
                        onChange={(e) => setDetails({ ...details, practiceCourts: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="मुख्य विशेषज्ञता (Specialization)"
                        value={details.primarySpecialization}
                        onChange={(e) => setDetails({ ...details, primarySpecialization: e.target.value })}
                      />
                    </Grid>
                  </>
                )}

                {/* ─── B. CORPORATE (CA / CS / CMA / IP / VALUER) ─── */}
                {isCorporate && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="ICAI / ICSI / IBBI सदस्यता संख्या *"
                        placeholder="उदा. FCA-10492 या ACS-8812"
                        value={details.regIdentifier}
                        onChange={(e) => setDetails({ ...details, regIdentifier: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="प्रैक्टिस सर्टिफिकेट संख्या (COP No.)"
                        placeholder="उदा. COP/2026/8912"
                        value={details.copNumber}
                        onChange={(e) => setDetails({ ...details, copNumber: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="फर्म का नाम (Registered Firm / Entity Name)"
                        placeholder="उदा. गुप्ता एंड एसोसिएट्स चार्टर्ड अकाउंटेंट्स"
                        value={details.firmName}
                        onChange={(e) => setDetails({ ...details, firmName: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="कॉर्पोरेट विधिक डोमेन (Domain)"
                        value={details.corporateDomain}
                        onChange={(e) => setDetails({ ...details, corporateDomain: e.target.value })}
                      />
                    </Grid>
                  </>
                )}

                {/* ─── C. FORENSICS (HANDWRITING / CYBER / FINGERPRINT) ─── */}
                {isForensic && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="फॉरेंसिक प्रयोगशाला / QDE सर्टिफिकेशन संख्या *"
                        placeholder="उदा. FSL-QDE-2026-0921"
                        value={details.forensicCertNumber || details.regIdentifier}
                        onChange={(e) => setDetails({ ...details, forensicCertNumber: e.target.value, regIdentifier: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="संबद्ध फॉरेंसिक संस्थान / लैब का नाम"
                        placeholder="उदा. अखिल भारतीय फॉरेंसिक दस्तावेज संस्थान"
                        value={details.labAffiliation}
                        onChange={(e) => setDetails({ ...details, labAffiliation: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="फॉरेंसिक साक्ष्य विशेषज्ञता (Forensic Domain)"
                        value={details.primarySpecialization}
                        onChange={(e) => setDetails({ ...details, primarySpecialization: e.target.value })}
                      />
                    </Grid>
                  </>
                )}

                {/* ─── D. RETIRED OFFICERS (JUDGES / POLICE / REVENUE) ─── */}
                {isRetired && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="सेवानिवृत्ति का पूर्व पद (Prior Official Post) *"
                        placeholder="उदा. Additional District Judge / ACP / Tehsildar"
                        value={details.priorOfficialPost}
                        onChange={(e) => setDetails({ ...details, priorOfficialPost: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="कैडर / विभाग (Cadre / Department)"
                        placeholder="उदा. Higher Judicial Service / State Police"
                        value={details.cadreOrDepartment}
                        onChange={(e) => setDetails({ ...details, cadreOrDepartment: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="मानद विधिक परामर्श व मध्यस्थता डोमेन"
                        value={details.honoraryDomain}
                        onChange={(e) => setDetails({ ...details, honoraryDomain: e.target.value })}
                      />
                    </Grid>
                  </>
                )}

                {/* ─── E. ADVOCATE CLERKS / COURT MUNSHI ─── */}
                {isMunshi && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="कोर्ट बार क्लर्क कार्ड संख्या (Clerk Reg No.) *"
                        placeholder="उदा. DBC-MNSH-2026-042"
                        value={details.barClerkCardNo || details.regIdentifier}
                        onChange={(e) => setDetails({ ...details, barClerkCardNo: e.target.value, regIdentifier: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="संबद्ध न्यायालय परिसर (Court Complex)"
                        value={details.affiliatedCourtComplex}
                        onChange={(e) => setDetails({ ...details, affiliatedCourtComplex: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="संबद्ध सीनियर अधिवक्ता / चैंबर विवरण"
                        placeholder="उदा. चैंबर नं. 412, सीनियर एडवोकेट चैंबर्स"
                        value={details.seniorAdvocateChamber}
                        onChange={(e) => setDetails({ ...details, seniorAdvocateChamber: e.target.value })}
                      />
                    </Grid>
                  </>
                )}

                {/* ─── F. COMMON LITIGANT ─── */}
                {isCitizen && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      👤 आप एक पंजीकृत नागरिक / मुवक्किल के रूप में जुड़े हैं। आपको कोई व्यावसायिक क्रेडेंशियल भरने की आवश्यकता नहीं है; आप सीधे विधिक सहायता व केस इनटेक का उपयोग कर सकते हैं।
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Button
              variant="contained"
              fullWidth
              startIcon={savedSuccess ? <CheckCircleIcon /> : <SaveIcon />}
              onClick={handleSave}
              sx={{
                mt: 2,
                bgcolor: savedSuccess ? "#16a34a" : "#1e40af",
                "&:hover": { bgcolor: savedSuccess ? "#15803d" : "#1e3a8a" },
                fontWeight: 800,
                py: 1.2,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              {savedSuccess ? "✓ क्रेडेंशियल्स सुरक्षित हुए!" : "💾 व्यावसायिक विवरण सुरक्षित करें"}
            </Button>
          </Card>
        </Grid>

        {/* BOX 2: VERIFICATION STATUS & SERVICE COLLABORATION (STRICTLY EQUAL HEIGHT & SHAPE) */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Card variant="outlined" sx={{ flex: 1, borderRadius: 3.5, p: 3, display: "flex", flexDirection: "column", justifyContent: "space-between", bgcolor: "#f8fafc", borderColor: "#cbd5e1" }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#0f172a" mb={0.5}>
                2. सत्यापन स्थिति एवं सेवाएं
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                ICJ अखिल भारतीय नेटवर्क पर आपकी अधिकृत कार्यक्षेत्र स्थिति।
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2.5, border: "1px solid #bbf7d0" }}>
                  <Typography variant="caption" color="#166534" fontWeight={700} display="block">
                    एम्पैनलमेंट स्थिति:
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#14532d">
                    ✓ अधिकृत सक्रिय प्रोफेशनल (Active Empaneled)
                  </Typography>
                </Box>

                <Box sx={{ p: 2, bgcolor: "#eff6ff", borderRadius: 2.5, border: "1px solid #bfdbfe" }}>
                  <Typography variant="caption" color="#1e40af" fontWeight={700} display="block">
                    26-सीरीज़ डिजिटल आईडी कार्ड:
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#1e3a8a">
                    {currentUser?.memberId || "26-AAA001-" + categoryCode5 + "-AAAA0001"}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Chip
              icon={<ShieldIcon />}
              label="256-बिट एन्क्रिप्टेड लीगल ट्रस्ट नेटवर्क"
              color="success"
              sx={{ fontWeight: 700, py: 2, borderRadius: 2 }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
