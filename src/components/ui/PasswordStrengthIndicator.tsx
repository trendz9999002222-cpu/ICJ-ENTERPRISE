"use dynamic";
"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  LinearProgress,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import SecurityIcon from "@mui/icons-material/Security";

export function generateStrongPassword(length = 14): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "@#$!%*?&";
  const allChars = upper + lower + digits + special;

  const sample = [
    upper[Math.floor(Math.random() * upper.length)],
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  while (sample.length < length) {
    sample.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  for (let i = sample.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sample[i], sample[j]] = [sample[j], sample[i]];
  }

  return sample.join("");
}

export interface PasswordRule {
  id: string;
  label: string;
  hint: string;
  test: (pwd: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "uppercase",
    label: "Uppercase letter",
    hint: "A-Z",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: "lowercase",
    label: "Lowercase letter",
    hint: "a-z",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    id: "number",
    label: "Number",
    hint: "0-9",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    id: "special",
    label: "Special character",
    hint: "@ # $ ! % * ? &",
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;]/.test(pwd),
  },
  {
    id: "length",
    label: "Minimum length",
    hint: "8+ characters",
    test: (pwd) => pwd.length >= 8,
  },
];

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword?: string;
  onSuggest?: (suggested: string) => void;
  showAlways?: boolean;
}

export default function PasswordStrengthIndicator({
  password,
  confirmPassword,
  onSuggest,
  showAlways = true,
}: PasswordStrengthIndicatorProps) {
  const [copied, setCopied] = useState(false);
  const [lastSuggested, setLastSuggested] = useState<string | null>(null);

  const passedRules = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password || ""),
  }));

  const passedCount = passedRules.filter((r) => r.passed).length;
  const isStarted = Boolean(password && password.length > 0);

  let strengthLabel = "Weak";
  let strengthColor = "#ef4444"; // red
  let progressValue = 20;

  if (passedCount <= 1) {
    strengthLabel = "Weak";
    strengthColor = "#ef4444";
    progressValue = 20;
  } else if (passedCount === 2 || passedCount === 3) {
    strengthLabel = "Fair";
    strengthColor = "#f59e0b"; // amber
    progressValue = 60;
  } else if (passedCount === 4) {
    strengthLabel = "Good";
    strengthColor = "#3b82f6"; // blue
    progressValue = 80;
  } else if (passedCount === 5) {
    strengthLabel = "Strong & Secure";
    strengthColor = "#10b981"; // emerald green
    progressValue = 100;
  }

  const handleSuggest = () => {
    const generated = generateStrongPassword(14);
    setLastSuggested(generated);
    if (onSuggest) {
      onSuggest(generated);
    }
  };

  const handleCopy = () => {
    const textToCopy = password || lastSuggested;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasConfirm = typeof confirmPassword === "string";
  const passwordsMatch = hasConfirm && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = hasConfirm && confirmPassword.length > 0 && password !== confirmPassword;

  if (!showAlways && !isStarted) return null;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "#f8fafc",
        border: "1px solid #e2e8f0",
        mt: 1,
        mb: 1.5,
      }}
    >
      {/* Top Header with Suggest Button */}
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 1.5,
        }}
      >
        <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
          <SecurityIcon sx={{ fontSize: 18, color: isStarted ? strengthColor : "#64748b" }} />
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>
            Password Policy Requirements
          </Typography>
        </Stack>

        {onSuggest && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
            onClick={handleSuggest}
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "none",
              py: 0.4,
              px: 1.2,
              borderRadius: 1.5,
              borderColor: "#7c3aed",
              color: "#7c3aed",
              bgcolor: "rgba(124, 58, 237, 0.04)",
              "&:hover": {
                bgcolor: "rgba(124, 58, 237, 0.1)",
                borderColor: "#6d28d9",
              },
            }}
          >
            Suggest Strong Password
          </Button>
        )}
      </Stack>

      {/* Suggested Password Notice Banner */}
      {lastSuggested && lastSuggested === password && (
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.5,
            py: 0.75,
            mb: 1.5,
            bgcolor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: 1.5,
          }}
        >
          <Typography sx={{ fontSize: "0.78rem", color: "#065f46", fontWeight: 600 }}>
            ✨ Strong password applied! (Uppercase, lowercase, numbers & special characters)
          </Typography>
          <Tooltip title={copied ? "Copied to clipboard!" : "Copy generated password"}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: "#059669", p: 0.25 }}>
              {copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      {/* Strength Progress Meter */}
      {isStarted && (
        <Box sx={{ mb: 1.5 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
            <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
              Password Strength:
            </Typography>
            <Chip
              size="small"
              label={strengthLabel}
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: 700,
                bgcolor: `${strengthColor}18`,
                color: strengthColor,
                border: `1px solid ${strengthColor}40`,
              }}
            />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#e2e8f0",
              "& .MuiLinearProgress-bar": {
                bgcolor: strengthColor,
                borderRadius: 3,
                transition: "all 0.3s ease",
              },
            }}
          />
        </Box>
      )}

      {/* Requirements Checklist */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 0.8,
        }}
      >
        {passedRules.map((r) => {
          const isPassed = isStarted && r.passed;
          return (
            <Stack
              key={r.id}
              direction="row"
              spacing={0.75}
              sx={{
                alignItems: "center",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: isPassed ? "#f0fdf4" : "#ffffff",
                border: isPassed ? "1px solid #bbf7d0" : "1px solid #f1f5f9",
                transition: "all 0.2s ease",
              }}
            >
              {isPassed ? (
                <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a" }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
              )}
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: isPassed ? 700 : 500,
                  color: isPassed ? "#15803d" : "#475569",
                }}
              >
                {r.label}{" "}
                <Typography component="span" sx={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 400 }}>
                  ({r.hint})
                </Typography>
              </Typography>
            </Stack>
          );
        })}
      </Box>

      {/* Confirm Password Status Indicator */}
      {hasConfirm && confirmPassword.length > 0 && (
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: "center",
            mt: 1.25,
            px: 1.25,
            py: 0.5,
            borderRadius: 1,
            bgcolor: passwordsMatch ? "#f0fdf4" : "#fef2f2",
            border: passwordsMatch ? "1px solid #bbf7d0" : "1px solid #fecaca",
          }}
        >
          {passwordsMatch ? (
            <>
              <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a" }} />
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d" }}>
                Passwords match
              </Typography>
            </>
          ) : (
            <>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#dc2626" }}>
                ⚠ Passwords do not match yet
              </Typography>
            </>
          )}
        </Stack>
      )}
    </Box>
  );
}
