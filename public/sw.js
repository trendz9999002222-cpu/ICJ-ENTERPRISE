/**
 * Background Service Worker — ICJ Enterprise Platform
 * Handles background push notifications when browser tab is closed or phone screen is locked.
 */

self.addEventListener("push", (event) => {
  let data = { title: "ICJ Enterprise Alert", body: "New Member Registered. Tap to assign Advocate." };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body || "New Litigant Registered — Assign Advocate Now (15m SLA)",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/super-admin-dashboard",
    },
    actions: [
      { action: "open", title: "Open Control Panel 🚀" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title || "🔔 ICJ Platform Alert", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/super-admin-dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
