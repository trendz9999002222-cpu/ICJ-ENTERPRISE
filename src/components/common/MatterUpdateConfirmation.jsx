import React, { useState } from "react";
import {
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  Chip,
  IconButton,
  Box,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function MatterUpdateConfirmation({
  extraction,
  onConfirm,
  onReject,
  disabled = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(extraction.value || "");

  const handleConfirm = () => {
    onConfirm(extraction.key, editValue);
    setIsEditing(false);
  };

  const handleReject = () => {
    onReject(extraction.key);
    setIsEditing(false);
  };

  if (extraction.status === "CONFIRMED") {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          bgcolor: "#f0fdf4",
          borderColor: "#bbf7d0",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label="CONFIRMED" size="small" color="success" />
          <Typography variant="body2">
            <strong>{extraction.label}:</strong> {extraction.value}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (extraction.status === "REJECTED") {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          bgcolor: "#fef2f2",
          borderColor: "#fecaca",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label="REJECTED" size="small" color="error" />
          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through" }}>
            <strong>{extraction.label}:</strong> {extraction.value}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: "#faf5ff",
        borderColor: "#e9d5ff",
        borderRadius: 2,
        mb: 1.5,
        borderLeft: "4px solid #a855f7",
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeIcon sx={{ color: "#a855f7", fontSize: 18 }} />
            <Typography variant="caption" fontWeight="bold" color="#6b21a8">
              AI PROPOSED MATTER UPDATE
            </Typography>
          </Stack>
          <Chip
            label={`${extraction.confidence || "MEDIUM"} CONFIDENCE`}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ fontSize: "0.65rem", height: 18 }}
          />
        </Stack>

        <Box>
          <Typography variant="caption" display="block" color="text.secondary">
            Proposed Field: <strong>{extraction.label}</strong>
          </Typography>
          {isEditing ? (
            <TextField
              size="small"
              fullWidth
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              sx={{ mt: 1, bgcolor: "#fff" }}
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={handleConfirm} disabled={disabled}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ fontWeight: "bold", mt: 0.5 }}>
              {extraction.value || "[Empty]"}
            </Typography>
          )}
        </Box>

        <Divider />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {!isEditing && (
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<EditIcon sx={{ fontSize: 12 }} />}
              onClick={() => setIsEditing(true)}
              disabled={disabled}
              sx={{ textTransform: "none", fontSize: "0.72rem", py: 0.25 }}
            >
              Edit Value
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckIcon sx={{ fontSize: 12 }} />}
            onClick={handleConfirm}
            disabled={disabled}
            sx={{ textTransform: "none", fontSize: "0.72rem", py: 0.25 }}
          >
            Confirm
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<CloseIcon sx={{ fontSize: 12 }} />}
            onClick={handleReject}
            disabled={disabled}
            sx={{ textTransform: "none", fontSize: "0.72rem", py: 0.25 }}
          >
            Reject
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
