"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

import type { ResearchPaper } from "@/types/public";

export default function ResearchCard({ paper }: { paper: ResearchPaper }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "#bfdbfe",
          boxShadow: "0 6px 20px rgba(37,99,235,0.06)",
        },
      }}
    >
      <Box>
        {/* Category + Year Badge */}
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Chip
            label={paper.category}
            size="small"
            sx={{
              bgcolor: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              {paper.publishedYear}
            </Typography>
          </Stack>
        </Stack>

        <Typography
          component="h3"
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: "1.05rem",
            lineHeight: 1.4,
            mb: 1,
          }}
        >
          {paper.title}
        </Typography>

        <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 600, display: "block", mb: 1.5 }}>
          By {paper.authors.join(", ")}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#475569",
            fontSize: "0.85rem",
            lineHeight: 1.55,
            mb: 2,
          }}
        >
          {paper.abstract}
        </Typography>

        {/* Tags */}
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5, mb: 2 }}>
          {paper.tags.map((t) => (
            <Chip
              key={t}
              label={`#${t}`}
              size="small"
              sx={{
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#64748b",
                fontSize: "0.75rem",
                height: 22,
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Footer Info */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          pt: 2,
          borderTop: "1px solid #f1f5f9",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <AccessTimeIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {paper.readTimeMinutes} min read
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "#2563eb", cursor: "pointer" }}>
          <DescriptionOutlinedIcon sx={{ fontSize: 15 }} />
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Read Document
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
