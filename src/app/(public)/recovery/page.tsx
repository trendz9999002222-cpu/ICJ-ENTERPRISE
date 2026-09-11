import { Container, Paper, Typography } from "@mui/material";

import PageSection from "@/components/layout/PageSection";

export default function RecoveryPage() {
  return (
    <PageSection>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Account Recovery</Typography>
          <Typography color="text.secondary">Password recovery via OTP will be wired to Django backend.</Typography>
        </Paper>
      </Container>
    </PageSection>
  );
}
