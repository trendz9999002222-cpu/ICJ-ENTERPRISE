import { Container, Paper, Typography } from "@mui/material";

import PageSection from "@/components/layout/PageSection";

export default function TrackCasePage() {
  return (
    <PageSection>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Track Case Status</Typography>
          <Typography color="text.secondary">Public case tracking portal coming soon.</Typography>
        </Paper>
      </Container>
    </PageSection>
  );
}
