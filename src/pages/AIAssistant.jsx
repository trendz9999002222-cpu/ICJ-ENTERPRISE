import { useState } from "react";
import { Box, Paper, Typography, Grid, TextField, Button, Stack } from "@mui/material";
import AIService from "../services/aiService";
import UniversalActionToolbar from "../components/common/UniversalActionToolbar";

export default function AIAssistant() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const askAssistant = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt.");
      return;
    }

    setSubmitting(true);
    try {
      const answer = await AIService.ask(prompt);
      setResponse(answer);
    } catch (error) {
      setResponse(error.message || "Unable to generate response.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        AI Assistant
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Intelligence
            </Typography>
            <Typography color="text.secondary">
              Summarize legal documents, member files, and activity updates.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ask Assistant
            </Typography>

            <Stack spacing={2}>
              <TextField
                multiline
                rows={5}
                label="Prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Summarize legal updates for this week..."
              />

              <Button variant="contained" onClick={askAssistant} disabled={submitting}>
                {submitting ? "Generating..." : "Generate"}
              </Button>

              <UniversalActionToolbar
                title="AI Legal Document Intelligence Report"
                content={response}
                documentId="ICJ-AI-INTELLIGENCE-2026"
                version="v1.5-Flash"
              />

              <Paper variant="outlined" sx={{ p: 2, minHeight: 160, bgcolor: "#fafafa" }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Response
                </Typography>
                <Typography whiteSpace="pre-wrap">{response || "Assistant response will appear here."}</Typography>
              </Paper>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
