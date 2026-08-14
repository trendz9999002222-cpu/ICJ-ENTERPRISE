/**
 * PushNotificationService — ICJ Enterprise Platform
 * Registers Service Worker for Web Push Notifications & triggers lock-screen background push alerts.
 */

export const PushNotificationService = {
  async registerServiceWorker() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return null;
    }
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      console.log("ICJ Service Worker registered successfully", reg);
      return reg;
    } catch (e) {
      console.warn("Service worker registration failed", e);
      return null;
    }
  },

  async requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return "denied";
    }
  },

  async sendBackgroundPush({ title, body, url = "/super-admin-dashboard" }) {
    try {
      // 1. Play Web Audio Bell Chime through browser speaker
      import("./audioAlertService.js").then((mod) => {
        const audio = mod.default || mod.audioAlertService;
        audio.playNewMemberChime();
      });

      // 2. Dispatch Push Notification via Service Worker if permission granted
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          reg.showNotification(title || "🔔 ICJ Platform Alert", {
            body: body || "New Member Registered — Assign Advocate Now (15m SLA)",
            icon: "/favicon.svg",
            badge: "/favicon.svg",
            vibrate: [200, 100, 200],
            data: { url },
          });
        } else {
          new Notification(title || "🔔 ICJ Platform Alert", {
            body: body || "New Member Registered — Assign Advocate Now (15m SLA)",
            icon: "/favicon.svg",
          });
        }
      }
    } catch (e) {
      console.warn("Push notification dispatch notice:", e);
    }
  },
};

export default PushNotificationService;
