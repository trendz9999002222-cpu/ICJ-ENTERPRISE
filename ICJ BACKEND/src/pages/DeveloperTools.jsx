import { Box, Container, Typography, Alert } from "@mui/material";
import MembershipGuide from "../components/membership/MembershipGuide";
import useAuth from "../hooks/useAuth";
import { resolveRoleCode } from "../core/roles";

const AUTHORIZED_ROLES = ["super_admin", "system_admin", "developer"];

export default function DeveloperTools() {
  const { user, profile } = useAuth();
  const currentRole = resolveRoleCode(profile, user);
  const isAuthorized = AUTHORIZED_ROLES.includes(currentRole) || import.meta.env.DEV;

  if (!isAuthorized) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" variant="filled">
          Access Denied: The Developer & Testing Module is restricted to System Administrators and Developers.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Developer & System Testing Module
        </Typography>
        <Typography color="text.secondary">
          Isolated Environment Diagnostics, Live Demo Account Launcher & System Utilities
        </Typography>
      </Box>

      <MembershipGuide />
    </Container>
  );
}
