import AudioAlertService from "./audioAlertService.js";

const NOTIFICATIONS_STORE_KEY = "icj_notifications_routing_store";

const getStore = (key, defaultVal = []) => {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultVal;
    }
    return defaultVal;
  } catch {
    return defaultVal;
  }
};

const setStore = (key, val) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch (e) {
    console.error("NotificationRoutingService setStore error", e);
  }
};

export const NotificationRoutingService = {
  /**
   * Check Privacy & Role Access Boundaries (Direct Line Privacy)
   * - Client ➔ Assigned Advocates & Trust Officers ONLY
   * - Advocate ➔ Assigned Clients, Junior Co-counsels & Trust Officers ONLY
   * - Super Admin ➔ All Members, All Advocates, Branch, or Individual
   */
  canSendMessage({ senderRole = "litigant", targetAudience = "INDIVIDUAL" }) {
    if (senderRole === "super_admin" || senderRole === "trust_executive") {
      return { allowed: true, reason: "Full Master Broadcast Permission" };
    }
    if (senderRole === "advocate") {
      if (targetAudience === "ALL_MEMBERS") {
        return { allowed: false, reason: "Advocates can only message assigned clients and co-counsels." };
      }
      return { allowed: true, reason: "Advocate Direct Line Allowed" };
    }
    if (senderRole === "litigant") {
      if (targetAudience === "ALL_MEMBERS" || targetAudience === "ALL_ADVOCATES") {
        return { allowed: false, reason: "Litigants can only message assigned Advocates & Trust Officers." };
      }
      return { allowed: true, reason: "Litigant Direct Line Allowed" };
    }
    return { allowed: true, reason: "Allowed" };
  },

  /**
   * Compose & Dispatch Notification with Sender-Assigned Bell Priority
   */
  dispatchNotification({
    title,
    message,
    priority = "CRITICAL", // 'CRITICAL' (Continuous Siren) | 'HIGH' (Double Beep) | 'NORMAL' (Gentle Chime)
    targetAudience = "ALL_MEMBERS", // 'ALL_MEMBERS' | 'ALL_ADVOCATES' | 'BRANCH' | 'INDIVIDUAL'
    senderName = "Super Admin",
    senderRole = "super_admin",
    targetUserId = null,
  }) {
    // 1. Verify Access Boundary
    const accessCheck = this.canSendMessage({ senderRole, targetAudience });
    if (!accessCheck.allowed) {
      throw new Error(accessCheck.reason);
    }

    const notifObj = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      priority,
      targetAudience,
      senderName,
      senderRole,
      targetUserId,
      timestamp: new Date().toISOString(),
      read: false,
      acknowledged: false,
    };

    // 2. Save to Store
    const store = getStore(NOTIFICATIONS_STORE_KEY, []);
    store.unshift(notifObj);
    setStore(NOTIFICATIONS_STORE_KEY, store);

    // 3. Trigger Audio Sound Based on Sender-Assigned Priority
    if (priority === "CRITICAL") {
      AudioAlertService.startContinuousLoop();
    } else if (priority === "HIGH") {
      AudioAlertService.playBeepSound();
    } else {
      AudioAlertService.playGentleChime();
    }

    // 4. Trigger Web Push API Service Worker Notification
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window) {
      if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(`🚨 ${title}`, {
            body: message,
            icon: "/favicon.ico",
            vibrate: [300, 100, 300],
            data: { priority },
          });
        });
      }
    }

    return notifObj;
  },

  /**
   * Silence Active Continuous Siren
   */
  silenceSiren() {
    AudioAlertService.stopContinuousLoop();
  },

  /**
   * Check if Siren is Looping
   */
  isSirenActive() {
    return AudioAlertService.isLoopingActive();
  },

  /**
   * Get Notifications
   */
  getNotifications() {
    return getStore(NOTIFICATIONS_STORE_KEY, []);
  },
};

export default NotificationRoutingService;
