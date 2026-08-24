import { createContext, useContext, useState } from "react";
import { Box, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MobileBottomNav from "../components/MobileBottomNav";
import GlobalErrorBoundary from "../components/common/GlobalErrorBoundary";

// ProtectedRoute wraps every page in MainLayout, but 16 pages also wrap
// themselves in it. That rendered two topbars, two sidebars and two footers —
// a second full set of chrome that ate most of a phone screen. Rather than
// depend on every page remembering not to, an inner MainLayout detects it is
// already inside one and renders its children straight through.
const InsideMainLayout = createContext(false);

function MainLayout({ children }) {
  const alreadyInsideLayout = useContext(InsideMainLayout);

  if (alreadyInsideLayout) {
    return <>{children}</>;
  }

  return <MainLayoutChrome>{children}</MainLayoutChrome>;
}

function MainLayoutChrome({ children }) {
  // The sidebar is a dismissable overlay on phones and a fixed rail on desktop.
  // It used to be `permanent` at every width, so a 76px rail ate a fifth of a
  // 360px screen and could not be closed.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", background: "#F5F7FA", minHeight: "100vh", width: "100%", overflowX: "hidden" }} className="mobile-app-container">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          pb: { xs: 9, md: 2 },
        }}
      >
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <Box
          sx={{
            flex: 1,
            p: { xs: 0.8, sm: 1, md: 1.2 },
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <GlobalErrorBoundary componentName="MainLayoutPage">
            <InsideMainLayout.Provider value={true}>
              {children}
            </InsideMainLayout.Provider>
          </GlobalErrorBoundary>
        </Box>
        <MobileBottomNav onOpenMobileNav={() => setMobileNavOpen(true)} />
      </Box>
    </Box>
  );
}

export default MainLayout;
        