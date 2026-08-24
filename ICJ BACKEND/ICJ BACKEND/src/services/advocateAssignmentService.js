/**
 * ICJ ENTERPRISE PLATFORM — 3-TIER ALLOCATION & TRI-CHANNEL DISPATCH SERVICE
 * 
 * Manages:
 * 1. 3-Tier Assignees (District Franchise Agency, ICJ Customer Care Desk, Empaneled Advocate)
 * 2. Strict Role Isolation (Hard block preventing Clients from appearing as assignees)
 * 3. Dynamic Context-Aware Message Templates (Franchise Call Center, Care Desk, Legal Counsel)
 * 4. 1-Click Advocate Appointment & Replacement Engine for Franchises and Admins
 */

import MemberService from "./memberService.js";
import LegalService from "./legalService.js";
import ActivityService from "./activityService.js";
import NotificationService from "./notificationService.js";
import SMTPProvider from "./otp/providers/smtpProvider.js";

const TEMPLATE_STORAGE_KEY = "icj_3tier_assignment_templates_v2";

export const OFFICIAL_IN_HOUSE_OFFICERS = [
  {
    id: "ICJ-CARE-01",
    member_id: "ICJ-CARE-01",
    memberId: "ICJ-CARE-01",
    fullName: "ICJ Central Customer Care & Legal Helpline",
    name: "ICJ Central Customer Care & Legal Helpline",
    role: "customer_care",
    user_type: "customer_care",
    category: "customer_care",
    professionalCategory: "Grievance Redressal & Triage Desk",
    professionalRegNo: "ICJ/HQ/CARE/01",
    practiceCourts: "Pan-India Legal Triage & Client Call Center",
    mobile: "+91 7053002222",
    email: "Consortiumofjurist@gmail.com",
    isOfficialCare: true,
  },
  {
    id: "ICJ-INTAKE-02",
    member_id: "ICJ-INTAKE-02",
    memberId: "ICJ-INTAKE-02",
    fullName: "ICJ In-House Legal Triage & Mediation Officer",
    name: "ICJ In-House Legal Triage & Mediation Officer",
    role: "legal_officer",
    user_type: "legal_officer",
    category: "customer_care",
    professionalCategory: "Pre-Litigation Mediation & Legal Review",
    professionalRegNo: "ICJ/HQ/TRIAGE/02",
    practiceCourts: "Supreme Court & High Court Triage Desk",
    mobile: "+91 9999002222",
    email: "Consortiumofjurist@gmail.com",
    isOfficialCare: true,
  },
];

