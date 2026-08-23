/**
 * ICJ ENTERPRISE PLATFORM — MASTER CERTIFICATE GENERATION ENGINE
 * Single Source of Truth (SSOT) for International Member Registration Certificates
 * Official Domain: icj.co.in | Official Email: Consortiumofjurist@gmail.com
 */

const CERT_STORE_KEY = "icj_member_certificates_store";
const CERT_AUDIT_KEY = "icj_certificate_audit_log";

function loadStore(key, fallback = {}) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveStore(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save certificate storage", err);
  }
}

export const CertificateService = {
  OFFICIAL_WEBSITE: "icj.co.in",
  OFFICIAL_EMAIL: "Consortiumofjurist@gmail.com",
  AUTHORIZED_SIGNATORY: "Registrar General & Supreme Sovereign Council, ICJ",

  /**
   * Validate mandatory member fields before certificate generation.
   * @param {object} member
   * @returns {{isValid: boolean, errors: string[]}}
   */
  validateMemberData(member) {
    const errors = [];
    if (!member) {
      errors.push("Member object is required.");
      return { isValid: false, errors };
    }

    const memberId = member.member_id || member.memberId || member.id;
    const name = member.fullName || member.full_name || member.name;

    if (!memberId) errors.push("Missing mandatory field: Permanent Member ID.");
    if (!name || name.trim().length === 0) errors.push("Missing mandatory field: Applicant Name.");
    if (!member.email) errors.push("Missing mandatory field: Primary Email Address.");

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Generates or retrieves master certificate data for a member.
   * Maintains persistent certificate number and version history.
   * @param {object} member
   * @returns {object} Standardized Master Certificate Record
   */
  getOrCreateCertificate(member) {
    const val = this.validateMemberData(member);
    if (!val.isValid) {
      throw new Error(`Certificate Generation Validation Failed: ${val.errors.join(", ")}`);
    }

    const memberId = String(member.member_id || member.memberId || member.id).trim();
    const store = loadStore(CERT_STORE_KEY, {});

    if (store[memberId]) {
      return store[memberId];
    }

    // Generate new official certificate number (Format: ICJ-CERT-YYYY-XXXXXX)
    const year = new Date().getFullYear();
    const cleanIdSuffix = memberId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || Math.random().toString(36).substring(2, 8).toUpperCase();
    const certNumber = `ICJ-CERT-${year}-${cleanIdSuffix}`;

    const regDate = member.registration_date || member.created_at || member.createdAt || new Date().toISOString();
    const issueDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const regFormatted = new Date(regDate).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const applicantType = member.role === "advocate"
      ? "Legal Professional / Advocate"
      : member.role === "franchise"
      ? "District Franchise Partner Node"
      : "Litigant Citizen / Corporate Member";

    const assignedRole = member.role === "advocate"
      ? "ICJ Empaneled Advocate & Counsel"
      : member.role === "franchise"
      ? "Authorized District Franchise Admin"
      : "Registered Litigant / Client Member";

    const designation = member.designation || (member.role === "advocate" ? "Advocate / Legal Practitioner" : "Registered Member");
    const purpose = member.purpose || (member.role === "advocate" ? "Professional Legal Services & Practice" : "Legal Dispute Resolution & Assistance");
    const verificationStatus = member.verification_status || "Approved & Active";

    const verificationQr = `https://icj.co.in/verify?cert=${encodeURIComponent(certNumber)}&id=${encodeURIComponent(memberId)}`;

    const certRecord = {
      certificate_number: certNumber,
      member_id: memberId,
      applicant_name: member.fullName || member.full_name || member.name,
      applicant_type: applicantType,
      assigned_role: assignedRole,
      designation: designation,
      email: member.email,
      mobile: member.mobile || member.phone || "—",
      purpose: purpose,
      registration_datetime: regFormatted,
      verification_status: verificationStatus,
      issue_date: issueDate,
      verification_qr: verificationQr,
      authorized_signatory: this.AUTHORIZED_SIGNATORY,
      website: this.OFFICIAL_WEBSITE,
      official_email: this.OFFICIAL_EMAIL,
      generated_at: new Date().toISOString(),
      version: 1,
    };

    store[memberId] = certRecord;
    saveStore(CERT_STORE_KEY, store);

    // Record in Audit Trail
    this._logAudit("CERTIFICATE_GENERATED", {
      member_id: memberId,
      certificate_number: certNumber,
      applicant_name: certRecord.applicant_name,
    });

    return certRecord;
  },

  /**
   * Retrieves certificate by Certificate Number (for verification).
   */
  getCertificateByNumber(certNumber) {
    const store = loadStore(CERT_STORE_KEY, {});
    const cleanCert = String(certNumber || "").trim().toUpperCase();
    for (const id in store) {
      if (String(store[id].certificate_number).toUpperCase() === cleanCert) {
        return store[id];
      }
    }
    return null;
  },

  /**
   * Retrieves all generated certificates.
   */
  getAllCertificates() {
    const store = loadStore(CERT_STORE_KEY, {});
    return Object.values(store);
  },

  /**
   * Internal audit trail logger.
   */
  _logAudit(action, details = {}) {
    const logs = loadStore(CERT_AUDIT_KEY, []);
    logs.unshift({
      id: "AUDIT-" + Date.now(),
      action,
      details,
      timestamp: new Date().toISOString(),
    });
    // Keep last 100 audit logs
    saveStore(CERT_AUDIT_KEY, logs.slice(0, 100));
  },

  getAuditLogs() {
    return loadStore(CERT_AUDIT_KEY, []);
  },

  /**
   * Renders the complete, luxury International Diplomatic Certificate HTML
   * formatted for high-resolution A4 landscape / portrait printing and PDF export.
   * @param {object} cert - Certificate Data Record
   * @returns {string} Standalone HTML document string
   */
  renderMasterCertificateHTML(cert) {
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&margin=0&data=${encodeURIComponent(cert.verification_qr)}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ICJ Membership Certificate - ${cert.applicant_name} (${cert.certificate_number})</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #0b1120;
      font-family: 'Times New Roman', Times, Georgia, serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .cert-container {
      width: 297mm;
      height: 210mm;
      background: #ffffff;
      padding: 12mm;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    /* Luxury Double Guilloche Border */
    .outer-border {
      width: 100%;
      height: 100%;
      border: 4px solid #b45309;
      padding: 4px;
      position: relative;
      background: #ffffff;
    }
    .inner-border {
      width: 100%;
      height: 100%;
      border: 2px solid #0f172a;
      padding: 18px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      background: radial-gradient(circle at center, #ffffff 60%, #fffdfa 100%);
    }
    /* Security Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(180, 83, 9, 0.04);
      letter-spacing: 12px;
      pointer-events: none;
      white-space: nowrap;
      text-transform: uppercase;
      z-index: 1;
      font-family: Arial, sans-serif;
    }
    /* Corner Ornaments */
    .corner {
      position: absolute;
      width: 28px;
      height: 28px;
      border: 3px solid #b45309;
      z-index: 2;
    }
    .top-left { top: 6px; left: 6px; border-right: none; border-bottom: none; }
    .top-right { top: 6px; right: 6px; border-left: none; border-bottom: none; }
    .bottom-left { bottom: 6px; left: 6px; border-right: none; border-top: none; }
    .bottom-right { bottom: 6px; right: 6px; border-left: none; border-top: none; }

    /* Header Section */
    .header {
      text-align: center;
      position: relative;
      z-index: 2;
    }
    .emblem-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 4px;
    }
    .gold-emblem {
      font-size: 32px;
      color: #b45309;
      filter: drop-shadow(0 2px 4px rgba(180,83,9,0.3));
    }
    .org-title {
      font-size: 26px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 2px;
      margin: 0;
      text-transform: uppercase;
    }
    .sub-org-title {
      font-size: 11px;
      font-family: Arial, sans-serif;
      font-weight: 700;
      letter-spacing: 3px;
      color: #991b1b;
      text-transform: uppercase;
      margin: 2px 0 0 0;
    }
    .cert-title-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 4px 28px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f59e0b;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 4px;
      text-transform: uppercase;
      border-radius: 4px;
      border: 1px solid #b45309;
    }
    .preamble {
      font-size: 13px;
      font-style: italic;
      color: #475569;
      margin: 8px auto 0 auto;
      max-width: 85%;
      line-height: 1.4;
    }

    /* Recipient Hero Section */
    .recipient-section {
      text-align: center;
      margin: 6px 0;
      position: relative;
      z-index: 2;
    }
    .recipient-name {
      font-size: 28px;
      font-weight: 900;
      color: #0f172a;
      margin: 2px 0;
      text-decoration: underline;
      text-decoration-color: #b45309;
      text-underline-offset: 6px;
      letter-spacing: 1px;
    }

    /* Two-Column Specification Grid */
    .details-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 16px;
      background: rgba(248, 250, 252, 0.85);
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 16px;
      margin: 4px 0;
      position: relative;
      z-index: 2;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      font-family: Arial, sans-serif;
      font-size: 11px;
    }
    .info-table td {
      padding: 3px 4px;
      vertical-align: top;
    }
    .info-label {
      color: #64748b;
      font-weight: 700;
      width: 42%;
      text-transform: uppercase;
      font-size: 10px;
    }
    .info-value {
      color: #0f172a;
      font-weight: 700;
    }
    .code-val {
      font-family: monospace;
      color: #991b1b;
      font-weight: 800;
    }

    /* QR Code & Authentication Box */
    .auth-box {
      display: flex;
      align-items: center;
      gap: 12px;
      border-left: 2px dashed #cbd5e1;
      padding-left: 14px;
    }
    .qr-frame {
      width: 82px;
      height: 82px;
      padding: 3px;
      background: #ffffff;
      border: 1px solid #b45309;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .auth-text {
      font-family: Arial, sans-serif;
      font-size: 10px;
      color: #334155;
      line-height: 1.4;
    }
    .status-badge {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      margin-top: 2px;
    }

    /* Signatures & Seal Section */
    .signatures-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 8px;
      padding: 0 20px;
      position: relative;
      z-index: 2;
    }
    .sig-block {
      text-align: center;
      width: 220px;
    }
    .sig-line {
      border-top: 1.5px solid #0f172a;
      padding-top: 4px;
      font-family: Arial, sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
    }
    .sig-title {
      font-size: 9px;
      color: #64748b;
      margin: 0;
    }
    .gold-seal {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: radial-gradient(circle, #fef3c7 20%, #d97706 80%, #92400e 100%);
      border: 3px solid #b45309;
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #451a03;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 2px;
    }
    .seal-text {
      font-size: 7px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Footer Section */
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      text-align: center;
      font-family: Arial, sans-serif;
      font-size: 9px;
      color: #64748b;
      position: relative;
      z-index: 2;
    }
    .footer strong {
      color: #0f172a;
    }
    .footer-links {
      margin-top: 2px;
      color: #475569;
    }
    .footer-links span {
      margin: 0 6px;
    }

    @media print {
      body {
        background: transparent;
      }
      .cert-container {
        box-shadow: none;
        width: 100vw;
        height: 100vh;
        padding: 0;
      }
    }
  </style>
</head>
<body>

<div class="cert-container">
  <div class="outer-border">
    <div class="corner top-left"></div>
    <div class="corner top-right"></div>
    <div class="corner bottom-left"></div>
    <div class="corner bottom-right"></div>

    <div class="inner-border">
      <div class="watermark">INTERNATIONAL CONSORTIUM OF JURISTS</div>

      <!-- Header -->
      <div class="header">
        <div class="emblem-row">
          <span class="gold-emblem">⚖️</span>
          <h1 class="org-title">INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)</h1>
        </div>
        <p class="sub-org-title">OFFICIAL MEMBER REGISTRATION CERTIFICATE</p>
        <div class="cert-title-badge">CERTIFICATE OF MEMBERSHIP</div>
        <p class="preamble">
          This is to officially certify that the following applicant has been successfully registered and approved as a member of the ICJ Enterprise Ecosystem.
        </p>
      </div>

      <!-- Recipient Hero -->
      <div class="recipient-section">
        <div class="recipient-name">${cert.applicant_name}</div>
      </div>

      <!-- Two-Column Dynamic Metadata Grid -->
      <div class="details-grid">
        <!-- Left Table: Member Information -->
        <table class="info-table">
          <tr>
            <td class="info-label">Permanent Member ID:</td>
            <td class="info-value code-val">${cert.member_id}</td>
          </tr>
          <tr>
            <td class="info-label">Applicant Type:</td>
            <td class="info-value">${cert.applicant_type}</td>
          </tr>
          <tr>
            <td class="info-label">Assigned Role:</td>
            <td class="info-value">${cert.assigned_role}</td>
          </tr>
          <tr>
            <td class="info-label">Designation:</td>
            <td class="info-value">${cert.designation}</td>
          </tr>
          <tr>
            <td class="info-label">Primary Email:</td>
            <td class="info-value">${cert.email}</td>
          </tr>
          <tr>
            <td class="info-label">Mobile Number:</td>
            <td class="info-value">${cert.mobile}</td>
          </tr>
          <tr>
            <td class="info-label">Purpose / Category:</td>
            <td class="info-value">${cert.purpose}</td>
          </tr>
        </table>

        <!-- Right Box: Certificate Authentication & QR -->
        <div class="auth-box">
          <div class="qr-frame">
            <img src="${qrImgUrl}" alt="Verification QR Code" />
          </div>
          <div class="auth-text">
            <div><strong>Cert No:</strong> <span class="code-val">${cert.certificate_number}</span></div>
            <div><strong>Reg. Date:</strong> ${cert.registration_datetime}</div>
            <div><strong>Issue Date:</strong> ${cert.issue_date}</div>
            <div><strong>Status:</strong> <span class="status-badge">🟢 ${cert.verification_status}</span></div>
            <div style="font-size: 8px; color: #94a3b8; margin-top: 4px;">Scan QR to verify live digital ledger record</div>
          </div>
        </div>
      </div>

      <!-- Signatures & Official Gold Medallion -->
      <div class="signatures-row">
        <div class="sig-block">
          <div style="font-family:'Brush Script MT', cursive, serif; font-size:18px; color:#1e3a8a; margin-bottom:2px;">Registrar General</div>
          <div class="sig-line">Authorized Signatory</div>
          <p class="sig-title">Office of the Registrar General, ICJ</p>
        </div>

        <div class="gold-seal">
          <span style="font-size: 16px;">⚖️</span>
          <span class="seal-text">ICJ OFFICIAL<br>SEAL</span>
        </div>

        <div class="sig-block">
          <div style="font-family:'Brush Script MT', cursive, serif; font-size:18px; color:#1e3a8a; margin-bottom:2px;">Supreme Council</div>
          <div class="sig-line">Digitally System Verified</div>
          <p class="sig-title">Supreme Governing Council, ICJ</p>
        </div>
      </div>

      <!-- Official Footer -->
      <div class="footer">
        <strong>INTERNATIONAL CONSORTIUM OF JURISTS (ICJ)</strong> — Justice • Professional Excellence • Global Legal & Financial Collaboration
        <div class="footer-links">
          Website: <strong>${cert.website}</strong>
          <span>•</span>
          Email: <strong>${cert.official_email}</strong>
          <span>•</span>
          Digital Verification Token: <strong>${cert.certificate_number}</strong>
        </div>
      </div>

    </div>
  </div>
</div>

<script>
  window.onload = function() {
    if (window.location.search.includes('autoprint=true')) {
      window.print();
    }
  };
</script>
</body>
</html>`;
  },

  /**
   * Triggers native print preview dialog for a certificate.
   */
  printCertificate(cert) {
    const html = this.renderMasterCertificateHTML(cert);
    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      setTimeout(() => {
        printWin.focus();
        printWin.print();
      }, 500);
    }
  },

  /**
   * Opens certificate in a new window for visual inspection / full page view.
   */
  openCertificatePreview(cert) {
    const html = this.renderMasterCertificateHTML(cert);
    const win = window.open("", "_blank");
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
    }
  },
};

export default CertificateService;
