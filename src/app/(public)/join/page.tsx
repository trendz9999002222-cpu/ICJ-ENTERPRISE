"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ShieldIcon from "@mui/icons-material/Shield";
import VerifiedIcon from "@mui/icons-material/Verified";
import PrintIcon from "@mui/icons-material/Print";
import HeadsetIcon from "@mui/icons-material/Headset";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteIcon from "@mui/icons-material/Delete";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import PageHeader from "@/components/features/public/PageHeader";
import LegalDisclaimer from "@/components/features/public/LegalDisclaimer";
import EmailVerificationField from "@/components/ui/EmailVerificationField";
import PhoneInputWithCountry from "@/components/ui/PhoneInputWithCountry";
import { emailVerificationService } from "@/services/emailVerification.service";
import { membershipOnboardingPublicService } from "@/services/public/membershipOnboardingPublic.service";
import { loadEasebuzzCheckout } from "@/lib/easebuzz/loadEasebuzz";
import { env } from "@/config/env";

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to disclose",
];

const INDIAN_STATES = [
  "Delhi",
  "Maharashtra",
  "Uttar Pradesh",
  "Haryana",
  "Karnataka",
  "Tamil Nadu",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Punjab",
  "Bihar",
  "Madhya Pradesh",
  "Kerala",
  "Telangana",
  "Andhra Pradesh",
  "Other State / Union Territory",
];

const JOIN_DOCUMENT_SX = {
  // Completely eliminate 4-sided rounded boxes so inputs look like authentic paper forms
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none !important",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "0px !important",
    borderBottom: "1.5px solid #cbd5e1 !important",
    bgcolor: "transparent !important",
    paddingLeft: "0 !important",
    paddingRight: "0 !important",
    "&:hover": {
      borderBottom: "1.5px solid #0f2942 !important",
    },
    "&.Mui-focused": {
      borderBottom: "2px solid #0f2942 !important",
    },
  },
  // Underline standard input variant
  "& .MuiInput-underline:before": {
    borderBottom: "1.5px solid #cbd5e1 !important",
  },
  "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
    borderBottom: "1.5px solid #0f2942 !important",
  },
  "& .MuiInput-underline:after": {
    borderBottom: "2px solid #0f2942 !important",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.85rem !important",
    fontWeight: "700 !important",
    color: "#475569 !important",
    "&.Mui-focused": {
      color: "#0f2942 !important",
    },
  },
  "& .MuiInputBase-input": {
    fontSize: "0.925rem !important",
    fontWeight: "600 !important",
    color: "#0f172a !important",
    padding: "6px 0 7px !important",
  },
  "& .MuiSelect-standard": {
    display: "flex !important",
    alignItems: "center !important",
  },
};