export const DEFAULT_ASSIGNMENT_TEMPLATES = {
  // 1. FRANCHISE PARENT AGENCY TEMPLATE
  franchiseSubject: "🏢 ICJ Regional Support: Your District Franchise Agency {{assignee_name}} has been appointed (ID: {{client_id}})",
  franchiseWhatsApp: `🏢 *ICJ DISTRICT FRANCHISE AGENCY ALLOCATION NOTICE*

प्रिय *{{client_name}}* (Ref: {{client_id}}),
इंटरनेशनल कंसोर्टियम ऑफ ज्यूरिस्ट्स (ICJ) सचिवालय द्वारा आपकी विधिक समस्या के समाधान एवं स्थानीय सहायता हेतु अधिकृत जिला पैरेंट फ्रैंचाइज़ी एजेंसी नियुक्त कर दी गई है:

🏢 *पैरेंट एजेंसी:* {{assignee_name}}
🆔 *एजेंसी आईडी:* {{assignee_id}}
📍 *कार्यक्षेत्र:* {{assignee_jurisdiction}}
📱 *हेल्पलाइन / फोन:* {{assignee_mobile}}
✉️ *ईमेल:* {{assignee_email}}

हमारी फ्रैंचाइज़ी टीम (लोकल कॉल सेंटर) जल्द ही आपसे संपर्क कर आपकी समस्या का पूरा विवरण लेगी, कागजात की जांच करेगी और आपके लिए सर्वश्रेष्ठ अधिकृत अधिवक्ता नियुक्त करेगी।

🌐 *Client Portal:* https://icj.co.in/client-portal
📞 *ICJ Central Helpline:* {{support_phone}}
_— ICJ Governance & Secretariat_`,

  // 2. CENTRAL CUSTOMER CARE HELPDESK TEMPLATE
  careSubject: "🎧 ICJ Grievance Support: Customer Care Desk has been assigned to assist you (Ref: {{client_id}})",
  careWhatsApp: `🎧 *ICJ CUSTOMER CARE ASSISTANCE NOTICE*

प्रिय *{{client_name}}*,
इंटरनेशनल कंसोर्टियम ऑफ ज्यूरिस्ट्स (ICJ) द्वारा आपकी समस्या के त्वरित समाधान हेतु कस्टमर केयर सहायता अधिकारी नियुक्त कर दिए गए हैं:

🎧 *सहायता डेस्क:* {{assignee_name}}
🆔 *डेस्क आईडी:* {{assignee_id}}
📱 *हेल्पलाइन:* {{assignee_mobile}}
✉️ *ईमेल:* {{assignee_email}}

हमारा सहायता प्रतिनिधि जल्द ही आपकी समस्या का विवरण समझने, प्राथमिक विधिक मार्गदर्शन देने व आवश्यकतानुसार संबंधित अधिवक्ता से आपकी बात कराने हेतु संपर्क करेगा।

🌐 *Client Portal:* https://icj.co.in/client-portal
_— ICJ Customer Care & Secretariat_`,

  // 3. ADVOCATE LEGAL COUNSEL TEMPLATE
  advocateSubject: "⚖️ ICJ Legal Counsel: Advocate {{assignee_name}} appointed for your legal matter (Ref: {{client_id}})",
  advocateWhatsApp: `⚖️ *ICJ LEGAL COUNSEL APPOINTMENT NOTICE*

प्रिय *{{client_name}}*,
इंटरनेशनल कंसोर्टियम ऑफ ज्यूरिस्ट्स (ICJ) द्वारा आपके मामले के विधिक परामर्श, कोर्ट ड्राफ्टिंग एवं अदालती पैरवी हेतु अधिकृत अधिवक्ता नियुक्त कर दिए गए हैं:

👤 *अधिवक्ता:* {{assignee_name}}
🆔 *बार / सदस्य आईडी:* {{assignee_id}}
📱 *मोबाइल:* {{assignee_mobile}}
📜 *बार काउंसिल:* {{assignee_bar_reg}}

एडवोकेट महोदय जल्द ही आपसे कानूनी कार्यवाही व समाधान हेतु संपर्क करेंगे।

🌐 *Client Portal:* https://icj.co.in/client-portal
📞 *ICJ Helpline:* {{support_phone}}
_— ICJ Legal Secretariat_`,
};

