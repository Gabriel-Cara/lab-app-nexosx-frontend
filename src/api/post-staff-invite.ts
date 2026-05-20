import { api } from "@/lib/axios";

export type StaffInviteResponse = {
  inviteUrl: string;
  expiresAt: string;
  condominium: {
    id: string;
    name: string;
    code: string;
  };
};

export async function createStaffInvite(condominiumId?: string) {
  const response = await api.post<StaffInviteResponse>("/auth/doorman-invites", {
    condominiumId,
  });

  return response.data;
}
