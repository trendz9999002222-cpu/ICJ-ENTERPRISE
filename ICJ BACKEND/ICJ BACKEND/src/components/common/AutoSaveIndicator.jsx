import React, { useState, useEffect } from "react";
import { Chip, Stack, Typography } from "@mui/material";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import SyncIcon from "@mui/icons-material/Sync";

export default function AutoSaveIndicator({ isSaving = false, lastSavedTime = null }) {
  const [displayTime, setDisplayTime] = useState("Just now");

  useEffect(() => {
    if (lastSavedTime) {
      setDisplayTime(new Date(lastSavedTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
  }, [lastSavedTime]);

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Chip
        icon={
          isSaving ? (
            <SyncIcon sx={{ fontSize: "1rem !important", animation: "spin 1s linear infinite" }} />
          ) : (
            <CloudDoneIcon sx={{ fontSize: "1rem !important", color: "#059669 !important" }} />
          )
        }
        label={isSaving ? "सुरक्षित हो रहा है..." : "स्वतः सुरक्षित (Saved)"}
        size="small"
        sx={{
          bgcolor: isSaving ? "#fffbeb" : "#ecfdf5",
          color: isSaving ? "#b45309" : "#065f46",
          border: `1px solid ${isSaving ? "#fde68a" : "#a7f3d0"}`,
          fontWeight: 800,
          fontSize: "0.75rem",
        }}
      />
      {!isSaving && (
        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.72rem" }}>
          Google Docs Grade Cloud Auto-Save
        </Typography>
      )}
    </Stack>
  );
}
