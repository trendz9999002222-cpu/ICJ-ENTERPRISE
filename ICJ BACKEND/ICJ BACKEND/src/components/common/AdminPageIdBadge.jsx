import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Box, Chip, Stack, Tooltip, Snackbar, Alert, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { getPageByRoute } from "../../core/adminPageRegistry";

export default function AdminPageIdBadge() {
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const pageInfo = useMemo(() => {
    return getPageByRoute(location.pathname);
  }, [location.pathname]);

  if (!pageInfo) return null;

  const displayText = `${pageInfo.id} · ${pageInfo.name}`;
  const copyValue = `Page ID: ${pageInfo.id}\nPage Name: ${pageInfo.name}\nRoute: ${pageInfo.route}\nSource: ${pageInfo.sourceFile}`;

  const handleCopy = (e) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(copyValue);
      }
    } catch {
      // Fallback
    }
    setCopied(true);
    setToastOpen(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 1, sm: 1.5 },
        py: 0.4,
        mb: 1,
        borderRadius: 1.5,
        bgcolor: "#0b192c",
        border: "1px solid #1e3a5f",
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        flexWrap: "wrap",
        gap: 0.8,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title="Click to copy Page ID & details for Antigravity" arrow>
          <Chip
            icon={
              copied ? (
                <CheckIcon sx={{ fontSize: "0.85rem !important", color: "#4ade80 !important" }} />
              ) : (
                <ContentCopyIcon sx={{ fontSize: "0.8rem !important", color: "#38bdf8 !important" }} />
              )
            }
            label={displayText}
            onClick={handleCopy}
            size="small"
            sx={{
              height: 24,
              fontWeight: 900,
              fontSize: { xs: "0.72rem", sm: "0.78rem" },
              letterSpacing: 0.2,
              bgcolor: "#1e293b",
              color: "#38bdf8",
              border: "1px solid #0284c7",
              cursor: "pointer",
              transition: "all 0.15s ease",
              "&:hover": {
                bgcolor: "#0f172a",
                borderColor: "#38bdf8",
                boxShadow: "0 0 8px rgba(56, 189, 248, 0.4)",
              },
            }}
          />
        </Tooltip>

        {pageInfo.hindiName && (
          <Typography
            variant="caption"
            sx={{
              color: "#94a3b8",
              fontWeight: 600,
              fontSize: { xs: "0.68rem", sm: "0.74rem" },
              display: { xs: "none", md: "inline" },
            }}
          >
            ({pageInfo.hindiName})
          </Typography>
        )}
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography
          variant="caption"
          sx={{
            color: "#64748b",
            fontFamily: "monospace",
            fontSize: "0.68rem",
            display: { xs: "none", lg: "inline" },
          }}
        >
          {pageInfo.sourceFile}
        </Typography>

        <Chip
          label={pageInfo.category}
          size="small"
          sx={{
            height: 18,
            fontSize: "0.6rem",
            fontWeight: 800,
            bgcolor: "rgba(59, 130, 246, 0.15)",
            color: "#93c5fd",
            border: "1px solid rgba(59, 130, 246, 0.3)",
          }}
        />
      </Stack>

      <Snackbar
        open={toastOpen}
        autoHideDuration={2000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%", fontWeight: 700, fontSize: "0.8rem" }}>
          Copied {pageInfo.id} · {pageInfo.name} to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
