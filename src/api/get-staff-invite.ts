import { api } from "@/lib/axios";

export type StaffInviteInfo = {
  condominium: {
    id: string;
    name: string;
    code: string;
  };
  expiresAt: string;
};

export async function getStaffInvite(token: string) {
  const response = await api.get<StaffInviteInfo>(`/auth/doorman-invites/${token}`);
  return response.data;
}
