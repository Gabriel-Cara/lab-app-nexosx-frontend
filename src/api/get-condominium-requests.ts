import { api } from "@/lib/axios";

export type CondominiumRequestStatus = "pending" | "approved" | "rejected";

export type CondominiumRequest = {
  id: string;
  name: string;
  code: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string | null;
  status: CondominiumRequestStatus;
  createdAt: string;
  decidedAt?: string | null;
  rejectionReason?: string | null;
};

export async function getCondominiumRequests(
  status?: CondominiumRequestStatus
) {
  const response = await api.get<CondominiumRequest[]>("/condominium-requests", {
    params: status ? { status } : undefined,
  });
  return response.data;
}
