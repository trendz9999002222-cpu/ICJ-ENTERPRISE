import {
  ENABLE_EMAIL_NOTIFICATIONS,
  ENABLE_INAPP_NOTIFICATIONS,
  ENABLE_SMS_NOTIFICATIONS,
  ENABLE_WHATSAPP_NOTIFICATIONS,
} from "../config/auth.config";

const NotificationFoundationService = {
  getChannelConfig() {
    return {
      email: ENABLE_EMAIL_NOTIFICATIONS,
      sms: ENABLE_SMS_NOTIFICATIONS,
      whatsapp: ENABLE_WHATSAPP_NOTIFICATIONS,
      inapp: ENABLE_INAPP_NOTIFICATIONS,
    };
  },

  isChannelEnabled(channel) {
    return Boolean(this.getChannelConfig()[channel]);
  },

  async dispatch(channel, payload = {}) {
    if (!this.isChannelEnabled(channel)) {
      return {
        success: false,
        status: "notification_channel_disabled",
        channel,
        payload,
      };
    }

    return {
      success: false,
      status: "notification_provider_not_implemented",
      channel,
      payload,
    };
  },
};

export default NotificationFoundationService;
