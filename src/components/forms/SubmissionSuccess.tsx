"use client";

import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HomeIcon from "@mui/icons-material/Home";
import PrintIcon from "@mui/icons-material/Print";
import { Box, Button, Chip, Container, Divider, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { ONBOARDING_ROLES, type OnboardingRole } from "@/constants/onboarding";
import { RADIUS, SHADOW, actionButtonSx } from "@/theme/designTokens";

interface Props {
  role: OnboardingRole;
  applicantName: string;
  referenceId: string;
  onReset: () => void;
}

export default function SubmissionSuccess({ role, applicantName, referenceId, onReset }: Props) {
  const roleConfig = ONBOARDING_ROLES.find((r) => r.id === role) || ONBOARDING_ROLES[0];

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5, md: 6 },
          borderRadius: RADIUS.xl,
          bgcolor: "#fff",
          border: "1px solid #e2e8f0",
          boxShadow: SHADOW.cardHover,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            bgcolor: "#dcfce7",
            color: "#15803d",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.25)",
          }}
        >
          <CheckCircleOutlinedIcon sx={{ fontSize: 44 }} />
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: "#0f172a",
            fontSize: { xs: "1.4rem", sm: "1.85rem", md: "2.1rem" },
            letterSpacing: "-0.02em",
            mb: 1,
          }}
        >
          आवेदन सफलतापूर्वक प्राप्त हुआ!
        </Typography>

        <Typography sx={{ color: "#64748b", fontSize: "1rem", mb: 3 }}>
          Application Successfully Submitted to ICJ Enterprise Legal Infrastructure
        </Typography>

        <Chip
          label={`भूमिका: ${roleConfig.titleHi} (${roleConfig.titleEn})`}
          sx={{
            bgcolor: roleConfig.bg,
            color: roleConfig.chipBg,
            fontWeight: 800,
            fontSize: "0.85rem",
            px: 1.5,
            py: 0.5,
            borderRadius: RADIUS.sm,
            mb: 4,
          }}
        />

        {/* Reference ID Box */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: RADIUS.md,
            bgcolor: "#f8fafc",
            border: "1.5px dashed #cbd5e1",
            maxWidth: 460,
            mx: "auto",
            mb: 4,
          }}
        >
          <Typography sx={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 700, mb: 0.5 }}>
            आवेदन संदर्भ संख्या (Application Reference ID)
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.3rem", sm: "1.6rem" },
              color: "#1d4ed8",
              letterSpacing: "0.06em",
              fontFamily: "monospace",
            }}
          >
            {referenceId}
          </Typography>
          <Typography sx={{ color: "#475569", fontSize: "0.82rem", mt: 1 }}>
            आवेदक: <strong>{applicantName}</strong> • कृपया भविष्य के संदर्भ हेतु यह संख्या नोट कर लें।
          </Typography>
        </Paper>

        {/* Next Steps Guide */}
        <Box sx={{ textAlign: "left", maxWidth: 540, mx: "auto", mb: 4 }}>
          <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "0.95rem", mb: 1.5 }}>
            आगे की प्रक्रिया (What Happens Next):
          </Typography>
          <Stack spacing={1.25}>
            <Typography sx={{ color: "#475569", fontSize: "0.88rem", display: "flex", gap: 1 }}>
              <span style={{ color: "#2563eb", fontWeight: 800 }}>1.</span>
              हमारे विधिक सत्यापन प्रकोष्ठ द्वारा आपके विवरण व दस्तावेज़ों की जांच की जाएगी।
            </Typography>
            <Typography sx={{ color: "#475569", fontSize: "0.88rem", display: "flex", gap: 1 }}>
              <span style={{ color: "#2563eb", fontWeight: 800 }}>2.</span>
              सत्यापन पूर्ण होने पर आपके पंजीकृत मोबाइल नंबर व ईमेल पर पुष्टि संदेश भेजा जाएगा।
            </Typography>
            <Typography sx={{ color: "#475569", fontSize: "0.88rem", display: "flex", gap: 1 }}>
              <span style={{ color: "#2563eb", fontWeight: 800 }}>3.</span>
              डिजिटल पहचान पत्र एवं पोर्टल एक्सेस क्रेडेंशियल्स 24–48 घंटे में सक्रिय कर दिए जाएंगे।
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "center", alignItems: "center" }}
        >
          <Button
            component={Link}
            href="/"
            variant="contained"
            startIcon={<HomeIcon />}
            sx={{
              ...actionButtonSx("#2563eb"),
              px: 3.5,
              py: 1.25,
              fontSize: "0.92rem",
              borderRadius: RADIUS.sm,
            }}
          >
            मुख्य पृष्ठ पर जाएं (Home)
          </Button>

          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              color: "#475569",
              borderColor: "#cbd5e1",
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              py: 1.25,
              borderRadius: RADIUS.sm,
            }}
          >
            रसीद प्रिंट करें (Print Slip)
          </Button>

          <Button
            variant="text"
            onClick={onReset}
            sx={{ color: "#64748b", fontWeight: 700, textTransform: "none" }}
          >
            नया आवेदन भरें (New Application)
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
