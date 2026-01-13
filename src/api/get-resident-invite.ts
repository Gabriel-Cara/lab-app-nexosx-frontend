import { api } from "@/lib/axios";

export type ResidentInviteInfo = {
  condominium: {
    id: string;
    name: string;
    code: string;
  };
  expiresAt: string;
};

export async function getResidentInvite(token: string) {
  const response = await api.get<ResidentInviteInfo>(`/auth/resident-invites/${token}`);
  return response.data;
}
