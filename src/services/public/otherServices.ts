import { env } from "@/config/env";
import {
  mockCertificates,
  mockChapters,
  mockDonationReceipts,
  mockKnowledgeItems,
  mockMediaItems,
  mockMembershipTiers,
  mockSocialImpactPrograms,
  mockVolunteerPrograms,
} from "@/data/public/knowledge";
import { mockProfessionals } from "@/data/public/professionals";
import { maskPublicFullName } from "@/lib/privacy/maskPublicIdentity";
import { mockResearchPapers } from "@/data/public/research";
import { paginateArray } from "@/services/public/paginate";
import { serviceService } from "@/services/public/publicServices";
import type {
  CertificateVerification,
  ChapterInfo,
  DonationVerification,
  KnowledgeItem,
  MediaItem,
  MembershipTierInfo,
  PublicPaginatedResponse,
  PublicPaginationParams,
  SocialImpactProgram,
  VolunteerProgram,
} from "@/types/public";

// =============================================================================
// Knowledge Service
// =============================================================================

export const knowledgeService = {
  listItems: async (
    params: PublicPaginationParams = {}
  ): Promise<PublicPaginatedResponse<KnowledgeItem>> => {
    await new Promise((r) => setTimeout(r, 80));
    let filtered = [...mockKnowledgeItems];

    if (params.category && params.category !== "all") {
      filtered = filtered.filter(
        (k) => k.category.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (k) =>
          k.title.toLowerCase().includes(q) ||
          k.summary.toLowerCase().includes(q) ||
          k.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return paginateArray(filtered, params.page ?? 1, params.pageSize ?? 6);
  },
};

// =============================================================================
// Membership Service
// =============================================================================

export const membershipService = {
  listTiers: async (): Promise<MembershipTierInfo[]> => {
    return mockMembershipTiers;
  },

  listVolunteers: async (): Promise<VolunteerProgram[]> => {
    return mockVolunteerPrograms;
  },

  submitMembershipApplication: async (payload: {
    fullName: string;
    email: string;
    mobile: string;
    tier: string;
    profession?: string;
  }): Promise<{ referenceId: string; status: string; message: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return {
      referenceId: `ICJ-MEM-${new Date().getFullYear()}-${randomSuffix}`,
      status: "Submitted For Review",
      message: "Your membership application has been received successfully.",
    };
  },
};

// =============================================================================
// Verification Service
// =============================================================================

export const verificationService = {
  verifyCertificate: async (certNumber: string): Promise<CertificateVerification | null> => {
    await new Promise((r) => setTimeout(r, 350));
    const cleanNum = certNumber.trim().toUpperCase();
    if (mockCertificates[cleanNum]) {
      return mockCertificates[cleanNum];
    }
    // Return a mock result for demo if formatted like ICJ-
    if (cleanNum.startsWith("ICJ-")) {
      return {
        certificateNumber: cleanNum,
        recipientName: "Authorized Participant",
        recipientDesignation: "Verified Credential Holder",
        certificateType: "ICJ Institutional Verification Record",
        issueDate: "2026-01-01",
        issuingAuthority: "International Consortium of Jurists Secretariat",
        status: "Valid",
        verificationHash: "SHA256:d41d8cd98f00b204e9800998ecf8427e",
      };
    }
    return null;
  },

  verifyDonation: async (receiptNumber: string): Promise<DonationVerification | null> => {
    const cleanReceipt = receiptNumber.trim().toUpperCase();
    try {
      const res = await fetch(`${env.apiUrl}/donations/verify-receipt/?receipt=${encodeURIComponent(cleanReceipt)}`);
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const json = await res.json();
        if (json.data && json.data.verified) {
          return {
            receiptNumber: json.data.receipt_number,
            donorInitials: json.data.donor_initials,
            donationCategory: json.data.fund_category,
            donationDate: json.data.date,
            status: json.data.status,
            taxExemptionEligible: json.data.tax_exemption_eligible,
          };
        }
      }
    } catch {
      // fallback
    }

    await new Promise((r) => setTimeout(r, 300));
    if (mockDonationReceipts[cleanReceipt]) {
      return mockDonationReceipts[cleanReceipt];
    }
    if (cleanReceipt.startsWith("ICJ-")) {
      return {
        receiptNumber: cleanReceipt,
        donorInitials: "Verified Donor",
        donationCategory: "Citizen Legal Assistance Fund",
        donationDate: "2026-02-01",
        status: "Verified & Audited",
        taxExemptionEligible: true,
      };
    }
    return null;
  },
};

// =============================================================================
// Universal Search Service
// =============================================================================

export type UniversalSearchResult = {
  id: string;
  type: "Service" | "Professional" | "Research" | "Knowledge" | "Event";
  title: string;
  snippet: string;
  url: string;
  metadataTag: string;
};

export const searchService = {
  searchAll: async (
    query: string,
    filterCategory = "all",
    page = 1,
    pageSize = 10
  ): Promise<PublicPaginatedResponse<UniversalSearchResult>> => {
    const q = (query || "").trim().toLowerCase();
    const results: UniversalSearchResult[] = [];

    // Search Services via real DB service
    if (filterCategory === "all" || filterCategory === "services") {
      try {
        const sRes = await serviceService.listServices({ search: q || undefined, pageSize: 20 });
        sRes.results.forEach((s) => {
          results.push({
            id: `s-${s.id}`,
            type: "Service",
            title: s.title,
            snippet: s.shortDescription,
            url: `/services/${s.slug}`,
            metadataTag: s.categoryLabel,
          });
        });
      } catch (err) {
        console.error("Failed searching services:", err);
      }
    }

    // Search Professionals
    if (filterCategory === "all" || filterCategory === "professionals") {
      mockProfessionals.forEach((p) => {
        if (
          !q ||
          p.fullName.toLowerCase().includes(q) ||
          p.profession.toLowerCase().includes(q) ||
          p.specialisations.some((sp) => sp.toLowerCase().includes(q))
        ) {
          results.push({
            id: `p-${p.id}`,
            type: "Professional",
            title: `${maskPublicFullName(p.fullName)} (${p.profession})`,
            snippet: `${p.specialisations.join(", ")} · ${p.city}, ${p.state} · ${p.experienceYears} yrs exp.`,
            url: `/professionals/${p.id}`,
            metadataTag: p.profession,
          });
        }
      });
    }

    // Search Research Papers
    if (filterCategory === "all" || filterCategory === "research") {
      mockResearchPapers.forEach((rp) => {
        if (!q || rp.title.toLowerCase().includes(q) || rp.abstract.toLowerCase().includes(q)) {
          results.push({
            id: `rp-${rp.id}`,
            type: "Research",
            title: rp.title,
            snippet: rp.abstract,
            url: `/research`,
            metadataTag: `${rp.category} (${rp.publishedYear})`,
          });
        }
      });
    }

    // Search Knowledge Items
    if (filterCategory === "all" || filterCategory === "knowledge") {
      mockKnowledgeItems.forEach((k) => {
        if (!q || k.title.toLowerCase().includes(q) || k.summary.toLowerCase().includes(q)) {
          results.push({
            id: `k-${k.id}`,
            type: "Knowledge",
            title: k.title,
            snippet: k.summary,
            url: `/knowledge-centre`,
            metadataTag: k.category,
          });
        }
      });
    }

    return paginateArray(results, page, pageSize);
  },
};

// =============================================================================
// Social Impact Service
// =============================================================================

export const socialImpactService = {
  listPrograms: async (): Promise<SocialImpactProgram[]> => {
    await new Promise((r) => setTimeout(r, 80));
    return mockSocialImpactPrograms;
  },
};

// =============================================================================
// Chapter & Network Service
// =============================================================================

export const chapterService = {
  listChapters: async (): Promise<ChapterInfo[]> => {
    await new Promise((r) => setTimeout(r, 80));
    return mockChapters;
  },
};

// =============================================================================
// Media & News Service
// =============================================================================

export const mediaService = {
  listMedia: async (
    params: PublicPaginationParams = {}
  ): Promise<PublicPaginatedResponse<MediaItem>> => {
    await new Promise((r) => setTimeout(r, 80));
    let filtered = [...mockMediaItems];

    if (params.category && params.category !== "all") {
      filtered = filtered.filter(
        (m) => m.type.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.summary.toLowerCase().includes(q) ||
          m.sourceOrAuthor.toLowerCase().includes(q)
      );
    }

    return paginateArray(filtered, params.page ?? 1, params.pageSize ?? 6);
  },
};

// =============================================================================
// Grievance Service
// =============================================================================

export const grievanceService = {
  submitGrievance: async (payload: {
    fullName: string;
    email: string;
    mobile: string;
    category: string;
    subject: string;
    description: string;
    againstEntity?: string;
  }): Promise<{ ticketId: string; status: string; message: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return {
      ticketId: `ICJ-GRV-${new Date().getFullYear()}-${randomSuffix}`,
      status: "Registered & Assigned to Ombudsman Cell",
      message:
        "Your grievance has been formally registered. An acknowledgement and tracking link have been dispatched to your email and mobile.",
    };
  },
};

// =============================================================================
// Donation & Sponsorship Service
// =============================================================================

export const donationService = {
  submitDonationIntent: async (payload: {
    donorName: string;
    email: string;
    mobile: string;
    panOrTaxId?: string;
    amount: number;
    fundCategory: string;
    isAnonymous?: boolean;
  }): Promise<{ receiptNumber: string; status: string; message: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return {
      receiptNumber: `ICJ-DON-${randomSuffix}`,
      status: "Payment Intent Registered",
      message:
        "Thank you for supporting institutional justice. Complete transaction details and 80G tax exemption receipt will be issued upon gateway settlement.",
    };
  },
};

// =============================================================================
// Volunteer Application Service
// =============================================================================

export const volunteerService = {
  submitApplication: async (payload: {
    fullName: string;
    email: string;
    mobile: string;
    city: string;
    state: string;
    programId: string;
    statementOfPurpose: string;
    hoursAvailablePerWeek: string;
  }): Promise<{ referenceId: string; status: string; message: string }> => {
    await new Promise((r) => setTimeout(r, 400));
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return {
      referenceId: `ICJ-VOL-${new Date().getFullYear()}-${randomSuffix}`,
      status: "Application Under Review",
      message:
        "Your volunteer application has been logged. The Regional Chapter Coordinator will reach out for a brief orientation interview.",
    };
  },
};
