import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  Grid,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShieldIcon from "@mui/icons-material/Shield";
import LockIcon from "@mui/icons-material/Lock";

export default function SovereignIntermediaryTerms() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 5, px: 2 }}>
      <Container maxWidth="lg">
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3, fontWeight: 800, textTransform: "none", color: "#0284c7" }}
        >
          मुख्य पृष्ठ पर वापस जाएं (Back to Home)
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: "24px",
            bgcolor: "#ffffff",
            border: "2px solid #e2e8f0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          {/* HEADER */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: "14px",
                bgcolor: "#0f172a",
                color: "#38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GavelIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip label="STATUTORY SAFE HARBOR" size="small" sx={{ bgcolor: "#059669", color: "#ffffff", fontWeight: 900, fontSize: "0.68rem" }} />
                <Chip label="DPDPA 2023 & IT ACT 2000" size="small" sx={{ bgcolor: "#0284c7", color: "#ffffff", fontWeight: 800, fontSize: "0.68rem" }} />
              </Stack>
              <Typography variant="h5" fontWeight={900} color="#0f172a">
                इंटरनेशनल कंसोर्टियम ऑफ ज्यूरिस्ट्स (ICJ) — वैधानिक मध्यस्थ सुरक्षा एवं इम्युनिटी नियमावली
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                Official Sovereign Safe Harbor, Zero-Knowledge Storage & Section 79 Compliance Framework (2026)
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* SECTION 1: SECTION 79 IT ACT */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={900} color="#0f172a" sx={{ mb: 1 }}>
              1. भारतीय सूचना प्रौद्योगिकी अधिनियम 2000 (Section 79 IT Act) — मध्यस्थ का कानूनी संरक्षण
            </Typography>
            <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.8 }}>
              इंटरनेशनल कंसोर्टियम ऑफ ज्यूरिस्ट्स (ICJ) केवल एक <strong>तकनीकी मध्यस्थ एवं विधिक संचार मंच (Intermediary & Technology Platform)</strong> के रूप में कार्य करता है। 
              सूचना प्रौद्योगिकी अधिनियम, 2000 की धारा 79 के प्रावधानों के अंतर्गत, किसी भी उपयोगकर्ता, अधिवक्ता या मुवक्किल द्वारा तैयार की गई याचिका, साक्ष्य, दस्तावेज या संचार सामग्री के लिए ICJ, इसके ट्रस्टीज, निदेशकों या कर्मचारियों पर 
              <strong> कोई भी नागरिक (Civil) अथवा आपराधिक (Criminal) दायित्व लागू नहीं होगा</strong>।
            </Typography>
          </Box>

          {/* SECTION 2: ZERO-KNOWLEDGE & OPFS STORAGE */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={900} color="#0f172a" sx={{ mb: 1 }}>
              2. जीरो-नॉलेज लोकल वॉल्ट नीति (Zero-Knowledge Client-Side Storage Architecture)
            </Typography>
            <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.8 }}>
              उपयोगकर्ता द्वारा अपलोड की जाने वाली सभी अदालती फाइलें, खतौनी, चार्जशीट और साक्ष्य सीधे उपयोगकर्ता के <strong>स्थानीय उपकरण (Mobile/Laptop/Device Sandboxed Storage)</strong> में ही सुरक्षित रहते हैं।
              ICJ क्लाउड सर्वर पर केवल एक 64-अक्षरों का डिजिटल क्रिप्टोग्राफिक फिंगरप्रिंट (SHA-256 Hash) दर्ज होता है। 
              <strong>संस्था के सर्वर पर मूल फाइल का भंडारण (Raw File Storage) शून्य (0%) होता है</strong>, जिससे भारतीय व्यक्तिगत डेटा संरक्षण कानून (DPDPA 2023) और यूरोपीय GDPR के तहत शून्य डेटा देनदारी (Zero Liability) सुनिश्चित होती है।
            </Typography>
          </Box>

          {/* SECTION 3: LAWYER-CLIENT PRIVILEGE */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={900} color="#0f172a" sx={{ mb: 1 }}>
              3. अधिवक्ता-मुवक्किल गोपनीयता विशेषाधिकार (Privileged Lawyer-Client Communication)
            </Typography>
            <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.8 }}>
              भारतीय साक्ष्य अधिनियम / भारतीय साक्ष्य संहिता 2023 की धाराओं तथा बार काउंसिल ऑफ इंडिया के नियमों के अनुसार, अधिवक्ता और मुवक्किल के बीच के सभी दस्तावेज और परामर्श 
              <strong> पूर्णतः गोपनीय और विशेषाधिकार प्राप्त (Privileged & Confidential)</strong> हैं। 
              एन्क्रिप्शन की प्राइवेट चाबी केवल उपयोगकर्ता के उपकरण पर होने के कारण, कोई भी तृतीय पक्ष, सर्वर या बाहरी संस्था इसे डिक्रिप्ट नहीं कर सकती।
            </Typography>
          </Box>

          {/* SECTION 4: GLOBAL COMPLIANCE */}
          <Box>
            <Typography variant="h6" fontWeight={900} color="#0f172a" sx={{ mb: 1 }}>
              4. अंतरराष्ट्रीय कानून एवं विदेशी क्षेत्राधिकार सुरक्षा (Global Intermediary Immunity)
            </Typography>
            <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.8 }}>
              संयुक्त राज्य अमेरिका के <strong>Communications Decency Act (Section 230)</strong> एवं <strong>Digital Millennium Copyright Act (DMCA § 512)</strong> तथा 
              यूरोपीय संघ के <strong>General Data Protection Regulation (GDPR Article 25 - Privacy by Design)</strong> के अंतरराष्ट्रीय सेफ हार्बर मानकों का पूर्ण अनुपालन किया गया है।
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
              अंतरराष्ट्रीय ज्यूरिस्ट्स कंसोर्टियम (ICJ Enterprise Platform) • विधिक अनुपालन विभाग © 2026
            </Typography>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              sx={{ bgcolor: "#0f172a", fontWeight: 800, borderRadius: "10px", textTransform: "none" }}
            >
              स्वीकार एवं सुरक्षित पोर्टल पर जाएं ➔
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
