/**
 * ICJ Language & Script Isolation Engine v3.0 (Decoupled Multi-Language & Voice Architecture)
 * 
 * Supported Languages (13 Regional & International Languages):
 * - en: English (Permanent Fallback - Always Accessible in 1-Click)
 * - hi: हिंदी (Hindi)
 * - bn: বাংলা (Bengali)
 * - gu: ગુજરાતી (Gujarati)
 * - kn: ಕನ್ನಡ (Kannada)
 * - ml: മലയാളം (Malayalam)
 * - mr: मराठी (Marathi)
 * - or: ଓଡ଼ିଆ (Odia)
 * - pa: ਪੰਜਾਬੀ (Punjabi)
 * - ta: தமிழ் (Tamil)
 * - te: తెలుగు (Telugu)
 * - as: অসমীয়া (Assamese)
 * - ur: اردو (Urdu)
 */

import { useState, useEffect } from "react";

const LANGUAGE_KEY = "icj_preferred_language_mode";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧", bcp47: "en-US" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी", flag: "🇮🇳", bcp47: "hi-IN" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇮🇳", bcp47: "bn-IN" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", flag: "🇮🇳", bcp47: "gu-IN" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", flag: "🇮🇳", bcp47: "kn-IN" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം", flag: "🇮🇳", bcp47: "ml-IN" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳", bcp47: "mr-IN" },
  { code: "or", label: "Odia", nativeLabel: "ଓଡ଼ିଆ", flag: "🇮🇳", bcp47: "or-IN" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", flag: "🇮🇳", bcp47: "pa-IN" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", flag: "🇮🇳", bcp47: "ta-IN" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "🇮🇳", bcp47: "te-IN" },
  { code: "as", label: "Assamese", nativeLabel: "অসমীয়া", flag: "🇮🇳", bcp47: "as-IN" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", flag: "🇵🇰", bcp47: "ur-IN" },
];

