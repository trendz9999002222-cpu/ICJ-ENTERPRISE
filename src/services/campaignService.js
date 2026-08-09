/**
 * ICJ Campaign Service — Campaign-Based Token Earning Engine
 *
 * Members accept campaign promises (e.g. Customer Care, Pro-Bono Legal Advice).
 * Upon work completion and verification, ICJ Tokens are credited to their wallet.
 */

import TokenLedgerService, { TOKEN_TYPES } from "./tokenLedgerService";
import TokenRateService from "./tokenRateService";

const CAMPAIGN_STORE_KEY = "icj_campaigns";
const CAMPAIGN_PARTICIPATION_KEY = "icj_campaign_participations";

const readStore = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const writeStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const SEED_CAMPAIGNS = [
  {
    id: "CAMP-2026-001",
    title: "📞 Customer Care Support Campaign",
    titleHindi: "ग्राहक सेवा सहायता अभियान",
    type: "CUSTOMER_CARE",
    rewardPerUnit: 5, // 5 Tokens per hour
    unitLabel: "Per Verified Hour",
    description: "ICJ हेल्पलाइन कॉल पर सहायता प्रदान करें एवं सदस्यों के प्रश्नों का उत्तर दें।",
    qualificationNeeded: "ICJ Active Member",
    totalBudgetTokens: 5000,
    issuedTokens: 1250,
    status: "ACTIVE",
    createdAt: "2026-08-01",
  },
  {
    id: "CAMP-2026-002",
    title: "💡 Pro-Bono Legal Advice Campaign",
    titleHindi: "निःशुल्क विधिक परामर्श अभियान",
    type: "LEGAL_ADVICE",
    rewardPerUnit: 10, // 10 Tokens per session
    unitLabel: "Per 30-min Session",
    description: "निर्धन एवं असहाय नागरिकों को ऑनलाइन प्राथमिक कानूनी सलाह प्रदान करें।",
    qualificationNeeded: "Verified Advocate / LLB Final Year",
    totalBudgetTokens: 10000,
    issuedTokens: 3400,
    status: "ACTIVE",
    createdAt: "2026-08-01",
  },
  {
    id: "CAMP-2026-003",
    title: "🎯 Member Outreach & Lead Generation",
    titleHindi: "सदस्यता विस्तार एवं प्रचार अभियान",
    type: "LEAD_GEN",
    rewardPerUnit: 15, // 15 Tokens per lead
    unitLabel: "Per Qualified Lead",
    description: "अपने क्षेत्र में नए वकीलों व सदस्यों को ICJ प्लेटफॉर्म से जोड़ें।",
    qualificationNeeded: "All Members",
    totalBudgetTokens: 8000,
    issuedTokens: 2100,
    status: "ACTIVE",
    createdAt: "2026-08-01",
  },
  {
    id: "CAMP-2026-004",
    title: "📝 Legal Literacy & Content Writing",
    titleHindi: "कानूनी साक्षरता एवं लेख अभियान",
    type: "CONTENT",
    rewardPerUnit: 8, // 8 Tokens per approved post
    unitLabel: "Per Approved Article",
    description: "आम जनता के लिए आसान भाषा में कानूनी अधिकारों पर ब्लॉग/लेख लिखें।",
    qualificationNeeded: "All Members",
    totalBudgetTokens: 3000,
    issuedTokens: 950,
    status: "ACTIVE",
    createdAt: "2026-08-01",
  },
];

const ensureSeedCampaigns = () => {
  const existing = readStore(CAMPAIGN_STORE_KEY);
  if (existing.length === 0) {
    writeStore(CAMPAIGN_STORE_KEY, SEED_CAMPAIGNS);
  }
};

export const CampaignService = {
  getAll() {
    ensureSeedCampaigns();
    return readStore(CAMPAIGN_STORE_KEY);
  },

  getParticipationsForMember(memberId) {
    return readStore(CAMPAIGN_PARTICIPATION_KEY).filter((p) => p.memberId === memberId);
  },

  /** Accept a campaign promise */
  acceptCampaign({ campaignId, memberId, memberName, promisedUnits = 1, notes = "" }) {
    ensureSeedCampaigns();
    const campaigns = readStore(CAMPAIGN_STORE_KEY);
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw new Error("Campaign not found.");

    const participations = readStore(CAMPAIGN_PARTICIPATION_KEY);
    const newP = {
      participationId: `PART-${Date.now()}`,
      campaignId,
      campaignTitle: campaign.title,
      memberId,
      memberName,
      promisedUnits: Number(promisedUnits),
      rewardPerUnit: campaign.rewardPerUnit,
      expectedTokens: Number(promisedUnits) * campaign.rewardPerUnit,
      status: "WORK_IN_PROGRESS",
      notes,
      acceptedAt: new Date().toISOString(),
      verifiedAt: null,
      tokensIssued: 0,
    };

    writeStore(CAMPAIGN_PARTICIPATION_KEY, [newP, ...participations]);
    return newP;
  },

  /** Verify and credit tokens to member wallet */
  verifyAndCredit({ participationId, verifiedUnits, verifiedByAdminId }) {
    const participations = readStore(CAMPAIGN_PARTICIPATION_KEY);
    const part = participations.find((p) => p.participationId === participationId);
    if (!part) throw new Error("Participation record not found.");

    const rate = TokenRateService.getCurrentRate();
    const tokensToIssue = Number(verifiedUnits) * part.rewardPerUnit;

    // Issue tokens via TokenLedgerService
    TokenLedgerService.mint({
      toMemberId: part.memberId,
      amount: tokensToIssue,
      tokenType: TOKEN_TYPES.CAMPAIGN_EARN,
      description: `Campaign Reward: ${part.campaignTitle} (${verifiedUnits} units)`,
      issuedByAdminId: verifiedByAdminId || "ICJ_CAMPAIGN_ENGINE",
      inrValueAtIssuance: rate.tokenToInr,
    });

    const updated = participations.map((p) => {
      if (p.participationId === participationId) {
        return {
          ...p,
          status: "COMPLETED_VERIFIED",
          verifiedUnits: Number(verifiedUnits),
          tokensIssued: tokensToIssue,
          verifiedAt: new Date().toISOString(),
          verifiedByAdminId,
        };
      }
      return p;
    });

    writeStore(CAMPAIGN_PARTICIPATION_KEY, updated);
    return { success: true, tokensIssued: tokensToIssue };
  },
};

export default CampaignService;
