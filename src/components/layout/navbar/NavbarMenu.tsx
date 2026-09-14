"use client";

import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { NAV_MODULES, NAV_VERIFICATION_LINKS } from "@/config/navModules";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavDropdown = {
  label: string;
  items: { label: string; href: string; description?: string }[];
};

const DROPDOWNS: Record<string, NavDropdown> = Object.fromEntries(
  NAV_MODULES.map((mod) => [mod.key, { label: mod.title, items: mod.items }]),
);

export default function NavbarMenu() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const pathname = usePathname();

  // Mobile Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Desktop Dropdown State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);

  const handleOpenDropdown = (event: React.MouseEvent<HTMLElement>, key: string) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuKey(key);
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null);
    setActiveMenuKey(null);
  };

  return (
    <>
      {/* =================================================================== */}
      {/* DESKTOP NAVIGATION BAR                                              */}
      {/* =================================================================== */}
      {isDesktop ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {NAV_MODULES.map((mod) => (
            <Button
              key={mod.key}
              onClick={(e) => handleOpenDropdown(e, mod.key)}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
              sx={{
                color: mod.activePaths.some((p) => pathname.startsWith(p)) ? "#2563eb" : "#334155",
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: "none",
                px: 1.25,
                "&:hover": { color: "#2563eb", bgcolor: "#f8fafc" },
              }}
            >
              {mod.navLabel}
            </Button>
          ))}

          <Button
            component={Link}
            href="/membership"
            sx={{
              color: pathname.startsWith("/membership") ? "#2563eb" : "#334155",
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              px: 1.25,
              "&:hover": { color: "#2563eb", bgcolor: "#f8fafc" },
            }}
          >
            Membership
          </Button>

          <Button
            component={Link}
            href="/contact"
            sx={{
              color: pathname === "/contact" ? "#2563eb" : "#334155",
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              px: 1.25,
              "&:hover": { color: "#2563eb", bgcolor: "#f8fafc" },
            }}
          >
            Contact
          </Button>

          {/* Search Icon button */}
          <IconButton
            component={Link}
            href="/search"
            size="small"
            sx={{
              color: "#64748b",
              "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" },
            }}
            aria-label="search"
          >
            <SearchIcon fontSize="small" />
          </IconButton>

          {/* Verify Certificate link */}
          <IconButton
            component={Link}
            href="/verify-certificate"
            size="small"
            title="Verify Certificate"
            sx={{
              color: "#64748b",
              "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" },
            }}
            aria-label="verify certificate"
          >
            <VerifiedOutlinedIcon fontSize="small" />
          </IconButton>

          <Divider orientation="vertical" flexItem sx={{ height: 20, my: "auto", mx: 0.5 }} />

          <Button
            component={Link}
            href="/login"
            sx={{
              color: "#334155",
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              px: 1.5,
              "&:hover": { color: "#2563eb", bgcolor: "#f8fafc" },
            }}
          >
            Sign In
          </Button>

          {/* Primary CTA */}
          <Button
            component={Link}
            href="/assistance"
            variant="contained"
            sx={{
              bgcolor: "#2563eb",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.875rem",
              textTransform: "none",
              px: 2.25,
              py: 0.9,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            Seek Assistance
          </Button>

          {/* Dropdown Menu Popup */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseDropdown}
            slotProps={{
              paper: {
                sx: {
                  mt: 1.5,
                  borderRadius: 2.5,
                  boxShadow: "0 12px 36px rgba(15,23,42,0.12)",
                  border: "1px solid #e2e8f0",
                  minWidth: 280,
                  p: 1,
                },
              },
            }}
          >
            {activeMenuKey &&
              DROPDOWNS[activeMenuKey]?.items.map((item) => (
                <MenuItem
                  key={item.href}
                  component={Link}
                  href={item.href}
                  onClick={handleCloseDropdown}
                  sx={{
                    borderRadius: 1.5,
                    py: 1,
                    px: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    "&:hover": { bgcolor: "#f8fafc" },
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#0f172a" }}>
                    {item.label}
                  </Typography>
                  {item.description && (
                    <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {item.description}
                    </Typography>
                  )}
                </MenuItem>
              ))}
          </Menu>
        </Stack>
      ) : (
        /* =================================================================== */
        /* MOBILE HAMBURGER BUTTON                                             */
        /* =================================================================== */
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <IconButton
            component={Link}
            href="/search"
            size="small"
            sx={{ color: "#334155" }}
            aria-label="search"
          >
            <SearchIcon fontSize="small" />
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
              fontSize: "0.75rem",
              textTransform: "none",
              px: 1.5,
              py: 0.6,
              borderRadius: 1.5,
            }}
          >
            Assistance
          </Button>

          <IconButton
            onClick={() => setDrawerOpen(true)}
            size="medium"
            sx={{ color: "#0f172a", p: 1 }}
            aria-label="open mobile navigation menu"
          >
            <MenuIcon />
          </IconButton>
        </Stack>
      )}

      {/* =================================================================== */}
      {/* MOBILE FULL-SCREEN ACCORDION DRAWER                                 */}
      {/* =================================================================== */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: "100%",
              maxWidth: 360,
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
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Navigation Menu
          </Typography>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            size="small"
            sx={{ color: "#64748b" }}
            aria-label="close menu"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Drawer Scrollable Body */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {/* Quick Primary Actions */}
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Button
              component={Link}
              href="/assistance"
              onClick={() => setDrawerOpen(false)}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#2563eb",
                fontWeight: 700,
                textTransform: "none",
                py: 1.25,
                borderRadius: 2,
              }}
            >
              Seek Assistance
            </Button>

            <Button
              component={Link}
              href="/professionals"
              onClick={() => setDrawerOpen(false)}
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "#cbd5e1",
                color: "#334155",
                fontWeight: 600,
                textTransform: "none",
                py: 1.25,
                borderRadius: 2,
              }}
            >
              Find a Professional
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Simple Direct Links */}
          <Stack spacing={0.5}>
            <Button
              component={Link}
              href="/about"
              onClick={() => setDrawerOpen(false)}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                color: "#0f172a",
                fontWeight: 600,
                fontSize: "0.95rem",
                textTransform: "none",
                py: 1.25,
              }}
            >
              About ICJ
            </Button>

            <Button
              component={Link}
              href="/membership"
              onClick={() => setDrawerOpen(false)}
              fullWidth
              sx={{
                justifyContent: "flex-start",
                color: "#0f172a",
                fontWeight: 600,
                fontSize: "0.95rem",
                textTransform: "none",
                py: 1.25,
              }}
            >
              Join ICJ (Membership)
            </Button>
          </Stack>

          {/* Accordion Categories */}
          {Object.entries(DROPDOWNS).map(([key, section]) => (
            <Accordion
              key={key}
              disableGutters
              elevation={0}
              sx={{
                "&:before": { display: "none" },
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}
                sx={{ px: 1, py: 0.5, minHeight: 48 }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#0f172a" }}>
                  {section.label}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 1.5, pt: 0 }}>
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
                        fontSize: "0.875rem",
                        py: 0.75,
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

          {/* Bottom Utility Links */}
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1}>
            <Box
              component={Link}
              href="/verify-certificate"
              onClick={() => setDrawerOpen(false)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
                color: "#475569",
                fontSize: "0.875rem",
                py: 0.75,
              }}
            >
              <VerifiedOutlinedIcon sx={{ fontSize: 18, color: "#2563eb" }} />
              Verify Certificate
            </Box>

            <Box
              component={Link}
              href="/verify-donation"
              onClick={() => setDrawerOpen(false)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
                color: "#475569",
                fontSize: "0.875rem",
                py: 0.75,
              }}
            >
              <VerifiedOutlinedIcon sx={{ fontSize: 18, color: "#16a34a" }} />
              Verify Donation
            </Box>

            <Box
              component={Link}
              href="/grievance"
              onClick={() => setDrawerOpen(false)}
              sx={{
                textDecoration: "none",
                color: "#475569",
                fontSize: "0.875rem",
                py: 0.75,
              }}
            >
              Grievance Redressal
            </Box>

            <Box
              component={Link}
              href="/contact"
              onClick={() => setDrawerOpen(false)}
              sx={{
                textDecoration: "none",
                color: "#475569",
                fontSize: "0.875rem",
                py: 0.75,
              }}
            >
              Contact ICJ
            </Box>
          </Stack>
        </Box>

        {/* Drawer Footer Login */}
        <Box sx={{ p: 2, borderTop: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
          <Button
            component={Link}
            href="/login"
            onClick={() => setDrawerOpen(false)}
            variant="outlined"
            fullWidth
            sx={{
              borderColor: "#cbd5e1",
              color: "#0f172a",
              fontWeight: 700,
              textTransform: "none",
              py: 1,
              borderRadius: 2,
            }}
          >
            Member / Professional Login
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
