"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, Stack, Step, StepLabel, Stepper, Typography } from "@mui/material";

// =============================================================================
// StatusProgressBar
//
// Horizontal stepper that visualises onboarding / application progress.
// Accepts step labels and the active step index. Matches admin dashboard styling.
// =============================================================================

type StatusProgressBarProps = {
  /** Ordered step labels */
  steps: readonly string[];
  /** Zero-based index of the current step */
  activeStep: number;
  /** Is the overall flow approved / completed? */
  approved?: boolean;
  /** Optional status string — "rejected" shows error styling */
  status?: string;
  /** Optional helper message below the stepper */
  message?: string;
};

export default function StatusProgressBar({
  steps,
  activeStep,
  approved = false,
  status,
  message,
}: StatusProgressBarProps) {
  const bannerBg = approved
    ? "#f0fdf4"
    : status === "rejected"
      ? "#fef2f2"
      : "#fffbeb";
  const bannerBorder = approved
    ? "1px solid #bbf7d0"
    : status === "rejected"
      ? "1px solid #fecaca"
      : "1px solid #fde68a";
  const bannerColor = approved
    ? "#166534"
    : status === "rejected"
      ? "#991b1b"
      : "#92400e";

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, i) => (
          <Step key={label} completed={i < activeStep}>
            <StepLabel
              icon={
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: i <= activeStep ? "#2563eb" : "#e2e8f0",
                    display: "grid",
                    placeItems: "center",
                    color: "#ffffff",
                  }}
                >
                  {i < activeStep ? (
                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                  ) : i === activeStep ? (
                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                  )}
                </Box>
              }
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: i <= activeStep ? 700 : 500, color: "#0f172a" }}
              >
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {message && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: "8px",
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            bgcolor: bannerBg,
            border: bannerBorder,
          }}
        >
          {approved ? (
            <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20, mt: 0.2 }} />
          ) : (
            <HourglassTopIcon sx={{ color: "#d97706", fontSize: 20, mt: 0.2 }} />
          )}
          <Typography variant="body2" sx={{ fontWeight: 700, color: bannerColor }}>
            {message}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
