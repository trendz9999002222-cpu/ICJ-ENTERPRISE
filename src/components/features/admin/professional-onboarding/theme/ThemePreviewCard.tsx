"use client";

import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import type { ThemeColors } from "@/types/admin/visualTheme";

type Props = {
  colors: ThemeColors;
  categoryName: string;
  groupName?: string;
  professionName?: string;
};

export default function ThemePreviewCard({
  colors,
  categoryName,
  groupName = "Example group",
  professionName = "Example profession",
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: `1px solid ${colors.border_color}`,
        bgcolor: colors.background_color,
        maxWidth: 320,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: `${colors.primary_color}18`,
              color: colors.icon_color,
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: "0.75rem",
            }}
          >
            ICJ
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: colors.text_color, fontSize: "0.9rem" }}>
              {categoryName || "Category name"}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.secondary_color }}>
              {groupName}
            </Typography>
          </Box>
        </Stack>
        <Typography variant="body2" sx={{ color: colors.text_color, opacity: 0.85 }}>
          {professionName}
        </Typography>
        <Button
          size="small"
          variant="contained"
          disabled
          sx={{
            bgcolor: colors.primary_color,
            color: "#fff",
            "&.Mui-disabled": {
              bgcolor: colors.primary_color,
              color: "#fff",
              opacity: 0.9,
            },
            alignSelf: "flex-start",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
          }}
        >
          Example action
        </Button>
        <Box
          sx={{
            height: 3,
            borderRadius: 2,
            bgcolor: colors.accent_color,
            width: "40%",
          }}
        />
      </Stack>
    </Paper>
  );
}
