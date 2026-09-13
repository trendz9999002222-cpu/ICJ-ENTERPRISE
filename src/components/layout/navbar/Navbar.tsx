"use client";

import { AppBar, Box } from "@mui/material";

import InstitutionalBrandHeader from "./InstitutionalBrandHeader";
import MainNavBar from "./MainNavBar";
import MobileNavbar from "./MobileNavbar";
import TopUtilityBar from "./TopUtilityBar";

export default function Navbar() {
  return (
    <Box component="header" sx={{ width: "100%", zIndex: 1100, position: "relative" }}>
      {/* =================================================================== */}
      {/* DESKTOP MULTI-TIER INSTITUTIONAL HEADER (GST COUNCIL STYLE)         */}
      {/* =================================================================== */}
      <Box sx={{ display: { xs: "none", lg: "block" } }}>
        {/* Tier 1: Top Utility Bar (Helpline, Email, Access, Language Dropdown) */}
        <TopUtilityBar />

        {/* Tier 2: Main Institutional Branding Banner (Round Seal Logo + Bilingual Title) */}
        <InstitutionalBrandHeader />

        {/* Tier 3: Sticky Deep Navy Navigation Bar (Menu Dropdowns + Integrated Search) */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "#0f2942",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1050,
          }}
        >
          <MainNavBar />
        </AppBar>
      </Box>

      {/* =================================================================== */}
      {/* MOBILE / TABLET RESPONSIVE HEADER                                  */}
      {/* =================================================================== */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#ffffff",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1050,
          display: { xs: "block", lg: "none" },
        }}
      >
        <MobileNavbar />
      </AppBar>
    </Box>
  );
}
