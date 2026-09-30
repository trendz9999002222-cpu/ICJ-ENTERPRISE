"use client";

import { Box, useMediaQuery, useTheme } from "@mui/material";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import MandatorySetPasswordGate from "@/components/features/dashboard/auth/MandatorySetPasswordGate";
import { logAdminActivity, resolveUrlTitle } from "@/lib/adminActivity";
import AdminHeader from "./AdminHeader";
import AdminSidebar, { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from "./AdminSidebar";

// =============================================================================
// AdminShell
//
// Composes sidebar + header + main content area.
// Handles responsive sidebar behaviour:
//   - Desktop: persistent collapsible sidebar
//   - Mobile: temporary drawer (overlay)
// =============================================================================

type Props = {
  children: React.ReactNode;
};

export default function AdminShell({ children }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      const { title, type } = resolveUrlTitle(pathname);
      logAdminActivity({
        title,
        url: pathname,
        type,
        description: `Navigated to ${pathname}`,
      });
    }
  }, [pathname]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const sidebarWidth = sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        bgcolor: "#f1f5f9",
      }}
    >
      {/* Sidebar — persistent on desktop, drawer on mobile */}
      {isMobile ? (
        <AdminSidebar
          open={sidebarOpen}
          onClose={closeSidebar}
          variant="temporary"
        />
      ) : (
        <AdminSidebar
          open={sidebarOpen}
          onClose={toggleSidebar}
          variant="persistent"
        />
      )}

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <AdminHeader onMenuClick={toggleSidebar} />

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            px: { xs: 2, sm: 3, lg: 4 },
            py: { xs: 2.5, sm: 3 },
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <MandatorySetPasswordGate>{children}</MandatorySetPasswordGate>
        </Box>
      </Box>
    </Box>
  );
}
