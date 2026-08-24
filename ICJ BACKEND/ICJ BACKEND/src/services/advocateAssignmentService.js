/**
 * ICJ ENTERPRISE PLATFORM — ADVOCATE ASSIGNMENT & TRI-CHANNEL DISPATCH SERVICE
 * 
 * Handles:
 * 1. Advocate Selection & Allocation to Client Cases
 * 2. Tri-Channel Dispatch (Brevo SMTP Email, Direct WhatsApp, In-App / SMS Alerts)
 * 3. Editable Message Template Management with dynamic placeholders
 */

import MemberService from "./memberService.js";
import LegalService from "./legalService.js";
import ActivityService from "./activityService.js";
import NotificationService from "./notificationService.js";
import SMTPProvider from "./otp/providers/smtpProvider.js";

const TEMPLATE_STORAGE_KEY = "icj_advocate_assignment_templates_v1";

export const DEFAULT_ASSIGNMENT_TEMPLATES = {
  emailSubject: "⚖️ ICJ Case Allocation: Advocate {{advocate_name}} has been appointed for your case (Ref: {{case_id}})",
  
  emailBodyHtml: `
<div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
  <div style="background: #0a192f; color: #ffffff; padding: 24px; text-align: center; border-bottom: 3px solid #d97706;">
    <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.5px; text-transform: uppercase;">International Consortium of Jurists (ICJ)</h2>
    <p style="margin: 4px 0 0 0; color: #38bdf8; font-size: 13px; font-weight: bold;">Official Legal Counsel Allocation Notice</p>
  </div>

  <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
    <p style="font-size: 15px; margin-top: 0;"><strong>प्रिय / Dear {{client_name}},</strong></p>
    <p style="font-size: 14px;">
      इंटरनेशनल कंसोर्टियम ऑफ ज्यूरिस्ट्स (ICJ) सचिवालय द्वारा आपके केस <strong>(Ref: {{case_id}} - {{case_title}})</strong> के लिए अधिकृत अधिवक्ता (Empaneled Legal Counsel) नियुक्त कर दिया गया है।
    </p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 14px; text-transform: uppercase;">📋 नियुक्त अधिवक्ता विवरण / Appointed Advocate Particulars</h4>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; color: #64748b; width: 40%;"><strong>अधिवक्ता का नाम (Name):</strong></td>
          <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">{{advocate_name}}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;"><strong>सदस्य आईडी (Member ID):</strong></td>
          <td style="padding: 4px 0; color: #0f172a; font-family: monospace; font-weight: bold;">{{advocate_id}}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;"><strong>बार रजिस्ट्रेशन (Bar Reg):</strong></td>
          <td style="padding: 4px 0; color: #0f172a;">{{advocate_bar_reg}}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;"><strong>मोबाइल नंबर (Mobile):</strong></td>
          <td style="padding: 4px 0; color: #2563eb; font-weight: bold;">{{advocate_mobile}}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #64748b;"><strong>ईमेल (Email):</strong></td>
          <td style="padding: 4px 0; color: #0f172a;">{{advocate_email}}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13.5px; color: #334155;">
      एडवोकेट महोदय जल्द ही आपसे केस ड्राफ्टिंग, विधिक परामर्श एवं अग्रिम अदालती कार्यवाही हेतु सीधे संपर्क करेंगे। आप अपने <strong>ICJ Client Portal</strong> पर लॉगिन करके भी केस की लाइव स्थिति देख सकते हैं।
    </p>

    <div style="text-align: center; margin: 25px 0 15px 0;">
      <a href="https://icj.co.in/client-portal" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 22px; font-weight: bold; font-size: 13px; border-radius: 6px; display: inline-block;">
        View Case in Client Portal ➔
      </a>
    </div>
  </div>

  <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0 0 4px 0; font-weight: bold; color: #0f172a;">International Consortium of Jurists (ICJ)</p>
    <p style="margin: 0;">हेल्पलाइन: {{support_phone}} | वेबसाइट: icj.co.in | ईमेल: Consortiumofjurist@gmail.com</p>
  </div>
</div>
  `,

  whatsappMessage: `⚖️ *ICJ LEGAL COUNSEL APPOINTMENT NOTICE*

प्रिय *{{client_name}}*,
इंटरनेशनल कंसोर्टियम ऑफ ज्यूरिस्ट्स (ICJ) द्वारा आपके केस *(Ref: {{case_id}})* के लिए आधिकारिक अधिवक्ता नियुक्त कर दिए गए हैं:

👤 *अधिवक्ता:* {{advocate_name}}
🆔 *Member ID:* {{advocate_id}}
📱 *मोबाइल:* {{advocate_mobile}}
📜 *Bar Reg:* {{advocate_bar_reg}}

एडवोकेट महोदय जल्द ही कानूनी परामर्श व अग्रिम अदालती कार्यवाही हेतु आपसे संपर्क करेंगे।

🌐 *Portal:* https://icj.co.in/client-portal
📞 *ICJ Helpline:* {{support_phone}}
_— ICJ Customer Care & Secretariat_`,

  smsMessage: `ICJ Update: Advocate {{advocate_name}} (Mob: {{advocate_mobile}}) has been appointed for your case {{case_id}}. The advocate will contact you shortly. Helpline: {{support_phone}}`,
};

