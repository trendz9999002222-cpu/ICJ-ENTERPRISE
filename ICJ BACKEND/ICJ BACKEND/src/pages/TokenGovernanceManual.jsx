import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  TextField,
  Tabs,
  Tab,
  Avatar,
  Container,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

// Icons
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QuizIcon from "@mui/icons-material/Quiz";
import PersonIcon from "@mui/icons-material/Person";
import BalanceIcon from "@mui/icons-material/Balance";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SendIcon from "@mui/icons-material/Send";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

// ─── FAQ Knowledgebase Data ──────────────────────────────────────────────────
const MASTER_FAQS = [
  {
    category: "General & Concept",
    q: "ICJ Token वास्तव में क्या है और इसका मूल विज़न क्या है?",
    a: "ICJ Token 'भारतीय न्यास अधिनियम, 1882' के तहत पंजीकृत ICJ चैरिटेबल ट्रस्ट की एक आंतरिक सामाजिक प्रतिज्ञा (Social Obligation Instrument) है। यह कोई वित्तीय सुरक्षा, शेयर या क्रिप्टो नहीं है। इसका मुख्य विज़न है — 'लीगल बार्टर क्रेडिट'। जिनके पास धन है या जिन्हें कानूनी मदद चाहिए, वे टोकन के माध्यम से वकील/संस्थानों से सेवाएं ले सकते हैं और आपस में बिना कानूनी देनदारी के विश्वास का आदान-प्रदान कर सकते हैं।",
  },
  {
    category: "Client Perspective",
    q: "जिस व्यक्ति का कोर्ट केस चल रहा है (Client/Litigant), वह टोकन का उपयोग कैसे करेगा?",
    a: "1. क्लाइंट पोर्टल पर टोकन रिक्वेस्ट सबमिट करेगा (उदा. 500 टोकन)।\n2. ICJ ट्रस्ट को 20% सर्विस चार्ज (80G कटौतीयुक्त अंशदान) देगा।\n3. ट्रस्ट टोकन मिंट करके केस रेफरेंस कोड (उदा. LKO-PROP-2026-0042) के साथ लिंक करेगा।\n4. क्लाइंट यह टोकन अपने वकील/सेवा प्रदाता को देगा।\n5. केस सुलझने पर टोकन अनलॉक होंगे और वकील उनका इस्तेमाल रिडीम, ट्रांसफर या डोनेट करने में कर सकेगा।",
  },
  {
    category: "Advocate Perspective",
    q: "वकील या सेवा प्रदाता (Advocate/Service Provider) टोकन का क्या करेंगे?",
    a: "वकील टोकन को 4 तरीकों से इस्तेमाल कर सकते हैं:\n1. Cash Redemption: ट्रस्ट ट्रेजरी से कैश रिइम्बर्समेंट (फंड उपलब्धता अनुसार)।\n2. Trust Services: ICJ के AI लीगल ड्राफ्टर, कोर्ट कैलेंडर व ऑफिस सॉफ्टवेयर की फीस चुकाना।\n3. Donation: ट्रस्ट को वापस डोनेट करके धारा 80G के तहत टैक्स छूट पाना।\n4. Perpetual Transfer: दूसरे वकीलों या मेंबर्स को ट्रांसफर करना।",
  },
  {
    category: "Admin & Succession",
    q: "यदि एडमिन बदलता है, तो नया एडमिन इस सिस्टम को कैसे संचालित करेगा?",
    a: "नया एडमिन इस 'System Governance Manual' को पढ़कर 5 मिनट में पूरी प्रक्रिया समझ सकता है:\n- टोकन मिंटिंग: Super Admin Console से।\n- रेट मैनेजमेंट: Token Rate Engine से 24 घंटे की पूर्व सूचना के साथ।\n- एस्क्रो अनलॉक: केस फैसला आने पर Case Ref Code डालकर 'Unlock Escrow' दबाना।\n- लेजर ऑडिट: हर टोकन का सीरियल नंबर (ICJ-TOK-XXXXXX) लेजर में स्थायी दर्ज रहता है, जो कभी बदला या मिटाया नहीं जा सकता।",
  },
  {
    category: "Legal & GST",
    q: "क्या इस टोकन सिस्टम पर GST, TDS या SEBI नियम लागू होते हैं?",
    a: "नहीं। भारतीय कानूनों का 100% अनुपालन:\n- GST: चैरिटेबल ट्रस्ट की आंतरिक गतिविधियों पर Notification 12/2017-CT(Rate) के तहत 0% GST (पूर्ण छूट)।\n- TDS: यह व्यावसायिक फीस नहीं, आंतरिक बार्टर है। नकदी रिडेम्पशन ₹40,000/वर्ष से अधिक होने पर ही Sec 194A की समीक्षा की जाती है।\n- SEBI/RBI: यह सूचीबद्ध प्रतिभूति या क्रिप्टोकरेंसी नहीं है, इसलिए SEBI/RBI नियम लागू नहीं होते।",
  },
  {
    category: "Escrow & Locking",
    q: "Event-Locked Escrow Tokens क्या हैं और केस हारने/जीतने पर क्या होता है?",
    a: "भारतीय अनुबंध अधिनियम, 1872 की धारा 31 (Contingent Contract) के तहत टोकन केस के परिणाम से बंधे होते हैं।\n- केस जीतने/सुलझने पर: टोकन स्वतः ACTIVE हो जाते हैं।\n- केस हारने/प्रतिकूल परिणाम पर: टोकन होल्डर का कोई कानूनी दावा या केस नहीं बनता क्योंकि TUA-v1.0 डिजिटल अनुबंध पर 'No Future Claims' क्लॉज पर हस्ताक्षर किए गए हैं।",
  },
  {
    category: "Service Charge",
    q: "20% सर्विस चार्ज कहाँ जाता है और इसका क्या नियम है?",
    a: "सर्विस चार्ज (10% से 25%, डिफॉल्ट 20%) ICJ चैरिटेबल ट्रस्ट की ट्रेजरी में जाता है। यह न्यास अधिनियम के तहत स्वैच्छिक योगदान माना जाता है। इससे मिलने वाला फंड समाज कल्याण अभियान, लीगल एड और ट्रेजरी कैश रिडेम्पशन पूल में इस्तेमाल होता है। यह 80G टैक्स बेनिफिट के लिए पात्र है।",
  },
  {
    category: "Perpetual Circulation",
    q: "क्या टोकन कभी बर्न (नष्ट) होते हैं?",
    a: "नहीं। ICJ टोकन कभी नष्ट नहीं होते। वे मुद्रा की तरह सदैव घूमते (Perpetual Circulation) रहते हैं। जिसके पास भी टोकन आता है, वह आगे किसी अन्य मेंबर को ट्रांसफर कर सकता है या ट्रस्ट की सेवाओं में रिडीम कर सकता है।",
  },
  {
    category: "Advocate & Escrow Protection",
    q: "यदि कोई वकील काम पूरा न करे, डिच करे या टंग (Coerce) करे तो क्या होगा?",
    a: "ICJ एक स्वतंत्र Monitoring Agency और Escrow Custodian है। क्लाइंट के टोकन/पैसे तब तक ICJ Escrow में सुरक्षित रहते हैं जब तक कार्य संतोषजनक रूप से पूरा न हो जाए। वकील द्वारा काम में बेवजह देरी या अनुचित व्यवहार करने पर ICJ ट्रस्ट वकील का भुगतान रोक सकता है, फीस काट सकता है या केस दूसरे वकील को ट्रांसफर कर सकता है।",
  },
  {
    category: "Digital Case Vault & File Safety",
    q: "यदि वकील बदल जाता है, तो पार्टी की केस फाइल का क्या होगा?",
    a: "केस फाइल सदैव 100% सुरक्षित रहेगी। TUA-v1.0 की धारा 8 के तहत वकील के लिए कोर्ट के सभी आदेश, अर्जी और विपक्षी पेपर्स डिजिटल वॉल्ट में अपलोड करना मैंडेटरी (Mandatory) है। कोई भी वकील फाइल नहीं रोक सकता। नया वकील नियुक्त होने पर Super Admin बिना किसी देरी के पूरी केस फाइल नए वकील को ट्रांसफर कर देता है।",
  },
  {
    category: "Universal Grievances (Aadhaar/PAN/Bills)",
    q: "क्या यह पोर्टल केवल कोर्ट केस के लिए है या आधार, बिजली बिल, वाहन विवादों के लिए भी है?",
    a: "यह पोर्टल समाज की सभी सिविल, क्रिमिनल और प्रशासनिक (Administrative) समस्याओं हेतु यूनिवर्सल लीड जनरेशन मंच है — जैसे आधार, पैन, बिजली बिल, वाहन/RTO, नगर निगम या पेंशन विवाद। पीड़ित व्यक्ति पोर्टल पर अपनी समस्या लाएगा और ICJ सत्यापित सेवा प्रदाता/विशेषज्ञ उसे हल करेंगे।",
  },
  {
    category: "Self-Representation & Cost Savings",
    q: "अपनी वकालत खुद करें (Self-Representation) और कम लागत में केस चलाने की क्या योजना है?",
    a: "सिविल व रूटीन मामलों में कई तारीखों पर वकील की यात्रा (Travel) की आवश्यकता नहीं होती। ICJ AI एवं वकील क्लाइंट को स्पष्ट गाइडलाइंस और पेपर्स देते हैं जिससे क्लाइंट खुद कोर्ट जाकर तारीख अटेंड कर सकता है। इससे वकील का आना-जाना बचता है और केस बहुत ही कम लागत में पूरा हो जाता है।",
  },
  {
    category: "Legal Immunity & IT Act Sec 79",
    q: "क्या दो पक्षों के लेन-देन या विवाद में ICJ ट्रस्ट पर कोई सिविल या क्रिमिनल केस हो सकता है?",
    a: "बिलकुल नहीं। IT Act 2000 की धारा 79 के तहत ICJ ट्रस्ट केवल एक डिजिटल मीडिएटर (Intermediary) व Escrow निष्पादक है। दो पक्षों (क्लाइंट व सेवा प्रदाता) का लेन-देन उनका आपसी मामला है। TUA-v1.0 की धारा 10 व 11 के तहत ट्रस्ट, ट्रस्टियों व कर्मचारियों पर किसी सिविल मुकदमे या पुलिस शिकायत/FIR पर पूर्ण विधिक रोक (Absolute Prosecution Bar) है। कोई भी विवाद केवल ट्रस्ट बोर्ड आर्बिट्रेशन (Arbitration Act 1996) से सुलझेगा।",
  },
  {
    category: "Invoicing & Government Audit Trail",
    q: "क्या सिस्टम में कोई एंट्री गायब हो सकती है? बैंक, सरकार व कोर्ट के लिए रसीद/बिलिंग कैसे मिलेगी?",
    a: "सिस्टम में कोई भी एंट्री कभी गायब नहीं हो सकती। हर प्रविष्टि का शुरू से अंत तक 100% पक्का डिजिटल रिकॉर्ड (End-to-End Audit Trail) रहता है। हर भुगतान पर आधिकारिक इनवॉइस, 80G रसीद व टोकन लेजर कोड स्वतः जेनरेट होते हैं। यह रिकॉर्ड IT Act Sec 5/3A के तहत सरकार, बैंक, आयकर विभाग व कोर्ट के लिए पूर्णतः मान्य है।",
  },
  {
    category: "Enterprise Tech Showcase & Privacy",
    q: "नए सदस्यों को आकर्षित करने के लिए ICJ की मुख्य 5 क्रांतिकारी तकनीकें क्या हैं?",
    a: "ICJ में 5 अत्याधुनिक तकनीकें इंटीग्रेटेड हैं:\n1. 🤖 AI Case Diagnosis & Voice Intake ('आप क्या चाहते हैं?') — सेकंडों में BNS/IPC कानूनी स्थिति व रणनीति तैयार करना।\n2. 🔒 Zero-Trust DRM & Owner OTP Protection — आधार व पैन के बिना अनुमति प्रिंटिंग पर रोक।\n3. 🪙 Barter Token & 20% Trust Contribution — न्यास अधिनियम 1882 अनुपालन सामाजिक क्रेडिट।\n4. 📂 Immutable Digital Case Vault — वकील बदलने पर भी केस फाइल 100% सेफ।\n5. 💡 Self-Representation Framework — रूटीन तारीखों पर वकील का यात्रा खर्च बचाना।",
  },
  {
    category: "Enterprise Tech Showcase & Privacy",
    q: "रजिस्ट्रेशन के समय DRM प्राइवेसी पॉलिसी व आईटी एक्ट सेक् 79 क्लॉज कैसे लागू होता है?",
    a: "रजिस्ट्रेशन पोर्टल (`/join`) पर सदस्य OTP वेरिफिकेशन के साथ DRM प्राइवेसी पॉलिसी और IT Act 2000 Sec 79 मीडिएटर क्लॉज को स्वीकार करते हैं। इससे सदस्य के आधार/पैन की सुरक्षा की 100% गारंटी मिलती है और ट्रस्ट को किसी भी विवाद में पूर्ण कानूनी सुरक्षा प्राप्त होती है।",
  },
];

