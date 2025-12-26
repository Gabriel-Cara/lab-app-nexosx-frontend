import { api } from "@/lib/axios";

export interface AreaResponse {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  available: boolean;
  imageUrl?: string | null;
  timeSlots?: {
    id: string;
    startsAt: string;
    endsAt: string;
    sortOrder: number | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface GetAreaParams {
  id: string;
}

export async function getArea({ id }: GetAreaParams) {
  const response = await api.get<AreaResponse>(`/areas/${id}`);

  return response.data;
}
