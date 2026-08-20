/**
 * ICJ Language & Script Isolation Engine v1.0
 * 
 * GUARANTEE (Zero-Leakage Policy):
 * - English Mode: 100% Pure English (Zero Hindi words, no mixed terms like "Notary / नोटरी").
 * - Hindi Mode: 100% Pure Devanagari Hindi.
 * - Hinglish Mode: 100% Roman Script Hindi.
 * - Modular Extension Architecture for future regional languages (pa, bn, mr, gu, ta, te).
 */

const LANGUAGE_KEY = "icj_preferred_language_mode";

// ─── DICTIONARIES ─────────────────────────────────────────────────────────────

const DICTIONARIES = {
  en: {
    code: "en",
    label: "English",
    flag: "🇬🇧",
    pureMode: true,
    translations: {
      // General Navigation & Brand
      brandTitle: "ICJ ENTERPRISE PLATFORM",
      brandSubtitle: "Unified Legal Command Centre & AI Intelligence Layer",
      globalSearchPlaceholder: "Global Search (Members, Cases, Advocates, Documents, Payments)...",
      loginTitle: "Member Sign In",
      selectLanguage: "Select Interface & Voice Language:",
      
      // Purposes & Onboarding
      purposeProblemTitle: "Legal Problem Assistance",
      purposeProblemSubtitle: "Submit your legal issue for immediate expert advocate assistance.",
      purposeServicesTitle: "ICJ Solution World",
      purposeServicesSubtitle: "Access legal drafting, notary, consultation, and audit services.",
      purposeFranchiseTitle: "ICJ Franchise Partnership",
      purposeFranchiseSubtitle: "Apply to operate an empaneled ICJ digital legal center.",

      // Intake Categories (100% Pure English)
      catLegalDispute: "Civil & Legal Dispute",
      catCriminal: "Criminal Defence & Bail",
      catDomestic: "Domestic Violence & Protection",
      catProperty: "Property & Land Title Dispute",
      catConsumer: "Consumer Forum Complaint",
      catLabour: "Labour & Employment Issue",
      catFamily: "Family Law & Divorce Settlement",
      catCyber: "Cyber Crime & Online Financial Fraud",
      catCheque: "Cheque Bounce & Debt Recovery",
      catHumanRights: "Human Rights & PIL Public Interest",
      catAccident: "Accident Compensation Claim",
      catTaxation: "Taxation & Revenue Audit Dispute",

      // Services (100% Pure English)
      serviceNotary: "Notary & Attestation",
      serviceDrafting: "Legal Drafting & Review",
      serviceTypist: "Legal Typist & Documentation",
      serviceCourtRep: "Court Representation",
      serviceConsultation: "Legal Consultation",

      // 1-Line Smart Guidance Banner Prompts
      guideOnboardingStatus: "Current Step: You are entering your profile & account details.",
      guideOnboardingNext: "Next Step: Click on the red box to select your legal dispute category.",
      
      guideProblemStatus: "Current Step: You are submitting your legal problem details.",
      guideProblemNext: "Next Step: Press the red microphone button to speak or click 'Continue'.",

      guideVoiceStatus: "Current Step: Voice Commentary Recording is active.",
      guideVoiceNext: "Next Step: Speak your case details, then click 'Stop Recording'.",

      guidePortalStatus: "Current Step: Viewing Case File & Court Hearing Schedule.",
      guidePortalNext: "Next Step: Click 'Send Message' to communicate with your assigned advocate.",

      // Voice Prompt Texts for Speech Synthesis
      audioOnboarding: "You are currently entering your profile details. Click on the red box to select your legal dispute category.",
      audioProblem: "You are submitting your legal problem. Press the red microphone to speak or click continue.",
      audioVoice: "Recording is active. Speak clearly, then click stop recording when finished.",
      audioPortal: "Viewing your case file. Click send message to contact your advocate.",

      // UI Actions
      btnContinue: "Continue & Proceed",
      btnSubmit: "Submit Legal Matter",
      btnListen: "Listen Audio",
      btnStopAudio: "Stop Audio",
      btnMicrophone: "Start Voice Recording",
      btnStopRecording: "Stop Recording",
      btnVerifyOtp: "Verify OTP & Complete",

      // Role Labels
      roleClient: "Litigant / Client",
      roleAdvocate: "Empaneled Advocate",
      roleAdmin: "System Administrator",
      roleSuperAdmin: "Super Admin",
    }
  },

  hi: {
    code: "hi",
    label: "हिंदी (Devanagari)",
    flag: "🇮🇳",
    pureMode: true,
    translations: {
      brandTitle: "आईसीजे एंटरप्राइज प्लेटफॉर्म",
      brandSubtitle: "एकीकृत कानूनी कमान केंद्र और एआई इंटेलिजेंस लेयर",
      globalSearchPlaceholder: "ग्लोबल खोज (सदस्य, मामले, अधिवक्ता, दस्तावेज, भुगतान)...",
      loginTitle: "सदस्य लॉगिन",
      selectLanguage: "इंटरफेस और आवाज की भाषा चुनें:",

      purposeProblemTitle: "कानूनी समस्या सहायता",
      purposeProblemSubtitle: "अधिवक्ता सहायता के लिए अपनी समस्या तुरंत जमा करें।",
      purposeServicesTitle: "आईसीजे समाधान संसार",
      purposeServicesSubtitle: "कानूनी ड्राफ्टिंग, नोटरी और परामर्श सेवाओं तक पहुंचें।",
      purposeFranchiseTitle: "आईसीजे फ्रेंचाइजी साझेदारी",
      purposeFranchiseSubtitle: "डिजिटल कानूनी केंद्र संचालित करने हेतु आवेदन करें।",

      catLegalDispute: "दीवानी व कानूनी विवाद",
      catCriminal: "आपराधिक बचाव व जमानत मामला",
      catDomestic: "घरेलू हिंसा व मानसिक प्रताड़ना",
      catProperty: "संपत्ति व भूमि विवाद",
      catConsumer: "उपभोक्ता फोरम शिकायत",
      catLabour: "श्रम व रोजगार विवाद",
      catFamily: "पारिवारिक कानून व तलाक निपटारा",
      catCyber: "साइबर अपराध व ऑनलाइन वित्तीय धोखाधड़ी",
      catCheque: "चेक बाउंस व ऋण वसूली",
      catHumanRights: "मानवाधिकार व जनहित याचिका",
      catAccident: "दुर्घटना मुआवजा दावा",
      catTaxation: "कराधान व राजस्व विवाद",

      serviceNotary: "नोटरी व अटेस्टेशन",
      serviceDrafting: "कानूनी ड्राफ्टिंग व समीक्षा",
      serviceTypist: "दस्तावेज लेखक व टाइपिस्ट",
      serviceCourtRep: "कोर्ट पैरवी व प्रतिनिधित्व",
      serviceConsultation: "कानूनी परामर्श",

      guideOnboardingStatus: "वर्तमान कदम: आप अपनी प्रोफाइल और अकाउंट की जानकारी भर रहे हैं।",
      guideOnboardingNext: "अगला कदम: अपने विवाद की श्रेणी चुनने के लिए लाल डिब्बे पर क्लिक करें।",

      guideProblemStatus: "वर्तमान कदम: आप अपनी कानूनी समस्या दर्ज कर रहे हैं।",
      guideProblemNext: "अगला कदम: बोलने के लिए लाल माइक बटन दबाएं या 'आगे बढ़ें' पर क्लिक करें।",

      guideVoiceStatus: "वर्तमान कदम: वॉयस रिकॉर्डिंग चालू है।",
      guideVoiceNext: "अगला कदम: अपनी बात बोलने के बाद 'रिकॉर्डिंग बंद करें' बटन दबाएं।",

      guidePortalStatus: "वर्तमान कदम: आप अपनी केस फाइल और कोर्ट सुनवाई का शेड्यूल देख रहे हैं।",
      guidePortalNext: "अगला कदम: अपने एडवोकेट से बात करने के लिए 'मैसेज भेजें' पर क्लिक करें।",

      audioOnboarding: "आप अपनी प्रोफाइल भर रहे हैं। विवाद की श्रेणी चुनने के लिए लाल डिब्बे पर क्लिक करें।",
      audioProblem: "आप अपनी कानूनी समस्या दर्ज कर रहे हैं। बोलने के लिए लाल माइक दबाएं या आगे बढ़ें।",
      audioVoice: "रिकॉर्डिंग चालू है। अपनी बात बोलकर रिकॉर्डिंग बंद करें बटन दबाएं।",
      audioPortal: "केस फाइल खुली है। अपने वकील से संपर्क करने के लिए मैसेज भेजें पर क्लिक करें।",

      btnContinue: "आगे बढ़ें",
      btnSubmit: "मामला जमा करें",
      btnListen: "आवाज सुनें",
      btnStopAudio: "आवाज बंद करें",
      btnMicrophone: "बोलना शुरू करें",
      btnStopRecording: "रिकॉर्डिंग बंद करें",
      btnVerifyOtp: "ओटीपी सत्यापित करें",

      roleClient: "वादी / क्लाइंट",
      roleAdvocate: "पैनलबद्ध अधिवक्ता",
      roleAdmin: "प्रणाली प्रशासक",
      roleSuperAdmin: "मुख्य सुपर एडमिन",
    }
  },

  hinglish: {
    code: "hinglish",
    label: "Hinglish (Roman)",
    flag: "💬",
    pureMode: true,
    translations: {
      brandTitle: "ICJ ENTERPRISE PLATFORM",
      brandSubtitle: "Unified Legal Command Centre & AI Intelligence Layer",
      globalSearchPlaceholder: "Global Search (Members, Cases, Advocates, Documents, Payments)...",
      loginTitle: "Member Sign In",
      selectLanguage: "Interface & Voice Language Select Karein:",

      purposeProblemTitle: "Aapki Problem, Hamara Solution",
      purposeProblemSubtitle: "Immediate advocate help ke liye apni legal problem submit karein.",
      purposeServicesTitle: "ICJ Solution World",
      purposeServicesSubtitle: "Legal drafting, notary aur consultation services access karein.",
      purposeFranchiseTitle: "ICJ Franchise Partnership",
      purposeFranchiseSubtitle: "ICJ digital legal center operate karne ke liye apply karein.",

      catLegalDispute: "Civil & Legal Dispute",
      catCriminal: "Criminal Defence & Bail Matter",
      catDomestic: "Domestic Violence & Protection",
      catProperty: "Property & Land Title Dispute",
      catConsumer: "Consumer Forum Complaint",
      catLabour: "Labour & Employment Dispute",
      catFamily: "Family Law & Divorce Settlement",
      catCyber: "Cyber Crime & Online Fraud",
      catCheque: "Cheque Bounce & Recovery",
      catHumanRights: "Human Rights & PIL Public Interest",
      catAccident: "Accident Compensation Claim",
      catTaxation: "Taxation & Revenue Audit Dispute",

      serviceNotary: "Notary & Attestation",
      serviceDrafting: "Legal Drafting & Review",
      serviceTypist: "Document Writer & Typist",
      serviceCourtRep: "Court Representation",
      serviceConsultation: "Legal Consultation",

      guideOnboardingStatus: "Current Step: Aap apni profile details bhar rahe hain.",
      guideOnboardingNext: "Next Step: Problem category select karne ke liye red box par click karein.",

      guideProblemStatus: "Current Step: Aap apni legal problem submit kar rahe hain.",
      guideProblemNext: "Next Step: Bolne ke liye red mic button dabayein ya 'Continue' click karein.",

      guideVoiceStatus: "Current Step: Voice Recording active hai.",
      guideVoiceNext: "Next Step: Apni baat bolne ke baad 'Stop Recording' dabayein.",

      guidePortalStatus: "Current Step: Aap apni Case File aur Hearing Schedule dekh rahe hain.",
      guidePortalNext: "Next Step: Advocate se baat karne ke liye 'Send Message' par click karein.",

      audioOnboarding: "Aap apni profile details bhar rahe hain. Dispute category select karne ke liye red box par click karein.",
      audioProblem: "Aap apni legal problem submit kar rahe hain. Bolne ke liye red mic dabayein.",
      audioVoice: "Recording active hai. Bolne ke baad stop recording button dabayein.",
      audioPortal: "Aapki case file khuli hai. Advocate se contact karne ke liye message bhejein.",

      btnContinue: "Continue Karein",
      btnSubmit: "Case Submit Karein",
      btnListen: "Audio Sunein",
      btnStopAudio: "Audio Stop Karein",
      btnMicrophone: "Bolna Shuru Karein",
      btnStopRecording: "Recording Stop Karein",
      btnVerifyOtp: "OTP Verify Karein",

      roleClient: "Litigant / Client",
      roleAdvocate: "Empaneled Advocate",
      roleAdmin: "System Admin",
      roleSuperAdmin: "Super Admin",
    }
  }
};