const DICTIONARIES = {
  en: {
    code: "en",
    translations: {
      brandTitle: "ICJ ENTERPRISE PLATFORM",
      brandSubtitle: "Unified Legal Command Centre & AI Intelligence Layer",
      globalSearchPlaceholder: "Global Search (Members, Cases, Advocates, Documents, Payments)...",
      selectLanguage: "Select Language / भाषा चुनें:",
      englishFallback: "ENGLISH",
      
      // Wizard Steps
      wizardStep0: "Stage 0: 🔊 Audio Guidance",
      wizardStep1: "Stage 1: 🗣️ Legal Intake",
      wizardStep2: "Stage 2: 📂 Documents Vault",
      wizardStep3: "Stage 3: 🤖 AI Diagnosis",
      wizardStep4: "Stage 4: ⚖️ Counsel & Action",

      wizardNext: "Next Step ➔",
      wizardBack: "← Back",
      wizardComplete: "✅ Complete Case Journey",
      
      catCivil: "🏛️ Civil Dispute",
      catCriminal: "⚖️ Criminal Defence & Bail",
      catFamily: "👨‍👩‍👧 Family Law & Divorce",
      catProperty: "🏠 Property & Land Title",
      catCheque: "💳 Cheque Bounce & Recovery",
      catConsumer: "🛒 Consumer Protection",

      btnContinue: "Continue & Proceed",
      btnSubmit: "Submit Legal Matter",
      btnUploadDoc: "Upload Document",
      btnChangeCounsel: "Request Counsel Change",
      
      roleClient: "Litigant / Client",
      roleAdvocate: "Empaneled Advocate",
      roleAdmin: "Administrator",
    }
  },

  hi: {
    code: "hi",
    translations: {
      brandTitle: "आईसीजे एंटरप्राइज प्लेटफॉर्म",
      brandSubtitle: "एकीकृत कानूनी कमान केंद्र और एआई इंटेलिजेंस लेयर",
      globalSearchPlaceholder: "ग्लोबल खोज (सदस्य, मामले, अधिवक्ता, दस्तावेज)...",
      selectLanguage: "भाषा चुनें (Select Language):",
      englishFallback: "ENGLISH",

      wizardStep0: "चरण 0: 🔊 ऑडियो मार्गदर्शन",
      wizardStep1: "चरण 1: 🗣️ कानूनी समस्या दर्ज करें",
      wizardStep2: "चरण 2: 📂 कागजात लोड करें",
      wizardStep3: "चरण 3: 🤖 AI केस निदान",
      wizardStep4: "चरण 4: ⚖️ वकील व 1-क्लिक एक्शन",

      wizardNext: "आगे बढ़ें ➔",
      wizardBack: "← पीछे",
      wizardComplete: "✅ संपूर्ण केस यात्रा पूर्ण करें",

      catCivil: "🏛️ सिविल विवाद",
      catCriminal: "⚖️ आपराधिक मामला व जमानत",
      catFamily: "👨‍👩‍👧 पारिवारिक विवाद व तलाक",
      catProperty: "🏠 संपत्ति व भूमि विवाद",
      catCheque: "💳 चेक बाउंस व ऋण वसूली",
      catConsumer: "🛒 उपभोक्ता शिकायत",

      btnContinue: "आगे बढ़ें",
      btnSubmit: "केस जमा करें",
      btnUploadDoc: "कागज़ अपलोड करें",
      btnChangeCounsel: "🔄 वकील बदलवाने का अनुरोध करें",

      roleClient: "वादी / क्लाइंट",
      roleAdvocate: "पैनलबद्ध अधिवक्ता",
      roleAdmin: "प्रणाली प्रशासक",
    }
  },

  gu: {
    code: "gu",
    translations: {
      brandTitle: "ICJ એન્ટરપ્રાઇઝ પ્લેટફોર્મ",
      brandSubtitle: "એકીકૃત કાનૂની આદેશ કેન્દ્ર",
      globalSearchPlaceholder: "શોધો (સભ્યો, કેસ, વકીલો, દસ્તાવેજો)...",
      selectLanguage: "ભાષા પસંદ કરો (Language):",
      englishFallback: "ENGLISH",

      wizardStep0: "તબક્કો 0: 🔊 ઓડિયો માર્ગદર્શન",
      wizardStep1: "તબક્કો 1: 🗣️ કાનૂની સમસ્યા નોંધો",
      wizardStep2: "તબક્કો 2: 📂 દસ્તાવેજો અપલોડ કરો",
      wizardStep3: "તબક્કો 3: 🤖 AI કેસ વિશ્લેષણ",
      wizardStep4: "તબક્કો 4: ⚖️ વકીલ અને 1-ક્લિક એક્શન",

      wizardNext: "આગળ વધો ➔",
      wizardBack: "← પાછા",
      wizardComplete: "✅ સંપૂર્ણ કેસ સબમિટ કરો",

      catCivil: "🏛️ સિવિલ વિવાદ",
      catCriminal: "⚖️ ફોજદારી કેસ",
      catFamily: "👨‍👩‍👧 કૌટુંબિક વિવાદ",
      catProperty: "🏠 મિલકત વિવાદ",
      catCheque: "💳 ચેક બાઉન્સ",
      catConsumer: "🛒 ગ્રાહક ફરિયાદ",

      btnContinue: "આગળ વધો",
      btnSubmit: "કેસ સબમિટ કરો",
      btnUploadDoc: "દસ્તાવેજ અપલોડ કરો",
      btnChangeCounsel: "🔄 વકીલ બદલવાની વિનંતી કરો",

      roleClient: "અરજદાર / ક્લાયન્ટ",
      roleAdvocate: "પેનલ એડવોકેટ",
      roleAdmin: "સિસ્ટમ એડમિન",
    }
  },

  bn: {
    code: "bn",
    translations: {
      brandTitle: "ICJ এন্টারপ্রাইজ প্ল্যাটফর্ম",
      brandSubtitle: "একীকৃত আইনি কমান্ড সেন্টার",
      globalSearchPlaceholder: "অনুসন্ধান করুন (সদস্য, মামলা, আইনি নথি)...",
      selectLanguage: "ভাষা নির্বাচন করুন:",
      englishFallback: "ENGLISH",

      wizardStep0: "ধাপ 0: 🔊 অডিও নির্দেশিকা",
      wizardStep1: "ধাপ 1: 🗣️ আইনি সমস্যা লিপিবদ্ধ করুন",
      wizardStep2: "ধাপ 2: 📂 নথিপত্র আপলোড",
      wizardStep3: "ধাপ 3: 🤖 AI কেস নির্ণয়",
      wizardStep4: "ধাপ 4: ⚖️ আইনজীবী ও পদক্ষেপ",

      wizardNext: "এগিয়ে যান ➔",
      wizardBack: "← পিছনে",
      wizardComplete: "✅ কেস জমা দিন",

      catCivil: "🏛️ দেওয়ানি বিরোধ",
      catCriminal: "⚖️ ফৌজদারি মামলা",
      catFamily: "👨‍👩‍👧 পারিবারিক মামলা",
      catProperty: "🏠 সম্পত্তি বিরোধ",
      catCheque: "💳 চেক বাউন্স",
      catConsumer: "🛒 ভোক্তা অভিযোগ",

      btnContinue: "এগিয়ে যান",
      btnSubmit: "মামলা জমা দিন",
      btnUploadDoc: "নথি আপলোড করুন",
      btnChangeCounsel: "🔄 আইনজীবী পরিবর্তনের অনুরোধ",

      roleClient: "ক্লায়েন্ট / বাদী",
      roleAdvocate: "প্যানেল আইনজীবী",
      roleAdmin: "সিস্টেম অ্যাডমিন",
    }
  },

  mr: {
    code: "mr",
    translations: {
      brandTitle: "ICJ एंटरप्राइज प्लॅटफॉर्म",
      brandSubtitle: "एकीकृत कायदेशीर कमांड सेंटर",
      selectLanguage: "भाषा निवडा (Language):",
      englishFallback: "ENGLISH",

      wizardStep0: "टप्पा 0: 🔊 ऑडिओ मार्गदर्शन",
      wizardStep1: "टप्पा 1: 🗣️ कायदेशीर समस्या नोंदवा",
      wizardStep2: "टप्पा 2: 📂 कागदपत्रे अपलोड करा",
      wizardStep3: "टप्पा 3: 🤖 AI केस विश्लेषण",
      wizardStep4: "टप्पा 4: ⚖️ वकील व 1-क्लिक कारवाई",

      wizardNext: "पुढे जा ➔",
      wizardBack: "← मागे",
      wizardComplete: "✅ संपूर्ण केस सबमिट करा",

      catCivil: "🏛️ दिवाणी विवाद",
      catCriminal: "⚖️ फौजदारी गुन्हा व जामीन",
      catFamily: "👨‍👩‍👧 कौटुंबिक वाद",
      catProperty: "🏠 मालमत्ता व जमीन वाद",

      btnContinue: "पुढे जा",
      btnSubmit: "केस सबमिट करा",
      btnUploadDoc: "कागदपत्र अपलोड करा",
      btnChangeCounsel: "🔄 वकील बदलण्याची विनंती करा",
    }
  },

  ta: {
    code: "ta",
    translations: {
      brandTitle: "ICJ எண்டர்பிரைஸ் பிளாட்ஃபார்ம்",
      selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்:",
      englishFallback: "ENGLISH",

      wizardStep0: "நிலை 0: 🔊 ஆடியோ வழிகாட்டுதல்",
      wizardStep1: "நிலை 1: 🗣️ சட்டப் பிரச்சினையைப் பதிவுசெய்க",
      wizardStep2: "நிலை 2: 📂 ஆவணங்களைப் பதிவேற்றுக",
      wizardStep3: "நிலை 3: 🤖 AI வழக்கறிஞர் பகுப்பாய்வு",
      wizardStep4: "நிலை 4: ⚖️ வழக்கறிஞர் மற்றும் நடவடிக்கை",

      wizardNext: "அடுத்து ➔",
      wizardBack: "← பின்னே",
      wizardComplete: "✅ வழக்கை சமர்ப்பிக்கவும்",
    }
  },

  te: {
    code: "te",
    translations: {
      brandTitle: "ICJ ఎంటర్‌ప్రైజ్ ప్లాట్‌ఫారమ్",
      selectLanguage: "భాషను ఎంచుకోండి:",
      englishFallback: "ENGLISH",

      wizardStep0: "దశ 0: 🔊 ఆడియో మార్గదర్శకత్వం",
      wizardStep1: "దశ 1: 🗣️ చట్టపరమైన సమస్యను నమోదు చేయండి",
      wizardStep2: "దశ 2: 📂 పత్రాలను అప్‌లోడ్ చేయండి",
      wizardStep3: "దశ 3: 🤖 AI కేసు విశ్లేషణ",
      wizardStep4: "దశ 4: ⚖️ న్యాయవాది మరియు చర్య",

      wizardNext: "ముందుకు ➔",
      wizardBack: "← వెనుకకు",
      wizardComplete: "✅ కేసును సమర్పించండి",
    }
  }
};