// ─── Automated AI Governance Inquiry Engine ──────────────────────────────────
const PRESET_INQUIRIES = [
  {
    q: "केस हारने पर टोकन का क्या होगा?",
    a: "केस हारने या प्रतिकूल परिणाम पर टोकन होल्डर ट्रस्ट या किसी पक्ष पर कोई कानूनी दावा नहीं कर सकता। TUA-v1.0 की धारा 2 के तहत सभी पक्षों ने भविष्य के दावों का त्याग (Waiver of Claims u/s 63 Indian Contract Act) किया है। यह एक सामाजिक वादा है, कोई कानूनी देनदारी नहीं।",
  },
  {
    q: "यदि वकील डिच करे या काम न करे तो क्या होगा?",
    a: "ICJ Monitoring Agency के रूप में Escrow में टोकन/पैसे तब तक सुरक्षित रखता है जब तक काम पूरा न हो जाए। वकील द्वारा डिच करने पर ICJ फीस रोककर केस नए वकील को सौंप देगा।",
  },
  {
    q: "वकील बदलने पर केस फाइल का क्या होगा?",
    a: "TUA-v1.0 Sec 8 के तहत वकील को सभी कोर्ट पेपर्स वॉल्ट में अपलोड करना अनिवार्य है। केस फाइल हमेशा सिस्टम में सुरक्षित रहती है और नए वकील को तुरंत मिल जाती है।",
  },
  {
    q: "अपनी वकालत खुद करें (Self-Representation) कैसे काम करता है?",
    a: "रूटीन तारीखों पर ICJ AI व वकील क्लाइंट को पेपर्स व निर्देश देते हैं। क्लाइंट स्वयं जाकर तारीख अटेंड करता है, जिससे वकील की यात्रा का भारी खर्च बचता है।",
  },
  {
    q: "आधार, पैन, बिजली बिल या RTO विवाद का काम कैसे होगा?",
    a: "यह एक यूनिवर्सल लीड जनरेशन पोर्टल है। प्रशासनिक या सरकारी समस्याओं हेतु पीड़ित पोर्टल पर रिक्वेस्ट डालेगा और एक्सपर्ट/पैरालीगल उसे कम लागत में हल करेंगे।",
  },
];

