import { api } from "@/lib/axios";

export async function resendPackageCode(id: string) {
  await api.post(`/packages/${id}/resend-code`);
}
