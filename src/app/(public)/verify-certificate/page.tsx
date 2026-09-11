import { Container, Paper, Typography } from "@mui/material";

import PageSection from "@/components/layout/PageSection";

export default function VerifyCertificatePage() {
  return (
    <PageSection>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Certificate Verification</Typography>
          <Typography color="text.secondary">Certificate verification desk coming soon.</Typography>
        </Paper>
      </Container>
    </PageSection>
  );
}
