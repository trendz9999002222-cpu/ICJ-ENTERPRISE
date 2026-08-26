import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Stack,
  Chip,
  Divider,
} from "@mui/material";

// Icons
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";

import MultiTagAutosuggestField from "../common/MultiTagAutosuggestField.jsx";

// ─── MASTER SUGGESTION CATALOGS ──────────────────────────────────────────────
const SUGGESTED_BARS = [
  "Supreme Court Bar Association (SCBA)",
  "Delhi High Court Bar Association (DHCBA)",
  "Allahabad High Court Bar Association",
  "Saket District Court Bar Association",
  "Rohini Court Bar Association",
  "Patiala House Court Bar Association",
  "Tis Hazari Court Bar Association",
  "Gautam Buddha Nagar Bar Association",
  "Ghaziabad District Bar Association",
  "Lucknow High Court Bench Bar Association",
  "Jaipur High Court Bar Association",
  "Bombay High Court Bar Association",
  "ICAI Northern India Regional Council (NIRC)",
  "ICSI Northern India Chapter",
];

const SUGGESTED_DISTRICTS = [
  "New Delhi",
  "South Delhi",
  "Central Delhi",
  "North West Delhi",
  "Gautam Buddha Nagar (Noida/Gr. Noida)",
  "Ghaziabad",
  "Faridabad",
  "Gurugram (Gurgaon)",
  "Prayagraj (Allahabad)",
  "Lucknow",
  "Varanasi",
  "Agra",
  "Jaipur",
  "Mumbai City",
  "Pune",
  "Patna",
];

const SUGGESTED_COURTS = [
  "भारत का सर्वोच्च न्यायालय (Supreme Court of India)",
  "राज्य उच्च न्यायालय (State High Court)",
  "ज़िला एवं सत्र न्यायालय (District & Sessions Court)",
  "मुख्य न्यायिक मजिस्ट्रेट / CJM कोर्ट",
  "राष्ट्रीय कंपनी कानून अधिकरण (NCLT / NCLAT)",
  "ऋण वसूली अधिकरण (DRT / DRAT)",
  "भू-संपदा विनियामक अधिकरण (RERA Tribunal)",
  "उपभोक्ता विवाद निवारण आयोग (Consumer Commission)",
  "तहसील, SDM एवं राजस्व न्यायालय (Revenue Courts)",
  "सशस्त्र बल अधिकरण (Armed Forces Tribunal - AFT)",
  "केंद्रीय प्रशासनिक अधिकरण (CAT)",
  "आयकर अपीलीय अधिकरण (ITAT)",
  "मध्यस्थता एवं सुलह अधिकरण (Arbitration Tribunal)",
];

const SUGGESTED_MATTERS = [
  "क्रिमिनल ट्रायल एवं नियमित/अग्रिम जमानत (Bail)",
  "सिविल वाद, संपत्ति विवाद व टाइटल डीड",
  "चेक बाउंस वाद (Section 138 NI Act)",
  "पारिवारिक, वैवाहिक व तलाक विवाद (Matrimonial)",
  "कंपनी लॉ, मर्जर व IBC दिवालियापन (Insolvency)",
  "जीएसटी, आयकर व कस्टम विधिक अपील (Taxation)",
  "सर्विस मैटर, पेंशन व सरकारी सेवा विवाद",
  "मोटर दुर्घटना दावा अधिकरण (MACT Claim)",
  "उपभोक्ता संरक्षण व बिल्डर-बायर विवाद (RERA)",
  "भू-राजस्व संहिता, दाखिल-खारिज व पैमाइश",
  "हैंडराइटिंग एवं हस्ताक्षर फॉरेंसिक साक्ष्य (QDE)",
  "साइबर क्राइम, डिजिटल साक्ष्य व 65B/63 BSA",
  "संविधान पीठ एवं रिट याचिकाएं (Article 226/32)",
];

