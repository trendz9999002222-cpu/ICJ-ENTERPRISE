import { useEffect } from "react";
import { Box, Button, Tooltip, Zoom } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Universal Floating In-App Back Navigation Widget
 * Suspended in air (position: fixed) on screen so users can go back 1 step
 * at any scroll position without scrolling back to the top of the page.
 */
function FloatingInAppBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on auth & onboarding routes where back is handled explicitly
  const hiddenRoutes = ["/login", "/join", "/register", "/recovery"];
  const shouldHide = hiddenRoutes.includes(location.pathname);

  // Esc key keyboard listener to trigger back navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !shouldHide) {
        navigate(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, shouldHide]);

  if (shouldHide) return null;

  return (
    <Zoom in={!shouldHide}>
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 75, sm: 30, md: 32 },
          right: { xs: 16, sm: 24, md: 32 },
          zIndex: 9999,
          pointerEvents: "auto",
        }}
      >
        <Tooltip title="In-App Floating Back (कीबोर्ड: Esc दबाएं)" placement="left" arrow>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon sx={{ fontSize: "1.1rem" }} />}
            sx={{
              fontWeight: 800,
              fontSize: { xs: "0.75rem", sm: "0.82rem" },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.8, sm: 1 },
              borderRadius: 5,
              background: "linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%)",
              color: "#ffffff",
              border: "1.5px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 25px rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(8px)",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                background: "linear-gradient(135deg, #2563eb 0%, #1e1b4b 100%)",
                transform: "translateY(-3px) scale(1.03)",
                boxShadow: "0 12px 30px rgba(37, 99, 235, 0.5)",
              },
              "&:active": {
                transform: "translateY(0) scale(0.97)",
              },
            }}
          >
            ◀ BACK
          </Button>
        </Tooltip>
      </Box>
    </Zoom>
  );
}

export default FloatingInAppBackButton;
