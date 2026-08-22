/**
 * SyncDispatcher — ICJ Enterprise Platform
 * Real-Time Event Synchronizer across Client Portal, Advocate Portal & Super Admin.
 * Broadcasts instant updates without requiring full browser page reloads.
 */

export const SYNC_EVENTS = {
  CASE_UPDATED: "icj_sync_case_updated",
  DOCUMENT_UPLOADED: "icj_sync_document_uploaded",
  STATUS_CHANGED: "icj_sync_status_changed",
  ADVOCATE_ASSIGNED: "icj_sync_advocate_assigned",
};

export const SyncDispatcher = {
  /**
   * Broadcast a real-time event across current window and localStorage tabs
   */
  dispatch(eventName, payload = {}) {
    if (typeof window === "undefined") return;

    try {
      // 1. Dispatch in current window
      const event = new CustomEvent(eventName, { detail: payload });
      window.dispatchEvent(event);

      // 2. Broadcast to other open browser tabs via localStorage key mutation
      const syncObj = { eventName, payload, timestamp: Date.now() };
      window.localStorage.setItem("icj_broadcaster_ping", JSON.stringify(syncObj));
    } catch (e) {
      console.error("SyncDispatcher Error:", e);
    }
  },

  /**
   * Listen for real-time events in a component
   */
  subscribe(eventName, callback) {
    if (typeof window === "undefined") return () => {};

    const handler = (event) => callback(event.detail);
    window.addEventListener(eventName, handler);

    // Cross-tab storage listener
    const storageHandler = (e) => {
      if (e.key === "icj_broadcaster_ping" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.eventName === eventName) {
            callback(parsed.payload);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", storageHandler);

    // Cleanup un-subscriber
    return () => {
      window.removeEventListener(eventName, handler);
      window.removeEventListener("storage", storageHandler);
    };
  },
};

export default SyncDispatcher;
