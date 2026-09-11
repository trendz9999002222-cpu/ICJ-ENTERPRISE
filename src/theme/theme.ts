"use client";

import { createTheme, responsiveFontSizes } from "@mui/material/styles";

import { RADIUS, SHAPE_RADIUS, SHADOW } from "./designTokens";

const baseTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode: "light",
    primary: { main: "#2563eb", dark: "#1d4ed8", light: "#60a5fa" },
    secondary: { main: "#0f172a" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#475569" },
  },
  typography: {
    fontFamily: 'var(--font-inter), "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h3: {
      letterSpacing: "-0.02em",
      fontSize: "clamp(1.45rem, 4vw, 3.1rem)",
    },
    h4: {
      fontSize: "clamp(1.25rem, 3vw, 2.25rem)",
    },
    h5: {
      letterSpacing: "-0.01em",
      fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
    },
    h6: {
      fontSize: "clamp(0.9rem, 1.5vw, 1.25rem)",
    },
    body1: {
      fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
    },
    button: { fontWeight: 700 },
  },
  shape: { borderRadius: SHAPE_RADIUS },
  shadows: [
    "none",
    SHADOW.card,
    SHADOW.card,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
    SHADOW.panel,
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f1f5f9",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.sm,
          textTransform: "none",
          fontWeight: 700,
          transition: "transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease",
        },
        contained: {
          boxShadow: "0 4px 14px rgba(37,99,235,0.28)",
          "&:hover": {
            boxShadow: "0 8px 22px rgba(37,99,235,0.36)",
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.sm,
          fontWeight: 700,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "16px",
          paddingRight: "16px",
          "@media (min-width: 600px)": {
            paddingLeft: "24px",
            paddingRight: "24px",
          },
          "@media (min-width: 1200px)": {
            paddingLeft: "32px",
            paddingRight: "32px",
          },
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiMenu: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiModal: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
  },
});

export const theme = responsiveFontSizes(baseTheme, {
  breakpoints: ["xs", "sm", "md", "lg", "xl"],
  factor: 2.5,
});
