export type Language = {
  code: string;
  name: string; // Native script name
  englishName: string;
  countryCode?: string;
};

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", englishName: "English" },
  { code: "hi", name: "हिन्दी", englishName: "Hindi" },
  { code: "bn", name: "বাংলা", englishName: "Bengali" },
  { code: "mr", name: "मराठी", englishName: "Marathi" },
  { code: "ta", name: "தமிழ்", englishName: "Tamil" },
  { code: "te", name: "తెలుగు", englishName: "Telugu" },
  { code: "gu", name: "ગુજરાતી", englishName: "Gujarati" },
  { code: "kn", name: "ಕನ್ನಡ", englishName: "Kannada" },
  { code: "ml", name: "മലയാളം", englishName: "Malayalam" },
  { code: "pa", name: "ਪੰਜਾਬੀ", englishName: "Punjabi" },
  { code: "ur", name: "اردو", englishName: "Urdu" },
  { code: "es", name: "Español", englishName: "Spanish" },
  { code: "fr", name: "Français", englishName: "French" },
  { code: "ar", name: "العربية", englishName: "Arabic" },
  { code: "ru", name: "Русский", englishName: "Russian" },
  { code: "de", name: "Deutsch", englishName: "German" },
];
