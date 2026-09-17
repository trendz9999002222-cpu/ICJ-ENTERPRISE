// "use client";

// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import BalanceIcon from "@mui/icons-material/Balance";
// import {
//   Alert,
//   Box,
//   Button,
//   Container,
//   Divider,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { useState } from "react";

// import AccentIconBox from "@/components/ui/AccentIconBox";
// import {
//   type AdvocatePracticeFormData,
//   EXPERIENCE_LEVELS,
//   PROFESSIONAL_CATEGORIES,
// } from "@/constants/onboarding";
// import { RADIUS, SHADOW, actionButtonSx } from "@/theme/designTokens";

// type Props = {
//   data: AdvocatePracticeFormData;
//   onChange: (updates: Partial<AdvocatePracticeFormData>) => void;
//   onBack: () => void;
//   onProceed: () => void;
// };

// export default function AdvocatePracticeStep({ data, onChange, onBack, onProceed }: Props) {
//   const [error, setError] = useState("");

//   const handleNext = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!data.regNumber.trim()) {
//       setError("बार काउंसिल पंजीकरण संख्या दर्ज करना अनिवार्य है (Bar Council Registration No is required).");
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
//           <AccentIconBox color="#1d4ed8" bg="#dbeafe">
//             <BalanceIcon sx={{ color: "#1d4ed8", fontSize: 28 }} />
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
//               3. विधिक प्रमाण एवं विशेषज्ञता (Professional Practice & Matter)
//             </Typography>

//             <Typography sx={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600, mt: 0.5 }}>
//               अधिवक्ता बार काउंसिल पंजीकरण व विशेषज्ञता
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
//             {/* Row 1: Professional Category, Bar Council Reg No */}
//             <Grid container spacing={2.5}>
//               <Grid size={{ xs: 12, md: 6 }}>
//                 <FormControl fullWidth>
//                   <InputLabel id="category-select-label">Professional Category (श्रेणी)</InputLabel>
//                   <Select
//                     labelId="category-select-label"
//                     label="Professional Category (श्रेणी)"
//                     value={data.professionalCategory}
//                     onChange={(e) => onChange({ professionalCategory: e.target.value })}
//                     sx={{ borderRadius: RADIUS.sm }}
//                     MenuProps={{
//                       slotProps: {
//                         paper: {
//                           sx: { maxHeight: 320, borderRadius: RADIUS.sm },
//                         },
//                       },
//                     }}
//                   >
//                     {PROFESSIONAL_CATEGORIES.map((cat) => (
//                       <MenuItem key={cat} value={cat}>
//                         {cat}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Grid>

//               <Grid size={{ xs: 12, md: 6 }}>
//                 <TextField
//                   fullWidth
//                   required
//                   label="Bar Council / Professional Reg. No (रजिस्ट्रेशन नंबर) *"
//                   placeholder="e.g. D/1425/2016 या UP/4521/2018"
//                   value={data.regNumber}
//                   onChange={(e) => {
//                     onChange({ regNumber: e.target.value });
//                     if (error) setError("");
//                   }}
//                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm } }}
//                 />
//               </Grid>
//             </Grid>

//             {/* Row 2: Experience Level */}
//             <FormControl fullWidth>
//               <InputLabel id="exp-select-label">Experience Level (विधिक अनुभव)</InputLabel>
//               <Select
//                 labelId="exp-select-label"
//                 label="Experience Level (विधिक अनुभव)"
//                 value={data.experienceLevel}
//                 onChange={(e) => onChange({ experienceLevel: e.target.value })}
//                 sx={{ borderRadius: RADIUS.sm }}
//                 MenuProps={{
//                   slotProps: {
//                     paper: {
//                       sx: { maxHeight: 320, borderRadius: RADIUS.sm },
//                     },
//                   },
//                 }}
//               >
//                 {EXPERIENCE_LEVELS.map((exp) => (
//                   <MenuItem key={exp} value={exp}>
//                     {exp}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
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
