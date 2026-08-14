import {
  getNotifications,
  addNotification,
  updateNotification,
} from "./database.js";

const NotificationService = {

  async getAll() {
    return await getNotifications();
  },

  /**
   * USER NOTIFICATION ISOLATION: Filter notifications by recipient userId & role
   */
  async getForUser(userId, role) {
    const all = await this.getAll();
    if (!userId && !role) return all;
    
    const uidStr = String(userId || "").toLowerCase();
    const roleStr = String(role || "").toLowerCase();

    return all.filter((n) => {
      // Super admin sees all
      if (roleStr.includes("admin")) return true;

      const recipient = String(n.recipientId || n.userId || "").toLowerCase();
      const recRole = String(n.recipientRole || n.role || "").toLowerCase();

      // If notification has explicit recipient, match ID or role or ALL
      if (recipient && (recipient === uidStr || recipient === "all")) return true;
      if (recRole && recRole === roleStr) return true;

      // If no explicit recipient specified, allow general info for members
      if (!recipient && !recRole && roleStr === "member") return true;

      return false;
    });
  },

  async create(notificationData = {}) {

    const notification = {
      id: Date.now(),
      title: notificationData.title || "",
      message: notificationData.message || "",
      type: notificationData.type || "Info",
      status: notificationData.status || "Unread",
      createdAt: new Date().toISOString(),
      recipientId: notificationData.recipientId || notificationData.userId || null,
      recipientRole: notificationData.recipientRole || notificationData.role || null,
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
