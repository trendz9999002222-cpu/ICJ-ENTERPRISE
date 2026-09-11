export type GatewayCard = {
  id: string;
  chip: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  cta: string;
  color: string;
  border: string;
  bg: string;
  chipBg: string;
  chipColor: string;
};

export const GATEWAY_CARDS: GatewayCard[] = [
  {
    id: "citizen",
    chip: "नागरिक पोर्टल",
    title: "📜 1. विधिक समस्या / नया केस दर्ज करें",
    subtitle: "Citizen Legal Intake & Instant Telemetry ID",
    description:
      "ज़मीन विवाद, क्रिमिनल बेल, चेक बाउंस, सर्विस मैटर, उपभोक्ता व पारिवारिक मामलों में तुरंत सहायता प्राप्त करें।",
    href: "/join",
    cta: "केस दर्ज करें व पोर्टल में प्रवेश करें ",
    color: "#059669",
    border: "#10b981",
    bg: "#d1fae5",
    chipBg: "#064e3b",
    chipColor: "#6ee7b7",
  },
  {
    id: "advocate",
    chip: "अधिवक्ता डेस्क",
    title: "⚖️ 2. अधिवक्ता व विशेषज्ञ पैनल में जुड़ें",
    subtitle: "Advocates, CAs, Forensics & Specialists",
    description:
      "बार काउंसिल पंजीकृत अधिवक्ता, सीए, सीएस, फॉरेंसिक एक्सपर्ट व कोर्ट मुंशी अखिल भारतीय पैनल से जुड़ें।",
    href: "/join",
    cta: "पैनल में पंजीकरण करें",
    color: "#1d4ed8",
    border: "#3b82f6",
    bg: "#dbeafe",
    chipBg: "#1e3a8a",
    chipColor: "#93c5fd",
  },
  {
    id: "franchise",
    chip: "ज़िला फ्रेंचाइज़ी",
    title: "🏢 3. ज़िला विधिक सहायता फ्रेंचाइज़ी केंद्र",
    subtitle: "District Legal Franchise & Assistance Hub",
    description:
      "ज़िला स्तर पर विधिक सहायता, ई-फाइलिंग सहायता व टेलीफोनिक लीगल कॉल सेंटर फ्रेंचाइज़ी हेतु आवेदन।",
    href: "/join",
    cta: "फ्रेंचाइज़ी आवेदन प्रस्तुत करें ",
    color: "#b45309",
    border: "#f59e0b",
    bg: "#fef3c7",
    chipBg: "#78350f",
    chipColor: "#fde68a",
  },
];

export const GATEWAY_CARD_TITLE_SX = {
  mb: 1,
  lineHeight: 1.35,
  whiteSpace: "normal",
  wordBreak: "break-word",
  fontSize: "clamp(0.85rem, 0.85vw + 0.55rem, 1.1rem)",
} as const;

export const GATEWAY_CHIP_SX = {
  bgcolor: "inherit",
  color: "inherit",
  fontWeight: 800,
  borderRadius: "12px",
  height: "auto",
  maxWidth: "100%",
  "& .MuiChip-label": {
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "clip",
    display: "block",
    lineHeight: 1.35,
    px: 1.25,
    py: 0.6,
    fontSize: { xs: "0.7rem", sm: "0.75rem" },
  },
} as const;

export type JudiciaryTier = {
  id: string;
  icon: "supreme" | "high-court" | "district" | "revenue" | "tribunal";
  title: string;
  description: string;
  footer: string;
  color: string;
  border: string;
  bg: string;
  chipBg: string;
  chipColor: string;
};

export const JUDICIARY_NETWORK = {
  title: "5-स्तरीय अखिल भारतीय न्यायपालिका एवं अधिकरण नेटवर्क",
  subtitle:
    "All-India Judicial Forums Council & Legal Protection Network — INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)",
  badge: "Pan-India Comprehensive Jurisdiction",
};

export const JUDICIARY_TIERS: JudiciaryTier[] = [
  {
    id: "supreme",
    icon: "supreme",
    title: "1. भारत का सर्वोच्च न्यायालय (Supreme Court of India)",
    description: "अपील, विशेष अनुमति याचिका (SLP), रिट (Art. 32) व संविधान पीठ",
    footer: "New Delhi — Pan India Apex Jurisdiction",
    color: "#dc2626",
    border: "#fca5a5",
    bg: "#fef2f2",
    chipBg: "#fee2e2",
    chipColor: "#b91c1c",
  },
  {
    id: "high-court",
    icon: "high-court",
    title: "2. 25 राज्य उच्च न्यायालय (25 State High Courts)",
    description: "रिट याचिकाएं (Art. 226/227), प्रथम अपील, 482 व अंतरिम स्टे",
    footer: "सभी 25 राज्य व केंद्र शासित प्रदेश",
    color: "#2563eb",
    border: "#93c5fd",
    bg: "#eff6ff",
    chipBg: "#dbeafe",
    chipColor: "#1d4ed8",
  },
  {
    id: "district",
    icon: "district",
    title: "3. 780+ जिला एवं सत्र न्यायालय (District & Sessions Courts)",
    description: "सिविल वाद, आपराधिक ट्रायल, अग्रिम/नियमित जमानत व पारिवारिक वाद",
    footer: "780+ जिला न्यायालय परिसर (Pan-India)",
    color: "#059669",
    border: "#6ee7b7",
    bg: "#ecfdf5",
    chipBg: "#d1fae5",
    chipColor: "#047857",
  },
  {
    id: "revenue",
    icon: "revenue",
    title: "4. तहसील, SDM व राजस्व न्यायालय (Tehsil & Revenue Courts)",
    description: "दाखिल खारिज (Mutation), पैमाइश, सीमांकन, चकबंदी व भू-राजस्व",
    footer: "नायब तहसीलदार, तहसीलदार, SDM व DM कोर्ट",
    color: "#d97706",
    border: "#fcd34d",
    bg: "#fffbeb",
    chipBg: "#fef3c7",
    chipColor: "#b45309",
  },
  {
    id: "tribunal",
    icon: "tribunal",
    title: "5. 8 वैधानिक अधिकरण (Specialized Tribunals)",
    description: "NCLT, DRT, NGT, CAT, Consumer, RERA, ITAT व AFT अधिकरण",
    footer: "कंपनी, ऋण वसूली, पर्यावरण, सेवा व उपभोक्ता आयोग",
    color: "#7c3aed",
    border: "#c4b5fd",
    bg: "#f5f3ff",
    chipBg: "#ede9fe",
    chipColor: "#6d28d9",
  },
];
