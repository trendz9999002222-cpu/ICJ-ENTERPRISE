import { Box, Paper, Typography, Stack } from "@mui/material";

const topics = [
  "Member growth trends",
  "Regional participation analysis",
  "Document verification cycle time",
  "Donation and token circulation trends",
];

export default function Research() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Research
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Research workspace for analytics and insight generation.
        </Typography>
        <Stack spacing={1}>
          {topics.map((topic) => (
            <Typography key={topic}>- {topic}</Typography>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

