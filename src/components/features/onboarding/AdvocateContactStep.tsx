// "use client";

// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
// import {
//   Alert,
//   Box,
//   Button,
//   Container,
//   Divider,
//   Grid,
//   IconButton,
//   InputAdornment,
//   Paper,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { useState } from "react";

// import AccentIconBox from "@/components/ui/AccentIconBox";
// import type { AdvocateContactFormData } from "@/constants/onboarding";
// import { RADIUS, SHADOW, actionButtonSx } from "@/theme/designTokens";

// type Props = {
//   data: AdvocateContactFormData;
//   onChange: (updates: Partial<AdvocateContactFormData>) => void;
//   onBack: () => void;
//   onProceed: () => void;
// };

// export default function AdvocateContactStep({ data, onChange, onBack, onProceed }: Props) {
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleNext = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!data.primaryMobile.trim()) {
//       setError("प्राइमरी मोबाइल नंबर दर्ज करना अनिवार्य है (Primary Mobile Number is required).");
//       return;
//     }
//     if (!/^\d{10}$/.test(data.primaryMobile.trim().replace(/\D/g, ""))) {
//       setError("कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें (Please enter a valid 10-digit mobile number).");
//       return;
//     }
//     if (!data.officialEmail.trim() || !/\S+@\S+\.\S+/.test(data.officialEmail)) {
//       setError("कृपया मान्य ऑफिशियल ईमेल पता दर्ज करें (Please enter a valid email address).");
//       return;
//     }
//     if (!data.password || data.password.length < 8) {
//       setError("पासवर्ड न्यूनतम 8 अक्षर का होना आवश्यक है (Password must be at least 8 characters).");
//       return;
//     }
//     if (data.password !== data.confirmPassword) {
//       setError("पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खा रहे हैं (Passwords do not match).");
//       return;
//     }

//     setError("");
//     onProceed();
//   };

//   return (
//     <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
//       <Paper
//         elevation={0}
//         sx={{
//           p: { xs: 3, sm: 4, md: 5 },
//           borderRadius: RADIUS.xl,
//           bgcolor: "#fff",
//           border: "1px solid #e2e8f0",
//           boxShadow: SHADOW.card,
//         }}
//       >
//         {/* Header */}
//         <Stack
//           direction={{ xs: "column", sm: "row" }}
//           spacing={2}
//           sx={{ alignItems: { xs: "flex-start", sm: "center" }, mb: 3.5 }}
//         >
//           <AccentIconBox color="#2563eb" bg="#eff6ff">
//             <LockOutlinedIcon sx={{ color: "#2563eb", fontSize: 28 }} />
//           </AccentIconBox>

//           <Box sx={{ flex: 1 }}>
//             <Typography
//               variant="h5"
//               sx={{
//                 fontWeight: 900,
//                 color: "#0f172a",
//                 fontSize: { xs: "1.15rem", md: "1.35rem" },
//                 letterSpacing: "-0.01em",
//               }}
//             >
//               2. संपर्क एवं सुरक्षा क्रेडेंशियल्स (Contact & Password)
//             </Typography>

//             <Typography sx={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600, mt: 0.5 }}>
//               नया पासवर्ड न्यूनतम 8 अक्षर का कोई भी अल्फ़ा/न्यूमेरिक हो सकता है
//             </Typography>
//           </Box>
//         </Stack>

//         {error && (
//           <Alert severity="error" sx={{ mb: 3, borderRadius: RADIUS.sm, fontWeight: 700 }}>
//             {error}
//           </Alert>
//         )}

//         <Box component="form" onSubmit={handleNext}>
//           <Stack spacing={3}>
//             {/* Row 1: Primary Mobile, WhatsApp Number */}
//             <Grid container spacing={2.5}>
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <TextField
//                   fullWidth
//                   required
//                   label="Primary Mobile Number (10 डिजिट मोबाइल) *"
//                   placeholder="e.g. 9876543210"
//                   value={data.primaryMobile}
//                   onChange={(e) => {
//                     onChange({ primaryMobile: e.target.value });
//                     if (error) setError("");
//                   }}
//                   slotProps={{
//                     input: {
//                       startAdornment: (
//                         <InputAdornment position="start" sx={{ color: "#64748b", fontWeight: 700 }}>
//                           +91
//                         </InputAdornment>
//                       ),
//                     },
//                   }}
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm } }}
//                 />
//               </Grid>

