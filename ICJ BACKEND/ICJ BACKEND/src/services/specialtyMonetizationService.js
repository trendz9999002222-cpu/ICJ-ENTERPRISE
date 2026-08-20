import { MemberService } from "./memberService.js";

const BASE_FREE_SPECIALTIES = 1;
const FEE_PER_EXTRA_SPECIALTY = 500; // 500 Tokens or ₹500
const MASTER_TITANIUM_BUNDLE_PRICE = 3000; // All 12 Specialties

export const SpecialtyMonetizationService = {
  /**
   * Calculate Fee Breakdown for Selected Number of Specialties
   * Rule: Category (General/OBC/SC/ST) = FREE (₹0)
   * Rule: 1st Specialty = FREE (₹0)
   * Rule: 2nd, 3rd, 4th... Specialty = +₹500 / 500 Tokens each
   */
  calculateFee(specialtiesCount = 1) {
    if (specialtiesCount <= BASE_FREE_SPECIALTIES) {
      return {
        totalFee: 0,
        freeCount: 1,
        paidCount: 0,
        feePerItem: FEE_PER_EXTRA_SPECIALTY,
        isTitaniumBundle: false,
        breakdownText: "1st Primary Specialty: FREE (₹0)",
      };
    }

    if (specialtiesCount >= 12) {
      return {
        totalFee: MASTER_TITANIUM_BUNDLE_PRICE,
        freeCount: 1,
        paidCount: 11,
        feePerItem: 250,
        isTitaniumBundle: true,
        breakdownText: "All 12 Specialties Master Titanium Bundle: ₹3,000 / 3,000 Tokens (Save ₹2,500!)",
      };
    }

    const paidCount = specialtiesCount - BASE_FREE_SPECIALTIES;
    const totalFee = paidCount * FEE_PER_EXTRA_SPECIALTY;

    return {
      totalFee,
      freeCount: 1,
      paidCount,
      feePerItem: FEE_PER_EXTRA_SPECIALTY,
      isTitaniumBundle: false,
      breakdownText: `1 Free Specialty + ${paidCount} Paid Specialties (${paidCount} x ₹500 = ₹${totalFee})`,
    };
  },

  /**
   * Purchase & Unlock Multi-Specialty Badges for Advocate
   */
  async purchaseSpecialties({ memberId, selectedSpecialtiesArray = [] }) {
    const feeCalculation = this.calculateFee(selectedSpecialtiesArray.length);

    // Update Advocate Profile in Database
    const existing = await MemberService.getById(memberId);
    if (existing) {
      const updatedData = {
        ...existing,
        unlockedSpecialties: selectedSpecialtiesArray,
        specialtyBadgeCount: selectedSpecialtiesArray.length,
        specialtyTier: selectedSpecialtiesArray.length >= 12 ? "TITANIUM_MASTER" : selectedSpecialtiesArray.length > 1 ? "MULTI_SPECIALTY" : "STANDARD",
      };
      await MemberService.update(memberId, updatedData);
    }

    return {
      success: true,
      unlockedCount: selectedSpecialtiesArray.length,
      feeCharged: feeCalculation.totalFee,
      revenueSplit: {
        advocateTrust: Math.round(feeCalculation.totalFee * 0.2), // 20%
        districtFranchisee: Math.round(feeCalculation.totalFee * 0.1), // 10%
        platformTech: Math.round(feeCalculation.totalFee * 0.7), // 70%
      },
    };
  },
};

export default SpecialtyMonetizationService;
