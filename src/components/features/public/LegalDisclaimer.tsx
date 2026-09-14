import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Paper, Stack, Typography } from "@mui/material";

export default function LegalDisclaimer({
  text = "The International Consortium of Jurists (ICJ) is an institutional platform dedicated to public legal literacy, pro bono coordination, and alternative dispute resolution facilitation. Information provided across this portal does not constitute direct legal advice or establish an advocate-client relationship. Depending on the matter, ICJ provides orientation, facilitation, or referral to verified independent professionals.",
}: {
  text?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        border: "1px solid #e2e8f0",
        bgcolor: "#f8fafc",
        my: 3,
        width: "100%",
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
        <InfoOutlinedIcon sx={{ fontSize: 18, color: "#64748b", flexShrink: 0, mt: 0.25 }} />
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", display: "block", mb: 0.25 }}>
            INSTITUTIONAL LEGAL DISCLAIMER
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", lineHeight: 1.6, display: "block" }}>
            {text}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
