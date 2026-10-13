"use client";

import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Box, Fab, Tooltip } from "@mui/material";

import { ICJ_WHATSAPP_NUMBER } from "@/config/siteLinks";

/**
 * WhatsApp deep-link following the wa.me convention.
 * Falls back to "#" if the placeholder number has not been replaced.
 */
const ICJ_WHATSAPP_MESSAGE = "Hello ICJ.  I would like to know more about your ICJ Membership.";
const WHATSAPP_HREF =
  (ICJ_WHATSAPP_NUMBER as string) && (ICJ_WHATSAPP_NUMBER as string) !== "PLACEHOLDER"
    ? `https://wa.me/${ICJ_WHATSAPP_NUMBER}?text=${encodeURIComponent(ICJ_WHATSAPP_MESSAGE)}`
    : "#";

const LABEL = "Contact ICJ on WhatsApp";

/**
 * A fixed circular floating action button that opens a WhatsApp chat with
 * ICJ's assistance line.  Sits above the PlatformDevelopmentNotice banner
 * (zIndex 1200) and the FloatingJoinUsWidget (zIndex 1250).
 *
 * Positioning clearance (bottom):
 *  xs  → 92px  – notice is full-width, tallest on mobile
 *  sm  → 84px  – notice has 2-row content but the banner shrinks
 *  md+ → 76px  – notice is single-row small chip + text
 */
export default function FloatingWhatsAppButton() {
  return (
    <Tooltip
      title={LABEL}
      placement="left"
      arrow
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: "#0f2942",
            color: "#f8fafc",
            fontWeight: 700,
            fontSize: "0.8125rem",
            borderRadius: "8px",
            border: "1px solid rgba(251,191,36,0.35)",
            boxShadow: "0 4px 14px rgba(15,23,42,0.35)",
            px: 1.5,
            py: 0.75,
          },
        },
        arrow: { sx: { color: "#0f2942" } },
      }}
    >
      {/*
       * The outer <a> owns the interactive role (keyboard/screen-reader).
       * The Fab inside is presentation-only (aria-hidden, tabIndex=-1).
       */}
      <Box
        component="a"
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={LABEL}
        id="icj-whatsapp-fab"
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 20 },
          bottom: { xs: 92, sm: 84, md: 76 },
          zIndex: 1300,
          display: "inline-flex",
          borderRadius: "50%",
          textDecoration: "none",
          outline: "none",
          // Visible focus ring for keyboard users
          "&:focus-visible": {
            outline: "3px solid #25D366",
            outlineOffset: "3px",
          },
          // Animated pulse halo
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            animation: "icjWaPulse 2.4s ease-out infinite",
          },
          "@keyframes icjWaPulse": {
            "0%": { boxShadow: "0 0 0 0 rgba(37, 211, 102, 0.60)" },
            "70%": { boxShadow: "0 0 0 16px rgba(37, 211, 102, 0)" },
            "100%": { boxShadow: "0 0 0 0 rgba(37, 211, 102, 0)" },
          },
        }}
      >
        <Fab
          component="span"
          aria-hidden="true"
          tabIndex={-1}
          sx={{
            bgcolor: "#25D366",
            color: "#ffffff",
            width: { xs: 52, sm: 56 },
            height: { xs: 52, sm: 56 },
            minHeight: "unset",
            boxShadow:
              "0 6px 24px rgba(37,211,102,0.55), 0 2px 8px rgba(0,0,0,0.18)",
            border: "2px solid rgba(255,255,255,0.28)",
            transition:
              "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease, background-color 0.2s ease",
            "&:hover": {
              bgcolor: "#1ebe5d",
              transform: "scale(1.1) translateY(-2px)",
              boxShadow:
                "0 10px 32px rgba(37,211,102,0.65), 0 4px 12px rgba(0,0,0,0.22)",
            },
            "&:active": {
              transform: "scale(0.95)",
              boxShadow: "0 4px 14px rgba(37,211,102,0.40)",
            },
            // Focus outline is on the parent <a>, not here
            "&:focus": { outline: "none" },
          }}
        >
          <WhatsAppIcon sx={{ fontSize: { xs: 28, sm: 30 } }} />
        </Fab>
      </Box>
    </Tooltip>
  );
}
