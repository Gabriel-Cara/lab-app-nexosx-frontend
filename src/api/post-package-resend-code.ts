import { api } from "@/lib/axios";
import type { NotificationResult } from "@/api/notification-types";

type ResendPackageCodeResponse = {
  ok: true;
  notification: NotificationResult;
};

export async function resendPackageCode(id: string) {
  const response = await api.post<ResendPackageCodeResponse>(`/packages/${id}/resend-code`);
  return response.data;
}
