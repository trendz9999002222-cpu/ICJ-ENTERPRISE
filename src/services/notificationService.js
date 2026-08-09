import {
  getNotifications,
  addNotification,
  updateNotification,
} from "./database.js";

const NotificationService = {

  async getAll() {
    return await getNotifications();
  },

  async create(notificationData = {}) {

    const notification = {
      id: Date.now(),
      title: notificationData.title || "",
      message: notificationData.message || "",
      type: notificationData.type || "Info",
      status: notificationData.status || "Unread",
      createdAt: new Date().toISOString(),
      ...notificationData,
    };

    return await addNotification(notification);
  },

  async markAsRead(id) {
    await updateNotification(id, {
      status: "Read",
      readAt: new Date().toISOString(),
    });
  },

};

export default NotificationService;
