import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { DeliveryChannel } from "@/types/auth";
import type { AuthTokens, User } from "@/types/api";

const normalizeIdentifier = (identifier: string) => identifier.trim().toLowerCase();

export const authService = {
  login: (identifier: string, password: string, deliveryChannel: DeliveryChannel = "whatsapp") => {
    const value = normalizeIdentifier(identifier);
    return apiClient<AuthTokens>(API_ENDPOINTS.auth.login, {
      method: "POST",
      body: { email: value, password, delivery_channel: deliveryChannel },
    });
  },

  me: (token: string) =>
    apiClient<{ success: boolean; data: User }>(API_ENDPOINTS.auth.me, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
