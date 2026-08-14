/**
 * CommunicationDispatcherService — ICJ Enterprise Platform
 * Unified 1-Click Dispatcher Engine for WhatsApp, Direct Email, Call, and SOS Hotlines.
 * Zero-typing, instant pre-filled action launchers across desktop and mobile devices.
 */

export const CommunicationDispatcherService = {
  /**
   * Launch Direct WhatsApp Web / App with Pre-filled Official Template
   */
  launchWhatsApp({ phone = "", text = "" }) {
    const cleanPhone = String(phone).replace(/\D/g, "");
    if (!cleanPhone) {
      alert("No valid phone number registered for WhatsApp dispatch.");
      return;
    }

    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const encodedText = encodeURIComponent(text || "Hello, this is an official message from International Consortium of Jurists (ICJ Enterprise Platform).");
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;

    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }
  },

  /**
   * Launch Direct Email Client with Pre-filled Subject and Body
   */
  launchEmail({ email = "", subject = "", body = "" }) {
    if (!email || !email.includes("@")) {
      alert("No valid email address registered for email dispatch.");
      return;
    }

    const encSubject = encodeURIComponent(subject || "Official Communication — ICJ Enterprise Platform");
    const encBody = encodeURIComponent(body || "Dear Legal Professional / Client,\n\nThis is an official communication from ICJ Enterprise Platform.\n\nRegards,\nInternational Consortium of Jurists");
    const mailtoUrl = `mailto:${email}?subject=${encSubject}&body=${encBody}`;

    if (typeof window !== "undefined") {
      window.location.href = mailtoUrl;
    }
  },

  /**
   * Launch Direct Phone Call
   */
  launchCall({ phone = "" }) {
    const cleanPhone = String(phone).replace(/\D/g, "");
    if (!cleanPhone) {
      alert("No valid phone number available for call.");
      return;
    }
    if (typeof window !== "undefined") {
      window.location.href = `tel:+${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`;
    }
  },

  /**
   * Send Official Hearing Date Update to Client via WhatsApp
   */
  sendHearingUpdate({ clientPhone, clientName, caseNumber, courtName, hearingDate }) {
    const msg = `🏛️ *ICJ Official Hearing Notice*\n\nDear *${clientName}*,\nYour legal matter (*${caseNumber}*) is listed for hearing before *${courtName}* on *${hearingDate}*.\n\nPlease reach chamber 15 minutes before session.\n\n— *Advocate Chamber & ICJ Legal Ecosystem*`;
    this.launchWhatsApp({ phone: clientPhone, text: msg });
  },

  /**
   * Send Digital ID Card Approval Link to Advocate via WhatsApp
   */
  sendIDCardLink({ advocatePhone, advocateName, memberId }) {
    const msg = `🎉 *Congratulations ${advocateName}!*\n\nYour ICJ Executive Empanelement has been approved! Your Member ID is *${memberId}*.\n\nClick below to access your Portal & Digital ID Card:\nhttps://icj.law/login?ref=${memberId}\n\n— *ICJ Registrar HQ*`;
    this.launchWhatsApp({ phone: advocatePhone, text: msg });
  },
};

export default CommunicationDispatcherService;
