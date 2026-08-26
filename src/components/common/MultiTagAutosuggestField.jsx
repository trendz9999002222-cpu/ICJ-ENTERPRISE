import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Chip,
  Stack,
  Autocomplete,
} from "@mui/material";

/**
 * MultiTagAutosuggestField — ICJ Enterprise Platform
 *
 * Hybrid Auto-Suggest & Free-Type Multi-Tag Field:
 * - Allows 1-click selection from popular suggestions
 * - Allows typing any custom value and pressing Enter or comma
 * - Displays active selected tags as removable colorful chips
 */
export default function MultiTagAutosuggestField({
  label,
  helperText,
  placeholder = "टाइप करें और Enter दबाएं...",
  suggestions = [],
  value = [],
  onChange,
  color = "primary",
}) {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event, newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleQuickAdd = (suggestion) => {
    if (!value.includes(suggestion)) {
      const updated = [...value, suggestion];
      if (onChange) onChange(updated);
    }
  };

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Typography variant="caption" fontWeight={800} color="#1e293b" display="block" mb={0.5}>
        {label}
      </Typography>

      <Autocomplete
        multiple
        freeSolo
        options={suggestions}
        value={value}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        onChange={handleChange}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              label={option}
              size="small"
              color={color}
              variant="filled"
              {...getTagProps({ index })}
              key={option}
              sx={{ fontWeight: 700, borderRadius: 1.5, my: 0.2 }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder={value.length === 0 ? placeholder : ""}
            helperText={helperText}
          />
        )}
      />

      {/* Quick-Suggestion Pills (Click to add) */}
      {suggestions.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, alignSelf: "center", fontSize: "0.7rem" }}>
            त्वरित सुझाव:
          </Typography>
          {suggestions.slice(0, 5).map((sug) => {
            const isSelected = value.includes(sug);
            return (
              <Chip
                key={sug}
                label={`+ ${sug}`}
                size="small"
                variant={isSelected ? "filled" : "outlined"}
                onClick={() => handleQuickAdd(sug)}
                disabled={isSelected}
                sx={{
                  fontSize: "0.68rem",
                  cursor: isSelected ? "default" : "pointer",
                  bgcolor: isSelected ? "#e2e8f0" : "transparent",
                }}
              />
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
