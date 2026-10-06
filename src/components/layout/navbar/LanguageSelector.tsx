"use client";

import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LanguageIcon from "@mui/icons-material/Language";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { Language, SUPPORTED_LANGUAGES } from "@/config/languages";

type Props = {
  compact?: boolean;
  textColor?: string;
};

export default function LanguageSelector({ compact = false, textColor = "#334155" }: Props) {
  const [selectedLang, setSelectedLang] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setSearchQuery("");
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectLanguage = (lang: Language) => {
    setSelectedLang(lang);
    handleClose();
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Button
        onClick={handleOpen}
        size="small"
        startIcon={<LanguageIcon sx={{ fontSize: compact ? 16 : 18, color: textColor }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 14, color: textColor }} />}
        sx={{
          color: textColor,
          fontWeight: 600,
          fontSize: compact ? "0.75rem" : "0.8125rem",
          textTransform: "none",
          whiteSpace: "nowrap",
          minWidth: "max-content",
          py: compact ? 0.25 : 0.5,
          px: compact ? 1 : 1.25,
          borderRadius: 1.5,
          border: "1px solid rgba(203, 213, 225, 0.6)",
          bgcolor: "rgba(255, 255, 255, 0.8)",
          "&:hover": {
            bgcolor: "#ffffff",
            borderColor: "#94a3b8",
          },
        }}
        aria-label="Select Language"
      >
        <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <span>{selectedLang.name}</span>
          {!compact && (
            <Typography component="span" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
              ({selectedLang.englishName})
            </Typography>
          )}
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 260,
              maxHeight: 380,
              borderRadius: 2,
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
              border: "1px solid #e2e8f0",
              p: 1,
            },
          },
        }}
      >
        <Box sx={{ p: 1, pb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#0f172a", display: "block", mb: 0.75 }}>
            Select Preferred Language
          </Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Search language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                  </InputAdornment>
                ),
                sx: { fontSize: "0.8rem", py: 0.25 },
              },
            }}
          />
        </Box>

        <Divider sx={{ mb: 0.5 }} />

        <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
          {filteredLanguages.map((lang) => {
            const isSelected = lang.code === selectedLang.code;
            return (
              <MenuItem
                key={lang.code}
                onClick={() => handleSelectLanguage(lang)}
                selected={isSelected}
                sx={{
                  py: 0.8,
                  px: 1.5,
                  borderRadius: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  "&.Mui-selected": {
                    bgcolor: "#eff6ff",
                    color: "#1d4ed8",
                    fontWeight: 700,
                  },
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: isSelected ? 700 : 500, color: "#0f172a" }}>
                    {lang.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                    {lang.englishName}
                  </Typography>
                </Box>
                {isSelected && <CheckIcon sx={{ fontSize: 16, color: "#2563eb" }} />}
              </MenuItem>
            );
          })}
        </Box>
      </Menu>
    </>
  );
}
