// "use client";

// import CloseIcon from "@mui/icons-material/Close";
// import { Box, Chip, Container, IconButton, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
// import Link from "next/link";

// import type { OnboardingStep } from "@/constants/onboarding";
// import { RADIUS } from "@/theme/designTokens";

// type Props = {
//   step: OnboardingStep;
//   totalSteps: number;
// };

// export default function OnboardingStepBar({ step, totalSteps }: Props) {
//   const progress = (step.id / totalSteps) * 100;

//   return (
//     <Box
//       sx={{
//         bgcolor: "#fff",
//         borderBottom: "1px solid #e2e8f0",
//         boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
//       }}
//     >
//       <Container maxWidth="xl" sx={{ py: 1.75 }}>
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: { xs: "flex-start", sm: "center" },
//             justifyContent: "space-between",
//             gap: { xs: 1.5, md: 2 },
//             mb: 1.5,
//             flexDirection: { xs: "column", sm: "row" },
//           }}
//         >
//           <Box>
//             <Typography
//               sx={{
//                 fontWeight: 900,
//                 color: "#0f172a",
//                 fontSize: { xs: "0.95rem", md: "1.1rem" },
//                 letterSpacing: "0.02em",
//               }}
//             >
//               ICJ ENTERPRISE ONBOARDING
//             </Typography>
//             <Typography sx={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600 }}>
//               अखिल भारतीय विधिक सदस्यता एवं डिजिटल न्याय मंच
//             </Typography>
//           </Box>

//           <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
//             <Chip
//               label={`Step ${step.id} of ${totalSteps} : ${step.titleHi}`}
//               sx={{
//                 bgcolor: "#eff6ff",
//                 color: "#1d4ed8",
//                 fontWeight: 800,
//                 border: "1px solid #bfdbfe",
//                 borderRadius: RADIUS.sm,
//                 height: "auto",
//                 maxWidth: { xs: 200, sm: 280, md: "none" },
//                 "& .MuiChip-label": {
//                   px: 1.5,
//                   py: 0.6,
//                   fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.85rem" },
//                   whiteSpace: "normal",
//                   lineHeight: 1.35,
//                 },
//               }}
//             />

//             <Tooltip title="पोर्टल पर वापस जाएं (Exit to Home)">
//               <IconButton
//                 component={Link}
//                 href="/"
//                 size="small"
//                 sx={{
//                   color: "#64748b",
//                   border: "1px solid #e2e8f0",
//                   borderRadius: RADIUS.sm,
//                   "&:hover": { bgcolor: "#fee2e2", color: "#ef4444", borderColor: "#fca5a5" },
//                 }}
//               >
//                 <CloseIcon fontSize="small" />
//               </IconButton>
//             </Tooltip>
//           </Stack>
//         </Box>

//         <LinearProgress
//           variant="determinate"
//           value={progress}
//           sx={{
//             height: 6,
//             borderRadius: RADIUS.sm,
//             bgcolor: "#e2e8f0",
//             "& .MuiLinearProgress-bar": {
//               bgcolor: "#2563eb",
//               borderRadius: RADIUS.sm,
//             },
//           }}
//         />
//       </Container>
//     </Box>
//   );
// }
