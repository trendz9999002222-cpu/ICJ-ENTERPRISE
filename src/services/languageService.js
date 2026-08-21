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
      
      // Stage 0 Content
      stage0Title: "STAGE 0: 🗣️ Welcome & Audio Guidance",
      stage0Subtitle: "No need to understand complex legal procedures or type. Click the audio button below to hear guidance in your selected language.",
      stage0HowItWorks: "📌 How does this portal work?",
      stage0Step1: "1. Speak via Mic: Your spoken words will auto-transcribe into your secure case file.",
      stage0Step2: "2. Upload Documents: Upload court case file photos or PDFs.",
      stage0Step3: "3. Counsel & AI Assistance: An empaneled ICJ advocate remains assigned to assist you.",
      stage0PlayAudio: "🔊 Play Audio Guidance",
      stage0UnderstandProceed: "I Understand — Proceed ➔",

      // Stage 1 Content
      stage1Title: "STAGE 1: 🗣️ Describe Your Legal Situation",
      stage1CategoryLabel: "Case Category",
      stage1ProblemLabel: "Problem Description (Speak or Type)",
      stage1Placeholder: "Speak or type your legal problem here... Your spoken words are saved into your master case record.",

      // Stage 2 Content
      stage2Title: "STAGE 2: 📂 Upload Legal Documents & Auto-Sorting",
      stage2Subtitle: "The system auto-sorts your uploaded documents according to court procedure (Plaint ➔ WS ➔ Orders).",
      stage2UploadBtn: "➕ Upload Document",
      stage2CountLabel: "Uploaded Documents:",

      // Stage 3 Content
      stage3Title: "STAGE 3: 🤖 AI Legal Risk & Section Diagnosis",
      stage3Subtitle: "AI legal analysis prepared based on your voice transcript and uploaded documents:",
      stage3Chip: "✅ BNS / BNSS / CPC Statutory Sections Analyzed",
      stage3SavedNote: "This analysis is automatically saved into your Master Case Folder.",

      // Stage 4 Content
      stage4Title: "STAGE 4: ⚖️ Assigned Counsel & 1-Click Action Controls",
      stage4CounselLabel: "👨‍⚖️ Assigned Advocate:",
      stage4RoleLabel: "Role:",
      stage4ChangeBtn: "🔄 Request Counsel Change",

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

      // Stage 0 Content
      stage0Title: "STAGE 0: 🗣️ स्वागत व ऑडियो मार्गदर्शन",
      stage0Subtitle: "यहाँ आपको कानूनी प्रक्रिया समझने या टाइप करने की आवश्यकता नहीं है। नीचे दिया गया ऑडियो बटन दबाकर अपनी भाषा में दिशा-निर्देश सुनें।",
      stage0HowItWorks: "📌 इस पोर्टल पर काम कैसे होगा?",
      stage0Step1: "1. माइक से बोलें: आपकी बोली हुई बात तुरंत सुरक्षित केस रिकॉर्ड में टाइप होगी।",
      stage0Step2: "2. कागजात लोड करें: कोर्ट फाइल की फोटो या PDF अपलोड करें।",
      stage0Step3: "3. वकील व AI सहायता: ICJ लीगल पैनल का वकील आपकी सहायता हेतु नियुक्त रहेगा।",
      stage0PlayAudio: "🔊 ऑडियो मार्गदर्शन चालू करें",
      stage0UnderstandProceed: "मैं समझ गया — आगे बढ़ें ➔",

      // Stage 1 Content
      stage1Title: "STAGE 1: 🗣️ अपनी कानूनी समस्या दर्ज करें",
      stage1CategoryLabel: "मामले का प्रकार (Category)",
      stage1ProblemLabel: "समस्या का विवरण (बोलें या टाइप करें)",
      stage1Placeholder: "यहाँ बोलकर या टाइप करके अपनी समस्या दर्ज करें... आपका बोला गया शब्द मास्टर केस रिकॉर्ड में सुरक्षित होगा।",

      // Stage 2 Content
      stage2Title: "STAGE 2: 📂 पुराने कागजात लोड करें (ऑटो-सॉर्टिंग)",
      stage2Subtitle: "सिस्टम आपके कागजातों को कानूनी प्रक्रिया अनुसार (Plaint ➔ WS ➔ Orders) अपने आप क्रमबद्ध कर देगा।",
      stage2UploadBtn: "➕ कागज़ अपलोड करें",
      stage2CountLabel: "अपलोड किए गए कागजात:",

      // Stage 3 Content
      stage3Title: "STAGE 3: 🤖 AI केस निदान व धारा समीक्षा",
      stage3Subtitle: "आपके द्वारा दर्ज वॉयस ट्रांसक्रिप्ट और अपलोड कागजात के आधार पर कानूनी धाराओं व रणनीति का विश्लेषण तैयार है:",
      stage3Chip: "✅ BNS / BNSS / CPC कानूनी धाराएं विश्लेषित",
      stage3SavedNote: "यह विश्लेषण स्वचालित रूप से आपके Master Case Folder में सहेजा जा चुका है।",

      // Stage 4 Content
      stage4Title: "STAGE 4: ⚖️ नियुक्त वकील व 1-क्लिक एक्शन",
      stage4CounselLabel: "👨‍⚖️ नियुक्त एडवोकेट:",
      stage4RoleLabel: "पद:",
      stage4ChangeBtn: "🔄 वकील बदलवाने का अनुरोध करें",

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

      // Stage 0 Content
      stage0Title: "STAGE 0: 🗣️ સ્વાગત અને ઓડિયો માર્ગદર્શન",
      stage0Subtitle: "જટિલ કાનૂની પ્રક્રિયાઓ સમજવા કે ટાઇપ કરવાની જરૂર નથી. તમારી ભાષામાં માર્ગદર્શન સાંભળવા માટે નીચેનું ઓડિયો બટન દબાવો.",
      stage0HowItWorks: "📌 આ પોર્ટલ પર કામ કેવી રીતે થશે?",
      stage0Step1: "1. માઇકથી બોલો: તમારી બોલેલી વાત તમારા સુરક્ષિત કેસ રેકોર્ડમાં ટાઇપ થશે.",
      stage0Step2: "2. દસ્તાવેજો લોડ કરો: કોર્ટ ફાઇલનો ફોટો અથવા PDF અપલોડ કરો.",
      stage0Step3: "3. વકીલ અને AI સહાય: ICJ લીગલ પેનલના વકીલ તમારી મદદ માટે રહેશે.",
      stage0PlayAudio: "🔊 ઓડિયો માર્ગદર્શન ચાલુ કરો",
      stage0UnderstandProceed: "હું સમજી ગયો — આગળ વધો ➔",

      // Stage 1 Content
      stage1Title: "STAGE 1: 🗣️ તમારી કાનૂની સમસ્યા નોંધો",
      stage1CategoryLabel: "કેસ પ્રકાર (Category)",
      stage1ProblemLabel: "સમસ્યાની વિગત (બોલો અથવા ટાઇપ કરો)",
      stage1Placeholder: "અહીં બોલીને અથવા ટાઇપ કરીને તમારી સમસ્યા નોંધો... તમારા બોલેલા શબ્દો કેસ રેકોર્ડમાં સુરક્ષિત થશે.",

      // Stage 2 Content
      stage2Title: "STAGE 2: 📂 દસ્તાવેજો અપલોડ કરો",
      stage2Subtitle: "સિસ્ટમ તમારા દસ્તાવેજોને કોર્ટ પ્રક્રિયા મુજબ આપમેળે ગોઠવી દેશે.",
      stage2UploadBtn: "➕ દસ્તાવેજ અપલોડ કરો",
      stage2CountLabel: "અપલોડ કરેલ દસ્તાવેજો:",

      // Stage 3 Content
      stage3Title: "STAGE 3: 🤖 AI કેસ વિશ્લેષણ",
      stage3Subtitle: "તમારા અવાજ રેકોર્ડિંગ અને દસ્તાવેજોના આધારે AI કાનૂની વિશ્લેષણ તૈયાર છે:",
      stage3Chip: "✅ કાનૂની કલમોનું વિશ્લેષણ પૂર્ણ",
      stage3SavedNote: "આ વિશ્લેષણ તમારા કેસ ફોલ્ડરમાં આપમેળે સાચવવામાં આવ્યું છે.",

      // Stage 4 Content
      stage4Title: "STAGE 4: ⚖️ નિમાયેલ વકીલ અને એક્શન",
      stage4CounselLabel: "👨‍⚖️ નિમાયેલ એડવોકેટ:",
      stage4RoleLabel: "હોદ્દો:",
      stage4ChangeBtn: "🔄 વકીલ બદલવાની વિનંતી કરો",

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

      stage0Title: "STAGE 0: 🗣️ স্বাগতম ও অডিও নির্দেশিকা",
      stage0Subtitle: "আইনি প্রক্রিয়া বোঝা বা টাইপ করার প্রয়োজন নেই। অডিও শুনতে নিচের বোতামটি চাপুন।",
      stage0HowItWorks: "📌 এই পোর্টালে কাজ কীভাবে হবে?",
      stage0Step1: "1. মাইকে বলুন: আপনার কথা সরাসরি কেস রেকর্ডে টাইপ হবে।",
      stage0Step2: "2. নথি লোড করুন: কোর্ট ফাইলের ছবি বা PDF আপলোড করুন।",
      stage0Step3: "3. আইনজীবী ও AI সহায়তা: প্যানেলভুক্ত আইনজীবী সহায়তায় নিয়োজিত থাকবেন।",
      stage0PlayAudio: "🔊 অডিও চালু করুন",
      stage0UnderstandProceed: "বুঝেছি — এগিয়ে যান ➔",

      stage1Title: "STAGE 1: 🗣️ আইনি সমস্যা বিবরণ দিন",
      stage1CategoryLabel: "মামলার ধরণ",
      stage1ProblemLabel: "সমস্যার বিবরণ (বলুন বা টাইপ করুন)",
      stage1Placeholder: "এখানে বলুন বা টাইপ করুন... আপনার কথা মাস্টার কেস রেকর্ডে সংরক্ষিত হবে।",

      stage2Title: "STAGE 2: 📂 নথিপত্র আপলোড করুন",
      stage2Subtitle: "সিস্টেম স্বয়ংক্রিয়ভাবে নথিপত্র সাজিয়ে দেবে।",
      stage2UploadBtn: "➕ নথি আপলোড করুন",
      stage2CountLabel: "আপলোড করা নথি:",

      stage3Title: "STAGE 3: 🤖 AI কেস নির্ণয়",
      stage3Subtitle: "আপনার ভয়েস এবং নথির ভিত্তিতে AI আইনি বিশ্লেষণ প্রস্তুত:",
      stage3Chip: "✅ ধারা এবং আইন বিশ্লেষণ সম্পন্ন",
      stage3SavedNote: "এই বিশ্লেষণ স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে।",

      stage4Title: "STAGE 4: ⚖️ নিযুক্ত আইনজীবী ও পদক্ষেপ",
      stage4CounselLabel: "👨‍⚖️ নিযুক্ত আইনজীবী:",
      stage4RoleLabel: "পদবী:",
      stage4ChangeBtn: "🔄 আইনজীবী পরিবর্তনের অনুরোধ",
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
