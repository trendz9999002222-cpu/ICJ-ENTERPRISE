"use client";

import { Box, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";

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

export type SelectionSection = {
  id: string;
  title: string;
  theme?: Theme;
  items: SelectionItem[];
};

type Props = {
  items: SelectionItem[];
  selectedIds: string[];
  /** When false, only one item can be checked at a time. Default true. */
  multiple?: boolean;
  columns?: number;
  fallbackTheme: Theme;
  onSelectionChange: (ids: string[]) => void;
};

export default function SelectionGrid({
  items,
  selectedIds,
  multiple = true,
  columns = 3,
  fallbackTheme,
  onSelectionChange,
}: Props) {
  const toggle = (id: string) => {
    const checked = selectedIds.includes(id);
    if (multiple) {
      onSelectionChange(checked ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
    } else {
      onSelectionChange(checked ? [] : [id]);
    }
  };

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
        const selected = selectedIds.includes(item.id);

        return (
          <Box
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => toggle(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle(item.id);
              }
            }}
            aria-pressed={selected}
            sx={{
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
              sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selected}
                    onChange={() => toggle(item.id)}
                    sx={{
                      color: theme.color,
                      "&.Mui-checked": { color: theme.color },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: "#334155" }}>
                    {selected ? "Selected" : "Choose"}
                  </Typography>
                }
                sx={{ m: 0, userSelect: "none" }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

type GroupedProps = Omit<Props, "items"> & {
  sections: SelectionSection[];
};

/** Renders multiple selection grids under category / group headings. */
export function GroupedSelectionGrid({
  sections,
  selectedIds,
  multiple = true,
  columns = 3,
  fallbackTheme,
  onSelectionChange,
}: GroupedProps) {
  if (!sections.length) return null;

  return (
    <Stack spacing={4}>
      {sections.map((section) => {
        const accent = section.theme ?? fallbackTheme;
        if (!section.items.length) return null;

        return (
          <Box key={section.id} component="section">
            <Box
              sx={{
                mb: 2,
                pb: 1.25,
                borderBottom: `1px solid ${accent.border}`,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  color: "#0f172a",
                }}
              >
                {section.title}
              </Typography>
              <Box
                sx={{
                  mt: 0.75,
                  height: 3,
                  width: 56,
                  borderRadius: 999,
                  bgcolor: accent.color,
                }}
              />
            </Box>
            <SelectionGrid
              items={section.items}
              selectedIds={selectedIds}
              multiple={multiple}
              columns={columns}
              fallbackTheme={fallbackTheme}
              onSelectionChange={onSelectionChange}
            />
          </Box>
        );
      })}
    </Stack>
  );
}
