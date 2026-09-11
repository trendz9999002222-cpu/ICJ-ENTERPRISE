import { Container, Paper, Typography } from "@mui/material";

import PageSection from "@/components/layout/PageSection";

export default function TermsPage() {
  return (
    <PageSection>
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Intermediary Terms of Service (IT Act Sec 79)
          </Typography>
          <Typography color="text.secondary">Statutory intermediary terms content will be published here.</Typography>
        </Paper>
      </Container>
    </PageSection>
  );
}
