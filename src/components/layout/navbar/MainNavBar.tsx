"use client";

import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  ClickAwayListener,
  Divider,
  Grid,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { NAV_MODULES, NAV_VERIFICATION_LINKS } from "@/config/navModules";
import { CATEGORY_CONFIG, SearchEntry, searchContent } from "@/data/public/searchIndex";

// ─────────────────────────────────────────────────────────────────────────────
// NAV STYLE CONSTANTS  (navy background = #0f2942)
// ─────────────────────────────────────────────────────────────────────────────
const NAV_BTN_BASE = {
  color: "#cbd5e1",
  fontWeight: 700,
  fontSize: "0.8125rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  px: 1.15,
  py: 0,
  borderRadius: 0,
  minHeight: 48,
  border: "none",
  borderBottom: "3px solid transparent",
  transition: "all 0.18s",
  "&:hover": {
    color: "#ffffff",
    bgcolor: "rgba(255,255,255,0.07)",
    borderBottom: "3px solid rgba(255,255,255,0.35)",
  },
};

const NAV_BTN_ACTIVE = {
  color: "#ffffff",
  bgcolor: "rgba(255,255,255,0.10)",
  borderBottom: "3px solid #f59e0b",
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY DROPDOWN DEFINITIONS (shown directly in nav bar)
// ─────────────────────────────────────────────────────────────────────────────
type DropItem = { label: string; href: string; description?: string; badge?: string };
type DropSection = { heading?: string; items: DropItem[] };

const PRIMARY_DROPDOWNS: {
  key: string;
  label: string;
  activePaths?: string[];
  sections: DropSection[];
}[] = [
    ...NAV_MODULES.map((mod) => ({
      key: mod.key,
      label: mod.navLabel,
      activePaths: mod.activePaths,
      sections: [{ heading: mod.title, items: mod.items }],
    })),
    {
      key: "verify",
      label: "Verify",
      activePaths: ["/verify-certificate", "/verify-donation", "/grievance"],
      sections: [
        {
          heading: "Verification & Compliance",
          items: NAV_VERIFICATION_LINKS,
        },
      ],
    },
  ];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MainNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // ─── LIVE SEARCH STATE ───
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchEntry[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchInput = useCallback((value: string) => {
    setSearchTerm(value);
    if (value.trim().length >= 2) {
      setSearchResults(searchContent(value));
      setSearchOpen(true);
    } else {
      setSearchResults([]);
      setSearchOpen(false);
    }
  }, []);

  const handleSearchNavigate = (href: string) => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchOpen(false);
    router.push(href);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchOpen(false);
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, key: string) => {
    setAnchorEl(e.currentTarget);
    setActiveKey(key);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setActiveKey(null);
  };

  const isNavActive = (paths?: string[]) =>
    paths?.some((p) => pathname.startsWith(p)) ?? false;

  const activeDrop = PRIMARY_DROPDOWNS.find((d) => d.key === activeKey);


  return (
    <Box
      sx={{
        bgcolor: "#0f2942",
        borderBottom: "2px solid #b45309",
        width: "100%",
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          px: { lg: 2, xl: 4 },
        }}
      >
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "stretch", minHeight: 48 }}
        >
          {/* ─── PRIMARY NAV LINKS ─── */}
          <Stack direction="row" sx={{ alignItems: "stretch" }}>
            {/* HOME */}
            <Button
              component={Link}
              href="/"
              startIcon={<HomeIcon sx={{ fontSize: 16 }} />}
              sx={{
                ...NAV_BTN_BASE,
                ...(pathname === "/" ? NAV_BTN_ACTIVE : {}),
              }}
            >
              Home
            </Button>

            {/* PRIMARY DROPDOWNS (same modules as mobile) */}
            {PRIMARY_DROPDOWNS.map((drop) => {
              const active = drop.key === activeKey || isNavActive(drop.activePaths);
              return (
                <Button
                  key={drop.key}
                  onClick={(e) => openMenu(e, drop.key)}
                  endIcon={
                    <ExpandMoreIcon
                      sx={{
                        fontSize: "14px !important",
                        transition: "transform 0.2s",
                        transform: activeKey === drop.key ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  }
                  sx={{
                    ...NAV_BTN_BASE,
                    ...(active ? NAV_BTN_ACTIVE : {}),
                  }}
                >
                  {drop.label}
                </Button>
              );
            })}

            {/* MEMBERSHIP — direct link */}
            <Button
              component={Link}
              href="/membership"
              sx={{
                ...NAV_BTN_BASE,
                ...(pathname.startsWith("/membership") ? NAV_BTN_ACTIVE : {}),
              }}
            >
              Membership
            </Button>

            {/* CONTACT — direct link */}
            <Button
              component={Link}
              href="/contact"
              sx={{
                ...NAV_BTN_BASE,
                ...(pathname === "/contact" ? NAV_BTN_ACTIVE : {}),
              }}
            >
              Contact
            </Button>
          </Stack>

          {/* ─── RIGHT SIDE: LIVE SEARCH BOX ─── */}
          <Stack direction="row" sx={{ alignItems: "center", pr: 0.5, position: "relative" }}>
            <ClickAwayListener onClickAway={() => setSearchOpen(false)}>
              <Box sx={{ position: "relative" }}>
                {/* Search input */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: searchOpen ? "6px 6px 0 0" : 1.5,
                    overflow: "visible",
                    height: 36,
                    width: { lg: 240, xl: 300 },
                    transition: "all 0.2s",
                    "&:focus-within": {
                      bgcolor: "rgba(255,255,255,0.18)",
                      borderColor: "rgba(255,255,255,0.6)",
                    },
                  }}
                >
                  <SearchIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.75)", ml: 1.25, flexShrink: 0 }} />
                  <InputBase
                    placeholder="Search portal..."
                    value={searchTerm}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    inputProps={{ "aria-label": "Search ICJ portal" }}
                    sx={{
                      px: 1,
                      flex: 1,
                      fontSize: "0.8125rem",
                      color: "#ffffff",
                      "& input": { py: 0, "&::placeholder": { color: "rgba(255,255,255,0.65)", opacity: 1 } },
                    }}
                  />
                  {searchTerm && (
                    <IconButton
                      size="small"
                      onClick={clearSearch}
                      sx={{ color: "rgba(255,255,255,0.6)", p: 0.5, mr: 0.5 }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>

                {/* ── Live Search Results Dropdown ── */}
                {searchOpen && searchResults.length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 9999,
                      border: "1px solid #e2e8f0",
                      borderTop: "2px solid #b45309",
                      borderRadius: "0 0 8px 8px",
                      boxShadow: "0 16px 40px rgba(15,23,42,0.18)",
                      maxHeight: 400,
                      overflowY: "auto",
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Stack divider={<Divider />}>
                      {searchResults.map((result) => {
                        const cat = CATEGORY_CONFIG[result.category];
                        return (
                          <Box
                            key={result.id}
                            component="button"
                            onClick={() => handleSearchNavigate(result.href)}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1.5,
                              px: 1.5,
                              py: 1,
                              bgcolor: "transparent",
                              border: "none",
                              cursor: "pointer",
                              textAlign: "left",
                              width: "100%",
                              "&:hover": { bgcolor: "#f8fafc" },
                            }}
                          >
                            <Box sx={{ flexShrink: 0, pt: 0.3 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: cat.color,
                                  mt: 0.6,
                                }}
                              />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.84rem",
                                  fontWeight: 700,
                                  color: "#0f2942",
                                  lineHeight: 1.3,
                                }}
                              >
                                {result.title}
                              </Typography>
                              {result.subtitle && (
                                <Typography
                                  sx={{
                                    fontSize: "0.72rem",
                                    color: "#64748b",
                                    lineHeight: 1.4,
                                    mt: 0.15,
                                  }}
                                >
                                  {result.subtitle}
                                </Typography>
                              )}
                            </Box>
                            <Chip
                              label={cat.label}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                bgcolor: cat.color + "18",
                                color: cat.color,
                                borderRadius: 0.75,
                                flexShrink: 0,
                                "& .MuiChip-label": { px: 0.75 },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>

                    {/* Footer hint */}
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        bgcolor: "#f8fafc",
                        borderTop: "1px solid #f1f5f9",
                      }}
                    >
                      <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                        {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{searchTerm}&rdquo;
                      </Typography>
                    </Box>
                  </Paper>
                )}

                {/* No results */}
                {searchOpen && searchTerm.length >= 2 && searchResults.length === 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 9999,
                      border: "1px solid #e2e8f0",
                      borderTop: "2px solid #b45309",
                      borderRadius: "0 0 8px 8px",
                      boxShadow: "0 16px 40px rgba(15,23,42,0.18)",
                      bgcolor: "#ffffff",
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                      No results found for &ldquo;{searchTerm}&rdquo;
                    </Typography>
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>
          </Stack>
        </Stack>
      </Box>

      {/* ─── MEGA-DROPDOWN PANEL ─── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        disableScrollLock
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 0,
              borderRadius: "0 0 10px 10px",
              boxShadow: "0 16px 48px rgba(15,23,42,0.20)",
              border: "1px solid #e2e8f0",
              borderTop: "3px solid #b45309",
              p: 0,
              overflow: "hidden",
              minWidth: activeDrop && activeDrop.sections.length > 1 ? 640 : 340,
              maxWidth: 780,
            },
          },
        }}
      >
        {activeDrop && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={activeDrop.sections.length > 1 ? 2 : 0}>
              {activeDrop.sections.map((section, sIdx) => (
                <Grid
                  key={sIdx}
                  // MUI v9 uses size prop
                  size={{
                    xs: 12,
                    sm: activeDrop.sections.length === 1 ? 12 : activeDrop.sections.length === 2 ? 6 : 6,
                  }}
                >
                  {section.heading && (
                    <>
                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          color: "#0f2942",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          px: 1,
                          mb: 0.75,
                        }}
                      >
                        {section.heading}
                      </Typography>
                      {sIdx > 0 && <Divider sx={{ mb: 1 }} />}
                    </>
                  )}

                  <Stack spacing={0.25}>
                    {section.items.map((item) => (
                      <MenuItem
                        key={item.href}
                        component={Link}
                        href={item.href}
                        onClick={closeMenu}
                        sx={{
                          borderRadius: 1.5,
                          px: 1.25,
                          py: 0.9,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          "&:hover": { bgcolor: "#f0f6ff" },
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.8375rem",
                              color: "#0f2942",
                              lineHeight: 1.3,
                            }}
                          >
                            {item.label}
                          </Typography>
                          {item.description && (
                            <Typography
                              sx={{
                                fontSize: "0.72rem",
                                color: "#64748b",
                                lineHeight: 1.4,
                                mt: 0.15,
                              }}
                            >
                              {item.description}
                            </Typography>
                          )}
                        </Box>
                        {item.badge && (
                          <Chip
                            label={item.badge}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              bgcolor: "#b45309",
                              color: "#ffffff",
                              borderRadius: 1,
                              flexShrink: 0,
                              "& .MuiChip-label": { px: 0.75 },
                            }}
                          />
                        )}
                      </MenuItem>
                    ))}
                  </Stack>

                  {sIdx < activeDrop.sections.length - 1 && (
                    <Divider sx={{ mt: 1.5, mb: 0 }} />
                  )}
                </Grid>
              ))}
            </Grid>

            {/* Dropdown footer CTA strip */}
            {activeDrop.key === "services" && (
              <Paper
                elevation={0}
                sx={{
                  mt: 1.5,
                  p: 1.25,
                  bgcolor: "#f8fafc",
                  borderRadius: 1.5,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography sx={{ fontSize: "0.78rem", color: "#475569", fontWeight: 600 }}>
                  Need expert legal guidance? Book a free first consultation.
                </Typography>
                <Button
                  component={Link}
                  href="/assistance"
                  onClick={closeMenu}
                  size="small"
                  variant="contained"
                  sx={{
                    bgcolor: "#0f2942",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "none",
                    px: 2,
                    borderRadius: 1,
                    whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "#1e3a5f" },
                  }}
                >
                  Seek Assistance →
                </Button>
              </Paper>
            )}
          </Box>
        )}
      </Menu>
    </Box>
  );
}
