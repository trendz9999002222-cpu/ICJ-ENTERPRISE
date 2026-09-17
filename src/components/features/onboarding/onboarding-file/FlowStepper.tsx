"use client";

import CheckIcon from "@mui/icons-material/Check";
import { Box, Container, Typography } from "@mui/material";

import { getStepMeta } from "@/lib/registrationClient";
import type { StepId } from "@/types/registration";

import { RADIUS } from "./iconMap";

type Props = {
  steps: StepId[];
  currentIndex: number;
  maxReachedIndex: number;
  /** Live values shown under a step label, e.g. { category: "Legal & Court" } */
  selections: Partial<Record<StepId, string>>;
  accent: string;
  onStepClick: (index: number) => void;
};

export default function FlowStepper({
  steps,
  currentIndex,
  maxReachedIndex,
  selections,
  accent,
  onStepClick,
}: Props) {
  return (
    <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 }}>
      <Container maxWidth="xl" sx={{ py: { xs: 1.75, md: 2.25 }, overflowX: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", minWidth: { xs: 140 * steps.length, lg: 0 } }}>
          {steps.map((stepId, idx) => {
            const meta = getStepMeta(stepId);
            const isActive = idx === currentIndex;
            const isDone = idx < currentIndex;
            const clickable = idx <= maxReachedIndex;
            const chosen = selections[stepId];

            return (
              <Box
                key={stepId}
                sx={{ display: "flex", alignItems: "flex-start", flex: idx === steps.length - 1 ? "0 0 auto" : 1 }}
              >
                <Box
                  component={clickable ? "button" : "div"}
                  type={clickable ? "button" : undefined}
                  onClick={clickable ? () => onStepClick(idx) : undefined}
                  aria-current={isActive ? "step" : undefined}
                  sx={{
                    all: "unset",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.1,
                    cursor: clickable ? "pointer" : "default",
                    borderRadius: RADIUS.sm,
                    px: 0.25,
                    "&:focus-visible": { outline: `2px solid ${accent}`, outlineOffset: 3 },
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      mt: "1px",
                      flexShrink: 0,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      bgcolor: isDone ? "#15803d" : isActive ? accent : "#e2e8f0",
                      color: isDone || isActive ? "#fff" : "#64748b",
                      boxShadow: isActive ? `0 0 0 4px ${accent}22` : "none",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {isDone ? <CheckIcon sx={{ fontSize: 17 }} /> : idx + 1}
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.76rem", md: "0.83rem" },
                        color: isActive ? accent : "#0f172a",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {meta.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        color: chosen ? "#15803d" : "#94a3b8",
                        fontWeight: chosen ? 600 : 400,
                        whiteSpace: "nowrap",
                        maxWidth: 150,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {chosen ?? meta.subtitle}
                    </Typography>
                  </Box>
                </Box>

                {idx < steps.length - 1 && (
                  <Box
                    sx={{
                      flex: 1,
                      height: 2,
                      mt: "14px",
                      mx: 1.25,
                      minWidth: 20,
                      bgcolor: idx < currentIndex ? "#15803d" : "#e2e8f0",
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
