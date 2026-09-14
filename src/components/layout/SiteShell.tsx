import { Box } from "@mui/material";

import { Navbar } from "@/components/layout/navbar";
import SiteFooter from "@/components/layout/SiteFooter";

type Props = {
  children: React.ReactNode;
};

export default function SiteShell({ children }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fafc",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          flex: "1 0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Box>
      <SiteFooter />
    </Box>
  );
}
