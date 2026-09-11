"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { Button, Divider, Stack } from "@mui/material";
import { RADIUS, actionButtonSx } from "@/theme/designTokens";

interface Props {
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isSubmitting?: boolean;
  isFinalStep?: boolean;
  roleColor?: string;
  disableNext?: boolean;
}

export default function FormNavigation({
  onBack,
  onNext,
  nextLabel,
  backLabel = "← पीछे जाएं (Back)",
  isSubmitting = false,
  isFinalStep = false,
  roleColor = "#2563eb",
  disableNext = false,
}: Props) {
  const defaultNextLabel = isFinalStep
    ? "आवेदन जमा करें (Submit Application) ✓"
    : "आगे बढ़ें (Continue) →";

  return (
    <>
      <Divider sx={{ my: 4, borderColor: "#e2e8f0" }} />
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          type="button"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          disabled={isSubmitting}
          sx={{
            color: "#475569",
            borderColor: "#cbd5e1",
            fontWeight: 800,
            borderRadius: RADIUS.sm,
            px: { xs: 2.5, sm: 3 },
            py: 1.2,
            textTransform: "none",
            "&:hover": { borderColor: "#94a3b8", bgcolor: "#f1f5f9" },
          }}
        >
          {backLabel}
        </Button>

        <Button
          type="submit"
          variant="contained"
          onClick={onNext}
          disabled={disableNext || isSubmitting}
          endIcon={isFinalStep ? <CheckCircleOutlinedIcon /> : <ArrowForwardIcon />}
          sx={{
            ...actionButtonSx(roleColor),
            px: { xs: 3, sm: 4 },
            py: 1.25,
            fontSize: "0.95rem",
            borderRadius: RADIUS.sm,
          }}
        >
          {nextLabel || defaultNextLabel}
        </Button>
      </Stack>
    </>
  );
}
