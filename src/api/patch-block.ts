import { api } from "@/lib/axios";
import type { Block } from "@/api/get-blocks";

export type PatchBlockPayload = {
  id: string;
  name: string;
  condominiumId?: string;
};

export async function patchBlock({ id, name, condominiumId }: PatchBlockPayload) {
  const response = await api.patch<Block>(`/blocks/${id}`, {
    name,
    condominiumId,
  });

  return response.data;
}
