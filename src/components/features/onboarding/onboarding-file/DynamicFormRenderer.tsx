"use client";

import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";

import { buildYearOptions, getOptions } from "@/lib/registrationClient";
import { isFieldVisible } from "@/lib/validation";
import { getCountryCallingCode, isValidPhoneNumber, validatePhoneNumberLength, CountryCode } from "libphonenumber-js/max";
import { useLocationData } from "@/hooks/useLocationData";
import { RADIUS, resolveIcon } from "./iconMap";
import { FormField, FormSchema, Theme } from "@/types/registration";
import { Select, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import EmailVerificationField from "@/components/ui/EmailVerificationField";

type Props = {
  schema: FormSchema;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  theme: Theme;
  onChange: (name: string, value: unknown) => void;
  isEmailPreVerified?: boolean;
  onEmailVerified?: (email: string) => void;
};

function labelWithFlag(field: FormField) {
  if (field.required) return `${field.label} *`;
  if (field.optionalTag) return `${field.label} (Optional)`;
  return field.label;
}

function resolveOptionEntries(field: FormField): { value: string; label: string }[] {
  if (field.optionItems?.length) return field.optionItems;
  const opts = getOptions(field.optionsRef, field.options);
  return opts.map((o) => ({ value: o, label: o }));
}

export default function DynamicFormRenderer({
  schema,
  values,
  errors,
  theme,
  onChange,
  isEmailPreVerified,
  onEmailVerified,
}: Props) {
  const countryKey = Object.keys(values).find(k => k.toLowerCase().includes("country")) || "country";
  const stateKey = Object.keys(values).find(k => k.toLowerCase().includes("state")) || "state";
  const districtKey = Object.keys(values).find(k => k.toLowerCase().includes("district") || k.toLowerCase().includes("city")) || "district";
  
  const selectedCountryName = (values[countryKey] as string) || "India";
  const selectedStateName = (values[stateKey] as string) || "";
  const { countries, states, districts, loading, levels } = useLocationData(selectedCountryName, selectedStateName);

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm, bgcolor: "#fff" },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.color },
    "& label.Mui-focused": { color: theme.color },
  } as const;

  const renderField = (field: FormField) => {
    if (!isFieldVisible(field.visibleWhen, values)) return null;

    const error = errors[field.name];
    const value = values[field.name];

    const wrap = (node: React.ReactNode) => (
      <Box
        key={field.name}
        data-field={field.name}
        sx={{ gridColumn: { xs: "span 12", md: `span ${field.col ?? 3}` } }}
      >
        {node}
      </Box>
    );

    switch (field.type) {
      case "country": {
        return wrap(
          <TextField
            select
            fullWidth
            size="small"
            label={labelWithFlag(field)}
            value={(value as string) ?? ""}
            onChange={(e) => {
              onChange(field.name, e.target.value);
              // clear dependent fields
              onChange(stateKey, "");
              onChange(districtKey, "");
            }}
            error={!!error}
            helperText={error ?? field.helper}
            sx={inputSx}
            disabled={loading}
          >
            <MenuItem value="">
              <em>Select Country</em>
            </MenuItem>
            {countries.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        );
      }

      case "state": {
        const lbl = labelWithFlag(field);
        const resolvedLabel = lbl === "State *" ? `${levels.l1} *` : lbl === "State" ? levels.l1 : lbl;
        return wrap(
          <TextField
            select
            fullWidth
            size="small"
            label={resolvedLabel}
            value={(value as string) ?? ""}
            onChange={(e) => {
              onChange(field.name, e.target.value);
              // clear dependent fields
              onChange(districtKey, "");
            }}
            error={!!error}
            helperText={error ?? field.helper}
            sx={inputSx}
            disabled={loading || !states.length}
          >
            <MenuItem value="">
              <em>{`Select ${levels.l1}`}</em>
            </MenuItem>
            {states.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        );
      }

      case "city":
      case "district": {
        const lbl = labelWithFlag(field);
        const resolvedLabel = lbl === "District *" ? `${levels.l2} *` : lbl === "District" ? levels.l2 : lbl;
        return wrap(
          <TextField
            select
            fullWidth
            size="small"
            label={resolvedLabel}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            error={!!error}
            helperText={error ?? field.helper}
            sx={inputSx}
            disabled={loading || !districts.length}
          >
            <MenuItem value="">
              <em>{`Select ${levels.l2}`}</em>
            </MenuItem>
            {districts.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        );
      }

      case "select":
      case "year": {
        const options =
          field.type === "year"
            ? buildYearOptions(field.yearFrom ?? 1960).map((y) => ({ value: y, label: y }))
            : resolveOptionEntries(field);

        return wrap(
          <TextField
            select
            fullWidth
            size="small"
            label={labelWithFlag(field)}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            error={!!error}
            helperText={error ?? field.helper}
            sx={inputSx}
          >
            <MenuItem value="">
              <em>Select</em>
            </MenuItem>
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        );
      }

      case "radio": {
        const options = resolveOptionEntries(field);
        return wrap(
          <FormControl error={!!error} component="fieldset" fullWidth>
            <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>
              {labelWithFlag(field)}
            </FormLabel>
            <RadioGroup
              row
              value={(value as string) ?? ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            >
              {options.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio size="small" sx={{ "&.Mui-checked": { color: theme.color } }} />}
                  label={<Typography sx={{ fontSize: "0.85rem" }}>{opt.label}</Typography>}
                />
              ))}
            </RadioGroup>
            {(error || field.helper) && <FormHelperText>{error ?? field.helper}</FormHelperText>}
          </FormControl>
        );
      }

      case "checkboxGroup": {
        const options = resolveOptionEntries(field);
        const selected = Array.isArray(value) ? (value as string[]) : [];
        const toggle = (opt: string) => {
          const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt];
          onChange(field.name, next);
        };

        return wrap(
          <FormControl error={!!error} component="fieldset" fullWidth>
            <FormLabel sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155", mb: 0.5 }}>
              {labelWithFlag(field)}{" "}
              {field.helper && (
                <Typography component="span" sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  ({field.helper})
                </Typography>
              )}
            </FormLabel>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: `repeat(${field.columns ?? 2}, minmax(0, 1fr))`,
                },
                columnGap: 1,
              }}
            >
              {options.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  control={
                    <Checkbox
                      size="small"
                      checked={selected.includes(opt.value)}
                      onChange={() => toggle(opt.value)}
                      sx={{ "&.Mui-checked": { color: theme.color } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: "0.83rem" }}>{opt.label}</Typography>}
                />
              ))}
            </Box>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );
      }

      case "checkbox":
        return wrap(
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={Boolean(value)}
                onChange={(e) => onChange(field.name, e.target.checked)}
                sx={{ "&.Mui-checked": { color: theme.color } }}
              />
            }
            label={<Typography sx={{ fontSize: "0.85rem" }}>{labelWithFlag(field)}</Typography>}
          />
        );

      case "textarea":
        return wrap(
          <TextField
            fullWidth
            multiline
            rows={field.rows ?? 3}
            label={labelWithFlag(field)}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            error={!!error}
            helperText={error ?? field.helper}
            sx={inputSx}
          />
        );

      case "date": {
        const isDob =
          field.name.toLowerCase().includes("dob") ||
          field.name.toLowerCase().includes("birth") ||
          field.label?.toLowerCase().includes("birth");

        const maxDobDate = `${new Date().getFullYear() - 18}-12-31`;

        const handleDateFocus = () => {
          if (isDob && !value) {
            onChange(field.name, "2000-01-01");
          }
        };

        return wrap(
          <TextField
            fullWidth
            size="small"
            type="date"
            label={labelWithFlag(field)}
            value={(value as string) ?? ""}
            onFocus={handleDateFocus}
            onClick={handleDateFocus}
            onChange={(e) => onChange(field.name, e.target.value)}
            error={!!error}
            helperText={error ?? field.helper}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: isDob
                ? {
                    max: maxDobDate,
                    min: "1940-01-01",
                  }
                : undefined,
            }}
            sx={inputSx}
          />
        );
      }

      case "tel": {
        const countryCode = (countries.find((c) => c.value === selectedCountryName)?.code?.toUpperCase() || "IN") as CountryCode;
        let callingCode = "";
        try {
          callingCode = `+${getCountryCallingCode(countryCode)}`;
        } catch (e) {}

        const rawValue = (value as string) || "";
        let displayValue = rawValue;
        if (callingCode && rawValue.startsWith(callingCode)) {
          displayValue = rawValue.slice(callingCode.length);
        }

        let phoneError = error;
        if (displayValue) {
          if (countryCode === "IN") {
            if (!/^[6-9]/.test(displayValue)) {
              phoneError = "Mobile number must start with 6, 7, 8, or 9";
            } else if (displayValue.length !== 10) {
              phoneError = "Mobile number must be exactly 10 digits";
            }
          }
          if (!phoneError) {
            try {
              if (!isValidPhoneNumber(displayValue, countryCode)) {
                phoneError = `Enter a valid mobile number for ${selectedCountryName}`;
              }
            } catch (e) {
              phoneError = `Enter a valid mobile number for ${selectedCountryName}`;
            }
          }
        }

        const handlePhoneChange = (newVal: string) => {
          let digits = newVal;
          if (digits.startsWith("+")) {
            digits = digits.replace(/\D/g, "");
            const currentCallingCodeDigits = callingCode.replace("+", "");
            if (digits.startsWith(currentCallingCodeDigits)) {
              digits = digits.slice(currentCallingCodeDigits.length);
            }
          } else {
            digits = digits.replace(/\D/g, "");
          }

          if (countryCode === "IN") {
            if (digits.startsWith("0")) {
              digits = digits.replace(/^0+/, "");
            }
            if (digits.length > 10) {
              digits = digits.slice(0, 10);
            }
          } else {
            if (digits.length > 0) {
              let validDigits = digits;
              while (
                validDigits.length > 0 &&
                validatePhoneNumberLength(validDigits, countryCode) === "TOO_LONG"
              ) {
                validDigits = validDigits.slice(0, -1);
              }
              digits = validDigits;
            }
          }

          onChange(field.name, digits ? `${callingCode}${digits}` : "");
        };

        const handleCountryChange = (newCountryValue: string) => {
          onChange("country", newCountryValue);
          onChange("state", "");
          onChange("district", "");
          
          const newCountryCode = (countries.find((c) => c.value === newCountryValue)?.code?.toUpperCase() || "IN") as CountryCode;
          let newCallingCode = "";
          try {
            newCallingCode = `+${getCountryCallingCode(newCountryCode)}`;
          } catch (e) {}

          let validDigits = displayValue.replace(/\D/g, "");
          if (newCountryCode === "IN") {
            if (validDigits.length > 10) {
              validDigits = validDigits.slice(0, 10);
            }
          } else {
            while (
              validDigits.length > 0 &&
              validatePhoneNumberLength(validDigits, newCountryCode) === "TOO_LONG"
            ) {
              validDigits = validDigits.slice(0, -1);
            }
          }

          onChange(field.name, validDigits ? `${newCallingCode}${validDigits}` : "");
        };

        const getFlagEmoji = (isoCode: string) => {
          if (!isoCode) return "";
          const codePoints = isoCode
            .toUpperCase()
            .split("")
            .map((char) => 127397 + char.charCodeAt(0));
          return String.fromCodePoint(...codePoints);
        };

        const countrySelect = (
          <InputAdornment position="start" sx={{ mr: 0, ml: -1 }}>
            <Select
              value={selectedCountryName}
              onChange={(e) => handleCountryChange(e.target.value)}
              variant="standard"
              disableUnderline
              sx={{
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  pl: 1,
                  pr: 3,
                  py: 1,
                  bgcolor: "transparent",
                  fontSize: "0.9rem",
                },
              }}
              MenuProps={{ slotProps: { paper: { style: { maxHeight: 300 } } } }}
            >
              {countries.map((c) => {
                let cc = "";
                try {
                  cc = getCountryCallingCode(c.code as CountryCode);
                } catch (e) {}
                return (
                  <MenuItem key={c.value} value={c.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>{getFlagEmoji(c.code)}</span>
                      <span>{cc ? `+${cc}` : ""}</span>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </InputAdornment>
        );

        return wrap(
          <TextField
            fullWidth
            size="small"
            label={labelWithFlag(field)}
            type="tel"
            value={displayValue}
            onChange={(e) => handlePhoneChange(e.target.value)}
            error={!!phoneError}
            helperText={phoneError ?? field.helper}
            sx={inputSx}
            slotProps={{
              input: { startAdornment: countrySelect },
            }}
          />
        );
      }

      case "email":
      default: {
        const isEmailField =
          field.type === "email" ||
          field.name.toLowerCase() === "email" ||
          field.name.toLowerCase() === "email_address";

        if (isEmailField) {
          const applicantName =
            ((values.full_name || values.name || values.first_name) as string) || "";
          return wrap(
            <EmailVerificationField
              label={field.label}
              placeholder={field.placeholder || "name@example.com"}
              value={(value as string) ?? ""}
              error={error}
              helperText={field.helper}
              required={field.required}
              applicantName={applicantName}
              themeColor={theme.color}
              inputSx={inputSx}
              onChange={(newVal) => onChange(field.name, newVal)}
              onVerified={(verifiedEmail) => {
                onChange(field.name, verifiedEmail);
                if (onEmailVerified) onEmailVerified(verifiedEmail);
                // Automatically focus next interactive field in the form
                setTimeout(() => {
                  try {
                    const selector = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])';
                    const allInputs = Array.from(document.querySelectorAll(selector));
                    const currentIdx = allInputs.findIndex((el) => (el as HTMLInputElement).value === verifiedEmail);
                    if (currentIdx >= 0 && currentIdx < allInputs.length - 1) {
                      (allInputs[currentIdx + 1] as HTMLElement).focus();
                    }
                  } catch {
                    // Ignore DOM focus errors
                  }
                }, 100);
              }}
              isPreVerified={isEmailPreVerified}
            />
          );
        }

        const isPincode = field.name.toLowerCase().includes("pincode");
        const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          let val = e.target.value;
          if (isPincode) {
            val = val.replace(/\D/g, "");
            if (val.length > 6) val = val.slice(0, 6);
          }
          onChange(field.name, val);
        };

        return wrap(
          <TextField
            fullWidth
            size="small"
            type={field.type === "number" && !isPincode ? "number" : "text"}
            label={labelWithFlag(field)}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={handleTextChange}
            error={!!error}
            helperText={error ?? field.helper}
            sx={inputSx}
          />
        );
      }
    }
  };

  const [activeTabId, setActiveTabId] = useState<string>(
    schema.sections.find(s => s.id !== "common")?.id || ""
  );

  const commonSection = schema.sections.find(s => s.id === "common");
  const tabSections = schema.sections.filter(s => s.id !== "common");

  // Ensure active tab is valid
  if (tabSections.length > 0 && !tabSections.find(s => s.id === activeTabId)) {
    setActiveTabId(tabSections[0].id);
  }

  const renderSection = (section: any) => {
    const SectionIcon = resolveIcon(section.icon);
    return (
      <Box
        key={section.id}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: RADIUS.md,
          overflow: "hidden",
          bgcolor: "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 2,
            py: 1.25,
            bgcolor: theme.bg,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <SectionIcon sx={{ color: theme.color, fontSize: 20 }} />
          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
            {section.title}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            display: "grid",
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            columnGap: 2,
            rowGap: 2.5,
          }}
        >
          {section.fields.map(renderField)}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {commonSection && renderSection(commonSection)}
      
      {tabSections.length === 1 && !commonSection && renderSection(tabSections[0])}
      
      {(tabSections.length > 1 || (tabSections.length === 1 && commonSection)) && (
        <Box sx={{ border: "1px solid #e2e8f0", borderRadius: RADIUS.md, bgcolor: "#fff", overflow: "hidden" }}>
          <Tabs
            value={activeTabId}
            onChange={(e, val) => setActiveTabId(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              bgcolor: theme.bg,
              borderBottom: `1px solid ${theme.border}`,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, color: "#64748b", minHeight: 48 },
              "& .Mui-selected": { color: `${theme.color} !important` },
              "& .MuiTabs-indicator": { backgroundColor: theme.color },
            }}
          >
            {tabSections.map(section => (
              <Tab key={section.id} value={section.id} label={section.title} />
            ))}
          </Tabs>
          
          {tabSections.map(section => (
            <Box
              key={section.id}
              role="tabpanel"
              hidden={activeTabId !== section.id}
              sx={{ display: activeTabId === section.id ? "block" : "none" }}
            >
              {activeTabId === section.id && (
                <Box
                  sx={{
                    p: 2,
                    display: "grid",
                    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                    columnGap: 2,
                    rowGap: 2.5,
                  }}
                >
                  {section.fields.map(renderField)}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
