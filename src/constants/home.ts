import homeData from "@/data/home.json";

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

export const GATEWAY_CARDS: GatewayCard[] = homeData.gatewayCards as GatewayCard[];

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

export const JUDICIARY_NETWORK = homeData.judiciaryNetwork;

export const JUDICIARY_TIERS: JudiciaryTier[] = homeData.judiciaryTiers as JudiciaryTier[];