export default function TokenGovernanceManual() {
  const [tabIndex, setTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [userQuestion, setUserQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState(null);

  // Filter FAQs based on search
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return MASTER_FAQS;
    const q = searchQuery.toLowerCase();
    return MASTER_FAQS.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Interactive Inquiry Handler
  const handleAskInquiry = (qText) => {
    const query = qText || userQuestion;
    if (!query.trim()) return;

    // Search exact preset or fuzzy match in master FAQs
    const match = MASTER_FAQS.find(
      (f) => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
    );

    if (match) {
      setAiAnswer({
        q: match.q,
        a: match.a,
        source: "ICJ Trust System Governance Rules & Statutory Compliance",
        timestamp: new Date().toLocaleTimeString("en-IN"),
      });
    } else {
      setAiAnswer({
        q: query,
        a: `[ICJ Governance Desk Response]\n\n"ICJ Token एक चैरिटेबल ट्रस्ट की आंतरिक सामाजिक प्रतिज्ञा (Social Obligation Instrument) है (पंजीकृत: Indian Trusts Act 1882)।\n\n'${query}' से संबंधित नियम:\n1. टोकन केवल ट्रस्ट की आंतरिक सेवाओं या सदस्यों के बार्टर हेतु हैं।\n2. सभी लेन-देन पर TUA-v1.0 डिजिटल अनुबंध (OTP हस्ताक्षरित) लागू होता है।\n3. 20% सर्विस चार्ज 80G टैक्स छूट हेतु मान्य स्वैच्छिक योगदान है।\n4. अधिक जानकारी हेतु ICJ हेल्पलाइन या लीगल काउंसिल से संपर्क करें।"`,
        source: "ICJ Governance Automated Knowledge Engine",
        timestamp: new Date().toLocaleTimeString("en-IN"),
      });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 10 }}>
      {/* ── Top Hero Header ───────────────────────────────────────────────── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #4c1d95 100%)",
          color: "white",
          py: 5,
          px: 3,
          boxShadow: "0 10px 30px rgba(15,23,42,0.4)",
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar sx={{ bgcolor: "#f59e0b", width: 64, height: 64, boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}>
              <MenuBookIcon sx={{ fontSize: 38 }} />
            </Avatar>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="h3" fontWeight="bold">
                  ICJ System Governance Manual
                </Typography>
                <Chip label="OFFICIAL SYSTEM LOCK" sx={{ bgcolor: "#10b981", color: "#fff", fontWeight: "bold" }} />
              </Stack>
              <Typography variant="h6" sx={{ color: "#93c5fd", mt: 0.5 }}>
                टोकन प्रणाली की संपूर्ण मार्गदर्शिका — क्लाइंट, अधिवक्ता, एडमिन एवं ट्रस्ट प्रचालक दृष्टिकोण
              </Typography>
            </Box>
          </Stack>

          {/* Quick Stats Strip */}
          <Grid container spacing={2} mt={1}>
            {[
              { label: "Governing Law", val: "Indian Trusts Act 1882", icon: <GavelIcon /> },
              { label: "Contract Law", val: "Sec 31 Contingent Contract", icon: <BalanceIcon /> },
              { label: "GST Status", val: "0% Exempt (Notif 12/2017)", icon: <VerifiedUserIcon /> },
              { label: "Digital Signature", val: "IT Act 2000 OTP Auth", icon: <SecurityIcon /> },
            ].map((s) => (
              <Grid item xs={12} sm={6} md={3} key={s.label}>
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ color: "#f59e0b" }}>{s.icon}</Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                        {s.label}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {s.val}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Main Content Container ───────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mt: -3 }}>
        <Paper elevation={4} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              bgcolor: "#0f172a",
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": { color: "#94a3b8", fontWeight: "bold", fontSize: "0.95rem", py: 2 },
              "& .Mui-selected": { color: "#f59e0b !important" },
              "& .MuiTabs-indicator": { backgroundColor: "#f59e0b", height: 3 },
            }}
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="👁️ 360° Perspectives (सभी का दृष्टिकोण)" />
            <Tab icon={<AdminPanelSettingsIcon />} iconPosition="start" label="📚 Admin Operating Manual (एडमिन गाइड)" />
            <Tab icon={<QuizIcon />} iconPosition="start" label="❓ Master FAQ Knowledgebase" />
            <Tab icon={<QuestionAnswerIcon />} iconPosition="start" label="💬 Interactive Inquiry Desk (पूछताछ)" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="📜 Statutory & Legal Framework" />
          </Tabs>

          <Box sx={{ p: { xs: 2.5, md: 4 }, bgcolor: "white" }}>
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 0: 360° Stakeholder Perspectives                          */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {tabIndex === 0 && (
              <Box>
                <Alert severity="info" icon={<GavelIcon />} sx={{ mb: 4, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    ICJ Token मूल दर्शन (Core Philosophy):
                  </Typography>
                  "ICJ Token एक सामाजिक प्रतिज्ञा है, कोई कानूनी देनदारी नहीं।" — टोकन कभी बर्न नहीं होते, यह एक बार्टर क्रेडिट है जो विश्वास और आपसी सहमति से घूमता है।
                </Alert>

                <Grid container spacing={3}>
                  {/* Client Perspective */}
                  <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: "100%", borderRadius: 3, borderTop: "6px solid #1e3a8a" }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                          <Avatar sx={{ bgcolor: "#1e3a8a15", color: "#1e3a8a" }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
                              1. Client / Litigant
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              जिसका कोर्ट केस चल रहा है
                            </Typography>
                          </Box>
                        </Stack>

                        <List size="small" disablePadding>
                          {[
                            "टोकन रिक्वेस्ट पोर्टल पर अपनी समस्या या केस दर्ज करके टोकन की मांग करता है।",
                            "टोकन वैल्यू का 20% सर्विस चार्ज ICJ चैरिटेबल ट्रस्ट को देता है (80G कटौतीयुक्त)।",
                            "टोकन केस रेफरेंस कोड (उदा. LKO-PROP-2026-0042) से लॉक होकर जारी होते हैं।",
                            "केस सुलझने पर वकील को भुगतान टोकन के रूप में दिया जाता है।",
                            "केस हारने या प्रतिकूल परिणाम पर किसी पर कानूनी दावा नहीं कर सकता (TUA Signed)।",
                          ].map((t, i) => (
                            <ListItem key={i} sx={{ px: 0, py: 0.8 }}>
                              <ListItemIcon sx={{ minWidth: 28, color: "#1e3a8a" }}>
                                <CheckCircleIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={t} primaryTypographyProps={{ variant: "body2" }} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Advocate Perspective */}
                  <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: "100%", borderRadius: 3, borderTop: "6px solid #10b981" }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                          <Avatar sx={{ bgcolor: "#10b98115", color: "#10b981" }}>
                            <BalanceIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color="#047857">
                              2. Advocate / Service Provider
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              जो सेवा देंगे व टोकन स्वीकार करेंगे
                            </Typography>
                          </Box>
                        </Stack>

                        <List size="small" disablePadding>
                          {[
                            "क्लाइंट की मदद या Pro-Bono कार्य के बदले टोकन स्वीकार करता है।",
                            "टोकन Escrow में लॉक्ड रहते हैं, जब तक ट्रिगर इवेंट (उदा. Case Resolved) पूरा न हो।",
                            "केस जीतने पर 4 विकल्प: Cash Redemption, AI Tools Subscription, Donation (80G), या Transfer।",
                            "टोकन को अन्य वकीलों को ट्रांसफर करके अपनी सेवाएं/सहायता ले सकता है।",
                            "टोकन एक बार्टर क्रेडिट है, जिसकी ट्रस्ट की सेवाओं में 100% गारंटी है।",
                          ].map((t, i) => (
                            <ListItem key={i} sx={{ px: 0, py: 0.8 }}>
                              <ListItemIcon sx={{ minWidth: 28, color: "#10b981" }}>
                                <CheckCircleIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={t} primaryTypographyProps={{ variant: "body2" }} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Admin Perspective */}
                  <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: "100%", borderRadius: 3, borderTop: "6px solid #f59e0b" }}>
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                          <Avatar sx={{ bgcolor: "#f59e0b15", color: "#d97706" }}>
                            <AdminPanelSettingsIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color="#b45309">
                              3. Super Admin & Trustee
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              सिस्टम प्रचालक व उत्तराधिकारी
                            </Typography>
                          </Box>
                        </Stack>

                        <List size="small" disablePadding>
                          {[
                            "Super Admin केवल टोकन मिंट (Mint) कर सकता है, कोई अन्य यूजर नहीं।",
                            "टोकन दर (Rate) बदल सकता है, जिसके 24 घंटे पहले स्वतः नोटिस जारी होता है।",
                            "केस सुलझने की पुष्टि पर 'Unlock Escrow' करके टोकन रिलीज करता है।",
                            "20% फीस का 80G टैक्स रसीद लेजर में मेंटेन करता है।",
                            "एडमिन बदलने पर सीरियल लेजर कोड (ICJ-TOK-XXXXXX) से पूरा पुराना रिकॉर्ड सुरक्षित रहता है।",
                          ].map((t, i) => (
                            <ListItem key={i} sx={{ px: 0, py: 0.8 }}>
                              <ListItemIcon sx={{ minWidth: 28, color: "#d97706" }}>
                                <CheckCircleIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={t} primaryTypographyProps={{ variant: "body2" }} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 1: Admin Operating Manual                                 */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {tabIndex === 1 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" color="#0f172a" mb={3}>
                  📚 Super Admin & Trustee Operating Protocol (एडमिन हैंडओवर मार्गदर्शिका)
                </Typography>

                <Alert severity="warning" sx={{ mb: 3 }}>
                  <strong>एडमिन ध्यान दें:</strong> यह गाइड सुनिश्चित करती है कि यदि भविष्य में कोई भी नया एडमिन या ट्रस्टी कार्यभार संभालता है, तो उसे 5 मिनट में सिस्टम की पूरी जानकारी मिल जाएगी।
                </Alert>

                <Grid container spacing={3}>
                  {[
                    {
                      step: "Step 1: Serial Token Minting",
                      title: "नए टोकन जारी करना (Minting)",
                      desc: "केवल Super Admin Console (`/token`) से टोकन मिंट हो सकते हैं। हर टोकन का ऑटो-जनरेटेड सीरियल नंबर (ICJ-TOK-000001) बनता है। टोकन ट्रस्ट की सामाजिक संपत्ति हैं।",
                      color: "#1e3a8a",
                    },
                    {
                      step: "Step 2: Dynamic Rate Engine",
                      title: "टोकन दर निर्धारण व सूचना",
                      desc: "Super Admin टोकन की वैल्यू (उदा. ₹10/Token) बदल सकता है। दर बदलते ही 24 घंटे की नोटिस विंडो एक्टिव होती है और सभी पुराने टोकन स्वतः नई दर पर अपडेट हो जाते हैं।",
                      color: "#b45309",
                    },
                    {
                      step: "Step 3: Escrow Lock & Release",
                      title: "केस से बंधे टोकन लॉक/अनलाक",
                      desc: "जब किसी केस के लिए टोकन मांगे जाते हैं, तो एस्क्रो में LOCKED टोकन जारी होते हैं (उदा. LKO-PROP-2026-0042)। केस सुलझने पर Admin 'Unlock Escrow' दबाकर टोकन सक्रिय करता है।",
                      color: "#dc2626",
                    },
                    {
                      step: "Step 4: Revenue & 80G Receipts",
                      title: "20% सर्विस चार्ज व टैक्स लेज़र",
                      desc: "हर ट्रांजैक्शन पर 20% चार्ज ऑटो-डिडक्ट होकर ICJ Treasury में जाता है। 80G रसीद नंबर (ICJ-CHG-2026-XXXXX) ऑटो-जनरेट होता है। यह GST Exempt है।",
                      color: "#047857",
                    },
                  ].map((s) => (
                    <Grid item xs={12} sm={6} key={s.step}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          borderLeft: `6px solid ${s.color}`,
                          height: "100%",
                        }}
                      >
                        <Chip label={s.step} size="small" sx={{ bgcolor: `${s.color}15`, color: s.color, fontWeight: "bold", mb: 1 }} />
                        <Typography variant="h6" fontWeight="bold" color="#0f172a" gutterBottom>
                          {s.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {s.desc}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 2: Master FAQ Knowledgebase                               */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {tabIndex === 2 && (
              <Box>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" mb={3} gap={2}>
                  <Typography variant="h5" fontWeight="bold" color="#0f172a">
                    ❓ Master FAQ Knowledgebase
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Search FAQ (उदा. GST, Escrow, Client...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ minWidth: 280 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>

                {filteredFaqs.length === 0 ? (
                  <Alert severity="warning">कोई प्रश्न मेल नहीं खाया। कृपया कोई अन्य शब्द खोजें।</Alert>
                ) : (
                  filteredFaqs.map((faq, index) => (
                    <Accordion key={index} elevation={1} sx={{ mb: 1.5, "&:before": { display: "none" }, borderRadius: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#f8fafc", borderRadius: 2 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Chip label={faq.category} size="small" sx={{ bgcolor: "#ede9fe", color: "#4c1d95", fontWeight: 700 }} />
                          <Typography fontWeight="bold" color="#1e3a8a">
                            {faq.q}
                          </Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2.5, bgcolor: "#fff" }}>
                        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
                          {faq.a}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 3: Interactive Inquiry Desk (पूछताछ)                        */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {tabIndex === 3 && (
              <Box>
                <Box sx={{ background: "linear-gradient(135deg, #1e3a8a, #4c1d95)", p: 4, borderRadius: 3, color: "#fff", mb: 4 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    💬 Admin & Member Interactive Inquiry Desk
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#cbd5e1", mb: 3 }}>
                    टोकन सिस्टम, एडमिन प्रक्रियाओं या लीगल रूल्स से जुड़ा कोई भी सवाल पूछें — सिस्टम आपको आधिकारिक गवर्नेंस उत्तर प्रदान करेगा।
                  </Typography>

                  {/* Question Input */}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="अपना सवाल लिखें... (उदा. 20% सर्विस चार्ज की रसीद कैसे मिलेगी?)"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAskInquiry()}
                      sx={{ bgcolor: "#fff", borderRadius: 1.5, "& input": { color: "#0f172a" } }}
                    />
                    <Button
                      variant="contained"
                      onClick={() => handleAskInquiry()}
                      startIcon={<SendIcon />}
                      sx={{ bgcolor: "#f59e0b", color: "#0f172a", fontWeight: "bold", px: 4, whiteSpace: "nowrap", "&:hover": { bgcolor: "#d97706" } }}
                    >
                      पूछें (Submit Inquiry)
                    </Button>
                  </Stack>

                  {/* Preset Inquiry Chips */}
                  <Box mt={3}>
                    <Typography variant="caption" sx={{ color: "#cbd5e1", display: "block", mb: 1 }}>
                      त्वरित उत्तर के लिए इन मुख्य प्रश्नों पर क्लिक करें:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {PRESET_INQUIRIES.map((p, i) => (
                        <Chip
                          key={i}
                          label={p.q}
                          onClick={() => handleAskInquiry(p.q)}
                          sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Box>

                {/* AI / Automated Inquiry Result Display */}
                {aiAnswer && (
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: "2px solid #7c3aed", bgcolor: "#faf5ff" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip label="Official Governance Response" color="secondary" size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {aiAnswer.timestamp}
                      </Typography>
                    </Stack>

                    <Typography variant="h6" fontWeight="bold" color="#4c1d95" gutterBottom>
                      ❓ {aiAnswer.q}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.8, color: "#1e293b", fontWeight: 500 }}>
                      {aiAnswer.a}
                    </Typography>

                    <Box sx={{ mt: 3, p: 1.5, bgcolor: "#ede9fe", borderRadius: 2 }}>
                      <Typography variant="caption" color="#4c1d95" fontWeight="bold">
                        Source: {aiAnswer.source}
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Box>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TAB 4: Statutory & Legal Framework                            */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {tabIndex === 4 && (
              <Box>
                <Typography variant="h5" fontWeight="bold" color="#0f172a" mb={3}>
                  📜 Statutory Legal Map & Digital Token User Agreement (TUA-v1.0)
                </Typography>

                <Alert severity="success" icon={<SecurityIcon />} sx={{ mb: 3 }}>
                  यह संपूर्ण टोकन सिस्टम भारतीय कानूनों के 100% दायरे में है। किसी भी सरकारी एजेंसी (SEBI, RBI, GST, IT Dept) द्वारा इस पर आपत्ति नहीं की जा सकती।
                </Alert>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", height: "100%" }}>
                      <Typography variant="h6" fontWeight="bold" color="#1e3a8a" mb={2}>
                        ⚖️ भारतीय अधिनियम अनुपालन (Statutory Map)
                      </Typography>

                      <List disablePadding>
                        {[
                          { act: "Indian Trusts Act 1882", detail: "पंजीकृत चैरिटेबल ट्रस्ट की आंतरिक सामाजिक बार्टर संपत्ति।" },
                          { act: "Indian Contract Act 1872 (Sec 31)", detail: "Contingent Contract: केस परिणाम पर टोकन एस्क्रो अनलॉक पूरी तरह वैध।" },
                          { act: "Indian Contract Act 1872 (Sec 63)", detail: "Waiver of Performance: प्रतिकूल परिणाम पर कानूनी दावों का पूर्ण त्याग।" },
                          { act: "IT Act 2000 (Sec 5 & 3A)", detail: "OTP-आधारित डिजिटल हस्ताक्षर वैध और कानूनी रूप से बाध्यकारी।" },
                          { act: "GST Exemption Notif 12/2017", detail: "चैरिटेबल ट्रस्ट की आंतरिक बार्टर गतिविधियों पर 0% GST।" },
                          { act: "Income Tax Act Sec 11/12/80G", detail: "20% सर्विस चार्ज 80G टैक्स छूट हेतु मान्य स्वैच्छिक दान।" },
                        ].map((item, i) => (
                          <ListItem key={i} sx={{ px: 0, py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 28, color: "#1e3a8a" }}>
                              <CheckCircleIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.act}
                              secondary={item.detail}
                              primaryTypographyProps={{ fontWeight: "bold", variant: "body2" }}
                              secondaryTypographyProps={{ variant: "caption" }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#fffbeb", border: "1px solid #fde68a", height: "100%" }}>
                      <Typography variant="h6" fontWeight="bold" color="#92400e" mb={2}>
                        📋 TUA-v1.0 6-Section Summary
                      </Typography>

                      <List disablePadding>
                        {[
                          { sec: "Sec 1: Token Nature", txt: "Social obligation unit. Not a security/crypto." },
                          { sec: "Sec 2: No Claims", txt: "Irrevocable waiver of all legal claims on case outcomes." },
                          { sec: "Sec 3: Voluntariness", txt: "Entered freely without coercion or misrepresentation." },
                          { sec: "Sec 4: Trust Commitment", txt: "Unconditional service fulfillment guarantee by ICJ." },
                          { sec: "Sec 5: 20% Charge", txt: "Acceptance of 20% voluntary contribution to trust." },
                          { sec: "Sec 6: Arbitration", txt: "Internal arbitration by ICJ Board prior to civil courts." },
                        ].map((item, i) => (
                          <ListItem key={i} sx={{ px: 0, py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 28, color: "#d97706" }}>
                              <LockIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.sec}
                              secondary={item.txt}
                              primaryTypographyProps={{ fontWeight: "bold", variant: "body2", color: "#92400e" }}
                              secondaryTypographyProps={{ variant: "caption" }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
