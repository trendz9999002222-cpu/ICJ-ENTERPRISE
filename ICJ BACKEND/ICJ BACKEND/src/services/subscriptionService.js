/**
 * ICJ Subscription Service — Subscription Plans Engine (Module 2)
 *
 * Members can subscribe using Cash or ICJ Tokens.
 * Dynamic Token Renewal Rate: Token cost converts at today's token rate.
 */

import TokenLedgerService from "./tokenLedgerService";
import TokenRateService from "./tokenRateService";

const SUBS_STORE_KEY = "icj_member_subscriptions";

const readStore = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
};
const writeStore = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const PLANS = [
  {
    id: "STARTER",
    name: "🌱 STARTER PLAN",
    nameHindi: "प्रारंभिक योजना",
    priceInr: 0,
    tokenCostDefault: 10,
    durationDays: 30,
    features: [
      "3 AI Legal Drafts / Month",
      "Basic Court Calendar Viewer",
      "Public Directory Profile Listing",
      "Demo Access to Client Portal",
    ],
    recommendedFor: "New Members & Students",
    color: "#059669",
  },
  {
    id: "PRACTITIONER",
    name: "⚖️ PRACTITIONER PLAN",
    nameHindi: "अधिवक्ता अभ्यास योजना",
    priceInr: 499,
    tokenCostDefault: 50,
    durationDays: 30,
    features: [
      "25 AI Legal Drafts / Month",
      "Up to 50 Active Clients Management",
      "Multi-Court Calendar & Hearing SMS Alerts",
      "Basic ICJ Virtual Office & Digital Board",
      "Standard Empanelled Member Badge",
    ],
    recommendedFor: "Practicing Advocates & Law Firms",
    color: "#1e3a8a",
    popular: true,
  },
  {
    id: "ENTERPRISE",
    name: "🏛️ ENTERPRISE PLAN",
    nameHindi: "इंटरप्राइज / सीनियर काउंसिल योजना",
    priceInr: 1499,
    tokenCostDefault: 150,
    durationDays: 30,
    features: [
      "Unlimited AI Legal Drafts & Case Research",
      "Unlimited Clients & Multi-Advocate Firm Queue",
      "Full ICJ Virtual Office + QR Verification",
      "Priority Client Lead Routing from ICJ Portal",
      "Gold Senior Empanelled Seal & Certificate",
      "Dedicated Trust Helpline & Case Manager",
    ],
    recommendedFor: "Senior Advocates, Firms & Corporate Legal Teams",
    color: "#7c3aed",
  },
];

export const SubscriptionService = {
  getPlans() {
    const rate = TokenRateService.getCurrentRate();
    return PLANS.map((plan) => {
      // Dynamic token cost: priceInr / tokenRate (minimum starter tokens)
      const dynamicTokenCost = plan.priceInr > 0
        ? Math.ceil(plan.priceInr / rate.tokenToInr)
        : plan.tokenCostDefault;
      return {
        ...plan,
        dynamicTokenCost,
        currentRatePerToken: rate.tokenToInr,
      };
    });
  },

  getActiveSubscription(memberId) {
    const subs = readStore(SUBS_STORE_KEY);
    const active = subs.find(
      (s) => s.memberId === memberId && new Date(s.expiresAt) > new Date()
    );
    if (!active) {
      // Default to Starter
      return {
        planId: "STARTER",
        planName: "🌱 STARTER PLAN",
        paymentMode: "FREE_DEFAULT",
        subscribedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ACTIVE",
      };
    }
    return active;
  },

  /** Subscribe using Tokens or Cash */
  subscribe({ memberId, memberName, planId, paymentMode = "TOKEN", customTransactionRef = "" }) {
    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) throw new Error("Subscription plan not found.");

    const rate = TokenRateService.getCurrentRate();

    if (paymentMode === "TOKEN" && plan.dynamicTokenCost > 0) {
      // Deduct tokens via TokenLedgerService
      TokenLedgerService.redeem({
        memberId,
        amount: plan.dynamicTokenCost,
        redemptionType: "SERVICE",
        description: `Subscription: ${plan.name} (${plan.durationDays} Days)`,
      });
    }

    const newSub = {
      subId: `SUB-${Date.now()}`,
      memberId,
      memberName,
      planId: plan.id,
      planName: plan.name,
      paymentMode,
      inrPaid: paymentMode === "CASH" ? plan.priceInr : 0,
      tokensDeducted: paymentMode === "TOKEN" ? plan.dynamicTokenCost : 0,
      tokenRateAtSub: rate.tokenToInr,
      subscribedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString(),
      status: "ACTIVE",
      customTransactionRef,
    };

    const existing = readStore(SUBS_STORE_KEY);
    writeStore(SUBS_STORE_KEY, [newSub, ...existing.filter((s) => s.memberId !== memberId)]);

    return newSub;
  },
};

export default SubscriptionService;