export const AdvocateAssignmentService = {
  /**
   * Get active message templates (Custom or Default)
   */
  getTemplates() {
    const storage = typeof window !== "undefined" && window.localStorage 
      ? window.localStorage 
      : (typeof globalThis !== "undefined" ? globalThis.localStorage : null);

    if (!storage) return { ...DEFAULT_ASSIGNMENT_TEMPLATES };
    try {
      const stored = storage.getItem(TEMPLATE_STORAGE_KEY);
      if (stored) return { ...DEFAULT_ASSIGNMENT_TEMPLATES, ...JSON.parse(stored) };
    } catch {}
    return { ...DEFAULT_ASSIGNMENT_TEMPLATES };
  },

  /**
   * Save customized message templates
   */
  saveTemplates(templates) {
    const storage = typeof window !== "undefined" && window.localStorage 
      ? window.localStorage 
      : (typeof globalThis !== "undefined" ? globalThis.localStorage : null);

    if (!storage) return;
    try {
      storage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
    } catch (e) {
      console.error("Failed to save assignment templates", e);
    }
  },

  /**
   * Reset templates to official default
   */
  resetTemplatesToDefault() {
    const storage = typeof window !== "undefined" && window.localStorage 
      ? window.localStorage 
      : (typeof globalThis !== "undefined" ? globalThis.localStorage : null);

    if (!storage) return DEFAULT_ASSIGNMENT_TEMPLATES;
    try {
      storage.removeItem(TEMPLATE_STORAGE_KEY);
    } catch {}
    return { ...DEFAULT_ASSIGNMENT_TEMPLATES };
  },

  /**
   * Render template with dynamic values
   */
  renderTemplate(templateString = "", context = {}) {
    if (!templateString) return "";
    let rendered = String(templateString);
    const keys = Object.keys(context);
    for (const key of keys) {
      const val = context[key] !== undefined && context[key] !== null ? String(context[key]) : "";
      const regex = new RegExp(`{{${key}}}`, "g");
      rendered = rendered.replace(regex, val);
    }
    return rendered;
  },

  /**
   * Get 3-Tier Categorized Assignees with strict role isolation (Clients strictly excluded)
   */
  async getCategorizedAssignees(excludeTargetId = null) {
    try {
      const allMembers = await MemberService.getAll();
      const rawList = Array.isArray(allMembers) ? allMembers : [];

      const sanitizedTargetId = excludeTargetId ? String(excludeTargetId).toLowerCase() : "";

      const franchisees = [];
      const advocates = [];

      for (const m of rawList) {
        const id = String(m?.member_id || m?.memberId || m?.id || "");
        const idLower = id.toLowerCase();
        const role = String(m?.role || m?.user_type || "").toLowerCase();
        const purpose = String(m?.purposeCode || m?.purpose || "").toLowerCase();

        // 1. HARD BLOCK ON CLIENTS (Never allow clients in assignee rosters)
        if (role === "client" || id.includes("CLT") || purpose.includes("litigant")) {
          continue;
        }

        // 2. EXCLUDE TARGET CLIENT (Self-assignment prevention)
        if (sanitizedTargetId && (idLower === sanitizedTargetId || String(m?.id || "").toLowerCase() === sanitizedTargetId)) {
          continue;
        }

        // 3. FRANCHISE PARTNERS (District / Regional Agencies)
        if (role === "franchise" || id.includes("FRZ") || purpose.includes("franchise")) {
          franchisees.push({
            id,
            member_id: id,
            memberId: id,
            fullName: m.fullName || m.name || `District Franchise Agency (${id})`,
            name: m.fullName || m.name || `District Franchise Agency (${id})`,
            role: "franchise",
            category: "franchise",
            jurisdiction: m.franchiseDistrict || m.district || m.city || m.franchiseCity || "District Jurisdiction",
            state: m.franchiseState || m.state || "India",
            mobile: m.mobile || "+91 9999002222",
            email: m.email || "Consortiumofjurist@gmail.com",
            verification_status: m.verification_status || "Approved",
          });
          continue;
        }

        // 4. EMPANELED ADVOCATES (Advocates with bar registration or ICJ ID)
        if (role === "advocate" || id.includes("ICJ") || id.includes("ADV") || Boolean(m.professionalRegNo)) {
          advocates.push({
            id,
            member_id: id,
            memberId: id,
            fullName: m.fullName || m.name || `Advocate (${id})`,
            name: m.fullName || m.name || `Advocate (${id})`,
            role: "advocate",
            category: "advocate",
            professionalRegNo: m.professionalRegNo || "Verified Bar Council Member",
            practiceCourts: m.practiceCourts || "Supreme Court & High Courts",
            specializations: m.specializations || "Civil, Criminal, Constitutional",
            mobile: m.mobile || "+91 9999002222",
            email: m.email || "advocate9999002222@gmail.com",
            verification_status: m.verification_status || "Approved",
          });
        }
      }

      return {
        franchisees,
        customerCare: OFFICIAL_IN_HOUSE_OFFICERS,
        advocates,
        allFlat: [...franchisees, ...OFFICIAL_IN_HOUSE_OFFICERS, ...advocates],
      };
    } catch (err) {
      console.error("Failed to categorize assignees", err);
      return {
        franchisees: [],
        customerCare: OFFICIAL_IN_HOUSE_OFFICERS,
        advocates: [],
        allFlat: OFFICIAL_IN_HOUSE_OFFICERS,
      };
    }
  },

  /**
   * Universal 3-Tier Allocation Engine for Client or Court Case
   */
  async allocate({
    targetMember = null,
    targetCase = null,
    assignee = null,
    customSubject = null,
    customWhatsApp = null,
    channels = { email: true, whatsapp: true, inApp: true },
    assignedBy = "ICJ Super Admin",
  }) {
    if (!assignee) throw new Error("Assignee is required for allocation.");
    if (!targetMember && !targetCase) throw new Error("Either Target Member or Target Case is required.");

    const clientId = targetMember?.member_id || targetMember?.id || targetCase?.clientMemberId || targetCase?.client_id || (targetCase ? targetCase.id : "ICJ-CLIENT");
    const clientName = targetMember?.fullName || targetMember?.name || targetCase?.clientName || targetCase?.name || "Valued Client";
    const clientMobile = targetMember?.mobile || targetCase?.clientPhone || targetCase?.mobile || "";
    const clientEmail = targetMember?.email || targetCase?.clientEmail || targetCase?.email || "";

    const assigneeCategory = assignee.category || assignee.role || (assignee.isOfficialCare ? "customer_care" : "advocate");
    const assigneeName = assignee.fullName || assignee.name || "Appointed Representative";
    const assigneeId = assignee.member_id || assignee.id || "ICJ-REP";
    const assigneeMobile = assignee.mobile || "+91 7053002222";
    const assigneeEmail = assignee.email || "Consortiumofjurist@gmail.com";
    const assigneeBarReg = assignee.professionalRegNo || (assignee.isOfficialCare ? "ICJ Helpdesk" : "Verified Council Member");
    const assigneeJurisdiction = assignee.jurisdiction || assignee.practiceCourts || "Pan-India";

    // 1. Build Context
    const context = {
      client_id: clientId,
      client_name: clientName,
      client_mobile: clientMobile,
      client_email: clientEmail,
      assignee_name: assigneeName,
      assignee_id: assigneeId,
      assignee_mobile: assigneeMobile,
      assignee_email: assigneeEmail,
      assignee_bar_reg: assigneeBarReg,
      assignee_jurisdiction: assigneeJurisdiction,
      assigned_date: new Date().toLocaleDateString("en-IN"),
      support_phone: "7053002222 / 9999002222",
    };

    const templates = this.getTemplates();

    // 2. Select Appropriate Template based on Assignee Category
    let defaultSubject = templates.advocateSubject;
    let defaultWhatsApp = templates.advocateWhatsApp;

    if (assigneeCategory === "franchise") {
      defaultSubject = templates.franchiseSubject;
      defaultWhatsApp = templates.franchiseWhatsApp;
    } else if (assigneeCategory === "customer_care") {
      defaultSubject = templates.careSubject;
      defaultWhatsApp = templates.careWhatsApp;
    }

    const emailSubject = this.renderTemplate(customSubject || defaultSubject, context);
    const whatsappText = this.renderTemplate(customWhatsApp || defaultWhatsApp, context);

    // 3. Update Member Record if target is a Member
    const allocationRecord = {
      assignee_type: assigneeCategory,
      assignee_id: assigneeId,
      assignee_name: assigneeName,
      assignee_mobile: assigneeMobile,
      assignee_email: assigneeEmail,
      assignee_bar_reg: assigneeBarReg,
      assignee_jurisdiction: assigneeJurisdiction,
      allotted_by: assignedBy,
      allotted_at: new Date().toISOString(),
      status: "ACTIVE_ASSIGNED",
    };

    if (targetMember) {
      const updatePayload = {
        assigned_officer: allocationRecord,
        assigned_advocate: assigneeCategory === "advocate" ? allocationRecord : (targetMember.assigned_advocate || null),
        assigned_franchise: assigneeCategory === "franchise" ? allocationRecord : (targetMember.assigned_franchise || null),
        advocateName: assigneeCategory === "advocate" ? assigneeName : targetMember.advocateName,
        advocateId: assigneeCategory === "advocate" ? assigneeId : targetMember.advocateId,
        advocateMobile: assigneeCategory === "advocate" ? assigneeMobile : targetMember.advocateMobile,
      };

      try {
        await MemberService.update(clientId, updatePayload);
      } catch (e) {
        console.warn("Member update notice:", e);
      }

      // Sync active citizen case in local storage for Client Portal
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          const citizenCase = {
            case_id: clientId,
            id: clientId,
            caseNumber: clientId,
            title: "नागरिक विधिक सहायता एवं समस्या निवारण",
            clientName,
            clientPhone: clientMobile,
            clientEmail,
            assigned_officer: allocationRecord,
            assigned_advocate: updatePayload.assigned_advocate,
            assigned_franchise: updatePayload.assigned_franchise,
            advocateName: updatePayload.advocateName,
            advocateMobile: updatePayload.advocateMobile,
            status: "Active Supervision",
            createdAt: new Date().toISOString(),
          };
          window.localStorage.setItem("icj_citizen_active_case", JSON.stringify(citizenCase));
        } catch {}
      }
    }

    // 4. Update Case Record if target is a Case
    if (targetCase) {
      const caseId = targetCase.caseId || targetCase.id;
      const caseUpdate = {
        ...targetCase,
        assigned_officer: allocationRecord,
        assigned_advocate: assigneeCategory === "advocate" ? allocationRecord : (targetCase.assigned_advocate || null),
        assigned_franchise: assigneeCategory === "franchise" ? allocationRecord : (targetCase.assigned_franchise || null),
        advocateName: assigneeCategory === "advocate" ? assigneeName : targetCase.advocateName,
        status: "In Progress",
      };

      try {
        await LegalService.update(caseId, caseUpdate);
      } catch (e) {}
    }

    // 5. Dispatch Alerts
    const dispatchResults = {
      email: { sent: false },
      whatsapp: { generated: false, url: null },
      inApp: { sent: false },
    };

    // Email Dispatch
    if (channels.email && clientEmail) {
      try {
        const smtpRes = await SMTPProvider.sendOTP({
          email: clientEmail,
          customSubject: emailSubject,
          customHtml: `<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
            <div style="background: #0a192f; color: #fff; padding: 16px; text-align: center; border-radius: 6px;">
              <h2 style="margin: 0;">International Consortium of Jurists (ICJ)</h2>
              <p style="margin: 4px 0 0 0; color: #38bdf8;">Official Allocation Notice</p>
            </div>
            <div style="padding: 20px 0;">
              <p><strong>प्रिय ${clientName},</strong></p>
              <p style="white-space: pre-line;">${whatsappText.replace(/[*_#]/g, "")}</p>
            </div>
          </div>`,
        });
        dispatchResults.email = { sent: smtpRes.success };
      } catch (err) {}
    }

    // WhatsApp Link
    if (channels.whatsapp && clientMobile) {
      const cleanPhone = clientMobile.replace(/\D/g, "");
      const fullPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
      const waUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(whatsappText)}`;
      dispatchResults.whatsapp = { generated: true, url: waUrl };
    }

    // In-App Notification
    if (channels.inApp) {
      try {
        NotificationService.create({
          title: `🏢 Allocated: ${assigneeName}`,
          message: `${assigneeName} (${assigneeMobile}) has been assigned to support you.`,
          type: "allocation",
          recipient: clientEmail || clientName,
        });
        dispatchResults.inApp = { sent: true };
      } catch (e) {}
    }

    // Log Activity
    try {
      ActivityService.create({
        title: `${assigneeCategory.toUpperCase()} "${assigneeName}" assigned to Client "${clientName}" (${clientId})`,
        type: "allocation",
      });
    } catch (e) {}

    return {
      success: true,
      dispatchResults,
      whatsappText,
      whatsappUrl: dispatchResults.whatsapp.url,
      allocationRecord,
    };
  },

  /**
   * 1-Click Replace Advocate (For Franchise & Admin)
   */
  async replaceAdvocate({
    targetClientId,
    clientName,
    clientMobile,
    clientEmail,
    oldAdvocateName = "Previous Counsel",
    newAdvocate,
    replacementReason = "Client Service Optimization",
    replacedBy = "District Franchise Agency",
  }) {
    if (!newAdvocate) throw new Error("New Advocate is required for replacement.");

    const res = await this.allocate({
      targetMember: {
        id: targetClientId,
        member_id: targetClientId,
        fullName: clientName,
        mobile: clientMobile,
        email: clientEmail,
      },
      assignee: newAdvocate,
      assignedBy: replacedBy,
    });

    try {
      ActivityService.create({
        title: `🔄 Advocate Replaced: "${newAdvocate.fullName}" replaced "${oldAdvocateName}" for Client ${clientName} (Reason: ${replacementReason})`,
        type: "advocate_replacement",
      });
    } catch (e) {}

    return res;
  },
};

export default AdvocateAssignmentService;
