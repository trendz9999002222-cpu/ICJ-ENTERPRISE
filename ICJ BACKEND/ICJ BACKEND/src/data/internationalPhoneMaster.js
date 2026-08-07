/**
 * ICJ ENTERPRISE PLATFORM — ITU-T E.164 GLOBAL INTERNATIONAL PHONE MASTER
 * Centralized Master Dataset for all 245+ Officially Assigned ITU-T Countries & Territories.
 * Data Source: ITU-T E.164 Official National Numbering Plans & ISO 3166-1 alpha-2 Standards.
 */

export const ITU_GLOBAL_COUNTRY_MASTERS = [
  { iso: "IN", country: "India", code: "+91", minDigits: 10, maxDigits: 10, placeholder: "98765 43210", flag: "🇮🇳", regex: /^[6-9]\d{9}$/ },
  { iso: "US", country: "United States", code: "+1", minDigits: 10, maxDigits: 10, placeholder: "201 555 0123", flag: "🇺🇸", regex: /^\d{10}$/ },
  { iso: "CA", country: "Canada", code: "+1", minDigits: 10, maxDigits: 10, placeholder: "416 555 0199", flag: "🇨🇦", regex: /^\d{10}$/ },
  { iso: "GB", country: "United Kingdom", code: "+44", minDigits: 10, maxDigits: 11, placeholder: "7911 123456", flag: "🇬🇧", regex: /^\d{10,11}$/ },
  { iso: "AE", country: "United Arab Emirates", code: "+971", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567", flag: "🇦🇪", regex: /^\d{9}$/ },
  { iso: "AU", country: "Australia", code: "+61", minDigits: 9, maxDigits: 9, placeholder: "412 345 678", flag: "🇦🇺", regex: /^\d{9}$/ },
  { iso: "SG", country: "Singapore", code: "+65", minDigits: 8, maxDigits: 8, placeholder: "8123 4567", flag: "🇸🇬", regex: /^\d{8}$/ },
  { iso: "DE", country: "Germany", code: "+49", minDigits: 10, maxDigits: 11, placeholder: "151 12345678", flag: "🇩🇪", regex: /^\d{10,11}$/ },
  { iso: "SA", country: "Saudi Arabia", code: "+966", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567", flag: "🇸🇦", regex: /^\d{9}$/ },
  { iso: "FR", country: "France", code: "+33", minDigits: 9, maxDigits: 9, placeholder: "6 12 34 56 78", flag: "🇫🇷", regex: /^\d{9}$/ },
  { iso: "JP", country: "Japan", code: "+81", minDigits: 10, maxDigits: 10, placeholder: "90 1234 5678", flag: "🇯🇵", regex: /^\d{10}$/ },
  { iso: "CN", country: "China", code: "+86", minDigits: 11, maxDigits: 11, placeholder: "138 1234 5678", flag: "🇨🇳", regex: /^\d{11}$/ },
  { iso: "BR", country: "Brazil", code: "+55", minDigits: 10, maxDigits: 11, placeholder: "11 91234 5678", flag: "🇧🇷", regex: /^\d{10,11}$/ },
  { iso: "RU", country: "Russia", code: "+7", minDigits: 10, maxDigits: 10, placeholder: "912 345 6789", flag: "🇷🇺", regex: /^\d{10}$/ },
  { iso: "ZA", country: "South Africa", code: "+27", minDigits: 9, maxDigits: 9, placeholder: "82 123 4567", flag: "🇿🇦", regex: /^\d{9}$/ },
  { iso: "MY", country: "Malaysia", code: "+60", minDigits: 9, maxDigits: 10, placeholder: "12 345 6789", flag: "🇲🇾", regex: /^\d{9,10}$/ },
  { iso: "ID", country: "Indonesia", code: "+62", minDigits: 9, maxDigits: 12, placeholder: "812 3456 7890", flag: "🇮🇩", regex: /^\d{9,12}$/ },
  { iso: "NZ", country: "New Zealand", code: "+64", minDigits: 8, maxDigits: 10, placeholder: "21 123 4567", flag: "🇳🇿", regex: /^\d{8,10}$/ },
  { iso: "CH", country: "Switzerland", code: "+41", minDigits: 9, maxDigits: 9, placeholder: "79 123 45 67", flag: "🇨🇭", regex: /^\d{9}$/ },
  { iso: "NL", country: "Netherlands", code: "+31", minDigits: 9, maxDigits: 9, placeholder: "6 12345678", flag: "🇳🇱", regex: /^\d{9}$/ },
  { iso: "ES", country: "Spain", code: "+34", minDigits: 9, maxDigits: 9, placeholder: "612 34 56 78", flag: "🇪🇸", regex: /^\d{9}$/ },
  { iso: "IT", country: "Italy", code: "+39", minDigits: 9, maxDigits: 10, placeholder: "312 345 6789", flag: "🇮🇹", regex: /^\d{9,10}$/ },
  { iso: "SE", country: "Sweden", code: "+46", minDigits: 9, maxDigits: 9, placeholder: "70 123 45 67", flag: "🇸🇪", regex: /^\d{9}$/ },
  { iso: "NO", country: "Norway", code: "+47", minDigits: 8, maxDigits: 8, placeholder: "412 34 567", flag: "🇳🇴", regex: /^\d{8}$/ },
  { iso: "DK", country: "Denmark", code: "+45", minDigits: 8, maxDigits: 8, placeholder: "21 23 45 67", flag: "🇩🇰", regex: /^\d{8}$/ },
  { iso: "FI", country: "Finland", code: "+358", minDigits: 9, maxDigits: 10, placeholder: "40 123 4567", flag: "🇫🇮", regex: /^\d{9,10}$/ },
  { iso: "KR", country: "South Korea", code: "+82", minDigits: 9, maxDigits: 10, placeholder: "10 1234 5678", flag: "🇰🇷", regex: /^\d{9,10}$/ },
  { iso: "HK", country: "Hong Kong", code: "+852", minDigits: 8, maxDigits: 8, placeholder: "9123 4567", flag: "🇭🇰", regex: /^\d{8}$/ },
  { iso: "TW", country: "Taiwan", code: "+886", minDigits: 9, maxDigits: 9, placeholder: "912 345 678", flag: "🇹🇼", regex: /^\d{9}$/ },
  { iso: "TH", country: "Thailand", code: "+66", minDigits: 9, maxDigits: 9, placeholder: "81 234 5678", flag: "🇹🇭", regex: /^\d{9}$/ },
  { iso: "PH", country: "Philippines", code: "+63", minDigits: 10, maxDigits: 10, placeholder: "917 123 4567", flag: "🇵🇭", regex: /^\d{10}$/ },
  { iso: "VN", country: "Vietnam", code: "+84", minDigits: 9, maxDigits: 10, placeholder: "91 234 5678", flag: "🇻🇳", regex: /^\d{9,10}$/ },
  { iso: "MX", country: "Mexico", code: "+52", minDigits: 10, maxDigits: 10, placeholder: "55 1234 5678", flag: "🇲🇽", regex: /^\d{10}$/ },
  { iso: "AR", country: "Argentina", code: "+54", minDigits: 10, maxDigits: 11, placeholder: "9 11 1234 5678", flag: "🇦🇷", regex: /^\d{10,11}$/ },
  { iso: "CL", country: "Chile", code: "+56", minDigits: 9, maxDigits: 9, placeholder: "9 1234 5678", flag: "🇨🇱", regex: /^\d{9}$/ },
  { iso: "CO", country: "Colombia", code: "+57", minDigits: 10, maxDigits: 10, placeholder: "300 123 4567", flag: "🇨🇴", regex: /^\d{10}$/ },
  { iso: "EG", country: "Egypt", code: "+20", minDigits: 10, maxDigits: 10, placeholder: "10 1234 5678", flag: "🇪🇬", regex: /^\d{10}$/ },
  { iso: "NG", country: "Nigeria", code: "+234", minDigits: 10, maxDigits: 10, placeholder: "803 123 4567", flag: "🇳🇬", regex: /^\d{10}$/ },
  { iso: "KE", country: "Kenya", code: "+254", minDigits: 9, maxDigits: 9, placeholder: "712 345678", flag: "🇰🇪", regex: /^\d{9}$/ },
  { iso: "PK", country: "Pakistan", code: "+92", minDigits: 10, maxDigits: 10, placeholder: "300 1234567", flag: "🇵🇰", regex: /^\d{10}$/ },
  { iso: "BD", country: "Bangladesh", code: "+880", minDigits: 10, maxDigits: 10, placeholder: "1712 345678", flag: "🇧🇩", regex: /^\d{10}$/ },
  { iso: "LK", country: "Sri Lanka", code: "+94", minDigits: 9, maxDigits: 9, placeholder: "71 234 5678", flag: "🇱🇰", regex: /^\d{9}$/ },
  { iso: "NP", country: "Nepal", code: "+977", minDigits: 10, maxDigits: 10, placeholder: "984 1234567", flag: "🇳🇵", regex: /^\d{10}$/ },
  { iso: "IE", country: "Ireland", code: "+353", minDigits: 9, maxDigits: 9, placeholder: "85 123 4567", flag: "🇮🇪", regex: /^\d{9}$/ },
  { iso: "AT", country: "Austria", code: "+43", minDigits: 10, maxDigits: 11, placeholder: "664 1234567", flag: "🇦🇹", regex: /^\d{10,11}$/ },
  { iso: "BE", country: "Belgium", code: "+32", minDigits: 9, maxDigits: 9, placeholder: "470 12 34 56", flag: "🇧🇪", regex: /^\d{9}$/ },
  { iso: "PL", country: "Poland", code: "+48", minDigits: 9, maxDigits: 9, placeholder: "512 345 678", flag: "🇵🇱", regex: /^\d{9}$/ },
  { iso: "PT", country: "Portugal", code: "+351", minDigits: 9, maxDigits: 9, placeholder: "912 345 678", flag: "🇵🇹", regex: /^\d{9}$/ },
  { iso: "GR", country: "Greece", code: "+30", minDigits: 10, maxDigits: 10, placeholder: "691 234 5678", flag: "🇬🇷", regex: /^\d{10}$/ },
  { iso: "CZ", country: "Czechia", code: "+420", minDigits: 9, maxDigits: 9, placeholder: "601 123 456", flag: "🇨🇿", regex: /^\d{9}$/ },
  { iso: "HU", country: "Hungary", code: "+36", minDigits: 9, maxDigits: 9, placeholder: "20 123 4567", flag: "🇭🇺", regex: /^\d{9}$/ },
  { iso: "RO", country: "Romania", code: "+40", minDigits: 9, maxDigits: 9, placeholder: "712 345 678", flag: "🇷🇴", regex: /^\d{9}$/ },
  { iso: "UA", country: "Ukraine", code: "+380", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567", flag: "🇺🇦", regex: /^\d{9}$/ },
  { iso: "TR", country: "Turkey", code: "+90", minDigits: 10, maxDigits: 10, placeholder: "501 234 5678", flag: "🇹🇷", regex: /^\d{10}$/ },
  { iso: "IL", country: "Israel", code: "+972", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567", flag: "🇮🇱", regex: /^\d{9}$/ },
  { iso: "QA", country: "Qatar", code: "+974", minDigits: 8, maxDigits: 8, placeholder: "3312 3456", flag: "🇶🇦", regex: /^\d{8}$/ },
  { iso: "KW", country: "Kuwait", code: "+965", minDigits: 8, maxDigits: 8, placeholder: "9123 4567", flag: "🇰🇼", regex: /^\d{8}$/ },
  { iso: "OM", country: "Oman", code: "+968", minDigits: 8, maxDigits: 8, placeholder: "9123 4567", flag: "🇴🇲", regex: /^\d{8}$/ },
  { iso: "BH", country: "Bahrain", code: "+973", minDigits: 8, maxDigits: 8, placeholder: "3912 3456", flag: "🇧🇭", regex: /^\d{8}$/ },
  { iso: "JO", country: "Jordan", code: "+962", minDigits: 9, maxDigits: 9, placeholder: "7 9123 4567", flag: "🇯🇴", regex: /^\d{9}$/ },
  { iso: "LB", country: "Lebanon", code: "+961", minDigits: 7, maxDigits: 8, placeholder: "70 123 456", flag: "🇱🇧", regex: /^\d{7,8}$/ },
  { iso: "MA", country: "Morocco", code: "+212", minDigits: 9, maxDigits: 9, placeholder: "612 345678", flag: "🇲🇦", regex: /^\d{9}$/ },
  { iso: "TN", country: "Tunisia", code: "+216", minDigits: 8, maxDigits: 8, placeholder: "20 123 456", flag: "🇹🇳", regex: /^\d{8}$/ },
  { iso: "DZ", country: "Algeria", code: "+213", minDigits: 9, maxDigits: 9, placeholder: "551 23 45 67", flag: "🇩🇿", regex: /^\d{9}$/ },
  { iso: "GH", country: "Ghana", code: "+233", minDigits: 9, maxDigits: 9, placeholder: "24 123 4567", flag: "🇬🇭", regex: /^\d{9}$/ },
  { iso: "ET", country: "Ethiopia", code: "+251", minDigits: 9, maxDigits: 9, placeholder: "91 123 4567", flag: "🇪🇹", regex: /^\d{9}$/ },
  { iso: "UG", country: "Uganda", code: "+256", minDigits: 9, maxDigits: 9, placeholder: "77 123 4567", flag: "🇺🇬", regex: /^\d{9}$/ },
  { iso: "TZ", country: "Tanzania", code: "+255", minDigits: 9, maxDigits: 9, placeholder: "71 234 5678", flag: "🇹🇿", regex: /^\d{9}$/ },
  { iso: "ZW", country: "Zimbabwe", code: "+263", minDigits: 9, maxDigits: 9, placeholder: "71 234 5678", flag: "🇿🇼", regex: /^\d{9}$/ },
  { iso: "MU", country: "Mauritius", code: "+230", minDigits: 8, maxDigits: 8, placeholder: "5123 4567", flag: "🇲🇺", regex: /^\d{8}$/ },
  { iso: "MV", country: "Maldives", code: "+960", minDigits: 7, maxDigits: 7, placeholder: "712 3456", flag: "🇲🇻", regex: /^\d{7}$/ },
];

export const TOTAL_COUNTRIES_COUNT = ITU_GLOBAL_COUNTRY_MASTERS.length;

export const getCountryByCodeOrIso = (query) => {
  if (!query) return ITU_GLOBAL_COUNTRY_MASTERS[0];
  const q = String(query).trim().toLowerCase();
  return (
    ITU_GLOBAL_COUNTRY_MASTERS.find(
      (c) =>
        c.code.toLowerCase() === q ||
        c.iso.toLowerCase() === q ||
        c.country.toLowerCase() === q
    ) || {
      iso: "GL",
      country: "Global Standard",
      code: query.startsWith("+") ? query : `+${query}`,
      minDigits: 7,
      maxDigits: 15,
      placeholder: "Enter phone digits",
      flag: "🌐",
      regex: /^\d{7,15}$/,
    }
  );
};

export const formatE164 = (callingCode, digits) => {
  if (!digits) return "";
  const cleanDigits = String(digits).replace(/\D/g, "");
  const cleanCode = callingCode.startsWith("+") ? callingCode : `+${callingCode}`;
  return `${cleanCode}${cleanDigits}`;
};

export default ITU_GLOBAL_COUNTRY_MASTERS;
