import BaseProvider from "./baseProvider.js";

export class WhatsAppProvider extends BaseProvider {
  constructor() {
    super("WhatsApp");
  }

  async send(to, otp, config = {}) {
    const apiToken = config.apiToken || "";
    const phoneId = config.phoneNumberId || "";

    if (config.mode === "mock" || !apiToken || !phoneId) {
      return {
        success: true,
        messageId: `MOCK-WHATSAPP-${Date.now()}`,
        status: "mock_delivered",
      };
    }

    try {
      const cleanPhone = String(to).replace(/\D/g, "");
      const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanPhone,
          type: "template",
          template: {
            name: "icj_otp_verification",
            language: { code: "en_US" },
            components: [
              {
                type: "body",
                parameters: [{ type: "text", text: otp }],
              },
            ],
          },
        }),
      });

      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        return {
          success: true,
          messageId: data.messages[0].id,
          status: "delivered",
        };
      }
      return {
        success: false,
        error: data.error?.message || "WhatsApp Business API Error",
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }
  }
}

export default WhatsAppProvider;
