/**
 * SecurityShield — Anti-Code Theft & Inspection Disabler Guard
 * Disables Right-Click, F12, Ctrl+Shift+I/J, Ctrl+U, and triggers Console Traps
 * to protect IP, proprietary legal AI engine logic, and frontend source code.
 */

export const SecurityShield = {
  isShieldActive: false,

  init() {
    if (typeof window === "undefined" || this.isShieldActive) return;

    this.isShieldActive = true;

    // 1. Disable Context Menu (Right Click)
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      console.warn("⚠️ Security Notice: Right-click context menu is restricted on ICJ Enterprise Platform.");
      return false;
    });

    // 2. Disable Keyboard Inspection Shortcuts
    document.addEventListener("keydown", (e) => {
      // F12 key
      if (e.keyCode === 123 || e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        this.triggerSecurityAlert("Developer Tools (F12) access is restricted.");
        return false;
      }

      // Ctrl+Shift+I (Inspect element)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.key === "I" || e.key === "i")) {
        e.preventDefault();
        e.stopPropagation();
        this.triggerSecurityAlert("Inspect Element shortcut is restricted.");
        return false;
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 74 || e.key === "J" || e.key === "j")) {
        e.preventDefault();
        e.stopPropagation();
        this.triggerSecurityAlert("Console window shortcut is restricted.");
        return false;
      }

      // Ctrl+U (View Page Source)
      if (e.ctrlKey && (e.keyCode === 85 || e.key === "U" || e.key === "u")) {
        e.preventDefault();
        e.stopPropagation();
        this.triggerSecurityAlert("View Source is restricted.");
        return false;
      }

      // Ctrl+S (Save Page)
      if (e.ctrlKey && (e.keyCode === 83 || e.key === "S" || e.key === "s")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });

    // 3. Console Watermark & Clear Trap
    try {
      console.clear();
      console.log(
        "%c 🛡️ ICJ ENTERPRISE PLATFORM SECURITY ACTIVE ",
        "background: #7c3aed; color: #ffffff; font-size: 16px; font-weight: bold; padding: 8px 12px; border-radius: 4px;"
      );
      console.log(
        "%c Notice: Unauthorized copying, inspection, or extraction of ICJ software logic is strictly prohibited.",
        "color: #ef4444; font-size: 12px; font-weight: bold;"
      );
    } catch {}

    // 4. Automatic 15-Minute Inactivity Session Lock
    let inactivityTimer;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // 15 Minutes Inactivity Lock (900,000 ms)
      inactivityTimer = setTimeout(() => {
        const isAuth = localStorage.getItem("icj_auth_user");
        if (isAuth) {
          localStorage.removeItem("icj_auth_user");
          console.warn("🔒 SECURITY LOCKDOWN: Session locked due to 15-minute inactivity.");
          window.location.reload();
        }
      }, 15 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("click", resetTimer);
    resetTimer();
  },

  triggerSecurityAlert(reason) {
    try {
      console.clear();
      console.warn(`⚠️ SECURITY ENFORCEMENT: ${reason}`);
    } catch {}
  },
};

export default SecurityShield;