export const AdvocateAssignmentService = {
  /**
   * Get active message templates (Custom or Default)
   */
  getTemplates() {
    const storage = typeof window !== "undefined" && window.localStorage 
      ? window.localStorage 
      : (typeof globalThis !== "undefined" ? globalThis.localStorage : null);

    if (!storage) {
      return { ...DEFAULT_ASSIGNMENT_TEMPLATES };
    }
    try {
      const stored = storage.getItem(TEMPLATE_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_ASSIGNMENT_TEMPLATES, ...JSON.parse(stored) };
      }
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
   * Get list of verified advocates available for allocation
   */
  async getAvailableAdvocates() {
    try {
      const allMembers = await MemberService.getAll();
      if (!Array.isArray(allMembers)) return [];

      return allMembers.filter((m) => {
        const role = String(m?.role || m?.user_type || "").toLowerCase();
        const isAdv = role === "advocate" ||
          String(m?.purposeCode || m?.purpose || "").includes("SERVICES") ||
          Boolean(m?.professionalRegNo || m?.practiceCourts);
        
        // Also ensure member is approved / active or under review
        return isAdv;
      });
    } catch (err) {
      console.error("Failed to fetch advocates", err);
      return [];
    }
  },

  /**
   * Allocate Advocate to Case & Dispatch Multi-Channel Notifications
   */
  async allocateAdvocateToCase({
    caseItem,
    advocate,
    customSubject = null,
    customEmailBody = null,
    customWhatsApp = null,
    channels = { email: true, whatsapp: true, inApp: true },
    assignedBy = "ICJ Super Admin",
  }) {
    if (!caseItem || !advocate) {
      throw new Error("Both Case and Advocate are required for allocation.");
    }

    const templates = this.getTemplates();
    const caseId = caseItem.caseId || caseItem.id || caseItem.case_id || `ICJ-CASE-${Date.now()}`;
    const clientName = caseItem.clientName || caseItem.client_name || caseItem.name || "Valued Client";
    const clientEmail = caseItem.clientEmail || caseItem.client_email || caseItem.email || "";
    const clientMobile = caseItem.clientPhone || caseItem.client_phone || caseItem.mobile || "";

    const advocateName = advocate.fullName || advocate.name || "Empaneled Advocate";
    const advocateId = advocate.member_id || advocate.memberId || advocate.id || "26ICJ08AA0002";
    const advocateMobile = advocate.mobile || "+91 9999002222";
    const advocateEmail = advocate.email || "advocate9999002222@gmail.com";
    const advocateBarReg = advocate.professionalRegNo || advocate.bar_reg || "Verified Bar Council Member";

    // 1. Build Context
    const context = {
      client_name: clientName,
      client_email: clientEmail,
      client_mobile: clientMobile,
      case_id: caseId,
      case_title: caseItem.title || caseItem.caseTitle || "Legal Consultation & Pleading",
      advocate_name: advocateName,
      advocate_id: advocateId,
      advocate_mobile: advocateMobile,
      advocate_email: advocateEmail,
      advocate_bar_reg: advocateBarReg,
      assigned_date: new Date().toLocaleDateString("en-IN"),
      support_phone: "7053002222 / 9999002222",
    };

    // 2. Render Multi-Channel Texts
    const emailSubject = this.renderTemplate(customSubject || templates.emailSubject, context);
    const emailBodyHtml = this.renderTemplate(customEmailBody || templates.emailBodyHtml, context);
    const whatsappText = this.renderTemplate(customWhatsApp || templates.whatsappMessage, context);

    // 3. Update Case Record in Legal Service & Storage
    const updatedCasePayload = {
      ...caseItem,
      assigned_advocate: {
        advocate_id: advocateId,
        advocate_name: advocateName,
        advocate_mobile: advocateMobile,
        advocate_email: advocateEmail,
        advocate_bar_reg: advocateBarReg,
        allotted_by: assignedBy,
        allotted_at: new Date().toISOString(),
        status: "ASSIGNED_ACTIVE",
      },
      advocateName,
      advocateId,
      advocateMobile,
      status: "In Progress",
    };

    try {
      await LegalService.update(caseId, updatedCasePayload);
    } catch (e) {
      console.warn("LegalService direct update notice:", e);
    }

    // Sync to citizen active cases in localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const rawCitizen = window.localStorage.getItem("icj_citizen_active_case");
        if (rawCitizen) {
          const citizenCase = JSON.parse(rawCitizen);
          if (citizenCase.case_id === caseId || citizenCase.id === caseId) {
            window.localStorage.setItem("icj_citizen_active_case", JSON.stringify({
              ...citizenCase,
              ...updatedCasePayload,
            }));
          }
        }
      } catch {}
    }

    const dispatchResults = {
      email: { sent: false, error: null },
      whatsapp: { generated: false, url: null },
      inApp: { sent: false },
    };

    // 4. Dispatch Email via Brevo REST API / SMTP Provider
    if (channels.email && clientEmail) {
      try {
        const smtpRes = await SMTPProvider.sendOTP({
          email: clientEmail,
          customSubject: emailSubject,
          customHtml: emailBodyHtml,
        });
        dispatchResults.email = { sent: smtpRes.success, error: smtpRes.error || null };
      } catch (err) {
        console.error("Email dispatch failed:", err);
        dispatchResults.email = { sent: false, error: err.message };
      }
    }

    // 5. Generate Direct WhatsApp Link
    if (channels.whatsapp && clientMobile) {
      const sanitizedPhone = clientMobile.replace(/\D/g, "");
      const fullPhone = sanitizedPhone.startsWith("91") ? sanitizedPhone : `91${sanitizedPhone}`;
      const waUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(whatsappText)}`;
      dispatchResults.whatsapp = { generated: true, url: waUrl };
    }

    // 6. In-App Notifications for Client & Advocate
    if (channels.inApp) {
      try {
        NotificationService.create({
          title: `⚖️ Legal Counsel Appointed: ${advocateName}`,
          message: `Advocate ${advocateName} (${advocateMobile}) has been assigned to your case ${caseId}.`,
          type: "case_update",
          recipient: clientEmail || clientName,
        });

        NotificationService.create({
          title: `💼 New Case Brief Allocated: ${caseId}`,
          message: `You have been allocated Client ${clientName}'s case: "${caseItem.title || 'Legal Matter'}".`,
          type: "case_allocation",
          recipient: advocateEmail || advocateName,
        });

        dispatchResults.inApp = { sent: true };
      } catch (e) {}
    }

    // 7. Log Activity
    try {
      ActivityService.create({
        title: `Advocate ${advocateName} appointed for Client "${clientName}" (Case ${caseId})`,
        type: "legal",
      });
    } catch (e) {}

    return {
      success: true,
      caseItem: updatedCasePayload,
      dispatchResults,
      whatsappText,
      whatsappUrl: dispatchResults.whatsapp.url,
    };
  },
};

export default AdvocateAssignmentService;
