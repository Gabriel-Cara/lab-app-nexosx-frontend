import { api } from "@/lib/axios";

export type ResidentInviteResponse = {
  inviteUrl: string;
  expiresAt: string;
  condominium: {
    id: string;
    name: string;
    code: string;
  };
};

export async function createResidentInvite() {
  const response = await api.post<ResidentInviteResponse>("/auth/resident-invites");
  return response.data;
}
