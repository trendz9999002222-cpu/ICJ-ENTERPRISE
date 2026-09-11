import { Container, Paper, Typography } from "@mui/material";

import PageSection from "@/components/layout/PageSection";

export default function DashboardPage() {
  return (
    <PageSection>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Enterprise Workspace Dashboard</Typography>
          <Typography color="text.secondary">Authenticated dashboard modules will load here.</Typography>
        </Paper>
      </Container>
    </PageSection>
  );
}
