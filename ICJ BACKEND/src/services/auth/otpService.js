import {
  ENABLE_EMAIL_OTP,
  ENABLE_SMS_OTP,
  ENABLE_WHATSAPP_OTP,
} from "../../config/auth.config";

const createDisabledResponse = (channel, target) => ({
  success: false,
  status: "otp_not_enabled",
  channel,
  target,
  message: `${channel.toUpperCase()} OTP is disabled in this environment.`,
});

const createNotImplementedResponse = (channel, target) => ({
  success: false,
  status: "otp_provider_not_implemented",
  channel,
  target,
  message: `${channel.toUpperCase()} OTP provider is not wired yet.`,
});

const OtpService = {
  isSmsEnabled() {
    return ENABLE_SMS_OTP;
  },

  isWhatsAppEnabled() {
    return ENABLE_WHATSAPP_OTP;
  },

  isEmailEnabled() {
    return ENABLE_EMAIL_OTP;
  },

  async dispatchSmsOtp(mobile) {
    if (!ENABLE_SMS_OTP) return createDisabledResponse("sms", mobile);
    return createNotImplementedResponse("sms", mobile);
  },

  async dispatchWhatsAppOtp(mobile) {
    if (!ENABLE_WHATSAPP_OTP) return createDisabledResponse("whatsapp", mobile);
    return createNotImplementedResponse("whatsapp", mobile);
  },

  async dispatchEmailOtp(email) {
    if (!ENABLE_EMAIL_OTP) return createDisabledResponse("email", email);
    return createNotImplementedResponse("email", email);
  },

  async verifyOtp(channel, target) {
    if (channel === "sms" && !ENABLE_SMS_OTP) return createDisabledResponse(channel, target);
    if (channel === "whatsapp" && !ENABLE_WHATSAPP_OTP) {
      return createDisabledResponse(channel, target);
    }
    if (channel === "email" && !ENABLE_EMAIL_OTP) return createDisabledResponse(channel, target);
    return createNotImplementedResponse(channel, target);
  },
};

export default OtpService;
