import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, Slide, Chip } from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import WifiIcon from "@mui/icons-material/Wifi";
import SyncIcon from "@mui/icons-material/Sync";

export default function OfflineNetworkSyncBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [showReconnectedAlert, setShowReconnectedAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedAlert(true);
      const timer = setTimeout(() => setShowReconnectedAlert(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedAlert(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnectedAlert) return null;

  return (
    <Slide direction="down" in={!isOnline || showReconnectedAlert} mountOnEnter unmountOnExit>
      <Box
        sx={{
          width: "100%",
          py: 0.8,
          px: 2,
          bgcolor: isOnline ? "#059669" : "#d97706",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 9999,
          transition: "all 0.3s ease",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.2}>
          {isOnline ? (
            <WifiIcon sx={{ fontSize: 20 }} />
          ) : (
            <WifiOffIcon sx={{ fontSize: 20, animation: "pulse 1.5s infinite" }} />
          )}

          <Typography variant="caption" fontWeight={900} sx={{ fontSize: "0.82rem" }}>
            {isOnline
              ? "🟢 इंटरनेट कनेक्शन पुनः स्थापित (Internet Reconnected — All Local Records Synced)"
              : "🟠 आप अभी ऑफलाइन हैं (Offline Mode Active — Data is safely cached locally and will auto-sync)"}
          </Typography>
        </Stack>

        <Chip
          label={isOnline ? "Live Cloud Connected" : "Local Vault Safeguard"}
          size="small"
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "0.68rem",
            display: { xs: "none", sm: "inline-flex" },
          }}
        />
      </Box>
    </Slide>
  );
}
