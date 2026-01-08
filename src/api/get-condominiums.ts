import { api } from "@/lib/axios";

export type Condominium = {
  id: string;
  name: string;
  code: string;
  createdAt: string;
};

export async function getCondominiums() {
  const response = await api.get<Condominium[]>("/condominiums");
  return response.data;
}
