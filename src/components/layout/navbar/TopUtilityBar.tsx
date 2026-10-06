"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import HeadsetIcon from "@mui/icons-material/Headset";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";

import LanguageSelector from "./LanguageSelector";

export default function TopUtilityBar() {
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);

  const handleAdjustFontSize = (delta: number) => {
    setFontSizeOffset((prev) => {
      const next = Math.max(-2, Math.min(2, delta === 0 ? 0 : prev + delta));
      return next;
    });
  };

  return (
    <Box
      sx={{
        bgcolor: "#f1f5f9",
        borderBottom: "1px solid #e2e8f0",
        py: { xs: 0.5, sm: 0.6 },
        px: 0,
        fontSize: "0.75rem",
        color: "#475569",
        width: "100%",
        overflowX: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3, md: 4 } }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            minWidth: "max-content",
          }}
        >
          {/* Left Side: Contact Information & Accessibility */}
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 2, md: 2.5 }}
            sx={{
              alignItems: "center",
              flexWrap: "nowrap",
              whiteSpace: "nowrap",
            }}
          >
            {/* Direct Helpline */}
            <Box
              component="a"
              href="tel:+919999002222"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                color: "#0f172a",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                whiteSpace: "nowrap",
                "&:hover": { color: "#2563eb" },
              }}
            >
              <PhoneInTalkIcon sx={{ fontSize: 14, color: "#2563eb" }} />
              <span>
                <Box component="span" sx={{ display: { xs: "none", md: "inline" }, color: "#475569", fontWeight: 500 }}>
                  24x7 Legal Helpline:{" "}
                </Box>
                +91-9999002222  | +91-9717166436
              </span>
            </Box>

            {/* Landline (Desktop) */}
            <Box
              component="a"
              href="tel:+911140501642"
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                gap: 0.6,
                color: "#475569",
                textDecoration: "none",
                fontSize: "0.8125rem",
                whiteSpace: "nowrap",
                "&:hover": { color: "#2563eb" },
              }}
            >
              <HeadsetIcon sx={{ fontSize: 14, color: "#059669" }} />
              <span>Landline: 011-40501642</span>
            </Box>

            {/* Email Support (Desktop) */}
            <Box
              component="a"
              href="https://mail.google.com/mail/?view=cm&fs=1&to=consortiumofjurists@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 0.6,
                color: "#475569",
                textDecoration: "none",
                fontSize: "0.8125rem",
                whiteSpace: "nowrap",
                "&:hover": {
                  color: "#2563eb",
                },
              }}
            >
              <EmailIcon sx={{ fontSize: 14, color: "#64748b" }} />
              <span>consortiumofjurists@gmail.com</span>
            </Box>

            {/* Office Timings (Large Desktop) */}
            <Box
              sx={{
                display: { xs: "none", xl: "flex" },
                alignItems: "center",
                gap: 0.6,
                color: "#64748b",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 13 }} />
              <span>Mon–Sat: 11:00 AM – 6:00 PM IST</span>
            </Box>
          </Stack>

          {/* Right Side: Quick Links, Font Resize, Screen Reader & Multi-Language Dropdown */}
          <Stack direction="row" spacing={{ xs: 0.75, sm: 1.5 }} sx={{ alignItems: "center" }}>
            {/* Quick Links (Desktop) */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
              }}
            >
              <Link
                href="/grievance"
                style={{ color: "#475569", textDecoration: "none", fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}
              >
                Citizen Helpdesk
              </Link>
              <Divider orientation="vertical" flexItem sx={{ height: 12, my: "auto" }} />
              <Link
                href="/terms#rti"
                style={{ color: "#475569", textDecoration: "none", fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}
              >
                RTI & Transparency
              </Link>
              <Divider orientation="vertical" flexItem sx={{ height: 12, my: "auto" }} />
            </Stack>

            {/* Text Zoom Controls (Desktop/Tablet) */}
            <Stack
              direction="row"
              spacing={0.3}
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 1,
                px: 0.5,
                py: 0.2,
              }}
            >
              <Button
                size="small"
                onClick={() => handleAdjustFontSize(-1)}
                sx={{
                  minWidth: 22,
                  px: 0.3,
                  py: 0,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: fontSizeOffset < 0 ? "#2563eb" : "#475569",
                }}
                aria-label="Decrease Font Size"
              >
                A-
              </Button>
              <Button
                size="small"
                onClick={() => handleAdjustFontSize(0)}
                sx={{
                  minWidth: 22,
                  px: 0.3,
                  py: 0,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: fontSizeOffset === 0 ? "#2563eb" : "#475569",
                }}
                aria-label="Reset Font Size"
              >
                A
              </Button>
              <Button
                size="small"
                onClick={() => handleAdjustFontSize(1)}
                sx={{
                  minWidth: 22,
                  px: 0.3,
                  py: 0,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: fontSizeOffset > 0 ? "#2563eb" : "#475569",
                }}
                aria-label="Increase Font Size"
              >
                A+
              </Button>
            </Stack>

            {/* Multi-Language Dropdown Component */}
            <LanguageSelector compact />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
