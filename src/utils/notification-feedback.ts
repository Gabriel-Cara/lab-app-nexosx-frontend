import type {
  NotificationDeliveryResult,
  NotificationResult,
} from "@/api/notification-types";

const providerLabels: Record<NotificationDeliveryResult["provider"], string> = {
  twilio_sms: "SMS",
  twilio_whatsapp: "WhatsApp",
};

function listProviders(deliveries: NotificationDeliveryResult[]) {
  return deliveries.map((delivery) => providerLabels[delivery.provider]).join(" e ");
}

export function getNotificationFeedback(notification?: NotificationResult | null) {
  if (!notification) {
    return null;
  }

  const sent = notification.deliveries.filter((delivery) => delivery.status === "sent");
  const failed = notification.deliveries.filter((delivery) => delivery.status === "failed");

  const successMessage =
    sent.length > 0
      ? `Notificação enviada por ${listProviders(sent)}.`
      : null;

  const errorMessage =
    failed.length > 0
      ? failed
          .map((delivery) => {
            const provider = providerLabels[delivery.provider];
            return `${provider}: ${delivery.errorMessage ?? delivery.message ?? "falha no envio."}`;
          })
          .join(" ")
      : notification.status !== "sent"
        ? notification.message ?? null
        : null;

  return {
    successMessage,
    errorMessage,
  };
}
