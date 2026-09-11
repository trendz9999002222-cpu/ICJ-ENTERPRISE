export type DeliveryChannel = "whatsapp" | "sms" | "email";

export type LoginPayload = {
  identifier: string;
  password: string;
  deliveryChannel: DeliveryChannel;
};
