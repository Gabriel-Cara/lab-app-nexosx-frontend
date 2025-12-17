import { api } from "@/lib/axios";

export interface Area {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getAreas() {
  const response = await api.get<Area[]>("/areas");

  return response.data;
}
