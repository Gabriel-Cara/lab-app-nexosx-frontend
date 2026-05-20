import { api } from "@/lib/axios";

export type Block = {
  id: string;
  name: string;
  condominiumId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    residences: number;
  };
};

export async function getBlocks(condominiumId?: string) {
  const response = await api.get<Block[]>("/blocks", {
    params: condominiumId ? { condominiumId } : undefined,
  });

  return response.data;
}