//               <Grid size={{ xs: 12, md: 6 }}>
//                 <TextField
//                   fullWidth
//                   label="WhatsApp Number (वैकल्पिक)"
//                   placeholder="e.g. 9876543210 (यदि अलग हो)"
//                   value={data.whatsappNumber}
//                   onChange={(e) => onChange({ whatsappNumber: e.target.value })}
//                   slotProps={{
//                     input: {
//                       startAdornment: (
//                         <InputAdornment position="start" sx={{ color: "#64748b", fontWeight: 700 }}>
//                           +91
//                         </InputAdornment>
//                       ),
//                     },
//                   }}
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm } }}
//                 />
//               </Grid>
//             </Grid>

//             {/* Row 2: Official Email */}
//             <TextField
//               fullWidth
//               required
//               type="email"
//               label="Official Email Address (ईमेल पता) *"
//               placeholder="e.g. advocate@icj.law or user@gmail.com"
//               value={data.officialEmail}
//               onChange={(e) => {
//                 onChange({ officialEmail: e.target.value });
//                 if (error) setError("");
//               }}
//               sx={{ "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm } }}
//             />

//             {/* Row 3: Password, Confirm Password */}
//             <Grid container spacing={2.5}>
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <TextField
//                   fullWidth
//                   required
//                   type={showPassword ? "text" : "password"}
//                   label="Create Password (पासवर्ड बनाएं) *"
//                   placeholder="कम से कम 8 अक्षर दर्ज करें"
//                   helperText="न्यूनतम 8 अक्षर (नंबर, अक्षर या अल्फ़ान्यूमेरिक)"
//                   value={data.password}
//                   onChange={(e) => {
//                     onChange({ password: e.target.value });
//                     if (error) setError("");
//                   }}
//                   slotProps={{
//                     input: {
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton
//                             size="small"
//                             onClick={() => setShowPassword((prev) => !prev)}
//                             edge="end"
//                           >
//                             {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     },
//                   }}
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm } }}
//                 />
//               </Grid>

//               <Grid size={{ xs: 12, md: 6 }}>
//                 <TextField
//                   fullWidth
//                   required
//                   type={showConfirmPassword ? "text" : "password"}
//                   label="Confirm Password (पासवर्ड दोबारा दर्ज करें) *"
//                   placeholder="पासवर्ड दोबारा लिखें"
//                   value={data.confirmPassword}
//                   onChange={(e) => {
//                     onChange({ confirmPassword: e.target.value });
//                     if (error) setError("");
//                   }}
//                   slotProps={{
//                     input: {
//                       endAdornment: (
//                         <InputAdornment position="end">
//                           <IconButton
//                             size="small"
//                             onClick={() => setShowConfirmPassword((prev) => !prev)}
//                             edge="end"
//                           >
//                             {showConfirmPassword ? (
//                               <VisibilityOffIcon fontSize="small" />
//                             ) : (
//                               <VisibilityIcon fontSize="small" />
//                             )}
//                           </IconButton>
//                         </InputAdornment>
//                       ),
//                     },
//                   }}
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm } }}
//                 />
//               </Grid>
//             </Grid>
//           </Stack>

//           <Divider sx={{ my: 4 }} />

//           {/* Buttons */}
//           <Stack
//             direction="row"
//             sx={{
//               justifyContent: "space-between",
//               alignItems: "center",
//               flexWrap: "wrap",
//               gap: 2,
//             }}
//           >
//             <Button
//               type="button"
//               variant="outlined"
//               startIcon={<ArrowBackIcon />}
//               onClick={onBack}
//               sx={{
//                 color: "#475569",
//                 borderColor: "#cbd5e1",
//                 fontWeight: 800,
//                 borderRadius: RADIUS.sm,
//                 px: 3,
//                 py: 1.2,
//                 textTransform: "none",
//                 "&:hover": { borderColor: "#94a3b8", bgcolor: "#f1f5f9" },
//               }}
//             >
//               ← पीछे जाएं (Back)
//             </Button>

//             <Button
//               type="submit"
//               variant="contained"
//               endIcon={<ArrowForwardIcon />}
//               sx={{
//                 ...actionButtonSx("#2563eb"),
//                 px: 4,
//                 py: 1.2,
//                 fontSize: "0.95rem",
//               }}
//             >
//               आगे बढ़ें (Next) →
//             </Button>
//           </Stack>
//         </Box>
//       </Paper>
//     </Container>
//   );
// }
