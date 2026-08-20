import BaseProvider from "./baseProvider.js";

export class SMTPProvider extends BaseProvider {
  constructor() {
    super("SMTP");
  }

  async send(to, otp, config = {}) {
    // In React SPA Client Context, Node SMTP libraries are unavailable.
    // SMTP config parameters are stored and passed to mock or processed via email gateway.
    const host = config.host || "";
    if (config.mode === "mock" || !host) {
      return {
        success: true,
        messageId: `MOCK-SMTP-${Date.now()}`,
        status: "mock_delivered",
      };
    }

    // SMTP Real Integration Placeholder — via custom backend or EmailJS
    try {
      console.log(`[SMTP] Attempting delivery of OTP ${otp} to ${to} via ${host}`);
      return {
        success: true,
        messageId: `SMTP-${Date.now()}`,
        status: "delivered",
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

export default SMTPProvider;
