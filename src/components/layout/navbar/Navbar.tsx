"use client";

import { AppBar, Box, Container, Toolbar } from "@mui/material";

import NavbarBrand from "@/components/layout/navbar/NavbarBrand";
import NavbarMenu from "@/components/layout/navbar/NavbarMenu";
import { NAVBAR_HEIGHT } from "@/constants/layout";

export default function Navbar() {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "rgba(15,23,42,0.94)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 24px rgba(15,23,42,0.22)",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 1200,
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>
        <Toolbar
          disableGutters
          sx={{
            height: {
              xs: NAVBAR_HEIGHT.xs,
              sm: NAVBAR_HEIGHT.sm,
              md: NAVBAR_HEIGHT.md,
              lg: NAVBAR_HEIGHT.lg,
            },
            minHeight: {
              xs: NAVBAR_HEIGHT.xs,
              sm: NAVBAR_HEIGHT.sm,
              md: NAVBAR_HEIGHT.md,
              lg: NAVBAR_HEIGHT.lg,
            },
            maxHeight: {
              xs: NAVBAR_HEIGHT.xs,
              sm: NAVBAR_HEIGHT.sm,
              md: NAVBAR_HEIGHT.md,
              lg: NAVBAR_HEIGHT.lg,
            },
            py: 0,
            overflow: "visible",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
          }}
        >
          <NavbarBrand />
          <Box sx={{ flexShrink: 0 }}>
            <NavbarMenu />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
