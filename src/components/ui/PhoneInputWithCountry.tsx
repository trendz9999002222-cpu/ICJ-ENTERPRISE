"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import {
  CountryCode,
  getCountryCallingCode,
  isValidPhoneNumber,
  validatePhoneNumberLength,
} from "libphonenumber-js/max";

// Country metadata definition with native names and starting digit validation
export interface CountryMeta {
  code: CountryCode;
  name: string;
  nativeName?: string;
  dialCode: string;
  flag: string;
  samplePlaceholder: string;
  leadingRegex?: RegExp;
  exactLength?: number;
  leadingErrorMsg?: string;
}

// Unicode flag generator
function getFlag(code: string): string {
  const codePoints = code
    .toUpperCase()
    .split("")
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Crisp Flag renderer using flagcdn with seamless fallback
export function CountryFlag({ code, alt, width = 22, height = 15 }: { code: string; alt?: string; width?: number; height?: number }) {
  const [hasError, setHasError] = useState(false);
  const flagUrl = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  if (hasError) {
    return <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{getFlag(code)}</span>;
  }

  return (
    <Box
      component="img"
      src={flagUrl}
      alt={alt || code}
      onError={() => setHasError(true)}
      sx={{
        width,
        height,
        borderRadius: "2px",
        objectFit: "cover",
        boxShadow: "0 0 1px rgba(0,0,0,0.4)",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

export const COUNTRIES_LIST: CountryMeta[] = [
  {
    code: "IN",
    name: "India",
    nativeName: "भारत",
    dialCode: "+91",
    flag: getFlag("IN"),
    samplePlaceholder: "98765 43210",
    leadingRegex: /^[6-9]/,
    exactLength: 10,
    leadingErrorMsg: "Indian mobile number must start with 6, 7, 8, or 9",
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: getFlag("US"),
    samplePlaceholder: "201-555-5555",
    leadingRegex: /^[2-9]/,
    exactLength: 10,
    leadingErrorMsg: "US phone number area code cannot start with 0 or 1",
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: getFlag("GB"),
    samplePlaceholder: "7911 123456",
    leadingRegex: /^7/,
    exactLength: 10,
    leadingErrorMsg: "UK mobile number must start with 7",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    nativeName: "الإمارات",
    dialCode: "+971",
    flag: getFlag("AE"),
    samplePlaceholder: "50 123 4567",
    leadingRegex: /^5/,
    exactLength: 9,
    leadingErrorMsg: "UAE mobile number must start with 5",
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: getFlag("CA"),
    samplePlaceholder: "416-555-0199",
    leadingRegex: /^[2-9]/,
    exactLength: 10,
    leadingErrorMsg: "Canadian phone number cannot start with 0 or 1",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: getFlag("AU"),
    samplePlaceholder: "412 345 678",
    leadingRegex: /^4/,
    exactLength: 9,
    leadingErrorMsg: "Australian mobile number must start with 4",
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: getFlag("SG"),
    samplePlaceholder: "8123 4567",
    leadingRegex: /^[89]/,
    exactLength: 8,
    leadingErrorMsg: "Singapore mobile number must start with 8 or 9",
  },
  {
    code: "CN",
    name: "China",
    nativeName: "中国",
    dialCode: "+86",
    flag: getFlag("CN"),
    samplePlaceholder: "138 0013 8000",
    leadingRegex: /^1/,
    exactLength: 11,
    leadingErrorMsg: "Chinese mobile number must start with 1",
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: getFlag("FR"),
    samplePlaceholder: "6 12 34 56 78",
    leadingRegex: /^[67]/,
    exactLength: 9,
    leadingErrorMsg: "French mobile number must start with 6 or 7",
  },
  {
    code: "DE",
    name: "Germany",
    nativeName: "Deutschland",
    dialCode: "+49",
    flag: getFlag("DE"),
    samplePlaceholder: "151 23456789",
    leadingRegex: /^1[567]/,
    leadingErrorMsg: "German mobile number typically starts with 15, 16, or 17",
  },
  {
    code: "JP",
    name: "Japan",
    nativeName: "日本",
    dialCode: "+81",
    flag: getFlag("JP"),
    samplePlaceholder: "90 1234 5678",
    leadingRegex: /^[789]0/,
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    nativeName: "المملكة العربية السعودية",
    dialCode: "+966",
    flag: getFlag("SA"),
    samplePlaceholder: "50 123 4567",
    leadingRegex: /^5/,
    exactLength: 9,
  },
  {
    code: "QA",
    name: "Qatar",
    dialCode: "+974",
    flag: getFlag("QA"),
    samplePlaceholder: "3312 3456",
    leadingRegex: /^[3567]/,
    exactLength: 8,
  },
  {
    code: "KW",
    name: "Kuwait",
    dialCode: "+965",
    flag: getFlag("KW"),
    samplePlaceholder: "9123 4567",
    leadingRegex: /^[569]/,
    exactLength: 8,
  },
  {
    code: "OM",
    name: "Oman",
    dialCode: "+968",
    flag: getFlag("OM"),
    samplePlaceholder: "9123 4567",
    leadingRegex: /^[79]/,
    exactLength: 8,
  },
  {
    code: "BH",
    name: "Bahrain",
    dialCode: "+973",
    flag: getFlag("BH"),
    samplePlaceholder: "3612 3456",
    leadingRegex: /^[36]/,
    exactLength: 8,
  },
  {
    code: "NP",
    name: "Nepal",
    nativeName: "नेपाल",
    dialCode: "+977",
    flag: getFlag("NP"),
    samplePlaceholder: "984 1234567",
    leadingRegex: /^9[78]/,
    exactLength: 10,
  },
  {
    code: "BD",
    name: "Bangladesh",
    nativeName: "বাংলাদেশ",
    dialCode: "+880",
    flag: getFlag("BD"),
    samplePlaceholder: "1712 345678",
    leadingRegex: /^1/,
    exactLength: 10,
  },
  {
    code: "LK",
    name: "Sri Lanka",
    nativeName: "ශ්‍රී ලංකාව",
    dialCode: "+94",
    flag: getFlag("LK"),
    samplePlaceholder: "71 234 5678",
    leadingRegex: /^7/,
    exactLength: 9,
  },
  {
    code: "MY",
    name: "Malaysia",
    dialCode: "+60",
    flag: getFlag("MY"),
    samplePlaceholder: "12-345 6789",
    leadingRegex: /^1/,
  },
  {
    code: "ID",
    name: "Indonesia",
    dialCode: "+62",
    flag: getFlag("ID"),
    samplePlaceholder: "812-3456-7890",
    leadingRegex: /^8/,
  },
  {
    code: "ZA",
    name: "South Africa",
    dialCode: "+27",
    flag: getFlag("ZA"),
    samplePlaceholder: "71 123 4567",
    leadingRegex: /^[678]/,
    exactLength: 9,
  },
  {
    code: "BR",
    name: "Brazil",
    nativeName: "Brasil",
    dialCode: "+55",
    flag: getFlag("BR"),
    samplePlaceholder: "11 91234-5678",
    exactLength: 11,
  },
  {
    code: "RU",
    name: "Russia",
    nativeName: "Россия",
    dialCode: "+7",
    flag: getFlag("RU"),
    samplePlaceholder: "912 345-67-89",
    exactLength: 10,
  },
  {
    code: "IT",
    name: "Italy",
    nativeName: "Italia",
    dialCode: "+33",
    flag: getFlag("IT"),
    samplePlaceholder: "312 345 6789",
    leadingRegex: /^3/,
    exactLength: 10,
  },
  {
    code: "ES",
    name: "Spain",
    nativeName: "España",
    dialCode: "+34",
    flag: getFlag("ES"),
    samplePlaceholder: "612 34 56 78",
    leadingRegex: /^[67]/,
    exactLength: 9,
  },
  {
    code: "NL",
    name: "Netherlands",
    dialCode: "+31",
    flag: getFlag("NL"),
    samplePlaceholder: "6 12345678",
    leadingRegex: /^6/,
    exactLength: 9,
  },
  {
    code: "CH",
    name: "Switzerland",
    dialCode: "+41",
    flag: getFlag("CH"),
    samplePlaceholder: "78 123 45 67",
    leadingRegex: /^7/,
    exactLength: 9,
  },
  {
    code: "NZ",
    name: "New Zealand",
    dialCode: "+64",
    flag: getFlag("NZ"),
    samplePlaceholder: "21 123 4567",
    leadingRegex: /^2/,
    exactLength: 9,
  },
  {
    code: "IE",
    name: "Ireland",
    dialCode: "+353",
    flag: getFlag("IE"),
    samplePlaceholder: "85 123 4567",
    leadingRegex: /^8/,
    exactLength: 9,
  },
];

interface PhoneInputWithCountryProps {
  label?: string;
  value: string;
  onChange: (fullValue: string, nationalNumber: string, countryCode: string, isValid: boolean) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium";
  defaultCountry?: CountryCode;
  variant?: "outlined" | "standard";
  sx?: any;
}

export default function PhoneInputWithCountry({
  label = "Phone Number",
  value = "",
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  size = "small",
  defaultCountry = "IN",
  variant = "outlined",
  sx,
}: PhoneInputWithCountryProps) {
  // Extract initial country and national number from incoming value
  const parseIncomingValue = (val: string): { country: CountryMeta; national: string } => {
    const clean = val.trim();
    if (clean.startsWith("+")) {
      for (const c of COUNTRIES_LIST) {
        if (clean.startsWith(c.dialCode)) {
          return {
            country: c,
            national: clean.slice(c.dialCode.length).replace(/\D/g, ""),
          };
        }
      }
    }
    const defaultMeta = COUNTRIES_LIST.find((c) => c.code === defaultCountry) || COUNTRIES_LIST[0];
    return {
      country: defaultMeta,
      national: clean.replace(/\D/g, ""),
    };
  };

  const initialParsed = parseIncomingValue(value);
  const [selectedCountry, setSelectedCountry] = useState<CountryMeta>(initialParsed.country);
  const [nationalNumber, setNationalNumber] = useState<string>(initialParsed.national);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Country selector menu anchor
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize incoming value if changed externally
  useEffect(() => {
    const parsed = parseIncomingValue(value);
    if (parsed.national !== nationalNumber || parsed.country.code !== selectedCountry.code) {
      setSelectedCountry(parsed.country);
      setNationalNumber(parsed.national);
    }
  }, [value]);

  // Optional auto-detect country on mount via free IP API if no value provided
  useEffect(() => {
    if (value) return;
    try {
      const cached = typeof window !== "undefined" ? sessionStorage.getItem("icj_detected_country") : null;
      if (cached) {
        const found = COUNTRIES_LIST.find((c) => c.code === cached);
        if (found) {
          setSelectedCountry(found);
          return;
        }
      }

      const controller = new AbortController();
      const tId = setTimeout(() => controller.abort(), 1200);
      fetch("https://ipapi.co/json/", { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((d) => {
          if (d && d.country_code) {
            const found = COUNTRIES_LIST.find((c) => c.code === d.country_code);
            if (found) {
              setSelectedCountry(found);
              sessionStorage.setItem("icj_detected_country", d.country_code);
            }
          }
        })
        .catch(() => {})
        .finally(() => clearTimeout(tId));
    } catch {
      // safe fallback
    }
  }, []);

  // Validation function
  const validateNumber = (digits: string, country: CountryMeta): { isValid: boolean; error: string | null } => {
    if (!digits) {
      if (required) return { isValid: false, error: "Phone number is required." };
      return { isValid: true, error: null };
    }

    // 1. Starting digit check (especially for India: must start with 6, 7, 8, 9)
    if (country.leadingRegex && !country.leadingRegex.test(digits)) {
      const msg =
        country.leadingErrorMsg ||
        `Mobile number for ${country.name} must start with valid leading digits.`;
      return { isValid: false, error: msg };
    }

    // 2. Exact length check if specified
    if (country.exactLength && digits.length !== country.exactLength) {
      if (digits.length < country.exactLength) {
        return {
          isValid: false,
          error: `Mobile number must be ${country.exactLength} digits (${digits.length}/${country.exactLength})`,
        };
      } else {
        return {
          isValid: false,
          error: `Mobile number cannot exceed ${country.exactLength} digits`,
        };
      }
    }

    // 3. Libphonenumber official verification
    try {
      const full = `${country.dialCode}${digits}`;
      if (!isValidPhoneNumber(full, country.code)) {
        return {
          isValid: false,
          error: `Please enter a valid phone number for ${country.name}.`,
        };
      }
    } catch {
      // In case of parsing exception, fallback to length check
      if (digits.length < 7) {
        return { isValid: false, error: "Phone number is too short." };
      }
    }

    return { isValid: true, error: null };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawDigits = e.target.value.replace(/\D/g, "");

    // Enforce max length cap according to country
    if (selectedCountry.exactLength && rawDigits.length > selectedCountry.exactLength) {
      rawDigits = rawDigits.slice(0, selectedCountry.exactLength);
    } else if (rawDigits.length > 15) {
      rawDigits = rawDigits.slice(0, 15);
    }

    setNationalNumber(rawDigits);

    const { isValid, error: validationError } = validateNumber(rawDigits, selectedCountry);
    setInternalError(validationError);

    const fullInternational = rawDigits ? `${selectedCountry.dialCode}${rawDigits}` : "";
    onChange(fullInternational, rawDigits, selectedCountry.code, isValid);
  };

  const handleCountrySelect = (country: CountryMeta) => {
    setSelectedCountry(country);
    setAnchorEl(null);
    setSearchQuery("");

    // Re-validate existing digits under newly selected country
    let digits = nationalNumber;
    if (country.exactLength && digits.length > country.exactLength) {
      digits = digits.slice(0, country.exactLength);
      setNationalNumber(digits);
    }

    const { isValid, error: validationError } = validateNumber(digits, country);
    setInternalError(validationError);

    const fullInternational = digits ? `${country.dialCode}${digits}` : "";
    onChange(fullInternational, digits, country.code, isValid);
  };

  // Filtered countries for the dropdown
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES_LIST;
    return COUNTRIES_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.nativeName && c.nativeName.toLowerCase().includes(q)) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const displayedError = error || internalError;
  const isCompleteAndValid = nationalNumber.length > 0 && !displayedError;

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <TextField
        fullWidth={fullWidth}
        size={size}
        variant={variant}
        type="tel"
        label={label}
        required={required}
        placeholder={selectedCountry.samplePlaceholder}
        value={nationalNumber}
        disabled={disabled}
        onChange={handleInputChange}
        error={Boolean(displayedError)}
        helperText={displayedError || helperText}
        sx={sx}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 1, mb: variant === "standard" ? 0.4 : 0 }}>
                <Button
                  onClick={(e) => {
                    if (!disabled) {
                      setAnchorEl(e.currentTarget);
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }
                  }}
                  disabled={disabled}
                  sx={{
                    p: variant === "standard" ? "0 4px 0 0" : "2px 6px",
                    height: variant === "standard" ? 24 : 28,
                    minWidth: "unset",
                    color: "#0f172a",
                    fontSize: "0.825rem",
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: variant === "standard" ? 0 : 1,
                    border: variant === "standard" ? "none" : "1px solid #cbd5e1",
                    bgcolor: variant === "standard" ? "transparent" : "#f8fafc",
                    "&:hover": {
                      bgcolor: variant === "standard" ? "rgba(0,0,0,0.04)" : "#f1f5f9",
                      borderColor: "#94a3b8",
                    },
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                  }}
                >
                  <CountryFlag code={selectedCountry.code} alt={selectedCountry.name} />
                  <Typography sx={{ fontWeight: 800, fontSize: "0.825rem", color: "#0f2942" }}>
                    {selectedCountry.dialCode}
                  </Typography>
                  <ArrowDropDownIcon sx={{ fontSize: 18, color: "#64748b", ml: -0.2 }} />
                </Button>
                <Divider orientation="vertical" flexItem sx={{ height: 18, mx: 0.8, my: "auto" }} />
              </InputAdornment>
            ),
            endAdornment: isCompleteAndValid ? (
              <InputAdornment position="end">
                <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20 }} />
              </InputAdornment>
            ) : null,
          },
        }}
      />

      {/* Country Selection Menu Popup (Matches User Screenshot) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSearchQuery("");
        }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 360,
              width: 320,
              borderRadius: 2,
              boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
              border: "1px solid #e2e8f0",
              mt: 0.5,
            },
          },
        }}
      >
        {/* Search Header inside dropdown */}
        <Box sx={{ p: 1, position: "sticky", top: 0, bgcolor: "#ffffff", zIndex: 10, borderBottom: "1px solid #f1f5f9" }}>
          <TextField
            inputRef={searchInputRef}
            fullWidth
            size="small"
            placeholder="Search country or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {filteredCountries.map((c) => {
          const isSelected = c.code === selectedCountry.code;
          return (
            <MenuItem
              key={c.code}
              onClick={() => handleCountrySelect(c)}
              selected={isSelected}
              sx={{
                py: 1,
                px: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: isSelected ? "#0d9488 !important" : undefined,
                color: isSelected ? "#ffffff !important" : "#0f172a",
                "&:hover": {
                  bgcolor: isSelected ? "#0f766e !important" : "#f1f5f9",
                },
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                <CountryFlag code={c.code} alt={c.name} width={24} height={16} />
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: isSelected ? 800 : 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {c.name} {c.nativeName ? `(${c.nativeName})` : ""}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  color: isSelected ? "#ffffff" : "#64748b",
                  ml: 1.5,
                  flexShrink: 0,
                }}
              >
                {c.dialCode}
              </Typography>
            </MenuItem>
          );
        })}

        {filteredCountries.length === 0 && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              No matching country found
            </Typography>
          </Box>
        )}
      </Menu>
    </Box>
  );
}
