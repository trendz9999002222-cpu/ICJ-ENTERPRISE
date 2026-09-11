import { Box } from "@mui/material";

import { Navbar } from "@/components/layout/navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import { NAVBAR_HEIGHT } from "@/constants/layout";

type Props = {
  children: React.ReactNode;
};

/** Reserves space for the fixed navbar so content never sits underneath it. */
function NavbarSpacer() {
  return (
    <Box
      aria-hidden
      sx={{
        height: {
          xs: NAVBAR_HEIGHT.xs,
          sm: NAVBAR_HEIGHT.sm,
          md: NAVBAR_HEIGHT.md,
          lg: NAVBAR_HEIGHT.lg,
        },
        flexShrink: 0,
        bgcolor: "#0f172a",
      }}
    />
  );
}

export default function SiteShell({ children }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fafc",
        width: "100%",
        overflow: "visible",
      }}
    >
      <Navbar />
      <NavbarSpacer />
      <Box
        component="main"
        sx={{
          flex: "1 0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
        }}
      >
        {children}
      </Box>
      <SiteFooter />
    </Box>
  );
}
