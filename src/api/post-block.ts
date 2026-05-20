import { api } from "@/lib/axios";
import type { Block } from "@/api/get-blocks";

export type PostBlockPayload = {
  name: string;
  condominiumId?: string;
};

export async function postBlock(payload: PostBlockPayload) {
  const response = await api.post<Block>("/blocks", payload);
  return response.data;
}
