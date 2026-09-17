// "use client";

// import GavelIcon from "@mui/icons-material/Gavel";
// import { Box, Chip, Container, Grid, Typography } from "@mui/material";

// import { ONBOARDING_ROLES, type OnboardingRole } from "@/constants/onboarding";
// import { RADIUS } from "@/theme/designTokens";

// import RoleCard from "./RoleCard";

// type Props = {
//   selectedRole: OnboardingRole;
//   onSelectRole: (role: OnboardingRole) => void;
//   onProceed: () => void;
// };

// export default function RoleSelectionStep({ selectedRole, onSelectRole, onProceed }: Props) {
//   return (
//     <Container maxWidth="xl" sx={{ py: { xs: 4, md: 5 } }}>
//       <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
//         <Chip
//           icon={<GavelIcon sx={{ color: "#2563eb !important" }} />}
//           label="Step 1 — Role Selection"
//           sx={{
//             bgcolor: "#eff6ff",
//             color: "#1d4ed8",
//             fontWeight: 700,
//             mb: 2,
//             borderRadius: RADIUS.sm,
//             border: "1px solid #bfdbfe",
//           }}
//         />
//         <Typography
//           variant="h4"
//           sx={{
//             fontWeight: 900,
//             color: "#0f172a",
//             fontSize: { xs: "1.35rem", md: "2rem" },
//             mb: 1,
//             lineHeight: 1.3,
//           }}
//         >
//           अपनी भूमिका एवं विधिक क्षमता का चयन करें
//         </Typography>
//         <Typography sx={{ color: "#64748b", fontSize: { xs: "0.9rem", md: "1rem" } }}>
//           Select your primary onboarding capacity on the ICJ Enterprise Legal Infrastructure
//         </Typography>
//       </Box>

//       <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
//         {ONBOARDING_ROLES.map((role) => (
//           <Grid key={role.id} size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
//             <RoleCard
//               role={role}
//               selected={selectedRole === role.id}
//               onSelect={() => onSelectRole(role.id)}
//               onProceed={onProceed}
//             />
//           </Grid>
//         ))}
//       </Grid>
//     </Container>
//   );
// }
