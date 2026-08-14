/* eslint-disable no-restricted-globals */
/**
 * ICJ Enterprise Background Service Worker (sw.js)
 * Handles background Web Push API payloads, system-level heads-up banners,
 * and emergency audio sirens even when the browser or app tab is closed.
 */

self.addEventListener("install", (event) => {
  console.log("⚙️ [ICJ Service Worker] Installed successfully.");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("🟢 [ICJ Service Worker] Activated & listening for VAPID push signals.");
  event.waitUntil(self.clients.claim());
});

/**
 * Handle incoming Web Push Notifications from VAPID / FCM Server
 */
self.addEventListener("push", (event) => {
  let data = {
    title: "🚨 ICJ Emergency Legal Notification",
    body: "New urgent litigation intake received.",
    icon: "/favicon.ico",
    priority: "CRITICAL",
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon || "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [300, 100, 300, 100, 300], // Emergency vibration pattern
    tag: `icj-alert-${Date.now()}`,
    renotify: true,
    data: {
      url: data.url || "/notifications",
      priority: data.priority || "NORMAL",
    },
    actions: [
      { action: "respond", title: "🚨 Respond / Silence Siren" },
      { action: "close", title: "Close" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Handle Notification Click Event
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/notifications";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
