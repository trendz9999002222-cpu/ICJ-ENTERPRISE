"use client";

import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GavelIcon from "@mui/icons-material/Gavel";
import HeadsetIcon from "@mui/icons-material/Headset";
import MenuIcon from "@mui/icons-material/Menu";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { searchContent, SearchEntry, CATEGORY_CONFIG } from "@/data/public/searchIndex";

import { NAV_DIRECT_LINKS, NAV_MODULES, NAV_VERIFICATION_LINKS } from "@/config/navModules";

import LanguageSelector from "./LanguageSelector";

export default function MobileNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchEntry[]>([]);
  const router = useRouter();

  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setSearchResults(searchContent(val));
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = (href: string) => {
    setDrawerOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(href);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectResult(searchResults[0].href);
    }
  };

  return (
    <Box sx={{ display: { xs: "block", lg: "none" }, width: "100%" }}>
      {/* Mobile Top Mini Bar (Helpline & Language) */}
      <Box
        sx={{
          bgcolor: "#f1f5f9",
          borderBottom: "1px solid #e2e8f0",
          py: 0.5,
          px: 1.5,
        }}
      >
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Box
            component="a"
            href="tel:+91-9999002222"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "#0f172a",
              fontWeight: 700,
              fontSize: "0.72rem",
              textDecoration: "none",
            }}
          >
            <PhoneInTalkIcon sx={{ fontSize: 13, color: "#2563eb" }} />
                <span>24x7 Help: +91-9999002222</span>
          </Box>

          <LanguageSelector compact />
        </Stack>
      </Box>

      {/* Mobile Main Header */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          borderBottom: "2px solid #0f2942",
          py: 1,
          px: 1.5,
        }}
      >
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo + Title */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              textDecoration: "none",
              color: "inherit",
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: { xs: 42, sm: 48 },
                height: { xs: 42, sm: 48 },
                borderRadius: "50%",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.15)",
                p: 0.2,
                bgcolor: "#ffffff",
                border: "1.5px solid #e2e8f0",
              }}
            >
              <Image
                src="/images/icj-logo.png"
                alt="ICJ Emblem"
                width={48}
                height={48}
                priority
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "50%",
                }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "0.85rem", sm: "1rem" },
                  color: "#0f2942",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                ICJ
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  color: "#b45309",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                JUSTICE • INTEGRITY • HUMANITY
              </Typography>
            </Box>
          </Box>

          {/* Quick Action & Hamburger Menu */}
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flexShrink: 0 }}>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              size="small"
              sx={{ color: "#334155" }}
              aria-label="Search portal"
            >
              <SearchIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <Button
              component={Link}
              href="/assistance"
              variant="contained"
              size="small"
              sx={{
                bgcolor: "#2563eb",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.72rem",
                textTransform: "none",
                px: 1.2,
                py: 0.5,
                borderRadius: 1.5,
                whiteSpace: "nowrap",
                display: { xs: "none", sm: "inline-flex" },
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              Seek Help
            </Button>

            <IconButton
              onClick={() => setDrawerOpen(true)}
              size="small"
              sx={{
                color: "#ffffff",
                bgcolor: "#0f2942",
                p: 0.8,
                borderRadius: 1.5,
                "&:hover": { bgcolor: "#1e3a8a" },
              }}
              aria-label="Open mobile navigation menu"
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Slide-out Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: "100%",
              maxWidth: { xs: "100%", sm: 380 },
              bgcolor: "#ffffff",
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e2e8f0",
            bgcolor: "#0f2942",
            color: "#ffffff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                bgcolor: "#ffffff",
                p: 0.2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            >
              <Image
                src="/images/icj-logo.png"
                alt="ICJ"
                width={38}
                height={38}
                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "50%" }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "0.85rem", color: "#ffffff", lineHeight: 1.2 }}>
                ICJ PUBLIC PORTAL
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "#cbd5e1" }}>
                Democratizing Justice Worldwide
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={() => setDrawerOpen(false)}
            size="small"
            sx={{ color: "#ffffff" }}
            aria-label="Close menu"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Drawer Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {/* In-drawer Search Form */}
          <Paper
            component="form"
            onSubmit={handleSearchSubmit}
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 0.5,
              border: "1px solid #cbd5e1",
              borderRadius: 2,
              mb: searchQuery.trim().length >= 2 ? 1 : 2,
              bgcolor: "#f8fafc",
            }}
          >
            <InputBase
              placeholder="Search acts, services, jurists..."
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              sx={{ ml: 1, flex: 1, fontSize: "0.85rem" }}
            />
            <IconButton type="submit" size="small" sx={{ p: 0.75, color: "#2563eb" }}>
              <SearchIcon />
            </IconButton>
          </Paper>

          {/* Live Mobile Search Results */}
          {searchQuery.trim().length >= 2 && (
            <Box
              sx={{
                mb: 2.5,
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            >
              {searchResults.length > 0 ? (
                <List disablePadding>
                  {searchResults.slice(0, 6).map((item) => {
                    const cfg = CATEGORY_CONFIG[item.category];
                    return (
                      <ListItemButton
                        key={item.id}
                        onClick={() => handleSelectResult(item.href)}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          py: 1,
                          px: 1.5,
                          borderBottom: "1px solid #f1f5f9",
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.25, width: "100%" }}>
                          <Chip
                            label={cfg.label}
                            size="small"
                            sx={{
                              bgcolor: cfg.color,
                              color: "#ffffff",
                              fontSize: "0.62rem",
                              fontWeight: 700,
                              height: 18,
                            }}
                          />
                          <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#0f172a", flex: 1 }}>
                            {item.title}
                          </Typography>
                        </Stack>
                        {item.subtitle && (
                          <Typography sx={{ fontSize: "0.72rem", color: "#64748b", lineHeight: 1.3 }}>
                            {item.subtitle}
                          </Typography>
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    No matching records for &quot;{searchQuery}&quot;
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Quick Primary Action Buttons */}
          <Stack spacing={1} sx={{ mb: 2.5 }}>
            <Button
              component={Link}
              href="/assistance"
              onClick={() => setDrawerOpen(false)}
              variant="contained"
              fullWidth
              startIcon={<GavelIcon />}
              sx={{
                bgcolor: "#2563eb",
                fontWeight: 800,
                fontSize: "0.875rem",
                textTransform: "none",
                py: 1.2,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              Seek Legal Assistance
            </Button>

            <Button
              component={Link}
              href="/professionals"
              onClick={() => setDrawerOpen(false)}
              variant="outlined"
              fullWidth
              startIcon={<PersonSearchIcon />}
              sx={{
                borderColor: "#cbd5e1",
                color: "#0f2942",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "none",
                py: 1.1,
                borderRadius: 2,
                "&:hover": { bgcolor: "#f8fafc", borderColor: "#0f2942" },
              }}
            >
              Find Empaneled Jurists
            </Button>
          </Stack>

          {/* Direct Main Links */}
          <Stack spacing={0.5} sx={{ mb: 1 }}>
            {NAV_DIRECT_LINKS.map((link) => (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  color: "#0f2942",
                  fontWeight: 700,
                  fontSize: "0.925rem",
                  textTransform: "none",
                  py: 1,
                }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          {/* Collapsible Accordion Sections */}
          {NAV_MODULES.map((section) => (
            <Accordion
              key={section.key}
              disableGutters
              elevation={0}
              sx={{
                "&:before": { display: "none" },
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: "#64748b" }} />}
                sx={{ px: 0.5, py: 0.5, minHeight: 44 }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f2942" }}>
                  {section.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
                <Stack spacing={0.75}>
                  {section.items.map((item) => (
                    <Box
                      key={item.href}
                      component={Link}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      sx={{
                        textDecoration: "none",
                        color: "#475569",
                        fontSize: "0.8125rem",
                        py: 0.6,
                        display: "block",
                        "&:hover": { color: "#2563eb" },
                      }}
                    >
                      {item.label}
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Verification & Compliance Links */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", px: 0.5 }}>
            Verification & Compliance
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {NAV_VERIFICATION_LINKS.map((link) => (
              <Box
                key={link.href}
                component={Link}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textDecoration: "none",
                  color: "#334155",
                  fontSize: "0.825rem",
                  py: 0.5,
                  px: 0.5,
                }}
              >
                {(link.href === "/verify-certificate" || link.href === "/verify-donation") && (
                  <VerifiedOutlinedIcon
                    sx={{
                      fontSize: 18,
                      color: link.href === "/verify-donation" ? "#059669" : "#2563eb",
                    }}
                  />
                )}
                {link.label}
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Drawer Footer Login & Helpline */}
        <Box sx={{ p: 2, borderTop: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
          <Button
            component={Link}
            href="/login"
            onClick={() => setDrawerOpen(false)}
            variant="outlined"
            fullWidth
            sx={{
              borderColor: "#cbd5e1",
              color: "#0f2942",
              fontWeight: 700,
              textTransform: "none",
              py: 1,
              borderRadius: 2,
              mb: 1.5,
            }}
          >
            Advocate / Member Login
          </Button>

          <Stack direction="row" spacing={1} sx={{ justifyContent: "center", alignItems: "center" }}>
            <HeadsetIcon sx={{ fontSize: 16, color: "#2563eb" }} />
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Emergency Helpline: +91-9999002222
            </Typography>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
