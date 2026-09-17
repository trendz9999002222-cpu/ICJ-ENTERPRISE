"use client";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Typography } from "@mui/material";

import type { IconKey, Theme } from "@/types/registration";

import { RADIUS, SHADOW, resolveIcon } from "./iconMap";

export type SelectionItem = {
  id: string;
  code?: string;
  title: string;
  description?: string;
  icon?: IconKey;
  theme?: Theme;
};

type Props = {
  items: SelectionItem[];
  selectedId: string | null;
  /** Columns on the widest breakpoint. 5 for categories, 3 for groups. */
  columns?: number;
  fallbackTheme: Theme;
  onSelect: (id: string) => void;
};

export default function SelectionGrid({
  items,
  selectedId,
  columns = 3,
  fallbackTheme,
  onSelect,
}: Props) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: `repeat(${Math.min(columns, 3)}, minmax(0, 1fr))`,
          lg: `repeat(${columns}, minmax(0, 1fr))`,
        },
      }}
    >
      {items.map((item) => {
        const theme = item.theme ?? fallbackTheme;
        const Icon = resolveIcon(item.icon);
        const selected = selectedId === item.id;

        return (
          <Box
            key={item.id}
            component="button"
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={selected}
            sx={{
              all: "unset",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              width: "100%",
              p: 2,
              cursor: "pointer",
              borderRadius: RADIUS.lg,
              bgcolor: theme.bg,
              border: selected ? `2px solid ${theme.color}` : `1px solid ${theme.border}`,
              boxShadow: selected ? SHADOW.cardHover : SHADOW.card,
              transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              "&:hover": { boxShadow: SHADOW.cardHover },
              "&:focus-visible": { outline: `2px solid ${theme.color}`, outlineOffset: 3 },
            }}
          >
            <Box sx={{ display: "flex", gap: 1.75, alignItems: "flex-start" }}>
              <Icon sx={{ color: theme.color, fontSize: 38, flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                {item.code && (
                  <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: theme.color, opacity: 0.8 }}>
                    {item.code}
                  </Typography>
                )}
                <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem", lineHeight: 1.3 }}>
                  {item.title}
                </Typography>
              </Box>
            </Box>

            {item.description && (
              <Typography sx={{ color: "#64748b", fontSize: "0.76rem", lineHeight: 1.5, mt: 1.25, flex: 1 }}>
                {item.description}
              </Typography>
            )}

            <Box
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                bgcolor: theme.color,
                color: "#fff",
                borderRadius: RADIUS.sm,
                py: 1,
                fontWeight: 700,
                fontSize: "0.82rem",
              }}
            >
              {selected ? "Selected" : "Select"}
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
