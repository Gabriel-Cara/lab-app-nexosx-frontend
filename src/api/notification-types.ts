export type NotificationStatus = "sent" | "skipped" | "failed";
export type NotificationFailureReason =
  | "missing_phone"
  | "no_external_provider"
  | "twilio_not_configured"
  | "twilio_from_missing"
  | "twilio_error";

export type NotificationProvider = "twilio_sms" | "twilio_whatsapp";

export type NotificationDeliveryResult = {
  provider: NotificationProvider;
  status: NotificationStatus;
  sid?: string;
  errorCode?: string;
  errorMessage?: string;
  message?: string;
};

export type NotificationResult = {
  status: NotificationStatus;
  reason?: NotificationFailureReason;
  message?: string;
  deliveries: NotificationDeliveryResult[];
};