export default function MultiJurisdictionPracticeMatrix({ currentUser, onSaveSuccess }) {
  const [barAssociations, setBarAssociations] = useState(
    currentUser?.barAssociations || ["Delhi High Court Bar Association (DHCBA)", "Saket District Court Bar Association"]
  );

  const [practiceDistricts, setPracticeDistricts] = useState(
    currentUser?.practiceDistricts || ["New Delhi", "Gautam Buddha Nagar (Noida/Gr. Noida)"]
  );

  const [practicingCourts, setPracticingCourts] = useState(
    currentUser?.practicingCourts || ["राज्य उच्च न्यायालय (State High Court)", "ज़िला एवं सत्र न्यायालय (District & Sessions Court)"]
  );

  const [matterSpecializations, setMatterSpecializations] = useState(
    currentUser?.matterSpecializations || [
      "क्रिमिनल ट्रायल एवं नियमित/अग्रिम जमानत (Bail)",
      "सिविल वाद, संपत्ति विवाद व टाइटल डीड",
    ]
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    try {
      const updated = {
        ...currentUser,
        barAssociations,
        practiceDistricts,
        practicingCourts,
        matterSpecializations,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem("icj_user", JSON.stringify(updated));
      setSavedSuccess(true);
      if (onSaveSuccess) onSaveSuccess(updated);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* 1. TOP HEADER */}
      <Box sx={{ mb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
          <Box>
            <Typography variant="h6" fontWeight={900} color="#0f172a">
              🎯 बहु-क्षेत्रीय प्रैक्टिस एवं केस वर्गीकरण मैट्रिक्स (Multi-Jurisdiction Practice Matrix)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ऑटो-सेलेक्ट सुझावों पर क्लिक करें अथवा अपनी स्थानीय बार/ज़िले/केस का नाम खुद टाइप करें (Select + Free-Type)
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="medium"
            startIcon={savedSuccess ? <CheckCircleIcon /> : <SaveIcon />}
            onClick={handleSave}
            sx={{
              bgcolor: savedSuccess ? "#16a34a" : "#1e40af",
              "&:hover": { bgcolor: savedSuccess ? "#15803d" : "#1e3a8a" },
              fontWeight: 800,
              borderRadius: 2,
              px: 3,
              textTransform: "none",
            }}
          >
            {savedSuccess ? "✓ प्रैक्टिस मैट्रिक्स सुरक्षित हुई!" : "💾 प्रैक्टिस मैट्रिक्स सुरक्षित करें"}
          </Button>
        </Stack>
      </Box>

      {/* 2. 2 STRICTLY EQUAL SYMMETRICAL BOXES (50% - 50% GRID) */}
      <Grid container spacing={2.5} sx={{ flex: 1, alignItems: "stretch", mb: 1 }}>
        {/* BOX 1: BAR ASSOCIATIONS & PRACTICE DISTRICTS */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Card
            variant="outlined"
            sx={{
              flex: 1,
              borderRadius: 3.5,
              p: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderColor: "#cbd5e1",
              bgcolor: "#ffffff",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#0f172a" mb={0.5}>
                1. बार एसोसिएशन्स एवं कार्यक्षेत्र ज़िले
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                आप जिन-जिन बार एसोसिएशन्स और ज़िलों में विधिक सेवाएं प्रदान करते हैं।
              </Typography>

              {/* Field 1: Bar Associations */}
              <MultiTagAutosuggestField
                label="🏛️ संबद्ध बार एसोसिएशन्स / काउंसिल्स (Affiliated Bar Associations)"
                placeholder="बार का नाम टाइप करें और Enter दबाएं..."
                suggestions={SUGGESTED_BARS}
                value={barAssociations}
                onChange={setBarAssociations}
                color="primary"
              />

              <Divider sx={{ my: 2 }} />

              {/* Field 2: Practice Districts */}
              <MultiTagAutosuggestField
                label="📍 प्रैक्टिस ज़िले (Operating Practice Districts)"
                placeholder="ज़िले का नाम टाइप करें और Enter दबाएं..."
                suggestions={SUGGESTED_DISTRICTS}
                value={practiceDistricts}
                onChange={setPracticeDistricts}
                color="secondary"
              />
            </Box>

            <Typography variant="caption" color="#16a34a" fontWeight={700}>
              ✓ कुल {barAssociations.length} बार व {practiceDistricts.length} ज़िले चयनित हैं।
            </Typography>
          </Card>
        </Grid>

        {/* BOX 2: COURTS/TRIBUNALS & CASE TYPES */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Card
            variant="outlined"
            sx={{
              flex: 1,
              borderRadius: 3.5,
              p: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderColor: "#cbd5e1",
              bgcolor: "#ffffff",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#0f172a" mb={0.5}>
                2. न्यायालय फोरम एवं केस विशेषज्ञताएं
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                आप जिन-जिन न्यायालयों में पेश होते हैं और जिस-जिस प्रकृति के केस लेते हैं।
              </Typography>

              {/* Field 3: Practicing Courts */}
              <MultiTagAutosuggestField
                label="⚖️ न्यायालय एवं अधिकरण फोरम (Practicing Courts & Tribunals)"
                placeholder="कोर्ट का नाम टाइप करें और Enter दबाएं..."
                suggestions={SUGGESTED_COURTS}
                value={practicingCourts}
                onChange={setPracticingCourts}
                color="info"
              />

              <Divider sx={{ my: 2 }} />

              {/* Field 4: Matter Specializations */}
              <MultiTagAutosuggestField
                label="📜 केस के प्रकार व विधिक विशेषज्ञताएं (Case Matter Taxonomy)"
                placeholder="केस का प्रकार टाइप करें और Enter दबाएं..."
                suggestions={SUGGESTED_MATTERS}
                value={matterSpecializations}
                onChange={setMatterSpecializations}
                color="success"
              />
            </Box>

            <Typography variant="caption" color="#2563eb" fontWeight={700}>
              ✓ कुल {practicingCourts.length} न्यायालय फोरम व {matterSpecializations.length} केस श्रेणियां चयनित हैं।
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
