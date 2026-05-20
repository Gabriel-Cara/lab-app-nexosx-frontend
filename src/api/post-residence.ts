import { api } from "@/lib/axios";
import type { Residence } from "@/api/get-residences";

export type PostResidencePayload = {
  number: string;
  blockId: string;
  condominiumId?: string;
};

export async function postResidence(payload: PostResidencePayload) {
  const response = await api.post<Residence>("/residences", payload);
  return response.data;
}