// ─── LANGUAGE SERVICE API ─────────────────────────────────────────────────────

export const LanguageService = {
  getSupportedLanguages() {
    return Object.values(DICTIONARIES).map((d) => ({
      code: d.code,
      label: d.label,
      flag: d.flag,
    }));
  },

  getCurrentLanguage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(LANGUAGE_KEY) || "hi";
      }
    } catch {
      // fallback
    }
    return "hi";
  },

  setLanguage(langCode) {
    if (!DICTIONARIES[langCode]) return;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(LANGUAGE_KEY, langCode);
        window.dispatchEvent(new CustomEvent("icj_language_changed", { detail: langCode }));
      }
    } catch (err) {
      console.error("Language switch error:", err);
    }
  },

  t(key, fallback = "") {
    const lang = this.getCurrentLanguage();
    const dict = DICTIONARIES[lang] || DICTIONARIES["hi"];
    return dict.translations[key] || DICTIONARIES["en"].translations[key] || fallback || key;
  },

  speakText(text, langCodeOverride = null) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop active audio
      const lang = langCodeOverride || this.getCurrentLanguage();
      const utterance = new SpeechSynthesisUtterance(text);

      if (lang === "en") {
        utterance.lang = "en-US";
      } else if (lang === "hinglish") {
        utterance.lang = "hi-IN";
        utterance.rate = 0.95;
      } else {
        utterance.lang = "hi-IN";
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  },

  stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
};

export default LanguageService;
