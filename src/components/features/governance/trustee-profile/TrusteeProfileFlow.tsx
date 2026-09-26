"use client";

import { useMemo, useState } from "react";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { TRUSTEE_PROFILE_SECTIONS, TRUSTEE_STEP_IDS } from "@/config/governance/trusteeProfileSections";
import { TRUSTEE_PROFILE_STEPS } from "@/constants/governance/trusteeProfileMasterData";
import {
  INITIAL_TRUSTEE_PROFILE_STATE,
  type TrusteeProfileFormState,
  type TrusteeProfileStepId,
} from "@/types/governance/trusteeProfile";

import TrusteeProfileFields from "./TrusteeProfileFields";
import TrusteeProfileStepper from "./TrusteeProfileStepper";

const ACCENT = "#7c3aed";

type Props = {
  onClose: () => void;
};

function formatNow() {
  return new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function TrusteeProfileFlow({ onClose }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [state, setState] = useState<TrusteeProfileFormState>(INITIAL_TRUSTEE_PROFILE_STATE);
  const [submitted, setSubmitted] = useState(false);
  const [systemMeta, setSystemMeta] = useState({
    governingBodyMemberId: "—",
    createdDate: "—",
    createdBy: "Public intake (frontend)",
    lastUpdatedDate: "—",
    lastUpdatedBy: "—",
    verificationDate: "",
    verifiedBy: "",
    recordStatus: "Draft",
  });

  const currentStepId = TRUSTEE_STEP_IDS[stepIndex];
  const section = TRUSTEE_PROFILE_SECTIONS.find((s) => s.id === currentStepId);
  const stepMeta = TRUSTEE_PROFILE_STEPS.find((s) => s.id === currentStepId);

  const heading = useMemo((): Record<TrusteeProfileStepId, { title: string; subtitle: string }> => {
    const map = {} as Record<TrusteeProfileStepId, { title: string; subtitle: string }>;
    TRUSTEE_PROFILE_STEPS.forEach((s) => {
      map[s.id] = { title: s.title, subtitle: s.subtitle };
    });
    return map;
  }, []);

  const goTo = (index: number) => {
    setStepIndex(index);
    setMaxReached((m) => Math.max(m, index));
  };

  const handleNext = () => {
    if (stepIndex < TRUSTEE_STEP_IDS.length - 1) goTo(stepIndex + 1);
  };

  const handleSubmit = () => {
    const now = formatNow();
    const memberId = `GBM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
    setSystemMeta({
      governingBodyMemberId: memberId,
      createdDate: now,
      createdBy: "Public intake (frontend)",
      lastUpdatedDate: now,
      lastUpdatedBy: "Public intake (frontend)",
      verificationDate: "",
      verifiedBy: "",
      recordStatus: "Pending Verification",
    });
    setState((prev) => ({
      ...prev,
      trusteeSystemId: memberId,
    }));
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <Box sx={{ bgcolor: "#f8fafc", borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={onClose} aria-label="Close trustee profile form">
            <CloseIcon />
          </IconButton>
        </Box>
        <Container maxWidth="md" sx={{ py: 6, textAlign: "center" }}>
          <CheckCircleIcon sx={{ fontSize: 56, color: "#059669", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}>
            Governing Body / Trustee Profile captured (preview)
          </Typography>
          <Typography sx={{ color: "#64748b", mb: 3 }}>
            Frontend-only draft — no API submission yet. Reference for your master person / governance record.
          </Typography>
          <Paper variant="outlined" sx={{ p: 2.5, display: "inline-block", textAlign: "left", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
              Governing Body Member ID
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: ACCENT }}>
              {systemMeta.governingBodyMemberId}
            </Typography>
          </Paper>
          <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: "center" }}>
            <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none" }}>
              Back to Membership
            </Button>
            <Button
              onClick={() => {
                setSubmitted(false);
                setStepIndex(0);
                setMaxReached(0);
                setState(INITIAL_TRUSTEE_PROFILE_STATE);
              }}
              variant="contained"
              sx={{ textTransform: "none", bgcolor: ACCENT, "&:hover": { bgcolor: "#6d28d9" } }}
            >
              Start another profile
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          bgcolor: "#fff",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>
          Governing Body / Trustee Profile
        </Typography>
        <IconButton onClick={onClose} aria-label="Close trustee profile form">
          <CloseIcon />
        </IconButton>
      </Box>

      <TrusteeProfileStepper
        steps={TRUSTEE_STEP_IDS}
        currentIndex={stepIndex}
        maxReachedIndex={maxReached}
        accent={ACCENT}
        onStepClick={goTo}
      />

      <Container
        maxWidth={false}
        sx={{ maxWidth: 1536, mx: "auto", py: 3, px: { xs: 2, sm: 3, md: 4 } }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>{heading[currentStepId]?.title}</Typography>
        <Typography sx={{ color: "#64748b", fontSize: "0.88rem", mb: 2 }}>{heading[currentStepId]?.subtitle}</Typography>

        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Master data is loaded from centralized frontend config ({stepMeta?.title}). Backend validation and API wiring
          can be added later without restructuring this wizard.
        </Alert>

        {section && (
          <TrusteeProfileFields
            fields={section.fields}
            state={state}
            systemMeta={systemMeta}
            onPatch={(patch) => setState((prev) => ({ ...prev, ...patch }))}
          />
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4, justifyContent: "space-between" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            disabled={stepIndex === 0}
            onClick={() => goTo(stepIndex - 1)}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            endIcon={currentStepId === "system" ? undefined : <ArrowForwardIcon />}
            onClick={currentStepId === "system" ? handleSubmit : handleNext}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: ACCENT,
              "&:hover": { bgcolor: "#6d28d9" },
              px: 3,
            }}
          >
            {currentStepId === "system" ? "Save profile (preview)" : "Continue"}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
