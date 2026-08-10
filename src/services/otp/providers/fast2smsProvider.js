import BaseProvider from "./baseProvider.js";

export class Fast2SMSProvider extends BaseProvider {
  constructor() {
    super("Fast2SMS");
  }

  async send(to, otp, config = {}) {
    const apiKey = config.apiKey || "";
    if (config.mode === "mock" || !apiKey) {
      return {
        success: true,
        messageId: `MOCK-FAST2SMS-${Date.now()}`,
        status: "mock_delivered",
      };
    }

    try {
      const cleanPhone = String(to).replace(/\D/g, "");
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables_values: otp,
          route: "otp",
          numbers: cleanPhone,
        }),
      });

      const data = await response.json();
      if (data.return) {
        return {
          success: true,
          messageId: data.request_id,
          status: "delivered",
        };
      }
      return {
        success: false,
        error: data.message || "Failed to send via Fast2SMS",
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

export default Fast2SMSProvider;
