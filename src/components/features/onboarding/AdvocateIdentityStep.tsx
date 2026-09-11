"use client";

import ApartmentIcon from "@mui/icons-material/Apartment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import AccentIconBox from "@/components/ui/AccentIconBox";
import {
  type AdvocateIdentityFormData,
  ENTITY_TYPE_OPTIONS,
  ESTABLISHMENT_YEAR_OPTIONS,
  GENDER_OPTIONS,
  PREFIX_OPTIONS,
  YEAR_OF_BIRTH_OPTIONS,
} from "@/constants/onboarding";
import { RADIUS, SHADOW, TRANSITION, actionButtonSx } from "@/theme/designTokens";

type Props = {
  data: AdvocateIdentityFormData;
  onChange: (updates: Partial<AdvocateIdentityFormData>) => void;
  onBack: () => void;
  onProceed: () => void;
};

export default function AdvocateIdentityStep({ data, onChange, onBack, onProceed }: Props) {
  const [error, setError] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.applicantType === "individual") {
      if (!data.firstName.trim()) {
        setError("पहला नाम दर्ज करना अनिवार्य है (First Name is required).");
        return;
      }
    } else {
      if (!data.orgName.trim()) {
        setError("संस्था / फर्म का नाम दर्ज करना अनिवार्य है (Firm / Organization name is required).");
        return;
      }
      if (!data.authPersonName.trim()) {
        setError("अधिकृत प्रतिनिधि का नाम दर्ज करना अनिवार्य है (Authorized representative name is required).");
        return;
      }
    }

    setError("");
    onProceed();
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: RADIUS.xl,
          bgcolor: "#fff",
          border: "1px solid #e2e8f0",
          boxShadow: SHADOW.card,
        }}
      >
        {/* Card Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { xs: "flex-start", sm: "center" }, mb: 3.5 }}
        >
          <AccentIconBox color="#1d4ed8" bg="#dbeafe">
            <ShieldOutlinedIcon sx={{ color: "#1d4ed8", fontSize: 28 }} />
          </AccentIconBox>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                fontSize: { xs: "1.15rem", md: "1.35rem" },
                letterSpacing: "-0.01em",
              }}
            >
              1. आवेदक की पहचान एवं नाम (Applicant Identity)
            </Typography>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.75, flexWrap: "wrap" }}>
              <Typography sx={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 700 }}>
                चयनित भूमिका:
              </Typography>
              <Chip
                label="2. अधिवक्ता व विशेषज्ञ पैनल (Advocate Partner)"
                size="small"
                sx={{
                  bgcolor: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  borderRadius: RADIUS.sm,
                  border: "1px solid #bfdbfe",
                }}
              />
            </Stack>
          </Box>
        </Stack>

        {/* Applicant Type Selection (Individual vs Organisation / Firm) */}
        <Grid container spacing={2} sx={{ mb: 3.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              onClick={() => {
                setError("");
                onChange({ applicantType: "individual" });
              }}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: RADIUS.md,
                cursor: "pointer",
                border: `2px solid ${data.applicantType === "individual" ? "#2563eb" : "#e2e8f0"}`,
                bgcolor: data.applicantType === "individual" ? "#eff6ff" : "#fff",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                transition: TRANSITION.fast,
                "&:hover": { borderColor: "#2563eb", transform: "translateY(-1px)" },
              }}
            >
              <Radio
                checked={data.applicantType === "individual"}
                sx={{ p: 0, color: "#2563eb", "&.Mui-checked": { color: "#2563eb" } }}
              />
              <PersonOutlinedIcon sx={{ color: data.applicantType === "individual" ? "#2563eb" : "#64748b" }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  color: data.applicantType === "individual" ? "#1e3a8a" : "#334155",
                  fontSize: "0.95rem",
                }}
              >
                Individual (व्यक्तिगत)
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              onClick={() => {
                setError("");
                onChange({ applicantType: "organisation" });
              }}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: RADIUS.md,
                cursor: "pointer",
                border: `2px solid ${data.applicantType === "organisation" ? "#2563eb" : "#e2e8f0"}`,
                bgcolor: data.applicantType === "organisation" ? "#eff6ff" : "#fff",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                transition: TRANSITION.fast,
                "&:hover": { borderColor: "#2563eb", transform: "translateY(-1px)" },
              }}
            >
              <Radio
                checked={data.applicantType === "organisation"}
                sx={{ p: 0, color: "#2563eb", "&.Mui-checked": { color: "#2563eb" } }}
              />
              <ApartmentIcon sx={{ color: data.applicantType === "organisation" ? "#2563eb" : "#64748b" }} />
              <Typography
                sx={{
                  fontWeight: 800,
                  color: data.applicantType === "organisation" ? "#1e3a8a" : "#334155",
                  fontSize: "0.95rem",
                }}
              >
                Organisation / Firm (फर्म / संस्था)
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: RADIUS.sm, fontWeight: 700 }}>
            {error}
          </Alert>
        )}

        {/* Form Body */}
        <Box component="form" onSubmit={handleNext}>
          {data.applicantType === "individual" ? (
            <Stack spacing={3}>
              {/* Row 1: Prefix, First Name, Middle Name, Last Name */}
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="prefix-select-label">Prefix / उपाधि</InputLabel>
                    <Select
                      labelId="prefix-select-label"
                      label="Prefix / उपाधि"
                      value={data.prefix}
                      onChange={(e) => onChange({ prefix: e.target.value })}
                      sx={{ borderRadius: RADIUS.sm }}
                    >
                      {PREFIX_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    required
                    label="First Name (पहला नाम) *"
                    placeholder="पहला नाम दर्ज करें"
                    value={data.firstName}
                    onChange={(e) => {
                      onChange({ firstName: e.target.value });
                      if (error) setError("");
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Middle Name (मध्य नाम)"
                    placeholder="मध्य नाम (वैकल्पिक)"
                    value={data.middleName}
                    onChange={(e) => onChange({ middleName: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Last Name (उपनाम)"
                    placeholder="उपनाम दर्ज करें"
                    value={data.lastName}
                    onChange={(e) => onChange({ lastName: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm } }}
                  />
                </Grid>
              </Grid>

              {/* Row 2: Gender, Year of Birth */}
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="gender-select-label">Gender (लिंग)</InputLabel>
                    <Select
                      labelId="gender-select-label"
                      label="Gender (लिंग)"
                      value={data.gender}
                      onChange={(e) => onChange({ gender: e.target.value })}
                      sx={{ borderRadius: RADIUS.sm }}
                    >
                      {GENDER_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="year-select-label">Year of Birth (जन्म वर्ष)</InputLabel>
                    <Select
                      labelId="year-select-label"
                      label="Year of Birth (जन्म वर्ष)"
                      value={data.yearOfBirth}
                      onChange={(e) => onChange({ yearOfBirth: e.target.value })}
                      sx={{ borderRadius: RADIUS.sm }}
                      MenuProps={{
                        slotProps: {
                          paper: {
                            sx: { maxHeight: 320, borderRadius: RADIUS.sm },
                          },
                        },
                      }}
                    >
                      {YEAR_OF_BIRTH_OPTIONS.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Stack>
          ) : (
            <Stack spacing={3}>
              {/* Row 1: Org Name, Entity Type */}
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <TextField
                    fullWidth
                    required
                    label="Organisation / Firm Name (फर्म / संस्था का नाम) *"
                    placeholder="e.g. Lex Juris Law Firm & Associates"
                    value={data.orgName}
                    onChange={(e) => {
                      onChange({ orgName: e.target.value });
                      if (error) setError("");
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  <FormControl fullWidth>
                    <InputLabel id="org-type-label">Entity Type (संस्था का प्रकार)</InputLabel>
                    <Select
                      labelId="org-type-label"
                      label="Entity Type (संस्था का प्रकार)"
                      value={data.entityType}
                      onChange={(e) => onChange({ entityType: e.target.value })}
                      sx={{ borderRadius: RADIUS.sm }}
                    >
                      {ENTITY_TYPE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Row 2: Authorized Signatory, Establishment Year */}
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 7 }}>
                  <TextField
                    fullWidth
                    required
                    label="Authorized Advocate / Representative (अधिकृत अधिवक्ता / प्रतिनिधि) *"
                    placeholder="e.g. Adv. Manvendra Singh"
                    value={data.authPersonName}
                    onChange={(e) => {
                      onChange({ authPersonName: e.target.value });
                      if (error) setError("");
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                  <FormControl fullWidth>
                    <InputLabel id="est-year-label">Year of Establishment (स्थापना वर्ष)</InputLabel>
                    <Select
                      labelId="est-year-label"
                      label="Year of Establishment (स्थापना वर्ष)"
                      value={data.estYear}
                      onChange={(e) => onChange({ estYear: e.target.value })}
                      sx={{ borderRadius: RADIUS.sm }}
                      MenuProps={{
                        slotProps: {
                          paper: {
                            sx: { maxHeight: 320, borderRadius: RADIUS.sm },
                          },
                        },
                      }}
                    >
                      {ESTABLISHMENT_YEAR_OPTIONS.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Stack>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Navigation Buttons matching reference */}
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
              sx={{
                color: "#475569",
                borderColor: "#cbd5e1",
                fontWeight: 800,
                borderRadius: RADIUS.sm,
                px: 3,
                py: 1.2,
                textTransform: "none",
                "&:hover": { borderColor: "#94a3b8", bgcolor: "#f1f5f9" },
              }}
            >
              ← पीछे जाएं (Back)
            </Button>

            <Button
              type="submit"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                ...actionButtonSx("#2563eb"),
                px: 4,
                py: 1.2,
                fontSize: "0.95rem",
              }}
            >
              आगे बढ़ें (Next) →
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