export const LanguageService = {
  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  },

  getCurrentLanguage() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(LANGUAGE_KEY) || "en";
      }
    } catch {
      // fallback
    }
    return "en";
  },

  setLanguage(langCode) {
    const valid = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    if (!valid) return;
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
    const dict = DICTIONARIES[lang] || DICTIONARIES["en"];
    return (dict && dict.translations && dict.translations[key]) ||
           (DICTIONARIES["en"].translations && DICTIONARIES["en"].translations[key]) ||
           (DICTIONARIES["hi"].translations && DICTIONARIES["hi"].translations[key]) ||
           fallback ||
           key;
  },

  speakText(text, langCodeOverride = null) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    try {
      window.speechSynthesis.cancel();
      const currentLangCode = langCodeOverride || this.getCurrentLanguage();
      const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langConfig.bcp47;
      utterance.rate = 0.95;

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

export function useLanguage() {
  const [lang, setLang] = useState(() => LanguageService.getCurrentLanguage());

  useEffect(() => {
    const handleLangChange = (e) => {
      setLang(e.detail || LanguageService.getCurrentLanguage());
    };
    window.addEventListener("icj_language_changed", handleLangChange);
    return () => window.removeEventListener("icj_language_changed", handleLangChange);
  }, []);

  return {
    lang,
    t: (key, fallback) => LanguageService.t(key, fallback),
    setLanguage: (code) => LanguageService.setLanguage(code),
  };
}

export default LanguageService;
