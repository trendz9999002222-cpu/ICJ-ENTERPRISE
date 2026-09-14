import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { Box, Button, Paper, Typography } from "@mui/material";

type Props = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  title = "No results found",
  description = "Try adjusting your search query or removing active filters to see more results.",
  actionLabel = "Reset Filters",
  onAction,
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, sm: 6 },
        textAlign: "center",
        borderRadius: 3,
        border: "1px dashed #cbd5e1",
        bgcolor: "#ffffff",
        my: 3,
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: "#f1f5f9",
          display: "grid",
          placeItems: "center",
          mx: "auto",
          mb: 2,
        }}
      >
        <SearchOffOutlinedIcon sx={{ fontSize: 28, color: "#94a3b8" }} />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", mb: 0.75 }}>
        {title}
      </Typography>

      <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 460, mx: "auto", mb: 2.5 }}>
        {description}
      </Typography>

      {onAction && (
        <Button
          variant="outlined"
          size="small"
          onClick={onAction}
          sx={{
            borderColor: "#cbd5e1",
            color: "#2563eb",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
}
