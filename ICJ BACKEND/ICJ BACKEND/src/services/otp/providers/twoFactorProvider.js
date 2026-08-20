import BaseProvider from "./baseProvider.js";

export class TwoFactorProvider extends BaseProvider {
  constructor() {
    super("2Factor");
  }

  async send(to, otp, config = {}) {
    const apiKey = config.apiKey || "";
    if (config.mode === "mock" || !apiKey) {
      // Mock mode delivery simulator
      return {
        success: true,
        messageId: `MOCK-2FACTOR-${Date.now()}`,
        status: "mock_delivered",
      };
    }

    try {
      const cleanPhone = String(to).replace(/\D/g, "");
      const url = `https://2factor.in/API/V1/${apiKey}/SMS/${cleanPhone}/${otp}/OTPTEMPLATE`;
      const res = await fetch(url, { method: "GET" });
      const data = await res.json();
      if (data.Status === "Success") {
        return {
          success: true,
          messageId: data.Details,
          status: "delivered",
        };
      }
      return {
        success: false,
        error: data.Details || "Failed to send via 2Factor",
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

export default TwoFactorProvider;
