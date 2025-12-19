import { api } from "@/lib/axios";

export async function resendInvite(userId: string) {
  await api.post(`/auth/users/${userId}/resend-invite`);
}
