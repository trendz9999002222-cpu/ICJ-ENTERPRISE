"use client";

import CheckIcon from "@mui/icons-material/Check";
import { Box, Container, Typography } from "@mui/material";

import { TRUSTEE_PROFILE_STEPS } from "@/constants/governance/trusteeProfileMasterData";
import type { TrusteeProfileStepId } from "@/types/governance/trusteeProfile";

const RADIUS_SM = 10;

/** Min width per step so labels stay on one line; row scrolls horizontally on phone */
const STEP_LABEL_MIN_PX = 152;

type Props = {
  steps: TrusteeProfileStepId[];
  currentIndex: number;
  maxReachedIndex: number;
  accent: string;
  onStepClick: (index: number) => void;
};

export default function TrusteeProfileStepper({
  steps,
  currentIndex,
  maxReachedIndex,
  accent,
  onStepClick,
}: Props) {
  return (
    <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 }}>
      <Container
        maxWidth={false}
        sx={{
          maxWidth: 1536,
          mx: "auto",
          py: { xs: 1.5, md: 2 },
          px: { xs: 1.5, sm: 2, md: 3 },
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            width: "max-content",
            minWidth: "100%",
            gap: 0,
          }}
        >
          {steps.map((stepId, idx) => {
            const meta = TRUSTEE_PROFILE_STEPS.find((s) => s.id === stepId);
            const isActive = idx === currentIndex;
            const isDone = idx < currentIndex;
            const clickable = idx <= maxReachedIndex;

            return (
              <Box
                key={stepId}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  flex: "0 0 auto",
                  minWidth: STEP_LABEL_MIN_PX,
                }}
              >
                <Box
                  component={clickable ? "button" : "div"}
                  type={clickable ? "button" : undefined}
                  onClick={clickable ? () => onStepClick(idx) : undefined}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={meta?.title ?? `Step ${idx + 1}`}
                  sx={{
                    all: "unset",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    cursor: clickable ? "pointer" : "default",
                    borderRadius: RADIUS_SM,
                    px: 0.25,
                    "&:focus-visible": { outline: `2px solid ${accent}`, outlineOffset: 3 },
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      bgcolor: isDone ? "#15803d" : isActive ? accent : "#e2e8f0",
                      color: isDone || isActive ? "#fff" : "#64748b",
                    }}
                  >
                    {isDone ? <CheckIcon sx={{ fontSize: 16 }} /> : idx + 1}
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: isActive ? 700 : 600,
                      fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
                      color: isActive ? "#0f172a" : "#64748b",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {meta?.title ?? stepId}
                  </Typography>
                </Box>
                {idx < steps.length - 1 && (
                  <Box
                    sx={{
                      flex: "0 0 auto",
                      width: { xs: 12, sm: 16, md: 20 },
                      height: 2,
                      bgcolor: isDone ? "#15803d" : "#e2e8f0",
                      mt: 1.75,
                      mx: { xs: 0.25, sm: 0.5 },
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
