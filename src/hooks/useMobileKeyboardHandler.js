import { useEffect, useState } from "react";

/**
 * Custom React hook for mobile virtual keyboard focus handling.
 * - Automatically scrolls focused inputs to the vertical center of the visible viewport.
 * - Auto-hides mobile bottom navigation when typing.
 * - Dynamically tracks window.visualViewport height changes.
 */
export default function useMobileKeyboardHandler() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Helper: Scroll active element to vertical center above mobile keyboard
    const handleFocusIn = (e) => {
      const target = e.target;
      const tagName = target?.tagName?.toLowerCase();

      if (["input", "textarea", "select"].includes(tagName) || target.isContentEditable) {
        setIsKeyboardOpen(true);

        // Smooth scroll to vertical center after keyboard animation starts (150ms delay)
        setTimeout(() => {
          try {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
          } catch (err) {
            // Fallback for older browsers
            target.scrollIntoView(false);
          }
        }, 150);
      }
    };

    const handleFocusOut = (e) => {
      const target = e.target;
      const tagName = target?.tagName?.toLowerCase();

      if (["input", "textarea", "select"].includes(tagName) || target.isContentEditable) {
        setIsKeyboardOpen(false);
      }
    };

    // Track Visual Viewport resize (Mobile keyboard height changes)
    const handleViewportResize = () => {
      if (window.visualViewport) {
        const isKeyboard = window.visualViewport.height < window.innerHeight * 0.8;
        setIsKeyboardOpen(isKeyboard);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
    }

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportResize);
      }
    };
  }, []);

  return { isKeyboardOpen };
}
