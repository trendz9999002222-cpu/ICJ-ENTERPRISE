/**
 * SyncDispatcher — ICJ Enterprise Platform
 * Real-Time Event Synchronizer across Client Portal, Advocate Portal & Super Admin.
 * Broadcasts instant updates across tabs/windows using BroadcastChannel & Storage events.
 */

export const SYNC_EVENTS = {
  CASE_UPDATED: "icj_sync_case_updated",
  DOCUMENT_UPLOADED: "icj_sync_document_uploaded",
  STATUS_CHANGED: "icj_sync_status_changed",
  ADVOCATE_ASSIGNED: "icj_sync_advocate_assigned",
  DEMO_DATA_LOADED: "icj_sync_demo_data_loaded",
  VIRGIN_RESET_TRIGGERED: "icj_sync_virgin_reset",
};

let bc = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    bc = new BroadcastChannel("icj_cross_tab_sync");
  } catch (e) {
    console.debug("BroadcastChannel init fallback", e);
  }
}

export const SyncDispatcher = {
  /**
   * Broadcast a real-time event across current window and all other open tabs
   */
  dispatch(eventName, payload = {}) {
    if (typeof window === "undefined") return;

    try {
      // 1. Dispatch in current window
      const event = new CustomEvent(eventName, { detail: payload });
      window.dispatchEvent(event);

      // 2. Broadcast via BroadcastChannel API (Modern high-speed cross-tab)
      if (bc) {
        bc.postMessage({ eventName, payload, timestamp: Date.now() });
      }

      // 3. Fallback broadcast via localStorage key mutation
      const syncObj = { eventName, payload, timestamp: Date.now() };
      window.localStorage.setItem("icj_broadcaster_ping", JSON.stringify(syncObj));
    } catch (e) {
      console.error("SyncDispatcher Error:", e);
    }
  },

  /**
   * Listen for real-time events in a component (Local + Cross-Tab)
   */
  subscribe(eventName, callback) {
    if (typeof window === "undefined") return () => {};

    // 1. Local window listener
    const handler = (event) => callback(event.detail);
    window.addEventListener(eventName, handler);

    // 2. BroadcastChannel listener
    const bcHandler = (e) => {
      if (e.data && e.data.eventName === eventName) {
        callback(e.data.payload);
      }
    };
    if (bc) {
      bc.addEventListener("message", bcHandler);
    }

    // 3. Fallback Cross-tab storage listener
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
      if (bc) {
        bc.removeEventListener("message", bcHandler);
      }
      window.removeEventListener("storage", storageHandler);
    };
  },
};

export default SyncDispatcher;