export default function JoinPage() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "Male",
    date_of_birth: "1995-01-01",
    email: "",
    mobile_number: "",
    state_name: "Delhi",
    city_name: "New Delhi",
    pincode: "",
    address: "",
    password: "",
    confirm_password: "",
  });

  // Profile Picture / Passport Photograph
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(() => {
    return emailVerificationService.isEmailVerified(form.email);
  });
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(true);

  // Administrative Membership Fee & Payment
  const [membershipFee, setMembershipFee] = useState<{
    amount_inr: number;
    amount_paise: number;
    is_payment_enabled: boolean;
  }>({
    amount_inr: 499,
    amount_paise: 49900,
    is_payment_enabled: true,
  });
  const [paymentChoice, setPaymentChoice] = useState<"pay_now" | "skip">("pay_now");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReference, setSuccessReference] = useState<string | null>(null);
  const [successPaymentStatus, setSuccessPaymentStatus] = useState<"paid" | "unpaid">("paid");

  // Fetch admin configured membership fee on mount
  React.useEffect(() => {
    fetch(`${env.apiUrl}/membership-onboarding/payment-settings/`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const d = data?.data ?? data;
        if (d?.amount_inr !== undefined) {
          setMembershipFee({
            amount_inr: Number(d.amount_inr),
            amount_paise: d.amount_paise || Math.round(Number(d.amount_inr) * 100),
            is_payment_enabled: d.is_payment_enabled !== false,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Passport photograph must be under 5MB in size.");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (error) setError(null);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleFieldChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("Please enter your full first name and last name.");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    // Email verification check (using EmailJS)
    const verified = isEmailVerified || emailVerificationService.isEmailVerified(form.email);
    if (!verified) {
      setError("Please verify your email address. Click 'Send OTP' on the email field and enter the 6-digit code received via EmailJS.");
      return;
    }

    if (!form.mobile_number.trim()) {
      setError("Please enter your mobile phone number.");
      return;
    }
    if (!isPhoneValid) {
      setError("Please enter a valid mobile number with correct starting digits for your country.");
      return;
    }
    if (!form.password || form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (!declarationAccepted) {
      setError("Please affirm and accept the statutory membership declaration undertaking.");
      return;
    }

    setLoading(true);
    try {
      // Prepare multipart FormData
      const fd = new FormData();
      fd.append("first_name", form.first_name.trim());
      fd.append("last_name", form.last_name.trim());
      fd.append("email", form.email.trim().toLowerCase());
      fd.append("mobile_number", form.mobile_number.trim());
      fd.append("password", form.password);
      fd.append("gender", form.gender);
      fd.append("date_of_birth", form.date_of_birth);
      fd.append("state_name", form.state_name);
      fd.append("city_name", form.city_name.trim());
      fd.append("pincode", form.pincode.trim());
      fd.append("address", form.address.trim());

      if (photoFile) {
        fd.append("profile_picture", photoFile);
        fd.append("photo", photoFile);
      }

      const isPaid = paymentChoice === "pay_now";
      fd.append("fee_payment_status", "unpaid");
      fd.append("is_paid", "false");

      const res = await fetch(`${env.apiUrl}/auth/register/`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.detail ||
          data?.email?.[0] ||
          data?.mobile_number?.[0] ||
          "Registration failed. Please review your details and try again.";
        setError(msg);
        return;
      }

      // Store auth session cookie
      if (data?.access) {
        document.cookie = `icj_access_token=${data.access}; path=/; max-age=86400; SameSite=Lax`;
      }

      const returnedRef =
        data?.reference_id ||
        data?.data?.reference_id ||
        `APP-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      if (isPaid) {
        try {
          const order = await membershipOnboardingPublicService.createPaymentOrder({
            name: `${form.first_name} ${form.last_name}`.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.mobile_number.trim(),
            application_id: data?.application_id || data?.data?.application_id || "",
          });

          let easebuzzLoaded = false;
          try {
            await loadEasebuzzCheckout();
            easebuzzLoaded = typeof window !== "undefined" && Boolean(window.EasebuzzCheckout);
          } catch {
            easebuzzLoaded = false;
          }

          if (
            easebuzzLoaded &&
            order.access_key &&
            /^[a-z0-9]+$/i.test(order.access_key) &&
            window.EasebuzzCheckout
          ) {
            try {
              const easebuzz = new window.EasebuzzCheckout(order.key || "P2OTPKQ5X", order.env || "test");
              const options = {
                access_key: order.access_key,
                onResponse: async (response: any) => {
                  const statusStr = String(response?.status || "").toLowerCase();
                  if (statusStr === "success" || response?.status === 1) {
                    try {
                      await membershipOnboardingPublicService.verifyPayment({
                        payment_id: order.payment_id,
                        txnid: response.txnid || order.txnid,
                        status: "success",
                        easepayid: response.easepayid || "",
                        hash: response.hash || "",
                      });
                    } catch {
                      // ignore
                    }
                    setSuccessReference(returnedRef);
                    setSuccessPaymentStatus("paid");
                  } else {
                    setError(response?.error_Message || response?.error_desc || "Easebuzz payment cancelled or declined.");
                    setSuccessReference(returnedRef);
                    setSuccessPaymentStatus("unpaid");
                  }
                },
              };
              easebuzz.initiatePayment(options);
              return;
            } catch (sdkErr) {
              console.warn("Easebuzz SDK initiatePayment error, falling back to payment_url:", sdkErr);
              if (order.payment_url) {
                window.location.href = order.payment_url;
                return;
              }
            }
          } else if (order.payment_url) {
            window.location.href = order.payment_url;
            return;
          }
        } catch (payErr: any) {
          console.error("Easebuzz payment error:", payErr);
          setError(`Account enrolled, but payment gateway could not be loaded: ${payErr?.message || "Gateway error"}`);
        }
      }

      setSuccessReference(returnedRef);
      setSuccessPaymentStatus(isPaid ? "paid" : "unpaid");
    } catch (err: any) {
      setError(err?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "#f1f5f9", pb: 10 }}>
      <PageHeader
        badge="Official Institutional Registry"
        title="Join International Consortium of Jurists"
        subtitle="Universal member onboarding for legal practitioners, chartered professionals, legal scholars, and citizen advocates seeking institutional guild enrollment."
        breadcrumbs={[{ label: "Join ICJ" }]}
        primaryAction={{ label: "Already a Member? Login", href: "/auth/login" }}
      />

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 4 }}>
        {successReference ? (
          /* Official Acknowledgment Receipt */
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 2,
              border: "3px double #0f2942",
              bgcolor: "#ffffff",
              textAlign: "center",
              maxWidth: 720,
              mx: "auto",
              boxShadow: "0 12px 36px rgba(15,41,66,0.14)",
            }}
          >
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                bgcolor: "#f0fdf4",
                border: "2px solid #86efac",
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 38, color: "#16a34a" }} />
            </Box>

            <Typography
              sx={{
                fontFamily: "Georgia, serif",
                fontSize: { xs: "1.3rem", sm: "1.6rem" },
                fontWeight: 900,
                color: "#0f2942",
                mb: 0.5,
              }}
            >
              Welcome to ICJ — Enrollment Confirmed
            </Typography>

            <Typography variant="body2" sx={{ color: "#475569", mb: 2 }}>
              Your member account has been registered and verified under official registry seal:
            </Typography>

            <Box
              sx={{
                display: "inline-block",
                px: 3.5,
                py: 1.2,
                bgcolor: "#eff6ff",
                border: "2px dashed #1e40af",
                borderRadius: 2,
                color: "#1e3a8a",
                fontWeight: 900,
                fontSize: "1.35rem",
                letterSpacing: "0.06em",
                mb: 2,
              }}
            >
              {successReference}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Chip
                label={
                  successPaymentStatus === "paid"
                    ? `Statutory Membership Fee of ₹${membershipFee.amount_inr} Paid • Full Empanelment Access Unlocked`
                    : `Statutory Membership Fee (₹${membershipFee.amount_inr}) Pending • Empanelment Wings Locked Until Cleared`
                }
                color={successPaymentStatus === "paid" ? "success" : "warning"}
                sx={{ fontWeight: 800, fontSize: "0.8rem", px: 1 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 540, mx: "auto", mb: 4, lineHeight: 1.6 }}>
              {successPaymentStatus === "paid"
                ? "Your statutory membership fee has been logged and confirmed. You may immediately proceed to your Member Dashboard to apply for specialized wings (Legal, Other Professional, or Volunteer)."
                : "Your account is enrolled as a basic member. You may explore public features; specialized professional empanelment wings will remain locked until your statutory membership dues are cleared."}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
                sx={{ textTransform: "none", fontWeight: 700, color: "#0f2942", borderColor: "#0f2942" }}
              >
                Print Slip
              </Button>
              <Button
                onClick={() => router.push("/dashboard/member")}
                variant="contained"
                sx={{ bgcolor: "#0f2942", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#1e3a5f" } }}
              >
                Proceed to Member Dashboard
              </Button>
            </Stack>
          </Paper>
        ) : (
          /* SINGLE-STEP OFFICIAL PRINTABLE AFFIDAVIT FORM */
          <Box sx={{ maxWidth: 960, mx: "auto" }}>
            {/* Top Navy Ribbon */}
            <Box
              sx={{
                bgcolor: "#0f2942",
                color: "#ffffff",
                py: 1.2,
                px: { xs: 2, sm: 3 },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                borderBottom: "2px solid #b45309",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ShieldIcon sx={{ color: "#f59e0b", fontSize: 18 }} />
                <Typography
                  sx={{
                    fontSize: { xs: "0.68rem", sm: "0.75rem" },
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  OFFICIAL INSTITUTIONAL REGISTRY INTAKE • ICJ MEMBER ENROLLMENT 2026
                </Typography>
              </Stack>
              <Chip
                size="small"
                label="NATIONAL REGISTRY"
                sx={{
                  bgcolor: "#1e3a5f",
                  color: "#93c5fd",
                  fontWeight: 800,
                  fontSize: "0.65rem",
                  height: 20,
                }}
              />
            </Box>

            {/* Main Affidavit Form Paper */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#fdfdfc",
                border: "3px double #0f2942",
                borderTop: "none",
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                p: { xs: 2.5, sm: 4.5 },
                boxShadow: "0 12px 40px rgba(15, 41, 66, 0.12)",
                position: "relative",
              }}
            >
              {/* Formal Corner Marks */}
              <Box sx={{ position: "absolute", top: 12, left: 14, fontSize: "1.4rem", color: "#0f2942", lineHeight: 1 }}>⌜</Box>
              <Box sx={{ position: "absolute", top: 12, right: 14, fontSize: "1.4rem", color: "#0f2942", lineHeight: 1 }}>⌝</Box>

              {/* Form Header */}
              <Box sx={{ textAlign: "center", mb: 2.5 }}>
                <Typography
                  sx={{
                    fontFamily: "Georgia, serif",
                    fontWeight: 900,
                    color: "#0f2942",
                    fontSize: { xs: "1.15rem", sm: "1.4rem" },
                    letterSpacing: "0.05em",
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  INTERNATIONAL CONSORTIUM OF JURISTS
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "#b45309",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    mb: 1.5,
                  }}
                >
                  Statutory Non-Profit Legal Guild • Membership Directorate
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "Georgia, serif",
                    fontWeight: 800,
                    fontSize: { xs: "0.72rem", sm: "0.85rem", md: "0.95rem" },
                    color: "#1e3a8a",
                    mt: 1.5,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                    borderTop: "1px dashed #cbd5e1",
                    borderBottom: "1px dashed #cbd5e1",
                    py: 0.75,
                    px: 1.5,
                    display: "inline-block",
                    maxWidth: "100%",
                  }}
                >
                  APPLICATION FOR STATUTORY GUILD MEMBERSHIP &amp; CITIZEN DIRECTORY ENROLLMENT
                </Typography>

                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    mt: 1.5,
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    color: "#475569",
                    flexWrap: "wrap",
                  }}
                >
                  <span><strong>Filing Type:</strong> Member Onboarding</span>
                  <span>•</span>
                  <span><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</span>
                  <span>•</span>
                  <span><strong>Registry Desk:</strong> National Membership Council</span>
                </Stack>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* SINGLE CONTINUOUS FORM */}
              <Box component="form" onSubmit={handleSubmit} sx={JOIN_DOCUMENT_SX}>
                {/* ─── SECTION 1: APPLICANT IDENTITY & PROFILE PARTICULARS ─── */}
                <Box
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    mb: 3,
                    bgcolor: "#ffffff",
                    borderRadius: "14px",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.825rem",
                      fontWeight: 900,
                      color: "#0f2942",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      mb: 2.5,
                      pb: 0.8,
                      borderBottom: "1.5px solid #0f2942",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <VerifiedIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                    <span>SECTION I: APPLICANT IDENTITY &amp; PROFILE PARTICULARS</span>
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Left Block: Name, Gender, DOB */}
                    <Grid size={{ xs: 12, md: 9 }}>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            variant="standard"
                            fullWidth
                            size="small"
                            label="First Name"
                            placeholder="e.g. Ramesh"
                            value={form.first_name}
                            onChange={handleFieldChange("first_name")}
                            required
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            variant="standard"
                            fullWidth
                            size="small"
                            label="Last Name"
                            placeholder="e.g. Kumar"
                            value={form.last_name}
                            onChange={handleFieldChange("last_name")}
                            required
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <FormControl fullWidth size="small" variant="standard">
                            <InputLabel id="join-gender-label">Gender</InputLabel>
                            <Select
                              variant="standard"
                              labelId="join-gender-label"
                              value={form.gender}
                              label="Gender"
                              onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                            >
                              {GENDER_OPTIONS.map((g) => (
                                <MenuItem key={g} value={g}>
                                  {g}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            variant="standard"
                            fullWidth
                            size="small"
                            type="date"
                            label="Date of Birth"
                            value={form.date_of_birth}
                            onChange={handleFieldChange("date_of_birth")}
                            required
                            slotProps={{ inputLabel: { shrink: true } }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Right Block: Passport Photograph Upload Box */}
                    <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 145,
                          border: photoPreview ? "2px solid #0f2942" : "1.5px dashed #0f2942",
                          borderRadius: 1,
                          bgcolor: "#f8fafc",
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#b45309",
                            bgcolor: "#f1f5f9",
                          },
                        }}
                        onClick={() => photoInputRef.current?.click()}
                      >
                        {photoPreview ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photoPreview}
                              alt="Passport Photo"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto();
                              }}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                bgcolor: "rgba(0,0,0,0.6)",
                                color: "#ffffff",
                                p: 0.4,
                                "&:hover": { bgcolor: "#dc2626" },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </>
                        ) : (
                          <Box sx={{ textAlign: "center", p: 1 }}>
                            <AddAPhotoIcon sx={{ color: "#64748b", fontSize: 28, mb: 0.5 }} />
                            <Typography
                              sx={{
                                fontSize: "0.62rem",
                                fontWeight: 800,
                                color: "#0f2942",
                                textTransform: "uppercase",
                                lineHeight: 1.2,
                                display: "block",
                              }}
                            >
                              Affix Passport Photograph
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: "0.58rem", color: "#64748b", display: "block", mt: 0.5 }}>
                              JPG/PNG Max 5MB
                            </Typography>
                          </Box>
                        )}
                        <input
                          ref={photoInputRef}
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoSelect}
                        />
                      </Box>
                      <Button
                        size="small"
                        onClick={() => photoInputRef.current?.click()}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: "#0f2942",
                          mt: 0.8,
                          py: 0.2,
                        }}
                      >
                        {photoPreview ? "Change Photo" : "+ Upload Photo"}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* ─── SECTION 2: REGISTERED CONTACT & CITIZEN DIRECTORY INFORMATION ─── */}
                <Box
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    mb: 3,
                    bgcolor: "#ffffff",
                    borderRadius: "14px",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.825rem",
                      fontWeight: 900,
                      color: "#0f2942",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      mb: 2.5,
                      pb: 0.8,
                      borderBottom: "1.5px solid #0f2942",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <SecurityOutlinedIcon sx={{ fontSize: 16, color: "#1e3a8a" }} />
                    <span>SECTION II: REGISTERED CONTACT &amp; CREDENTIAL SECURITY</span>
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Email Verification with EmailJS */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <EmailVerificationField
                        label="Registered Email Address"
                        value={form.email}
                        required
                        onChange={(email) => {
                          setForm((prev) => ({ ...prev, email }));
                          setIsEmailVerified(false);
                          if (error) setError(null);
                        }}
                        onVerified={() => {
                          setIsEmailVerified(true);
                          if (error) setError(null);
                        }}
                      />
                    </Grid>

                    {/* Mobile with PhoneInputWithCountry */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <PhoneInputWithCountry
                        variant="standard"
                        label="Mobile Number"
                        value={form.mobile_number}
                        required
                        onChange={(fullVal, _nationalVal, _code, isValid) => {
                          setForm((prev) => ({ ...prev, mobile_number: fullVal }));
                          setIsPhoneValid(isValid);
                          if (error) setError(null);
                        }}
                      />
                    </Grid>

                    {/* State, City, PIN Code */}
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth size="small" variant="standard">
                        <InputLabel id="join-state-label">State / Union Territory</InputLabel>
                        <Select
                          variant="standard"
                          labelId="join-state-label"
                          value={form.state_name}
                          label="State / Union Territory"
                          onChange={(e) => setForm((prev) => ({ ...prev, state_name: e.target.value }))}
                        >
                          {INDIAN_STATES.map((st) => (
                            <MenuItem key={st} value={st}>
                              {st}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        size="small"
                        label="City / District"
                        placeholder="e.g. New Delhi"
                        value={form.city_name}
                        onChange={handleFieldChange("city_name")}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        size="small"
                        label="Postal Code (PIN)"
                        placeholder="e.g. 110001"
                        value={form.pincode}
                        onChange={handleFieldChange("pincode")}
                        slotProps={{ htmlInput: { maxLength: 6 } }}
                      />
                    </Grid>

                    {/* Address */}
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        size="small"
                        label="Residential / Office Address"
                        placeholder="House/Chamber No., Street, Locality or Landmark"
                        value={form.address}
                        onChange={handleFieldChange("address")}
                      />
                    </Grid>

                    {/* Password Fields */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        size="small"
                        type="password"
                        label="Account Password"
                        placeholder="Minimum 8 characters"
                        value={form.password}
                        onChange={handleFieldChange("password")}
                        required
                        helperText="Must be at least 8 characters long."
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        size="small"
                        type="password"
                        label="Confirm Account Password"
                        placeholder="Re-enter password"
                        value={form.confirm_password}
                        onChange={handleFieldChange("confirm_password")}
                        required
                        error={Boolean(form.confirm_password && form.password !== form.confirm_password)}
                        helperText={
                          form.confirm_password && form.password !== form.confirm_password
                            ? "Passwords do not match."
                            : ""
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* ─── SECTION 3: STATUTORY MEMBER AFFIRMATION & ELECTRONIC UNDERTAKING ─── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    mb: 3,
                    border: "2px solid #b45309",
                    bgcolor: "#fffbeb",
                    borderRadius: "14px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.825rem",
                      fontWeight: 900,
                      color: "#78350f",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <VerifiedIcon sx={{ fontSize: 18, color: "#b45309" }} />
                    <span>SECTION III: STATUTORY MEMBER DECLARATION &amp; FORMAL AFFIRMATION</span>
                  </Typography>
                  <Divider sx={{ mb: 1.5, borderColor: "#fed7aa" }} />

                  <Typography
                    sx={{
                      fontFamily: "Georgia, serif",
                      fontSize: "0.825rem",
                      color: "#451a03",
                      lineHeight: 1.6,
                      fontStyle: "italic",
                      mb: 2,
                    }}
                  >
                    &ldquo;I, {form.first_name || "[Applicant]"} {form.last_name || ""}, hereby apply for official enrollment as a registered member of the International Consortium of Jurists.
                    I affirm that the personal particulars, mobile contact, and email furnished herein are true and accurate.
                    I agree to abide by the statutory code of ethics and professional charter of the Guild.&rdquo;
                  </Typography>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={declarationAccepted}
                        onChange={(e) => setDeclarationAccepted(e.target.checked)}
                        color="primary"
                        required
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 800, color: "#78350f", fontSize: "0.85rem" }}>
                        I formally affirm and authorize this statutory membership application under electronic execution.
                      </Typography>
                    }
                  />

                  <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px dashed #d97706", display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#92400e" }}>
                    <span>Applicant Digital Affirmation: <strong>{form.first_name ? `${form.first_name} ${form.last_name}` : "Applicant"}</strong></span>
                    <span>Execution Timestamp: <strong>{new Date().toLocaleDateString("en-IN")}</strong></span>
                  </Box>
                </Paper>

                {/* ─── SECTION IV: STATUTORY MEMBERSHIP SUBSCRIPTION & PAYMENT SCHEDULE ─── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: "2px solid #0f2942",
                    bgcolor: "#f8fafc",
                    mb: 3,
                    mt: 3,
                  }}
                >
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "Georgia, serif",
                        fontWeight: 900,
                        color: "#0f2942",
                        fontSize: "0.85rem",
                        letterSpacing: "0.06em",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <AccountBalanceWalletIcon sx={{ fontSize: 18, color: "#b45309" }} />
                      <span>SECTION IV: STATUTORY MEMBERSHIP SUBSCRIPTION &amp; PAYMENT SCHEDULE</span>
                    </Typography>
                    <Chip
                      size="small"
                      label="ADMIN REGULATED SCHEDULE"
                      sx={{ bgcolor: "#0f2942", color: "#f8fafc", fontWeight: 800, fontSize: "0.65rem", height: 20 }}
                    />
                  </Stack>
                  <Divider sx={{ mb: 2, borderColor: "#cbd5e1" }} />

                  <Box sx={{ mb: 2.5, p: 2, bgcolor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 1.5 }}>
                    <Grid container spacing={2} sx={{ alignItems: "center" }}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block" }}>
                          ANNUAL STATUTORY MEMBERSHIP DUES
                        </Typography>
                        <Typography sx={{ fontWeight: 900, fontSize: "1.75rem", color: "#0f2942", fontFamily: "Georgia, serif" }}>
                          ₹{membershipFee.amount_inr}
                          <Typography component="span" sx={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600, ml: 1 }}>
                            / year
                          </Typography>
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.8rem", lineHeight: 1.5 }}>
                          Official statutory fee covers national registry issuance, verified digital credentials, and grants immediate clearance to apply for specialized wings (<strong>Legal Professional</strong>, <strong>Other Professional</strong>, and <strong>Volunteer &amp; Legal Aid Fellow</strong>).
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Selectable Options: Pay Now vs Skip for Now */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper
                        elevation={0}
                        onClick={() => setPaymentChoice("pay_now")}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          cursor: "pointer",
                          border: paymentChoice === "pay_now" ? "2px solid #16a34a" : "1.5px solid #cbd5e1",
                          bgcolor: paymentChoice === "pay_now" ? "#f0fdf4" : "#ffffff",
                          transition: "0.2s",
                          "&:hover": { borderColor: "#16a34a" },
                        }}
                      >
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#14532d" }}>
                            Pay Statutory Fee Now (₹{membershipFee.amount_inr})
                          </Typography>
                          <Chip
                            size="small"
                            label="RECOMMENDED"
                            sx={{ bgcolor: "#16a34a", color: "#ffffff", fontWeight: 800, fontSize: "0.6rem", height: 18 }}
                          />
                        </Stack>
                        <Typography variant="caption" sx={{ color: "#166534", display: "block", lineHeight: 1.4 }}>
                          Immediate full clearance. Unlocks instantaneous access to submit professional empanelment credentials.
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Paper
                        elevation={0}
                        onClick={() => setPaymentChoice("skip")}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          cursor: "pointer",
                          border: paymentChoice === "skip" ? "2px solid #b45309" : "1.5px solid #cbd5e1",
                          bgcolor: paymentChoice === "skip" ? "#fffbeb" : "#ffffff",
                          transition: "0.2s",
                          "&:hover": { borderColor: "#b45309" },
                        }}
                      >
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#78350f" }}>
                            Skip for Now / Pay Later
                          </Typography>
                          <Chip
                            size="small"
                            label="BASIC ENROLLMENT"
                            sx={{ bgcolor: "#fde68a", color: "#92400e", fontWeight: 800, fontSize: "0.6rem", height: 18 }}
                          />
                        </Stack>
                        <Typography variant="caption" sx={{ color: "#92400e", display: "block", lineHeight: 1.4 }}>
                          Enroll with basic member profile. You can pay dues later from your dashboard before applying for professional wings.
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>

                {/* ─── SUBMIT BUTTON ─── */}
                <Stack direction="row" spacing={2} sx={{ justifyContent: "center", mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <HowToRegIcon />}
                    sx={{
                      bgcolor: "#0f2942",
                      color: "#ffffff",
                      px: 5,
                      py: 1.4,
                      borderRadius: 1.5,
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      textTransform: "none",
                      borderBottom: "3px solid #b45309",
                      boxShadow: "0 4px 14px rgba(15, 41, 66, 0.35)",
                      "&:hover": { bgcolor: "#1e3a5f" },
                    }}
                  >
                    {loading ? "Submitting Membership Registration..." : "Complete Official Member Enrollment"}
                  </Button>
                </Stack>
              </Box>
            </Paper>

            {/* Institutional Information & Process Highlights Below Document */}
            <Box sx={{ mt: 4 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: "1.5px solid #0f2942",
                      bgcolor: "#ffffff",
                      height: "100%",
                      boxShadow: "0 4px 14px rgba(15,41,66,0.06)",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                      <SecurityOutlinedIcon sx={{ color: "#16a34a", fontSize: 22 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f2942" }}>
                        Institutional Charter
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: "#475569", lineHeight: 1.6, display: "block" }}>
                      Registered under statutory guild non-profit provisions. Membership grants access to national advocate directory, CLE lectures, and pro bono committees.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: "1px solid #cbd5e1",
                      bgcolor: "#ffffff",
                      height: "100%",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f2942", mb: 1 }}>
                      Next Step: Empanelment
                    </Typography>
                    <Stack spacing={0.6}>
                      {[
                        "1. Immediate Member Dashboard Access",
                        "2. Optional Advocate / CA Empanelment Roster",
                        "3. Citizen Legal Aid Assignment Roster",
                        "4. Official Verification by Scrutiny Board",
                      ].map((item, idx) => (
                        <Typography key={idx} variant="caption" sx={{ color: "#1e3a8a", fontWeight: 700, display: "block" }}>
                          {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      border: "1px solid #fed7aa",
                      borderRadius: 2,
                      bgcolor: "#fffbeb",
                      height: "100%",
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                      <HeadsetIcon sx={{ color: "#b45309", fontSize: 24 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#78350f" }}>
                        Membership Support Desk
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: "#92400e", display: "block", fontWeight: 700 }}>
                      Helpline: +91-9999002222
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#92400e", display: "block" }}>
                      Email: membership@icj.org.in
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 5 }}>
          <LegalDisclaimer />
        </Box>
      </Container>
    </Box>
  );
}
